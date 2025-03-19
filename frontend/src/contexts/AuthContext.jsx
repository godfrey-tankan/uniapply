
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile, loginUser, logoutUser, registerUser } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const userData = await getUserProfile();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const data = await loginUser(credentials);
      localStorage.setItem("authToken", data.token);
      
      const userData = await getUserProfile();
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success("Successfully logged in!");
      
      if (userData.is_student) {
        navigate("/student-dashboard");
      } else {
        navigate("/lecturer-dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await registerUser(userData);
      localStorage.setItem("authToken", data.token);
      
      const userProfile = await getUserProfile();
      setUser(userProfile);
      setIsAuthenticated(true);
      
      toast.success("Registration successful!");
      
      if (userProfile.is_student) {
        navigate("/student-dashboard");
      } else {
        navigate("/lecturer-dashboard");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
      toast.success("Successfully logged out");
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
