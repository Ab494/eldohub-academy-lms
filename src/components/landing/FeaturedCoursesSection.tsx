import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { courseAPI } from '@/lib/apiClient';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  instructor: { firstName?: string; lastName?: string; _id?: string } | string;
  rating: number;
  ratingCount: number;
  duration: number;
  level: string;
  enrollmentCount: number;
  price: number;
}

const levelColors: Record<string, string> = {
  beginner: 'bg-accent/15 text-accent',
  intermediate: 'bg-primary/15 text-primary',
  advanced: 'bg-destructive/15 text-destructive',
};

const FeaturedCoursesSection: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseAPI.getAllCourses({ limit: '3', sort: '-enrollmentCount', status: 'published' });
        const list = res?.data?.courses || res?.data || res?.courses || [];
        setCourses(Array.isArray(list) ? list.slice(0, 3) : []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const getInstructorName = (instructor: Course['instructor']) => {
    if (typeof instructor === 'object' && instructor !== null) {
      return `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Instructor';
    }
    return 'Instructor';
  };

  const formatDuration = (mins: number) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60);
    return h > 0 ? `${h}h ${mins % 60}m` : `${mins}m`;
  };

  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
          <p className="text-lg text-muted-foreground">Explore our most popular courses chosen by students</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground mb-6">Courses will appear here once they are published.</p>
            <Button variant="hero" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-medium transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative h-44 gradient-dark overflow-hidden flex items-center justify-center">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-30"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.4), transparent 60%)',
                      }}
                    />
                  )}
                  <span
                    className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full capitalize ${
                      levelColors[course.level] || levelColors.beginner
                    }`}
                  >
                    {course.level}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">{getInstructorName(course.instructor)}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span className="font-medium text-card-foreground">
                        {course.rating ? course.rating.toFixed(1) : '—'}
                      </span>
                      {course.ratingCount > 0 && <span>({course.ratingCount})</span>}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(course.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      {course.enrollmentCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xl font-extrabold text-card-foreground">
                      {course.price > 0 ? `₦${course.price.toLocaleString()}` : 'Free'}
                    </span>
                    <Button variant="hero" size="sm" asChild>
                      <Link to={`/courses/${course._id}`}>Enroll Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
