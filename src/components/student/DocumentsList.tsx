
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDocuments, Document } from "@/services/documentService";
import { FileCheck, FileX } from "lucide-react";

const DocumentsList = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const docs = await getDocuments(user.id);
    setDocuments(docs);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">My Documents</h2>
        <div className="flex justify-center">
          <div className="animate-pulse">Loading documents...</div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">My Documents</h2>
        <p className="text-gray-600">You haven't uploaded any documents yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">My Documents</h2>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md">
            <div className="flex items-center">
              {doc.is_verified ? (
                <FileCheck className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <FileX className="h-5 w-5 text-yellow-500 mr-2" />
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
      </div>
    </div>
  );
};

export default DocumentsList;
