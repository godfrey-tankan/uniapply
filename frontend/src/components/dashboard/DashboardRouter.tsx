import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const DashboardRouter = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to /auth");
        navigate("/auth");
        return;
      }

      if (user) {
        console.log("User is authenticated, redirecting to the appropriate dashboard:", user);
        if (user.is_student) {
          navigate("/student-dashboard");
        } else if (user.is_system_admin) {
          navigate("/admin-dashboard");
        } else {
          navigate("/enroller-dashboard");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal mx-auto" />
        <h2 className="mt-4 text-lg font-medium">Loading your dashboard...</h2>
      </div>
    </div>
  );
};

export default DashboardRouter;
