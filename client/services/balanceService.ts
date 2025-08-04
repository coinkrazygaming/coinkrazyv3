export interface UserBalance {
  userId: string;
  gc: number; // Gold Coins
  sc: number; // Sweeps Coins
  lastUpdated: Date;
}

export interface BalanceTransaction {
  id: string;
  userId: string;
  type: "credit" | "debit";
  currency: "gc" | "sc";
  amount: number;
  description: string;
  gameId?: string;
  transactionDate: Date;
  balanceAfter: number;
}

class BalanceService {
  private static instance: BalanceService;
  private balances: Map<string, UserBalance> = new Map();
  private transactions: Map<string, BalanceTransaction[]> = new Map();
  private listeners: Map<string, Set<(balance: UserBalance) => void>> =
    new Map();

  static getInstance(): BalanceService {
    if (!BalanceService.instance) {
      BalanceService.instance = new BalanceService();
    }
    return BalanceService.instance;
  }

  constructor() {
    this.initializeDefaultBalances();
    this.startPeriodicUpdates();
  }

  private initializeDefaultBalances() {
    // Initialize some default user balances for demo
    const defaultUsers = [
      { userId: "user-1", gc: 125000, sc: 450 },
      { userId: "user-2", gc: 89000, sc: 125 },
      { userId: "user-3", gc: 450000, sc: 1250 },
      { userId: "coinkrazy00@gmail.com", gc: 1000000, sc: 5000 }, // Admin account
    ];

    defaultUsers.forEach((user) => {
      this.balances.set(user.userId, {
        userId: user.userId,
        gc: user.gc,
        sc: user.sc,
        lastUpdated: new Date(),
      });
    });
  }

  private startPeriodicUpdates() {
    // Simulate real-time balance updates every 5-15 seconds
    setInterval(
      () => {
        this.simulateBalanceUpdates();
      },
      Math.random() * 10000 + 5000,
    ); // 5-15 seconds
  }

  private simulateBalanceUpdates() {
    // Randomly update some user balances to simulate real-time changes
    const userIds = Array.from(this.balances.keys());
    const randomUsers = userIds.slice(0, Math.floor(Math.random() * 3) + 1);

    randomUsers.forEach((userId) => {
      const balance = this.balances.get(userId);
      if (balance) {
        // Small random changes to simulate gameplay
        const gcChange = Math.floor(Math.random() * 2000) - 1000; // -1000 to +1000
        const scChange =
          Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0; // Rare SC changes

        this.updateBalance(userId, gcChange, scChange, "Gameplay activity");
      }
    });
  }

  getUserBalance(userId: string): UserBalance {
    let balance = this.balances.get(userId);
    if (!balance) {
      // Create new user with welcome bonus
      balance = {
        userId,
        gc: 50000, // Welcome bonus: 50k GC
        sc: 25, // Welcome bonus: 25 SC
        lastUpdated: new Date(),
      };
      this.balances.set(userId, balance);

      // Record welcome bonus transaction
      this.addTransaction(
        userId,
        "credit",
        "gc",
        50000,
        "Welcome Bonus - Gold Coins",
        undefined,
        balance.gc,
      );
      this.addTransaction(
        userId,
        "credit",
        "sc",
        25,
        "Welcome Bonus - Sweeps Coins",
        undefined,
        balance.sc,
      );
    }
    return balance;
  }

  updateBalance(
    userId: string,
    gcChange: number,
    scChange: number,
    description: string,
    gameId?: string,
  ): UserBalance {
    const currentBalance = this.getUserBalance(userId);

    // Calculate new balances
    const newGC = Math.max(0, currentBalance.gc + gcChange);
    const newSC = Math.max(0, currentBalance.sc + scChange);

    // Update balance
    const updatedBalance: UserBalance = {
      userId,
      gc: newGC,
      sc: newSC,
      lastUpdated: new Date(),
    };

    this.balances.set(userId, updatedBalance);

    // Record transactions
    if (gcChange !== 0) {
      this.addTransaction(
        userId,
        gcChange > 0 ? "credit" : "debit",
        "gc",
        Math.abs(gcChange),
        description,
        gameId,
        newGC,
      );
    }

    if (scChange !== 0) {
      this.addTransaction(
        userId,
        scChange > 0 ? "credit" : "debit",
        "sc",
        Math.abs(scChange),
        description,
        gameId,
        newSC,
      );
    }

    // Notify listeners
    this.notifyBalanceChange(userId, updatedBalance);

    return updatedBalance;
  }

