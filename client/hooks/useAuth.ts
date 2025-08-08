import { useState, useEffect } from "react";
import {
  authService,
  User,
  AuthResponse,
  RegisterData,
} from "../services/authService";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVIP: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<AuthResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<AuthResponse>;
  refreshUser: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
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
    console.log("Logout called");
    setUser(null);
    localStorage.removeItem("coinkrazy_user");
=======
    // Initialize auth state
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      return response;
    } finally {
      setLoading(false);
    }
>>>>>>> ced1cff90766550d756d2fe323dd56584effa147
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.verifyEmail(token);
      return response;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
    return authService.requestPasswordReset(email);
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<AuthResponse> => {
    return authService.resetPassword(token, newPassword);
  };

  const refreshUser = () => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  return {
    user,
    loading,
    isAuthenticated: authService.isAuthenticated(),
    isAdmin: authService.isAdmin(),
    isVIP: authService.isVIP(),
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    refreshUser,
  };
};
