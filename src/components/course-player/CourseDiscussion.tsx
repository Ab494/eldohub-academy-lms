import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  Shield,
  Reply,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { discussionAPI } from '@/lib/apiClient';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Author {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  isInstructor: boolean;
  likesCount: number;
  likes: string[];
  repliesCount: number;
  createdAt: string;
}

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

function initials(author: Author) {
  return `${author.firstName?.[0] || ''}${author.lastName?.[0] || ''}`.toUpperCase();
}

interface CourseDiscussionProps {
  courseId: string;
}

const CourseDiscussion: React.FC<CourseDiscussionProps> = ({ courseId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await discussionAPI.getPosts(courseId, { page: String(p), limit: '15' });
      if (res.success) {
        setPosts(res.data.posts);
        setTotalPages(res.data.pages);
        setPage(res.data.currentPage);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load discussions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    try {
      setSubmitting(true);
      const res = await discussionAPI.createPost(courseId, { content: newPost.trim() });
      if (res.success) {
        setPosts((prev) => [res.data, ...prev]);
        setNewPost('');
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to post', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compose */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-card">
        <div className="flex items-start gap-3">
          <Avatar className="w-9 h-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Ask a question or share your thoughts…"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              maxLength={5000}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{newPost.length}/5000</p>
              <Button
                size="sm"
                onClick={handleSubmitPost}
                disabled={submitting || !newPost.trim()}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No discussions yet</p>
          <p className="text-sm text-muted-foreground mt-1">Be the first to start a conversation!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              courseId={courseId}
              currentUserId={user?._id}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchPosts(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchPosts(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Individual Post Card ── */

interface PostCardProps {
  post: Post;
  courseId: string;
  currentUserId?: string;
  onDelete: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, courseId, currentUserId, onDelete }) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(currentUserId ? post.likes?.includes(currentUserId) : false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Post[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [repliesCount, setRepliesCount] = useState(post.repliesCount);

  const handleLike = async () => {
    try {
      const res = await discussionAPI.toggleLike(courseId, post._id);
      if (res.success) {
        setLiked(res.data.liked);
        setLikesCount(res.data.likesCount);
      }
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    try {
      await discussionAPI.deletePost(courseId, post._id);
      onDelete(post._id);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const loadReplies = async () => {
    if (replies.length > 0) {
      setShowReplies(!showReplies);
      return;
    }
    try {
      setLoadingReplies(true);
      const res = await discussionAPI.getReplies(courseId, post._id);
      if (res.success) {
        setReplies(res.data);
        setShowReplies(true);
      }
    } catch {
      // silent
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      setSubmittingReply(true);
      const res = await discussionAPI.createPost(courseId, {
        content: replyText.trim(),
        parentPostId: post._id,
      });
      if (res.success) {
        setReplies((prev) => [...prev, res.data]);
        setRepliesCount((prev) => prev + 1);
        setReplyText('');
        setShowReplies(true);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to reply', variant: 'destructive' });
    } finally {
      setSubmittingReply(false);
    }
  };

  const isOwn = currentUserId === post.author._id;

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-card">
      {/* Author header */}
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 shrink-0">
          <AvatarFallback
            className={cn(
              'text-sm font-semibold',
              post.isInstructor ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            {initials(post.author)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground">
              {post.author.firstName} {post.author.lastName}
            </span>
            {post.isInstructor && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                <Shield className="w-3 h-3" /> Instructor
              </span>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
          </div>
          <p className="text-sm text-foreground mt-1.5 whitespace-pre-wrap break-words">{post.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1 text-xs font-medium transition-colors',
                liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {likesCount > 0 && likesCount}
            </button>

            <button
              onClick={loadReplies}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {loadingReplies ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Reply className="w-3.5 h-3.5" />
              )}
              {repliesCount > 0 ? `${repliesCount} replies` : 'Reply'}
              {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {isOwn && (
              <button onClick={handleDelete} className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="mt-4 ml-12 space-y-3 border-l-2 border-border pl-4">
          {replies.map((reply) => (
            <div key={reply._id} className="flex items-start gap-2">
              <Avatar className="w-7 h-7 shrink-0">
                <AvatarFallback className={cn('text-[10px] font-semibold', reply.isInstructor ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>
                  {initials(reply.author)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-foreground">{reply.author.firstName} {reply.author.lastName}</span>
                  {reply.isInstructor && (
                    <span className="text-[9px] font-bold uppercase text-primary">Instructor</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                </div>
                <p className="text-xs text-foreground mt-0.5 whitespace-pre-wrap break-words">{reply.content}</p>
              </div>
            </div>
          ))}

          {/* Reply input */}
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="Write a reply…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              maxLength={5000}
              className="resize-none text-sm"
            />
            <Button size="sm" onClick={handleReply} disabled={submittingReply || !replyText.trim()}>
              {submittingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDiscussion;
