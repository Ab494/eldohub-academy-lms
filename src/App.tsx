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
import InstructorDashboard from "./pages/dashboard/InstructorDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CoursePlayer from "./pages/CoursePlayer";

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
            <Route path="/course/:courseId" element={<CoursePlayer />} />

            {/* Student Dashboard */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentDashboard />} />
              <Route path="achievements" element={<StudentDashboard />} />
              <Route path="assignments" element={<StudentDashboard />} />
              <Route path="certificates" element={<StudentDashboard />} />
            </Route>

            {/* Instructor Dashboard */}
            <Route path="/instructor" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<InstructorDashboard />} />
              <Route path="courses" element={<InstructorDashboard />} />
              <Route path="create" element={<InstructorDashboard />} />
              <Route path="submissions" element={<InstructorDashboard />} />
              <Route path="analytics" element={<InstructorDashboard />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminDashboard />} />
              <Route path="courses" element={<AdminDashboard />} />
              <Route path="approvals" element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminDashboard />} />
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
