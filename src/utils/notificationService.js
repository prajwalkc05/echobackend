import Notification from "../modules/notifications/notifications.model.js";
import User from "../modules/auth/auth.model.js";
import { sendEmail } from "./mailer.js";
import { sendPush } from "../config/firebase.js";

let io;

export const setIO = (socketIO) => { io = socketIO; };

export const notifyUser = async (userId, title, message, type = "info", priority = "medium", sendMail = false) => {
  try {
    // 1. Save in DB
    const notif = await Notification.create({ userId, title, message, type, priority });

    // 2. Realtime via Socket
    if (io) io.to(userId.toString()).emit("notification", { title, message, type, priority, _id: notif._id });

    // 3. Push + Email (optional)
    if (sendMail) {
      const user = await User.findById(userId).select("email name fcmToken");
      if (user?.email) {
        await sendEmail(
          user.email,
          `EchoMentor: ${title}`,
          `<h3>Hi ${user.name},</h3><h4>${title}</h4><p>${message}</p><br/><p>— EchoMentor Team</p>`
        );
      }
      if (user?.fcmToken) {
        await sendPush(user.fcmToken, title, message);
      }
    }

    return notif;
  } catch (err) {
    console.log("⚠️ notifyUser failed:", err.message);
  }
};

export const broadcastToAll = async (title, message, type = "admin", priority = "medium") => {
  try {
    const users = await User.find().select("_id");
    await Promise.all(users.map(u => notifyUser(u._id, title, message, type, priority)));
    console.log(`📢 Broadcast sent to ${users.length} users`);
    return users.length;
  } catch (err) {
    console.log("⚠️ Broadcast failed:", err.message);
    throw err;
  }
};

export const broadcastToSubscription = async (title, message, targetPlan, type = "admin", priority = "medium") => {
  try {
    let query = {};
    
    if (targetPlan === "free") {
      query = { $or: [{ subscription: "free" }, { subscription: { $exists: false } }, { subscription: null }] };
    } else if (targetPlan === "pro") {
      query = { subscription: "pro" };
    } else if (targetPlan === "premium") {
      query = { subscription: "premium" };
    }
    
    const users = await User.find(query).select("_id subscription");
    
    await Promise.all(users.map(u => notifyUser(u._id, title, message, type, priority)));
    
    console.log(`📢 Broadcast sent to ${users.length} ${targetPlan} users`);
    return users.length;
  } catch (err) {
    console.log("⚠️ Targeted broadcast failed:", err.message);
    throw err;
  }
};
