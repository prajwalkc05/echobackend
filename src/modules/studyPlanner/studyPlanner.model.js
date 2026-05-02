import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: String,
  topics: [String],
  hoursPerDay: Number,
  plan: [{ day: Number, tasks: [String] }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StudyPlan", studyPlanSchema);
