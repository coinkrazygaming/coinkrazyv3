export type CurrencyType = "GC" | "SC" | "USD";

export interface UserWallet {
  userId: string;
  goldCoins: number;
  sweepsCoins: number;
  cashBalance?: number;
  bonusBalance?: number;
  lastUpdated: Date;
  totalDeposited?: number;
  totalWithdrawn?: number;
  lifetimeWins?: number;
  lifetimeLosses?: number;
  preferredCurrency?: CurrencyType;
  realTimeUpdateEnabled?: boolean;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  currency: CurrencyType;
  amount: number;
  description: string;
  gameId?: string;
  gameType?: "slots" | "table" | "live" | "bingo" | "sportsbook";
  betAmount?: number;
  winAmount?: number;
  transactionDate: Date;
  balanceAfter: Record<CurrencyType, number>;
  metadata?: Record<string, any>;
  paymentId?: string;
  isDeposit?: boolean;
  depositMethod?: string;
  adminNotes?: string;
}

export interface DepositRecord {
  id: string;
  userId: string;
  amount: number;
  usdAmount: number;
  gcAwarded: number;
  scAwarded: number;
  paymentMethod: string;
  paymentId: string;
  status: "pending" | "completed" | "failed" | "refunded";
  timestamp: Date;
  adminNotes?: string;
  metadata?: Record<string, any>;
}

export interface GameSession {
  id: string;
  userId: string;
  gameId: string;
  gameType: "slots" | "table" | "live" | "bingo" | "sportsbook";
  currency: CurrencyType;
  startTime: Date;
  endTime?: Date;
  totalBet: number;
  totalWin: number;
  netResult: number;
  transactionCount: number;
  status: "active" | "completed" | "paused";
}

class WalletService {
  private static instance: WalletService;
  private wallets: Map<string, UserWallet> = new Map();
  private transactions: Map<string, WalletTransaction[]> = new Map();
  private deposits: Map<string, DepositRecord[]> = new Map();
  private sessions: Map<string, GameSession[]> = new Map();
  private listeners: Map<string, Set<(wallet: UserWallet) => void>> = new Map();
  private depositListeners: Map<string, Set<(deposits: DepositRecord[]) => void>> = new Map();
  private neonClient: any = null; // This would be the actual Neon client in production
  private realTimeUpdateInterval: NodeJS.Timeout | null = null;

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  constructor() {
    this.initializeNeonConnection();
    this.initializeDefaultWallets();
    this.startRealTimeSync();
  }

  private async initializeNeonConnection() {
    try {
      // In production, this would initialize the actual Neon database connection
      // For demo, we'll simulate the connection
      this.neonClient = {
        connected: true,
        database: "coinfrazy_prod",
        endpoint: "neon.tech/coinfrazy",
        lastSync: new Date(),
      };

      console.log("Neon database connected:", this.neonClient);
    } catch (error) {
      console.error("Failed to connect to Neon database:", error);
      // Fallback to local storage
      this.loadFromLocalStorage();
    }
  }

  private initializeDefaultWallets() {
    const defaultUsers = [
      {
        userId: "user-1",
        goldCoins: 125000,
        sweepsCoins: 450.75,
        cashBalance: 0,
        totalDeposited: 100,
        lifetimeWins: 2150.5,
        lifetimeLosses: 1890.25,
      },
      {
        userId: "user-2",
        goldCoins: 89000,
        sweepsCoins: 125.25,
        cashBalance: 0,
        totalDeposited: 50,
        lifetimeWins: 980.75,
        lifetimeLosses: 1200.5,
      },
      {
        userId: "user-3",
        goldCoins: 450000,
        sweepsCoins: 1250.5,
        cashBalance: 0,
        totalDeposited: 500,
        lifetimeWins: 5890.25,
        lifetimeLosses: 4750.75,
      },
      {
        userId: "coinkrazy00@gmail.com",
        goldCoins: 10000000,
        sweepsCoins: 50000.0,
        cashBalance: 1000,
        totalDeposited: 0,
        lifetimeWins: 0,
        lifetimeLosses: 0,
      },
      {
        userId: "demo@coinfrazy.com",
        goldCoins: 250000,
        sweepsCoins: 125.5,
        cashBalance: 0,
        totalDeposited: 100,
        lifetimeWins: 1750.25,
        lifetimeLosses: 1650.75,
      },
    ];

    defaultUsers.forEach((user) => {
      this.wallets.set(user.userId, {
        userId: user.userId,
        goldCoins: user.goldCoins,
        sweepsCoins: user.sweepsCoins,
        cashBalance: user.cashBalance,
        bonusBalance: 0,
        lastUpdated: new Date(),
        totalDeposited: user.totalDeposited,
        totalWithdrawn: 0,
        lifetimeWins: user.lifetimeWins,
        lifetimeLosses: user.lifetimeLosses,
        preferredCurrency: "GC",
        realTimeUpdateEnabled: true,
      });

      // Initialize empty deposit history for each user
      this.deposits.set(user.userId, []);
    });
  }

