import mongoose from "mongoose";

const startupIdeaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    pitch: {
      type: String,
      required: true,
    },
    problem: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      default: "",
    },
    demand: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    competition: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    revenue: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    scalability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    status: {
      type: String,
      enum: ["generated", "saved", "validated", "mvp", "roadmap", "funding"],
      default: "generated",
    },
    validation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    mvpPlan: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    roadmap: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    funding: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
startupIdeaSchema.index({ userId: 1, createdAt: -1 });
startupIdeaSchema.index({ userId: 1, status: 1 });

const StartupIdea = mongoose.model("StartupIdea", startupIdeaSchema);

export default StartupIdea;
