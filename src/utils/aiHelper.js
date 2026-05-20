import Groq from 'groq-sdk';
import axios from 'axios';

export const MASTER_SYSTEM_PROMPT = `You are EchoMentor AI, a professional conversational AI assistant like ChatGPT.

CRITICAL BEHAVIOR RULES:

1. CONVERSATION MEMORY
   - Always read the FULL conversation history before responding.
   - Never treat a message as isolated — always consider previous messages.
   - If the user says "explain it", "summarize it", "give code" — refer to what was discussed before.

2. FILE UNDERSTANDING
   - If file content is provided in the conversation, read it carefully.
   - Answer ONLY based on the actual file content — never give generic unrelated answers.
   - For PPT files: explain slide by slide, generate speaking notes, simplify topics.
   - For PDF/DOCX: summarize sections, answer questions from the document.
   - For code files: explain the logic, find bugs, suggest improvements.
   - Never say "I cannot read files" — the content has already been extracted for you.

3. FOLLOW USER INSTRUCTIONS STRICTLY
   - "only code" → return ONLY a code block, no explanation.
   - "brief" / "short" → keep response under 5 lines.
   - "explain" → give a clear, structured explanation.
   - "for presentation" → generate slide-wise speaking notes.
   - "summarize" → give a clean bullet-point summary.
   - Always prioritize the LATEST user instruction.

4. RESPONSE FORMATTING
   - Use markdown: # headings, **bold**, bullet points, numbered lists, code blocks.
   - For code: always use fenced code blocks with language (e.g. \`\`\`python).
   - Never output raw JSON, arrays, or [object Object].
   - Keep responses clean, readable, and professional.

5. NEVER
   - Give generic answers unrelated to the user's file or conversation.
   - Ignore uploaded file content.
   - Ignore previous messages.
   - Mention "extracted text", "file buffer", or any technical processing details.`;

function buildMessages(messages, prompt, fileContext) {
  const systemContent = fileContext && fileContext.trim()
    ? `${MASTER_SYSTEM_PROMPT}

---
UPLOADED FILE CONTENT (read this carefully before answering):
${fileContext}
---
When the user says "it", "this", "that file", "read it", "explain it", "summarize it" — they are referring to the file content above.`
    : MASTER_SYSTEM_PROMPT;

  if (messages && Array.isArray(messages) && messages.length > 0) {
    const withoutSystem = messages.filter(m => m.role !== 'system');
    return [{ role: 'system', content: systemContent }, ...withoutSystem];
  }
  return [
    { role: 'system', content: systemContent },
    { role: 'user', content: prompt },
  ];
}

// Active Groq models only (ordered by TPM capacity: highest first)
const GROQ_MODELS = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];

// Active OpenRouter free models
const OR_MODELS = [
  'meta-llama/llama-3.2-3b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getRetryMs(errorMessage) {
  const match = errorMessage?.match(/try again in ([\d.]+)s/i);
  return match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : null;
}

async function tryGroq(chatMessages) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        messages: chatMessages,
        model,
        temperature: 0.7,
        max_tokens: 1200,
      });
      return completion.choices[0].message.content;
    } catch (err) {
      if (err.status === 429) {
        const waitMs = getRetryMs(err.message);
        if (waitMs && waitMs <= 20000) {
          console.log(`Groq rate limit on ${model}, waiting ${waitMs}ms...`);
          await sleep(waitMs);
          try {
            const retry = await groq.chat.completions.create({
              messages: chatMessages, model, temperature: 0.7, max_tokens: 1200,
            });
            return retry.choices[0].message.content;
          } catch (retryErr) {
            console.log(`Groq ${model} retry failed, trying next model`);
          }
        }
      }
      console.log(`Groq ${model} failed: ${err.message}`);
    }
  }
  throw new Error('All Groq models exhausted');
}

async function tryOpenRouter(chatMessages) {
  for (const model of OR_MODELS) {
    try {
      const res = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        { model, messages: chatMessages, max_tokens: 1200 },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': 'https://echomentor.app' } }
      );
      const content = res.data?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      console.log(`OpenRouter ${model} failed: ${err.message}`);
    }
  }
  throw new Error('All OpenRouter models exhausted');
}

export const generateAIResponse = async (prompt, messages = null, fileContext = null) => {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
    return 'AI service is not configured. Please contact support.';
  }
  const chatMessages = buildMessages(messages, prompt, fileContext);
  try {
    return await tryGroq(chatMessages);
  } catch (groqErr) {
    console.log('Groq exhausted → trying OpenRouter:', groqErr.message);
    try {
      return await tryOpenRouter(chatMessages);
    } catch (orErr) {
      console.error('All AI services failed:', orErr.message);
      return 'AI service is temporarily unavailable due to high demand. Please try again in a moment.';
    }
  }
};
