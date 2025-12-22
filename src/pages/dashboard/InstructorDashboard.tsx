import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star, 
  ArrowRight, 
  Plus,
  TrendingUp,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/store/AuthContext';
import { stats, courses } from '@/data/mockData';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();

  const instructorCourses = courses.slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Here's your teaching overview.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/instructor/create">
            <Plus className="w-4 h-4 mr-1" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={stats.instructor.totalCourses}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          value={stats.instructor.totalStudents.toLocaleString()}
          icon={Users}
          variant="secondary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.instructor.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          variant="accent"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Average Rating"
          value={stats.instructor.avgRating}
          icon={Star}
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Your Courses</h2>
            <Button variant="ghost" asChild>
              <Link to="/instructor/courses">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="divide-y divide-border">
              {instructorCourses.map((course) => (
                <div 
                  key={course.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-20 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground truncate">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.students.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-primary fill-primary" />
                          {course.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/instructor/course/${course.id}/analytics`}>
                          <TrendingUp className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/instructor/course/${course.id}/edit`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-bold text-card-foreground mb-4">This Month</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Enrollments</span>
                <span className="font-semibold text-accent">+234</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Course Views</span>
                <span className="font-semibold text-foreground">12.4K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-semibold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-semibold text-accent">$4,520</span>
              </div>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recent Reviews
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-primary fill-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-card-foreground line-clamp-2">
                    "Excellent course! The instructor explains concepts clearly..."
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    - Student {i} • 2 days ago
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
