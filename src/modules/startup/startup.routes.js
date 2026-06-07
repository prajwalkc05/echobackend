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
  clearAllIdeas,
  deleteIdea,
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

// Clear all startup data for user
router.delete("/clear-all", authMiddleware, clearAllIdeas);

// Delete single idea
router.delete("/idea/:id", authMiddleware, deleteIdea);

export default router;
