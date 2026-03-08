import { Notification } from '../models/Notification.js';

export class NotificationService {
  /**
   * Create a notification for a single user
   */
  static async create({ recipient, type, title, message, link = null, metadata = {} }) {
    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      link,
      metadata,
    });
    await notification.save();
    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulk(recipientIds, { type, title, message, link = null, metadata = {} }) {
    const notifications = recipientIds.map((recipientId) => ({
      recipient: recipientId,
      type,
      title,
      message,
      link,
      metadata,
    }));
    return await Notification.insertMany(notifications);
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });
  }

  // ── Helpers for common notification types ──

  static async notifyEnrollmentApproved(studentId, courseName, courseId) {
    return this.create({
      recipient: studentId,
      type: 'enrollment_approved',
      title: 'Enrollment Approved',
      message: `Your enrollment in "${courseName}" has been approved. Start learning now!`,
      link: `/course/${courseId}`,
      metadata: { courseId },
    });
  }

  static async notifyEnrollmentRejected(studentId, courseName) {
    return this.create({
      recipient: studentId,
      type: 'enrollment_rejected',
      title: 'Enrollment Rejected',
      message: `Your enrollment request for "${courseName}" was not approved. You may contact the instructor for details.`,
    });
  }

  static async notifyNewContent(studentIds, courseName, courseId, contentTitle) {
    return this.createBulk(studentIds, {
      type: 'new_course_content',
      title: 'New Course Content',
      message: `New content "${contentTitle}" has been added to "${courseName}".`,
      link: `/course/${courseId}`,
      metadata: { courseId },
    });
  }

  static async notifyAnnouncement(recipientIds, title, message, link = null) {
    return this.createBulk(recipientIds, {
      type: 'announcement',
      title,
      message,
      link,
    });
  }

  static async notifyCertificateIssued(studentId, courseName, certificateId) {
    return this.create({
      recipient: studentId,
      type: 'certificate_issued',
      title: 'Certificate Issued',
      message: `Congratulations! Your certificate for "${courseName}" is ready.`,
      link: `/dashboard/certificates`,
      metadata: { certificateId },
    });
  }

  static async notifyAssignmentGraded(studentId, assignmentTitle, courseId) {
    return this.create({
      recipient: studentId,
      type: 'assignment_graded',
      title: 'Assignment Graded',
      message: `Your submission for "${assignmentTitle}" has been graded.`,
      link: `/dashboard/assignments`,
      metadata: { courseId },
    });
  }
}
