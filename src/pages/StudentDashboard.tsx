
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const StudentDashboard = () => {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    } else if (!isLoading && isAuthenticated && !user?.is_student) {
      navigate("/lecturer-dashboard");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container py-20">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}</h2>
          <p className="text-gray-600">
            This is your student dashboard. Here you can view your applications, track your progress, and more.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">My Applications</h2>
          <p className="text-gray-600">
            You have no active applications. Start exploring programs to apply.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
          <p className="text-gray-600">
            No upcoming deadlines to display.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
