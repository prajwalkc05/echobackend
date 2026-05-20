import express from 'express';
import { chatWithAI, getChatHistory, deleteChat, clearAllChats, extractFile } from './ai.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import upload from '../../middleware/upload.js';

const router = express.Router();

router.post('/chat', authMiddleware, chatWithAI);
router.post('/extract', authMiddleware, upload.array('files', 5), extractFile);
router.get('/history', authMiddleware, getChatHistory);
router.delete('/chat/:id', authMiddleware, deleteChat);
router.delete('/history/clear', authMiddleware, clearAllChats);

export default router;
