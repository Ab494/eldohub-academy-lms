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
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
  // Deduplicate module titles by appending numbers when needed
  const titleCounts: Record<string, number> = {};
  const titleOccurrences: Record<string, number> = {};
  modules.forEach((m) => {
    const t = m.title || 'Untitled';
    titleCounts[t] = (titleCounts[t] || 0) + 1;
  });

  const getModuleDisplayTitle = (module: any, index: number) => {
    const title = module.title || 'Untitled';
    if (titleCounts[title] > 1) {
      titleOccurrences[title] = (titleOccurrences[title] || 0) + 1;
      return `${title} (Part ${titleOccurrences[title]})`;
    }
    return title;
  };

  return (
    <aside className="w-full lg:w-[420px] lg:min-w-[420px] border-l border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground">Course Content</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {modules.length} modules • {totalLessons} lessons
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {modules.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No modules available</p>
          </div>
        ) : (
          <div className="p-2">
            {modules.map((module, moduleIndex) => {
              const moduleLessons: any[] = module.lessons || [];
              const hasLessons = moduleLessons.length > 0;
              const completedInModule = moduleLessons.filter((l: any) => completedLessons.has(l._id)).length;
              const isModuleActive = moduleLessons.some((l: any) => currentLesson?._id === l._id);
              const moduleProgress = hasLessons ? Math.round((completedInModule / moduleLessons.length) * 100) : 0;
              const displayTitle = getModuleDisplayTitle(module, moduleIndex);

              return (
                <div key={module._id} className="mb-2">
                  <button
                    onClick={() => hasLessons && onToggleModule(module._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left border-l-4 ${
                      !hasLessons
                        ? 'border-l-transparent opacity-60 cursor-default'
                        : isModuleActive
                        ? 'border-l-primary bg-primary/5 hover:bg-primary/10'
                        : 'border-l-transparent hover:bg-muted/50'
                    }`}
                  >
                    {hasLessons ? (
                      expandedModules.includes(module._id) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground leading-snug">
                        Module {moduleIndex + 1}: {displayTitle}
                      </div>
                      {hasLessons ? (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{completedInModule}/{moduleLessons.length} lessons</span>
                            <span>{moduleProgress}%</span>
                          </div>
                          <Progress value={moduleProgress} className="h-1.5" />
                        </div>
                      ) : (
                        <Badge variant="outline" className="mt-1 text-xs text-muted-foreground border-muted">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                  </button>

                  {hasLessons && expandedModules.includes(module._id) && (
                    <div className="ml-8 space-y-1 mt-1">
                      {moduleLessons.map((lesson: any, lessonIndex: number) => {
                        const isCompleted = completedLessons.has(lesson._id);
                        const isInProgress = inProgressLessons.has(lesson._id);
                        const isActive = currentLesson?._id === lesson._id;

                        return (
                          <button
                            key={lesson._id}
                            onClick={() => onSelectLesson(lesson)}
                            className={`w-full flex items-start gap-3 p-2.5 rounded-lg transition-all text-left ${
                              isActive
                                ? 'bg-primary/10 ring-1 ring-primary/30'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            {/* Status indicator */}
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            ) : isInProgress || isActive ? (
                              <Circle className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            )}

                            {/* Type icon */}
                            {lesson.type === 'video' ? (
                              <Video className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            ) : lesson.type === 'assignment' ? (
                              <FileCheck className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            )}

                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-sm leading-snug ${
                                  isCompleted ? 'line-through text-muted-foreground' : ''
                                } ${isActive ? 'font-medium text-primary' : ''}`}
                              >
                                {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                              </div>
                              {lesson.duration && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration}
                                </div>
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
