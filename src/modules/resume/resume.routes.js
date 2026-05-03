import express from "express";
import { createAIResume, createManualResume, getResumes } from "./resume.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/ai", authMiddleware, createAIResume);
router.post("/manual", authMiddleware, createManualResume);
router.get("/", authMiddleware, getResumes);

export default router;
