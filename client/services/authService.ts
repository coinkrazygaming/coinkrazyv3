import bcrypt from "bcryptjs";
import { databaseService } from "./database";

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
  isLoggedIn?: boolean;
  isAdmin?: boolean;
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
      // Call the register API
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
      if (!email || !password) {
        return { success: false, message: "Email and password are required" };
      }

      // Call the login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login API error:", response.status, errorText);
        return {
          success: false,
          message: `Login failed: ${response.status} ${response.statusText}`
        };
      }

      const result = await response.json();

      if (result.success && result.user) {
        // Save session
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
      const user = await databaseService.verifyEmail(token);
      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification token",
        };
      }

      // Import bonusService dynamically to avoid circular dependency
      const { bonusService } = await import("./bonusService");

      // Award welcome bonus after email verification
      const bonusResult = await bonusService.claimWelcomeBonus(user.id);

      // Send welcome email with bonus info
      await this.sendWelcomeEmail(user.email, user.username);

      return {
        success: true,
        message: bonusResult.success
          ? `Email verified successfully! ${bonusResult.message}`
          : "Email verified successfully! Your welcome bonus is ready to claim.",
      };
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
      const user = await databaseService.getUserByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if email exists or not for security
        return {
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent.",
        };
      }

      const resetToken = this.generateToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await databaseService.query(
        "UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
        [resetToken, resetExpires, user.id],
      );

      // Send password reset email (simulate for now)
      await this.sendPasswordResetEmail(user.email, resetToken);

      return {
        success: true,
        message: "Password reset link has been sent to your email.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Failed to send password reset email. Please try again.",
      };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<AuthResponse> {
    try {
      if (newPassword.length < 6) {
        return {
          success: false,
          message: "Password must be at least 6 characters long",
        };
      }

      const user = await databaseService.query(
        "SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP",
        [token],
      );

      if (!user.rows.length) {
        return { success: false, message: "Invalid or expired reset token" };
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await databaseService.query(
        "UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2",
        [passwordHash, user.rows[0].id],
      );

      return {
        success: true,
        message:
          "Password has been reset successfully. You can now log in with your new password.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        message: "Failed to reset password. Please try again.",
      };
    }
  }

  // Email methods (simulate for now - will be implemented with SMTP later)
  private async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    console.log(`Verification email sent to ${email} with token: ${token}`);

    // Create admin notification
    await databaseService.createAdminNotification(
      "Email Verification Sent",
      `Verification email sent to ${email}`,
      "info",
      1, // LuckyAI
    );
  }

  private async sendWelcomeEmail(
    email: string,
    username: string,
  ): Promise<void> {
    console.log(`Welcome email sent to ${email} for user: ${username}`);

    // Create admin notification
    await databaseService.createAdminNotification(
      "Welcome Bonus Awarded",
      `Welcome bonus awarded to ${username} (${email})`,
      "success",
      1, // LuckyAI
    );
  }

  private async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    console.log(`Password reset email sent to ${email} with token: ${token}`);
  }

  // Admin initialization
  async initializeAdmin(): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/init-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Admin initialization error:", error);
      return {
        success: false,
        message: "Failed to initialize admin user",
      };
    }
  }

  // Admin methods
  async updateUserStatus(userId: number, status: string): Promise<boolean> {
    try {
      if (!this.isAdmin()) {
        throw new Error("Unauthorized: Admin access required");
      }

      await databaseService.query(
        "UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [status, userId],
      );

      return true;
    } catch (error) {
      console.error("Update user status error:", error);
      return false;
    }
  }

  async updateUserKYC(
    userId: number,
    kycStatus: string,
    documents?: any,
  ): Promise<boolean> {
    try {
      if (!this.isAdmin()) {
        throw new Error("Unauthorized: Admin access required");
      }

      await databaseService.query(
        "UPDATE users SET kyc_status = $1, kyc_documents = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [kycStatus, JSON.stringify(documents || {}), userId],
      );

      return true;
    } catch (error) {
      console.error("Update user KYC error:", error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
