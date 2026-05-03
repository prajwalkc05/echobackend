import express from "express";
import { codeAssist, getCodeHistory } from "./codeAssistant.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/assist", authMiddleware, codeAssist);
router.get("/history", authMiddleware, getCodeHistory);

export default router;
