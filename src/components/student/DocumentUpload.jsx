
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const DocumentUpload = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentType || !file) {
      toast({
        title: "Error",
        description: "Please select a document type and file",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // For demonstration, just show a success message
      toast({
        title: "Success!",
        description: "Document uploaded successfully",
      });
      
      setLoading(false);
      setDocumentType('');
      setFile(null);
      setDescription('');
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }, 1500);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Upload New Document</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType} required>
            <SelectTrigger id="documentType">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transcript">Academic Transcript</SelectItem>
              <SelectItem value="id">ID Document</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="letter">Recommendation Letter</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="file">Upload File</Label>
          <Input 
            id="file" 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="Briefly describe this document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Uploading..." : "Upload Document"}
        </Button>
      </form>
    </div>
  );
};

export default DocumentUpload;
