import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  Flame,
  ArrowRight,
  Calendar,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import EnrolledCourseCard from '@/components/dashboard/EnrolledCourseCard';
import { useAuth } from '@/store/AuthContext';
import { enrollmentAPI, certificateAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructor: {
      firstName: string;
      lastName: string;
    };
  };
  progressPercentage: number;
  status: string;
  enrollmentDate: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    hoursLearned: 0,
    certificatesEarned: 0,
    dayStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch enrollments
      const enrollmentsResponse = await enrollmentAPI.getMyEnrollments();
      if (enrollmentsResponse.success) {
        const enrollmentData = enrollmentsResponse.data.enrollments || [];
        setEnrollments(enrollmentData);

        // Calculate stats
        const coursesEnrolled = enrollmentData.length;
        const completedCourses = enrollmentData.filter((e: Enrollment) => e.status === 'completed').length;
        const totalProgress = enrollmentData.reduce((sum: number, e: Enrollment) => sum + e.progressPercentage, 0);
        const avgProgress = coursesEnrolled > 0 ? Math.round(totalProgress / coursesEnrolled) : 0;

        // For now, we'll use placeholder values for hours and streak
        // In a real implementation, these would come from backend calculations
        setStats({
          coursesEnrolled,
          hoursLearned: Math.round(avgProgress * 0.5), // Placeholder calculation
          certificatesEarned: completedCourses,
          dayStreak: Math.min(7, Math.floor(avgProgress / 15)), // Placeholder
        });
      }

      // Fetch certificates for accurate count
      try {
        const certificatesResponse = await certificateAPI.getMyCertificates();
        if (certificatesResponse.success) {
          setStats(prev => ({
            ...prev,
            certificatesEarned: certificatesResponse.data.length || 0,
          }));
        }
      } catch (error) {
        // Certificates might not be implemented yet, continue
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName || 'Student'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Continue your learning journey where you left off
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/courses">
            Explore Courses
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Courses Enrolled"
          value={loading ? '...' : stats.coursesEnrolled.toString()}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Hours Learned"
          value={loading ? '...' : `${stats.hoursLearned}h`}
          icon={Clock}
          variant="secondary"
        />
        <StatsCard
          title="Certificates Earned"
          value={loading ? '...' : stats.certificatesEarned.toString()}
          icon={Award}
          variant="accent"
        />
        <StatsCard
          title="Day Streak"
          value={loading ? '...' : `${stats.dayStreak} days`}
          icon={Flame}
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
            {enrollments.length > 0 && (
              <Button variant="ghost" asChild>
                <Link to="/courses">Browse More Courses</Link>
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't enrolled in any courses yet. Start learning today!
              </p>
              <Button variant="hero" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <EnrolledCourseCard
                  key={enrollment._id}
                  course={{
                    _id: enrollment.course._id,
                    title: enrollment.course.title,
                    thumbnail: enrollment.course.thumbnail,
                    instructor: enrollment.course.instructor,
                    progressPercentage: enrollment.progressPercentage,
                    status: enrollment.status,
                    enrollmentDate: enrollment.enrollmentDate,
                  }}
                  onContinue={handleContinueCourse}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-card-foreground">Upcoming Deadlines</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Assignments and quizzes will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.course} • Due {deadline.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-bold text-card-foreground mb-4">Recent Activity</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your learning progress will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment._id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {enrollment.progressPercentage > 0
                          ? `Continuing ${enrollment.course.title}`
                          : `Started ${enrollment.course.title}`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {enrollment.progressPercentage}% complete • {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {enrollments.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View All Activity
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