  private addTransaction(
    userId: string,
    type: "credit" | "debit",
    currency: "gc" | "sc",
    amount: number,
    description: string,
    gameId?: string,
    balanceAfter?: number,
  ) {
    const transaction: BalanceTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      currency,
      amount,
      description,
      gameId,
      transactionDate: new Date(),
      balanceAfter: balanceAfter || this.getUserBalance(userId)[currency],
    };

    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }

    this.transactions.get(userId)!.unshift(transaction); // Add to beginning for recent first

    // Keep only last 100 transactions per user
    const userTransactions = this.transactions.get(userId)!;
    if (userTransactions.length > 100) {
      this.transactions.set(userId, userTransactions.slice(0, 100));
    }
  }

  getUserTransactions(
    userId: string,
    limit: number = 20,
  ): BalanceTransaction[] {
    return this.transactions.get(userId)?.slice(0, limit) || [];
  }

  subscribeToBalanceUpdates(
    userId: string,
    callback: (balance: UserBalance) => void,
  ): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }

    this.listeners.get(userId)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(userId)?.delete(callback);
    };
  }

  private notifyBalanceChange(userId: string, balance: UserBalance) {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach((callback) => callback(balance));
    }
  }

  // Bonus and reward methods
  awardWelcomeBonus(userId: string): UserBalance {
    return this.updateBalance(userId, 10, 10, "Welcome Bonus - New User");
  }

  awardFirstDepositBonus(userId: string, depositAmount: number): UserBalance {
    // 100% match up to $100
    const matchAmount = Math.min(depositAmount, 100);
    const scAwarded = matchAmount; // 1:1 ratio for simplicity

    return this.updateBalance(
      userId,
      0,
      scAwarded,
      `First Deposit Bonus - ${matchAmount}% match on $${depositAmount}`,
    );
  }

  awardMiniGameReward(
    userId: string,
    gameId: string,
    amount: number,
  ): UserBalance {
    const maxDaily = 0.25;
    const today = new Date().toDateString();

    // Check daily limit (simplified - in production would use proper date tracking)
    const actualAmount = Math.min(amount, maxDaily);

    return this.updateBalance(
      userId,
      0,
      actualAmount,
      `Mini Game Reward - ${gameId}`,
      gameId,
    );
  }

  // Admin methods
  getAllBalances(): UserBalance[] {
    return Array.from(this.balances.values()).sort(
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
    );
  }

  getTotalCurrency(): { totalGC: number; totalSC: number; totalUsers: number } {
    const balances = this.getAllBalances();
    const totalGC = balances.reduce((sum, balance) => sum + balance.gc, 0);
    const totalSC = balances.reduce((sum, balance) => sum + balance.sc, 0);

    return {
      totalGC,
      totalSC,
      totalUsers: balances.length,
    };
  }

  // Real-time stats for admin
  getRealtimeStats() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    let recentTransactions = 0;
    let recentGCFlow = 0;
    let recentSCFlow = 0;

    for (const userTransactions of this.transactions.values()) {
      for (const txn of userTransactions) {
        if (txn.transactionDate >= fiveMinutesAgo) {
          recentTransactions++;
          const amount = txn.type === "credit" ? txn.amount : -txn.amount;

          if (txn.currency === "gc") {
            recentGCFlow += amount;
          } else {
            recentSCFlow += amount;
          }
        }
      }
    }

    return {
      recentTransactions,
      recentGCFlow,
      recentSCFlow,
      activeUsers: this.balances.size,
      lastUpdateTime: now,
    };
  }
}

export const balanceService = BalanceService.getInstance();
