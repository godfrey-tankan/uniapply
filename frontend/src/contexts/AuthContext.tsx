
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserProfile, logoutUser, UserProfile } from "@/services/authService";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (localStorage.getItem("authToken")) {
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        refreshUser,
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
