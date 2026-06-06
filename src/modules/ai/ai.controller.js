import { generateAIResponse } from '../../utils/aiHelper.js';
import { formatAIResponse } from '../../utils/responseFormatter.js';
import { checkDailyLimit } from './ai.service.js';
import { processFiles } from '../../utils/fileProcessor.js';
import Chat from './ai.model.js';

// Dedicated endpoint: extract file text and return it to frontend
// Frontend stores this text in the session, sends it back on every message
export const extractFile = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }
    const extractedText = await processFiles(files);
    const fileNames = files.map(f => f.originalname);
    res.json({ success: true, extractedText, fileNames });
  } catch (error) {
    console.error('File extraction error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const chatWithAI = async (req, res) => {
  try {
    const { message, messages: messagesRaw, fileContext, sessionId, sessionTitle } = req.body || {};

    if (!message && !fileContext) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const { allowed, remaining } = await checkDailyLimit(req.user._id, req.user.subscriptionPlan);
    if (!allowed) {
      return res.status(403).json({ error: 'Daily limit reached (20 chats). Upgrade to Pro 🚀' });
    }

    // Parse conversation history
    let messages = null;
    if (messagesRaw) {
      try {
        messages = typeof messagesRaw === 'string' ? JSON.parse(messagesRaw) : messagesRaw;
      } catch {
        messages = null;
      }
    }

    // Build clean messages array: strip all system messages (aiHelper injects master prompt)
    // fileContext is passed separately and embedded into the system prompt by aiHelper
    let chatMessages = null;
    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages.filter(m => m.role !== 'system');
      // Ensure current user message is the last entry (avoid duplicates)
      const last = chatMessages[chatMessages.length - 1];
      if (!last || last.role !== 'user') {
        chatMessages.push({ role: 'user', content: message });
      }
    }

    const aiResponse = await generateAIResponse(message, chatMessages, fileContext || null);
    const formattedReply = formatAIResponse(aiResponse);

    const sid = sessionId || new Date().getTime().toString();
    await Chat.create({ userId: req.user._id, sessionId: sid, sessionTitle: sessionTitle || "New Chat", message, reply: formattedReply });

    res.json({ success: true, reply: formattedReply, sessionId: sid, remainingChats: remaining - 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;

    // If sessionId provided, return messages for that session
    if (sessionId) {
      const chats = await Chat.find({ userId: req.user._id, sessionId }).sort({ createdAt: 1 });
      return res.json({ success: true, chats });
    }

    // Otherwise return list of sessions (one entry per session)
    const sessions = await Chat.aggregate([
      { $match: { userId: req.user._id } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$sessionId", sessionTitle: { $first: "$sessionTitle" }, lastMessage: { $first: "$message" }, updatedAt: { $first: "$createdAt" } } },
      { $sort: { updatedAt: -1 } },
      { $limit: 50 }
    ]);
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSessionTitle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    await Chat.updateMany({ userId: req.user._id, sessionId }, { sessionTitle: title });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await Chat.deleteMany({ userId: req.user._id, sessionId });
    res.json({ success: true, message: `${result.deletedCount} messages deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await Chat.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearAllChats = async (req, res) => {
  try {
    const result = await Chat.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: `${result.deletedCount} chats cleared successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
