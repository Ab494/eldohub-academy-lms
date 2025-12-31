import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Eye,
  Edit,
  Settings,
  MoreVertical,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { courseAPI } from '@/lib/apiClient';

interface Course {
  _id: string;
  title: string;
  status: 'draft' | 'published';
  enrolledCount: number;
  completionRate: number;
  thumbnail?: string;
  category: string;
}

const InstructorCourseList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await courseAPI.getInstructorCourses({ page: 1, limit: 20 });
        // Backend returns { courses, total, pages, currentPage }
        const payload = res.data || res;
        setCourses(payload.courses || []);
      } catch (err: any) {
        console.error('Failed to load instructor courses', err);
        setError(err?.message || 'Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
        <div className="loader">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Created</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start creating your first course and share your knowledge with students around the world!
        </p>
        <Button variant="hero" asChild>
          <Link to="/instructor/courses/create">
            <Plus className="w-4 h-4 mr-1" />
            Create Your First Course
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            className="bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-soft transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Course Thumbnail */}
              <div className="w-full lg:w-32 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.category}</p>
                  </div>
                  <Badge
                    variant={course.status === 'published' ? 'default' : 'secondary'}
                    className={course.status === 'published' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : ''}
                  >
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledCount} students</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-32">
                    <span className="text-muted-foreground text-xs">Completion:</span>
                    <Progress value={course.completionRate} className="h-2 flex-1" />
                    <span className="text-xs font-medium">{course.completionRate}%</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/instructor/courses/${course._id}/edit`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/instructor/courses/${course._id}/content`}>
                    <Settings className="w-4 h-4 mr-1" />
                    Manage
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/instructor/courses/${course._id}/students`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Students
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Analytics</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate Course</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete Course</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorCourseList;
