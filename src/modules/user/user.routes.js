import express from "express";
import { getProfile, updateProfile, saveOnboarding } from "./user.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/onboarding", authMiddleware, saveOnboarding);

export default router;
