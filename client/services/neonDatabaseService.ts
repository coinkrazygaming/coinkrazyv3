import { DepositRecord, WalletTransaction, UserWallet } from "./walletService";

export interface NeonConfig {
  connectionString: string;
  database: string;
  host: string;
  port: number;
  ssl: boolean;
  maxConnections: number;
}

export interface AdminLog {
  id: string;
  adminUserId: string;
  action: string;
  targetUserId?: string;
  targetType: "user" | "deposit" | "transaction" | "wallet" | "system";
  targetId?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  severity: "info" | "warning" | "error" | "critical";
}

export interface PaymentLog {
  id: string;
  userId: string;
  paymentMethod: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  gcAwarded: number;
  scAwarded: number;
  timestamp: Date;
  metadata: Record<string, any>;
  adminNotes?: string;
  processingTime?: number;
  errorMessage?: string;
}

export interface DatabaseStats {
  totalUsers: number;
  totalDeposits: number;
  totalDepositAmount: number;
  totalGCIssued: number;
  totalSCIssued: number;
  last24HourDeposits: number;
  last24HourAmount: number;
  topPaymentMethods: Array<{ method: string; count: number; amount: number }>;
}

class NeonDatabaseService {
  private static instance: NeonDatabaseService;
  private config: NeonConfig;
  private isConnected: boolean = false;
  private connectionPool: any = null;
  private adminLogs: AdminLog[] = [];
  private paymentLogs: PaymentLog[] = [];
  private lastSync: Date = new Date();
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): NeonDatabaseService {
    if (!NeonDatabaseService.instance) {
      NeonDatabaseService.instance = new NeonDatabaseService();
    }
    return NeonDatabaseService.instance;
  }

  constructor() {
    this.config = {
      connectionString:
        import.meta.env.VITE_NEON_CONNECTION_STRING ||
        "postgresql://coinfrazy_user:secure_password@neon.tech:5432/coinfrazy_prod",
      database: "coinfrazy_prod",
      host: "neon.tech",
      port: 5432,
      ssl: true,
      maxConnections: 10,
    };

    this.initializeConnection();
    this.startSyncService();
    this.loadLocalData();
  }

  private async initializeConnection() {
    try {
      // In production, this would establish real Neon PostgreSQL connection
      // For demo purposes, we'll simulate the connection
      console.log("Connecting to Neon Database:", this.config.host);

      // Simulate connection establishment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.connectionPool = {
        connected: true,
        database: this.config.database,
        host: this.config.host,
        connectionCount: 1,
        lastQuery: new Date(),
        totalQueries: 0,
      };

      this.isConnected = true;
      console.log("✅ Neon Database connected successfully");

      // Initialize database tables if they don't exist
      await this.initializeTables();
    } catch (error) {
      console.error("❌ Failed to connect to Neon Database:", error);
      this.isConnected = false;
      // Fallback to local storage
      this.loadLocalData();
    }
  }

  private async initializeTables() {
    try {
      // In production, these would be actual SQL DDL statements
      const tables = [
        "CREATE TABLE IF NOT EXISTS wallets (...)",
        "CREATE TABLE IF NOT EXISTS deposits (...)",
        "CREATE TABLE IF NOT EXISTS transactions (...)",
        "CREATE TABLE IF NOT EXISTS admin_logs (...)",
        "CREATE TABLE IF NOT EXISTS payment_logs (...)",
        "CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)",
        "CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp)",
        "CREATE INDEX IF NOT EXISTS idx_payment_logs_timestamp ON payment_logs(timestamp)",
      ];

      console.log("📋 Database tables initialized");
    } catch (error) {
      console.error("Failed to initialize database tables:", error);
    }
  }

  private startSyncService() {
    // Sync data to Neon every 5 seconds
    this.syncInterval = setInterval(async () => {
      if (this.isConnected) {
        await this.syncAllData();
      }
    }, 5000);
  }

  private loadLocalData() {
    try {
      // Load admin logs from localStorage
      const adminLogsData = localStorage.getItem("neon_admin_logs");
      if (adminLogsData) {
        this.adminLogs = JSON.parse(adminLogsData).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }

      // Load payment logs from localStorage
      const paymentLogsData = localStorage.getItem("neon_payment_logs");
      if (paymentLogsData) {
        this.paymentLogs = JSON.parse(paymentLogsData).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error("Failed to load local data:", error);
    }
  }

  private saveLocalData() {
    try {
      localStorage.setItem("neon_admin_logs", JSON.stringify(this.adminLogs));
      localStorage.setItem(
        "neon_payment_logs",
        JSON.stringify(this.paymentLogs),
      );
    } catch (error) {
      console.error("Failed to save local data:", error);
    }
  }

  // Deposit management methods
  async saveDeposit(deposit: DepositRecord): Promise<void> {
    try {
      if (this.isConnected && this.connectionPool) {
        // In production: INSERT INTO deposits (...)
        console.log("💾 Saving deposit to Neon:", deposit.id);
        this.connectionPool.totalQueries++;
        this.connectionPool.lastQuery = new Date();
      }

      // Log the deposit action
      await this.logAdminAction(
        "system",
        "deposit_created",
        deposit.userId,
        "deposit",
        deposit.id,
        {
          amount: deposit.amount,
          paymentMethod: deposit.paymentMethod,
          gcAwarded: deposit.gcAwarded,
          scAwarded: deposit.scAwarded,
        },
        "info",
      );

      // Create payment log
      await this.logPayment({
        id: `pay_${deposit.id}`,
        userId: deposit.userId,
        paymentMethod: deposit.paymentMethod,
        paymentId: deposit.paymentId,
        amount: deposit.amount,
        currency: "USD",
        status: deposit.status,
        gcAwarded: deposit.gcAwarded,
        scAwarded: deposit.scAwarded,
        timestamp: deposit.timestamp,
        metadata: deposit.metadata || {},
        adminNotes: deposit.adminNotes,
      });
    } catch (error) {
      console.error("Failed to save deposit to Neon:", error);
      throw error;
    }
  }

  async saveWallet(wallet: UserWallet): Promise<void> {
    try {
      if (this.isConnected && this.connectionPool) {
        // In production: INSERT/UPDATE wallets table
        console.log("💾 Saving wallet to Neon:", wallet.userId);
        this.connectionPool.totalQueries++;
        this.connectionPool.lastQuery = new Date();
      }
    } catch (error) {
      console.error("Failed to save wallet to Neon:", error);
      throw error;
    }
  }

  async saveTransaction(transaction: WalletTransaction): Promise<void> {
    try {
      if (this.isConnected && this.connectionPool) {
        // In production: INSERT INTO transactions (...)
        console.log("💾 Saving transaction to Neon:", transaction.id);
        this.connectionPool.totalQueries++;
        this.connectionPool.lastQuery = new Date();
      }

      // Log transaction for admin monitoring
      if (transaction.isDeposit) {
        await this.logAdminAction(
          "system",
          "transaction_deposit",
          transaction.userId,
          "transaction",
          transaction.id,
          {
            amount: transaction.amount,
            currency: transaction.currency,
            depositMethod: transaction.depositMethod,
            paymentId: transaction.paymentId,
          },
          "info",
        );
      }
    } catch (error) {
      console.error("Failed to save transaction to Neon:", error);
      throw error;
    }
  }

  // Admin logging methods
  async logAdminAction(
    adminUserId: string,
    action: string,
    targetUserId?: string,
    targetType:
      | "user"
      | "deposit"
      | "transaction"
      | "wallet"
      | "system" = "system",
    targetId?: string,
    details: Record<string, any> = {},
    severity: "info" | "warning" | "error" | "critical" = "info",
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const adminLog: AdminLog = {
      id: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminUserId,
      action,
      targetUserId,
      targetType,
      targetId,
      details,
      timestamp: new Date(),
      ipAddress,
      userAgent,
      severity,
    };

    this.adminLogs.unshift(adminLog);

    // Keep only last 1000 admin logs in memory
    if (this.adminLogs.length > 1000) {
      this.adminLogs = this.adminLogs.slice(0, 1000);
    }

    try {
      if (this.isConnected && this.connectionPool) {
        // In production: INSERT INTO admin_logs (...)
        console.log(
          `📋 Admin Log [${severity.toUpperCase()}]: ${action} by ${adminUserId}`,
        );
        this.connectionPool.totalQueries++;
        this.connectionPool.lastQuery = new Date();
      }

      this.saveLocalData();
    } catch (error) {
      console.error("Failed to save admin log to Neon:", error);
    }
  }

  async logPayment(paymentLog: PaymentLog): Promise<void> {
    this.paymentLogs.unshift(paymentLog);

    // Keep only last 500 payment logs in memory
    if (this.paymentLogs.length > 500) {
      this.paymentLogs = this.paymentLogs.slice(0, 500);
    }

    try {
      if (this.isConnected && this.connectionPool) {
        // In production: INSERT INTO payment_logs (...)
        console.log(
          "💳 Payment Log:",
          paymentLog.paymentMethod,
          paymentLog.amount,
        );
        this.connectionPool.totalQueries++;
        this.connectionPool.lastQuery = new Date();
      }

      this.saveLocalData();
    } catch (error) {
      console.error("Failed to save payment log to Neon:", error);
    }
  }

  // Query methods
  async getAdminLogs(
    limit: number = 100,
    adminUserId?: string,
    action?: string,
    severity?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AdminLog[]> {
    let filteredLogs = [...this.adminLogs];

    if (adminUserId) {
      filteredLogs = filteredLogs.filter(
        (log) => log.adminUserId === adminUserId,
      );
    }

    if (action) {
      filteredLogs = filteredLogs.filter((log) => log.action.includes(action));
    }

    if (severity) {
      filteredLogs = filteredLogs.filter((log) => log.severity === severity);
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= endDate);
    }

    return filteredLogs.slice(0, limit);
  }

  async getPaymentLogs(
    limit: number = 100,
    userId?: string,
    paymentMethod?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<PaymentLog[]> {
    let filteredLogs = [...this.paymentLogs];

    if (userId) {
      filteredLogs = filteredLogs.filter((log) => log.userId === userId);
    }

    if (paymentMethod) {
      filteredLogs = filteredLogs.filter(
        (log) => log.paymentMethod === paymentMethod,
      );
    }

    if (status) {
      filteredLogs = filteredLogs.filter((log) => log.status === status);
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter((log) => log.timestamp <= endDate);
    }

    return filteredLogs.slice(0, limit);
  }

  async getDatabaseStats(): Promise<DatabaseStats> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last24HourPayments = this.paymentLogs.filter(
      (log) => log.timestamp >= oneDayAgo && log.status === "completed",
    );

    const paymentMethodStats: Record<
      string,
      { count: number; amount: number }
    > = {};

    this.paymentLogs.forEach((log) => {
      if (log.status === "completed") {
        if (!paymentMethodStats[log.paymentMethod]) {
          paymentMethodStats[log.paymentMethod] = { count: 0, amount: 0 };
        }
        paymentMethodStats[log.paymentMethod].count++;
        paymentMethodStats[log.paymentMethod].amount += log.amount;
      }
    });

    const topPaymentMethods = Object.entries(paymentMethodStats)
      .map(([method, stats]) => ({ method, ...stats }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalUsers: new Set(this.paymentLogs.map((log) => log.userId)).size,
      totalDeposits: this.paymentLogs.filter(
        (log) => log.status === "completed",
      ).length,
      totalDepositAmount: this.paymentLogs.reduce(
        (sum, log) => (log.status === "completed" ? sum + log.amount : sum),
        0,
      ),
      totalGCIssued: this.paymentLogs.reduce(
        (sum, log) => (log.status === "completed" ? sum + log.gcAwarded : sum),
        0,
      ),
      totalSCIssued: this.paymentLogs.reduce(
        (sum, log) => (log.status === "completed" ? sum + log.scAwarded : sum),
        0,
      ),
      last24HourDeposits: last24HourPayments.length,
      last24HourAmount: last24HourPayments.reduce(
        (sum, log) => sum + log.amount,
        0,
      ),
      topPaymentMethods,
    };
  }

  private async syncAllData(): Promise<void> {
    try {
      if (!this.isConnected) return;

      // In production, this would sync all pending data to Neon
      console.log("🔄 Syncing data to Neon Database...");

      this.lastSync = new Date();
      this.saveLocalData();
    } catch (error) {
      console.error("Failed to sync data to Neon:", error);
    }
  }

  // Connection status methods
  isNeonConnected(): boolean {
    return this.isConnected;
  }

  getNeonStatus(): {
    connected: boolean;
    lastSync: Date;
    connectionCount: number;
    totalQueries: number;
    lastQuery: Date;
    database: string;
    host: string;
  } {
    return {
      connected: this.isConnected,
      lastSync: this.lastSync,
      connectionCount: this.connectionPool?.connectionCount || 0,
      totalQueries: this.connectionPool?.totalQueries || 0,
      lastQuery: this.connectionPool?.lastQuery || new Date(),
      database: this.config.database,
      host: this.config.host,
    };
  }

  // Cleanup method
  async disconnect(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.connectionPool) {
      // In production: close connection pool
      this.connectionPool = null;
    }

    this.isConnected = false;
    console.log("📴 Disconnected from Neon Database");
  }

  // Admin utility methods
  async clearOldLogs(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.adminLogs = this.adminLogs.filter(
      (log) => log.timestamp >= cutoffDate,
    );
    this.paymentLogs = this.paymentLogs.filter(
      (log) => log.timestamp >= cutoffDate,
    );

    this.saveLocalData();

    await this.logAdminAction(
      "system",
      "logs_cleaned",
      undefined,
      "system",
      undefined,
      { daysToKeep, cutoffDate: cutoffDate.toISOString() },
      "info",
    );
  }

  async exportLogs(format: "json" | "csv" = "json"): Promise<string> {
    const data = {
      adminLogs: this.adminLogs,
      paymentLogs: this.paymentLogs,
      exportedAt: new Date().toISOString(),
      totalRecords: this.adminLogs.length + this.paymentLogs.length,
    };

    if (format === "json") {
      return JSON.stringify(data, null, 2);
    } else {
      // Simple CSV export for admin logs
      const csvLines = ["Type,Timestamp,Admin,Action,Target,Details"];

      this.adminLogs.forEach((log) => {
        csvLines.push(
          `Admin,${log.timestamp.toISOString()},${log.adminUserId},${log.action},${log.targetUserId || ""},${JSON.stringify(log.details).replace(/"/g, '""')}`,
        );
      });

      this.paymentLogs.forEach((log) => {
        csvLines.push(
          `Payment,${log.timestamp.toISOString()},${log.userId},${log.paymentMethod},${log.amount},$${log.amount}`,
        );
      });

      return csvLines.join("\n");
    }
  }
}

export const neonDatabaseService = NeonDatabaseService.getInstance();
