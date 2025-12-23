import express from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Create assignment
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  assignmentController.createAssignment
);

// Submit assignment
router.post(
  '/:assignmentId/submit',
  authenticate,
  assignmentController.submitAssignment
);

// Grade submission
router.post(
  '/submissions/:submissionId/grade',
  authenticate,
  authorize('instructor', 'admin'),
  assignmentController.gradeSubmission
);

// Get submission
router.get(
  '/submissions/:submissionId',
  authenticate,
  assignmentController.getSubmission
);

// Get assignment submissions
router.get(
  '/:assignmentId/submissions',
  authenticate,
  authorize('instructor', 'admin'),
  assignmentController.getAssignmentSubmissions
);

// Get my submissions
router.get(
  '/my/submissions/:courseId',
  authenticate,
  assignmentController.getMySubmissions
);

export default router;
