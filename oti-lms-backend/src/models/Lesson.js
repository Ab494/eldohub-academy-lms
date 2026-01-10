import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'text', 'quiz', 'assignment'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required'],
    },
    videoUrl: {
      type: String,
      default: null,
    },
    videoDuration: {
      type: Number, // in seconds
      default: 0,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
      },
    ],
    order: {
      type: Number,
      required: true,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Indexes
lessonSchema.index({ module: 1 });
lessonSchema.index({ course: 1 });
lessonSchema.index({ module: 1, order: 1 });

export const Lesson = mongoose.model('Lesson', lessonSchema);
