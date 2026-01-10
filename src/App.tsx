import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/store/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentCourses from "./pages/dashboard/StudentCourses";
import StudentAchievements from "./pages/dashboard/StudentAchievements";
import StudentAssignments from "./pages/dashboard/StudentAssignments";
import StudentCertificates from "./pages/dashboard/StudentCertificates";
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminCourseCreate from "./components/admin/AdminCourseCreate";
import InstructorCourseCreate from "./components/instructor/InstructorCourseCreate";
import CoursePlayer from "./pages/CoursePlayer";
import Courses from "./pages/Courses";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/course/:courseId" element={<CoursePlayer />} />

            {/* Student Dashboard */}
            <Route path="/student" element={<DashboardLayout />}>
              <Route index element={<StudentCourses />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="achievements" element={<StudentAchievements />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="certificates" element={<StudentCertificates />} />
            </Route>

            {/* Instructor Dashboard */}
            <Route path="/instructor" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<InstructorDashboard />} />
              <Route path="courses" element={<InstructorDashboard />} />
              <Route path="courses/create" element={<InstructorCourseCreate />} />
              <Route path="create" element={<InstructorDashboard />} />
              <Route path="submissions" element={<InstructorDashboard />} />
              <Route path="analytics" element={<InstructorDashboard />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard key="admin-dashboard" />} />
              <Route path="users" element={<AdminDashboard key="admin-users" />} />
              <Route path="courses" element={<AdminDashboard key="admin-courses" />} />
              <Route path="courses/create" element={<AdminCourseCreate key="admin-course-create" />} />
              <Route path="approvals" element={<AdminDashboard key="admin-approvals" />} />
              <Route path="analytics" element={<AdminDashboard key="admin-analytics" />} />
            </Route>

            {/* Settings & Help */}
            <Route path="/settings" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
            </Route>
            <Route path="/help" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
            </Route>

            {/* Catch All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
