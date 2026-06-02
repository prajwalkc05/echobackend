import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  isGoogleUser: { type: Boolean, default: false },

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
    careerGoal: String,
    skillLevel: String,
    mainGoal: String,
    courseOnboardingCompleted: { type: Boolean, default: false },
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

  twoFactorEnabled: { type: Boolean, default: false },

  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
  },

  privacy: {
    shareData: { type: Boolean, default: false },
    analytics: { type: Boolean, default: true },
  },

  cookies: {
    functional: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);