import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  sessionId: { type: String, index: true },
  sessionTitle: { type: String, default: "New Chat" },
  message: String,
  reply: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", chatSchema);
