import React, { useState, useEffect } from 'react';
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
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { notificationAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

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

const typeLabels: Record<string, string> = {
  enrollment_approved: 'Enrollment',
  enrollment_rejected: 'Enrollment',
  new_enrollment_request: 'New Enrollment',
  new_course_content: 'Course Update',
  assignment_graded: 'Assignment',
  certificate_issued: 'Certificate',
  announcement: 'Announcement',
  system: 'System',
};

const NotificationsPage: React.FC = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async (p = 1) => {
    try {
      setLoading(true);
      const res = await notificationAPI.getNotifications({ page: String(p), limit: '20' });
      if (res.success) {
        setNotifications(res.data.notifications || []);
        setTotalPages(res.data.pages || 1);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load notifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
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
      toast({ title: 'Done', description: 'All notifications marked as read' });
    } catch {
      toast({ title: 'Error', description: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast({ title: 'Deleted', description: 'Notification removed' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const displayed = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5 self-start">
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
          className="gap-1.5"
        >
          Unread
          {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'unread'
              ? 'You\'ve read all your notifications.'
              : 'Notifications will appear here when you receive enrollment updates, announcements, and more.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((notif) => {
            const Icon = typeIcons[notif.type] || Info;
            const colorClass = typeColors[notif.type] || typeColors.system;
            const label = typeLabels[notif.type] || 'Notification';

            return (
              <div
                key={notif._id}
                className={cn(
                  'bg-card rounded-lg border border-border p-4 shadow-card flex items-start gap-4 transition-colors',
                  !notif.isRead && 'border-primary/30 bg-primary/5'
                )}
              >
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', colorClass)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{label}</span>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary" />}
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={cn('font-medium mt-1', !notif.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {notif.link && (
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <Link to={notif.link}>View</Link>
                      </Button>
                    )}
                    {!notif.isRead && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMarkAsRead(notif._id)}>
                        <Check className="w-3.5 h-3.5" />
                        Mark read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive gap-1 ml-auto" onClick={() => handleDelete(notif._id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
