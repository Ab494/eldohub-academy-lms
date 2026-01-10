import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen,
  Video,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { courseAPI, moduleAPI, lessonAPI, enrollmentAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const [courseRes, modulesRes] = await Promise.all([
          courseAPI.getCourseById(courseId),
          moduleAPI.getCourseModules(courseId)
        ]);

        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        if (modulesRes.success) {
          setModules(modulesRes.data || []);
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
  }, [courseId, toast]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/courses">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
               <h1 className="font-semibold text-foreground">
                 {course?.title || `Course #${courseId}`}
               </h1>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <span>0% complete</span>
               </div>
             </div>
           </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 w-48">
               <Progress value={0} className="h-2" />
               <span className="text-sm font-medium text-foreground">0%</span>
             </div>
             <Button variant="hero" size="sm">
               <Download className="w-4 h-4 mr-1" />
               Resources
             </Button>
           </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Video Player Area */}
        <div className="flex-1">
           <div className="aspect-video bg-secondary">
             <div className="w-full h-full flex items-center justify-center">
               {currentLesson ? (
                 <div className="text-center">
                   <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                     {currentLesson.type === 'video' ? (
                       <Play className="w-10 h-10 text-primary" />
                     ) : (
                       <FileText className="w-10 h-10 text-blue-500" />
                     )}
                   </div>
                   <p className="text-secondary-foreground text-lg font-medium">
                     {currentLesson.title}
                   </p>
                   <p className="text-secondary-foreground/60 text-sm mt-1">
                     {currentLesson.type === 'video' ? 'Click to play video' : 'Text content'}
                   </p>
                 </div>
               ) : (
                 <div className="text-center">
                   <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                     <Play className="w-10 h-10 text-muted-foreground" />
                   </div>
                   <p className="text-secondary-foreground text-lg font-medium">
                     Select a lesson to begin
                   </p>
                   <p className="text-secondary-foreground/60 text-sm mt-1">
                     Choose a lesson from the sidebar
                   </p>
                 </div>
               )}
             </div>
           </div>

           {/* Lesson Content */}
           <div className="p-6 lg:p-8">
             {currentLesson ? (
               <>
                 <h2 className="text-2xl font-bold text-foreground mb-4">
                   {currentLesson.title}
                 </h2>
                 <p className="text-muted-foreground mb-6">
                   {currentLesson.description || 'No description available.'}
                 </p>
                 {currentLesson.type === 'video' && currentLesson.videoUrl && (
                   <div className="mb-6">
                     <p className="text-sm text-muted-foreground mb-2">Video URL:</p>
                     <a href={currentLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                       {currentLesson.videoUrl}
                     </a>
                   </div>
                 )}
                 {currentLesson.type === 'text' && currentLesson.content && (
                   <div className="prose prose-sm max-w-none">
                     <p>{currentLesson.content}</p>
                   </div>
                 )}
               </>
             ) : (
               <>
                 <h2 className="text-2xl font-bold text-foreground mb-4">
                   Welcome to {course?.title || 'the Course'}
                 </h2>
                 <p className="text-muted-foreground mb-6">
                   {course?.description || 'Select a lesson from the sidebar to start learning.'}
                 </p>
               </>
             )}

             <Button variant="outline" asChild>
               <Link to="/courses">
                 <ArrowLeft className="w-4 h-4 mr-1" />
                 Back to Courses
               </Link>
             </Button>
           </div>
        </div>

        {/* Sidebar - Course Content */}
        <aside className="w-full lg:w-96 border-l border-border bg-card">
           <div className="p-4 border-b border-border">
             <h3 className="font-bold text-foreground">Course Content</h3>
             <p className="text-sm text-muted-foreground mt-1">
               {modules.length} modules • {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} lessons
             </p>
           </div>

           <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
             {modules.length === 0 ? (
               <div className="p-8 text-center">
                 <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                 <p className="text-muted-foreground">No modules available</p>
               </div>
             ) : (
               <div className="p-2">
                 {modules.map((module) => (
                   <div key={module._id} className="mb-2">
                     <button
                       onClick={() => toggleModule(module._id)}
                       className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                     >
                       {expandedModules.includes(module._id) ? (
                         <ChevronUp className="w-4 h-4 text-muted-foreground" />
                       ) : (
                         <ChevronDown className="w-4 h-4 text-muted-foreground" />
                       )}
                       <span className="font-medium text-foreground">{module.title}</span>
                     </button>

                     {expandedModules.includes(module._id) && (
                       <div className="ml-6 space-y-1">
                         {module.lessons?.map((lesson: any) => (
                           <button
                             key={lesson._id}
                             onClick={() => setCurrentLesson(lesson)}
                             className={`w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left ${
                               currentLesson?._id === lesson._id ? 'bg-primary/10 text-primary' : ''
                             }`}
                           >
                             {lesson.type === 'video' ? (
                               <Video className="w-4 h-4 text-primary" />
                             ) : (
                               <FileText className="w-4 h-4 text-blue-500" />
                             )}
                             <span className="text-sm">{lesson.title}</span>
                           </button>
                         )) || []}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             )}
           </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
