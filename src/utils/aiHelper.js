import Groq from "groq-sdk";
import axios from "axios";

export const generateAIResponse = async (prompt) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI assistant. Always return valid JSON when requested." },
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
            { role: "system", content: "You are a helpful AI assistant. Always return valid JSON when requested." },
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
          { inputs: prompt },
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
