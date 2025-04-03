import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "@/services/authService"; // Assuming you have a method to fetch user data

interface AuthContextType {
  user: any; // Replace `any` with the actual user type
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  loading: boolean; // New loading state
  logout: () => void; // Add logout to the context
  updateUser: (newData: any) => void; // Function to update user data
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null); // Replace `any` with your actual user type
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // New loading state for the user data fetch

  const refreshUser = async () => {
    setLoading(true); // Set loading to true while fetching the user profile
    try {
      const userProfile = await getUserProfile();
      if (userProfile) {
        setUser(userProfile);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };
  const updateUser = (newData: any) => {
    setUser((prevUser) => ({ ...prevUser, ...newData }));
  };
  // Logout function
  const logout = () => {
    setUser(null); // Clear the user data
    setIsAuthenticated(false); // Mark the user as unauthenticated
    localStorage.removeItem("user"); // Optionally remove from localStorage if you store data there
    localStorage.removeItem("authToken"); // Clear the token
    localStorage.removeItem("refresh"); // Clear the token
  };

  useEffect(() => {
    refreshUser(); // Optionally call refreshUser on initial load
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, refreshUser, loading, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
