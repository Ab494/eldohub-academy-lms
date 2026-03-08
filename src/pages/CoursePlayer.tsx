import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Download,
  Home,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { courseAPI, moduleAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import CoursePlayerSidebar from '@/components/course-player/CoursePlayerSidebar';
import CourseWelcome from '@/components/course-player/CourseWelcome';
import LessonContent from '@/components/course-player/LessonContent';
import CourseDiscussion from '@/components/course-player/CourseDiscussion';
import { cn } from '@/lib/utils';

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [inProgressLessons, setInProgressLessons] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');
  const [inProgressLessons, setInProgressLessons] = useState<Set<string>>(new Set());

  // Get all lessons flat
  const getAllLessons = useCallback((mods: any[]) => {
    return mods.flatMap((m) => m.lessons || []);
  }, []);

  // Find the next incomplete lesson
  const findNextIncompleteLesson = useCallback(
    (mods: any[], completed: Set<string>) => {
      const allLessons = getAllLessons(mods);
      return allLessons.find((l: any) => !completed.has(l._id)) || allLessons[0] || null;
    },
    [getAllLessons]
  );

  // Auto-resume: try to restore last lesson from localStorage
  const autoResume = useCallback(
    (mods: any[], completed: Set<string>) => {
      const storageKey = `course-last-lesson-${courseId}`;
      const lastLessonId = localStorage.getItem(storageKey);
      const allLessons = getAllLessons(mods);

      if (lastLessonId) {
        const found = allLessons.find((l: any) => l._id === lastLessonId);
        if (found) return found;
      }

      // Fallback to first incomplete lesson
      return findNextIncompleteLesson(mods, completed);
    },
    [courseId, getAllLessons, findNextIncompleteLesson]
  );

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const [courseRes, modulesRes] = await Promise.all([
          courseAPI.getCourseById(courseId),
          moduleAPI.getCourseModules(courseId),
        ]);

        if (courseRes.success) setCourse(courseRes.data);

        if (modulesRes.success) {
          const modulesData = modulesRes.data || [];
          setModules(modulesData);

          const totalLessons = modulesData.reduce(
            (acc: number, m: any) => acc + (m.lessons?.length || 0),
            0
          );

          // Restore completed lessons from localStorage
          const storedCompleted: string[] = JSON.parse(localStorage.getItem(`course-completed-${courseId}`) || '[]');
          const completed = new Set<string>(storedCompleted);
          const completedCount = completed.size;
          const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          setCompletedLessons(completed);
          setProgress({ completed: completedCount, total: totalLessons, percentage });

          // Auto-resume lesson
          const resumeLesson = autoResume(modulesData, completed);
          if (resumeLesson) {
            setCurrentLesson(resumeLesson);
            // Expand the module containing this lesson
            const parentModule = modulesData.find((m: any) =>
              (m.lessons || []).some((l: any) => l._id === resumeLesson._id)
            );
            if (parentModule) {
              setExpandedModules([parentModule._id]);
            }
          }
        }
      } catch (error: any) {
        console.error('Failed to load course data', error);
        toast({
          title: 'Error',
          description: 'Failed to load course content',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, toast, autoResume]);

  // Persist current lesson to localStorage
  useEffect(() => {
    if (currentLesson && courseId) {
      localStorage.setItem(`course-last-lesson-${courseId}`, currentLesson._id);
      // Mark as in-progress
      setInProgressLessons((prev) => new Set(prev).add(currentLesson._id));
    }
  }, [currentLesson, courseId]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleContinueLearning = () => {
    const next = findNextIncompleteLesson(modules, completedLessons);
    if (next) {
      setCurrentLesson(next);
      const parentModule = modules.find((m: any) =>
        (m.lessons || []).some((l: any) => l._id === next._id)
      );
      if (parentModule && !expandedModules.includes(parentModule._id)) {
        setExpandedModules((prev) => [...prev, parentModule._id]);
      }
    }
  };
  const handleMarkComplete = useCallback(() => {
    if (!currentLesson) return;
    const lessonId = currentLesson._id;

    // Update completed set
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });

    // Remove from in-progress
    setInProgressLessons((prev) => {
      const next = new Set(prev);
      next.delete(lessonId);
      return next;
    });

    // Update progress
    setProgress((prev) => {
      const newCompleted = prev.completed + 1;
      return {
        completed: newCompleted,
        total: prev.total,
        percentage: prev.total > 0 ? Math.round((newCompleted / prev.total) * 100) : 0,
      };
    });

    // Persist to localStorage
    if (courseId) {
      const key = `course-completed-${courseId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      if (!stored.includes(lessonId)) {
        stored.push(lessonId);
        localStorage.setItem(key, JSON.stringify(stored));
      }
    }

    toast({ title: 'Lesson completed!', description: 'Great progress — keep it up!' });

    // Auto-advance to next lesson
    const allLessons = getAllLessons(modules);
    const currentIndex = allLessons.findIndex((l: any) => l._id === lessonId);
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    if (nextLesson) {
      setCurrentLesson(nextLesson);
      const parentModule = modules.find((m: any) =>
        (m.lessons || []).some((l: any) => l._id === nextLesson._id)
      );
      if (parentModule && !expandedModules.includes(parentModule._id)) {
        setExpandedModules((prev) => [...prev, parentModule._id]);
      }
    }
  }, [currentLesson, courseId, modules, expandedModules, getAllLessons, toast]);

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/courses" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-4 h-4" />
              My Courses
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{course?.title || `Course #${courseId}`}</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                {course?.title || `Course #${courseId}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {progress.completed} of {progress.total} lessons completed
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="w-32">
                  <Progress value={progress.percentage} className="h-2" />
                </div>
                <span className="text-sm font-semibold text-foreground min-w-[3rem]">
                  {progress.percentage}%
                </span>
              </div>
              <Button variant="hero" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Resources
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {currentLesson ? (
            <>
              {/* Video/Preview area */}
              <div className="aspect-video bg-secondary flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    {currentLesson.type === 'video' ? (
                      <Play className="w-10 h-10 text-primary" />
                    ) : (
                      <Play className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-secondary-foreground text-lg font-medium">{currentLesson.title}</p>
                  <p className="text-secondary-foreground/60 text-sm mt-1">
                    {currentLesson.type === 'video' ? 'Click to play video' : currentLesson.type}
                  </p>
                </div>
              </div>

              {/* Lesson detail */}
              <LessonContent lesson={currentLesson} />

              {/* Mark Complete + Navigation */}
              {(() => {
                const allLessons = getAllLessons(modules);
                const currentIndex = allLessons.findIndex((l: any) => l._id === currentLesson._id);
                const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
                const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
                const isCompleted = completedLessons.has(currentLesson._id);

                return (
                  <div className="px-6 lg:px-8 pb-6 space-y-4">
                    {/* Mark as Complete */}
                    <div className="flex justify-center">
                      <Button
                        variant={isCompleted ? 'outline' : 'success'}
                        size="lg"
                        disabled={isCompleted}
                        onClick={handleMarkComplete}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {isCompleted ? 'Completed' : 'Mark as Complete & Continue'}
                      </Button>
                    </div>

                    {/* Prev / Next */}
                    <div className="flex items-center justify-between gap-4">
                    {prevLesson ? (
                      <Button
                        variant="outline"
                        onClick={() => setCurrentLesson(prevLesson)}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <div className="text-left hidden sm:block">
                          <div className="text-xs text-muted-foreground">Previous</div>
                          <div className="text-sm font-medium truncate max-w-[180px]">{prevLesson.title}</div>
                        </div>
                        <span className="sm:hidden text-sm">Previous</span>
                      </Button>
                    ) : (
                      <div />
                    )}
                    {nextLesson ? (
                      <Button
                        variant="hero"
                        onClick={() => setCurrentLesson(nextLesson)}
                        className="flex items-center gap-2"
                      >
                        <div className="text-left hidden sm:block">
                          <div className="text-xs opacity-80">Next</div>
                          <div className="text-sm font-medium truncate max-w-[180px]">{nextLesson.title}</div>
                        </div>
                        <span className="sm:hidden text-sm">Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <div />
                    )}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <CourseWelcome
              course={course}
              modulesCount={modules.length}
              totalLessons={totalLessons}
              progress={progress}
              onContinueLearning={handleContinueLearning}
            />
          )}

          <div className="p-6 pt-0 mt-auto border-t">
            <Button variant="outline" asChild className="mt-6">
              <Link to="/courses">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Courses
              </Link>
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <CoursePlayerSidebar
          modules={modules}
          currentLesson={currentLesson}
          completedLessons={completedLessons}
          inProgressLessons={inProgressLessons}
          expandedModules={expandedModules}
          totalLessons={totalLessons}
          onToggleModule={toggleModule}
          onSelectLesson={setCurrentLesson}
        />
      </div>
    </div>
  );
};

export default CoursePlayer;
