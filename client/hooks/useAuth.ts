import { useState, useEffect, createContext, useContext } from "react";
import { analyticsService } from "../services/realTimeAnalytics";

interface User {
  id: string;
  username: string;
  email: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  goldCoins: number;
  sweepsCoins: number;
  level: number;
  joinDate: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAdminStatus: () => Promise<boolean>;
  isLoading: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return mock auth state for now since we don't have the provider setup
    return useMockAuth();
  }
  return context;
};

// Mock auth hook for development (replace with real auth later)
const useMockAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading user from localStorage or API
    const loadUser = async () => {
      setIsLoading(true);

      // Check if user was previously logged in
      const savedUser = localStorage.getItem("coinkrazy_user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          // Verify admin status in real-time
          const isAdmin = await analyticsService.checkAdminStatus(userData.id);
          setUser({
            ...userData,
            isAdmin,
            isLoggedIn: true,
          });
        } catch (error) {
          console.error("Error loading saved user:", error);
          localStorage.removeItem("coinkrazy_user");
        }
      } else {
        // No saved user - user is not logged in
        console.log("No saved user found, user is not logged in");
        setUser(null);
      }

      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt:", { email, password: "***" });
    setIsLoading(true);

    try {
      // In production, this would be an API call
      // const response = await fetch('/api/auth/login', { ... });

      // Mock login logic
      if (email && password) {
        const isAdmin = await analyticsService.checkAdminStatus(email);
        console.log("Admin status check:", { email, isAdmin });

        const newUser: User = {
          id:
            email === "coinkrazy00@gmail.com"
              ? "user_admin_001"
              : `user_${Date.now()}`,
          username: email,
          email,
          isLoggedIn: true,
          isAdmin,
          goldCoins: 125000,
          sweepsCoins: 45.67,
          level: 25,
          joinDate: new Date("2024-01-15"),
          lastLogin: new Date(),
        };

        console.log("Setting user:", newUser);
        setUser(newUser);
        localStorage.setItem("coinkrazy_user", JSON.stringify(newUser));
        setIsLoading(false);
        return true;
      }

      console.log("Login failed: missing email or password");
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("coinkrazy_user");
  };

  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const isAdmin = await analyticsService.checkAdminStatus(user.id);

      // Update user object if admin status changed
      if (isAdmin !== user.isAdmin) {
        const updatedUser = { ...user, isAdmin };
        setUser(updatedUser);
        localStorage.setItem("coinkrazy_user", JSON.stringify(updatedUser));
      }

      return isAdmin;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  };

  return {
    user,
    login,
    logout,
    checkAdminStatus,
    isLoading,
  };
};

// Export types
export type { User, AuthContextType };
