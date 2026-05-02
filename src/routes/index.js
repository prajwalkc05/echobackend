import express from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";
import studyPlannerRoutes from "../modules/studyPlanner/studyPlanner.routes.js";
import resumeRoutes from "../modules/resume/resume.routes.js";
import pptRoutes from "../modules/ppt/ppt.routes.js";
import opportunitiesRoutes from "../modules/opportunities/opportunities.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import moodRoutes from "../modules/mood/mood.routes.js";
import adminRoutes from "../modules/admin/admin.routes.js";
import notificationRoutes from "../modules/notifications/notifications.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/study-planner", studyPlannerRoutes);
router.use("/resume", resumeRoutes);
router.use("/ppt", pptRoutes);
router.use("/opportunities", opportunitiesRoutes);
router.use("/user", userRoutes);
router.use("/mood", moodRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);

export default router;