  private startRealTimeSync() {
    // Sync with Neon database every 2 seconds
    setInterval(async () => {
      await this.syncWithNeon();
    }, 2000);

    // Enhanced real-time updates every 1 second for active users
    this.realTimeUpdateInterval = setInterval(() => {
      this.performRealTimeUpdates();
    }, 1000);

    // Simulate real-time balance changes
    setInterval(
      () => {
        this.simulateRealTimeActivity();
      },
      Math.random() * 15000 + 5000,
    ); // 5-20 seconds
  }

  private performRealTimeUpdates() {
    // Update all active wallets with real-time data
    this.wallets.forEach((wallet, userId) => {
      if (wallet.realTimeUpdateEnabled) {
        // Trigger real-time balance update for active users
        this.notifyWalletChange(userId, wallet);
      }
    });
  }

  private async syncWithNeon() {
    try {
      if (this.neonClient?.connected) {
        // In production, this would sync with actual Neon database
        // Sync wallets, transactions, and deposits
        this.saveToLocalStorage();
        await this.syncDepositsToNeon();
        await this.syncAdminLogsToNeon();
        this.neonClient.lastSync = new Date();
      }
    } catch (error) {
      console.error("Neon sync failed:", error);
    }
  }

  private async syncDepositsToNeon() {
    try {
      if (this.neonClient?.connected) {
        // In production, sync all deposit records to Neon
        const allDeposits = Array.from(this.deposits.entries());
        console.log("Syncing deposits to Neon:", allDeposits.length);
      }
    } catch (error) {
      console.error("Failed to sync deposits to Neon:", error);
    }
  }

  private async syncAdminLogsToNeon() {
    try {
      if (this.neonClient?.connected) {
        // In production, sync admin logs and payment records to Neon
        console.log("Syncing admin logs to Neon");
      }
    } catch (error) {
      console.error("Failed to sync admin logs to Neon:", error);
    }
  }

  private simulateRealTimeActivity() {
    const userIds = Array.from(this.wallets.keys());
    const randomUsers = userIds.slice(0, Math.floor(Math.random() * 2) + 1);

    randomUsers.forEach((userId) => {
      if (userId.includes("coinkrazy") || userId.includes("demo")) return; // Skip admin accounts

      const wallet = this.wallets.get(userId);
      if (wallet) {
        // Simulate various gaming activities
        const activities = [
          {
            type: "slots_spin",
            gcChange: -100,
            scChange: 0,
            desc: "Slot Spin",
          },
          { type: "slots_win", gcChange: 250, scChange: 0, desc: "Slot Win" },
          {
            type: "table_bet",
            gcChange: -50,
            scChange: 0,
            desc: "Blackjack Bet",
          },
          {
            type: "table_win",
            gcChange: 100,
            scChange: 0,
            desc: "Blackjack Win",
          },
          {
            type: "sweeps_bet",
            gcChange: 0,
            scChange: -1.5,
            desc: "Sweeps Bet",
          },
          {
            type: "sweeps_win",
            gcChange: 0,
            scChange: 3.25,
            desc: "Sweeps Win",
          },
          { type: "bonus", gcChange: 500, scChange: 2.5, desc: "Daily Bonus" },
        ];

        const activity =
          activities[Math.floor(Math.random() * activities.length)];

        this.updateBalance(
          userId,
          activity.gcChange,
          activity.scChange,
          activity.desc,
          `game-${Math.random().toString(36).substr(2, 9)}`,
          "slots",
        );
      }
    });
  }

