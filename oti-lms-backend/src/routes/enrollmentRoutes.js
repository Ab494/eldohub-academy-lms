import express from 'express';
import * as enrollmentController from '../controllers/enrollmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Enroll in a course
router.post(
  '/:courseId/enroll',
  authenticate,
  enrollmentController.enrollCourse
);

// Get my enrollments
router.get(
  '/my/enrollments',
  authenticate,
  enrollmentController.getMyEnrollments
);

// Get course enrollments
router.get(
  '/:courseId/enrollments',
  authenticate,
  enrollmentController.getCourseEnrollments
);

// Mark lesson as complete
router.post(
  '/:courseId/lessons/:lessonId/complete',
  authenticate,
  enrollmentController.markLessonComplete
);

// Get enrollment progress
router.get(
  '/:courseId/progress',
  authenticate,
  enrollmentController.getProgress
);

// Approve enrollment (instructors and admins)
router.post(
  '/:enrollmentId/approve',
  authenticate,
  authorize('instructor', 'admin'),
  enrollmentController.approveEnrollment
);

// Reject enrollment (instructors and admins)
router.post(
  '/:enrollmentId/reject',
  authenticate,
  authorize('instructor', 'admin'),
  enrollmentController.rejectEnrollment
);

// Get pending enrollments (instructors and admins)
router.get(
  '/pending',
  authenticate,
  authorize('instructor', 'admin'),
  enrollmentController.getPendingEnrollments
);

export default router;
