// Client-side auth service using API calls

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: "user" | "admin" | "vip";
  status: "active" | "suspended" | "banned" | "pending_verification";
  kyc_status: "not_submitted" | "pending" | "verified" | "rejected";
  is_email_verified: boolean;
  vip_expires_at?: Date;
  created_at: Date;
  last_login?: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  requiresEmailVerification?: boolean;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    // Check for existing session
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("current_user");

    if (token && userStr) {
      try {
        this.authToken = token;
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        this.clearSession();
      }
    }
  }

  private saveSession(user: User, token: string) {
    this.currentUser = user;
    this.authToken = token;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("current_user", JSON.stringify(user));
  }

  private clearSession() {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
  }

  private generateToken(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36)
    );
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        this.saveSession(result.user, result.token);
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Login failed. Please try again." };
    }
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        message: "Email verification failed. Please try again.",
      };
    }
  }

  async logout(): Promise<void> {
    this.clearSession();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === "admin";
  }

  isVIP(): boolean {
    const user = this.currentUser;
    if (!user || user.role !== "vip") return false;

    if (user.vip_expires_at) {
      return new Date(user.vip_expires_at) > new Date();
    }

    return false;
  }

  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      // Simple placeholder implementation
      return {
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Failed to send password reset email. Please try again.",
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Simple placeholder implementation
      return {
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Failed to reset password. Please try again.",
      };
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
