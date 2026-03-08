import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  Edit,
  Video,
  FileText,
  ClipboardList,
  PenTool,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ModuleData, LessonData } from './types';
import SortableLesson from './SortableLesson';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SortableModuleProps {
  module: ModuleData;
  moduleIndex: number;
  onToggleExpand: () => void;
  onEditModule: () => void;
  onDeleteModule: () => void;
  onAddLesson: () => void;
  onEditLesson: (lesson: LessonData) => void;
  onDeleteLesson: (lessonId: string) => void;
  onToggleLessonPublish: (lessonId: string) => void;
}

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4 text-primary" />;
    case 'text': return <FileText className="w-4 h-4 text-blue-500" />;
    case 'quiz': return <ClipboardList className="w-4 h-4 text-purple-500" />;
    case 'assignment': return <PenTool className="w-4 h-4 text-orange-500" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const SortableModule: React.FC<SortableModuleProps> = ({
  module,
  moduleIndex,
  onToggleExpand,
  onEditModule,
  onDeleteModule,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onToggleLessonPublish,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const lessonIds = module.lessons.map((l) => l._id);

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible
        open={module.isExpanded}
        onOpenChange={onToggleExpand}
        className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            {module.isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground">
                Module {moduleIndex + 1}: {module.title}
              </h4>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                </p>
                {module.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    — {module.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onEditModule(); }}
                title="Edit module"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onAddLesson(); }}
                title="Add lesson"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => { e.stopPropagation(); onDeleteModule(); }}
                title="Delete module"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border">
            {module.lessons.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                No lessons in this module yet.
              </div>
            ) : (
              <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
                <div className="divide-y divide-border">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <SortableLesson
                      key={lesson._id}
                      lesson={lesson}
                      moduleIndex={moduleIndex}
                      lessonIndex={lessonIndex}
                      icon={getLessonIcon(lesson.type)}
                      onEdit={() => onEditLesson(lesson)}
                      onDelete={() => onDeleteLesson(lesson._id)}
                      onTogglePublish={() => onToggleLessonPublish(lesson._id)}
                    />
                  ))}
                </div>
              </SortableContext>
            )}

            <div className="p-3 pl-12">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={onAddLesson}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Lesson
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SortableModule;
