import { Server } from "socket.io";
import { setIO } from "./utils/notificationService.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  setIO(io);

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

// Keep backward compat
export const sendNotification = async (userId, message, type = "info") => {
  const { notifyUser } = await import("./utils/notificationService.js");
  await notifyUser(userId, message, type);
};
