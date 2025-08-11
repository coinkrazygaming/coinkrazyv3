import { useState, useEffect } from "react";
import {
  authService,
  User,
  AuthResponse,
  RegisterData,
} from "../services/authService";
import { emailService } from "../services/emailService";
import { walletService } from "../services/walletService";
import { welcomeEmailAutomationService } from "../services/welcomeEmailAutomation";
import { joseyAiOnboardingService } from "../services/joseyAiOnboardingService";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
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
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
    } catch (error) {
      console.error("Error loading stored user:", error);
      localStorage.removeItem("auth_user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("auth_user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true);
    try {
      const response = await authService.register(data);

      if (
        response.success &&
        response.user &&
        !response.requiresEmailVerification
      ) {
        setUser(response.user);
        localStorage.setItem("auth_user", JSON.stringify(response.user));

        // Initialize user services and start welcome automation
        walletService.getUserBalance(response.user.email);

        // Create JoseyAI onboarding account for personalized experience
        joseyAiOnboardingService.createUserAccount({
          id: response.user.id.toString(),
          email: response.user.email,
          username: response.user.username,
          accountType: response.user.role === "vip" ? "admin" : "user",
        });

        // Start comprehensive welcome email sequence
        const sequenceId =
          response.user.role === "vip" ? "vip_welcome" : "standard_welcome";
        welcomeEmailAutomationService.startWelcomeSequence(
          response.user.id.toString(),
          response.user.email,
          response.user.username,
          sequenceId,
        );

        // Also send immediate welcome email for backward compatibility
        emailService.sendWelcomeEmail(
          response.user.id.toString(),
          response.user.email,
          response.user.username,
        );
      }

      return response;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("auth_user");
    }
  };

  const verifyEmail = async (token: string): Promise<AuthResponse> => {
    try {
      const response = await authService.verifyEmail(token);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("auth_user", JSON.stringify(response.user));

        // Trigger email verification event in welcome automation
        welcomeEmailAutomationService.triggerEmailByEvent(
          response.user.id.toString(),
          "email_verified",
        );
      }

      return response;
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Email verification failed. Please try again.",
      };
    }
  };

  const requestPasswordReset = async (email: string): Promise<AuthResponse> => {
    try {
      return await authService.requestPasswordReset(email);
    } catch (error) {
      console.error("Password reset request error:", error);
      return {
        success: false,
        message: "Failed to send password reset email. Please try again.",
      };
    }
  };

  const resetPassword = async (
    token: string,
    newPassword: string,
  ): Promise<AuthResponse> => {
    try {
      return await authService.resetPassword(token, newPassword);
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Password reset failed. Please try again.",
      };
    }
  };

  const refreshUser = () => {
    initializeAuth();
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isStaff: user?.role === "staff",
    isVIP: user?.vip || false,
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    refreshUser,
  };
};
