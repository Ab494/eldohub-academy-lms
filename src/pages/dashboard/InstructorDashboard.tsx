import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Settings,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/store/AuthContext';
import InstructorCourseList from '@/components/instructor/InstructorCourseList';
import CourseBuilder from '@/components/instructor/CourseBuilder';
import AssignmentsGrading from '@/components/instructor/AssignmentsGrading';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || 'Instructor'}! Here's your teaching overview.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/instructor/courses/new">
            <Plus className="w-4 h-4 mr-1" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Courses Created"
          value={0}
          icon={BookOpen}
          variant="primary"
        />
        <StatsCard
          title="Total Students"
          value={0}
          icon={Users}
          variant="secondary"
        />
        <StatsCard
          title="Pending Reviews"
          value={0}
          icon={ClipboardCheck}
          variant="accent"
        />
        <StatsCard
          title="Avg. Completion"
          value="0%"
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">
            <BookOpen className="w-4 h-4 mr-2" />
            My Courses
          </TabsTrigger>
          <TabsTrigger value="builder" className="data-[state=active]:bg-background">
            <Settings className="w-4 h-4 mr-2" />
            Course Builder
          </TabsTrigger>
          <TabsTrigger value="grading" className="data-[state=active]:bg-background">
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Assignments & Grading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InstructorCourseList />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <CourseBuilder />
        </TabsContent>

        <TabsContent value="grading" className="space-y-6">
          <AssignmentsGrading />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstructorDashboard;
