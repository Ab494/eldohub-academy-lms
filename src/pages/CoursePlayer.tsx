import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Lock, 
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { courses } from '@/data/mockData';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

const mockModules: Module[] = [
  {
    id: '1',
    title: 'Module 1: Introduction',
    lessons: [
      { id: '1-1', title: 'Welcome to the Course', duration: '5:30', type: 'video', completed: true, locked: false },
      { id: '1-2', title: 'Course Overview', duration: '8:15', type: 'video', completed: true, locked: false },
      { id: '1-3', title: 'Setting Up Your Environment', duration: '12:00', type: 'video', completed: false, locked: false },
    ],
  },
  {
    id: '2',
    title: 'Module 2: Core Concepts',
    lessons: [
      { id: '2-1', title: 'Understanding the Basics', duration: '15:20', type: 'video', completed: false, locked: false },
      { id: '2-2', title: 'Hands-on Practice', duration: '20:00', type: 'video', completed: false, locked: false },
      { id: '2-3', title: 'Module 2 Quiz', duration: '10 mins', type: 'quiz', completed: false, locked: true },
    ],
  },
  {
    id: '3',
    title: 'Module 3: Advanced Topics',
    lessons: [
      { id: '3-1', title: 'Deep Dive into Advanced Concepts', duration: '25:00', type: 'video', completed: false, locked: true },
      { id: '3-2', title: 'Real-world Applications', duration: '30:00', type: 'video', completed: false, locked: true },
      { id: '3-3', title: 'Final Project', duration: '2 hours', type: 'assignment', completed: false, locked: true },
    ],
  },
];

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const [expandedModules, setExpandedModules] = useState<string[]>(['1']);
  const [currentLesson, setCurrentLesson] = useState('1-3');

  const course = courses.find(c => c.id === courseId) || courses[0];
  const progress = 25;

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.locked) return <Lock className="w-4 h-4 text-muted-foreground" />;
    if (lesson.completed) return <CheckCircle2 className="w-4 h-4 text-accent" />;
    if (lesson.type === 'quiz') return <FileText className="w-4 h-4 text-primary" />;
    if (lesson.type === 'assignment') return <Download className="w-4 h-4 text-primary" />;
    return <Play className="w-4 h-4 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold text-foreground truncate max-w-[200px] md:max-w-none">
                {course.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{progress}% complete</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 w-48">
              <Progress value={progress} className="h-2" />
              <span className="text-sm font-medium text-foreground">{progress}%</span>
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
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-primary/30 transition-colors">
                  <Play className="w-10 h-10 text-primary fill-primary" />
                </div>
                <p className="text-secondary-foreground text-lg font-medium">
                  Setting Up Your Environment
                </p>
                <p className="text-secondary-foreground/60 text-sm mt-1">
                  12:00 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Setting Up Your Environment
            </h2>
            <p className="text-muted-foreground mb-6">
              In this lesson, you'll learn how to set up your development environment 
              for the course. We'll cover the essential tools and configurations you'll 
              need to follow along with the practical exercises.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero">
                Mark as Complete
                <CheckCircle2 className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="outline">
                Next Lesson
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <aside className="w-full lg:w-96 border-l border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-foreground">Course Content</h3>
            <p className="text-sm text-muted-foreground mt-1">
              3 modules • 9 lessons • 2h 30m total
            </p>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            {mockModules.map((module) => (
              <div key={module.id} className="border-b border-border">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="text-left">
                    <h4 className="font-semibold text-card-foreground">
                      {module.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {module.lessons.filter(l => l.completed).length}/{module.lessons.length} lessons completed
                    </p>
                  </div>
                  {expandedModules.includes(module.id) ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedModules.includes(module.id) && (
                  <div className="pb-2">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => !lesson.locked && setCurrentLesson(lesson.id)}
                        disabled={lesson.locked}
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 text-left transition-colors",
                          currentLesson === lesson.id && "bg-primary/10",
                          lesson.locked 
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        {getLessonIcon(lesson)}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            currentLesson === lesson.id ? "text-primary" : "text-card-foreground"
                          )}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
