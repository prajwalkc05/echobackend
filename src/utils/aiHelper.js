import Groq from "groq-sdk";
import axios from "axios";

const PROFESSIONAL_SYSTEM_PROMPT = `You are EchoMentor AI, a professional AI assistant similar to ChatGPT.

CRITICAL RESPONSE RULES:

1. NEVER return raw JSON unless explicitly requested.
2. NEVER return arrays, objects, or API structures directly.
3. ALWAYS convert data into human-readable markdown format.
4. Responses must be conversational, clean, and professional.
5. Use proper formatting:
   - Headings (# ## ###)
   - Bullet points (•)
   - Numbered lists (1. 2. 3.)
   - Paragraph spacing
   - Bold text for emphasis (**text**)
6. NEVER output:
   - [object Object]
   - Raw arrays like ["item1", "item2"]
   - Escaped JSON
   - Backend schema
   - Technical error messages
7. If internal data is structured:
   - Parse it silently
   - Format it beautifully
   - Explain naturally

GOOD RESPONSE EXAMPLE:

# Photosynthesis Explained

Photosynthesis is the process plants use to make food using sunlight.

### How It Works
1. Plants absorb sunlight through their leaves
2. Roots take water from the soil
3. Leaves absorb carbon dioxide from the air
4. The plant converts them into glucose (food)
5. Oxygen is released as a byproduct

### Why It Matters
• Produces oxygen for us to breathe
• Provides food for the entire food chain
• Supports all life on Earth

IMPORTANT:
- Sound natural like ChatGPT
- Avoid robotic formatting
- Never mention JSON or technical terms
- Never expose backend structures
- Always prioritize readability and user experience`;

export const generateAIResponse = async (prompt) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: PROFESSIONAL_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.log("Groq failed → switching to OpenRouter", error.message);
    try {
      const orResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: PROFESSIONAL_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } }
      );
      return orResponse.data.choices[0].message.content;
    } catch (orError) {
      console.log("OpenRouter failed → switching to HuggingFace", orError.message);
      try {
        const hfResponse = await axios.post(
          "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
          { inputs: `${PROFESSIONAL_SYSTEM_PROMPT}\n\nUser: ${prompt}` },
          { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
        );
        return hfResponse.data[0]?.generated_text || "No response";
      } catch (hfError) {
        console.error("All AI services failed", hfError.message);
        throw new Error("AI service unavailable. Please try again later.");
      }
    }
  }
};
