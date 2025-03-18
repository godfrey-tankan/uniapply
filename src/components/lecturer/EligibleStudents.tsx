
import React, { useEffect, useState } from "react";
import { getEligibleStudents } from "@/services/applicationService";
import { getDocuments } from "@/services/documentService";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface EligibleStudent {
  id: number;
  name: string;
  email: string;
  applications: {
    id: number;
    university_name: string;
    program_name: string;
    status: string;
    date_applied: string;
  }[];
}

const EligibleStudents = () => {
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const fetchStudents = async () => {
    setIsLoading(true);
    const data = await getEligibleStudents();
    setStudents(data);
    setIsLoading(false);
  };

  const fetchStudentDocuments = async (studentId: number) => {
    setIsLoadingDocuments(true);
    const data = await getDocuments(studentId);
    setDocuments(data);
    setIsLoadingDocuments(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewDocuments = (studentId: number) => {
    setSelectedStudent(studentId);
    fetchStudentDocuments(studentId);
  };

  const handleApproveApplication = async (applicationId: number) => {
    try {
      // This would be a real API call
      // await approveApplication(applicationId);
      toast.success("Application approved successfully!");
      fetchStudents(); // Refresh the list
    } catch (error) {
      toast.error("Failed to approve application");
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    try {
      // This would be a real API call
      // await rejectApplication(applicationId);
      toast.success("Application rejected successfully!");
      fetchStudents(); // Refresh the list
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Eligible Students</h2>
        <div className="flex justify-center">
          <div className="animate-pulse">Loading eligible students...</div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Eligible Students</h2>
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No eligible students found at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Eligible Students</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {students.map((student) => (
            <Card key={student.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex justify-between items-center">
                  <span>{student.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDocuments(student.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Documents
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                <h4 className="font-medium mb-2">Applications:</h4>
                <ul className="space-y-2">
                  {student.applications.map((app) => (
                    <li key={app.id} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{app.program_name}</p>
                          <p className="text-sm text-gray-500">{app.university_name}</p>
                          <p className="text-xs text-gray-400">
                            Applied: {new Date(app.date_applied).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveApplication(app.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleRejectApplication(app.id)}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedStudent && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Student Documents</h3>
            {isLoadingDocuments ? (
              <div className="flex justify-center">
                <div className="animate-pulse">Loading documents...</div>
              </div>
            ) : documents.length === 0 ? (
              <p className="text-gray-600">No documents found for this student.</p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      {doc.is_verified ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 text-yellow-500 mr-2" />
                      )}
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-gray-500">{doc.document_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        doc.is_verified 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {doc.is_verified ? "Verified" : "Pending"}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded on {new Date(doc.date_created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 mt-4">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      // This would be a real API call
                      // await verifyAllDocuments(selectedStudent);
                      toast.success("All documents verified!");
                      fetchStudentDocuments(selectedStudent);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify All
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedStudent(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibleStudents;
