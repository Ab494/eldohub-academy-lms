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
  FileText,
  CheckCircle,
  Circle,
  Home,
  ChevronRight,
  Clock,
  Calendar,
  FileCheck,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

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
          const modulesData = modulesRes.data || [];
          setModules(modulesData);

          // Calculate total lessons
          const totalLessons = modulesData.reduce((acc: number, module: any) =>
            acc + (module.lessons?.length || 0), 0
          );

          // For now, simulate some completed lessons (in real app, fetch from backend)
          const completedCount = Math.floor(totalLessons * 0.3); // 30% completed
          const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

          setProgress({
            completed: completedCount,
            total: totalLessons,
            percentage
          });
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
        <div className="px-4 lg:px-6 py-4">
          {/* Breadcrumb */}
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
                 {currentLesson.type === 'assignment' ? (
                   // Enhanced Assignment View with Questions
                   <div className="space-y-6">
                     <Card className="overflow-hidden">
                       <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                         <div className="flex items-center gap-3 mb-2">
                           <FileCheck className="w-8 h-8" />
                           <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                             Assignment
                           </Badge>
                         </div>
                         <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
                         <p className="text-blue-100">
                           {currentLesson.description || 'Complete this assignment to test your understanding.'}
                         </p>
                       </div>

                       <CardContent className="p-6">
                         {/* Assignment Questions */}
                         {currentLesson.questions && currentLesson.questions.length > 0 ? (
                           <div className="space-y-6">
                             <h3 className="text-lg font-semibold">Assignment Questions</h3>
                             {currentLesson.questions.map((question, index) => (
                               <Card key={index} className="p-4">
                                 <div className="space-y-4">
                                   <h4 className="font-medium">{index + 1}. {question.question}</h4>
                                   <div className="space-y-2">
                                     {question.options.map((option, optIndex) => (
                                       <label key={optIndex} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                                         <input
                                           type="radio"
                                           name={`question-${index}`}
                                           value={optIndex}
                                           className="w-4 h-4 text-primary"
                                         />
                                         <span className="text-sm">{option}</span>
                                       </label>
                                     ))}
                                   </div>
                                 </div>
                               </Card>
                             ))}

                             {/* Submit Button */}
                             <div className="flex justify-end">
                               <Button className="bg-primary hover:bg-primary/90">
                                 <FileCheck className="w-4 h-4 mr-2" />
                                 Submit Assignment
                               </Button>
                             </div>
                           </div>
                         ) : (
                           <>
                             {/* Meta Information */}
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                               <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                 <Clock className="w-5 h-5 text-primary" />
                                 <div>
                                   <p className="text-sm font-medium">Duration</p>
                                   <p className="text-sm text-muted-foreground">{currentLesson.duration || '2 hours'}</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                 <Calendar className="w-5 h-5 text-orange-500" />
                                 <div>
                                   <p className="text-sm font-medium">Due Date</p>
                                   <p className="text-sm text-muted-foreground">Dec 31, 2024</p>
                                 </div>
                               </div>
                               <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                 <Target className="w-5 h-5 text-green-500" />
                                 <div>
                                   <p className="text-sm font-medium">Status</p>
                                   <Badge variant="outline" className="text-green-600 border-green-600">
                                     Not Started
                                   </Badge>
                                 </div>
                               </div>
                             </div>

                             {/* Assignment Overview */}
                             <div className="mb-6">
                               <h3 className="text-lg font-semibold mb-3">Assignment Overview</h3>
                               <p className="text-muted-foreground mb-4">
                                 This assignment will help you apply the concepts learned in this module.
                                 You need to complete all the requirements and submit your work for grading.
                               </p>
                             </div>

                             {/* Learning Objectives */}
                             <div className="mb-6">
                               <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
                               <ul className="space-y-2">
                                 <li className="flex items-start gap-2">
                                   <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                   <span className="text-sm">Apply theoretical concepts to practical scenarios</span>
                                 </li>
                                 <li className="flex items-start gap-2">
                                   <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                   <span className="text-sm">Demonstrate problem-solving skills</span>
                                 </li>
                                 <li className="flex items-start gap-2">
                                   <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                   <span className="text-sm">Present solutions in a clear and structured manner</span>
                                 </li>
                               </ul>
                             </div>

                             {/* Action Buttons */}
                             <div className="flex flex-col sm:flex-row gap-3">
                               <Button className="bg-primary hover:bg-primary/90">
                                 <FileCheck className="w-4 h-4 mr-2" />
                                 Start Assignment
                               </Button>
                               <Button variant="outline">
                                 <Download className="w-4 h-4 mr-2" />
                                 Download Materials
                               </Button>
                             </div>
                           </>
                         )}
                       </CardContent>
                     </Card>
                   </div>
                 ) : (
                   // Regular Lesson Content
                   <>
                     <div className="flex items-center gap-3 mb-4">
                       {currentLesson.type === 'video' ? (
                         <Video className="w-6 h-6 text-primary" />
                       ) : (
                         <FileText className="w-6 h-6 text-blue-500" />
                       )}
                       <Badge variant="outline" className="capitalize">
                         {currentLesson.type}
                       </Badge>
                     </div>

                     <h2 className="text-2xl font-bold text-foreground mb-4">
                       {currentLesson.title}
                     </h2>

                     <p className="text-muted-foreground mb-6">
                       {currentLesson.description || 'No description available for this lesson.'}
                     </p>

                     {currentLesson.type === 'video' && currentLesson.videoUrl && (
                       <div className="mb-6">
                         <div className="bg-muted p-4 rounded-lg">
                           <p className="text-sm font-medium mb-2">Video Content</p>
                           <a
                             href={currentLesson.videoUrl}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-primary hover:underline flex items-center gap-2"
                           >
                             <Play className="w-4 h-4" />
                             Watch Video
                           </a>
                         </div>
                       </div>
                     )}

                     {currentLesson.type === 'text' && currentLesson.content && (
                       <Card>
                         <CardContent className="p-6">
                           <div className="prose prose-sm max-w-none">
                             <p>{currentLesson.content}</p>
                           </div>
                         </CardContent>
                       </Card>
                     )}
                   </>
                 )}
               </>
             ) : (
               <>
                 <div className="text-center py-12">
                   <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                   <h2 className="text-2xl font-bold text-foreground mb-4">
                     Welcome to {course?.title || 'the Course'}
                   </h2>
                   <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                     {course?.description || 'Select a lesson from the sidebar to start learning.'}
                   </p>
                 </div>
               </>
             )}

             <div className="mt-8 pt-6 border-t">
               <Button variant="outline" asChild>
                 <Link to="/courses">
                   <ArrowLeft className="w-4 h-4 mr-1" />
                   Back to Courses
                 </Link>
               </Button>
             </div>
           </div>
        </div>

        {/* Sidebar - Course Content */}
        <aside className="w-full lg:w-96 border-l border-border bg-card">
           <div className="p-4 border-b border-border">
             <h3 className="font-bold text-foreground">Course Content</h3>
             <p className="text-sm text-muted-foreground mt-1">
               {modules.length} modules • {progress.total} lessons
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
                 {modules.map((module, moduleIndex) => {
                   const moduleLessons = module.lessons || [];
                   const completedInModule = moduleLessons.filter((l: any) => completedLessons.has(l._id)).length;
                   const isModuleActive = moduleLessons.some((l: any) => currentLesson?._id === l._id);

                   return (
                     <div key={module._id} className="mb-2">
                       <button
                         onClick={() => toggleModule(module._id)}
                         className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all text-left border-l-4 ${
                           isModuleActive ? 'border-l-primary bg-primary/5' : 'border-l-transparent'
                         }`}
                       >
                         {expandedModules.includes(module._id) ? (
                           <ChevronUp className="w-4 h-4 text-muted-foreground" />
                         ) : (
                           <ChevronDown className="w-4 h-4 text-muted-foreground" />
                         )}
                         <div className="flex-1 min-w-0">
                           <div className="font-medium text-foreground truncate">
                             Module {moduleIndex + 1}: {module.title}
                           </div>
                           <div className="text-xs text-muted-foreground">
                             {moduleLessons.length} lessons • {completedInModule} completed
                           </div>
                         </div>
                       </button>

                       {expandedModules.includes(module._id) && (
                         <div className="ml-8 space-y-1 mt-1">
                           {moduleLessons.map((lesson: any, lessonIndex: number) => {
                             const isCompleted = completedLessons.has(lesson._id);
                             const isActive = currentLesson?._id === lesson._id;

                             return (
                               <button
                                 key={lesson._id}
                                 onClick={() => setCurrentLesson(lesson)}
                                 className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all text-left ${
                                   isActive ? 'bg-primary/10 text-primary border-l-4 border-l-primary' : ''
                                 }`}
                               >
                                 {isCompleted ? (
                                   <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                 ) : isActive ? (
                                   <Circle className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
                                 ) : (
                                   <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                 )}
                                 {lesson.type === 'video' ? (
                                   <Video className="w-4 h-4 text-primary flex-shrink-0" />
                                 ) : lesson.type === 'assignment' ? (
                                   <FileCheck className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                 ) : (
                                   <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                 )}
                                 <div className="flex-1 min-w-0">
                                   <div className={`text-sm truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                     {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                   </div>
                                   {lesson.duration && (
                                     <div className="text-xs text-muted-foreground">
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
      </div>
    </div>
  );
};

export default CoursePlayer;
