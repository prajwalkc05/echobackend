import express from "express";
import { generatePPT, generateSlidesJSON, getPPTHistory } from "./ppt.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", authMiddleware, generatePPT);
router.post("/generate-slides", authMiddleware, generateSlidesJSON);
router.get("/history", authMiddleware, getPPTHistory);

export default router;
