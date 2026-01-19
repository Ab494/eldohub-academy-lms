import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { moduleAPI, lessonAPI, courseAPI } from '@/lib/apiClient';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Video,
  FileText,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
  Save,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

interface Lesson {
  _id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration?: string;
  isPublished: boolean;
  questions?: Array<{ question: string; options: string[]; correctAnswer: number }>;
}

interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

interface Course {
  _id: string;
  title: string;
  status: 'draft' | 'published';
}

const CourseBuilder: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonData, setNewLessonData] = useState({
    title: '',
    type: 'video' as 'video' | 'text' | 'quiz' | 'assignment',
    content: '',
    videoUrl: '',
    questions: [] as Array<{ question: string; options: string[]; correctAnswer: number }>,
  });

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  React.useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const res = await (await import('@/lib/apiClient')).courseAPI.getInstructorCourses({ page: 1, limit: 50 });
        const payload = res.data || res;
        setCourses(payload.courses || []);
      } catch (err) {
        console.error('Failed to load courses for builder', err);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [courseId]);

  // Load modules when a course is selected
  useEffect(() => {
    const loadModules = async () => {
      if (selectedCourse) {
        try {
          const res = await (await import('@/lib/apiClient')).moduleAPI.getCourseModules(selectedCourse);
          const payload = res.data || res;
          setModules(payload || []);
        } catch (err) {
          console.error('Failed to load modules', err);
        }
      }
    };

    loadModules();
  }, [selectedCourse]);

  const toggleModuleExpand = (moduleId: string) => {
    setModules(modules.map(m =>
      m._id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
    ));
  };

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    
    const newModule: Module = {
      _id: `module-${Date.now()}`,
      title: newModuleTitle,
      lessons: [],
      isExpanded: true,
    };
    
    setModules([...modules, newModule]);
    setNewModuleTitle('');
    setShowModuleDialog(false);
  };

  const handleAddLesson = () => {
    if (!newLessonData.title.trim() || !activeModuleId) return;

    const newLesson: Lesson = {
      _id: `lesson-${Date.now()}`,
      title: newLessonData.title,
      type: newLessonData.type,
      duration: newLessonData.type === 'video' ? '10:00' : undefined,
      isPublished: false,
      questions: newLessonData.type === 'assignment' ? newLessonData.questions : undefined,
    };

    setModules(modules.map(m =>
      m._id === activeModuleId
        ? { ...m, lessons: [...m.lessons, newLesson] }
        : m
    ));

    setNewLessonData({ title: '', type: 'video', content: '', videoUrl: '', questions: [] });
    setShowLessonDialog(false);
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter(m => m._id !== moduleId));
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m =>
      m._id === moduleId
        ? { ...m, lessons: m.lessons.filter(l => l._id !== lessonId) }
        : m
    ));
  };

  const toggleLessonPublish = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m =>
      m._id === moduleId
        ? {
            ...m,
            lessons: m.lessons.map(l =>
              l._id === lessonId ? { ...l, isPublished: !l.isPublished } : l
            ),
          }
        : m
    ));
  };

  const handlePublishChanges = async () => {
    if (!selectedCourse) return;

    try {
      // Save modules and lessons
      for (const module of modules) {
        // Create module
        const moduleData = { title: module.title };
        const moduleResponse = await moduleAPI.createModule(selectedCourse, moduleData);
        const createdModuleId = moduleResponse.data._id;

        // Create lessons for this module
        for (const lesson of module.lessons) {
          const lessonData = {
            title: lesson.title,
            description: `Description for ${lesson.title}`,
            type: lesson.type,
            content: lesson.type === 'text' ? 'Sample content' : 'Sample content',
            videoUrl: lesson.type === 'video' ? 'https://example.com/video' : undefined,
            duration: lesson.duration,
            questions: lesson.questions, // Include questions for assignments
          };
          await lessonAPI.createLesson(selectedCourse, createdModuleId, lessonData);
        }
      }

      // Publish the course
      await courseAPI.publishCourse(selectedCourse);

      toast({
        title: 'Changes Published Successfully!',
        description: 'Your course content has been saved and published.',
      });
    } catch (error: any) {
      console.error('Failed to publish changes', error);
      toast({
        title: 'Publish Failed',
        description: error.message || 'Failed to publish changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-primary" />;
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'quiz':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (courses.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
        <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Courses to Build</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create a course first, then come back here to add modules and lessons.
        </p>
        <Button variant="hero" asChild>
          <Link to="/instructor/courses/new">
            <Plus className="w-4 h-4 mr-1" />
            Create Course
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-1">
            <Label>Select Course to Edit</Label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    <div className="flex items-center gap-2">
                      <span>{course.title}</span>
                      <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                        {course.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCourse && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/course/${selectedCourse}`)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={handlePublishChanges}
              >
                <Save className="w-4 h-4 mr-1" />
                Publish Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedCourse ? (
        <div className="space-y-4">
          {/* Add Module Button */}
          <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" />
                Add New Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Module</DialogTitle>
                <DialogDescription>
                  Modules help organize your course content into logical sections.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title</Label>
                  <Input
                    id="module-title"
                    placeholder="e.g., Introduction to the Course"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddModule}>Create Module</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modules List */}
          {modules.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No modules yet. Add your first module to start building the course.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {modules.map((module, moduleIndex) => (
                <Collapsible
                  key={module._id}
                  open={module.isExpanded}
                  onOpenChange={() => toggleModuleExpand(module._id)}
                  className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      {module.isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          Module {moduleIndex + 1}: {module.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveModuleId(module._id);
                            setShowLessonDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModule(module._id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="border-t border-border">
                      {module.lessons.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No lessons in this module yet.
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson._id}
                              className="flex items-center gap-3 p-3 pl-12 hover:bg-muted/30 transition-colors"
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                              {getLessonIcon(lesson.type)}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="capitalize">{lesson.type}</span>
                                  {lesson.duration && <span>• {lesson.duration}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleLessonPublish(module._id, lesson._id)}
                                  title={lesson.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  {lesson.isPublished ? (
                                    <Eye className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteLesson(module._id, lesson._id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="p-3 pl-12">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => {
                            setActiveModuleId(module._id);
                            setShowLessonDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lesson
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a Course</h3>
          <p className="text-muted-foreground">
            Choose a course from the dropdown above to start building its content.
          </p>
        </div>
      )}

      {/* Add Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Create a new lesson for this module.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                placeholder="e.g., Getting Started"
                value={newLessonData.title}
                onChange={(e) => setNewLessonData({ ...newLessonData, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Lesson Type</Label>
              <Select
                value={newLessonData.type}
                onValueChange={(value: 'video' | 'text' | 'quiz' | 'assignment') =>
                  setNewLessonData({ ...newLessonData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Video Lesson
                    </div>
                  </SelectItem>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text/Article
                    </div>
                  </SelectItem>
                  <SelectItem value="quiz">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Quiz
                    </div>
                  </SelectItem>
                  <SelectItem value="assignment">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Assignment
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newLessonData.type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={newLessonData.videoUrl}
                  onChange={(e) => setNewLessonData({ ...newLessonData, videoUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Supports YouTube, Vimeo, or direct video URLs
                </p>
              </div>
            )}

            {newLessonData.type === 'text' && (
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your lesson content..."
                  rows={6}
                  value={newLessonData.content}
                  onChange={(e) => setNewLessonData({ ...newLessonData, content: e.target.value })}
                />
              </div>
            )}

            {newLessonData.type === 'assignment' && (
              <div className="space-y-4">
                <Label>Assignment Questions</Label>
                {newLessonData.questions.map((q, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Question text"
                        value={q.question}
                        onChange={(e) => {
                          const newQuestions = [...newLessonData.questions];
                          newQuestions[index].question = e.target.value;
                          setNewLessonData({ ...newLessonData, questions: newQuestions });
                        }}
                      />
                      {q.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2">
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newQuestions = [...newLessonData.questions];
                              newQuestions[index].options[optIndex] = e.target.value;
                              setNewLessonData({ ...newLessonData, questions: newQuestions });
                            }}
                          />
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={q.correctAnswer === optIndex}
                            onChange={() => {
                              const newQuestions = [...newLessonData.questions];
                              newQuestions[index].correctAnswer = optIndex;
                              setNewLessonData({ ...newLessonData, questions: newQuestions });
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newQuestions = [...newLessonData.questions];
                          newQuestions[index].options.push('');
                          setNewLessonData({ ...newLessonData, questions: newQuestions });
                        }}
                      >
                        Add Option
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewLessonData({
                      ...newLessonData,
                      questions: [...newLessonData.questions, {
                        question: '',
                        options: ['', ''],
                        correctAnswer: 0
                      }]
                    });
                  }}
                >
                  Add Question
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLesson}>Add Lesson</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseBuilder;
