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
  <div className="p-4 lg:p-8 space-y-6">
    {/* Video embed area */}
    {lesson.type === 'video' && lesson.videoUrl && (
      <Card className="overflow-hidden border-primary/20 bg-secondary/5">
        <CardContent className="p-0">
          <a
            href={lesson.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 hover:bg-primary/5 transition-colors group"
          >
            <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center shrink-0 shadow-sm">
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                Watch Video Lesson
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Opens in a new tab</p>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground shrink-0" />
          </a>
        </CardContent>
      </Card>
    )}

    {/* Description */}
    {lesson.description && (
      <p className="text-muted-foreground leading-relaxed">
        {lesson.description}
      </p>
    )}

    {/* Text content */}
    {lesson.type === 'text' && lesson.content && (
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            <p>{lesson.content}</p>
          </div>
        </CardContent>
      </Card>
    )}

    {/* No-content fallback */}
    {!lesson.content && !lesson.videoUrl && !lesson.description && (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">No content available for this lesson yet.</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Check back later for updates.</p>
      </div>
    )}
  </div>
);

const AssignmentContent: React.FC<{ lesson: any }> = ({ lesson }) => (
  <div className="p-4 lg:p-8">
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
