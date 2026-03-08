import mongoose from 'mongoose';

const discussionPostSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionPost',
      default: null,
    },
    isInstructor: {
      type: Boolean,
      default: false,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

discussionPostSchema.index({ course: 1, parentPost: 1, createdAt: -1 });

export const DiscussionPost = mongoose.model('DiscussionPost', discussionPostSchema);
