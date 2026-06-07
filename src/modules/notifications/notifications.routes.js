import express from "express";
import { getNotifications, getUnreadCount, markAsRead, markOneAsRead, broadcastNotification, getNotificationStats } from "./notifications.controller.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import { adminAuth } from "../../middleware/admin.middleware.js";

const router = express.Router();

// User routes
router.get("/", authMiddleware, getNotifications);
router.get("/unread", authMiddleware, getUnreadCount);
router.put("/read-all", authMiddleware, markAsRead);
router.put("/read/:id", authMiddleware, markOneAsRead);

// Admin routes
router.post("/admin/broadcast", authMiddleware, adminAuth, broadcastNotification);
router.get("/admin/stats", authMiddleware, adminAuth, getNotificationStats);

export default router;
