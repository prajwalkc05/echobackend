import express from "express";
import { getOpportunities, getMatchedOpportunities, bookmarkOpportunity, getBookmarks, removeBookmark } from "./opportunities.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getOpportunities);
router.get("/matched", authMiddleware, getMatchedOpportunities);
router.post("/bookmark", authMiddleware, bookmarkOpportunity);
router.get("/bookmarks", authMiddleware, getBookmarks);
router.delete("/bookmark/:id", authMiddleware, removeBookmark);

export default router;
