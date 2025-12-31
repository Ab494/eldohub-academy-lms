import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { courseAPI, instructorAPI } from '@/lib/apiClient';

interface CourseAnalytics {
  _id: string;
  title: string;
  status: 'draft' | 'published' | 'pending' | 'rejected';
  enrolledCount: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  lastActivity: string;
}

const InstructorAnalytics: React.FC = () => {
  const [courses, setCourses] = useState<CourseAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await instructorAPI.getAnalytics();
        const analyticsData = response.data?.courses || [];
        setCourses(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
        // Fallback to course list if analytics endpoint fails
        try {
          const response = await courseAPI.getInstructorCourses({ page: 1, limit: 50 });
          const courseData = response.data?.courses || [];
          setCourses(courseData);
        } catch (fallbackError) {
          console.error('Fallback fetch also failed', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      published: "default",
      pending: "secondary",
      rejected: "destructive",
      draft: "outline"
    };
    return variants[status] || "outline";
  };

  const totalStudents = courses.reduce((sum, course) => sum + course.enrolledCount, 0);
  const averageCompletion = courses.length > 0
    ? Math.round(courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length)
    : 0;
  const totalRevenue = courses.reduce((sum, course) => sum + course.totalRevenue, 0);

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCompletion}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Course Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Status Overview</CardTitle>
          <CardDescription>Track the approval status of your courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No courses created yet</p>
            ) : (
              courses.map((course) => (
                <div key={course._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(course.status)}
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.enrolledCount} students enrolled
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">Completion:</span>
                        <Progress value={course.completionRate} className="w-20 h-2" />
                        <span className="text-sm font-medium">{course.completionRate}%</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rating: {course.averageRating} ⭐
                      </div>
                    </div>

                    <Badge variant={getStatusBadge(course.status)}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Student enrollment over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Enrollment chart would go here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
            <CardDescription>Completion rates and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <div key={course._id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={course.completionRate} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{course.completionRate}%</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-medium">{course.enrolledCount}</p>
                    <p className="text-xs text-muted-foreground">students</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorAnalytics;