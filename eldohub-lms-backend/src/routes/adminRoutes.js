import express from 'express';
import {
  getUserStats,
  getCourseStats,
  getApprovalStats,
  getRevenueStats,
  getDashboardStats,
  getAllCoursesForAdmin
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Individual stats endpoints
router.get('/stats/users', getUserStats);
router.get('/stats/courses', getCourseStats);
router.get('/stats/approvals', getApprovalStats);
router.get('/stats/revenue', getRevenueStats);

// Combined dashboard stats endpoint
router.get('/stats/dashboard', getDashboardStats);

// Admin courses management
router.get('/courses', getAllCoursesForAdmin);

export default router;