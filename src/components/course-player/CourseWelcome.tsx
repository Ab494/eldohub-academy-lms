import React from 'react';
import { BookOpen, Users, Clock, Layers, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
  const isStarted = progress.completed > 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-dark opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        
        <div className="relative p-8 lg:p-12">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              {course?.category && (
                <Badge className="bg-primary/20 text-primary border-0 backdrop-blur text-xs">
                  {course.category}
                </Badge>
              )}
              {isStarted && (
                <Badge className="bg-accent/20 text-accent border-0 backdrop-blur text-xs gap-1">
                  <Sparkles className="w-3 h-3" /> In Progress
                </Badge>
              )}
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-foreground mb-4 leading-tight">
              {isStarted ? 'Welcome Back!' : 'Welcome to'}
              <br />
              <span className="text-primary">{course?.title || 'this Course'}</span>
            </h2>

            <p className="text-secondary-foreground/70 text-base lg:text-lg mb-8 leading-relaxed max-w-xl">
              {course?.description || 'Get started by selecting a lesson from the sidebar, or click below to jump right in.'}
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: Layers, label: `${modulesCount} Modules` },
                { icon: BookOpen, label: `${totalLessons} Lessons` },
                ...(course?.duration ? [{ icon: Clock, label: course.duration }] : []),
                ...(course?.enrolledStudents != null ? [{ icon: Users, label: `${course.enrolledStudents} Students` }] : []),
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-foreground/10 backdrop-blur text-sm text-secondary-foreground/80">
                  <Icon className="w-3.5 h-3.5 text-primary" /> {label}
                </div>
              ))}
            </div>

            {/* Progress */}
            {progress.total > 0 && (
              <div className="mb-8 max-w-sm">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-secondary-foreground/60">
                    {progress.completed} of {progress.total} lessons
                  </span>
                  <span className="font-bold text-primary">{progress.percentage}%</span>
                </div>
                <Progress value={progress.percentage} className="h-2 bg-secondary-foreground/10" />
              </div>
            )}

            <Button
              size="lg"
              onClick={onContinueLearning}
              className="gradient-hero text-primary-foreground font-semibold gap-2 shadow-glow hover:scale-[1.03] transition-transform"
            >
              {isStarted ? 'Continue Learning' : 'Start Learning'}
              <ArrowRight className="w-5 h-5" />
            </Button>

            {progress.percentage === 100 && (
              <div className="mt-6 flex items-center gap-2 text-accent">
                <Trophy className="w-5 h-5" />
                <span className="font-semibold">Course Complete — Amazing work!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseWelcome;
