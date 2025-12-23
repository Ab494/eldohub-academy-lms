import express from 'express';
import * as courseController from '../controllers/courseController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateCreateCourse, handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:courseId', courseController.getCourse);

// Protected routes (Instructor)
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  validateCreateCourse,
  handleValidationErrors,
  courseController.createCourse
);

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

// Instructor's courses
router.get(
  '/instructor/my-courses',
  authenticate,
  authorize('instructor', 'admin'),
  courseController.getInstructorCourses
);

export default router;
