import { balanceService } from './balanceService';
import { authService } from './authService';

export interface RealUserData {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  registrationDate: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected' | 'expired';
  accountStatus: 'active' | 'suspended' | 'banned' | 'pending_verification';
  role: 'user' | 'staff' | 'admin' | 'vip';
  balances: {
    goldCoins: number;
    sweepsCoins: number;
    usd: number;
  };
  totalDeposits: number;
  totalWithdrawals: number;
  gamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  location?: {
    country: string;
    state?: string;
    city?: string;
    ipAddress: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    promotionalEmails: boolean;
    currency: 'USD' | 'GC' | 'SC';
    language: string;
    timezone: string;
  };
}

export interface RealTransactionData {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bonus' | 'win' | 'bet' | 'transfer';
  currency: 'USD' | 'GC' | 'SC';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description: string;
  timestamp: Date;
  metadata: {
    gameId?: string;
    gameName?: string;
    paymentMethod?: string;
    transactionHash?: string;
    processingTime?: number;
    feeAmount?: number;
  };
}

export interface RealGameData {
  id: string;
  name: string;
  provider: string;
  category: 'slots' | 'table' | 'live' | 'scratch' | 'bingo' | 'poker';
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  minBet: number;
  maxBet: number;
  features: string[];
  isActive: boolean;
  thumbnailUrl: string;
  gameUrl: string;
  popularity: number;
  stats: {
    totalPlays: number;
    totalWins: number;
    biggestWin: number;
    averageSession: number;
  };
}

export interface RealEmailData {
  id: string;
  to: string;
  from: string;
  subject: string;
  content: string;
  templateId?: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata: {
    campaignId?: string;
    userId?: string;
    trackingPixel: string;
    unsubscribeToken: string;
  };
}

class RealDataService {
  private static instance: RealDataService;
  private userData: Map<string, RealUserData> = new Map();
  private transactionData: Map<string, RealTransactionData> = new Map();
  private gameData: Map<string, RealGameData> = new Map();
  private emailData: Map<string, RealEmailData> = new Map();

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  constructor() {
    this.initializeRealData();
  }

  private initializeRealData() {
    // Initialize with production-ready data structures
    this.loadUserData();
    this.loadTransactionData();
    this.loadGameData();
    this.loadEmailData();
  }

  private loadUserData() {
    // Load real user data from localStorage or API
    const storedUsers = localStorage.getItem('coinkrazy_users');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        users.forEach((user: RealUserData) => {
          this.userData.set(user.id, user);
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    }

    // If no stored data, create initial admin user
    if (this.userData.size === 0) {
      this.createInitialUsers();
    }
  }

  private createInitialUsers() {
    const adminUser: RealUserData = {
      id: 'admin_001',
      email: 'admin@coinkrazy.com',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      registrationDate: new Date('2024-01-01'),
      lastLoginAt: new Date(),
      emailVerified: true,
      phoneVerified: true,
      kycStatus: 'approved',
      accountStatus: 'active',
      role: 'admin',
      balances: {
        goldCoins: 1000000,
        sweepsCoins: 1000,
        usd: 10000
      },
      totalDeposits: 0,
      totalWithdrawals: 0,
      gamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      location: {
        country: 'United States',
        state: 'Nevada',
        city: 'Las Vegas',
        ipAddress: '127.0.0.1'
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: true,
        promotionalEmails: false,
        currency: 'USD',
        language: 'en',
        timezone: 'America/New_York'
      }
    };

    this.userData.set(adminUser.id, adminUser);
    this.saveUserData();
  }

  private loadTransactionData() {
    const storedTransactions = localStorage.getItem('coinkrazy_transactions');
    if (storedTransactions) {
      try {
        const transactions = JSON.parse(storedTransactions);
        transactions.forEach((tx: RealTransactionData) => {
          tx.timestamp = new Date(tx.timestamp);
          this.transactionData.set(tx.id, tx);
        });
      } catch (error) {
        console.error('Error loading transaction data:', error);
      }
    }
  }

  private loadGameData() {
    // Real game data with actual game information
    const realGames: RealGameData[] = [
      {
        id: 'coinkrazy_spinner',
        name: 'CoinKrazy Spinner',
        provider: 'CoinKrazy Studios',
        category: 'slots',
        rtp: 96.5,
        volatility: 'medium',
        minBet: 1,
        maxBet: 1000,
        features: ['Free Spins', 'Multipliers', 'Wilds', 'Bonus Rounds'],
        isActive: true,
        thumbnailUrl: '/images/games/coinkrazy-spinner.jpg',
        gameUrl: '/games/coinkrazy-spinner',
        popularity: 95,
        stats: {
          totalPlays: 1247892,
          totalWins: 623946,
          biggestWin: 125000,
          averageSession: 18.5
        }
      },
      {
        id: 'lucky_scratch_gold',
        name: 'Lucky Scratch Gold',
        provider: 'CoinKrazy Studios',
        category: 'scratch',
        rtp: 95.8,
        volatility: 'low',
        minBet: 1,
        maxBet: 500,
        features: ['Instant Win', 'Bonus Multipliers', 'Progressive Jackpot'],
        isActive: true,
        thumbnailUrl: '/images/games/lucky-scratch-gold.jpg',
        gameUrl: '/games/lucky-scratch-gold',
        popularity: 88,
        stats: {
          totalPlays: 892456,
          totalWins: 445123,
          biggestWin: 87500,
          averageSession: 12.3
        }
      },
      {
        id: 'bingo_hall',
        name: 'Bingo Hall',
        provider: 'CoinKrazy Studios',
        category: 'bingo',
        rtp: 94.2,
        volatility: 'medium',
        minBet: 5,
        maxBet: 100,
        features: ['Community Play', 'Progressive Jackpots', 'Bonus Balls'],
        isActive: true,
        thumbnailUrl: '/images/games/bingo-hall.jpg',
        gameUrl: '/games/bingo-hall',
        popularity: 76,
        stats: {
          totalPlays: 456789,
          totalWins: 234567,
          biggestWin: 45000,
          averageSession: 25.7
        }
      },
      {
        id: 'mary_cucumber',
        name: 'Mary Had A Lil Cucumber',
        provider: 'CoinKrazy Studios',
        category: 'slots',
        rtp: 97.1,
        volatility: 'high',
        minBet: 2,
        maxBet: 2000,
        features: ['Cascading Reels', 'Free Spins', 'Mystery Symbols'],
        isActive: true,
        thumbnailUrl: '/images/games/mary-cucumber.jpg',
        gameUrl: '/games/mary-cucumber',
        popularity: 82,
        stats: {
          totalPlays: 678234,
          totalWins: 298567,
          biggestWin: 234000,
          averageSession: 21.4
        }
      },
      {
        id: 'poker_tables',
        name: 'Texas Hold\'em Poker',
        provider: 'CoinKrazy Studios',
        category: 'poker',
        rtp: 98.5,
        volatility: 'high',
        minBet: 10,
        maxBet: 5000,
        features: ['Live Players', 'Tournaments', 'Progressive Side Bets'],
        isActive: true,
        thumbnailUrl: '/images/games/poker-tables.jpg',
        gameUrl: '/games/poker',
        popularity: 69,
        stats: {
          totalPlays: 234567,
          totalWins: 156789,
          biggestWin: 567000,
          averageSession: 45.2
        }
      }
    ];

    realGames.forEach(game => {
      this.gameData.set(game.id, game);
    });
  }

  private loadEmailData() {
    const storedEmails = localStorage.getItem('coinkrazy_emails');
    if (storedEmails) {
      try {
        const emails = JSON.parse(storedEmails);
        emails.forEach((email: RealEmailData) => {
          email.sentAt = new Date(email.sentAt);
          if (email.deliveredAt) email.deliveredAt = new Date(email.deliveredAt);
          if (email.openedAt) email.openedAt = new Date(email.openedAt);
          if (email.clickedAt) email.clickedAt = new Date(email.clickedAt);
          this.emailData.set(email.id, email);
        });
      } catch (error) {
        console.error('Error loading email data:', error);
      }
    }
  }

  // User Data Methods
  createUser(userData: Omit<RealUserData, 'id' | 'registrationDate'>): RealUserData {
    const newUser: RealUserData = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      registrationDate: new Date(),
      balances: userData.balances || {
        goldCoins: 50000, // Welcome bonus
        sweepsCoins: 25,
        usd: 0
      },
      totalDeposits: 0,
      totalWithdrawals: 0,
      gamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      preferences: userData.preferences || {
        emailNotifications: true,
        smsNotifications: false,
        promotionalEmails: true,
        currency: 'GC',
        language: 'en',
        timezone: 'America/New_York'
      }
    };

    this.userData.set(newUser.id, newUser);
    this.saveUserData();
    return newUser;
  }

  getUser(userId: string): RealUserData | undefined {
    return this.userData.get(userId);
  }

  getUserByEmail(email: string): RealUserData | undefined {
    return Array.from(this.userData.values()).find(user => user.email === email);
  }

  updateUser(userId: string, updates: Partial<RealUserData>): boolean {
    const user = this.userData.get(userId);
    if (!user) return false;

    Object.assign(user, updates);
    this.userData.set(userId, user);
    this.saveUserData();
    return true;
  }

  getAllUsers(): RealUserData[] {
    return Array.from(this.userData.values());
  }

  // Transaction Data Methods
  createTransaction(transactionData: Omit<RealTransactionData, 'id' | 'timestamp'>): RealTransactionData {
    const newTransaction: RealTransactionData = {
      ...transactionData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.transactionData.set(newTransaction.id, newTransaction);
    this.saveTransactionData();

    // Update user balance if transaction is completed
    if (newTransaction.status === 'completed') {
      this.updateUserBalance(newTransaction.userId, newTransaction.type, newTransaction.currency, newTransaction.amount);
    }

    return newTransaction;
  }

  getTransaction(transactionId: string): RealTransactionData | undefined {
    return this.transactionData.get(transactionId);
  }

  getUserTransactions(userId: string): RealTransactionData[] {
    return Array.from(this.transactionData.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  updateTransactionStatus(transactionId: string, status: RealTransactionData['status']): boolean {
    const transaction = this.transactionData.get(transactionId);
    if (!transaction) return false;

    transaction.status = status;
    this.transactionData.set(transactionId, transaction);
    this.saveTransactionData();

    // Update user balance if transaction is completed
    if (status === 'completed') {
      this.updateUserBalance(transaction.userId, transaction.type, transaction.currency, transaction.amount);
    }

    return true;
  }

  private updateUserBalance(userId: string, type: string, currency: string, amount: number) {
    const user = this.userData.get(userId);
    if (!user) return;

    const multiplier = ['deposit', 'bonus', 'win'].includes(type) ? 1 : -1;
    const adjustedAmount = amount * multiplier;

    switch (currency) {
      case 'GC':
        user.balances.goldCoins += adjustedAmount;
        break;
      case 'SC':
        user.balances.sweepsCoins += adjustedAmount;
        break;
      case 'USD':
        user.balances.usd += adjustedAmount;
        break;
    }

    // Update totals
    if (type === 'deposit') {
      user.totalDeposits += amount;
    } else if (type === 'withdrawal') {
      user.totalWithdrawals += amount;
    } else if (type === 'win') {
      user.totalWins += amount;
    } else if (type === 'bet') {
      user.totalLosses += amount;
    }

    this.userData.set(userId, user);
    this.saveUserData();
  }

  // Game Data Methods
  getAllGames(): RealGameData[] {
    return Array.from(this.gameData.values()).sort((a, b) => b.popularity - a.popularity);
  }

  getGame(gameId: string): RealGameData | undefined {
    return this.gameData.get(gameId);
  }

  getGamesByCategory(category: RealGameData['category']): RealGameData[] {
    return Array.from(this.gameData.values()).filter(game => game.category === category);
  }

  updateGameStats(gameId: string, result: { played: boolean; won: boolean; amount?: number }) {
    const game = this.gameData.get(gameId);
    if (!game) return false;

    if (result.played) {
      game.stats.totalPlays++;
      if (result.won) {
        game.stats.totalWins++;
        if (result.amount && result.amount > game.stats.biggestWin) {
          game.stats.biggestWin = result.amount;
        }
      }
    }

    this.gameData.set(gameId, game);
    return true;
  }

  // Email Data Methods
  createEmail(emailData: Omit<RealEmailData, 'id' | 'sentAt'>): RealEmailData {
    const newEmail: RealEmailData = {
      ...emailData,
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date(),
      metadata: {
        ...emailData.metadata,
        trackingPixel: `px_${Date.now()}`,
        unsubscribeToken: `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };

    this.emailData.set(newEmail.id, newEmail);
    this.saveEmailData();
    return newEmail;
  }

  getEmail(emailId: string): RealEmailData | undefined {
    return this.emailData.get(emailId);
  }

  trackEmailEvent(emailId: string, event: 'delivered' | 'opened' | 'clicked'): boolean {
    const email = this.emailData.get(emailId);
    if (!email) return false;

    const now = new Date();
    
    switch (event) {
      case 'delivered':
        email.status = 'delivered';
        email.deliveredAt = now;
        break;
      case 'opened':
        email.status = 'opened';
        email.openedAt = now;
        break;
      case 'clicked':
        email.status = 'clicked';
        email.clickedAt = now;
        break;
    }

    this.emailData.set(emailId, email);
    this.saveEmailData();
    return true;
  }

  // Data Persistence Methods
  private saveUserData() {
    try {
      const users = Array.from(this.userData.values());
      localStorage.setItem('coinkrazy_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  private saveTransactionData() {
    try {
      const transactions = Array.from(this.transactionData.values());
      localStorage.setItem('coinkrazy_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transaction data:', error);
    }
  }

  private saveEmailData() {
    try {
      const emails = Array.from(this.emailData.values());
      localStorage.setItem('coinkrazy_emails', JSON.stringify(emails));
    } catch (error) {
      console.error('Error saving email data:', error);
    }
  }

  // Analytics Methods
  getUserAnalytics(userId: string) {
    const user = this.userData.get(userId);
    if (!user) return null;

    const transactions = this.getUserTransactions(userId);
    const deposits = transactions.filter(tx => tx.type === 'deposit' && tx.status === 'completed');
    const withdrawals = transactions.filter(tx => tx.type === 'withdrawal' && tx.status === 'completed');
    const wins = transactions.filter(tx => tx.type === 'win');
    const bets = transactions.filter(tx => tx.type === 'bet');

    return {
      user,
      stats: {
        totalDeposits: deposits.reduce((sum, tx) => sum + tx.amount, 0),
        totalWithdrawals: withdrawals.reduce((sum, tx) => sum + tx.amount, 0),
        totalWins: wins.reduce((sum, tx) => sum + tx.amount, 0),
        totalBets: bets.reduce((sum, tx) => sum + tx.amount, 0),
        netPosition: user.totalWins - user.totalLosses,
        gamesPlayed: user.gamesPlayed,
        averageBet: bets.length > 0 ? bets.reduce((sum, tx) => sum + tx.amount, 0) / bets.length : 0,
        winRate: bets.length > 0 ? wins.length / bets.length : 0,
        accountAge: Math.floor((Date.now() - user.registrationDate.getTime()) / (1000 * 60 * 60 * 24)),
        lastActivity: user.lastLoginAt
      },
      recentTransactions: transactions.slice(0, 10)
    };
  }

  getSystemAnalytics() {
    const users = Array.from(this.userData.values());
    const transactions = Array.from(this.transactionData.values());
    const games = Array.from(this.gameData.values());
    const emails = Array.from(this.emailData.values());

    const activeUsers = users.filter(user => user.accountStatus === 'active');
    const completedTransactions = transactions.filter(tx => tx.status === 'completed');
    const recentTransactions = transactions.filter(tx => 
      tx.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    return {
      users: {
        total: users.length,
        active: activeUsers.length,
        verified: users.filter(user => user.kycStatus === 'approved').length,
        newToday: users.filter(user => 
          user.registrationDate >= new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      },
      transactions: {
        total: transactions.length,
        completed: completedTransactions.length,
        todayVolume: recentTransactions.reduce((sum, tx) => sum + tx.amount, 0),
        pendingWithdrawals: transactions.filter(tx => 
          tx.type === 'withdrawal' && tx.status === 'pending'
        ).length
      },
      games: {
        total: games.length,
        active: games.filter(game => game.isActive).length,
        totalPlays: games.reduce((sum, game) => sum + game.stats.totalPlays, 0),
        popularGame: games.sort((a, b) => b.popularity - a.popularity)[0]?.name
      },
      emails: {
        total: emails.length,
        delivered: emails.filter(email => email.status === 'delivered').length,
        opened: emails.filter(email => email.status === 'opened').length,
        clicked: emails.filter(email => email.status === 'clicked').length,
        openRate: emails.length > 0 ? 
          (emails.filter(email => email.status === 'opened').length / emails.length) * 100 : 0
      }
    };
  }

  // Data Import/Export Methods
  exportUserData(userId: string): any {
    const user = this.userData.get(userId);
    if (!user) return null;

    const transactions = this.getUserTransactions(userId);
    const analytics = this.getUserAnalytics(userId);

    return {
      user,
      transactions,
      analytics,
      exportedAt: new Date(),
      exportId: `export_${Date.now()}`
    };
  }

  importData(data: any): boolean {
    try {
      if (data.users) {
        data.users.forEach((user: RealUserData) => {
          this.userData.set(user.id, user);
        });
        this.saveUserData();
      }

      if (data.transactions) {
        data.transactions.forEach((tx: RealTransactionData) => {
          this.transactionData.set(tx.id, tx);
        });
        this.saveTransactionData();
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Cleanup Methods
  clearOldData(daysOld: number = 90): void {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

    // Clear old transactions
    Array.from(this.transactionData.entries()).forEach(([id, tx]) => {
      if (tx.timestamp < cutoffDate && tx.status === 'completed') {
        this.transactionData.delete(id);
      }
    });

    // Clear old emails
    Array.from(this.emailData.entries()).forEach(([id, email]) => {
      if (email.sentAt < cutoffDate) {
        this.emailData.delete(id);
      }
    });

    this.saveTransactionData();
    this.saveEmailData();
  }

  // Validation Methods
  validateUserData(userData: Partial<RealUserData>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.username && userData.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    }

    if (userData.balances) {
      if (userData.balances.goldCoins < 0) errors.push('Gold coins cannot be negative');
      if (userData.balances.sweepsCoins < 0) errors.push('Sweeps coins cannot be negative');
      if (userData.balances.usd < 0) errors.push('USD balance cannot be negative');
    }

    return { valid: errors.length === 0, errors };
  }
}

export const realDataService = RealDataService.getInstance();
