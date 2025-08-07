import bcrypt from 'bcryptjs';
import { databaseService } from './database';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: 'user' | 'admin' | 'vip';
  status: 'active' | 'suspended' | 'banned' | 'pending_verification';
  kyc_status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
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
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('current_user');
    
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
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private clearSession() {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  private generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validate input
      if (!data.email || !data.username || !data.password) {
        return { success: false, message: 'Email, username, and password are required' };
      }

      if (data.password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      // Check age requirement (18+)
      if (data.dateOfBirth) {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          return { success: false, message: 'You must be 18 or older to register' };
        }
      }

      // Check if email already exists
      const existingEmail = await databaseService.getUserByEmail(data.email);
      if (existingEmail) {
        return { success: false, message: 'Email address is already registered' };
      }

      // Check if username already exists
      const existingUsername = await databaseService.getUserByUsername(data.username);
      if (existingUsername) {
        return { success: false, message: 'Username is already taken' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // Create user
      const newUser = await databaseService.createUser({
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName
      });

      // Send verification email (simulate for now)
      await this.sendVerificationEmail(newUser.email, newUser.verification_token);

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account and claim your welcome bonus.',
        requiresEmailVerification: true
      };

    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        return { success: false, message: 'Email and password are required' };
      }

      // Get user by email
      const user = await databaseService.getUserByEmail(email.toLowerCase());
      if (!user) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check if account is active
      if (user.status === 'banned') {
        return { success: false, message: 'Account has been suspended. Contact support.' };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return { success: false, message: 'Invalid email or password' };
      }

      // Check email verification
      if (!user.is_email_verified) {
        return { 
          success: false, 
          message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          requiresEmailVerification: true
        };
      }

      // Update last login
      await databaseService.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP, ip_address = $2 WHERE id = $1',
        [user.id, '127.0.0.1'] // In production, get real IP
      );

      // Generate session token
      const token = this.generateToken();

      // Clean user object (remove sensitive data)
      const cleanUser: User = {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        status: user.status,
        kyc_status: user.kyc_status,
        is_email_verified: user.is_email_verified,
        vip_expires_at: user.vip_expires_at,
        created_at: user.created_at,
        last_login: new Date()
      };

      // Save session
      this.saveSession(cleanUser, token);

      return {
        success: true,
        user: cleanUser,
        token,
        message: 'Login successful!'
      };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const user = await databaseService.verifyEmail(token);
      if (!user) {
        return { success: false, message: 'Invalid or expired verification token' };
      }

      // Import bonusService dynamically to avoid circular dependency
      const { bonusService } = await import('./bonusService');

      // Award welcome bonus after email verification
      const bonusResult = await bonusService.claimWelcomeBonus(user.id);

      // Send welcome email with bonus info
      await this.sendWelcomeEmail(user.email, user.username);

      return {
        success: true,
        message: bonusResult.success
          ? `Email verified successfully! ${bonusResult.message}`
          : 'Email verified successfully! Your welcome bonus is ready to claim.'
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, message: 'Email verification failed. Please try again.' };
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
    return this.currentUser?.role === 'admin';
  }

  isVIP(): boolean {
    const user = this.currentUser;
    if (!user || user.role !== 'vip') return false;
    
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
        return { success: true, message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      const resetToken = this.generateToken();
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await databaseService.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, user.id]
      );

      // Send password reset email (simulate for now)
      await this.sendPasswordResetEmail(user.email, resetToken);

      return { success: true, message: 'Password reset link has been sent to your email.' };

    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Failed to send password reset email. Please try again.' };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      if (newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters long' };
      }

      const user = await databaseService.query(
        'SELECT * FROM users WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP',
        [token]
      );

      if (!user.rows.length) {
        return { success: false, message: 'Invalid or expired reset token' };
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await databaseService.query(
        'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
        [passwordHash, user.rows[0].id]
      );

      return { success: true, message: 'Password has been reset successfully. You can now log in with your new password.' };

    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Failed to reset password. Please try again.' };
    }
  }

  // Email methods (simulate for now - will be implemented with SMTP later)
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`Verification email sent to ${email} with token: ${token}`);
    
    // Create admin notification
    await databaseService.createAdminNotification(
      'Email Verification Sent',
      `Verification email sent to ${email}`,
      'info',
      1 // LuckyAI
    );
  }

  private async sendWelcomeEmail(email: string, username: string): Promise<void> {
    console.log(`Welcome email sent to ${email} for user: ${username}`);
    
    // Create admin notification
    await databaseService.createAdminNotification(
      'Welcome Bonus Awarded',
      `Welcome bonus awarded to ${username} (${email})`,
      'success',
      1 // LuckyAI
    );
  }

  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`Password reset email sent to ${email} with token: ${token}`);
  }

  // Admin methods
  async updateUserStatus(userId: number, status: string): Promise<boolean> {
    try {
      if (!this.isAdmin()) {
        throw new Error('Unauthorized: Admin access required');
      }

      await databaseService.query(
        'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [status, userId]
      );

      return true;
    } catch (error) {
      console.error('Update user status error:', error);
      return false;
    }
  }

  async updateUserKYC(userId: number, kycStatus: string, documents?: any): Promise<boolean> {
    try {
      if (!this.isAdmin()) {
        throw new Error('Unauthorized: Admin access required');
      }

      await databaseService.query(
        'UPDATE users SET kyc_status = $1, kyc_documents = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [kycStatus, JSON.stringify(documents || {}), userId]
      );

      return true;
    } catch (error) {
      console.error('Update user KYC error:', error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
