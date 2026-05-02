import express from "express";
import { chatWithAI, getChatHistory } from "./ai.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", authMiddleware, chatWithAI);
router.get("/history", authMiddleware, getChatHistory);

export default router;
