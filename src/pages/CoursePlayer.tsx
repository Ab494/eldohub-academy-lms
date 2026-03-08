import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Download,
  Home,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  MessageSquare,
  BookOpen,
  Menu,
  X,
  Trophy,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { courseAPI, moduleAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import CoursePlayerSidebar from '@/components/course-player/CoursePlayerSidebar';
import CourseWelcome from '@/components/course-player/CourseWelcome';
import LessonContent from '@/components/course-player/LessonContent';
import CourseDiscussion from '@/components/course-player/CourseDiscussion';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const lessonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } },
};

const tabVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getAllLessons = useCallback((mods: any[]) => {
    return mods.flatMap((m) => m.lessons || []);
  }, []);

  const findNextIncompleteLesson = useCallback(
    (mods: any[], completed: Set<string>) => {
      const allLessons = getAllLessons(mods);
      return allLessons.find((l: any) => !completed.has(l._id)) || allLessons[0] || null;
    },
    [getAllLessons]
  );

  const autoResume = useCallback(
    (mods: any[], completed: Set<string>) => {
      const storageKey = `course-last-lesson-${courseId}`;
      const lastLessonId = localStorage.getItem(storageKey);
      const allLessons = getAllLessons(mods);
      if (lastLessonId) {
        const found = allLessons.find((l: any) => l._id === lastLessonId);
        if (found) return found;
      }
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
          const totalLessons = modulesData.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
          const storedCompleted: string[] = JSON.parse(localStorage.getItem(`course-completed-${courseId}`) || '[]');
          const completed = new Set<string>(storedCompleted);
          setCompletedLessons(completed);
          setProgress({ completed: completed.size, total: totalLessons, percentage: totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0 });
          const resumeLesson = autoResume(modulesData, completed);
          if (resumeLesson) {
            setCurrentLesson(resumeLesson);
            const parentModule = modulesData.find((m: any) => (m.lessons || []).some((l: any) => l._id === resumeLesson._id));
            if (parentModule) setExpandedModules([parentModule._id]);
          }
        }
      } catch (error: any) {
        toast({ title: 'Error', description: 'Failed to load course content', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, toast, autoResume]);

  useEffect(() => {
    if (currentLesson && courseId) {
      localStorage.setItem(`course-last-lesson-${courseId}`, currentLesson._id);
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
      const parentModule = modules.find((m: any) => (m.lessons || []).some((l: any) => l._id === next._id));
      if (parentModule && !expandedModules.includes(parentModule._id)) {
        setExpandedModules((prev) => [...prev, parentModule._id]);
      }
    }
  };

  const handleMarkComplete = useCallback(() => {
    if (!currentLesson) return;
    const lessonId = currentLesson._id;
    setCompletedLessons((prev) => { const next = new Set(prev); next.add(lessonId); return next; });
    setInProgressLessons((prev) => { const next = new Set(prev); next.delete(lessonId); return next; });
    setProgress((prev) => {
      const newCompleted = prev.completed + 1;
      return { completed: newCompleted, total: prev.total, percentage: prev.total > 0 ? Math.round((newCompleted / prev.total) * 100) : 0 };
    });
    if (courseId) {
      const key = `course-completed-${courseId}`;
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      if (!stored.includes(lessonId)) { stored.push(lessonId); localStorage.setItem(key, JSON.stringify(stored)); }
    }
    toast({ title: '🎉 Lesson completed!', description: 'Great progress — keep it up!' });
    const allLessons = getAllLessons(modules);
    const currentIndex = allLessons.findIndex((l: any) => l._id === lessonId);
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    if (nextLesson) {
      setCurrentLesson(nextLesson);
      const parentModule = modules.find((m: any) => (m.lessons || []).some((l: any) => l._id === nextLesson._id));
      if (parentModule && !expandedModules.includes(parentModule._id)) {
        setExpandedModules((prev) => [...prev, parentModule._id]);
      }
    }
  }, [currentLesson, courseId, modules, expandedModules, getAllLessons, toast]);

  const handleSelectLesson = (lesson: any) => {
    setCurrentLesson(lesson);
    setSidebarOpen(false);
  };

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const allLessons = getAllLessons(modules);
  const currentIndex = currentLesson ? allLessons.findIndex((l: any) => l._id === currentLesson._id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCompleted = currentLesson ? completedLessons.has(currentLesson._id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-muted" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium">Loading your course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Compact sticky header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="px-4 lg:px-6 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Link to="/dashboard/courses" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <Home className="w-3 h-3" /> My Courses
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground/70 truncate max-w-[200px]">{course?.title}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2.5 bg-muted/60 rounded-full px-3 py-1.5">
                <div className="w-20">
                  <Progress value={progress.percentage} className="h-1.5" />
                </div>
                <span className="text-xs font-bold text-foreground tabular-nums">{progress.percentage}%</span>
              </div>
              {progress.percentage === 100 && (
                <Badge className="bg-accent text-accent-foreground gap-1 hidden sm:inline-flex">
                  <Trophy className="w-3 h-3" /> Complete
                </Badge>
              )}
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                <Download className="w-3.5 h-3.5" /> Resources
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {currentLesson ? (
            <>
              {/* Lesson title bar with type indicator */}
              <div className="bg-card border-b border-border">
                <div className="max-w-4xl mx-auto w-full px-4 lg:px-8 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        currentLesson.type === 'video' 
                          ? 'bg-primary/10' 
                          : currentLesson.type === 'assignment'
                          ? 'bg-accent/10'
                          : 'bg-secondary/10'
                      )}>
                        {currentLesson.type === 'video' ? (
                          <Play className="w-5 h-5 text-primary" />
                        ) : currentLesson.type === 'assignment' ? (
                          <Zap className="w-5 h-5 text-accent" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-lg font-bold text-foreground truncate">
                          {currentLesson.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] capitalize h-5">
                            {currentLesson.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Lesson {currentIndex + 1} of {allLessons.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick nav */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!prevLesson}
                        onClick={() => prevLesson && setCurrentLesson(prevLesson)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!nextLesson}
                        onClick={() => nextLesson && setCurrentLesson(nextLesson)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab bar */}
              <div className="border-b border-border bg-card/50">
                <div className="max-w-4xl mx-auto w-full px-4 lg:px-8 flex">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                      activeTab === 'content'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <BookOpen className="w-4 h-4" /> Lesson
                  </button>
                  <button
                    onClick={() => setActiveTab('discussion')}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
                      activeTab === 'discussion'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <MessageSquare className="w-4 h-4" /> Discussion
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'content' ? (
                  <motion.div
                    key={currentLesson._id + '-content'}
                    variants={lessonVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex-1 max-w-4xl mx-auto w-full"
                  >
                    <LessonContent lesson={currentLesson} />

                    {/* Action bar */}
                    <div className="px-4 lg:px-8 pb-8">
                      {/* Mark complete */}
                      <div className="flex justify-center mb-8">
                        <motion.div whileHover={{ scale: isCompleted ? 1 : 1.02 }} whileTap={{ scale: isCompleted ? 1 : 0.98 }}>
                          <Button
                            variant={isCompleted ? 'outline' : 'default'}
                            size="lg"
                            disabled={isCompleted}
                            onClick={handleMarkComplete}
                            className={cn(
                              'gap-2 font-semibold transition-all px-8',
                              !isCompleted && 'gradient-success text-accent-foreground shadow-md hover:shadow-lg'
                            )}
                          >
                            <CheckCircle className="w-5 h-5" />
                            {isCompleted ? 'Completed ✓' : 'Mark as Complete & Continue'}
                          </Button>
                        </motion.div>
                      </div>

                      {/* Prev / Next cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {prevLesson ? (
                          <button
                            onClick={() => setCurrentLesson(prevLesson)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all text-left group"
                          >
                            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Previous</div>
                              <div className="text-sm font-medium text-foreground truncate">{prevLesson.title}</div>
                            </div>
                          </button>
                        ) : <div />}
                        {nextLesson ? (
                          <button
                            onClick={() => setCurrentLesson(nextLesson)}
                            className="flex items-center justify-end gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all text-right group"
                          >
                            <div className="min-w-0">
                              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Next</div>
                              <div className="text-sm font-medium text-foreground truncate">{nextLesson.title}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="discussion-tab"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-6"
                  >
                    {courseId && <CourseDiscussion courseId={courseId} />}
                  </motion.div>
                )}
              </AnimatePresence>
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
        </div>

        {/* Sidebar */}
        <div className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-80 lg:w-[340px] lg:static lg:z-auto transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        )}>
          <CoursePlayerSidebar
            modules={modules}
            currentLesson={currentLesson}
            completedLessons={completedLessons}
            inProgressLessons={inProgressLessons}
            expandedModules={expandedModules}
            totalLessons={totalLessons}
            onToggleModule={toggleModule}
            onSelectLesson={handleSelectLesson}
          />
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
