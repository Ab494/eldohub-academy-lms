import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Lock, 
  ChevronDown,
  ChevronUp,
  Download,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
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
              <h1 className="font-semibold text-foreground">
                Course #{courseId}
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
        {/* Video Player Area - Empty State */}
        <div className="flex-1">
          <div className="aspect-video bg-secondary">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-secondary-foreground text-lg font-medium">
                  No lessons available
                </p>
                <p className="text-secondary-foreground/60 text-sm mt-1">
                  Course content will appear here
                </p>
              </div>
            </div>
          </div>

          {/* Lesson Content */}
          <div className="p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Welcome to the Course
            </h2>
            <p className="text-muted-foreground mb-6">
              This course doesn't have any content yet. Check back later for updates.
            </p>

            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <aside className="w-full lg:w-96 border-l border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-bold text-foreground">Course Content</h3>
            <p className="text-sm text-muted-foreground mt-1">
              0 modules • 0 lessons • 0h total
            </p>
          </div>

          <div className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No modules available</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CoursePlayer;