  private loadFromLocalStorage() {
    try {
      const walletsData = localStorage.getItem("user_wallets");
      if (walletsData) {
        const wallets = JSON.parse(walletsData);
        wallets.forEach((wallet: UserWallet) => {
          this.wallets.set(wallet.userId, {
            ...wallet,
            lastUpdated: new Date(wallet.lastUpdated),
          });
        });
      }

      const transactionsData = localStorage.getItem("wallet_transactions");
      if (transactionsData) {
        const transactions = JSON.parse(transactionsData);
        Object.entries(transactions).forEach(([userId, userTransactions]) => {
          this.transactions.set(
            userId,
            (userTransactions as any[]).map((txn) => ({
              ...txn,
              transactionDate: new Date(txn.transactionDate),
            })),
          );
        });
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }

  private saveToLocalStorage() {
    try {
      const wallets = Array.from(this.wallets.values());
      localStorage.setItem("user_wallets", JSON.stringify(wallets));

      const transactions = Object.fromEntries(this.transactions.entries());
      localStorage.setItem("wallet_transactions", JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  async getUserWallet(userId: string): Promise<UserWallet> {
    let wallet = this.wallets.get(userId);

    if (!wallet) {
      // Create new wallet with welcome bonus (10 GC + 10 SC as specified)
      wallet = {
        userId,
        goldCoins: 10,
        sweepsCoins: 10,
        cashBalance: 0,
        bonusBalance: 0,
        lastUpdated: new Date(),
        totalDeposited: 0,
        totalWithdrawn: 0,
        lifetimeWins: 0,
        lifetimeLosses: 0,
      };

      this.wallets.set(userId, wallet);

      // Record welcome bonus transactions
      await this.addTransaction(
        userId,
        "credit",
        "GC",
        10,
        "Welcome Bonus - Gold Coins",
        undefined,
        "slots",
        0,
        10,
      );

      await this.addTransaction(
        userId,
        "credit",
        "SC",
        10,
        "Welcome Bonus - Sweeps Coins",
        undefined,
        "slots",
        0,
        10,
      );
    }

    return wallet;
  }

  async updateBalance(
    userId: string,
    gcChange: number,
    scChange: number,
    description: string,
    gameId?: string,
    gameType: "slots" | "table" | "live" | "bingo" | "sportsbook" = "slots",
    betAmount?: number,
    winAmount?: number,
  ): Promise<UserWallet> {
    const currentWallet = await this.getUserWallet(userId);

    // Calculate new balances (prevent negative balances)
    const newGC = Math.max(0, currentWallet.goldCoins + gcChange);
    const newSC = Math.max(0, currentWallet.sweepsCoins + scChange);

    // Update lifetime stats
    const lifetimeWins = currentWallet.lifetimeWins || 0;
    const lifetimeLosses = currentWallet.lifetimeLosses || 0;
    const newLifetimeWins = winAmount ? lifetimeWins + winAmount : lifetimeWins;
    const newLifetimeLosses =
      betAmount && !winAmount ? lifetimeLosses + betAmount : lifetimeLosses;

    // Update wallet
    const updatedWallet: UserWallet = {
      ...currentWallet,
      goldCoins: newGC,
      sweepsCoins: newSC,
      lifetimeWins: newLifetimeWins,
      lifetimeLosses: newLifetimeLosses,
      lastUpdated: new Date(),
    };

    this.wallets.set(userId, updatedWallet);

    // Record transactions
    if (gcChange !== 0) {
      await this.addTransaction(
        userId,
        gcChange > 0 ? "credit" : "debit",
        "GC",
        Math.abs(gcChange),
        description,
        gameId,
        gameType,
        betAmount,
        winAmount,
      );
    }

    if (scChange !== 0) {
      await this.addTransaction(
        userId,
        scChange > 0 ? "credit" : "debit",
        "SC",
        Math.abs(scChange),
        description,
        gameId,
        gameType,
        betAmount,
        winAmount,
      );
    }

    // Notify listeners
    this.notifyWalletChange(userId, updatedWallet);

    // Sync to Neon
    await this.syncWalletToNeon(userId, updatedWallet);

    return updatedWallet;
  }

  private async addTransaction(
    userId: string,
    type: "credit" | "debit",
    currency: CurrencyType,
    amount: number,
    description: string,
    gameId?: string,
    gameType?: "slots" | "table" | "live" | "bingo" | "sportsbook",
    betAmount?: number,
    winAmount?: number,
  ) {
    const wallet = await this.getUserWallet(userId);

    const transaction: WalletTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      currency,
      amount,
      description,
      gameId,
      gameType,
      betAmount,
      winAmount,
      transactionDate: new Date(),
      balanceAfter: {
        GC: wallet.goldCoins,
        SC: wallet.sweepsCoins,
        USD: wallet.cashBalance || 0,
      },
      metadata: {
        neonSynced: false,
        sessionId: this.getCurrentSessionId(userId),
      },
    };

    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }

    this.transactions.get(userId)!.unshift(transaction);

    // Keep only last 500 transactions per user
    const userTransactions = this.transactions.get(userId)!;
    if (userTransactions.length > 500) {
      this.transactions.set(userId, userTransactions.slice(0, 500));
    }

    // Sync transaction to Neon
    await this.syncTransactionToNeon(transaction);
  }

  private getCurrentSessionId(userId: string): string {
    const userSessions = this.sessions.get(userId) || [];
    const activeSession = userSessions.find((s) => s.status === "active");
    return activeSession?.id || `session-${Date.now()}`;
  }

  private async syncWalletToNeon(userId: string, wallet: UserWallet) {
    try {
      if (this.neonClient?.connected) {
        // In production, this would update the Neon database
        console.log(`Syncing wallet to Neon for user ${userId}:`, wallet);
      }
    } catch (error) {
      console.error("Failed to sync wallet to Neon:", error);
    }
  }

  private async syncTransactionToNeon(transaction: WalletTransaction) {
    try {
      if (this.neonClient?.connected) {
        // In production, this would insert the transaction into Neon database
        transaction.metadata = { ...transaction.metadata, neonSynced: true };
        console.log("Syncing transaction to Neon:", transaction);
      }
    } catch (error) {
      console.error("Failed to sync transaction to Neon:", error);
    }
  }

  getUserTransactions(userId: string, limit: number = 50): WalletTransaction[] {
    return this.transactions.get(userId)?.slice(0, limit) || [];
  }

  getTransactionsByGame(userId: string, gameId: string): WalletTransaction[] {
    return this.getUserTransactions(userId).filter(
      (txn) => txn.gameId === gameId,
    );
  }

  getTransactionsByType(userId: string, gameType: string): WalletTransaction[] {
    return this.getUserTransactions(userId).filter(
      (txn) => txn.gameType === gameType,
    );
  }

  subscribeToWalletUpdates(
    userId: string,
    callback: (wallet: UserWallet) => void,
  ): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }

    this.listeners.get(userId)!.add(callback);

    return () => {
      this.listeners.get(userId)?.delete(callback);
    };
  }

  private notifyWalletChange(userId: string, wallet: UserWallet) {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach((callback) => callback(wallet));
    }
  }

