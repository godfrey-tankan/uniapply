
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getApplications, Application } from "@/services/applicationService";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  UserClock,
  FileX
} from "lucide-react";

const ApplicationsList = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const apps = await getApplications(user.id);
    setApplications(apps);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'Pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Deferred':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'Waitlisted':
        return <UserClock className="h-5 w-5 text-orange-500" />;
      case 'Withdrawn':
        return <FileX className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Approved':
        return "bg-green-100 text-green-800";
      case 'Rejected':
        return "bg-red-100 text-red-800";
      case 'Pending':
        return "bg-blue-100 text-blue-800";
      case 'Deferred':
        return "bg-yellow-100 text-yellow-800";
      case 'Waitlisted':
        return "bg-orange-100 text-orange-800";
      case 'Withdrawn':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">My Applications</h2>
        <div className="flex justify-center">
          <div className="animate-pulse">Loading applications...</div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">My Applications</h2>
        <p className="text-gray-600">You haven't submitted any applications yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">My Applications</h2>
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="flex items-center justify-between p-4 border rounded-md">
            <div className="flex items-center">
              {getStatusIcon(app.status)}
              <div className="ml-3">
                <p className="font-medium">{app.program_name}</p>
                <p className="text-sm text-gray-500">{app.university_name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(app.status)}`}>
                {app.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Applied on {new Date(app.date_applied).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsList;
