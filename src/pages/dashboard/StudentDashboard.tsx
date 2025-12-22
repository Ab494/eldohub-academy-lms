import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  Award, 
  Flame, 
  ArrowRight, 
  Calendar,
  CheckCircle2,
  FileText,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import CourseCard from '@/components/courses/CourseCard';
import { useAuth } from '@/store/AuthContext';
import { enrolledCourses, stats, recentActivity, upcomingDeadlines } from '@/data/mockData';
import { cn } from '@/lib/utils';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
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
          value={stats.student.coursesEnrolled}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Hours Learned"
          value={stats.student.hoursLearned}
          icon={Clock}
          variant="secondary"
        />
        <StatsCard
          title="Certificates Earned"
          value={stats.student.certificates}
          icon={Award}
          variant="accent"
        />
        <StatsCard
          title="Day Streak"
          value={stats.student.streak}
          icon={Flame}
          variant="primary"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Continue Learning</h2>
            <Button variant="ghost" asChild>
              <Link to="/dashboard/courses">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {enrolledCourses.slice(0, 2).map((course) => (
              <CourseCard key={course.id} course={course} variant="enrolled" />
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-card-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Deadlines
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    deadline.type === 'assignment' ? "bg-primary/10" : "bg-accent/10"
                  )}>
                    {deadline.type === 'assignment' ? (
                      <FileText className="w-4 h-4 text-primary" />
                    ) : (
                      <Trophy className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-card-foreground truncate">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {deadline.course}
                    </p>
                    <p className="text-xs font-medium text-primary mt-1">
                      Due: {new Date(deadline.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-bold text-card-foreground mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full gradient-success flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.course} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Recommended for You</h2>
          <Button variant="ghost" asChild>
            <Link to="/courses">
              Browse All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
