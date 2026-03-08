import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Lock,
  Video,
  FileText,
  FileCheck,
  BookOpen,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CoursePlayerSidebarProps {
  modules: any[];
  currentLesson: any;
  completedLessons: Set<string>;
  inProgressLessons: Set<string>;
  expandedModules: string[];
  totalLessons: number;
  onToggleModule: (moduleId: string) => void;
  onSelectLesson: (lesson: any) => void;
}

const CoursePlayerSidebar: React.FC<CoursePlayerSidebarProps> = ({
  modules,
  currentLesson,
  completedLessons,
  inProgressLessons,
  expandedModules,
  totalLessons,
  onToggleModule,
  onSelectLesson,
}) => {
  const totalCompleted = completedLessons.size;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Deduplicate module titles
  const titleCounts: Record<string, number> = {};
  const titleOccurrences: Record<string, number> = {};
  modules.forEach((m) => {
    const t = m.title || 'Untitled';
    titleCounts[t] = (titleCounts[t] || 0) + 1;
  });

  const getModuleDisplayTitle = (module: any) => {
    const title = module.title || 'Untitled';
    if (titleCounts[title] > 1) {
      titleOccurrences[title] = (titleOccurrences[title] || 0) + 1;
      return `${title} (Part ${titleOccurrences[title]})`;
    }
    return title;
  };

  return (
    <aside className="w-full h-full border-l border-border bg-card flex flex-col">
      {/* Header with overall progress */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Course Content
          </h3>
          <span className="text-xs font-bold text-primary tabular-nums">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-1.5" />
        <p className="text-xs text-muted-foreground">
          {totalCompleted} of {totalLessons} lessons completed
        </p>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto">
        {modules.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No modules available yet</p>
          </div>
        ) : (
          <div className="py-1">
            {modules.map((module, moduleIndex) => {
              const moduleLessons: any[] = module.lessons || [];
              const hasLessons = moduleLessons.length > 0;
              const completedInModule = moduleLessons.filter((l: any) => completedLessons.has(l._id)).length;
              const isModuleActive = moduleLessons.some((l: any) => currentLesson?._id === l._id);
              const moduleProgress = hasLessons ? Math.round((completedInModule / moduleLessons.length) * 100) : 0;
              const isModuleComplete = hasLessons && completedInModule === moduleLessons.length;
              const displayTitle = getModuleDisplayTitle(module);
              const isExpanded = expandedModules.includes(module._id);

              return (
                <div key={module._id} className="border-b border-border last:border-b-0">
                  <button
                    onClick={() => hasLessons && onToggleModule(module._id)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 transition-all text-left hover:bg-muted/40',
                      isModuleActive && 'bg-primary/5',
                      !hasLessons && 'opacity-50 cursor-default'
                    )}
                  >
                    {/* Module number circle */}
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors',
                      isModuleComplete
                        ? 'bg-accent text-accent-foreground'
                        : isModuleActive
                        ? 'gradient-hero text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {isModuleComplete ? <CheckCircle className="w-3.5 h-3.5" /> : moduleIndex + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          'text-sm font-semibold leading-snug',
                          isModuleActive ? 'text-foreground' : 'text-foreground/80'
                        )}>
                          {displayTitle}
                        </span>
                        {hasLessons ? (
                          isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                          )
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      {hasLessons ? (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1">
                            <Progress value={moduleProgress} className="h-1" />
                          </div>
                          <span className="text-[10px] text-muted-foreground tabular-nums whitespace-nowrap">
                            {completedInModule}/{moduleLessons.length}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Coming Soon</span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Lessons list */}
                  {hasLessons && isExpanded && (
                    <div className="pb-1">
                      {moduleLessons.map((lesson: any, lessonIndex: number) => {
                        const isLessonCompleted = completedLessons.has(lesson._id);
                        const isInProgress = inProgressLessons.has(lesson._id);
                        const isActive = currentLesson?._id === lesson._id;

                        const TypeIcon = lesson.type === 'video' ? Video
                          : lesson.type === 'assignment' ? FileCheck
                          : FileText;

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => onSelectLesson(lesson)}
                            className={cn(
                              'w-full flex items-center gap-3 pl-14 pr-4 py-2.5 text-left transition-all group/lesson',
                              isActive
                                ? 'bg-primary/10 border-r-2 border-primary'
                                : 'hover:bg-muted/30'
                            )}
                          >
                            {/* Status dot */}
                            <div className="relative shrink-0">
                              {isLessonCompleted ? (
                                <CheckCircle className="w-4 h-4 text-accent" />
                              ) : isActive ? (
                                <div className="relative">
                                  <Circle className="w-4 h-4 text-primary fill-primary" />
                                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                                </div>
                              ) : isInProgress ? (
                                <Circle className="w-4 h-4 text-primary/50 fill-primary/20" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/40" />
                              )}
                            </div>

                            {/* Type icon */}
                            <TypeIcon className={cn(
                              'w-3.5 h-3.5 shrink-0',
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            )} />

                            {/* Title + duration */}
                            <div className="flex-1 min-w-0">
                              <span className={cn(
                                'text-sm leading-snug block truncate',
                                isLessonCompleted && 'line-through text-muted-foreground',
                                isActive && 'font-semibold text-primary',
                                !isActive && !isLessonCompleted && 'text-foreground/70 group-hover/lesson:text-foreground'
                              )}>
                                {lesson.title}
                              </span>
                              {lesson.duration && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                  <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default CoursePlayerSidebar;
