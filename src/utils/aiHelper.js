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

// Always ensure the master system prompt is the first message
function buildMessages(messages, prompt) {
  if (messages && Array.isArray(messages) && messages.length > 0) {
    // Replace or prepend system prompt — never trust frontend system prompt alone
    const withoutSystem = messages.filter(m => m.role !== 'system');
    return [{ role: 'system', content: MASTER_SYSTEM_PROMPT }, ...withoutSystem];
  }
  return [
    { role: 'system', content: MASTER_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];
}

export const generateAIResponse = async (prompt, messages = null) => {
  const chatMessages = buildMessages(messages, prompt);

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      messages: chatMessages,
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 2048,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.log('Groq failed → switching to OpenRouter', error.message);
    try {
      const orResponse = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: chatMessages,
        },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } }
      );
      return orResponse.data.choices[0].message.content;
    } catch (orError) {
      console.log('OpenRouter failed → switching to HuggingFace', orError.message);
      try {
        const hfResponse = await axios.post(
          'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
          { inputs: `${MASTER_SYSTEM_PROMPT}\n\nUser: ${prompt}` },
          { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
        );
        return hfResponse.data[0]?.generated_text || 'No response';
      } catch (hfError) {
        console.error('All AI services failed', hfError.message);
        throw new Error('AI service unavailable. Please try again later.');
      }
    }
  }
};
