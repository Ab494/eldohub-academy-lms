import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { courseAPI } from '@/lib/apiClient';

const InstructorCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
  });

  useEffect(() => {
    if (courseId) {
      setIsEdit(true);
      // Fetch course data for editing
      const fetchCourse = async () => {
        try {
          const response = await courseAPI.getCourseById(courseId);
          if (response.success) {
            const course = response.data;
            setFormData({
              title: course.title || '',
              description: course.description || '',
              category: course.category || '',
              level: course.level || 'beginner',
              price: course.price || 0,
            });
          }
        } catch (error: any) {
          toast({
            title: 'Error',
            description: 'Failed to load course data',
            variant: 'destructive',
          });
        }
      };
      fetchCourse();
    }
  }, [courseId, toast]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const courseData = {
        ...formData,
        status: 'draft' as const, // Instructors create draft courses that need admin approval
      };

      let response;
      if (isEdit && courseId) {
        response = await courseAPI.updateCourse(courseId, courseData);
        if (response.success) {
          toast({
            title: 'Course Updated Successfully!',
            description: 'Your course has been updated.',
          });
        }
      } else {
        response = await courseAPI.createCourse(courseData);
        if (response.success) {
          toast({
            title: 'Course Created Successfully!',
            description: 'Your course has been submitted for admin approval.',
          });
        }
      }

      if (response.success) {
        navigate('/instructor');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} course`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/instructor">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
           <h1 className="text-2xl font-bold text-foreground">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
           <p className="text-muted-foreground">{isEdit ? 'Update your course details' : 'Share your knowledge with students worldwide'}</p>
         </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your course will be created as a draft and submitted for admin approval before it can be published.
        </AlertDescription>
      </Alert>

      {/* Course Creation Form */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Web Development, Data Science, Design"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Course Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what students will learn, the course objectives, and who this course is for..."
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
              <Select
                value={formData.level}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                  handleInputChange('level', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - No prior knowledge required</SelectItem>
                  <SelectItem value="intermediate">Intermediate - Some basic knowledge needed</SelectItem>
                  <SelectItem value="advanced">Advanced - Deep understanding required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00 (Free if left empty)"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 for free courses
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" asChild>
              <Link to="/instructor">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? 'Updating Course...' : 'Creating Course...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Course' : 'Submit for Approval'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorCourseCreate;