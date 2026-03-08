import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Home,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Eye,
  AlertTriangle,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { courseAPI, moduleAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import CoursePlayerSidebar from '@/components/course-player/CoursePlayerSidebar';
import CourseWelcome from '@/components/course-player/CourseWelcome';
import LessonContent from '@/components/course-player/LessonContent';
import { cn } from '@/lib/utils';

const CoursePreview: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'discussion'>('content');

  const getAllLessons = useCallback((mods: any[]) => {
    return mods.flatMap((m) => m.lessons || []);
  }, []);

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
          if (modulesData.length > 0) {
            setExpandedModules([modulesData[0]._id]);
          }
        }
      } catch (error: any) {
        console.error('Failed to load course data', error);
        toast({ title: 'Error', description: 'Failed to load course content', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, toast]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const allLessons = getAllLessons(modules);
  const currentIndex = currentLesson ? allLessons.findIndex((l: any) => l._id === currentLesson._id) : -1;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Preview Banner */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-800 dark:text-amber-300">
              Preview Mode
            </span>
            <span className="text-amber-700/80 dark:text-amber-400/80 hidden sm:inline">
              — This is how students will see your course
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs border-amber-500/40 hover:bg-amber-500/10"
              onClick={() => navigate(`/instructor/courses/${courseId}/content`)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Back to Editor
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/courses" className="hover:text-foreground flex items-center gap-1">
              <Home className="w-4 h-4" /> My Courses
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">{course?.title || 'Course Preview'}</span>
            <Badge variant="secondary" className="ml-2 text-xs">{course?.status || 'draft'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">
                {course?.title || 'Course Preview'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {modules.length} {modules.length === 1 ? 'module' : 'modules'} • {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <div className="w-32">
                  <Progress value={0} className="h-2" />
                </div>
                <span className="text-sm font-semibold text-foreground min-w-[3rem]">0%</span>
              </div>
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
              <div className="aspect-video bg-secondary flex items-center justify-center relative">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-secondary-foreground text-lg font-medium">{currentLesson.title}</p>
                  <p className="text-secondary-foreground/60 text-sm mt-1">
                    {currentLesson.type === 'video' ? 'Click to play video' : currentLesson.type}
                  </p>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex border-b border-border px-6 lg:px-8">
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

              {activeTab === 'content' ? (
                <>
                  <LessonContent lesson={currentLesson} />

                  {/* Navigation (no mark complete in preview) */}
                  <div className="px-6 lg:px-8 pb-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4" />
                        Progress tracking is disabled in preview mode
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      {prevLesson ? (
                        <Button variant="outline" onClick={() => setCurrentLesson(prevLesson)} className="flex items-center gap-2">
                          <ChevronLeft className="w-4 h-4" />
                          <div className="text-left hidden sm:block">
                            <div className="text-xs text-muted-foreground">Previous</div>
                            <div className="text-sm font-medium truncate max-w-[180px]">{prevLesson.title}</div>
                          </div>
                          <span className="sm:hidden text-sm">Previous</span>
                        </Button>
                      ) : <div />}
                      {nextLesson ? (
                        <Button variant="hero" onClick={() => setCurrentLesson(nextLesson)} className="flex items-center gap-2">
                          <div className="text-left hidden sm:block">
                            <div className="text-xs opacity-80">Next</div>
                            <div className="text-sm font-medium truncate max-w-[180px]">{nextLesson.title}</div>
                          </div>
                          <span className="sm:hidden text-sm">Next</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      ) : <div />}
                    </div>
                  </div>
                </>
              ) : (
                <div className="px-6 lg:px-8 py-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">Discussion Preview</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Students will be able to ask questions and discuss lessons here.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <CourseWelcome
              course={course}
              modulesCount={modules.length}
              totalLessons={totalLessons}
              progress={{ completed: 0, total: totalLessons, percentage: 0 }}
              onContinueLearning={() => {
                const first = allLessons[0];
                if (first) setCurrentLesson(first);
              }}
            />
          )}

          <div className="p-6 pt-0 mt-auto border-t">
            <Button variant="outline" asChild className="mt-6">
              <Link to={`/instructor/courses/${courseId}/content`}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Course Editor
              </Link>
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <CoursePlayerSidebar
          modules={modules}
          currentLesson={currentLesson}
          completedLessons={new Set()}
          inProgressLessons={new Set()}
          expandedModules={expandedModules}
          totalLessons={totalLessons}
          onToggleModule={toggleModule}
          onSelectLesson={setCurrentLesson}
        />
      </div>
    </div>
  );
};

export default CoursePreview;
