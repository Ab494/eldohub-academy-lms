import React, { useState, useCallback } from 'react';
import {
  LogIn,
  BookOpen,
  FileText,
  UserPlus,
  Award,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActivityEvent {
  id: string;
  type: 'login' | 'enrollment' | 'submission' | 'registration' | 'certificate';
  message: string;
  timestamp: string;
}

const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
  login: { icon: LogIn, color: 'text-blue-600 bg-blue-100' },
  enrollment: { icon: BookOpen, color: 'text-primary bg-primary/10' },
  submission: { icon: FileText, color: 'text-purple-600 bg-purple-100' },
  registration: { icon: UserPlus, color: 'text-accent bg-accent/10' },
  certificate: { icon: Award, color: 'text-amber-600 bg-amber-100' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 5) return 'Just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

const MAX_EVENTS = 50;

const AdminActivityFeed: React.FC = () => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  const pushEvent = useCallback((type: ActivityEvent['type'], message: string) => {
    const newEvent: ActivityEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev].slice(0, MAX_EVENTS));
  }, []);

  useSocket({
    'activity:login': (data: { userName: string }) => {
      pushEvent('login', `${data.userName} logged in`);
    },
    'activity:enrollment': (data: { userName: string; courseName: string }) => {
      pushEvent('enrollment', `${data.userName} enrolled in "${data.courseName}"`);
    },
    'activity:submission': (data: { userName: string; assignmentTitle: string }) => {
      pushEvent('submission', `${data.userName} submitted "${data.assignmentTitle}"`);
    },
    'activity:registration': (data: { userName: string }) => {
      pushEvent('registration', `${data.userName} registered`);
    },
    'activity:certificate': (data: { userName: string; courseName: string }) => {
      pushEvent('certificate', `${data.userName} earned certificate for "${data.courseName}"`);
    },
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-card">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Live Activity</h2>
        {events.length > 0 && (
          <span className="ml-auto relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
        )}
      </div>

      <ScrollArea className="h-72">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Activity className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Waiting for live events…
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Login, enrollment, and submission events will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => {
              const config = typeConfig[event.type] || typeConfig.login;
              const Icon = config.icon;
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 px-5 py-3 animate-fade-in"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      config.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">
                      {event.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {timeAgo(event.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default AdminActivityFeed;
