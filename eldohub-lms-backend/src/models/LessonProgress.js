import mongoose from 'mongoose';

const lessonProgressSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    watchTime: {
      type: Number, // in seconds
      default: 0,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

// Indexes
lessonProgressSchema.index({ lesson: 1, student: 1 }, { unique: true });
lessonProgressSchema.index({ student: 1 });
lessonProgressSchema.index({ course: 1 });

export const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
