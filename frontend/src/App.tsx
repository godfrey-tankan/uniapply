import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardRouter from "./components/dashboard/DashboardRouter";
import StudentDashboard from "./pages/StudentDashboard";
import EnrollerDashboard from "./pages/EnrollerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplicationPage from "./pages/Application";
import ApplicationDetails from "./pages/ApplicationDetails";
import ProgramDetails from "./pages/ProgramDetails";
import ProfileCompletionPage from "./pages/ProfileCompletionPage";
import ApplicationReviewPage from '@/pages/ApplicationReviewPage';
import ProgramsPage from './pages/ProgramsPage';
import EnrollerSettingsPage from './pages/EnrollerSettingsPage';
import Applications from './pages/Applications';
import UniversityAdminDashboard from './pages/UniversityAdminDashboard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/programs" element={<ProgramsPage />} />

            {/* 🔹 Route to Handle Dashboard Redirection */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            {/* /api/programs/{program_id}/stats/ */}

            <Route path="/api/program-details/:id/stats" element={<ProgramDetails />} />
            {/* 🔹 Secure Dashboard Routes */}
            <Route element={<ProtectedRoute allowedRoles={["is_system_admin"]} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["is_university_admin"]} />}>
              <Route path="/university-admin-dashboard" element={<UniversityAdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["is_student"]} />}>
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route
                path="/apply"
                element={
                  <ApplicationPage
                    onSuccess={() => {
                      // handle success, e.g., redirect or show a message
                    }}
                    onCancel={() => {

                    }}
                  />
                }
              />
              <Route path="/applications/:id" element={<ApplicationDetails />} />
              <Route path="/profile/complete" element={<ProfileCompletionPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["is_enroller"]} />}>
              <Route path="/review-application/:id" element={<ApplicationReviewPage />} />
              <Route path="/institution-applications" element={<Applications />} />
              <Route path="/enroller-dashboard" element={<EnrollerDashboard />} />
              <Route path="/enroller-settings" element={<EnrollerSettingsPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
