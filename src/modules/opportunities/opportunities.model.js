import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  type: { type: String, enum: ["job", "internship", "hackathon"] },
  url: String,
  skills: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Opportunity", opportunitySchema);
