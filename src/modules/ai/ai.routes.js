import express from 'express';
import { chatWithAI, getChatHistory, deleteChat, clearAllChats } from './ai.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.post('/chat', authMiddleware, upload.array('files', 5), chatWithAI);
router.get('/history', authMiddleware, getChatHistory);
router.delete('/chat/:id', authMiddleware, deleteChat);
router.delete('/history/clear', authMiddleware, clearAllChats);

export default router;
