
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, RefreshCw } from "lucide-react";
import DocumentUpload from "@/components/student/DocumentUpload";
import DocumentsList from "@/components/student/DocumentsList";
import ApplyForm from "@/components/student/ApplyForm";
import ApplicationsList from "@/components/student/ApplicationsList";

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDocumentUploadSuccess = () => {
    setShowUploadForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleApplicationSuccess = () => {
    setShowApplyForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 px-4 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout} className="mt-4 md:mt-0">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Documents</h2>
              <Button 
                variant={showUploadForm ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setShowUploadForm(!showUploadForm)}
              >
                {showUploadForm ? (
                  "Cancel"
                ) : (
                  <>
                    <Plus className="mr-1 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>

            {showUploadForm ? (
              <DocumentUpload onUploadSuccess={handleDocumentUploadSuccess} />
            ) : (
              <DocumentsList key={`docs-${refreshTrigger}`} />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Applications</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant={showApplyForm ? "secondary" : "outline"} 
                  size="sm"
                  onClick={() => setShowApplyForm(!showApplyForm)}
                >
                  {showApplyForm ? (
                    "Cancel"
                  ) : (
                    <>
                      <Plus className="mr-1 h-4 w-4" />
                      New Application
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showApplyForm ? (
              <ApplyForm onApplicationSuccess={handleApplicationSuccess} />
            ) : (
              <ApplicationsList key={`apps-${refreshTrigger}`} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Application Status Overview</h2>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">Application statistics will appear here.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">No upcoming deadlines to display.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
