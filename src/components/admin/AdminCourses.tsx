import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Eye, Edit, Trash2, Plus, BookOpen, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { courseAPI, adminAPI } from '@/lib/apiClient';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  status: 'draft' | 'published';
  enrollmentCount: number;
  instructor: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminCourses: React.FC = () => {
  const location = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, [location.pathname]); // Run when route becomes active

  useEffect(() => {
    fetchCourses();
  }, [searchTerm, selectedStatus]); // Run when filters change

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const response = await adminAPI.getAllCourses(params);
      if (response.success) {
        setCourses(response.data.courses || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (courseId: string, newStatus: 'draft' | 'published') => {
    try {
      const response = await courseAPI.publishCourse(courseId);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
        });
        fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update course status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      const response = await courseAPI.deleteCourse(selectedCourse._id);
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Course deleted successfully',
        });
        setShowDeleteDialog(false);
        fetchCourses();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'published' ? 'default' : 'secondary';
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'secondary';
      case 'intermediate':
        return 'default';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Course Management</h2>
          <p className="text-muted-foreground">Manage all courses on the platform</p>
        </div>
        <Button className="gap-2" asChild>
          <Link to="/admin/courses/create">
            <Plus className="w-4 h-4" />
            Add Course
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Courses Table */}
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrollments</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{course.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {course.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.instructor.firstName} {course.instructor.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getLevelBadgeVariant(course.level)}>
                      {course.level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(course.status)}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {course.enrollmentCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(
                            course._id,
                            course.status === 'published' ? 'draft' : 'published'
                          )}
                        >
                          {course.status === 'published' ? 'Unpublish' : 'Publish'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowDeleteDialog(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"?
              This action cannot be undone and will affect {selectedCourse?.enrollmentCount} enrolled students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;