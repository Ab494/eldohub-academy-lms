import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Assignment description is required'],
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
    dueDate: {
      type: Date,
      required: true,
    },
    instructions: String,
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
    totalPoints: {
      type: Number,
      default: 100,
    },
    rubric: String,
    allowLateSubmission: {
      type: Boolean,
      default: true,
    },
    latePenalty: {
      type: Number,
      default: 0, // percentage
    },
    maxSubmissions: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Indexes
assignmentSchema.index({ lesson: 1 });
assignmentSchema.index({ course: 1 });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
