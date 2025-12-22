import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  progress?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface CourseCardProps {
  course: Course;
  variant?: 'default' | 'enrolled';
}

const CourseCard: React.FC<CourseCardProps> = ({ course, variant = 'default' }) => {
  const isEnrolled = variant === 'enrolled';

  return (
    <div className="group bg-card rounded-xl border border-border shadow-card hover:shadow-medium transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
            <PlayCircle className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Level badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold",
          course.level === 'Beginner' && "bg-accent text-accent-foreground",
          course.level === 'Intermediate' && "bg-primary text-primary-foreground",
          course.level === 'Advanced' && "bg-secondary text-secondary-foreground"
        )}>
          {course.level}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
          {course.category}
        </p>

        {/* Title */}
        <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-muted-foreground mb-4">
          by {course.instructor}
        </p>

        {/* Progress bar (for enrolled courses) */}
        {isEnrolled && course.progress !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-accent">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="font-medium text-foreground">{course.rating}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant={isEnrolled ? "default" : "outline"} 
          className="w-full"
          asChild
        >
          <Link to={`/course/${course.id}`}>
            {isEnrolled ? 'Continue Learning' : 'View Course'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
