import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getInstructorDashboard = asyncHandler(async (req, res) => {
  const instructorId = req.userId;

  // Get course statistics
  const courses = await Course.find({ instructor: instructorId });
  const publishedCourses = courses.filter(course => course.status === 'published');
  const draftCourses = courses.filter(course => course.status === 'draft');

  // Get enrollment statistics
  const courseIds = courses.map(course => course._id);
  const enrollments = await Enrollment.find({ course: { $in: courseIds } });

  // Calculate total students and revenue
  const totalStudents = enrollments.length;
  const totalRevenue = enrollments.reduce((sum, enrollment) => {
    const course = courses.find(c => c._id.toString() === enrollment.course.toString());
    return sum + (course?.price || 0);
  }, 0);

  // Calculate completion rates
  const completionRates = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.course.toString() === course._id.toString());
    if (courseEnrollments.length === 0) return 0;

    // Mock completion calculation - in real app this would come from progress tracking
    return Math.floor(Math.random() * 100);
  });

  const averageCompletion = completionRates.length > 0
    ? Math.round(completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      courses: {
        total: courses.length,
        published: publishedCourses.length,
        draft: draftCourses.length,
      },
      students: {
        total: totalStudents,
      },
      analytics: {
        averageCompletion,
        totalRevenue,
      },
      recentCourses: courses.slice(0, 5).map(course => ({
        _id: course._id,
        title: course.title,
        status: course.status,
        enrolledCount: enrollments.filter(e => e.course.toString() === course._id.toString()).length,
        createdAt: course.createdAt,
      })),
    },
  });
});

export const getInstructorAnalytics = asyncHandler(async (req, res) => {
  const instructorId = req.userId;

  // Get all instructor courses with enrollment data
  const courses = await Course.find({ instructor: instructorId });
  const courseIds = courses.map(course => course._id);

  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('student', 'firstName lastName email')
    .populate('course', 'title price');

  // Group enrollments by course
  const courseAnalytics = courses.map(course => {
    const courseEnrollments = enrollments.filter(e => e.course._id.toString() === course._id.toString());

    return {
      _id: course._id,
      title: course.title,
      status: course.status,
      enrolledCount: courseEnrollments.length,
      completionRate: Math.floor(Math.random() * 100), // Mock data
      averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // Mock data
      totalRevenue: courseEnrollments.reduce((sum, e) => sum + (course.price || 0), 0),
      lastActivity: course.updatedAt,
      students: courseEnrollments.map(e => ({
        _id: e.student._id,
        name: `${e.student.firstName} ${e.student.lastName}`,
        email: e.student.email,
        enrolledAt: e.enrolledAt,
        progress: Math.floor(Math.random() * 100), // Mock data
      })),
    };
  });

  res.status(200).json({
    success: true,
    data: {
      courses: courseAnalytics,
      summary: {
        totalCourses: courses.length,
        totalStudents: enrollments.length,
        totalRevenue: courseAnalytics.reduce((sum, course) => sum + course.totalRevenue, 0),
        averageRating: courseAnalytics.length > 0
          ? parseFloat((courseAnalytics.reduce((sum, course) => sum + course.averageRating, 0) / courseAnalytics.length).toFixed(1))
          : 0,
      },
    },
  });
});