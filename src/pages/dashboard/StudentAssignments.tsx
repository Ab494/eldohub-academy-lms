import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/store/AuthContext';
import { assignmentAPI } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'overdue';
  priority: 'low' | 'medium' | 'high';
}

const StudentAssignments: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const assignmentsResponse = await assignmentAPI.getMyAssignments();
      if (assignmentsResponse.success) {
        // Transform the data to match our interface
        const assignmentData = assignmentsResponse.data.assignments || [];
        const transformedAssignments = assignmentData.map((assignment: any) => ({
          id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          course: assignment.course.title,
          dueDate: assignment.dueDate,
          status: 'pending', // We'll need to check submissions to determine status
          priority: new Date(assignment.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'high' : 'medium'
        }));
        setAssignments(transformedAssignments);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Assignments
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your assignments and submission deadlines
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{pendingAssignments.length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{submittedAssignments.length}</div>
          <div className="text-sm text-muted-foreground">Submitted</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center shadow-card">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-foreground">{assignments.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Assignments Yet</h3>
          <p className="text-muted-foreground">
            Your assignments will appear here once they're assigned by your instructors.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending Assignments */}
          {pendingAssignments.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Deadlines</h2>
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="bg-card rounded-xl border border-border p-6 shadow-card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(assignment.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {assignment.course}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Due {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(assignment.priority)}>
                          {assignment.priority} priority
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">View Assignment</Button>
                      <Button size="sm" variant="outline">Submit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted Assignments */}
          {submittedAssignments.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">Submitted Assignments</h2>
              <div className="space-y-4">
                {submittedAssignments.map((assignment) => (
                  <div key={assignment.id} className="bg-card rounded-xl border border-border p-6 shadow-card opacity-75">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(assignment.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {assignment.course}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Submitted {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">View Submission</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;