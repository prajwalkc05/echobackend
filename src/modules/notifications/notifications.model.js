import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ["info", "alert", "job", "mood", "admin", "announcement", "update"], default: "admin" },
  read: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  targetAudience: { type: String, enum: ["all", "free", "pro", "premium"], default: "all" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
