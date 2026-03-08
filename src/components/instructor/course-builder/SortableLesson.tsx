import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LessonData } from './types';

interface SortableLessonProps {
  lesson: LessonData;
  moduleIndex: number;
  lessonIndex: number;
  icon: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}

const SortableLesson: React.FC<SortableLessonProps> = ({
  lesson,
  moduleIndex,
  lessonIndex,
  icon,
  onEdit,
  onDelete,
  onTogglePublish,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 pl-12 hover:bg-muted/30 transition-colors bg-card"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {moduleIndex + 1}.{lessonIndex + 1} {lesson.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{lesson.type}</span>
          {lesson.duration && <span>• {lesson.duration}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onTogglePublish}
          title={lesson.isPublished ? 'Unpublish' : 'Publish'}
        >
          {lesson.isPublished ? (
            <Eye className="w-4 h-4 text-emerald-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Edit lesson">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete} title="Delete lesson">
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

export default SortableLesson;
