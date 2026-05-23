import express from "express";
import { getProfile, updateProfile, saveOnboarding, saveCourseOnboarding, changePassword, toggleTwoFactor, getSessions, getPrivacy, updatePrivacy, updateCookies, deleteAccount } from "./user.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/onboarding", authMiddleware, saveOnboarding);
router.post("/course-onboarding", authMiddleware, saveCourseOnboarding);
router.put("/change-password", authMiddleware, changePassword);
router.put("/two-factor", authMiddleware, toggleTwoFactor);
router.get("/sessions", authMiddleware, getSessions);
router.get("/privacy", authMiddleware, getPrivacy);
router.put("/privacy", authMiddleware, updatePrivacy);
router.put("/cookies", authMiddleware, updateCookies);
router.delete("/account", authMiddleware, deleteAccount);

export default router;