  // Game-specific methods
  async placeBet(
    userId: string,
    amount: number,
    currency: CurrencyType,
    gameId: string,
    gameType: "slots" | "table" | "live" | "bingo" | "sportsbook",
  ): Promise<UserWallet> {
    const wallet = await this.getUserWallet(userId);

    // Check if user has sufficient balance
    const currentBalance =
      currency === "GC" ? wallet.goldCoins : wallet.sweepsCoins;
    if (currentBalance < amount) {
      throw new Error(`Insufficient ${currency} balance`);
    }

    // Deduct bet amount
    const gcChange = currency === "GC" ? -amount : 0;
    const scChange = currency === "SC" ? -amount : 0;

    return this.updateBalance(
      userId,
      gcChange,
      scChange,
      `${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Bet`,
      gameId,
      gameType,
      amount,
      0,
    );
  }

  async recordWin(
    userId: string,
    amount: number,
    currency: CurrencyType,
    gameId: string,
    gameType: "slots" | "table" | "live" | "bingo" | "sportsbook",
  ): Promise<UserWallet> {
    const gcChange = currency === "GC" ? amount : 0;
    const scChange = currency === "SC" ? amount : 0;

    return this.updateBalance(
      userId,
      gcChange,
      scChange,
      `${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Win`,
      gameId,
      gameType,
      0,
      amount,
    );
  }

