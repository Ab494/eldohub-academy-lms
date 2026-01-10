import express from 'express';
import * as lessonController from '../controllers/lessonController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateCreateLesson, handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router({ mergeParams: true });

// Create lesson in module
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  validateCreateLesson,
  handleValidationErrors,
  lessonController.createLesson
);

// Get lesson
router.get('/:lessonId', lessonController.getLesson);

// Update lesson
router.put(
  '/:lessonId',
  authenticate,
  authorize('instructor', 'admin'),
  lessonController.updateLesson
);

// Delete lesson
router.delete(
  '/:lessonId',
  authenticate,
  authorize('instructor', 'admin'),
  lessonController.deleteLesson
);

export default router;
