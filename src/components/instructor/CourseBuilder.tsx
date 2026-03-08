import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { moduleAPI, lessonAPI, courseAPI } from '@/lib/apiClient';
import {
  BookOpen,
  Plus,
  Eye,
  Save,
  Settings,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import type { ModuleData, LessonData, CourseData } from './course-builder/types';
import ModuleDialog from './course-builder/ModuleDialog';
import LessonDialog from './course-builder/LessonDialog';
import SortableModule from './course-builder/SortableModule';

const CourseBuilder: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState('');
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Dialog state
  const [moduleDialog, setModuleDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    moduleId?: string;
    title?: string;
    description?: string;
  }>({ open: false, mode: 'create' });

  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    moduleId: string;
    lesson?: LessonData | null;
  }>({ open: false, mode: 'create', moduleId: '', lesson: null });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const res = await courseAPI.getInstructorCourses({ page: 1, limit: 50 });
        const payload = res.data || res;
        setCourses(payload.courses || []);
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) setSelectedCourse(courseId);
  }, [courseId]);

  // Load modules when course selected
  useEffect(() => {
    const loadModules = async () => {
      if (!selectedCourse) return;
      try {
        const res = await moduleAPI.getCourseModules(selectedCourse);
        const data = res.data || res;
        setModules(
          (data || []).map((m: any) => ({
            ...m,
            isExpanded: true,
            lessons: m.lessons || [],
          }))
        );
      } catch (err) {
        console.error('Failed to load modules', err);
      }
    };
    loadModules();
  }, [selectedCourse]);

  // Module CRUD
  const handleModuleSubmit = useCallback(
    (title: string, description: string) => {
      if (moduleDialog.mode === 'create') {
        const newModule: ModuleData = {
          _id: `module-${Date.now()}`,
          title,
          description,
          lessons: [],
          isExpanded: true,
        };
        setModules((prev) => [...prev, newModule]);
      } else if (moduleDialog.moduleId) {
        setModules((prev) =>
          prev.map((m) =>
            m._id === moduleDialog.moduleId ? { ...m, title, description } : m
          )
        );
      }
      setModuleDialog({ open: false, mode: 'create' });
    },
    [moduleDialog]
  );

  const handleDeleteModule = useCallback((moduleId: string) => {
    setModules((prev) => prev.filter((m) => m._id !== moduleId));
  }, []);

  // Lesson CRUD
  const handleLessonSubmit = useCallback(
    (lessonData: Omit<LessonData, '_id' | 'isPublished'>) => {
      const { moduleId, mode, lesson } = lessonDialog;
      if (mode === 'create') {
        const newLesson: LessonData = {
          ...lessonData,
          _id: `lesson-${Date.now()}`,
          isPublished: false,
        };
        setModules((prev) =>
          prev.map((m) =>
            m._id === moduleId ? { ...m, lessons: [...m.lessons, newLesson] } : m
          )
        );
      } else if (lesson) {
        setModules((prev) =>
          prev.map((m) =>
            m._id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l._id === lesson._id ? { ...l, ...lessonData } : l
                  ),
                }
              : m
          )
        );
      }
      setLessonDialog({ open: false, mode: 'create', moduleId: '', lesson: null });
    },
    [lessonDialog]
  );

  const handleDeleteLesson = useCallback((moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m._id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l._id !== lessonId) } : m
      )
    );
  }, []);

  const toggleLessonPublish = useCallback((moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m._id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l._id === lessonId ? { ...l, isPublished: !l.isPublished } : l
              ),
            }
          : m
      )
    );
  }, []);

  const toggleModuleExpand = useCallback((moduleId: string) => {
    setModules((prev) =>
      prev.map((m) => (m._id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m))
    );
  }, []);

  // Drag and drop
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setModules((prev) => {
      // Check if it's a module drag
      const activeModuleIdx = prev.findIndex((m) => m._id === active.id);
      const overModuleIdx = prev.findIndex((m) => m._id === over.id);

      if (activeModuleIdx !== -1 && overModuleIdx !== -1) {
        return arrayMove(prev, activeModuleIdx, overModuleIdx);
      }

      // It's a lesson drag within a module
      return prev.map((m) => {
        const activeLessonIdx = m.lessons.findIndex((l) => l._id === active.id);
        const overLessonIdx = m.lessons.findIndex((l) => l._id === over.id);
        if (activeLessonIdx !== -1 && overLessonIdx !== -1) {
          return { ...m, lessons: arrayMove(m.lessons, activeLessonIdx, overLessonIdx) };
        }
        return m;
      });
    });
  }, []);

  // Publish
  const handlePublishChanges = async () => {
    if (!selectedCourse) return;
    setIsPublishing(true);
    try {
      for (const module of modules) {
        const moduleData = { title: module.title, description: module.description };
        const moduleRes = await moduleAPI.createModule(selectedCourse, moduleData);
        const createdModuleId = moduleRes.data._id;

        for (const lesson of module.lessons) {
          await lessonAPI.createLesson(selectedCourse, createdModuleId, {
            title: lesson.title,
            description: `Description for ${lesson.title}`,
            type: lesson.type,
            content: lesson.content || 'Sample content',
            videoUrl: lesson.type === 'video' ? lesson.videoUrl : undefined,
            duration: lesson.duration,
            questions: lesson.questions,
          });
        }
      }

      await courseAPI.publishCourse(selectedCourse);
      toast({ title: 'Published!', description: 'Course content saved and published.' });
    } catch (error: any) {
      toast({
        title: 'Publish Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Empty state
  if (!isLoadingCourses && courses.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-card">
        <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Courses to Build</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Create a course first, then come back here to add modules and lessons.
        </p>
        <Button variant="hero" asChild>
          <Link to="/instructor/courses/new">
            <Plus className="w-4 h-4 mr-1" /> Create Course
          </Link>
        </Button>
      </div>
    );
  }

  const moduleIds = modules.map((m) => m._id);

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
                      <Badge
                        variant={course.status === 'published' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
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
                onClick={() => navigate(`/instructor/courses/${selectedCourse}/preview`)}
              >
                <Eye className="w-4 h-4 mr-1" /> Preview
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={handlePublishChanges}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                {isPublishing ? 'Publishing...' : 'Publish Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedCourse ? (
        <div className="space-y-4">
          {/* Add Module */}
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() =>
              setModuleDialog({ open: true, mode: 'create' })
            }
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Module
          </Button>

          {/* Modules */}
          {modules.length === 0 ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No modules yet. Add your first module to start building the course.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {modules.map((module, idx) => (
                    <SortableModule
                      key={module._id}
                      module={module}
                      moduleIndex={idx}
                      onToggleExpand={() => toggleModuleExpand(module._id)}
                      onEditModule={() =>
                        setModuleDialog({
                          open: true,
                          mode: 'edit',
                          moduleId: module._id,
                          title: module.title,
                          description: module.description,
                        })
                      }
                      onDeleteModule={() => handleDeleteModule(module._id)}
                      onAddLesson={() =>
                        setLessonDialog({
                          open: true,
                          mode: 'create',
                          moduleId: module._id,
                          lesson: null,
                        })
                      }
                      onEditLesson={(lesson) =>
                        setLessonDialog({
                          open: true,
                          mode: 'edit',
                          moduleId: module._id,
                          lesson,
                        })
                      }
                      onDeleteLesson={(lessonId) => handleDeleteLesson(module._id, lessonId)}
                      onToggleLessonPublish={(lessonId) =>
                        toggleLessonPublish(module._id, lessonId)
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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

      {/* Dialogs */}
      <ModuleDialog
        open={moduleDialog.open}
        onOpenChange={(open) => setModuleDialog((prev) => ({ ...prev, open }))}
        onSubmit={handleModuleSubmit}
        mode={moduleDialog.mode}
        initialTitle={moduleDialog.title}
        initialDescription={moduleDialog.description}
      />

      <LessonDialog
        open={lessonDialog.open}
        onOpenChange={(open) => setLessonDialog((prev) => ({ ...prev, open }))}
        onSubmit={handleLessonSubmit}
        mode={lessonDialog.mode}
        initialData={lessonDialog.lesson}
      />
    </div>
  );
};

export default CourseBuilder;
