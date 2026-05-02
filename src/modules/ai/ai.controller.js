import { generateAIResponse } from "../../utils/aiHelper.js";
import { checkDailyLimit } from "./ai.service.js";
import Chat from "./ai.model.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const { allowed, remaining } = await checkDailyLimit(req.user._id, req.user.subscriptionPlan);
    if (!allowed) {
      return res.status(403).json({ error: "Daily limit reached (20 chats). Upgrade to Pro 🚀" });
    }

    const reply = await generateAIResponse(message);

    await Chat.create({ userId: req.user._id, message, reply });

    res.json({ success: true, reply, remainingChats: remaining - 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
