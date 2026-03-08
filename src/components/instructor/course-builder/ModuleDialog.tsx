import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => void;
  initialTitle?: string;
  initialDescription?: string;
  mode?: 'create' | 'edit';
}

const ModuleDialog: React.FC<ModuleDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialTitle = '',
  initialDescription = '',
  mode = 'create',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [open, initialTitle, initialDescription]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title.trim(), description.trim());
    setTitle('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Module' : 'Edit Module'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Modules help organize your course content into logical sections.'
              : 'Update module title and description.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="module-title">Module Title *</Label>
            <Input
              id="module-title"
              placeholder="e.g., Introduction to the Course"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="module-desc">Description</Label>
            <Textarea
              id="module-desc"
              placeholder="Brief description of what this module covers..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {mode === 'create' ? 'Create Module' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleDialog;
