import express from "express";
import { getOpportunities, getMatchedOpportunities, bookmarkOpportunity, getBookmarks, removeBookmark, createOpportunity } from "./opportunities.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { adminAuth } from "../../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getOpportunities);
router.get("/matched", authMiddleware, getMatchedOpportunities);
router.post("/bookmark", authMiddleware, bookmarkOpportunity);
router.get("/bookmarks", authMiddleware, getBookmarks);
router.delete("/bookmark/:id", authMiddleware, removeBookmark);

// Admin route to create opportunities
router.post("/admin/create", authMiddleware, adminAuth, createOpportunity);

export default router;
