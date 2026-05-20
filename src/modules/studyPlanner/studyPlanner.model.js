import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  id: String,
  title: String,
  type: { type: String, enum: ['Video', 'Article', 'Question', 'Note'] },
  url: String,
  duration: Number,
  relevance: Number,
}, { _id: false });

const studyTaskSchema = new mongoose.Schema({
  id: String,
  topic: String,
  type: { type: String, enum: ['Learn', 'Practice', 'Review', 'Quiz'] },
  duration: Number,
  resources: [resourceSchema],
  completed: { type: Boolean, default: false },
  performance: Number,
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  day: String,
  date: Date,
  tasks: [studyTaskSchema],
  completed: { type: Boolean, default: false },
}, { _id: false });

const performanceMetricsSchema = new mongoose.Schema({
  overallScore: { type: Number, default: 0 },
  topicScores: { type: Map, of: Number, default: new Map() },
  weakTopics: [String],
  strongTopics: [String],
  studyStreak: { type: Number, default: 0 },
  totalHoursSpent: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  topics: [String],
  examDate: Date,
  dailyHours: Number,
  difficultyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  schedule: [dayScheduleSchema],
  performance: performanceMetricsSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  id: String,
  topic: String,
  type: { type: String, enum: ['MCQ', 'ShortAnswer', 'LongAnswer', 'Scenario'] },
  question: String,
  options: [String],
  correctAnswer: String,
  explanation: String,
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now },
});

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyPlan" },
  topic: String,
  questions: [String], // Store question IDs as strings
  answers: { type: Map, of: String },
  score: Number,
  timestamp: { type: Date, default: Date.now },
  weakAreas: [String],
});

export const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);
export const Question = mongoose.model("Question", questionSchema);
export const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default StudyPlan;
