import mongoose from "mongoose";

const codeAssistantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, enum: ["generate", "explain", "debug", "review"], required: true },
  language: { type: String, default: "javascript" },
  input: { type: String, required: true },
  output: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CodeAssistant", codeAssistantSchema);
