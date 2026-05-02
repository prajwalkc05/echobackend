import express from "express";
import { getNotifications, getUnreadCount, markAsRead, markOneAsRead, broadcastNotification } from "./notifications.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { adminAuth } from "../../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.get("/unread", authMiddleware, getUnreadCount);
router.put("/read-all", authMiddleware, markAsRead);
router.put("/read/:id", authMiddleware, markOneAsRead);
router.post("/broadcast", authMiddleware, adminAuth, broadcastNotification);

export default router;
