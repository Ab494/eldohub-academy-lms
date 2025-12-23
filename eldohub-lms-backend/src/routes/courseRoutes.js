import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateCreateCourse, handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);

// Protected routes (Instructor)
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  validateCreateCourse,
  handleValidationErrors,
  courseController.createCourse
);

// Instructor's courses - must come before /:courseId to prevent route collision
router.get(
  '/instructor/my-courses',
  authenticate,
  authorize('instructor', 'admin'),
  courseController.getInstructorCourses
);

router.get('/:courseId', courseController.getCourse);

router.put(
  '/:courseId',
  authenticate,
  authorize('instructor', 'admin'),
  courseController.updateCourse
);

router.post(
  '/:courseId/publish',
  authenticate,
  authorize('instructor', 'admin'),
  courseController.publishCourse
);

router.delete(
  '/:courseId',
  authenticate,
  authorize('instructor', 'admin'),
  courseController.deleteCourse
);

export default router;
