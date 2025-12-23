import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/errorHandler.js';

export const validateRegister = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'instructor'])
    .withMessage('Invalid role'),
];

export const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateCreateCourse = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level'),
];

export const validateCreateLesson = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('type')
    .isIn(['video', 'text', 'quiz', 'assignment'])
    .withMessage('Invalid lesson type'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array()
      .map(err => err.msg)
      .join(', ');
    return next(new AppError(errorMessages, 400));
  }
  next();
};
