import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  Users,
  Clock,
  Star,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CourseCard from '@/components/courses/CourseCard';
import { useAuth } from '@/store/AuthContext';
import { courseAPI, enrollmentAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  enrollmentCount: number;
  rating: number;
  price?: number;
  status: string;
}

interface Enrollment {
  _id: string;
  course: string;
  status: string;
}

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      if (response.success) {
        setCourses(response.data.courses || []);
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

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyEnrollments();
      if (response.success) {
        setEnrollments(response.data.enrollments || []);
      }
    } catch (error: any) {
      // Enrollments might not exist yet, continue
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await enrollmentAPI.enrollCourse(courseId);
      if (response.success) {
        toast({
          title: 'Enrollment Requested',
          description: 'Your enrollment request has been submitted for approval.',
        });
        // Refresh enrollments
        fetchEnrollments();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enroll in course',
        variant: 'destructive',
      });
    }
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course === courseId);
    return enrollment ? enrollment.status : null;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [...new Set(courses.map(course => course.category))];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Courses</h1>
              <p className="text-muted-foreground">Discover and enroll in our courses</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Course Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || categoryFilter !== 'all' || levelFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No courses are available at the moment'}
            </p>
            {(searchTerm || categoryFilter !== 'all' || levelFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setLevelFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrollmentStatus = getEnrollmentStatus(course._id);

              return (
                <div key={course._id} className="relative">
                  <CourseCard
                    course={{
                      id: course._id,
                      title: course.title,
                      description: course.description,
                      thumbnail: course.thumbnail,
                      instructor: `${course.instructor.firstName} ${course.instructor.lastName}`,
                      duration: course.duration || '0h',
                      students: course.enrollmentCount,
                      rating: course.rating || 0,
                      category: course.category,
                      level: course.level,
                    }}
                    variant={enrollmentStatus === 'active' ? 'enrolled' : 'default'}
                  />

                  {/* Enrollment Status Overlay */}
                  {enrollmentStatus && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={
                          enrollmentStatus === 'active'
                            ? 'bg-green-100 text-green-800'
                            : enrollmentStatus === 'pending_approval'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {enrollmentStatus === 'active' ? 'Enrolled' :
                         enrollmentStatus === 'pending_approval' ? 'Pending' :
                         enrollmentStatus === 'rejected' ? 'Rejected' : enrollmentStatus}
                      </Badge>
                    </div>
                  )}

                  {/* Enroll Button */}
                  {(!enrollmentStatus || enrollmentStatus === 'rejected') && user?.role === 'student' && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course._id)}
                      >
                        Register for Course
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;