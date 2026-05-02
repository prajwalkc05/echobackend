import express from "express";
import { createStudyPlan } from "./studyPlanner.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createStudyPlan);

export default router;
