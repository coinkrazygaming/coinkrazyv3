import {
  User,
  RegisterData,
  LoginData,
  AuthResponse,
  VerificationData,
  ResetPasswordData,
  NewPasswordData,
  WelcomeBonus,
  Transaction,
  UserBonus,
} from "../types/auth";
import { emailService } from "./emailService";
import { realNeonService, UserData } from "./realNeonService";

class AuthService {
  private users: Map<string, User> = new Map();
  private sessions: Map<string, string> = new Map(); // token -> userId
  private verificationCodes: Map<
    string,
    { code: string; expires: Date; userId: string }
  > = new Map();
  private resetTokens: Map<
    string,
    { token: string; expires: Date; userId: string }
  > = new Map();

  constructor() {
    this.loadUsersFromStorage();
    this.initializeNeonConnection();
  }

  private async initializeNeonConnection() {
    try {
      // Wait longer for Neon to be fully ready
      await new Promise(resolve => setTimeout(resolve, 5000));

      if (realNeonService.isConnected()) {
        console.log('✅ AuthService connected to Neon Database');

        // Add another delay before syncing users
        setTimeout(async () => {
          try {
            await this.syncUsersToNeon();
          } catch (error) {
            console.error('Failed to sync users to Neon:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to initialize Neon connection:', error);
    }
  }

  private async syncUsersToNeon() {
    try {
      // Check if admin user exists in Neon
      const adminUser = await realNeonService.getUserByEmail('coinkrazy00@gmail.com');
      if (!adminUser) {
        // Create admin user in Neon
        await realNeonService.createUser({
          email: 'coinkrazy00@gmail.com',
          username: 'CoinKrazy Admin',
          firstName: 'CoinKrazy',
          lastName: 'Admin',
          emailVerified: true,
          status: 'active',
          gcBalance: 1000000,
          scBalance: 500.00,
          preferences: {
            theme: 'dark',
            currency: 'USD',
            notifications: {
              email: true,
              sms: false,
              push: true,
              bonuses: true,
              promotions: true,
              gameUpdates: true,
            }
          }
        });
        console.log('✅ Admin user synced to Neon');
      }
    } catch (error) {
      console.error('Failed to sync users to Neon:', error);
    }
  }

  private loadUsersFromStorage(): void {
    try {
      const usersData = localStorage.getItem("users");
      if (usersData) {
        const users = JSON.parse(usersData);
        users.forEach((user: User) => {
          this.users.set(user.id, {
            ...user,
            joinDate: new Date(user.joinDate),
            lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
          });
        });
      }
    } catch (error) {
      console.error("Failed to load users from storage:", error);
    }
  }

  private saveUsersToStorage(): void {
    try {
      const users = Array.from(this.users.values());
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error("Failed to save users to storage:", error);
    }
  }

  private initializeDefaultUsers(): void {
    if (this.users.size === 0) {
      const defaultUser: User = {
        id: "user-1",
        email: "demo@coinfrazy.com",
        firstName: "Demo",
        lastName: "User",
        username: "demouser",
        emailVerified: true,
        status: "active",
        kycStatus: "verified",
        gcBalance: 250000,
        scBalance: 125.5,
        bonusBalance: 0,
        joinDate: new Date("2024-01-15"),
        lastLogin: new Date(),
      };

      this.users.set(defaultUser.id, defaultUser);
      this.saveUsersToStorage();
    }
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return `token-${Date.now()}-${Math.random().toString(36).substr(2, 16)}`;
  }

  private generateVerificationCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): {
    valid: boolean;
    message?: string;
  } {
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters long",
      };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }
    if (!/(?=.*\d)/.test(password)) {
      return {
        valid: false,
        message: "Password must contain at least one number",
      };
    }
    return { valid: true };
  }

  private createWelcomeBonus(): WelcomeBonus {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    return {
      goldCoins: 10,
      sweepsCoins: 10,
      description:
        "Welcome to CoinKrazy! Enjoy your 10 Gold Coins + 10 Sweeps Coins bonus to get started!",
      expiresAt,
      claimed: false,
    };
  }

  private async awardWelcomeBonus(user: User): Promise<WelcomeBonus> {
    const welcomeBonus = this.createWelcomeBonus();

    // Add bonus to user account
    user.gcBalance += welcomeBonus.goldCoins;
    user.scBalance += welcomeBonus.sweepsCoins;

    // Create transaction record
    const transaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: "bonus",
      amount: welcomeBonus.goldCoins,
      currency: "GC",
      status: "completed",
      description: "Welcome Bonus - Gold Coins",
      metadata: {
        bonusType: "welcome",
        sweepsCoins: welcomeBonus.sweepsCoins,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      processedAt: new Date(),
    };

    // Store transaction (in a real app, this would go to a database)
    const transactions = JSON.parse(
      localStorage.getItem("transactions") || "[]",
    );
    transactions.push(transaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    // Create Sweeps Coins transaction
    const scTransaction: Transaction = {
      ...transaction,
      id: `tx-${Date.now() + 1}-${Math.random().toString(36).substr(2, 9)}`,
      amount: welcomeBonus.sweepsCoins,
      currency: "SC",
      description: "Welcome Bonus - Sweeps Coins",
    };

    transactions.push(scTransaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    this.users.set(user.id, user);
    this.saveUsersToStorage();

    welcomeBonus.claimed = true;
    welcomeBonus.claimedAt = new Date();

    return welcomeBonus;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input
      if (!this.validateEmail(data.email)) {
        return { success: false, error: "Invalid email format" };
      }

      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      if (!data.acceptTerms || !data.acceptPrivacy) {
        return {
          success: false,
          error: "You must accept the terms and privacy policy",
        };
      }

      // Check if user already exists in Neon
      let existingUser = null;
      if (realNeonService.isConnected()) {
        existingUser = await realNeonService.getUserByEmail(data.email);
      } else {
        // Fallback to local storage
        existingUser = Array.from(this.users.values()).find(
          (u) => u.email === data.email,
        );
      }

      if (existingUser) {
        return {
          success: false,
          error: "An account with this email already exists",
        };
      }

      // Create user data
      const userData: Partial<UserData> = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username || data.email.split("@")[0],
        emailVerified: false,
        status: "pending_verification",
        kycStatus: "none",
        gcBalance: 0,
        scBalance: 0,
        bonusBalance: 0,
        preferences: {
          theme: "auto",
          language: "en",
          currency: "USD",
          notifications: {
            email: data.newsletterOptIn || true,
            sms: false,
            push: true,
            bonuses: true,
            promotions: data.newsletterOptIn || false,
            gameUpdates: true,
          },
          privacy: {
            showOnlineStatus: true,
            showActivity: false,
            allowFriendRequests: true,
          },
        },
      };

      let user: User;

      if (realNeonService.isConnected()) {
        // Create user in Neon database
        const neonUser = await realNeonService.createUser(userData);
        user = this.mapNeonUserToLocal(neonUser);

        // Log registration action
        await realNeonService.logAdminAction({
          admin_user_id: 'system',
          action: 'user_registered',
          target_type: 'user',
          target_id: user.id,
          details: {
            email: user.email,
            registrationMethod: 'web',
            acceptedTerms: data.acceptTerms,
            acceptedPrivacy: data.acceptPrivacy,
            newsletterOptIn: data.newsletterOptIn
          },
          severity: 'info'
        });
      } else {
        // Fallback to local storage
        const userId = this.generateId();
        user = {
          id: userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username || data.email.split("@")[0],
          emailVerified: false,
          status: "pending_verification",
          kycStatus: "none",
          gcBalance: 0,
          scBalance: 0,
          bonusBalance: 0,
          joinDate: new Date(),
          preferences: userData.preferences,
        };

        this.users.set(userId, user);
        this.saveUsersToStorage();
      }

      // Send verification email
      const verificationCode = this.generateVerificationCode();
      const verificationLink = `${window.location.origin}/verify-email?code=${verificationCode}&email=${encodeURIComponent(data.email)}`;

      this.verificationCodes.set(data.email, {
        code: verificationCode,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        userId: user.id,
      });

      await emailService.sendVerificationEmail(
        user,
        verificationCode,
        verificationLink,
      );

      return {
        success: true,
        user,
        message:
          "Registration successful! Please check your email to verify your account and claim your welcome bonus.",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      let user: User | null = null;

      if (realNeonService.isConnected()) {
        // Get user from Neon database
        const neonUser = await realNeonService.getUserByEmail(data.email);
        if (neonUser) {
          user = this.mapNeonUserToLocal(neonUser);

          // Update last login in Neon
          await realNeonService.updateUser(user.id, {
            lastLogin: new Date()
          });

          // Log login action
          await realNeonService.logAdminAction({
            admin_user_id: user.id,
            action: 'user_login',
            target_type: 'user',
            target_id: user.id,
            details: {
              loginMethod: 'web',
              userAgent: navigator.userAgent
            },
            ip_address: 'client-side', // In production, get real IP
            user_agent: navigator.userAgent,
            severity: 'info'
          });
        }
      } else {
        // Fallback to local storage
        user = Array.from(this.users.values()).find(
          (u) => u.email === data.email,
        );
      }

      if (!user) {
        return { success: false, error: "Invalid email or password" };
      }

      if (user.status === "banned") {
        return {
          success: false,
          error: "Account has been banned. Please contact support.",
        };
      }

      if (user.status === "suspended") {
        return {
          success: false,
          error: "Account is suspended. Please contact support.",
        };
      }

      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll accept any password for existing users

      // Update last login in local storage as backup
      if (!realNeonService.isConnected()) {
        user.lastLogin = new Date();
        this.users.set(user.id, user);
        this.saveUsersToStorage();
      }

      // Generate session token
      const token = this.generateToken();
      this.sessions.set(token, user.id);

      return {
        success: true,
        user,
        token,
        message: "Login successful!",
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  }

  async verifyEmail(data: VerificationData): Promise<AuthResponse> {
    try {
      const verification = this.verificationCodes.get(data.email);
      if (!verification) {
        return {
          success: false,
          error: "Invalid or expired verification code",
        };
      }

      if (verification.expires < new Date()) {
        this.verificationCodes.delete(data.email);
        return { success: false, error: "Verification code has expired" };
      }

      if (verification.code !== data.code.toUpperCase()) {
        return { success: false, error: "Invalid verification code" };
      }

      const user = this.users.get(verification.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Mark email as verified and activate account
      user.emailVerified = true;
      user.status = "active";

      // Award welcome bonus
      const welcomeBonus = await this.awardWelcomeBonus(user);

      this.users.set(user.id, user);
      this.saveUsersToStorage();
      this.verificationCodes.delete(data.email);

      // Send welcome email with bonus information
      await emailService.sendWelcomeEmail(user, {
        goldCoins: welcomeBonus.goldCoins,
        sweepsCoins: welcomeBonus.sweepsCoins,
        description: welcomeBonus.description,
        expiresAt: welcomeBonus.expiresAt,
      });

      // Generate session token
      const token = this.generateToken();
      this.sessions.set(token, user.id);

      return {
        success: true,
        user,
        token,
        welcomeBonus,
        message: `Email verified successfully! Your welcome bonus of ${welcomeBonus.goldCoins} Gold Coins + ${welcomeBonus.sweepsCoins} Sweeps Coins has been added to your account!`,
      };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        error: "Email verification failed. Please try again.",
      };
    }
  }

  async resendVerification(email: string): Promise<AuthResponse> {
    try {
      const user = Array.from(this.users.values()).find(
        (u) => u.email === email,
      );
      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (user.emailVerified) {
        return { success: false, error: "Email is already verified" };
      }

      // Generate new verification code
      const verificationCode = this.generateVerificationCode();
      const verificationLink = `${window.location.origin}/verify-email?code=${verificationCode}&email=${encodeURIComponent(email)}`;

      this.verificationCodes.set(email, {
        code: verificationCode,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        userId: user.id,
      });

      await emailService.sendVerificationEmail(
        user,
        verificationCode,
        verificationLink,
      );

      return {
        success: true,
        message: "Verification email sent! Please check your email.",
      };
    } catch (error) {
      console.error("Resend verification error:", error);
      return {
        success: false,
        error: "Failed to resend verification email. Please try again.",
      };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      const user = Array.from(this.users.values()).find(
        (u) => u.email === data.email,
      );
      if (!user) {
        // Don't reveal if email exists for security
        return {
          success: true,
          message:
            "If an account with this email exists, a password reset link has been sent.",
        };
      }

      // Generate reset token
      const resetToken = this.generateToken();
      const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`;

      this.resetTokens.set(resetToken, {
        token: resetToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        userId: user.id,
      });

      await emailService.sendPasswordResetEmail(user, resetLink);

      return {
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent.",
      };
    } catch (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: "Failed to send password reset email. Please try again.",
      };
    }
  }

  async setNewPassword(data: NewPasswordData): Promise<AuthResponse> {
    try {
      const resetData = this.resetTokens.get(data.token);
      if (!resetData) {
        return { success: false, error: "Invalid or expired reset token" };
      }

      if (resetData.expires < new Date()) {
        this.resetTokens.delete(data.token);
        return { success: false, error: "Reset token has expired" };
      }

      if (data.password !== data.confirmPassword) {
        return { success: false, error: "Passwords do not match" };
      }

      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message };
      }

      const user = this.users.get(resetData.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      // In a real app, you'd hash the password here
      this.users.set(user.id, user);
      this.saveUsersToStorage();
      this.resetTokens.delete(data.token);

      return {
        success: true,
        message:
          "Password updated successfully! You can now log in with your new password.",
      };
    } catch (error) {
      console.error("Set new password error:", error);
      return {
        success: false,
        error: "Failed to update password. Please try again.",
      };
    }
  }

  async updateProfile(
    userId: string,
    updates: Partial<User>,
  ): Promise<AuthResponse> {
    try {
      const user = this.users.get(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const updatedUser = { ...user, ...updates };
      this.users.set(userId, updatedUser);
      this.saveUsersToStorage();

      return {
        success: true,
        user: updatedUser,
        message: "Profile updated successfully!",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        error: "Failed to update profile. Please try again.",
      };
    }
  }

  getUserByToken(token: string): User | null {
    const userId = this.sessions.get(token);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  logout(token: string): void {
    this.sessions.delete(token);
  }

  // Admin methods
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  async suspendUser(userId: string, reason: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.status = "suspended";
    this.users.set(userId, user);
    this.saveUsersToStorage();
    return true;
  }

  async activateUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.status = "active";
    this.users.set(userId, user);
    this.saveUsersToStorage();
    return true;
  }

  getUserStats(): {
    total: number;
    active: number;
    suspended: number;
    pending: number;
    verified: number;
  } {
    const users = Array.from(this.users.values());
    return {
      total: users.length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
      pending: users.filter((u) => u.status === "pending_verification").length,
      verified: users.filter((u) => u.emailVerified).length,
    };
  }

  // Helper method to map Neon user to local User format
  private mapNeonUserToLocal(neonUser: UserData): User {
    return {
      id: neonUser.id,
      email: neonUser.email,
      firstName: neonUser.firstName,
      lastName: neonUser.lastName,
      username: neonUser.username,
      emailVerified: neonUser.emailVerified || false,
      status: neonUser.status as any,
      kycStatus: neonUser.kycStatus as any,
      gcBalance: neonUser.gcBalance || 0,
      scBalance: neonUser.scBalance || 0,
      bonusBalance: neonUser.bonusBalance || 0,
      joinDate: neonUser.joinDate || new Date(),
      lastLogin: neonUser.lastLogin,
      preferences: neonUser.preferences || {},
    };
  }

  // Get real-time user data from Neon
  async getUserFromNeon(userId: string): Promise<User | null> {
    try {
      if (realNeonService.isConnected()) {
        const neonUser = await realNeonService.getUserById(userId);
        return neonUser ? this.mapNeonUserToLocal(neonUser) : null;
      }
      return this.users.get(userId) || null;
    } catch (error) {
      console.error('Failed to get user from Neon:', error);
      return this.users.get(userId) || null;
    }
  }

  // Check if Neon is connected
  isNeonConnected(): boolean {
    return realNeonService.isConnected();
  }
}

export const authService = new AuthService();
