import React, { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  User,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronDown,
  Download,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Submission {
  _id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  assignmentTitle: string;
  courseName: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'resubmit';
  grade?: number;
  feedback?: string;
  fileUrl?: string;
}

const AssignmentsGrading: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState<number[]>([0]);
  const [feedbackText, setFeedbackText] = useState('');

  // Empty state - no submissions
  const submissions: Submission[] = [];

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleGradeSubmission = () => {
    if (!selectedSubmission) return;
    // API call would go here
    console.log('Grading submission:', selectedSubmission._id, {
      grade: gradeValue[0],
      feedback: feedbackText,
    });
    setSelectedSubmission(null);
    setGradeValue([0]);
    setFeedbackText('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
      case 'graded':
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Graded</Badge>;
      case 'resubmit':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">Needs Resubmit</Badge>;
      default:
        return null;
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
        <ClipboardCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Submissions Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          When students submit assignments, they'll appear here for you to review and grade.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Graded Today</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">0%</p>
              <p className="text-sm text-muted-foreground">Avg. Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by student or assignment..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="resubmit">Needs Resubmit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission._id}
            className="bg-card rounded-xl border border-border p-4 shadow-card hover:shadow-soft transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Student Info */}
              <div className="flex items-center gap-3 flex-1">
                <Avatar>
                  <AvatarImage src={submission.studentAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {submission.studentName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-foreground">{submission.studentName}</h4>
                  <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
                </div>
              </div>

              {/* Assignment Info */}
              <div className="flex-1">
                <p className="font-medium text-foreground">{submission.assignmentTitle}</p>
                <p className="text-sm text-muted-foreground">{submission.courseName}</p>
              </div>

              {/* Submission Date */}
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{submission.submittedAt}</span>
                </div>
              </div>

              {/* Status */}
              <div>{getStatusBadge(submission.status)}</div>

              {/* Grade (if graded) */}
              {submission.grade !== undefined && (
                <div className="text-lg font-bold text-foreground">
                  {submission.grade}%
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {submission.fileUrl && (
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                )}
                <Button
                  variant={submission.status === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedSubmission(submission);
                    setGradeValue([submission.grade || 0]);
                    setFeedbackText(submission.feedback || '');
                  }}
                >
                  {submission.status === 'pending' ? 'Grade' : 'View/Edit'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Grading Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Review and grade the student's work.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6 py-4">
              {/* Student Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedSubmission.studentName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.assignmentTitle}</p>
                </div>
              </div>

              {/* Grade Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Grade</Label>
                  <span className="text-2xl font-bold text-primary">{gradeValue[0]}%</span>
                </div>
                <Slider
                  value={gradeValue}
                  onValueChange={setGradeValue}
                  max={100}
                  step={1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide constructive feedback for the student..."
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {/* Request resubmit logic */}}>
              <XCircle className="w-4 h-4 mr-1" />
              Request Resubmit
            </Button>
            <Button onClick={handleGradeSubmission}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Submit Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsGrading;
