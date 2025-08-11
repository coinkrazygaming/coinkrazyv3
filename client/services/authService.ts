import { userService, User, UserBalance } from '../../server/services/userService.js';

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
      // In a real app, this would make an API call to the backend
      // For now, we'll simulate it by calling the userService directly
      const user = await userService.authenticateUser(email, password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Get user balances
      const balances = await userService.getUserBalances(user.id);

      const authUser: AuthUser = {
        ...user,
        balances,
        isLoggedIn: true,
        isAdmin: user.role === 'admin',
        isStaff: user.role === 'staff'
      };

      this.currentUser = authUser;
      this.saveUserToStorage(authUser);
      this.notifyListeners();

      return authUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(email: string, username: string, password: string): Promise<AuthUser> {
    try {
      const user = await userService.createUser(email, username, password);
      const balances = await userService.getUserBalances(user.id);

      const authUser: AuthUser = {
        ...user,
        balances,
        isLoggedIn: true,
        isAdmin: false,
        isStaff: false
      };

      this.currentUser = authUser;
      this.saveUserToStorage(authUser);
      this.notifyListeners();

      return authUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('coinkrazy_user');
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
    currency: 'GC' | 'SC',
    amount: number,
    type: 'deposit' | 'withdrawal' | 'win' | 'bet' | 'bonus',
    description?: string,
    gameId?: string
  ): Promise<number> {
    if (!this.currentUser) {
      throw new Error('User not logged in');
    }

    try {
      const result = await userService.updateUserBalance(
        this.currentUser.id,
        currency,
        amount,
        type,
        description,
        gameId
      );

      // Update local balance
      const balanceIndex = this.currentUser.balances.findIndex(b => b.currency === currency);
      if (balanceIndex !== -1) {
        this.currentUser.balances[balanceIndex].balance = result.newBalance;
      }

      this.saveUserToStorage(this.currentUser);
      this.notifyListeners();

      return result.newBalance;
    } catch (error) {
      console.error('Balance update error:', error);
      throw error;
    }
  }

  /**
   * Get user balance for specific currency
   */
  getBalance(currency: 'GC' | 'SC'): number {
    if (!this.currentUser) return 0;
    
    const balance = this.currentUser.balances.find(b => b.currency === currency);
    return balance?.balance || 0;
  }

  /**
   * Refresh user data from database
   */
  async refreshUser(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const user = await userService.getUserById(this.currentUser.id);
      if (!user) {
        await this.logout();
        return;
      }

      const balances = await userService.getUserBalances(user.id);

      this.currentUser = {
        ...user,
        balances,
        isLoggedIn: true,
        isAdmin: user.role === 'admin',
        isStaff: user.role === 'staff'
      };

      this.saveUserToStorage(this.currentUser);
      this.notifyListeners();
    } catch (error) {
      console.error('Error refreshing user:', error);
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
    if (!this.currentUser) return '/';
    
    switch (this.currentUser.role) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/staff';
      default:
        return '/dashboard';
    }
  }

  private loadUserFromStorage(): void {
    try {
      const stored = localStorage.getItem('coinkrazy_user');
      if (stored) {
        const userData = JSON.parse(stored);
        // Validate stored data
        if (userData && userData.id && userData.email) {
          this.currentUser = userData;
          // Refresh user data from database in background
          this.refreshUser();
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      localStorage.removeItem('coinkrazy_user');
    }
  }

  private saveUserToStorage(user: AuthUser): void {
    try {
      localStorage.setItem('coinkrazy_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentUser));
  }
}

export const authService = AuthService.getInstance();
export default authService;
