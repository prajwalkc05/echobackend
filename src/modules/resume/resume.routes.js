import express from "express";
import { createAIResume, createManualResume, downloadResumePDF, previewResume, uploadPhoto, getATSScore } from "./resume.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import upload from "../../middleware/upload.js";

const router = express.Router();

router.post("/ai", authMiddleware, createAIResume);
router.post("/manual", authMiddleware, createManualResume);
router.get("/download/:id", authMiddleware, downloadResumePDF);
router.get("/preview/:id", authMiddleware, previewResume);
router.post("/upload-photo/:id", authMiddleware, upload.single("photo"), uploadPhoto);
router.post("/ats-score/:id", authMiddleware, getATSScore);

export default router;
