import { Course } from '@/components/courses/CourseCard';

export const courses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp 2024',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack developer',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    instructor: 'Dr. Angela Yu',
    duration: '40 hours',
    students: 12500,
    rating: 4.9,
    category: 'Web Development',
    level: 'Beginner',
    progress: 65,
  },
  {
    id: '2',
    title: 'Python for Data Science & Machine Learning',
    description: 'Master Python programming for data analysis, visualization and machine learning',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    instructor: 'Jose Portilla',
    duration: '35 hours',
    students: 9800,
    rating: 4.8,
    category: 'Data Science',
    level: 'Intermediate',
    progress: 30,
  },
  {
    id: '3',
    title: 'UI/UX Design Masterclass',
    description: 'Learn modern UI/UX design principles using Figma and create stunning interfaces',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    instructor: 'Sarah Chen',
    duration: '25 hours',
    students: 7200,
    rating: 4.7,
    category: 'Design',
    level: 'Beginner',
    progress: 85,
  },
  {
    id: '4',
    title: 'Advanced React & TypeScript',
    description: 'Deep dive into advanced React patterns, TypeScript and modern frontend architecture',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    instructor: 'Kent C. Dodds',
    duration: '30 hours',
    students: 5400,
    rating: 4.9,
    category: 'Web Development',
    level: 'Advanced',
  },
  {
    id: '5',
    title: 'Mobile App Development with Flutter',
    description: 'Build beautiful cross-platform mobile apps with Dart and Flutter framework',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80',
    instructor: 'Maximilian Schwarzmüller',
    duration: '45 hours',
    students: 6100,
    rating: 4.8,
    category: 'Mobile Development',
    level: 'Intermediate',
  },
  {
    id: '6',
    title: 'Cloud Computing with AWS',
    description: 'Master AWS services and become a certified cloud practitioner',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    instructor: 'Stephane Maarek',
    duration: '50 hours',
    students: 8900,
    rating: 4.9,
    category: 'Cloud Computing',
    level: 'Intermediate',
  },
];

export const enrolledCourses = courses.slice(0, 3);

export const stats = {
  student: {
    coursesEnrolled: 6,
    hoursLearned: 48,
    certificates: 3,
    streak: 12,
  },
  instructor: {
    totalCourses: 8,
    totalStudents: 4520,
    totalRevenue: 28450,
    avgRating: 4.8,
  },
  admin: {
    totalUsers: 15420,
    totalCourses: 256,
    pendingApprovals: 12,
    monthlyRevenue: 125000,
  },
};

export const recentActivity = [
  { id: '1', type: 'lesson', title: 'Completed "React Hooks Deep Dive"', time: '2 hours ago', course: 'Advanced React' },
  { id: '2', type: 'quiz', title: 'Scored 92% on Module 3 Quiz', time: '5 hours ago', course: 'Python for Data Science' },
  { id: '3', type: 'assignment', title: 'Submitted "Portfolio Project"', time: '1 day ago', course: 'Web Development Bootcamp' },
  { id: '4', type: 'certificate', title: 'Earned UI/UX Design Certificate', time: '2 days ago', course: 'UI/UX Design Masterclass' },
];

export const upcomingDeadlines = [
  { id: '1', title: 'Final Project Submission', course: 'Web Development Bootcamp', dueDate: '2024-01-15', type: 'assignment' },
  { id: '2', title: 'Module 5 Quiz', course: 'Python for Data Science', dueDate: '2024-01-12', type: 'quiz' },
  { id: '3', title: 'Capstone Design Review', course: 'UI/UX Design Masterclass', dueDate: '2024-01-18', type: 'assignment' },
];
