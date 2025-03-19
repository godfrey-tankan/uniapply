
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import EligibleStudents from "@/components/lecturer/EligibleStudents";

const LecturerDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 px-4 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Lecturer Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout} className="mt-4 md:mt-0">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <EligibleStudents />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Verification Statistics</h2>
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Verification statistics will appear here.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Recent activities will appear here.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
              <div className="h-48 flex items-center justify-center">
                <p className="text-gray-500">Pending reviews will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
