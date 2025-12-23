import React from 'react';
import { Link } from 'react-router-dom';
import { Play, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface EnrolledCourseCardProps {
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructor: {
      firstName: string;
      lastName: string;
    };
    progressPercentage: number;
    status: string;
    enrollmentDate: string;
  };
  onContinue: (courseId: string) => void;
}

const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ course, onContinue }) => {
  const instructorName = `${course.instructor.firstName} ${course.instructor.lastName}`;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Course Thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{instructorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Enrolled {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{course.progressPercentage}%</span>
                  </div>
                  <Progress value={course.progressPercentage} className="h-2" />
                </div>

                {/* Status Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    course.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : course.progressPercentage > 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {course.status === 'completed' ? 'Completed' :
                     course.progressPercentage > 0 ? 'In Progress' : 'Not Started'}
                  </span>
                </div>
              </div>

              {/* Continue Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => onContinue(course._id)}
                  className="gap-2"
                  variant={course.progressPercentage === 0 ? "default" : "outline"}
                >
                  <Play className="w-4 h-4" />
                  {course.progressPercentage === 0 ? 'Start Learning' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrolledCourseCard;