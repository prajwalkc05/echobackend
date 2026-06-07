import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  type: {
    type: String,
    enum: ["job", "internship", "hackathon", "scholarship", "fellowship"],
    default: "job",
  },
  url: String,
  salary: String,
  deadline: String,
  description: String,
  skills: [String],
  source: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Opportunity", opportunitySchema);
