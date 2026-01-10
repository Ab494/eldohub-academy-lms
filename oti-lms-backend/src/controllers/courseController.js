import { CourseService } from '../services/courseService.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const createCourse = asyncHandler(async (req, res) => {
  const course = await CourseService.createCourse(req.body, req.userId);
  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: course,
  });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await CourseService.updateCourse(courseId, req.body, req.userId, req.userRole);
  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: course,
  });
});

export const publishCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await CourseService.publishCourse(courseId, req.userId, req.userRole);
  res.status(200).json({
    success: true,
    message: 'Course published successfully',
    data: course,
  });
});

export const getCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await CourseService.getCourseById(courseId);
  res.status(200).json({
    success: true,
    data: course,
  });
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const { category, level, instructor, page = 1, limit = 10 } = req.query;
  const result = await CourseService.getAllCourses(
    { category, level, instructor },
    parseInt(page),
    parseInt(limit)
  );
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getInstructorCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await CourseService.getInstructorCourses(req.userId, parseInt(page), parseInt(limit));
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const result = await CourseService.deleteCourse(courseId, req.userId, req.userRole);
  res.status(200).json({
    success: true,
    message: result.message,
  });
});
