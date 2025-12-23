import { Course } from '../models/Course.js';
import { Module } from '../models/Module.js';
import { Lesson } from '../models/Lesson.js';
import { Enrollment } from '../models/Enrollment.js';
import { AppError } from '../utils/errorHandler.js';

export class CourseService {
  static async createCourse(courseData, instructorId) {
    const course = new Course({
      ...courseData,
      instructor: instructorId,
    });

    await course.save();
    return course.populate('instructor', 'firstName lastName email');
  }

  static async updateCourse(courseId, updateData, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== instructorId && instructorId.role !== 'admin') {
      throw new AppError('Not authorized to update this course', 403);
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'thumbnail',
      'price',
      'level',
      'tags',
    ];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        course[field] = updateData[field];
      }
    });

    await course.save();
    return course.populate('instructor', 'firstName lastName email');
  }

  static async publishCourse(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== instructorId) {
      throw new AppError('Not authorized', 403);
    }

    // Check if course has at least one module with lessons
    const modules = await Module.find({ course: courseId }).populate('lessons');
    if (modules.length === 0 || modules.every(m => m.lessons.length === 0)) {
      throw new AppError('Course must have at least one lesson', 400);
    }

    course.status = 'published';
    course.isPublished = true;
    await course.save();

    return course;
  }

  static async getCourseById(courseId) {
    return Course.findById(courseId)
      .populate('instructor', 'firstName lastName email')
      .populate({
        path: 'prerequisites',
        select: 'title',
      });
  }

  static async getAllCourses(filters = {}, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let query = {};
    if (filters.category) query.category = filters.category;
    if (filters.level) query.level = filters.level;
    if (filters.instructor) query.instructor = filters.instructor;

    // Only show published courses
    query.status = 'published';

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    return {
      courses,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async getInstructorCourses(instructorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const courses = await Course.find({ instructor: instructorId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ instructor: instructorId });

    return {
      courses,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async deleteCourse(courseId, instructorId) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.instructor.toString() !== instructorId) {
      throw new AppError('Not authorized', 403);
    }

    // Delete related data
    await Module.deleteMany({ course: courseId });
    await Lesson.deleteMany({ course: courseId });
    await Enrollment.deleteMany({ course: courseId });

    await Course.findByIdAndDelete(courseId);

    return { message: 'Course deleted successfully' };
  }
}
