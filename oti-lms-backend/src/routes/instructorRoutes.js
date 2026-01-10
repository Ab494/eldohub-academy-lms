import express from 'express';
import * as instructorController from '../controllers/instructorController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and instructor role
router.use(authenticate);
router.use(authorize('instructor'));

router.get('/dashboard', instructorController.getInstructorDashboard);
router.get('/analytics', instructorController.getInstructorAnalytics);

export default router;