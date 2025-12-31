import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EnrolledCourseCard from '@/components/dashboard/EnrolledCourseCard';
import { useAuth } from '@/store/AuthContext';
import { enrollmentAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructor?: {
      firstName: string;
      lastName: string;
    };
  };
  progressPercentage: number;
  status: string;
  enrollmentDate: string;
}

const StudentCourses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'rejected'>('active');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const enrollmentsResponse = await enrollmentAPI.getMyEnrollments();
      if (enrollmentsResponse.success) {
        setEnrollments(enrollmentsResponse.data.enrollments || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const activeEnrollments = enrollments.filter(e => e.status === 'active');
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending_approval');
  const rejectedEnrollments = enrollments.filter(e => e.status === 'rejected');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            My Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your course enrollments and progress
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/courses">
            Browse Courses
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't enrolled in any courses yet. Start learning today!
          </p>
          <Button variant="hero" asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="relative">
              Active
              {activeEnrollments.length > 0 && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {activeEnrollments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending Approval
              {pendingEnrollments.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {pendingEnrollments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="relative">
              Rejected
              {rejectedEnrollments.length > 0 && (
                <Badge className="ml-2 bg-red-100 text-red-800">
                  {rejectedEnrollments.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeEnrollments.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Active Courses</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any approved course enrollments yet.
                </p>
                <Button variant="hero" asChild>
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {activeEnrollments.map((enrollment) => (
                  <EnrolledCourseCard
                    key={enrollment._id}
                    course={{
                      _id: enrollment.course._id,
                      title: enrollment.course.title,
                      thumbnail: enrollment.course.thumbnail,
                      instructor: enrollment.course.instructor,
                      progressPercentage: enrollment.progressPercentage,
                      status: enrollment.status,
                      enrollmentDate: enrollment.enrollmentDate,
                    }}
                    onContinue={handleContinueCourse}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingEnrollments.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Approvals</h3>
                <p className="text-muted-foreground">
                  You don't have any enrollment requests waiting for approval.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingEnrollments.map((enrollment) => (
                  <div key={enrollment._id} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{enrollment.course.title}</h3>
                        <p className="text-muted-foreground">
                          by {enrollment.course.instructor
                            ? `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`
                            : 'Unknown Instructor'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Requested on {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
                    </div>
                    <p className="text-muted-foreground">
                      Your enrollment request is being reviewed by the instructor. You'll be notified once it's approved.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedEnrollments.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Rejected Requests</h3>
                <p className="text-muted-foreground">
                  You don't have any rejected enrollment requests.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {rejectedEnrollments.map((enrollment) => (
                  <div key={enrollment._id} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{enrollment.course.title}</h3>
                        <p className="text-muted-foreground">
                          by {enrollment.course.instructor
                            ? `${enrollment.course.instructor.firstName} ${enrollment.course.instructor.lastName}`
                            : 'Unknown Instructor'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Rejected on {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Your enrollment request was not approved. You can try enrolling again or contact the instructor.
                    </p>
                    <Button variant="outline" size="sm">
                      Contact Instructor
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StudentCourses;