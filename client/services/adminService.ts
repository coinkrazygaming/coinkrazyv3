// Admin service using API calls
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
      const [usersResponse, gamesResponse, statsResponse, transactionsResponse, notificationsResponse] = await Promise.all([
        fetch("/api/admin/users?limit=1"),
        fetch("/api/games/active"),
        fetch("/api/admin/stats"),
        fetch("/api/admin/transactions?limit=1"),
        fetch("/api/notifications/unread")
      ]);

      const users = await usersResponse.json();
      const games = await gamesResponse.json();
      const stats = await statsResponse.json();
      const transactions = await transactionsResponse.json();
      const notifications = await notificationsResponse.json();

      return {
        totalUsers: stats.total_users?.value || 0,
        activeNow: stats.active_players?.value || 0,
        pendingKyc: 0, // Will need to implement
        revenue24h: 0, // Will need to calculate
        pendingWithdrawals: 0, // Will need to implement
        systemHealth: 99.9, // Placeholder
        fraudAlerts: notifications.filter((n: any) => n.notification_type === 'error').length || 0,
        totalGC: 0, // Will need to implement
        totalSC: 0, // Will need to implement
        activeGames: Array.isArray(games) ? games.length : 0,
      };
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  }

  async getAllUsers(
    page: number = 1,
    limit: number = 50,
    search?: string,
  ): Promise<{ users: AdminUser[]; total: number }> {
    this.checkAdminAccess();

    try {
      const offset = (page - 1) * limit;
      let whereClause = "";
      let params: any[] = [limit, offset];

      if (search) {
        whereClause = "WHERE u.email ILIKE $3 OR u.username ILIKE $3";
        params.push(`%${search}%`);
      }

      const [usersResult, countResult] = await Promise.all([
        databaseService.query(
          `
          SELECT u.*, ub.gold_coins, ub.sweeps_coins
          FROM users u
          LEFT JOIN user_balances ub ON u.id = ub.user_id
          ${whereClause}
          ORDER BY u.created_at DESC
          LIMIT $1 OFFSET $2
        `,
          params,
        ),
        databaseService.query(
          `
          SELECT COUNT(*) as total
          FROM users u
          ${whereClause}
        `,
          search ? [`%${search}%`] : [],
        ),
      ]);

      return {
        users: usersResult.rows,
        total: parseInt(countResult.rows[0].total),
      };
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }

  async updateUserStatus(userId: number, status: string): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.query(
        "UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [status, userId],
      );

      // Log the action
      await this.createAuditLog("UPDATE", "users", userId, { status });
    } catch (error) {
      console.error("Failed to update user status:", error);
      throw error;
    }
  }

  async updateUserKyc(
    userId: number,
    kycStatus: string,
    notes?: string,
  ): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.query(
        "UPDATE users SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [kycStatus, userId],
      );

      // Log the action
      await this.createAuditLog("UPDATE", "users", userId, {
        kyc_status: kycStatus,
        notes,
      });
    } catch (error) {
      console.error("Failed to update user KYC:", error);
      throw error;
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
      return games;
    } catch (error) {
      console.error("Failed to fetch games:", error);
      throw error;
    }
  }

  async updateGameStatus(gameId: string, isActive: boolean): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.query(
        "UPDATE games SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE game_id = $2",
        [isActive, gameId],
      );

      // Log the action
      await this.createAuditLog("UPDATE", "games", 0, {
        game_id: gameId,
        is_active: isActive,
      });
    } catch (error) {
      console.error("Failed to update game status:", error);
      throw error;
    }
  }

  async updateGameRTP(gameId: string, rtp: number): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.query(
        "UPDATE games SET rtp = $1, updated_at = CURRENT_TIMESTAMP WHERE game_id = $2",
        [rtp, gameId],
      );

      // Log the action
      await this.createAuditLog("UPDATE", "games", 0, { game_id: gameId, rtp });
    } catch (error) {
      console.error("Failed to update game RTP:", error);
      throw error;
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
      return transactions;
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      throw error;
    }
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    this.checkAdminAccess();

    try {
      const result = await databaseService.query(`
        SELECT an.*, ae.name as ai_name
        FROM admin_notifications an
        LEFT JOIN ai_employees ae ON an.from_ai_employee = ae.id
        ORDER BY an.priority DESC, an.created_at DESC
        LIMIT 50
      `);

      return result.rows;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      throw error;
    }
  }

  async markNotificationRead(notificationId: number): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.query(
        "UPDATE admin_notifications SET read_status = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = $1",
        [notificationId],
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  async createAdminNotification(
    title: string,
    message: string,
    type: string,
    priority: number = 1,
  ): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.createAdminNotification(
        title,
        message,
        type,
        1,
        false,
      ); // From LuckyAI
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  async adjustUserBalance(
    userId: number,
    gcAmount: number,
    scAmount: number,
    reason: string,
  ): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.updateUserBalance(
        userId,
        gcAmount,
        scAmount,
        `Admin Adjustment: ${reason}`,
      );

      // Log the action
      await this.createAuditLog("BALANCE_ADJUSTMENT", "user_balances", userId, {
        gc_amount: gcAmount,
        sc_amount: scAmount,
        reason,
      });
    } catch (error) {
      console.error("Failed to adjust user balance:", error);
      throw error;
    }
  }

  async resetGameJackpot(gameId: string): Promise<void> {
    this.checkAdminAccess();

    try {
      await databaseService.query(
        "UPDATE games SET current_jackpot_gc = 0, current_jackpot_sc = 0, total_profit_gc = 0, total_profit_sc = 0 WHERE game_id = $1",
        [gameId],
      );

      // Log the action
      await this.createAuditLog("JACKPOT_RESET", "games", 0, {
        game_id: gameId,
      });
    } catch (error) {
      console.error("Failed to reset jackpot:", error);
      throw error;
    }
  }

  async getSystemHealth(): Promise<any> {
    this.checkAdminAccess();

    try {
      // Check database connectivity
      const dbCheck = await databaseService.query("SELECT 1");

      // Check recent errors
      const errorCount = await databaseService.query(`
        SELECT COUNT(*) as count 
        FROM admin_notifications 
        WHERE notification_type = 'error' 
        AND created_at > NOW() - INTERVAL '1 hour'
      `);

      // Check active sessions
      const activeSessions = await databaseService.query(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE last_login > NOW() - INTERVAL '15 minutes'
      `);

      return {
        database: dbCheck.rows.length > 0 ? "healthy" : "error",
        errors_last_hour: parseInt(errorCount.rows[0].count),
        active_sessions: parseInt(activeSessions.rows[0].count),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to check system health:", error);
      return {
        database: "error",
        errors_last_hour: 999,
        active_sessions: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private async createAuditLog(
    action: string,
    table: string,
    recordId: number,
    data: any,
  ): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      await databaseService.query(
        `
        INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      `,
        [user?.id, action, table, recordId, JSON.stringify(data)],
      );
    } catch (error) {
      console.error("Failed to create audit log:", error);
    }
  }

  // Real-time updates
  private updateCallbacks: Map<string, (data: any) => void> = new Map();

  subscribeToUpdates(key: string, callback: (data: any) => void): () => void {
    this.updateCallbacks.set(key, callback);

    // Start periodic updates for this subscription
    const interval = setInterval(async () => {
      try {
        if (key === "stats") {
          const stats = await this.getDashboardStats();
          callback(stats);
        } else if (key === "notifications") {
          const notifications = await this.getAdminNotifications();
          callback(notifications);
        }
      } catch (error) {
        console.error(`Failed to update ${key}:`, error);
      }
    }, 5000); // Update every 5 seconds

    return () => {
      this.updateCallbacks.delete(key);
      clearInterval(interval);
    };
  }
}

export const adminService = AdminService.getInstance();
export default adminService;
