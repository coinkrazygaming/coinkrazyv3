// Client-side Auth Service for CoinKrazy.com
// This handles authentication and user state management in the browser

export interface User {
  id: number;
  email: string;
  username: string;
  role: "user" | "staff" | "admin";
  is_verified: boolean;
  kyc_status: "pending" | "verified" | "rejected";
  created_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface UserBalance {
  currency: "GC" | "SC";
  balance: number;
  locked_balance: number;
  total_deposited: number;
  total_won: number;
}

export interface AuthUser extends User {
  balances: UserBalance[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private listeners: Set<(user: AuthUser | null) => void> = new Set();

  // Mock user data for development - in production this would come from API calls
  private mockUsers = [
    {
      id: 1,
      email: "admin@coinkrazy.com",
      username: "admin",
      role: "admin" as const,
      is_verified: true,
      kyc_status: "verified" as const,
      created_at: new Date("2024-01-01"),
      is_active: true,
      balances: [
        {
          currency: "GC" as const,
          balance: 1000000,
          locked_balance: 0,
          total_deposited: 1000000,
          total_won: 0,
        },
        {
          currency: "SC" as const,
          balance: 3724,
          locked_balance: 0,
          total_deposited: 0,
          total_won: 3724,
        },
      ],
    },
    {
      id: 2,
      email: "staff@coinkrazy.com",
      username: "staff_user",
      role: "staff" as const,
      is_verified: true,
      kyc_status: "verified" as const,
      created_at: new Date("2024-01-01"),
      is_active: true,
      balances: [
        {
          currency: "GC" as const,
          balance: 75000,
          locked_balance: 0,
          total_deposited: 75000,
          total_won: 0,
        },
        {
          currency: "SC" as const,
          balance: 250,
          locked_balance: 0,
          total_deposited: 0,
          total_won: 250,
        },
      ],
    },
    {
      id: 3,
      email: "user@coinkrazy.com",
      username: "test_user",
      role: "user" as const,
      is_verified: true,
      kyc_status: "verified" as const,
      created_at: new Date("2024-01-01"),
      is_active: true,
      balances: [
        {
          currency: "GC" as const,
          balance: 50000,
          locked_balance: 0,
          total_deposited: 50000,
          total_won: 0,
        },
        {
          currency: "SC" as const,
          balance: 25,
          locked_balance: 0,
          total_deposited: 0,
          total_won: 25,
        },
      ],
    },
  ];

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.loadUserFromStorage();
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find user in mock data (in production: API call)
      const userData = this.mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!userData) {
        throw new Error("Invalid email or password");
      }

      // In production: verify password hash
      // For demo: accept any password

      const authUser: AuthUser = {
        ...userData,
        isLoggedIn: true,
        isAdmin: userData.role === "admin",
        isStaff: userData.role === "staff",
        last_login: new Date(),
      };

      this.currentUser = authUser;
      this.saveUserToStorage(authUser);
      this.notifyListeners();

      return authUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<AuthUser> {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user already exists
      if (this.mockUsers.find((u) => u.email === email)) {
        throw new Error("User already exists");
      }

      // Create new user (in production: API call)
      const newUserData = {
        id: this.mockUsers.length + 1,
        email,
        username,
        role: "user" as const,
        is_verified: false,
        kyc_status: "pending" as const,
        created_at: new Date(),
        is_active: true,
        balances: [
          {
            currency: "GC" as const,
            balance: 50000,
            locked_balance: 0,
            total_deposited: 50000,
            total_won: 0,
          },
          {
            currency: "SC" as const,
            balance: 25,
            locked_balance: 0,
            total_deposited: 0,
            total_won: 25,
          },
        ],
      };

      this.mockUsers.push(newUserData);

      const authUser: AuthUser = {
        ...newUserData,
        isLoggedIn: true,
        isAdmin: false,
        isStaff: false,
        last_login: new Date(),
      };

      this.currentUser = authUser;
      this.saveUserToStorage(authUser);
      this.notifyListeners();

      return authUser;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem("coinkrazy_user");
    this.notifyListeners();
  }

  /**
   * Get current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null && this.currentUser.isLoggedIn;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }

  /**
   * Check if user is staff
   */
  isStaff(): boolean {
    return this.currentUser?.isStaff || false;
  }

  /**
   * Update user balance
   */
  async updateBalance(
    currency: "GC" | "SC",
    amount: number,
    type: "deposit" | "withdrawal" | "win" | "bet" | "bonus",
    description?: string,
    gameId?: string,
  ): Promise<number> {
    if (!this.currentUser) {
      throw new Error("User not logged in");
    }

    try {
      // Find balance for currency
      const balanceIndex = this.currentUser.balances.findIndex(
        (b) => b.currency === currency,
      );
      if (balanceIndex === -1) {
        throw new Error("Currency not found");
      }

      const currentBalance = this.currentUser.balances[balanceIndex].balance;
      const newBalance = Math.max(0, currentBalance + amount);

      if (newBalance < 0) {
        throw new Error("Insufficient balance");
      }

      // Update balance
      this.currentUser.balances[balanceIndex].balance = newBalance;

      // Update totals based on transaction type
      if (type === "deposit") {
        this.currentUser.balances[balanceIndex].total_deposited +=
          Math.abs(amount);
      } else if (type === "win") {
        this.currentUser.balances[balanceIndex].total_won += Math.abs(amount);
      }

      // Save to storage and notify
      this.saveUserToStorage(this.currentUser);
      this.notifyListeners();

      // In production: make API call to update database
      console.log(
        `Balance updated: ${currency} ${amount > 0 ? "+" : ""}${amount} (${type}) - New balance: ${newBalance}`,
      );

      return newBalance;
    } catch (error) {
      console.error("Balance update error:", error);
      throw error;
    }
  }

  /**
   * Get user balance for specific currency
   */
  getBalance(currency: "GC" | "SC"): number {
    if (!this.currentUser) return 0;

    const balance = this.currentUser.balances.find(
      (b) => b.currency === currency,
    );
    return balance?.balance || 0;
  }

  /**
   * Refresh user data from storage
   */
  async refreshUser(): Promise<void> {
    if (!this.currentUser) return;

    try {
      // In production: fetch fresh data from API
      // For now, just refresh from storage
      this.loadUserFromStorage();
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  }

  /**
   * Subscribe to auth changes
   */
  subscribe(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get redirect path based on user role
   */
  getRedirectPath(): string {
    if (!this.currentUser) return "/";

    switch (this.currentUser.role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      default:
        return "/dashboard";
    }
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem("coinkrazy_user");
      if (stored) {
        const userData = JSON.parse(stored);
        // Validate stored data
        if (userData && userData.id && userData.email) {
          this.currentUser = {
            ...userData,
            created_at: new Date(userData.created_at),
            last_login: userData.last_login
              ? new Date(userData.last_login)
              : undefined,
          };
        }
      }
    } catch (error) {
      console.error("Error loading user from storage:", error);
      localStorage.removeItem("coinkrazy_user");
    }
  }

  private saveUserToStorage(user: AuthUser): void {
    try {
      localStorage.setItem("coinkrazy_user", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user to storage:", error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback(this.currentUser));
  }
}

export const authService = AuthService.getInstance();
export default authService;
