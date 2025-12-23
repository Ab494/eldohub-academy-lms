import express from 'express';
import * as moduleController from '../controllers/moduleController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

// Create module for a course
router.post(
  '/',
  authenticate,
  authorize('instructor', 'admin'),
  moduleController.createModule
);

// Get all modules in a course
router.get('/', moduleController.getCourseModules);

// Update module
router.put(
  '/:moduleId',
  authenticate,
  authorize('instructor', 'admin'),
  moduleController.updateModule
);

// Delete module
router.delete(
  '/:moduleId',
  authenticate,
  authorize('instructor', 'admin'),
  moduleController.deleteModule
);

export default router;
