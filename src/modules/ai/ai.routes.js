import express from "express";
import { chatWithAI, getChatHistory, deleteChat, clearAllChats } from "./ai.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", authMiddleware, chatWithAI);
router.get("/history", authMiddleware, getChatHistory);
router.delete("/chat/:id", authMiddleware, deleteChat);
router.delete("/history/clear", authMiddleware, clearAllChats);

export default router;
