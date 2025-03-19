
import { toast } from "sonner";

export const getUniversities = async () => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/universities/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch universities");
    }

    return await response.json();
  } catch (error) {
    console.error("Universities fetch error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch universities");
    return [];
  }
};

export const getPrograms = async (universityId) => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/programs/?university_id=${universityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch programs");
    }

    return await response.json();
  } catch (error) {
    console.error("Programs fetch error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch programs");
    return [];
  }
};

export const submitApplication = async (
  universityName, 
  programName, 
  studentId
) => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/applications/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        university_name: universityName,
        program_name: programName,
        student_id: studentId
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit application");
    }

    const responseData = await response.json();
    toast.success("Application submitted successfully!");
    return responseData;
  } catch (error) {
    console.error("Application submission error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to submit application");
    return null;
  }
};

export const getApplications = async (studentId) => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/applications/?student_id=${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch applications");
    }

    return await response.json();
  } catch (error) {
    console.error("Applications fetch error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch applications");
    return [];
  }
};

export const getEligibleStudents = async () => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/students/eligible/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch eligible students");
    }

    return await response.json();
  } catch (error) {
    console.error("Eligible students fetch error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch eligible students");
    return [];
  }
};
