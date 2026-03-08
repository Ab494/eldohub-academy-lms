import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Get user's notifications
router.get('/', authenticate, notificationController.getNotifications);

// Get unread count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Mark single notification as read
router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

// Mark all as read
router.patch('/read-all', authenticate, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:notificationId', authenticate, notificationController.deleteNotification);

// Send announcement (admin only)
router.post(
  '/announce',
  authenticate,
  authorize('admin'),
  notificationController.sendAnnouncement
);

export default router;
