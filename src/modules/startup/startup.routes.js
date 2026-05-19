import express from "express";
import {
  generateIdeas,
  validateIdea,
  generateMVP,
  generateRoadmap,
  analyzeFunding,
  chatWithCofounder,
  saveIdea,
  getSavedIdeas,
  getProgress,
} from "./startup.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

// Generate startup ideas from problem statement
router.post("/ideas", authMiddleware, generateIdeas);

// Validate a startup idea
router.post("/validate", authMiddleware, validateIdea);

// Generate MVP plan
router.post("/mvp", authMiddleware, generateMVP);

// Generate roadmap
router.post("/roadmap", authMiddleware, generateRoadmap);

// Analyze funding opportunities
router.post("/funding", authMiddleware, analyzeFunding);

// Chat with AI cofounder
router.post("/cofounder", authMiddleware, chatWithCofounder);

// Save a startup idea
router.post("/save", authMiddleware, saveIdea);

// Get saved ideas
router.get("/saved", authMiddleware, getSavedIdeas);

// Get user progress
router.get("/progress", authMiddleware, getProgress);

export default router;
