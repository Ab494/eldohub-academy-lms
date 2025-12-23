import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from '../middlewares/validation.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  validateRegister,
  handleValidationErrors,
  authController.register
);
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  authController.login
);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/logout', authenticate, authController.logout);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
