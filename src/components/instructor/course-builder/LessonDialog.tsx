import React, { useState, useEffect } from 'react';
import { Video, FileText, ClipboardList, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import RichTextEditor from '@/components/ui/RichTextEditor';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LessonData, QuestionData } from './types';

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (lesson: Omit<LessonData, '_id' | 'isPublished'>) => void;
  initialData?: LessonData | null;
  mode?: 'create' | 'edit';
}

const emptyQuestion: QuestionData = { question: '', options: ['', ''], correctAnswer: 0 };

const LessonDialog: React.FC<LessonDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = null,
  mode = 'create',
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<LessonData['type']>('video');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [questions, setQuestions] = useState<QuestionData[]>([]);

  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title);
      setType(initialData.type);
      setContent(initialData.content || '');
      setVideoUrl(initialData.videoUrl || '');
      setQuestions(initialData.questions || []);
    } else if (open) {
      setTitle('');
      setType('video');
      setContent('');
      setVideoUrl('');
      setQuestions([]);
    }
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      type,
      content: type === 'text' ? content : undefined,
      videoUrl: type === 'video' ? videoUrl : undefined,
      duration: type === 'video' ? '10:00' : undefined,
      questions: type === 'assignment' || type === 'quiz' ? questions : undefined,
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(prev => prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Lesson' : 'Edit Lesson'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Create a new lesson for this module.' : 'Update lesson details.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title *</Label>
            <Input
              id="lesson-title"
              placeholder="e.g., Getting Started with React"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Lesson Type</Label>
            <Select value={type} onValueChange={(v: LessonData['type']) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" /> Video Lesson
                  </div>
                </SelectItem>
                <SelectItem value="text">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" /> Text / Article
                  </div>
                </SelectItem>
                <SelectItem value="quiz">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-purple-500" /> Quiz
                  </div>
                </SelectItem>
                <SelectItem value="assignment">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-orange-500" /> Assignment
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video fields */}
          {type === 'video' && (
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, or direct video URLs</p>
            </div>
          )}

          {/* Rich text content */}
          {type === 'text' && (
            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your lesson content here..."
              />
            </div>
          )}

          {/* Quiz / Assignment questions */}
          {(type === 'quiz' || type === 'assignment') && (
            <div className="space-y-4">
              <Label>Questions</Label>
              {questions.map((q, qIdx) => (
                <Card key={qIdx} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Question {qIdx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setQuestions(prev => prev.filter((_, i) => i !== qIdx))}
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    placeholder="Question text"
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                  />
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correctAnswer === oIdx}
                        onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)}
                        className="accent-primary"
                      />
                      <Input
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        className="flex-1"
                      />
                      {q.options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setQuestions(prev =>
                              prev.map((qq, i) =>
                                i === qIdx ? { ...qq, options: qq.options.filter((_, j) => j !== oIdx) } : qq
                              )
                            )
                          }
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQuestions(prev =>
                        prev.map((qq, i) =>
                          i === qIdx ? { ...qq, options: [...qq.options, ''] } : qq
                        )
                      )
                    }
                  >
                    + Add Option
                  </Button>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => setQuestions(prev => [...prev, { ...emptyQuestion }])}
              >
                + Add Question
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {mode === 'create' ? 'Add Lesson' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LessonDialog;
