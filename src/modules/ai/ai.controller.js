import { generateAIResponse } from '../../utils/aiHelper.js';
import { formatAIResponse } from '../../utils/responseFormatter.js';
import { checkDailyLimit } from './ai.service.js';
import { processFiles } from '../../utils/fileProcessor.js';
import Chat from './ai.model.js';

const FILE_SYSTEM_PROMPT = `You are EchoMentor AI, a professional AI assistant.

The user has uploaded one or more files. Their content has been extracted and provided below.

RULES:
1. Read the file content carefully before answering.
2. Answer questions based on the file content.
3. If asked to summarize — give a clean structured summary.
4. If asked for code — extract and format it properly.
5. If asked to generate MCQs — create them from the file content.
6. Use markdown formatting for all responses.
7. Never mention "extracted text" or technical processing details to the user.
8. Respond naturally as if you read the document yourself.`;

export const chatWithAI = async (req, res) => {
  try {
    const { message, messages: messagesRaw } = req.body || {};
    const files = req.files || [];

    // When sent as FormData, messages arrives as a JSON string — parse it
    let messages = null;
    if (messagesRaw) {
      try {
        messages = typeof messagesRaw === 'string' ? JSON.parse(messagesRaw) : messagesRaw;
      } catch {
        messages = null;
      }
    }

    if (!message && files.length === 0) {
      return res.status(400).json({ error: 'Message or file is required' });
    }

    const { allowed, remaining } = await checkDailyLimit(req.user._id, req.user.subscriptionPlan);
    if (!allowed) {
      return res.status(403).json({ error: 'Daily limit reached (20 chats). Upgrade to Pro 🚀' });
    }

    let chatMessages;

    if (files.length > 0) {
      // File upload flow — extract text and inject into context
      const extractedText = await processFiles(files);
      const userQuestion = message || 'Please summarize this file.';

      chatMessages = [
        { role: 'system', content: FILE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `FILE CONTENT:\n${extractedText}\n\nUSER QUESTION:\n${userQuestion}`,
        },
      ];
    } else if (messages && Array.isArray(messages) && messages.length > 0) {
      // Full conversation history sent from frontend — use as-is
      chatMessages = messages;
    } else {
      // Fallback: single message
      chatMessages = null;
    }

    const aiResponse = await generateAIResponse(message || 'Analyze the file.', chatMessages);
    const formattedReply = formatAIResponse(aiResponse);

    await Chat.create({ userId: req.user._id, message: message || '[File Upload]', reply: formattedReply });

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
