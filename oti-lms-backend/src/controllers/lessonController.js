import { Lesson } from '../models/Lesson.js';
import { Module } from '../models/Module.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const createLesson = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { title, description, type, content, videoUrl, videoDuration, order } = req.body;

  const module = await Module.findById(moduleId);
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  const lesson = new Lesson({
    title,
    description,
    type,
    content,
    videoUrl,
    videoDuration,
    module: moduleId,
    course: module.course,
    order: order || 1,
  });

  await lesson.save();

  // Add lesson to module
  module.lessons.push(lesson._id);
  await module.save();

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: lesson,
  });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const allowedFields = [
    'title',
    'description',
    'content',
    'videoUrl',
    'videoDuration',
    'order',
    'status',
  ];

  const updates = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const lesson = await Lesson.findByIdAndUpdate(lessonId, updates, {
    new: true,
    runValidators: true,
  });

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Lesson updated successfully',
    data: lesson,
  });
});

export const getLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findById(lessonId)
    .populate('module', 'title')
    .populate('course', 'title');

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;

  const lesson = await Lesson.findByIdAndDelete(lessonId);
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Remove from module
  await Module.findByIdAndUpdate(lesson.module, {
    $pull: { lessons: lessonId },
  });

  res.status(200).json({
    success: true,
    message: 'Lesson deleted successfully',
  });
});
