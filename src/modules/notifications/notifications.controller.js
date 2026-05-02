import Notification from "./notifications.model.js";
import { broadcastToAll } from "../../utils/notificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({ success: true, unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id }, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markOneAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const broadcastNotification = async (req, res) => {
  try {
    const { message, type = "admin" } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    await broadcastToAll(message, type);
    res.json({ success: true, message: "Broadcast sent to all users" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