  // Admin methods
  getAllWallets(): UserWallet[] {
    return Array.from(this.wallets.values()).sort(
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
    );
  }

  getTotalCurrency(): {
    totalGC: number;
    totalSC: number;
    totalCash: number;
    totalUsers: number;
  } {
    const wallets = this.getAllWallets();
    return {
      totalGC: wallets.reduce((sum, wallet) => sum + wallet.goldCoins, 0),
      totalSC: wallets.reduce((sum, wallet) => sum + wallet.sweepsCoins, 0),
      totalCash: wallets.reduce(
        (sum, wallet) => sum + (wallet.cashBalance || 0),
        0,
      ),
      totalUsers: wallets.length,
    };
  }

  getNeonStatus(): {
    connected: boolean;
    lastSync: Date;
    endpoint: string;
    database: string;
  } {
    return {
      connected: this.neonClient?.connected || false,
      lastSync: this.neonClient?.lastSync || new Date(),
      endpoint: this.neonClient?.endpoint || "Not connected",
      database: this.neonClient?.database || "Not connected",
    };
  }

  // Bonus methods
  async awardWelcomeBonus(userId: string): Promise<UserWallet> {
    return this.updateBalance(
      userId,
      10,
      10,
      "Welcome Bonus - New User Registration",
    );
  }

  async awardDailyBonus(userId: string): Promise<UserWallet> {
    const bonusGC = Math.floor(Math.random() * 1000) + 500; // 500-1500 GC
    const bonusSC = Math.random() * 5 + 1; // 1-6 SC

    return this.updateBalance(userId, bonusGC, bonusSC, "Daily Login Bonus");
  }

  async awardLevelUpBonus(userId: string, level: number): Promise<UserWallet> {
    const bonusGC = level * 1000;
    const bonusSC = level * 5;

    return this.updateBalance(userId, bonusGC, bonusSC, `Level ${level} Bonus`);
  }

