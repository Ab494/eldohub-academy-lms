import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star, 
  Plus,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/store/AuthContext';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Instructor'}! Here's your teaching overview.
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
          value={0}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          value={0}
          icon={Users}
          variant="secondary"
        />
        <StatsCard
          title="Total Revenue"
          value="$0"
          icon={DollarSign}
          variant="accent"
        />
        <StatsCard
          title="Average Rating"
          value="0.0"
          icon={Star}
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Courses List - Empty State */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Your Courses</h2>
          </div>

          <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Created</h3>
            <p className="text-muted-foreground mb-6">
              Start creating your first course and share your knowledge!
            </p>
            <Button variant="hero" asChild>
              <Link to="/instructor/create">
                <Plus className="w-4 h-4 mr-1" />
                Create Course
              </Link>
            </Button>
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
                <span className="font-semibold text-foreground">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Course Views</span>
                <span className="font-semibold text-foreground">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-semibold text-foreground">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-semibold text-foreground">$0</span>
              </div>
            </div>
          </div>

          {/* Recent Feedback - Empty State */}
          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <h3 className="font-bold text-card-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Recent Reviews
            </h3>
            <div className="text-center py-8">
              <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No reviews yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
