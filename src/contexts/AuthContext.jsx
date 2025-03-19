
import React, { createContext, useContext, useEffect, useState } from "react";
import { getUserProfile, loginUser, logoutUser, registerUser } from "@/services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    if (localStorage.getItem("authToken")) {
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (error) {
        console.error("Auth check error:", error);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data) => {
    setIsLoading(true);
    const token = await loginUser(data);
    
    if (token) {
      const userData = await getUserProfile();
      setUser(userData);
      
      if (userData) {
        // Redirect based on user type
        if (userData.is_student) {
          navigate("/student-dashboard");
        } else {
          navigate("/lecturer-dashboard");
        }
        return true;
      }
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (data) => {
    setIsLoading(true);
    const success = await registerUser(data);
    setIsLoading(false);
    
    if (success) {
      navigate("/login");
      return true;
    }
    
    return false;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
