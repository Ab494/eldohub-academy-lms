export interface LessonData {
  _id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content?: string;
  videoUrl?: string;
  duration?: string;
  isPublished: boolean;
  questions?: QuestionData[];
}

export interface QuestionData {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ModuleData {
  _id: string;
  title: string;
  description?: string;
  lessons: LessonData[];
  isExpanded: boolean;
}

export interface CourseData {
  _id: string;
  title: string;
  status: 'draft' | 'published';
}
