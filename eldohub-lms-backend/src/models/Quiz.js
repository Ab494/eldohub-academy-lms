import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['mcq', 'truefalse', 'shortanswer'],
          default: 'mcq',
        },
        options: [String],
        correctAnswer: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          default: 1,
        },
        explanation: String,
      },
    ],
    totalPoints: {
      type: Number,
      default: 0,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    timeLimit: {
      type: Number, // in minutes
      default: 0,
    },
    attemptsAllowed: {
      type: Number,
      default: 1,
    },
    showAnswers: {
      type: Boolean,
      default: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
quizSchema.index({ lesson: 1 });
quizSchema.index({ course: 1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
