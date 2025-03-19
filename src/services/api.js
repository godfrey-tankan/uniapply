
import { toast } from "sonner";

export const registerUser = async (data) => {
  try {
    const response = await fetch(`http://127.0.0.1/api/register/`, {
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

export const loginUser = async (data) => {
  try {
    const response = await fetch(`http://127.0.0.1/api/login/`, {
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
    const token = responseData.access;

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

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`http://127.0.0.1/api/profile/`, {
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

export const logoutUser = () => {
  localStorage.removeItem("authToken");
  toast.success("Logged out successfully");
};
