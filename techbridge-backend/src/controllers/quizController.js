import { QuizService } from '../services/quizService.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const createQuiz = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const quizData = {
    ...req.body,
    lesson: lessonId,
  };

  const quiz = await QuizService.createQuiz(quizData);
  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: quiz,
  });
});

export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers, timeTaken } = req.body;
  const courseId = req.body.courseId;

  if (!answers || !Array.isArray(answers)) {
    throw new AppError('Answers must be an array', 400);
  }

  const result = await QuizService.submitQuizAttempt(
    quizId,
    req.userId,
    courseId,
    answers,
    timeTaken || 0
  );

  res.status(200).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: result,
  });
});

export const getQuizAttempts = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const attempts = await QuizService.getStudentQuizAttempts(quizId, req.userId);
  res.status(200).json({
    success: true,
    data: attempts,
  });
});

export const getBestAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const attempt = await QuizService.getBestAttempt(quizId, req.userId);
  res.status(200).json({
    success: true,
    data: attempt,
  });
});
