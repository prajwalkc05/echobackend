import mongoose from "mongoose";

const adminSettingsSchema = new mongoose.Schema({
  pricing: {
    pro: { type: Number, default: 199 },
    premium: { type: Number, default: 1500 },
  },
  features: {
    aiChat: { type: Boolean, default: true },
    resumeBuilder: { type: Boolean, default: true },
    pptGenerator: { type: Boolean, default: true },
    studyPlanner: { type: Boolean, default: true },
    moodTracker: { type: Boolean, default: true },
    opportunities: { type: Boolean, default: true },
  },
  announcement: {
    message: { type: String, default: "" },
    active: { type: Boolean, default: false },
  },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model("AdminSettings", adminSettingsSchema);
