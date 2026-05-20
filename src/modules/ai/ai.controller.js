import { generateAIResponse } from '../../utils/aiHelper.js';
import { formatAIResponse } from '../../utils/responseFormatter.js';
import { checkDailyLimit } from './ai.service.js';
import { processFiles } from '../../utils/fileProcessor.js';
import Chat from './ai.model.js';

export const chatWithAI = async (req, res) => {
  try {
    const { message, messages: messagesRaw } = req.body || {};
    const files = req.files || [];

    if (!message && files.length === 0) {
      return res.status(400).json({ error: 'Message or file is required' });
    }

    const { allowed, remaining } = await checkDailyLimit(req.user._id, req.user.subscriptionPlan);
    if (!allowed) {
      return res.status(403).json({ error: 'Daily limit reached (20 chats). Upgrade to Pro 🚀' });
    }

    // Parse messages array (arrives as JSON string when sent via FormData)
    let messages = null;
    if (messagesRaw) {
      try {
        messages = typeof messagesRaw === 'string' ? JSON.parse(messagesRaw) : messagesRaw;
      } catch {
        messages = null;
      }
    }

    // If files uploaded — extract content and inject as a system context message
    // This is merged INTO the conversation history so follow-up questions still have context
    if (files.length > 0) {
      const extractedText = await processFiles(files);
      const fileNames = files.map(f => f.originalname).join(', ');

      const fileContextMessage = {
        role: 'system',
        content: `The user has uploaded the following file(s): ${fileNames}\n\nEXTRACTED FILE CONTENT:\n${extractedText}\n\nUse this content to answer all user questions. Never say you cannot read the file.`,
      };

      // Merge: existing conversation + file context + current user message
      const existingMessages = Array.isArray(messages) ? messages.filter(m => m.role !== 'system') : [];
      const userMessage = message || 'Please analyze and explain this file.';

      messages = [
        ...existingMessages,
        fileContextMessage,
        { role: 'user', content: userMessage },
      ];
    }

    const aiResponse = await generateAIResponse(message || 'Analyze the uploaded file.', messages);
    const formattedReply = formatAIResponse(aiResponse);

    await Chat.create({
      userId: req.user._id,
      message: message || `[File Upload: ${files.map(f => f.originalname).join(', ')}]`,
      reply: formattedReply,
    });

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
