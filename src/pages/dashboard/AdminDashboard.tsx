import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckSquare, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/store/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Admin'}! Here's your platform overview.
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
          value={0}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total Courses"
          value={0}
          icon={BookOpen}
          variant="secondary"
        />
        <StatsCard
          title="Pending Approvals"
          value={0}
          icon={CheckSquare}
          variant="default"
        />
        <StatsCard
          title="Monthly Revenue"
          value="$0"
          icon={DollarSign}
          variant="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals - Empty State */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Pending Approvals
            </h2>
          </div>

          <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
            <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Approvals</h3>
            <p className="text-muted-foreground">
              All course submissions have been reviewed.
            </p>
          </div>
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
            <p className="text-3xl font-bold text-primary mb-1">0%</p>
            <p className="text-sm text-muted-foreground">Course Completion Rate</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-accent mb-1">0.0</p>
            <p className="text-sm text-muted-foreground">Avg. Course Rating</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-secondary mb-1">0</p>
            <p className="text-sm text-muted-foreground">Daily Active Users</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-primary mb-1">0</p>
            <p className="text-sm text-muted-foreground">Certificates Issued</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
