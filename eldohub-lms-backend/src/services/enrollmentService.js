import { Enrollment } from '../models/Enrollment.js';
import { LessonProgress } from '../models/LessonProgress.js';
import { Course } from '../models/Course.js';
import { Lesson } from '../models/Lesson.js';
import { AppError } from '../utils/errorHandler.js';
import { sendEmail, enrollmentEmailTemplate } from '../utils/emailService.js';

export class EnrollmentService {
  static async enrollStudent(studentId, courseId, userEmail, userName) {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (existingEnrollment) {
      throw new AppError('Already enrolled in this course', 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      status: 'active',
    });

    await enrollment.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    // Send enrollment email
    try {
      const emailHtml = enrollmentEmailTemplate(userName, course.title);
      await sendEmail(userEmail, `Welcome to ${course.title}`, emailHtml);
    } catch (error) {
      console.error('Error sending enrollment email:', error);
    }

    return enrollment.populate('course', 'title thumbnail').populate('student', 'firstName lastName email');
  }

  static async getStudentEnrollments(studentId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const enrollments = await Enrollment.find({ student: studentId })
      .populate('course', 'title thumbnail category level enrollmentCount')
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
}
