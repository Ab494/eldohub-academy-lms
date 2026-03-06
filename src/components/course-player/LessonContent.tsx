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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface LessonContentProps {
  lesson: any;
}

const LessonContent: React.FC<LessonContentProps> = ({ lesson }) => {
  if (lesson.type === 'assignment') {
    return <AssignmentContent lesson={lesson} />;
  }
  return <RegularLessonContent lesson={lesson} />;
};

const RegularLessonContent: React.FC<{ lesson: any }> = ({ lesson }) => (
  <div className="p-6 lg:p-8">
    <div className="flex items-center gap-3 mb-4">
      {lesson.type === 'video' ? (
        <Video className="w-6 h-6 text-primary" />
      ) : (
        <FileText className="w-6 h-6 text-blue-500" />
      )}
      <Badge variant="outline" className="capitalize">
        {lesson.type}
      </Badge>
    </div>

    <h2 className="text-2xl font-bold text-foreground mb-4">{lesson.title}</h2>

    <p className="text-muted-foreground mb-6">
      {lesson.description || 'No description available for this lesson.'}
    </p>

    {lesson.type === 'video' && lesson.videoUrl && (
      <div className="mb-6">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Video Content</p>
          <a
            href={lesson.videoUrl}
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

    {lesson.type === 'text' && lesson.content && (
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            <p>{lesson.content}</p>
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

const AssignmentContent: React.FC<{ lesson: any }> = ({ lesson }) => (
  <div className="p-6 lg:p-8 space-y-6">
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="w-8 h-8" />
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            Assignment
          </Badge>
        </div>
        <h2 className="text-2xl font-bold mb-2">{lesson.title}</h2>
        <p className="text-blue-100">
          {lesson.description || 'Complete this assignment to test your understanding.'}
        </p>
      </div>

      <CardContent className="p-6">
        {lesson.questions && lesson.questions.length > 0 ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Assignment Questions</h3>
            {lesson.questions.map((question: any, index: number) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">
                    {index + 1}. {question.question}
                  </h4>
                  <div className="space-y-2">
                    {question.options.map((option: string, optIndex: number) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      >
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
            <div className="flex justify-end">
              <Button className="bg-primary hover:bg-primary/90">
                <FileCheck className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{lesson.duration || '2 hours'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  <p className="text-sm text-muted-foreground">TBD</p>
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

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Assignment Overview</h3>
              <p className="text-muted-foreground mb-4">
                This assignment will help you apply the concepts learned in this module.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Learning Objectives</h3>
              <ul className="space-y-2">
                {['Apply theoretical concepts to practical scenarios', 'Demonstrate problem-solving skills', 'Present solutions in a clear and structured manner'].map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

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
);

export default LessonContent;
