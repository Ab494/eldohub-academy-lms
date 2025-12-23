import { EnrollmentService } from '../services/enrollmentService.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await EnrollmentService.enrollStudent(
    req.userId,
    courseId,
    req.user.email,
    `${req.user.firstName} ${req.user.lastName}`
  );
  res.status(201).json({
    success: true,
    message: 'Enrolled successfully',
    data: enrollment,
  });
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await EnrollmentService.getStudentEnrollments(
    req.userId,
    parseInt(page),
    parseInt(limit)
  );
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const result = await EnrollmentService.getCourseEnrollments(
    courseId,
    parseInt(page),
    parseInt(limit)
  );
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const result = await EnrollmentService.markLessonComplete(req.userId, lessonId, courseId);
  res.status(200).json({
    success: true,
    message: 'Lesson marked as complete',
    data: result,
  });
});

export const getProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const enrollment = await EnrollmentService.getEnrollmentProgress(req.userId, courseId);
  res.status(200).json({
    success: true,
    data: enrollment,
  });
});
