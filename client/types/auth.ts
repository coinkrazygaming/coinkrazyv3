export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  emailVerified: boolean;
  status: "active" | "suspended" | "banned" | "pending_verification";
  kycStatus: "none" | "pending" | "verified" | "rejected";
  gcBalance: number;
  scBalance: number;
  bonusBalance: number;
  joinDate: Date;
  lastLogin?: Date;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface UserProfile {
  avatar?: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences?: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    bonusAlerts: boolean;
  };
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    bonuses: boolean;
    promotions: boolean;
    gameUpdates: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showActivity: boolean;
    allowFriendRequests: boolean;
  };
}

export interface WelcomeBonus {
  goldCoins: number;
  sweepsCoins: number;
  description: string;
  expiresAt: Date;
  claimed: boolean;
  claimedAt?: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  dateOfBirth?: Date;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  newsletterOptIn?: boolean;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  error?: string;
  welcomeBonus?: WelcomeBonus;
}

export interface VerificationData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface NewPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  verifyEmail: (data: VerificationData) => Promise<AuthResponse>;
  resendVerification: (email: string) => Promise<AuthResponse>;
  resetPassword: (data: ResetPasswordData) => Promise<AuthResponse>;
  setNewPassword: (data: NewPasswordData) => Promise<AuthResponse>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "bonus" | "win" | "bet" | "refund";
  amount: number;
  currency: "GC" | "SC" | "USD";
  status: "pending" | "completed" | "failed" | "cancelled";
  description: string;
  referenceId?: string;
  gameId?: string;
  bonusId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

export interface Bonus {
  id: string;
  type: "welcome" | "deposit" | "no_deposit" | "reload" | "loyalty" | "special";
  title: string;
  description: string;
  goldCoins: number;
  sweepsCoins: number;
  multiplier?: number;
  requirements?: {
    minDeposit?: number;
    playthrough?: number;
    maxCashout?: number;
    games?: string[];
    expiry?: Date;
  };
  isActive: boolean;
  eligibleUsers?: string[];
  createdAt: Date;
  expiresAt?: Date;
}

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  bonus: Bonus;
  status: "pending" | "active" | "completed" | "expired" | "forfeited";
  claimedAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
  progress?: {
    playthroughRequired: number;
    playthroughCompleted: number;
    remainingWager: number;
  };
  metadata?: Record<string, any>;
}