  // Deposit processing methods
  async processDeposit(
    userId: string,
    usdAmount: number,
    paymentMethod: string,
    paymentId: string,
    gcPackage: { goldCoins: number; bonusGC?: number; sweepsCoins: number },
    adminNotes?: string
  ): Promise<DepositRecord> {
    const depositId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const totalGC = gcPackage.goldCoins + (gcPackage.bonusGC || 0);

    const deposit: DepositRecord = {
      id: depositId,
      userId,
      amount: usdAmount,
      usdAmount,
      gcAwarded: totalGC,
      scAwarded: gcPackage.sweepsCoins,
      paymentMethod,
      paymentId,
      status: "completed",
      timestamp: new Date(),
      adminNotes,
      metadata: {
        originalGC: gcPackage.goldCoins,
        bonusGC: gcPackage.bonusGC || 0,
        neonSynced: false
      }
    };

    // Add to user deposit history
    if (!this.deposits.has(userId)) {
      this.deposits.set(userId, []);
    }
    this.deposits.get(userId)!.unshift(deposit);

    // Update wallet balances
    await this.updateBalance(
      userId,
      totalGC,
      gcPackage.sweepsCoins,
      `Deposit: ${paymentMethod} $${usdAmount}`,
      undefined,
      "slots",
      0,
      0,
      depositId,
      paymentMethod
    );

    // Record individual transactions for detailed tracking
    await this.addTransaction(
      userId,
      "credit",
      "GC",
      totalGC,
      `Deposit: ${totalGC} Gold Coins`,
      undefined,
      "slots",
      0,
      totalGC,
      paymentId,
      true,
      paymentMethod
    );

    if (gcPackage.sweepsCoins > 0) {
      await this.addTransaction(
        userId,
        "credit",
        "SC",
        gcPackage.sweepsCoins,
        `Deposit: ${gcPackage.sweepsCoins} Sweeps Coins`,
        undefined,
        "slots",
        0,
        gcPackage.sweepsCoins,
        paymentId,
        true,
        paymentMethod
      );
    }

    // Update total deposited amount
    const wallet = await this.getUserWallet(userId);
    wallet.totalDeposited = (wallet.totalDeposited || 0) + usdAmount;
    this.wallets.set(userId, wallet);

    // Notify deposit listeners
    this.notifyDepositChange(userId);

    // Sync to Neon
    await this.syncDepositToNeon(deposit);

    return deposit;
  }

