import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Settings, 
  HelpCircle,
  GraduationCap,
  Users,
  BarChart3,
  FileText,
  CheckSquare,
  Award,
  PlusCircle,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, UserRole } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Student items
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['student'] },
  { icon: BookOpen, label: 'My Courses', href: '/dashboard/courses', roles: ['student'] },
  { icon: Trophy, label: 'Achievements', href: '/dashboard/achievements', roles: ['student'] },
  { icon: FileText, label: 'Assignments', href: '/dashboard/assignments', roles: ['student'] },
  { icon: Award, label: 'Certificates', href: '/dashboard/certificates', roles: ['student'] },
  
  // Instructor items
  { icon: LayoutDashboard, label: 'Dashboard', href: '/instructor', roles: ['instructor'] },
  { icon: BookOpen, label: 'My Courses', href: '/instructor/courses', roles: ['instructor'] },
  { icon: PlusCircle, label: 'Create Course', href: '/instructor/courses/create', roles: ['instructor'] },
  { icon: ClipboardList, label: 'Submissions', href: '/instructor/submissions', roles: ['instructor'] },
  { icon: BarChart3, label: 'Analytics', href: '/instructor/analytics', roles: ['instructor'] },
  
  // Admin items
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', roles: ['admin'] },
  { icon: Users, label: 'Users', href: '/admin/users', roles: ['admin'] },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses', roles: ['admin'] },
  { icon: CheckSquare, label: 'Approvals', href: '/admin/approvals', roles: ['admin'] },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', roles: ['admin'] },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '/settings', roles: ['student', 'instructor', 'admin'] },
  { icon: HelpCircle, label: 'Help', href: '/help', roles: ['student', 'instructor', 'admin'] },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userRole = user?.role || 'student';

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));
  const filteredBottomItems = bottomNavItems.filter(item => item.roles.includes(userRole));

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-sidebar-foreground">
                ELDO<span className="text-sidebar-primary">HUB</span>
              </span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                    )} />
                    {!collapsed && (
                      <span className={cn(
                        "font-medium",
                        isActive ? "text-primary-foreground" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                      )}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Nav */}
        <div className="border-t border-sidebar-border py-4 px-2">
          <ul className="space-y-1">
            {filteredBottomItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                    )} />
                    {!collapsed && (
                      <span className={cn(
                        "font-medium",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                      )}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
            <li>
               <button
                 onClick={logout}
                 className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all duration-200 group"
               >
                 <LogOut className="w-5 h-5 shrink-0 group-hover:text-destructive" />
                 {!collapsed && <span className="font-medium group-hover:text-destructive">Logout</span>}
               </button>
             </li>
          </ul>
        </div>

        {/* User Profile */}
        {!collapsed && user && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
