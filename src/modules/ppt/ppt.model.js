import mongoose from "mongoose";

const pptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topic: String,
  description: String,
  slideContent: String,
  slides: Number,
  theme: String,
  layout: String,
  presentationType: String,
  tone: String,
  audience: String,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PPT", pptSchema);
