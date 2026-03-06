import React from 'react';
import { BookOpen, Users, Clock, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CourseWelcomeProps {
  course: any;
  modulesCount: number;
  totalLessons: number;
  progress: { completed: number; total: number; percentage: number };
  onContinueLearning: () => void;
}

const CourseWelcome: React.FC<CourseWelcomeProps> = ({
  course,
  modulesCount,
  totalLessons,
  progress,
  onContinueLearning,
}) => {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary to-muted p-8 lg:p-12">
        <div className="max-w-2xl">
          {course?.category && (
            <Badge variant="outline" className="mb-3 capitalize">
              {course.category}
            </Badge>
          )}
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Welcome to {course?.title || 'this Course'}
          </h2>
          <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
            {course?.description || 'Get started by selecting a lesson from the sidebar, or click below to jump right in.'}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4 text-primary" />
              {modulesCount} Modules
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              {totalLessons} Lessons
            </div>
            {course?.duration && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {course.duration}
              </div>
            )}
            {course?.enrolledStudents != null && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                {course.enrolledStudents} Students
              </div>
            )}
          </div>

          {/* Progress + CTA */}
          {progress.total > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {progress.completed} of {progress.total} lessons completed
                </span>
                <span className="font-semibold text-foreground">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>
          )}

          <Button variant="hero" size="lg" onClick={onContinueLearning}>
            Continue Learning
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseWelcome;