  private async addTransaction(
    userId: string,
    type: "credit" | "debit",
    currency: CurrencyType,
    amount: number,
    description: string,
    gameId?: string,
    gameType?: "slots" | "table" | "live" | "bingo" | "sportsbook",
    betAmount?: number,
    winAmount?: number,
    paymentId?: string,
    isDeposit?: boolean,
    depositMethod?: string
  ) {
    const wallet = await this.getUserWallet(userId);

    const transaction: WalletTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      currency,
      amount,
      description,
      gameId,
      gameType,
      betAmount,
      winAmount,
      transactionDate: new Date(),
      balanceAfter: {
        GC: wallet.goldCoins,
        SC: wallet.sweepsCoins,
        USD: wallet.cashBalance || 0,
      },
      metadata: {
        neonSynced: false,
        sessionId: this.getCurrentSessionId(userId),
      },
      paymentId,
      isDeposit,
      depositMethod
    };

    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }

    this.transactions.get(userId)!.unshift(transaction);

    // Keep only last 500 transactions per user
    const userTransactions = this.transactions.get(userId)!;
    if (userTransactions.length > 500) {
      this.transactions.set(userId, userTransactions.slice(0, 500));
    }

    // Sync transaction to Neon
    await this.syncTransactionToNeon(transaction);
  }

  private async syncDepositToNeon(deposit: DepositRecord) {
    try {
      if (this.neonClient?.connected) {
        // In production, this would insert deposit record into Neon database
        deposit.metadata = { ...deposit.metadata, neonSynced: true };
        console.log("Syncing deposit to Neon:", deposit);
      }
    } catch (error) {
      console.error("Failed to sync deposit to Neon:", error);
    }
  }

  // Get user deposit history
  getUserDeposits(userId: string, limit: number = 50): DepositRecord[] {
    return this.deposits.get(userId)?.slice(0, limit) || [];
  }

  // Subscribe to deposit updates
  subscribeToDepositUpdates(
    userId: string,
    callback: (deposits: DepositRecord[]) => void
  ): () => void {
    if (!this.depositListeners.has(userId)) {
      this.depositListeners.set(userId, new Set());
    }

    this.depositListeners.get(userId)!.add(callback);

    // Call immediately with current deposits
    callback(this.getUserDeposits(userId));

    return () => {
      this.depositListeners.get(userId)?.delete(callback);
    };
  }

  private notifyDepositChange(userId: string) {
    const userListeners = this.depositListeners.get(userId);
    if (userListeners) {
      const deposits = this.getUserDeposits(userId);
      userListeners.forEach(callback => callback(deposits));
    }
  }

  // Admin methods for deposit management
  getAllDeposits(): DepositRecord[] {
    const allDeposits: DepositRecord[] = [];
    this.deposits.forEach(userDeposits => {
      allDeposits.push(...userDeposits);
    });
    return allDeposits.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getDepositsByPaymentMethod(paymentMethod: string): DepositRecord[] {
    return this.getAllDeposits().filter(d => d.paymentMethod === paymentMethod);
  }

  getDepositStatistics(): {
    totalDeposits: number;
    totalUSD: number;
    totalGCAwarded: number;
    totalSCAwarded: number;
    byPaymentMethod: Record<string, number>;
    last24Hours: number;
    last7Days: number;
  } {
    const allDeposits = this.getAllDeposits();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const byPaymentMethod: Record<string, number> = {};
    let totalUSD = 0;
    let totalGCAwarded = 0;
    let totalSCAwarded = 0;
    let last24Hours = 0;
    let last7Days = 0;

    allDeposits.forEach(deposit => {
      totalUSD += deposit.usdAmount;
      totalGCAwarded += deposit.gcAwarded;
      totalSCAwarded += deposit.scAwarded;

      byPaymentMethod[deposit.paymentMethod] = (byPaymentMethod[deposit.paymentMethod] || 0) + deposit.usdAmount;

      if (deposit.timestamp >= oneDayAgo) {
        last24Hours += deposit.usdAmount;
      }
      if (deposit.timestamp >= sevenDaysAgo) {
        last7Days += deposit.usdAmount;
      }
    });

    return {
      totalDeposits: allDeposits.length,
      totalUSD,
      totalGCAwarded,
      totalSCAwarded,
      byPaymentMethod,
      last24Hours,
      last7Days
    };
  }

  // Enhanced updateBalance method to support deposits
  async updateBalance(
    userId: string,
    gcChange: number,
    scChange: number,
    description: string,
    gameId?: string,
    gameType: "slots" | "table" | "live" | "bingo" | "sportsbook" = "slots",
    betAmount?: number,
    winAmount?: number,
    paymentId?: string,
    depositMethod?: string
  ): Promise<UserWallet> {
    const currentWallet = await this.getUserWallet(userId);

    // Calculate new balances (prevent negative balances)
    const newGC = Math.max(0, currentWallet.goldCoins + gcChange);
    const newSC = Math.max(0, currentWallet.sweepsCoins + scChange);

    // Update lifetime stats
    const lifetimeWins = currentWallet.lifetimeWins || 0;
    const lifetimeLosses = currentWallet.lifetimeLosses || 0;
    const newLifetimeWins = winAmount ? lifetimeWins + winAmount : lifetimeWins;
    const newLifetimeLosses =
      betAmount && !winAmount ? lifetimeLosses + betAmount : lifetimeLosses;

    // Update wallet
    const updatedWallet: UserWallet = {
      ...currentWallet,
      goldCoins: newGC,
      sweepsCoins: newSC,
      lifetimeWins: newLifetimeWins,
      lifetimeLosses: newLifetimeLosses,
      lastUpdated: new Date(),
    };

    this.wallets.set(userId, updatedWallet);

    // Notify listeners
    this.notifyWalletChange(userId, updatedWallet);

    // Sync to Neon
    await this.syncWalletToNeon(userId, updatedWallet);

    return updatedWallet;
  }

  // Currency preference methods
  setUserCurrencyPreference(userId: string, currency: CurrencyType): void {
    const wallet = this.wallets.get(userId);
    if (wallet) {
      wallet.preferredCurrency = currency;
      wallet.lastUpdated = new Date();
      this.wallets.set(userId, wallet);
      this.notifyWalletChange(userId, wallet);
    }
  }

  getUserCurrencyPreference(userId: string): CurrencyType {
    const wallet = this.wallets.get(userId);
    return wallet?.preferredCurrency || "GC";
  }

  // Real-time update control
  setRealTimeUpdates(userId: string, enabled: boolean): void {
    const wallet = this.wallets.get(userId);
    if (wallet) {
      wallet.realTimeUpdateEnabled = enabled;
      this.wallets.set(userId, wallet);
    }
  }
}

export const walletService = WalletService.getInstance();
