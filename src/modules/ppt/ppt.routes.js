import express from "express";
import { generatePPT, getPPTHistory } from "./ppt.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generatePPT);
router.get("/history", authMiddleware, getPPTHistory);

export default router;
