
import { toast } from "sonner";

const API_BASE_URL = "http://127.0.0.1/api";

// Helper function for API requests
async function apiRequest(endpoint, method = "GET", data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("authToken");
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || "An error occurred");
      }
      
      return responseData;
    } else {
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "An error occurred");
      }
      
      return { success: true };
    }
  } catch (error) {
    console.error(`API error (${method} ${endpoint}):`, error);
    throw error;
  }
}

// Authentication
export const loginUser = (credentials) => apiRequest("/auth/login/", "POST", credentials);
export const registerUser = (userData) => apiRequest("/auth/register/", "POST", userData);
export const logoutUser = () => apiRequest("/auth/logout/", "POST");
export const getUserProfile = () => apiRequest("/auth/profile/");

// Universities
export const getUniversities = () => apiRequest("/universities/");
export const getUniversityDetails = (id) => apiRequest(`/universities/${id}/`);

// Programs
export const getPrograms = (universityId) => 
  apiRequest(`/programs/?university_id=${universityId}`);
export const getProgramDetails = (id) => apiRequest(`/programs/${id}/`);

// Applications
export const getApplications = (userId) => 
  apiRequest(`/applications/?user_id=${userId}`);
export const createApplication = (application) => 
  apiRequest("/applications/", "POST", application);
export const updateApplication = (id, data) => 
  apiRequest(`/applications/${id}/`, "PUT", data);
export const getEligibleStudents = () => 
  apiRequest("/applications/eligible_students/");

// Documents
export const uploadDocument = async (file, documentType, userId) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    formData.append("user_id", userId.toString());
    
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const response = await fetch(`${API_BASE_URL}/documents/upload/`, {
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
    throw error;
  }
};

export const getDocuments = (userId) => 
  apiRequest(`/documents/?user_id=${userId}`);
