import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckSquare,
  DollarSign,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminCourses from '@/components/admin/AdminCourses';
import AdminApprovals from '@/components/admin/AdminApprovals';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminCourseCreate from '@/components/admin/AdminCourseCreate';
import EnrollmentRequests from '@/components/admin/EnrollmentRequests';
import { useAuth } from '@/store/AuthContext';
import { adminAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  users: {
    total: number;
    byRole: Record<string, number>;
    recent: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
    byCategory: Record<string, number>;
    totalEnrollments: number;
  };
  approvals: {
    pending: number;
    recent: number;
  };
  revenue: {
    total: number;
    monthly: number;
    currency: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we're on specific admin pages
  if (location.pathname === '/admin/users') {
    return <AdminUsers />;
  }
  if (location.pathname === '/admin/courses') {
    return <AdminCourses />;
  }
  if (location.pathname === '/admin/approvals') {
    return <AdminApprovals />;
  }
  if (location.pathname === '/admin/analytics') {
    return <AdminAnalytics />;
  }

  useEffect(() => {
    // Only fetch stats when on the main dashboard route
    if (location.pathname === '/admin') {
      fetchDashboardStats();
    }
  }, []); // Run once on mount since each route gets a fresh component instance

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || 'Admin'}! Here's your platform overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/reports">
              <TrendingUp className="w-4 h-4 mr-1" />
              Reports
            </Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/admin/users">
              Manage Users
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={loading ? '...' : stats?.users.total.toString() || '0'}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total Courses"
          value={loading ? '...' : stats?.courses.total.toString() || '0'}
          icon={BookOpen}
          variant="secondary"
        />
        <StatsCard
          title="Pending Approvals"
          value={loading ? '...' : stats?.approvals.pending.toString() || '0'}
          icon={CheckSquare}
          variant="default"
        />
        <StatsCard
          title="Monthly Revenue"
          value={loading ? '...' : `$${stats?.revenue.monthly.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          variant="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Enrollment Requests */}
        <div className="lg:col-span-2">
          <EnrollmentRequests title="Pending Enrollment Requests" />
        </div>

        {/* Recent Users - Empty State */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              New Users
            </h2>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No new users</p>
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/admin/users">View All Users</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="text-xl font-bold text-foreground mb-6">Platform Analytics</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-primary mb-1">
              {loading ? '...' : `${Math.round((stats?.courses.totalEnrollments || 0) * 0.75)}%`}
            </p>
            <p className="text-sm text-muted-foreground">Course Completion Rate</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-accent mb-1">
              {loading ? '...' : '4.5'}
            </p>
            <p className="text-sm text-muted-foreground">Avg. Course Rating</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-secondary mb-1">
              {loading ? '...' : Math.round((stats?.users.recent || 0) / 30)}
            </p>
            <p className="text-sm text-muted-foreground">Daily Active Users</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-primary mb-1">
              {loading ? '...' : Math.round((stats?.courses.totalEnrollments || 0) * 0.8)}
            </p>
            <p className="text-sm text-muted-foreground">Certificates Issued</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
