import React, { useState } from 'react';
import { Send, Megaphone, Users, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { notificationAPI } from '@/lib/apiClient';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Users', icon: Users },
  { value: 'student', label: 'Students Only', icon: Users },
  { value: 'instructor', label: 'Instructors Only', icon: Users },
  { value: 'admin', label: 'Admins Only', icon: Users },
];

const AdminAnnouncements: React.FC = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientRole, setRecipientRole] = useState('all');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: 'Validation Error', description: 'Title and message are required.', variant: 'destructive' });
      return;
    }
    if (title.trim().length > 200) {
      toast({ title: 'Validation Error', description: 'Title must be under 200 characters.', variant: 'destructive' });
      return;
    }
    if (message.trim().length > 2000) {
      toast({ title: 'Validation Error', description: 'Message must be under 2000 characters.', variant: 'destructive' });
      return;
    }

    try {
      setSending(true);
      const payload: { title: string; message: string; recipientRole?: string; link?: string } = {
        title: title.trim(),
        message: message.trim(),
      };
      if (recipientRole !== 'all') payload.recipientRole = recipientRole;
      if (link.trim()) payload.link = link.trim();

      const response = await notificationAPI.sendAnnouncement(payload);
      toast({ title: 'Sent!', description: response.message || 'Announcement sent successfully.' });
      setSent(true);
      setTimeout(() => {
        setTitle('');
        setMessage('');
        setLink('');
        setRecipientRole('all');
        setSent(false);
      }, 2000);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to send announcement.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-7 h-7 text-primary" />
          Send Announcement
        </h1>
        <p className="text-muted-foreground mt-1">
          Compose and send notifications to users across the platform.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card max-w-2xl">
        <div className="space-y-5">
          {/* Recipient Role */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Send To</Label>
            <Select value={recipientRole} onValueChange={setRecipientRole}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. New Course Available!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/200</p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
          </div>

          {/* Optional Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <Input
              id="link"
              placeholder="e.g. /courses or https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          {/* Send Button */}
          <Button
            variant="hero"
            className="w-full sm:w-auto"
            onClick={handleSend}
            disabled={sending || sent || !title.trim() || !message.trim()}
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
            ) : sent ? (
              <><CheckCircle className="w-4 h-4 mr-2" /> Sent!</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Send Announcement</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
