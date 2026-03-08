import { NotificationService } from '../services/notificationService.js';
import { asyncHandler, AppError } from '../utils/errorHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const result = await NotificationService.getUserNotifications(
    req.userId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await NotificationService.getUnreadCount(req.userId);
  res.status(200).json({
    success: true,
    data: { unreadCount: count },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationService.markAsRead(
    req.params.notificationId,
    req.userId
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationService.markAllAsRead(req.userId);
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
  });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await NotificationService.deleteNotification(
    req.params.notificationId,
    req.userId
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

export const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, recipientRole, link } = req.body;

  if (!title || !message) {
    throw new AppError('Title and message are required', 400);
  }

  // Get recipient user IDs based on role
  const { User } = await import('../models/User.js');
  let query = { isActive: true };
  if (recipientRole && recipientRole !== 'all') {
    query.role = recipientRole;
  }

  const users = await User.find(query).select('_id');
  const recipientIds = users.map((u) => u._id);

  if (recipientIds.length === 0) {
    throw new AppError('No recipients found', 404);
  }

  await NotificationService.notifyAnnouncement(recipientIds, title, message, link);

  res.status(200).json({
    success: true,
    message: `Announcement sent to ${recipientIds.length} users`,
  });
});
