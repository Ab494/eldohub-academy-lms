import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  ClipboardCheck,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Settings,
  MoreVertical,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/store/AuthContext';
import InstructorCourseList from '@/components/instructor/InstructorCourseList';
import CourseBuilder from '@/components/instructor/CourseBuilder';
import AssignmentsGrading from '@/components/instructor/AssignmentsGrading';
import InstructorAnalytics from '@/components/instructor/InstructorAnalytics';
import EnrollmentRequests from '@/components/admin/EnrollmentRequests';
import { instructorAPI } from '@/lib/apiClient';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    courses: { total: 0, published: 0, draft: 0 },
    students: { total: 0 },
    analytics: { averageCompletion: 0, totalRevenue: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await instructorAPI.getDashboard();
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Sync activeTab with current route
    const path = location.pathname;
    if (path === '/instructor' || path === '/instructor/courses') {
      setActiveTab('overview');
    } else if (path === '/instructor/analytics') {
      setActiveTab('analytics');
    } else if (path === '/instructor/submissions') {
      setActiveTab('grading');
    }
  }, [location.pathname]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || 'Instructor'}! Here's your teaching overview.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/instructor/courses/create">
            <Plus className="w-4 h-4 mr-1" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Courses Created"
          value={dashboardData.courses.total}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          value={dashboardData.students.total}
          icon={Users}
          variant="secondary"
        />
        <StatsCard
          title="Draft Courses"
          value={dashboardData.courses.draft}
          icon={ClipboardCheck}
          variant="accent"
        />
        <StatsCard
          title="Avg. Completion"
          value={`${dashboardData.analytics.averageCompletion}%`}
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        // Navigate to corresponding route
        if (value === 'overview') {
          navigate('/instructor/courses');
        } else if (value === 'analytics') {
          navigate('/instructor/analytics');
        } else if (value === 'grading') {
          navigate('/instructor/submissions');
        }
      }} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            <BookOpen className="w-4 h-4 mr-2" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="data-[state=active]:bg-background">
            <UserCheck className="w-4 h-4 mr-2" />
            Enrollment Requests
          </TabsTrigger>
          <TabsTrigger value="builder" className="data-[state=active]:bg-background">
            <Settings className="w-4 h-4 mr-2" />
            Course Builder
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="grading" className="data-[state=active]:bg-background">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Assignments & Grading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InstructorCourseList />
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-6">
          <EnrollmentRequests title="Pending Enrollment Requests for Your Courses" />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <CourseBuilder />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <InstructorAnalytics />
        </TabsContent>

        <TabsContent value="grading" className="space-y-6">
          <AssignmentsGrading />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorDashboard;
