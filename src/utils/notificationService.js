import Notification from "../modules/notifications/notifications.model.js";
import User from "../modules/auth/auth.model.js";
import { sendEmail } from "./mailer.js";
import { sendPush } from "../config/firebase.js";

let io;

export const setIO = (socketIO) => { io = socketIO; };

export const notifyUser = async (userId, message, type = "info", sendMail = false) => {
  try {
    // 1. Save in DB
    const notif = await Notification.create({ userId, message, type });

    // 2. Realtime via Socket
    if (io) io.to(userId.toString()).emit("notification", { message, type, _id: notif._id });

    // 3. Push + Email (optional)
    if (sendMail) {
      const user = await User.findById(userId).select("email name fcmToken");
      if (user?.email) {
        await sendEmail(
          user.email,
          `EchoMentor: ${type === "job" ? "New Job Match 🔥" : type === "mood" ? "We're Here For You 💙" : "New Update 📢"}`,
          `<h3>Hi ${user.name},</h3><p>${message}</p><br/><p>— EchoMentor Team</p>`
        );
      }
      if (user?.fcmToken) {
        await sendPush(user.fcmToken, "EchoMentor", message);
      }
    }

    return notif;
  } catch (err) {
    console.log("⚠️ notifyUser failed:", err.message);
  }
};

export const broadcastToAll = async (message, type = "admin") => {
  try {
    const users = await User.find().select("_id");
    await Promise.all(users.map(u => notifyUser(u._id, message, type)));
    console.log(`📢 Broadcast sent to ${users.length} users`);
  } catch (err) {
    console.log("⚠️ Broadcast failed:", err.message);
  }
};
