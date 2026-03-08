import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Upload, X, Plus, Search } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { courseAPI } from '@/lib/apiClient';

interface CourseOption {
  _id: string;
  title: string;
}

const AdminCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseAPI.getAllCourses({ limit: '100' });
        if (response.success) setAvailableCourses(response.data.courses || []);
      } catch { /* silent */ }
    };
    fetchCourses();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Error', description: 'Image must be under 10MB', variant: 'destructive' });
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  const togglePrerequisite = (id: string) => {
    setPrerequisites(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const filteredCourses = availableCourses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.category.trim()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      setIsLoading(true);
      const courseData = { ...formData, tags, prerequisites, status: 'draft' as const };
      const response = await courseAPI.createCourse(courseData);

      if (thumbnailFile && response.data?._id) {
        try {
          await courseAPI.uploadThumbnail(response.data._id, thumbnailFile);
        } catch {
          toast({ title: 'Warning', description: 'Course created but thumbnail upload failed' });
        }
      }

      if (response.success) {
        toast({ title: 'Success', description: 'Course created successfully' });
        navigate('/admin/courses');
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to create course', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
          <p className="text-muted-foreground">Fill in the course details to get started</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-6">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input id="title" placeholder="Enter course title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input id="category" placeholder="e.g., Web Development, Data Science" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description *</Label>
            <Textarea id="description" placeholder="Describe what students will learn..." rows={4} value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level</Label>
              <Select value={formData.level} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => handleInputChange('level', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min="0" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Course Thumbnail</h2>
          <p className="text-sm text-muted-foreground">Recommended: 1280×720px (16:9).</p>
          {thumbnailPreview ? (
            <div className="relative w-full max-w-md">
              <img src={thumbnailPreview} alt="Thumbnail" className="w-full aspect-video object-cover rounded-lg border border-border" />
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={removeThumbnail}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label htmlFor="thumb-upload" className="flex flex-col items-center justify-center w-full max-w-md h-44 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium text-muted-foreground">Click to upload thumbnail</span>
              <span className="text-xs text-muted-foreground/70 mt-1">JPEG, PNG, WebP up to 10MB</span>
              <input id="thumb-upload" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleThumbnailChange} />
            </label>
          )}
        </div>

        {/* Tags */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Tags & Keywords</h2>
          <div className="flex gap-2">
            <Input placeholder="Type a tag and press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
              <Plus className="w-4 h-4 mr-1" />Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Prerequisites */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">Prerequisites</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search courses..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} className="pl-9" />
          </div>
          {prerequisites.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {prerequisites.map(id => {
                const course = availableCourses.find(c => c._id === id);
                return (
                  <Badge key={id} variant="default" className="gap-1 px-3 py-1">
                    {course?.title || id}
                    <button type="button" onClick={() => togglePrerequisite(id)} className="ml-1"><X className="w-3 h-3" /></button>
                  </Badge>
                );
              })}
            </div>
          )}
          <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {filteredCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No courses found</p>
            ) : filteredCourses.map(course => (
              <label key={course._id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors">
                <input type="checkbox" checked={prerequisites.includes(course._id)} onChange={() => togglePrerequisite(course._id)} className="rounded border-border" />
                <span className="text-sm text-foreground">{course.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 pt-2">
          <Button variant="outline" asChild><Link to="/admin/courses">Cancel</Link></Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Course...</>) : (<><Save className="w-4 h-4 mr-2" />Create Course</>)}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseCreate;
