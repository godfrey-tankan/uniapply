
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { File, Trash2, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading documents
    const timer = setTimeout(() => {
      // Sample data for demonstration
      const sampleDocuments = [
        { id: 1, type: 'transcript', filename: 'Academic_Transcript_2023.pdf', uploadDate: '2023-11-15', status: 'verified' },
        { id: 2, type: 'id', filename: 'ID_Document.jpg', uploadDate: '2023-10-20', status: 'pending' },
        { id: 3, type: 'certificate', filename: 'Certificate_Course.pdf', uploadDate: '2023-09-05', status: 'verified' }
      ];
      
      setDocuments(sampleDocuments);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (id) => {
    setDocuments(docs => docs.filter(doc => doc.id !== id));
    toast({
      title: "Document Deleted",
      description: "The document has been removed successfully."
    });
  };

  const handleDownload = (filename) => {
    toast({
      title: "Download Started",
      description: `Downloading ${filename}`
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow flex justify-center items-center h-40">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center h-40">
        <p className="text-gray-500 mb-4">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
            <div className="flex items-center">
              <File className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <p className="font-medium">{doc.filename}</p>
                <p className="text-sm text-gray-500">
                  Uploaded: {doc.uploadDate} • Status: 
                  <span className={`ml-1 ${
                    doc.status === 'verified' ? 'text-green-600' : 
                    doc.status === 'rejected' ? 'text-red-600' : 
                    'text-amber-600'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDownload(doc.filename)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleDelete(doc.id)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsList;
