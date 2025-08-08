// Temporary simplified admin service to fix immediate API issues
import { authService } from "./authService";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  status: string;
  kyc_status: string;
  gold_coins: number;
  sweeps_coins: number;
  created_at: string;
  last_login: string;
  role: string;
}

export interface AdminTransaction {
  id: number;
  username: string;
  email: string;
  transaction_type: string;
  currency: string;
  amount: number;
  status: string;
  created_at: string;
  description: string;
}

export interface AdminGame {
  id: number;
  game_id: string;
  name: string;
  provider: string;
  category: string;
  rtp: number;
  is_active: boolean;
  is_featured: boolean;
  total_profit_gc: number;
  total_profit_sc: number;
  current_jackpot_calculated: number;
  current_jackpot_sc_calculated: number;
  total_plays: number;
  total_players: number;
}

export interface AdminStats {
  totalUsers: number;
  activeNow: number;
  pendingKyc: number;
  revenue24h: number;
  pendingWithdrawals: number;
  systemHealth: number;
  fraudAlerts: number;
  totalGC: number;
  totalSC: number;
  activeGames: number;
}

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  priority: number;
  from_ai_employee?: number;
  ai_name?: string;
  read_status: boolean;
  action_required: boolean;
  action_url?: string;
  created_at: string;
}

class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  private checkAdminAccess(): void {
    if (!authService.isAdmin()) {
      throw new Error("Unauthorized: Admin access required");
    }
  }

  async getDashboardStats(): Promise<AdminStats> {
    this.checkAdminAccess();

    try {
      const statsResponse = await fetch("/api/admin/stats");
      const stats = statsResponse.ok ? await statsResponse.json() : {};

      return {
        totalUsers: stats.total_users?.value || 0,
        activeNow: stats.active_players?.value || 0,
        pendingKyc: 0,
        revenue24h: 0,
        pendingWithdrawals: 0,
        systemHealth: 99.9,
        fraudAlerts: 0,
        totalGC: 0,
        totalSC: 0,
        activeGames: 5,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      return {
        totalUsers: 0,
        activeNow: 0,
        pendingKyc: 0,
        revenue24h: 0,
        pendingWithdrawals: 0,
        systemHealth: 99.9,
        fraudAlerts: 0,
        totalGC: 0,
        totalSC: 0,
        activeGames: 0,
      };
    }
  }

  async getAllUsers(page: number = 1, limit: number = 50): Promise<{ users: AdminUser[]; total: number }> {
    this.checkAdminAccess();

    try {
      const offset = (page - 1) * limit;
      const response = await fetch(`/api/admin/users?limit=${limit}&offset=${offset}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const users = await response.json();
      
      return {
        users: users || [],
        total: users?.length || 0,
      };
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return { users: [], total: 0 };
    }
  }

  async getAllGames(): Promise<AdminGame[]> {
    this.checkAdminAccess();

    try {
      const response = await fetch("/api/games");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const games = await response.json();
      return games || [];
    } catch (error) {
      console.error("Failed to fetch games:", error);
      return [];
    }
  }

  async getRecentTransactions(limit: number = 50): Promise<AdminTransaction[]> {
    this.checkAdminAccess();

    try {
      const response = await fetch(`/api/admin/transactions?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const transactions = await response.json();
      return transactions || [];
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      return [];
    }
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    this.checkAdminAccess();

    try {
      const response = await fetch("/api/notifications/unread");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const notifications = await response.json();
      return notifications || [];
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      return [];
    }
  }

  // Placeholder methods that don't require database calls
  async updateUserStatus(userId: number, status: string): Promise<void> {
    this.checkAdminAccess();
    console.log(`Update user ${userId} status to ${status}`);
  }

  async updateUserKyc(userId: number, kycStatus: string): Promise<void> {
    this.checkAdminAccess();
    console.log(`Update user ${userId} KYC to ${kycStatus}`);
  }

  async updateGameStatus(gameId: string, isActive: boolean): Promise<void> {
    this.checkAdminAccess();
    console.log(`Update game ${gameId} active status to ${isActive}`);
  }

  async updateGameRTP(gameId: string, rtp: number): Promise<void> {
    this.checkAdminAccess();
    console.log(`Update game ${gameId} RTP to ${rtp}`);
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    this.checkAdminAccess();
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  // Other placeholder methods
  async adjustUserBalance(userId: number, gcAmount: number, scAmount: number, reason: string): Promise<void> {
    this.checkAdminAccess();
    console.log(`Adjust user ${userId} balance: GC ${gcAmount}, SC ${scAmount}, reason: ${reason}`);
  }

  async resetGameJackpot(gameId: string): Promise<void> {
    this.checkAdminAccess();
    console.log(`Reset jackpot for game ${gameId}`);
  }

  async getSystemHealth(): Promise<any> {
    this.checkAdminAccess();
    return { status: "healthy", uptime: "99.9%" };
  }

  subscribe(key: string, callback: (data: any) => void): () => void {
    // Simulate real-time updates
    const interval = setInterval(async () => {
      try {
        if (key === "stats") {
          const stats = await this.getDashboardStats();
          callback(stats);
        } else if (key === "users") {
          const result = await this.getAllUsers();
          callback(result.users);
        } else if (key === "games") {
          const games = await this.getAllGames();
          callback(games);
        } else if (key === "transactions") {
          const transactions = await this.getRecentTransactions();
          callback(transactions);
        } else if (key === "notifications") {
          const notifications = await this.getAdminNotifications();
          callback(notifications);
        }
      } catch (error) {
        console.error(`Error in subscription for ${key}:`, error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  // Alias for subscribeToUpdates to match Admin page expectations
  subscribeToUpdates(callback: (data: { stats: AdminStats; users: AdminUser[]; games: AdminGame[]; transactions: AdminTransaction[]; notifications: AdminNotification[] }) => void): () => void {
    const intervals: NodeJS.Timeout[] = [];

    const fetchAllData = async () => {
      try {
        const [stats, usersResult, games, transactions, notifications] = await Promise.all([
          this.getDashboardStats(),
          this.getAllUsers(),
          this.getAllGames(),
          this.getRecentTransactions(),
          this.getAdminNotifications()
        ]);

        callback({
          stats,
          users: usersResult.users,
          games,
          transactions,
          notifications
        });
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };

    // Initial fetch
    fetchAllData();

    // Set up interval for updates
    const interval = setInterval(fetchAllData, 10000); // Update every 10 seconds
    intervals.push(interval);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }
}

export const adminService = AdminService.getInstance();
export default adminService;
