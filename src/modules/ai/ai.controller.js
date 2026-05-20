import { generateAIResponse } from "../../utils/aiHelper.js";
import { formatAIResponse } from "../../utils/responseFormatter.js";
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

    // Get AI response
    const aiResponse = await generateAIResponse(message);
    
    // Format the response to ensure it's clean markdown (no raw JSON/objects)
    const formattedReply = formatAIResponse(aiResponse);

    // Save to database
    await Chat.create({ userId: req.user._id, message, reply: formattedReply });

    // Return formatted response
    res.json({ success: true, reply: formattedReply, remainingChats: remaining - 1 });
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
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearAllChats = async (req, res) => {
  try {
    const result = await Chat.deleteMany({ userId: req.user._id });
    
    res.json({ 
      success: true, 
      message: `${result.deletedCount} chats cleared successfully` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
