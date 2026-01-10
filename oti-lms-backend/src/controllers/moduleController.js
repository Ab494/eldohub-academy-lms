import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const createModule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, order } = req.body;

  const module = new Module({
    title,
    description,
    course: courseId,
    order: order || 1,
  });

  await module.save();
  res.status(201).json({
    success: true,
    message: 'Module created successfully',
    data: module,
  });
});

export const updateModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { title, description, order } = req.body;

  const module = await Module.findByIdAndUpdate(
    moduleId,
    { title, description, order },
    { new: true, runValidators: true }
  );

  if (!module) {
    throw new AppError('Module not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Module updated successfully',
    data: module,
  });
});

export const getCourseModules = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const modules = await Module.find({ course: courseId })
    .populate('lessons')
    .sort({ order: 1 });

  res.status(200).json({
    success: true,
    data: modules,
  });
});

export const deleteModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  const module = await Module.findByIdAndDelete(moduleId);
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  // Delete related lessons
  await Lesson.deleteMany({ module: moduleId });

  res.status(200).json({
    success: true,
    message: 'Module deleted successfully',
  });
});
