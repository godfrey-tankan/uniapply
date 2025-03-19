
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, FileText, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading applications
    const timer = setTimeout(() => {
      // Sample data for demonstration
      const sampleApplications = [
        { 
          id: 1, 
          program: 'Computer Science', 
          submissionDate: '2023-09-15', 
          startDate: '2024-01-10',
          status: 'pending'
        },
        { 
          id: 2, 
          program: 'Business Administration', 
          submissionDate: '2023-08-20', 
          startDate: '2024-01-10',
          status: 'approved'
        },
        { 
          id: 3, 
          program: 'Engineering', 
          submissionDate: '2023-07-05', 
          startDate: '2023-09-05',
          status: 'rejected'
        }
      ];
      
      setApplications(sampleApplications);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const viewDetails = (id) => {
    toast({
      title: "Application Details",
      description: `Viewing details for application #${id}`
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow flex justify-center items-center h-40">
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center h-40">
        <p className="text-gray-500 mb-4">No applications submitted yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="p-4 border border-gray-200 rounded-md">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{app.program}</h3>
                <p className="text-sm text-gray-500">
                  Submitted: {app.submissionDate} • Start date: {app.startDate}
                </p>
              </div>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                'bg-amber-100 text-amber-800'
              }`}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => viewDetails(app.id)}
              >
                <Eye className="h-3.5 w-3.5" />
                View Details
              </Button>
              
              {app.status === 'pending' && (
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Waiting for review
                </div>
              )}
              
              {app.status === 'approved' && (
                <div className="flex items-center text-green-600 text-sm">
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Acceptance letter available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationsList;
