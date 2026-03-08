import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  instructor: string;
  duration?: number | null;
  students: number;
  rating?: number | null;
  ratingCount?: number;
  progress?: number;
  category: string;
  level: string;
  price?: number | null;
}

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'enrolled';
  enrollmentStatus?: string | null;
  enrolling?: boolean;
  onEnroll?: () => void;
  isStudent?: boolean;
}

const levelStyles: Record<string, string> = {
  beginner: 'bg-accent/15 text-accent border-accent/20',
  intermediate: 'bg-primary/15 text-primary border-primary/20',
  advanced: 'bg-destructive/15 text-destructive border-destructive/20',
};

const categoryColors: Record<string, string> = {
  'Web Development': 'from-primary/80 to-primary',
  'Data Science': 'from-accent/80 to-accent',
  'Mobile Development': 'from-destructive/80 to-destructive',
  'Design': 'from-ring to-primary',
  default: 'from-secondary to-secondary/80',
};

const formatDuration = (mins?: number | null) => {
  if (!mins || mins <= 0) return null;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}`.trim() : `${m}m`;
};

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  variant = 'default',
  enrollmentStatus,
  enrolling,
  onEnroll,
  isStudent,
}) => {
  const isEnrolled = variant === 'enrolled' || enrollmentStatus === 'active';
  const levelKey = course.level?.toLowerCase() || 'beginner';
  const durationStr = formatDuration(course.duration as number);
  const hasRating = (course.ratingCount ?? 0) > 0 && (course.rating ?? 0) > 0;
  const gradientClass = categoryColors[course.category] || categoryColors.default;

  const cardLink = isEnrolled ? `/course/${course.id}` : `/courses/${course.id}`;

  return (
    <Link to={cardLink} className="block group">
      <div className="bg-card rounded-xl border border-border shadow-card hover:shadow-medium hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover group-hover:brightness-110 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br flex flex-col items-center justify-center p-4', gradientClass)}>
              <span className="text-sm font-bold text-white/70 uppercase tracking-wider mb-1">{course.category}</span>
              <span className="text-lg font-extrabold text-white text-center leading-tight line-clamp-2">{course.title}</span>
            </div>
          )}

          {/* Level badge */}
          <Badge className={cn('absolute top-3 left-3 text-xs font-bold capitalize border', levelStyles[levelKey] || levelStyles.beginner)}>
            {course.level}
          </Badge>

          {/* Enrollment status badge */}
          {enrollmentStatus && (
            <Badge
              className={cn(
                'absolute top-3 right-3 text-xs font-semibold',
                enrollmentStatus === 'active' && 'bg-accent/90 text-accent-foreground',
                enrollmentStatus === 'pending_approval' && 'bg-primary/90 text-primary-foreground',
                enrollmentStatus === 'rejected' && 'bg-destructive/90 text-destructive-foreground',
              )}
            >
              {enrollmentStatus === 'active' ? 'Enrolled' : enrollmentStatus === 'pending_approval' ? 'Pending' : enrollmentStatus === 'rejected' ? 'Rejected' : enrollmentStatus}
            </Badge>
          )}

          {/* Price badge */}
          <div className="absolute bottom-3 right-3">
            {course.price && course.price > 0 ? (
              <Badge className="bg-card/90 text-card-foreground backdrop-blur-sm text-sm font-extrabold border-0 px-2.5 py-1">
                ₦{course.price.toLocaleString()}
              </Badge>
            ) : (
              <Badge className="bg-accent/90 text-accent-foreground text-sm font-bold border-0 px-2.5 py-1">
                Free
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1.5">
            {course.category}
          </p>

          <h3 className="text-lg font-bold text-card-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {course.description}
          </p>

          <p className="text-sm text-muted-foreground mb-3">
            by {course.instructor}
          </p>

          {isEnrolled && course.progress !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-accent">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 mt-auto">
            {durationStr && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{durationStr}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.students.toLocaleString()}</span>
            </div>
            {hasRating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-medium text-foreground">{course.rating!.toFixed(1)}</span>
                <span className="text-xs">({course.ratingCount})</span>
              </div>
            )}
          </div>

          {/* CTA */}
          {isEnrolled ? (
            <Button variant="default" className="w-full" asChild>
              <span>Continue Learning</span>
            </Button>
          ) : enrollmentStatus === 'pending_approval' ? (
            <Button variant="outline" className="w-full" disabled>
              Awaiting Approval
            </Button>
          ) : isStudent && onEnroll ? (
            <Button
              className="w-full"
              onClick={(e) => { e.preventDefault(); onEnroll(); }}
              disabled={enrolling}
            >
              {enrolling ? 'Enrolling...' : 'Enroll Now'}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <span>Enroll Now</span>
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
};

/** Placeholder card for "More courses coming soon" */
export const ComingSoonCard: React.FC = () => (
  <div className="rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center p-8 text-center min-h-[320px]">
    <Rocket className="w-10 h-10 text-muted-foreground mb-3" />
    <h3 className="text-lg font-semibold text-muted-foreground mb-1">More Courses Coming Soon</h3>
    <p className="text-sm text-muted-foreground">We're working on new content. Stay tuned!</p>
  </div>
);

export default CourseCard;
