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

const mediaVariants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2 } },
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

  // Current lesson index info
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
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: breadcrumb + title */}
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
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                  <Link to="/dashboard/courses" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <Home className="w-3 h-3" /> My Courses
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-foreground font-medium truncate">{course?.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm lg:text-base font-bold text-foreground truncate">
                    {currentLesson ? currentLesson.title : course?.title}
                  </h1>
                  {currentLesson && (
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0 hidden sm:inline-flex">
                      {currentLesson.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: progress + actions */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-2.5 bg-muted/50 rounded-full px-3 py-1.5">
                <div className="w-24">
                  <Progress value={progress.percentage} className="h-1.5" />
                </div>
                <span className="text-xs font-bold text-foreground tabular-nums">{progress.percentage}%</span>
              </div>
              {progress.percentage === 100 && (
                <Badge className="bg-accent text-accent-foreground gap-1 hidden sm:inline-flex">
                  <Trophy className="w-3 h-3" /> Complete
                </Badge>
              )}
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
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
              {/* Video / Media Area */}
              <div className="relative aspect-[21/9] max-h-[400px] bg-secondary overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-secondary/30 z-[1] pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLesson._id + '-media'}
                    variants={mediaVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    {currentLesson.type === 'video' && currentLesson.videoUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <a
                          href={currentLesson.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 flex flex-col items-center gap-3 group/play"
                        >
                          <motion.div
                            className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-glow"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Play className="w-8 h-8 text-primary-foreground ml-1" />
                          </motion.div>
                          <span className="text-secondary-foreground/80 text-sm font-medium">Click to play video</span>
                        </a>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            className="w-20 h-20 rounded-2xl bg-muted/20 backdrop-blur flex items-center justify-center mx-auto mb-4 border border-muted/30"
                            initial={{ rotate: -5, scale: 0.9 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          >
                            {currentLesson.type === 'video' ? (
                              <Play className="w-8 h-8 text-primary" />
                            ) : currentLesson.type === 'assignment' ? (
                              <Zap className="w-8 h-8 text-primary" />
                            ) : (
                              <BookOpen className="w-8 h-8 text-primary" />
                            )}
                          </motion.div>
                          <p className="text-secondary-foreground font-semibold text-lg">{currentLesson.title}</p>
                          <p className="text-secondary-foreground/50 text-sm mt-1 capitalize">{currentLesson.type} Lesson</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Lesson counter badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-secondary/80 backdrop-blur text-secondary-foreground border-0 text-xs font-medium">
                    Lesson {currentIndex + 1} of {allLessons.length}
                  </Badge>
                </div>

                {/* Quick nav arrows */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  {prevLesson && (
                    <motion.button
                      onClick={() => setCurrentLesson(prevLesson)}
                      className="w-10 h-10 rounded-full bg-foreground/20 backdrop-blur hover:bg-foreground/30 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronLeft className="w-5 h-5 text-secondary-foreground" />
                    </motion.button>
                  )}
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  {nextLesson && (
                    <motion.button
                      onClick={() => setCurrentLesson(nextLesson)}
                      className="w-10 h-10 rounded-full bg-foreground/20 backdrop-blur hover:bg-foreground/30 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ChevronRight className="w-5 h-5 text-secondary-foreground" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-border bg-card px-4 lg:px-8">
                <button
                  onClick={() => setActiveTab('content')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
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
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px',
                    activeTab === 'discussion'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <MessageSquare className="w-4 h-4" /> Discussion
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'content' ? (
                  <motion.div
                    key={currentLesson._id + '-content'}
                    variants={lessonVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex-1"
                  >
                    <LessonContent lesson={currentLesson} />

                    {/* Action bar */}
                    <div className="px-4 lg:px-8 pb-8">
                      {/* Mark complete */}
                      <div className="flex justify-center mb-6">
                        <motion.div whileHover={{ scale: isCompleted ? 1 : 1.02 }} whileTap={{ scale: isCompleted ? 1 : 0.98 }}>
                          <Button
                            variant={isCompleted ? 'outline' : 'default'}
                            size="lg"
                            disabled={isCompleted}
                            onClick={handleMarkComplete}
                            className={cn(
                              'w-full sm:w-auto gap-2 font-semibold transition-all',
                              !isCompleted && 'gradient-success text-accent-foreground shadow-md hover:shadow-lg'
                            )}
                          >
                            <CheckCircle className="w-5 h-5" />
                            {isCompleted ? 'Completed ✓' : 'Mark as Complete & Continue'}
                          </Button>
                        </motion.div>
                      </div>

                      {/* Prev / Next */}
                      <div className="flex items-center justify-between gap-3">
                        {prevLesson ? (
                          <Button
                            variant="ghost"
                            onClick={() => setCurrentLesson(prevLesson)}
                            className="gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <div className="text-left hidden sm:block">
                              <div className="text-[10px] uppercase tracking-wider opacity-60">Previous</div>
                              <div className="text-sm font-medium truncate max-w-[180px]">{prevLesson.title}</div>
                            </div>
                            <span className="sm:hidden text-sm">Previous</span>
                          </Button>
                        ) : <div />}
                        {nextLesson ? (
                          <Button
                            variant="ghost"
                            onClick={() => setCurrentLesson(nextLesson)}
                            className="gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <div className="text-right hidden sm:block">
                              <div className="text-[10px] uppercase tracking-wider opacity-60">Next</div>
                              <div className="text-sm font-medium truncate max-w-[180px]">{nextLesson.title}</div>
                            </div>
                            <span className="sm:hidden text-sm">Next</span>
                            <ArrowRight className="w-4 h-4" />
                          </Button>
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
                    className="flex-1 px-4 lg:px-8 py-6"
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
          'fixed top-0 right-0 bottom-0 z-50 w-80 lg:w-[380px] lg:static lg:z-auto transition-transform duration-300',
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
