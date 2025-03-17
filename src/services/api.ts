
import { toast } from "sonner";

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  is_student: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  is_student: boolean;
}

const API_URL = "http://127.0.0.1/api";

export const registerUser = async (data: RegisterData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Registration failed");
    }

    toast.success("Registration successful! Please log in.");
    return true;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error(error instanceof Error ? error.message : "Registration failed");
    return false;
  }
};

export const loginUser = async (data: LoginData): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const responseData = await response.json();
    const token = responseData.token;

    // Store the token in localStorage
    localStorage.setItem("authToken", token);
    toast.success("Login successful!");
    
    return token;
  } catch (error) {
    console.error("Login error:", error);
    toast.error(error instanceof Error ? error.message : "Login failed");
    return null;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/profile/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        throw new Error("Session expired. Please log in again.");
      }
      throw new Error("Failed to fetch user profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Profile fetch error:", error);
    toast.error(error instanceof Error ? error.message : "Failed to fetch profile");
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem("authToken");
  toast.success("Logged out successfully");
};
