import express from "express";
import { trackMood, getMoodHistory } from "./mood.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/track", authMiddleware, trackMood);
router.get("/history", authMiddleware, getMoodHistory);

export default router;
