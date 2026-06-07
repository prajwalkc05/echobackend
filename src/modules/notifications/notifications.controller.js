import Notification from "./notifications.model.js";
import { broadcastToAll, broadcastToSubscription } from "../../utils/notificationService.js";

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

// Admin: Broadcast notification to all users or specific subscription plans
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, targetAudience = "all", type = "admin", priority = "medium" } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    let sentCount = 0;

    if (targetAudience === "all") {
      sentCount = await broadcastToAll(title, message, type, priority);
    } else if (["free", "pro", "premium"].includes(targetAudience)) {
      sentCount = await broadcastToSubscription(title, message, targetAudience, type, priority);
    } else {
      return res.status(400).json({ error: "Invalid target audience" });
    }

    res.json({ 
      success: true, 
      message: `Notification sent to ${sentCount} ${targetAudience === "all" ? "users" : targetAudience + " users"}`,
      sentCount,
      targetAudience
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get notification analytics
export const getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ read: false });
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Notifications by type
    const notificationsByType = await Notification.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Recent notifications
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .lean();

    res.json({
      success: true,
      stats: {
        totalNotifications,
        unreadNotifications,
        todayNotifications,
        readRate: totalNotifications > 0 ? Math.round(((totalNotifications - unreadNotifications) / totalNotifications) * 100) : 0
      },
      notificationsByType,
      recentNotifications: recentNotifications.map(n => ({
        title: n.title,
        message: n.message.substring(0, 50) + '...',
        type: n.type,
        user: n.userId?.name || 'Unknown',
        read: n.read,
        createdAt: n.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
