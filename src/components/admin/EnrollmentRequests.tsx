import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  BookOpen,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/store/AuthContext';
import { enrollmentAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface EnrollmentRequest {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
    instructor: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  enrollmentDate: string;
  status: string;
}

interface EnrollmentRequestsProps {
  title?: string;
}

const EnrollmentRequests: React.FC<EnrollmentRequestsProps> = ({
  title = "Enrollment Requests"
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getPendingEnrollments();
      if (response.success) {
        setRequests(response.data.enrollments || []);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load enrollment requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    try {
      setProcessing(enrollmentId);
      const response = await enrollmentAPI.approveEnrollment(enrollmentId);
      if (response.success) {
        toast({
          title: 'Enrollment Approved',
          description: 'The student has been enrolled in the course.',
        });
        // Remove from requests list
        setRequests(prev => prev.filter(req => req._id !== enrollmentId));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve enrollment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    try {
      setProcessing(enrollmentId);
      const response = await enrollmentAPI.rejectEnrollment(enrollmentId);
      if (response.success) {
        toast({
          title: 'Enrollment Rejected',
          description: 'The enrollment request has been rejected.',
        });
        // Remove from requests list
        setRequests(prev => prev.filter(req => req._id !== enrollmentId));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject enrollment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2">Loading requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {title}
          {requests.length > 0 && (
            <Badge variant="secondary">{requests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              There are no pending enrollment requests at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {request.student.firstName} {request.student.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({request.student.email})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{request.course.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Instructor: {request.course.instructor.firstName} {request.course.instructor.lastName}</span>
                      <span>•</span>
                      <span>Requested: {new Date(request.enrollmentDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(request._id)}
                    disabled={processing === request._id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing === request._id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(request._id)}
                    disabled={processing === request._id}
                  >
                    {processing === request._id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentRequests;