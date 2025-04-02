import { toast } from "sonner";

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirm_password: string;
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

const API_URL = "http://127.0.0.1:8000/auth"; // Ensure correct API prefix

// 🔹 Function to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refresh");
    if (!refreshToken) return null;

    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem("authToken", data.access);
    return data.access;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
};

// 🔹 Register a new user
const registerUser = async (data: RegisterData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

// 🔹 Login and store tokens
const loginUser = async (data: LoginData): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const responseData = await response.json();
    localStorage.setItem("authToken", responseData.access); // Save access token
    localStorage.setItem("refresh", responseData.refresh); // Save refresh token

    toast.success("Login successful!");
    return true;
  } catch (error) {
    console.error("Login error:", error);
    toast.error(error instanceof Error ? error.message : "Login failed");
    return false;
  }
};

// 🔹 Fetch the authenticated user profile
const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    let accessToken = localStorage.getItem("authToken");

    if (!accessToken) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return null;
    }

    let response = await fetch(`${API_URL}/profile/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (response.status === 401) {
      accessToken = await refreshAccessToken();
      if (!accessToken) return null;

      response = await fetch(`${API_URL}/profile/`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    }

    if (!response.ok) {
      console.error('Failed to fetch profile');
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
};

// 🔹 Refresh the user profile by fetching updated profile data
const refreshUser = async (): Promise<UserProfile | null> => {
  return await getUserProfile();
};

// 🔹 Logout user and clear tokens
const logoutUser = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refresh");
  toast.success("Logged out successfully");
  window.location.reload(); // Reload the page to reset state
};

// 🔹 Ensure all functions are properly exported
export { registerUser, loginUser, getUserProfile, logoutUser, refreshAccessToken, refreshUser };
