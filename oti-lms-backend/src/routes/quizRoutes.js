import express from 'express';
import * as quizController from '../controllers/quizController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Create quiz
router.post(
  '/',
  authenticate,
  quizController.createQuiz
);

// Submit quiz attempt
router.post(
  '/:quizId/submit',
  authenticate,
  quizController.submitQuizAttempt
);

// Get quiz attempts
router.get(
  '/:quizId/attempts',
  authenticate,
  quizController.getQuizAttempts
);

// Get best attempt
router.get(
  '/:quizId/best-attempt',
  authenticate,
  quizController.getBestAttempt
);

export default router;
