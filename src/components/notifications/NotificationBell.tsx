import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  BookOpen,
  XCircle,
  FileText,
  Award,
  Megaphone,
  Info,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { notificationAPI } from '@/lib/apiClient';
import { useAuth } from '@/store/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
  enrollment_approved: CheckCheck,
  enrollment_rejected: XCircle,
  new_enrollment_request: BookOpen,
  new_course_content: BookOpen,
  assignment_graded: FileText,
  certificate_issued: Award,
  announcement: Megaphone,
  system: Info,
};

const typeColors: Record<string, string> = {
  enrollment_approved: 'text-green-600 bg-green-100',
  enrollment_rejected: 'text-red-600 bg-red-100',
  new_enrollment_request: 'text-orange-600 bg-orange-100',
  new_course_content: 'text-blue-600 bg-blue-100',
  assignment_graded: 'text-purple-600 bg-purple-100',
  certificate_issued: 'text-amber-600 bg-amber-100',
  announcement: 'text-primary bg-primary/10',
  system: 'text-muted-foreground bg-muted',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const NotificationBell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res.success) setUnreadCount(res.data.unreadCount);
    } catch {
      // silent
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications({ limit: '10' });
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Autoplay may be blocked by browser
      });
    } catch {
      // Silent fail
    }
  }, []);

  // Listen for real-time notifications via WebSocket
  useSocket({
    'notification:new': (data: any) => {
      // If it's a single notification object, prepend it
      if (data && data._id) {
        setNotifications((prev) => [data, ...prev].slice(0, 20));
        setUnreadCount((prev) => prev + 1);
        playNotificationSound();
        toast({ title: data.title, description: data.message });
      } else {
        // Bulk notification – just refresh the count
        fetchUnreadCount();
        playNotificationSound();
      }
    },
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fetch full list when popover opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-7 gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = typeIcons[notif.type] || Info;
              const colorClass = typeColors[notif.type] || typeColors.system;
              const content = (
                <div
                  key={notif._id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0',
                    !notif.isRead && 'bg-primary/5'
                  )}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                >
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm font-medium truncate', !notif.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              );

              return notif.link ? (
                <Link key={notif._id} to={notif.link} onClick={() => setOpen(false)}>
                  {content}
                </Link>
              ) : (
                <div key={notif._id}>{content}</div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild onClick={() => setOpen(false)}>
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
