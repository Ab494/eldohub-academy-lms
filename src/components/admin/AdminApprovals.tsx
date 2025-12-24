import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Eye, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { adminAPI, courseAPI } from '@/lib/apiClient';

interface PendingCourse {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  instructor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const AdminApprovals: React.FC = () => {
  const location = useLocation();
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<PendingCourse | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingApprovals();
  }, [location.pathname]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getApprovalStats();
      if (response.success) {
        // For now, we'll get draft courses as pending approvals
        // In a real system, this might be a separate approval queue
        const coursesResponse = await adminAPI.getAllCourses({ status: 'draft', limit: 50 });
        if (coursesResponse.success) {
          setCourses(coursesResponse.data.courses || []);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch pending approvals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async () => {
    if (!selectedCourse) return;

    try {
      setActionLoading(true);
      const response = await courseAPI.publishCourse(selectedCourse._id);
      if (response.success) {
        toast({
          title: 'Success',
          description: `Course "${selectedCourse.title}" has been approved and published`,
        });
        setShowApprovalDialog(false);
        fetchPendingApprovals();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve course',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async () => {
    if (!selectedCourse) return;

    try {
      setActionLoading(true);
      const response = await courseAPI.deleteCourse(selectedCourse._id);
      if (response.success) {
        toast({
          title: 'Course Rejected',
          description: `Course "${selectedCourse.title}" has been rejected and removed`,
        });
        setShowApprovalDialog(false);
        fetchPendingApprovals();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to reject course',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-foreground">Course Approvals</h2>
          <p className="text-muted-foreground">Review and approve pending course submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {courses.length} Pending
          </Badge>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  Loading pending approvals...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Approvals</h3>
                  <p className="text-muted-foreground">
                    All course submissions have been reviewed.
                  </p>
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
                    <div>
                      <div className="font-medium">
                        {course.instructor.firstName} {course.instructor.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {course.instructor.email}
                      </div>
                    </div>
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
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {new Date(course.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowApprovalDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Course Submission</DialogTitle>
            <DialogDescription>
              Review the course details and decide whether to approve or reject this submission.
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Course Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {selectedCourse.title}</div>
                    <div><strong>Category:</strong> {selectedCourse.category}</div>
                    <div><strong>Level:</strong> {selectedCourse.level}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedCourse.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Instructor</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedCourse.instructor.firstName} {selectedCourse.instructor.lastName}</div>
                    <div><strong>Email:</strong> {selectedCourse.instructor.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectCourse}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Course
            </Button>
            <Button
              onClick={handleApproveCourse}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApprovals;