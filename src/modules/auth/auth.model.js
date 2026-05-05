import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,

  subscriptionPlan: {
    type: String,
    default: "FREE",
  },

  fcmToken: { type: String, default: null },

  profile: {
    dob: String,
    phone: String,
    education: String,
    role: String,
    skills: [String],
    interests: [String],
    goals: [String],
    learningStyle: String,
    location: String,
    onboardingCompleted: { type: Boolean, default: false },
  },

  bookmarks: [
    new mongoose.Schema({
      title: { type: String, default: "" },
      company: { type: String, default: "" },
      location: { type: String, default: "" },
      type: { type: String, default: "" },
      url: { type: String, default: "" },
      skills: { type: [String], default: [] },
    }, { _id: true })
  ],
}, { timestamps: true });

export default mongoose.model("User", userSchema);