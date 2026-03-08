import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CourseCard, { ComingSoonCard } from '@/components/courses/CourseCard';
import { useAuth } from '@/store/AuthContext';
import { courseAPI, enrollmentAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  thumbnail_url?: string | null;
  cover_image?: string | null;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  category: string;
  level: string;
  duration?: number | null;
  enrollmentCount: number;
  rating?: number | null;
  ratingCount?: number;
  price?: number | null;
  status: string;
}

interface Enrollment {
  _id: string;
  course: string | { _id: string };
  status: string;
}

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');

  useEffect(() => {
    fetchCourses();
    if (user) fetchEnrollments();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await courseAPI.getAllCourses();
      if (response.success) {
        setCourses(response.data.courses || []);
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load courses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentAPI.getMyEnrollments();
      if (response.success) setEnrollments(response.data.enrollments || []);
    } catch {
      // ok
    }
  };

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourses(prev => new Set(prev).add(courseId));
    try {
      const response = await enrollmentAPI.enrollCourse(courseId);
      if (response.success) {
        toast({ title: 'Enrollment Successful!', description: response.message || 'Your enrollment request has been submitted.' });
        fetchEnrollments();
      }
    } catch (error: any) {
      toast({ title: 'Enrollment Failed', description: error.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setEnrollingCourses(prev => { const s = new Set(prev); s.delete(courseId); return s; });
    }
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => {
      const eCourseId = typeof e.course === 'object' ? e.course._id : e.course;
      return eCourseId === courseId;
    });
    return enrollment ? enrollment.status : null;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level.toLowerCase() === levelFilter.toLowerCase();
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [...new Set(courses.map(c => c.category))];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const isSmallCatalog = courses.length < 10;
  const showComingSoon = filteredCourses.length > 0 && filteredCourses.length < 6;

  const getThumbnail = (c: Course) => c.thumbnail || c.thumbnail_url || c.cover_image || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Courses</h1>
              <p className="text-muted-foreground text-sm">
                {filteredCourses.length > 0
                  ? `Showing ${filteredCourses.length} course${filteredCourses.length !== 1 ? 's' : ''}`
                  : 'Discover and enroll in our courses'}
              </p>
            </div>
          </div>

          {/* Filters — compact for small catalogs, full for large */}
          {isSmallCatalog ? (
            <div className="flex items-center gap-3 flex-wrap">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-auto min-w-[140px] h-9 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-auto min-w-[130px] h-9 text-sm">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              {(categoryFilter !== 'all' || levelFilter !== 'all') && (
                <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter('all'); setLevelFilter('all'); }}>
                  Clear
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
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
              <Button variant="outline" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setLevelFilter('all'); }}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const status = getEnrollmentStatus(course._id);
              return (
                <CourseCard
                  key={course._id}
                  course={{
                    id: course._id,
                    title: course.title,
                    description: course.description,
                    thumbnail: getThumbnail(course),
                    instructor: `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() || 'Instructor',
                    duration: course.duration,
                    students: course.enrollmentCount || 0,
                    rating: course.rating,
                    ratingCount: course.ratingCount || 0,
                    category: course.category,
                    level: course.level,
                    price: course.price,
                  }}
                  variant={status === 'active' ? 'enrolled' : 'default'}
                  enrollmentStatus={status}
                  enrolling={enrollingCourses.has(course._id)}
                  onEnroll={() => handleEnroll(course._id)}
                  isStudent={user?.role === 'student'}
                />
              );
            })}
            {showComingSoon && <ComingSoonCard />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
