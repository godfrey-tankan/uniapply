
import { toast } from "sonner";

export interface Document {
  id: number;
  document_type: 'Transcript' | 'ID' | 'Recommendation Letter' | 'others';
  file_name: string;
  is_verified: boolean;
  date_created: string;
}

export const uploadDocument = async (file: File, documentType: string, userId: number): Promise<Document | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    formData.append('user_id', userId.toString());

    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/documents/upload/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload document");
    }

    const responseData = await response.json();
    toast.success("Document uploaded successfully!");
    return responseData;
  } catch (error) {
    console.error("Document upload error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to upload document");
    return null;
  }
};

export const getDocuments = async (userId: number): Promise<Document[]> => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/documents/?user_id=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch documents");
    }

    return await response.json();
  } catch (error) {
    console.error("Documents fetch error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch documents");
    return [];
  }
};
