import { Enrollment } from '../models/Enrollment.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { AppError } from '../utils/errorHandler.js';
import { sendEmail, enrollmentEmailTemplate } from '../utils/emailService.js';

export class EnrollmentService {
  static async enrollStudent(studentId, courseId, userEmail, userName) {
    // Check if already enrolled with active or pending status
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['active', 'pending_approval'] }
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'pending_approval') {
        throw new AppError('You already have a pending enrollment request for this course', 400);
      } else {
        throw new AppError('You are already enrolled in this course', 400);
      }
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      status: 'pending_approval',
    });

    await enrollment.save();

    // Don't update course enrollment count until approved
    // course.enrollmentCount += 1;
    // await course.save();

    // Send enrollment email
    try {
      const emailHtml = enrollmentEmailTemplate(userName, course.title);
      await sendEmail(userEmail, `Welcome to ${course.title}`, emailHtml);
    } catch (error) {
      console.error('Error sending enrollment email:', error);
    }

    // Return populated enrollment
    return await Enrollment.findById(enrollment._id)
      .populate('course', 'title thumbnail')
      .populate('student', 'firstName lastName email');
  }

  static async getStudentEnrollments(studentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'title thumbnail category level enrollmentCount instructor')
      .populate('course.instructor', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ enrollmentDate: -1 });

    const total = await Enrollment.countDocuments({ student: studentId });

    return {
      enrollments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async getCourseEnrollments(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find({ course: courseId })
      .populate('student', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ enrollmentDate: -1 });

    const total = await Enrollment.countDocuments({ course: courseId });

    return {
      enrollments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async markLessonComplete(studentId, lessonId, courseId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      throw new AppError('Not enrolled in this course', 403);
    }

    let lessonProgress = await LessonProgress.findOne({
      lesson: lessonId,
      student: studentId,
    });

    if (!lessonProgress) {
      lessonProgress = new LessonProgress({
        lesson: lessonId,
        student: studentId,
        course: courseId,
        isCompleted: true,
        completedDate: new Date(),
      });
    } else {
      lessonProgress.isCompleted = true;
      lessonProgress.completedDate = new Date();
    }

    await lessonProgress.save();

    // Update enrollment progress
    const completedLessons = await LessonProgress.countDocuments({
      student: studentId,
      course: courseId,
      isCompleted: true,
    });

    const totalLessons = await Lesson.countDocuments({ course: courseId });

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    enrollment.progressPercentage = progressPercentage;
    enrollment.completedLessons.push(lessonId);

    if (progressPercentage === 100) {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
    }

    await enrollment.save();

    return { lessonProgress, progressPercentage };
  }

  static async getEnrollmentProgress(studentId, courseId) {
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    }).populate({
      path: 'course',
      select: 'title thumbnail',
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    return enrollment;
  }

  static async approveEnrollment(enrollmentId, approvedBy) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== 'pending_approval') {
      throw new AppError('Enrollment is not pending approval', 400);
    }

    enrollment.status = 'active';
    await enrollment.save();

    // Update course enrollment count
    const course = await Course.findById(enrollment.course);
    if (course) {
      course.enrollmentCount += 1;
      await course.save();
    }

    // Return populated enrollment
    return await Enrollment.findById(enrollmentId)
      .populate('course', 'title')
      .populate('student', 'firstName lastName email');
  }

  static async rejectEnrollment(enrollmentId, approvedBy) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.status !== 'pending_approval') {
      throw new AppError('Enrollment is not pending approval', 400);
    }

    enrollment.status = 'rejected';
    await enrollment.save();

    // Return populated enrollment
    return await Enrollment.findById(enrollmentId)
      .populate('course', 'title')
      .populate('student', 'firstName lastName email');
  }

  static async getPendingEnrollments(instructorId = null, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let query = { status: 'pending_approval' };

    // If instructorId is provided, only show enrollments for their courses
    if (instructorId) {
      const { Course } = await import('../models/Course.js');
      const instructorCourses = await Course.find({ instructor: instructorId }).select('_id');
      const courseIds = instructorCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'firstName lastName email')
      .populate('course', 'title instructor')
      .populate('course.instructor', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ enrollmentDate: -1 });

    const total = await Enrollment.countDocuments(query);

    return {
      enrollments,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
