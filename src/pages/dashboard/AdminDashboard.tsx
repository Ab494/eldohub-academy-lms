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
  Clock,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/store/AuthContext';
import { stats } from '@/data/mockData';
import { cn } from '@/lib/utils';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const pendingApprovals = [
    { id: '1', title: 'Advanced Node.js Course', instructor: 'John Doe', date: '2024-01-10', type: 'course' },
    { id: '2', title: 'React Native Mastery', instructor: 'Jane Smith', date: '2024-01-11', type: 'course' },
    { id: '3', title: 'DevOps Fundamentals', instructor: 'Bob Wilson', date: '2024-01-12', type: 'course' },
  ];

  const recentUsers = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'student', joined: '2 hours ago' },
    { id: '2', name: 'Mark Williams', email: 'mark@example.com', role: 'instructor', joined: '5 hours ago' },
    { id: '3', name: 'Sarah Davis', email: 'sarah@example.com', role: 'student', joined: '1 day ago' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Here's your platform overview.
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
          value={stats.admin.totalUsers.toLocaleString()}
          icon={Users}
          variant="primary"
          trend={{ value: 15, isPositive: true }}
        />
        <StatsCard
          title="Total Courses"
          value={stats.admin.totalCourses}
          icon={BookOpen}
          variant="secondary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Pending Approvals"
          value={stats.admin.pendingApprovals}
          icon={CheckSquare}
          variant="default"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.admin.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          variant="accent"
          trend={{ value: 22, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Pending Approvals
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/admin/approvals">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="divide-y divide-border">
              {pendingApprovals.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>by {item.instructor}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Submitted {item.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                      <Button variant="success" size="sm">
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              New Users
            </h2>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 shadow-card">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full capitalize",
                      user.role === 'instructor' ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                    )}>
                      {user.role}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.joined}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link to="/admin/users">
                View All Users
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <h2 className="text-xl font-bold text-foreground mb-6">Platform Analytics</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-primary mb-1">89%</p>
            <p className="text-sm text-muted-foreground">Course Completion Rate</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-accent mb-1">4.8</p>
            <p className="text-sm text-muted-foreground">Avg. Course Rating</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-secondary mb-1">2.5K</p>
            <p className="text-sm text-muted-foreground">Daily Active Users</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-3xl font-bold text-primary mb-1">340</p>
            <p className="text-sm text-muted-foreground">Certificates Issued</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
