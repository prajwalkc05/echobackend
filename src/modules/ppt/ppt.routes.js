import express from "express";
import { generatePPT, generateSlidesJSON, getPPTHistory, deletePPTHistory, clearPPTHistory } from "./ppt.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generatePPT);
router.post("/generate-slides", authMiddleware, generateSlidesJSON);
router.get("/history", authMiddleware, getPPTHistory);
router.delete("/history/clear", authMiddleware, clearPPTHistory);
router.delete("/history/:id", authMiddleware, deletePPTHistory);

export default router;
