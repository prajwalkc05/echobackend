import Groq from "groq-sdk";
import axios from "axios";

export const generateAIResponse = async (prompt) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful student assistant." },
        { role: "user", content: prompt },
      ],
      model: "llama-3.1-8b-instant",
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.log("Groq failed → switching to OpenRouter");
    try {
      const orResponse = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: "You are a helpful student assistant." },
            { role: "user", content: prompt },
          ],
        },
        { headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` } }
      );
      return orResponse.data.choices[0].message.content;
    } catch (orError) {
      console.log("OpenRouter failed → switching to HuggingFace");
      try {
        const hfResponse = await axios.post(
          "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
          { inputs: prompt },
          { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
        );
        return hfResponse.data[0]?.generated_text || "No response";
      } catch (hfError) {
        return "⚠️ AI service unavailable. Try later.";
      }
    }
  }
};
