import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getUserStats = asyncHandler(async (req, res) => {
  // Count total users (all roles)
  const totalUsers = await User.countDocuments();

  // Count users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $count: {} }
      }
    }
  ]);

  // Get recent users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.status(200).json({
    success: true,
    data: {
      total: totalUsers,
      byRole: usersByRole.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      recent: recentUsers
    }
  });
});

export const getCourseStats = asyncHandler(async (req, res) => {
  // Count total courses
  const totalCourses = await Course.countDocuments();

  // Count published vs draft courses
  const publishedCourses = await Course.countDocuments({ status: 'published' });
  const draftCourses = await Course.countDocuments({ status: 'draft' });

  // Count courses by category
  const coursesByCategory = await Course.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $count: {} }
      }
    }
  ]);

  // Get total enrollments across all courses
  const totalEnrollments = await Enrollment.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      total: totalCourses,
      published: publishedCourses,
      draft: draftCourses,
      byCategory: coursesByCategory.reduce((acc, category) => {
        acc[category._id] = category.count;
        return acc;
      }, {}),
      totalEnrollments
    }
  });
});

export const getApprovalStats = asyncHandler(async (req, res) => {
  // For now, we'll count courses pending approval (draft status)
  // In a real system, this might be courses submitted for review
  const pendingApprovals = await Course.countDocuments({ status: 'draft' });

  // Count recently submitted courses (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSubmissions = await Course.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  res.status(200).json({
    success: true,
    data: {
      pending: pendingApprovals,
      recent: recentSubmissions
    }
  });
});

export const getRevenueStats = asyncHandler(async (req, res) => {
  // For now, calculate potential revenue from enrollments
  // In a real system, this would track actual payments
  const paidEnrollments = await Enrollment.countDocuments();

  // Assume average course price (this would come from course pricing)
  const averagePrice = 49.99; // Placeholder
  const totalRevenue = paidEnrollments * averagePrice;

  // Monthly revenue (simplified)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyEnrollments = await Enrollment.countDocuments({
    createdAt: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lt: new Date(currentYear, currentMonth + 1, 1)
    }
  });

  const monthlyRevenue = monthlyEnrollments * averagePrice;

  res.status(200).json({
    success: true,
    data: {
      total: totalRevenue,
      monthly: monthlyRevenue,
      currency: 'USD'
    }
  });
});

export const getAllCoursesForAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, category, instructor } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  if (status && status !== 'all') query.status = status;
  if (category) query.category = category;
  if (instructor) query.instructor = instructor;

  const courses = await Course.find(query)
    .populate('instructor', 'firstName lastName email')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  // Add enrollment count for each course
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      const enrollmentCount = await Enrollment.countDocuments({ course: course._id });
      return {
        ...course.toObject(),
        enrollmentCount
      };
    })
  );

  const total = await Course.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      courses: coursesWithCounts,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    }
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  // Get all stats in one call for dashboard efficiency
  const [
    totalUsers,
    usersByRole,
    recentUsers,
    totalCourses,
    publishedCourses,
    draftCourses,
    coursesByCategory,
    totalEnrollments,
    pendingApprovals,
    recentSubmissions,
    paidEnrollments,
    monthlyEnrollments
  ] = await Promise.all([
    // User stats
    User.countDocuments(),
    User.aggregate([{ $group: { _id: '$role', count: { $count: {} } } }]),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30*24*60*60*1000) } }),

    // Course stats
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Course.countDocuments({ status: 'draft' }),
    Course.aggregate([{ $group: { _id: '$category', count: { $count: {} } } }]),
    Enrollment.countDocuments(),

    // Approval stats
    Course.countDocuments({ status: 'draft' }),
    Course.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } }),

    // Revenue stats
    Enrollment.countDocuments(),
    Enrollment.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      }
    })
  ]);

  // Process the results
  const averagePrice = 49.99;
  const stats = {
    users: {
      total: totalUsers,
      byRole: usersByRole.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      recent: recentUsers
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      draft: draftCourses,
      byCategory: coursesByCategory.reduce((acc, category) => {
        acc[category._id] = category.count;
        return acc;
      }, {}),
      totalEnrollments
    },
    approvals: {
      pending: pendingApprovals,
      recent: recentSubmissions
    },
    revenue: {
      total: paidEnrollments * averagePrice,
      monthly: monthlyEnrollments * averagePrice,
      currency: 'USD'
    }
  };

  res.status(200).json({
    success: true,
    data: stats
  });
});