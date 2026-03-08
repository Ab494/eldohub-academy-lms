import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import DashboardSidebar from './DashboardSidebar';
import NotificationBell from '@/components/notifications/NotificationBell';
import { cn } from '@/lib/utils';
import { Loader2, Menu, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 border-b border-border bg-card/80 backdrop-blur-lg px-4 lg:hidden">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold text-foreground">
              Tech<span className="text-primary">Bridge</span>
            </span>
          </Link>
        </div>
        <NotificationBell />
      </header>

      {/* Desktop top bar (notification bell) */}
      <div
        className={cn(
          "hidden lg:flex items-center justify-end h-12 border-b border-border bg-card/80 backdrop-blur-lg px-6 sticky top-0 z-30 transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <NotificationBell />
      </div>

      <main 
        className={cn(
          "min-h-[calc(100vh-3rem)] transition-all duration-300",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64",
          "ml-0"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
