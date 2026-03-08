import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle2,
  Loader2,
  Play,
  GraduationCap,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { courseAPI, moduleAPI, enrollmentAPI } from '@/lib/apiClient';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/hooks/use-toast';

const levelStyles: Record<string, string> = {
  beginner: 'bg-accent/15 text-accent border-accent/20',
  intermediate: 'bg-primary/15 text-primary border-primary/20',
  advanced: 'bg-destructive/15 text-destructive border-destructive/20',
};

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseRes, modulesRes] = await Promise.all([
          courseAPI.getCourseById(courseId),
          moduleAPI.getCourseModules(courseId),
        ]);

        if (courseRes.success) setCourse(courseRes.data);
        if (modulesRes.success) setModules(modulesRes.data || []);

        // Fetch enrollment status if logged in
        if (user) {
          try {
            const enrollRes = await enrollmentAPI.getMyEnrollments({ limit: '100' });
            if (enrollRes.success) {
              const enrollment = (enrollRes.data.enrollments || []).find((e: any) => {
                const eCourseId = typeof e.course === 'object' ? e.course._id : e.course;
                return eCourseId === courseId;
              });
              if (enrollment) {
                setEnrollmentStatus(enrollment.status);
                setEnrollmentProgress(enrollment.progressPercentage || 0);
              }
            }
          } catch {
            // silent
          }
        }
      } catch {
        toast({ title: 'Error', description: 'Failed to load course', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user, toast]);

  const handleEnroll = async () => {
    if (!courseId) return;
    setEnrolling(true);
    try {
      const res = await enrollmentAPI.enrollCourse(courseId);
      if (res.success) {
        setEnrollmentStatus('pending_approval');
        toast({ title: 'Enrollment Submitted!', description: res.message || 'Awaiting admin approval.' });
      }
    } catch (error: any) {
      toast({ title: 'Enrollment Failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setEnrolling(false);
    }
  };

  const totalLessons = modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const levelKey = course?.level?.toLowerCase() || 'beginner';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Course not found</h2>
          <Button variant="outline" asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  const instructorName = course.instructor
    ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim()
    : 'Instructor';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <Button variant="ghost" size="sm" className="mb-4 gap-1.5" asChild>
            <Link to="/courses"><ArrowLeft className="w-4 h-4" /> Back to Courses</Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="text-xs">{course.category}</Badge>
                <Badge className={cn('text-xs capitalize border', levelStyles[levelKey] || levelStyles.beginner)}>
                  {course.level}
                </Badge>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{course.title}</h1>

              <p className="text-muted-foreground leading-relaxed">{course.description}</p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> {instructorName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {course.enrollmentCount || 0} students
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> {totalLessons} lessons
                </span>
                {course.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {Math.floor(course.duration / 60)}h {course.duration % 60}m
                  </span>
                )}
                {course.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-primary text-primary" /> {course.rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Enrollment Card */}
            <div className="bg-background rounded-xl border border-border p-6 space-y-4 shadow-card">
              {/* Thumbnail */}
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover rounded-lg" />
              )}

              {/* Price */}
              <div className="text-center">
                {course.price && course.price > 0 ? (
                  <span className="text-3xl font-extrabold text-foreground">₦{course.price.toLocaleString()}</span>
                ) : (
                  <span className="text-3xl font-extrabold text-accent">Free</span>
                )}
              </div>

              {/* Enrollment Status & CTA */}
              {enrollmentStatus === 'active' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-center text-accent">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">You're Enrolled</span>
                  </div>
                  {enrollmentProgress > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-accent">{enrollmentProgress}%</span>
                      </div>
                      <Progress value={enrollmentProgress} className="h-2" />
                    </div>
                  )}
                  <Button className="w-full" onClick={() => navigate(`/course/${courseId}`)}>
                    <Play className="w-4 h-4 mr-2" />
                    {enrollmentProgress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Button>
                </div>
              ) : enrollmentStatus === 'pending_approval' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-center text-primary">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Enrollment Pending</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Your enrollment request is awaiting admin approval. You'll be notified once approved.
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Awaiting Approval
                  </Button>
                </div>
              ) : enrollmentStatus === 'rejected' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-center text-destructive">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-semibold">Enrollment Rejected</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Your enrollment was not approved. Contact the instructor for details.
                  </p>
                  <Button className="w-full" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? 'Reapplying...' : 'Reapply'}
                  </Button>
                </div>
              ) : enrollmentStatus === 'completed' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 justify-center text-accent">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Course Completed</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  <Button className="w-full" onClick={() => navigate(`/course/${courseId}`)}>
                    <Play className="w-4 h-4 mr-2" /> Review Course
                  </Button>
                </div>
              ) : user?.role === 'student' ? (
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              ) : (
                <Button className="w-full" size="lg" asChild>
                  <Link to="/login">Login to Enroll</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Course Content
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {modules.length} {modules.length === 1 ? 'module' : 'modules'} • {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
        </p>

        {modules.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Course content is being prepared.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {modules.map((mod: any, idx: number) => (
              <div key={mod._id} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Module {idx + 1}: {mod.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {mod.lessons?.length || 0} {(mod.lessons?.length || 0) === 1 ? 'lesson' : 'lessons'}
                    </p>
                  </div>
                </div>
                {mod.lessons && mod.lessons.length > 0 && (
                  <div className="border-t border-border">
                    {mod.lessons.map((lesson: any, lIdx: number) => (
                      <div
                        key={lesson._id}
                        className="flex items-center gap-3 px-5 py-3 text-sm border-b border-border last:border-b-0"
                      >
                        <span className="text-muted-foreground w-6 text-center">{lIdx + 1}</span>
                        <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-foreground">{lesson.title}</span>
                        <Badge variant="outline" className="ml-auto text-xs capitalize">{lesson.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
