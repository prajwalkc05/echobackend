import express from "express";
import {
  createStudyPlan,
  generateStudyPlan,
  explainTopic,
  generateQuestions,
  submitQuiz,
  getVideoRecommendations,
  updateProgress,
  getAdaptiveUpdates,
  generateNotes,
  getPlanDetails,
  getAnalytics
} from "./studyPlanner.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import youtubeRoutes from "./youtube.routes.js";

const router = express.Router();

// Legacy route
router.post("/create", authMiddleware, createStudyPlan);

// New routes
router.post("/generate", authMiddleware, generateStudyPlan);
router.post("/explain", authMiddleware, explainTopic);
router.post("/questions", authMiddleware, generateQuestions);
router.post("/quiz-submit", authMiddleware, submitQuiz);
router.post("/videos", authMiddleware, getVideoRecommendations);
router.put("/:planId/progress", authMiddleware, updateProgress);
router.get("/:planId/adaptive", authMiddleware, getAdaptiveUpdates);
router.post("/notes", authMiddleware, generateNotes);
router.get("/:planId", authMiddleware, getPlanDetails);
router.get("/:planId/analytics", authMiddleware, getAnalytics);

// YouTube routes
router.use("/youtube", youtubeRoutes);

export default router;
