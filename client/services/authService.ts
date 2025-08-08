// Remove direct database access - use API endpoints only

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

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Register API error:", response.status, errorText);
        return {
          success: false,
          message: `Registration failed: ${response.status} ${response.statusText}`,
        };
      }

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

      console.log("Attempting login for:", email);

      // Call the login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Login API error:", response.status, errorText);
        return {
          success: false,
          message: `Login failed: ${response.status} ${response.statusText}`,
        };
      }

      const result = await response.json();
      console.log("Login result:", { success: result.success, hasUser: !!result.user });

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
      const response = await fetch("/api/users/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Email verification API error:", response.status, errorText);
        return {
          success: false,
          message: "Invalid or expired verification token",
        };
      }

      const user = await response.json();
      if (!user) {
        return {
          success: false,
          message: "Invalid or expired verification token",
        };
      }

      return {
        success: true,
        message: "Email verified successfully! Your welcome bonus is ready to claim.",
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
      // For now, just return a success message (password reset API not implemented yet)
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

      // For now, just return a message (password reset API not implemented yet)
      return {
        success: false,
        message: "Password reset functionality is not yet available. Please contact support.",
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
    // Email sending will be implemented later
  }

  private async sendWelcomeEmail(
    email: string,
    username: string,
  ): Promise<void> {
    console.log(`Welcome email sent to ${email} for user: ${username}`);
    // Email sending will be implemented later
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

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Admin init API error:", response.status, errorText);
        return {
          success: false,
          message: `Failed to initialize admin: ${response.status} ${response.statusText}`,
        };
      }

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

      // This will be implemented with proper API endpoints later
      console.log(`Update user ${userId} status to ${status}`);
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

      // This will be implemented with proper API endpoints later
      console.log(`Update user ${userId} KYC status to ${kycStatus}`);
      return true;
    } catch (error) {
      console.error("Update user KYC error:", error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
