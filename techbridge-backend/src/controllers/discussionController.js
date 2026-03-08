import { DiscussionPost } from '../models/DiscussionPost.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';
import { sendEmail, discussionReplyEmailTemplate } from '../utils/emailService.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';

// Get all top-level posts for a course
export const getPosts = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 20, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { course: courseId, parentPost: null };
  if (search && search.trim()) {
    filter.content = { $regex: search.trim(), $options: 'i' };
  }

  const [posts, total] = await Promise.all([
    DiscussionPost.find(filter)
      .populate('author', 'firstName lastName role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    DiscussionPost.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      posts,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
    },
  });
});

// Get replies for a post
export const getReplies = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const replies = await DiscussionPost.find({ parentPost: postId })
    .populate('author', 'firstName lastName role')
    .sort({ createdAt: 1 });

  res.status(200).json({ success: true, data: replies });
});

// Create a post or reply
export const createPost = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { content, parentPostId } = req.body;

  if (!content || !content.trim()) {
    throw new AppError('Content is required', 400);
  }
  if (content.trim().length > 5000) {
    throw new AppError('Content must be under 5000 characters', 400);
  }

  const postData = {
    course: courseId,
    author: req.userId,
    content: content.trim(),
    parentPost: parentPostId || null,
    isInstructor: req.userRole === 'instructor' || req.userRole === 'admin',
  };

  const post = new DiscussionPost(postData);
  await post.save();

  // Increment parent's reply count and send email notification
  if (parentPostId) {
    await DiscussionPost.findByIdAndUpdate(parentPostId, { $inc: { repliesCount: 1 } });

    // Send email to original post author (async, non-blocking)
    try {
      const parentPost = await DiscussionPost.findById(parentPostId).populate('author', 'firstName lastName email emailNotifications');
      if (parentPost && parentPost.author && parentPost.author.email && parentPost.author._id.toString() !== req.userId
          && parentPost.author.emailNotifications?.discussionReplies !== false) {
        const replier = await User.findById(req.userId).select('firstName lastName');
        const course = await Course.findById(courseId).select('title');
        const replierName = replier ? `${replier.firstName} ${replier.lastName}`.trim() : 'Someone';
        const authorName = parentPost.author.firstName || 'there';
        const snippet = content.trim().substring(0, 200) + (content.trim().length > 200 ? '…' : '');
        const courseName = course?.title || 'your course';

        sendEmail(
          parentPost.author.email,
          `${replierName} replied to your post in ${courseName}`,
          discussionReplyEmailTemplate(authorName, replierName, snippet, courseName)
        ).catch((err) => console.error('Discussion reply email error:', err.message));
      }
    } catch (emailErr) {
      console.error('Failed to send reply notification email:', emailErr.message);
    }
  }

  const populated = await DiscussionPost.findById(post._id)
    .populate('author', 'firstName lastName role');

  res.status(201).json({ success: true, data: populated });
});

// Toggle like on a post
export const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  const post = await DiscussionPost.findById(postId);
  if (!post) throw new AppError('Post not found', 404);

  const alreadyLiked = post.likes.includes(userId);

  if (alreadyLiked) {
    post.likes.pull(userId);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likes.push(userId);
    post.likesCount += 1;
  }

  await post.save();
  res.status(200).json({ success: true, data: { liked: !alreadyLiked, likesCount: post.likesCount } });
});

// Delete own post
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await DiscussionPost.findById(postId);

  if (!post) throw new AppError('Post not found', 404);
  if (post.author.toString() !== req.userId && req.userRole !== 'admin') {
    throw new AppError('Not authorized to delete this post', 403);
  }

  // Delete replies too
  if (!post.parentPost) {
    await DiscussionPost.deleteMany({ parentPost: postId });
  } else {
    await DiscussionPost.findByIdAndUpdate(post.parentPost, { $inc: { repliesCount: -1 } });
  }

  await DiscussionPost.findByIdAndDelete(postId);
  res.status(200).json({ success: true, message: 'Post deleted' });
});
