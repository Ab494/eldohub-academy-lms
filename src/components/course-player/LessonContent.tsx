import React from 'react';
import {
  Play,
  Video,
  FileText,
  FileCheck,
  CheckCircle,
  Clock,
  Calendar,
  Target,
  Download,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LessonContentProps {
  lesson: any;
}

const LessonContent: React.FC<LessonContentProps> = ({ lesson }) => {
  if (lesson.type === 'assignment') return <AssignmentContent lesson={lesson} />;
  return <RegularLessonContent lesson={lesson} />;
};

const RegularLessonContent: React.FC<{ lesson: any }> = ({ lesson }) => (
  <div className="p-4 lg:p-8 animate-fade-in">
    {/* Lesson header */}
    <div className="flex items-center gap-2 mb-3">
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center',
        lesson.type === 'video' ? 'bg-primary/10' : 'bg-accent/10'
      )}>
        {lesson.type === 'video' ? (
          <Video className="w-4 h-4 text-primary" />
        ) : (
          <FileText className="w-4 h-4 text-accent" />
        )}
      </div>
      <Badge variant="outline" className="capitalize text-xs">
        {lesson.type}
      </Badge>
      {lesson.duration && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> {lesson.duration}
        </span>
      )}
    </div>

    <h2 className="text-xl lg:text-2xl font-bold text-foreground mb-3">{lesson.title}</h2>

    <p className="text-muted-foreground leading-relaxed mb-6">
      {lesson.description || 'No description available for this lesson.'}
    </p>

    {/* Video link card */}
    {lesson.type === 'video' && lesson.videoUrl && (
      <Card className="mb-6 overflow-hidden border-primary/20">
        <CardContent className="p-0">
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 hover:bg-primary/5 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center shrink-0 shadow-sm">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Watch Video</p>
              <p className="text-xs text-muted-foreground truncate">{lesson.videoUrl}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          </a>
        </CardContent>
      </Card>
    )}

    {/* Text content */}
    {lesson.type === 'text' && lesson.content && (
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            <p>{lesson.content}</p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

const AssignmentContent: React.FC<{ lesson: any }> = ({ lesson }) => (
  <div className="p-4 lg:p-8 animate-fade-in">
    <Card className="overflow-hidden border-0 shadow-medium">
      {/* Assignment header */}
      <div className="gradient-hero p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 backdrop-blur">
            Assignment
          </Badge>
        </div>
        <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
        <p className="text-primary-foreground/80">
          {lesson.description || 'Complete this assignment to test your understanding.'}
        </p>
      </div>

      <CardContent className="p-6">
        {lesson.questions && lesson.questions.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Assignment Questions</h3>
            {lesson.questions.map((question: any, index: number) => (
              <Card key={index} className="p-4 border-border">
                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">
                    <span className="text-primary font-bold mr-2">{index + 1}.</span>
                    {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option: string, optIndex: number) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all"
                      >
                        <input type="radio" name={`question-${index}`} value={optIndex} className="w-4 h-4 text-primary accent-primary" />
                        <span className="text-sm text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
            <div className="flex justify-end">
              <Button className="gradient-hero text-primary-foreground gap-2">
                <FileCheck className="w-4 h-4" /> Submit Assignment
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { icon: Clock, label: 'Duration', value: lesson.duration || '2 hours', color: 'text-primary' },
                { icon: Calendar, label: 'Due Date', value: 'TBD', color: 'text-destructive' },
                { icon: Target, label: 'Status', value: 'Not Started', color: 'text-accent' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Icon className={cn('w-5 h-5', color)} />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-foreground mb-3">Learning Objectives</h3>
              <ul className="space-y-2">
                {['Apply theoretical concepts to practical scenarios', 'Demonstrate problem-solving skills', 'Present solutions in a clear and structured manner'].map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="gradient-hero text-primary-foreground gap-2">
                <FileCheck className="w-4 h-4" /> Start Assignment
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" /> Download Materials
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  </div>
);

export default LessonContent;
