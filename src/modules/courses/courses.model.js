import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['youtube'],
      default: 'youtube'
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    instructor: String,
    rating: Number,
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    lastAccessedAt: Date,
    completedAt: Date,
    notes: String,
    userRating: {
      type: Number,
      min: 0,
      max: 5
    }
  },
  { timestamps: true }
);

courseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Course', courseSchema);
