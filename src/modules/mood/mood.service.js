import { generateAIResponse } from "../../utils/aiHelper.js";
import nodemailer from "nodemailer";

const moodKeywords = {
  sad: ["sad", "depressed", "hopeless", "worthless", "crying", "lonely", "miserable", "heartbroken", "suicidal", "die"],
  anxious: ["stress", "anxious", "anxiety", "panic", "overwhelmed", "nervous", "worried", "fear", "scared"],
  angry: ["angry", "furious", "rage", "hate", "frustrated", "irritated"],
  happy: ["happy", "excited", "great", "amazing", "wonderful", "joy", "love", "fantastic", "good"],
  neutral: [],
};

export const detectMood = (text) => {
  const msg = text.toLowerCase();
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    if (mood === "neutral") continue;
    if (keywords.some(k => msg.includes(k))) return mood;
  }
  return "neutral";
};

export const detectMoodAI = async (text) => {
  try {
    const prompt = `
Analyze the mood of this message and respond with ONLY one word from: happy, sad, anxious, angry, neutral.

Message: "${text}"

Respond with only the mood word.
`;
    const result = await generateAIResponse(prompt);
    const mood = result.trim().toLowerCase();
    const valid = ["happy", "sad", "anxious", "angry", "neutral"];
    return valid.includes(mood) ? mood : detectMood(text);
  } catch {
    return detectMood(text);
  }
};

export const sendEmergencyAlert = async (userEmail, userName, mood, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMERGENCY_EMAIL || process.env.EMAIL_USER,
      subject: `🚨 EchoMentor Alert: ${userName} needs support`,
      html: `
        <h2>🚨 Mental Health Alert</h2>
        <p><strong>User:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${userEmail}</p>
        <p><strong>Detected Mood:</strong> ${mood}</p>
        <p><strong>Message:</strong> "${message}"</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr/>
        <p>Please reach out to this user immediately.</p>
      `,
    });

    console.log(`🚨 Emergency alert sent for user: ${userEmail}`);
    return true;
  } catch (err) {
    console.log("⚠️ Alert email failed:", err.message);
    return false;
  }
};

export const getMoodSuggestion = (mood) => {
  const suggestions = {
    sad: "💙 You're not alone. Consider talking to someone you trust or a counselor. Remember, it's okay to ask for help.",
    anxious: "🌿 Try deep breathing: inhale for 4 seconds, hold for 4, exhale for 4. You've got this!",
    angry: "🔥 Take a short break. Go for a walk or listen to calming music to reset.",
    happy: "🌟 That's wonderful! Keep spreading that positive energy!",
    neutral: "😊 Hope your day goes well. Stay focused and take it one step at a time.",
  };
  return suggestions[mood] || suggestions.neutral;
};
