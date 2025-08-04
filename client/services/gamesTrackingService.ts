export interface GameCategory {
  id: string;
  name: string;
  count: number;
  isActive: boolean;
}

export interface GameProvider {
  id: string;
  name: string;
  gameCount: number;
  isActive: boolean;
}

export interface DailyUserStats {
  userId: string;
  date: string;
  scWonToday: number;
  gamesPlayedToday: number;
  sessionsToday: number;
  lastActivity: Date;
}

export interface PlatformStats {
  totalGamesAvailable: number;
  totalActivePlayers: number;
  totalSCWonToday: number;
  gamesByCategory: GameCategory[];
  gamesByProvider: GameProvider[];
  dailyStats: {
    newUsersToday: number;
    sessionsToday: number;
    totalWinsToday: number;
    jackpotsWonToday: number;
  };
}

class GamesTrackingService {
  private static instance: GamesTrackingService;
  private userDailyStats: Map<string, DailyUserStats> = new Map();
  private platformStats: PlatformStats;
  private listeners: Set<(stats: PlatformStats) => void> = new Set();

  static getInstance(): GamesTrackingService {
    if (!GamesTrackingService.instance) {
      GamesTrackingService.instance = new GamesTrackingService();
    }
    return GamesTrackingService.instance;
  }

  constructor() {
    this.initializePlatformStats();
    this.startRealTimeUpdates();
  }

  private initializePlatformStats() {
    // Initialize with real game counts based on our platform
    const gameCategories: GameCategory[] = [
      { id: 'slots', name: 'Slot Games', count: 247, isActive: true },
      { id: 'table', name: 'Table Games', count: 18, isActive: true },
      { id: 'bingo', name: 'Bingo Games', count: 4, isActive: true },
      { id: 'mini', name: 'Mini Games', count: 10, isActive: true },
      { id: 'live', name: 'Live Dealer', count: 12, isActive: true },
      { id: 'sports', name: 'Sports Betting', count: 8, isActive: true }
    ];

    const gameProviders: GameProvider[] = [
      { id: 'pragmatic-play', name: 'Pragmatic Play', gameCount: 89, isActive: true },
      { id: 'netent', name: 'NetEnt', gameCount: 67, isActive: true },
      { id: 'playtech', name: 'Playtech', gameCount: 45, isActive: true },
      { id: 'microgaming', name: 'Microgaming', gameCount: 34, isActive: true },
      { id: 'evolution', name: 'Evolution Gaming', gameCount: 12, isActive: true },
      { id: 'coinkrazy', name: 'CoinKrazy Originals', gameCount: 52, isActive: true }
    ];

    const totalGames = gameCategories.reduce((sum, cat) => sum + cat.count, 0);

    this.platformStats = {
      totalGamesAvailable: totalGames,
      totalActivePlayers: 0, // Will be updated by player service
      totalSCWonToday: 0,
      gamesByCategory: gameCategories,
      gamesByProvider: gameProviders,
      dailyStats: {
        newUsersToday: 0,
        sessionsToday: 0,
        totalWinsToday: 0,
        jackpotsWonToday: 0
      }
    };

    this.loadDailyStats();
  }

  private loadDailyStats() {
    // Load today's statistics
    const today = new Date().toDateString();
    
    // Simulate some realistic daily stats
    this.platformStats.dailyStats = {
      newUsersToday: Math.floor(Math.random() * 50) + 25, // 25-75 new users
      sessionsToday: Math.floor(Math.random() * 500) + 200, // 200-700 sessions
      totalWinsToday: Math.floor(Math.random() * 1000) + 500, // 500-1500 wins
      jackpotsWonToday: Math.floor(Math.random() * 3) + 1 // 1-4 jackpots
    };

    // Calculate total SC won today from user stats
    let totalSCToday = 0;
    for (const stats of this.userDailyStats.values()) {
      if (stats.date === today) {
        totalSCToday += stats.scWonToday;
      }
    }
    this.platformStats.totalSCWonToday = totalSCToday;
  }

  private startRealTimeUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
      this.updateRealTimeStats();
      this.notifyListeners();
    }, 30000);

    // Reset daily stats at midnight
    setInterval(() => {
      this.resetDailyStatsIfNeeded();
    }, 60000);
  }

  private updateRealTimeStats() {
    // Simulate small increases in daily stats
    const increment = Math.random();
    
    if (increment > 0.9) {
      this.platformStats.dailyStats.newUsersToday += 1;
    }
    
    if (increment > 0.7) {
      this.platformStats.dailyStats.sessionsToday += 1;
    }
    
    if (increment > 0.5) {
      this.platformStats.dailyStats.totalWinsToday += Math.floor(Math.random() * 3) + 1;
    }
    
    if (increment > 0.98) {
      this.platformStats.dailyStats.jackpotsWonToday += 1;
    }

    // Recalculate total SC won
    this.recalculateDailySC();
  }

  private resetDailyStatsIfNeeded() {
    const today = new Date().toDateString();
    
    // Check if we need to reset daily stats for all users
    for (const [userId, stats] of this.userDailyStats.entries()) {
      if (stats.date !== today) {
        this.userDailyStats.set(userId, {
          ...stats,
          date: today,
          scWonToday: 0,
          gamesPlayedToday: 0,
          sessionsToday: 0
        });
      }
    }

    // Reset platform daily stats if it's a new day
    const lastUpdate = localStorage.getItem('lastStatsUpdate');
    if (lastUpdate !== today) {
      this.platformStats.dailyStats = {
        newUsersToday: 0,
        sessionsToday: 0,
        totalWinsToday: 0,
        jackpotsWonToday: 0
      };
      localStorage.setItem('lastStatsUpdate', today);
    }
  }

  private recalculateDailySC() {
    const today = new Date().toDateString();
    let totalSC = 0;
    
    for (const stats of this.userDailyStats.values()) {
      if (stats.date === today) {
        totalSC += stats.scWonToday;
      }
    }
    
    this.platformStats.totalSCWonToday = totalSC;
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.platformStats));
  }

  // Public methods
  recordUserWin(userId: string, scAmount: number, gameId: string) {
    const today = new Date().toDateString();
    let userStats = this.userDailyStats.get(userId);
    
    if (!userStats || userStats.date !== today) {
      userStats = {
        userId,
        date: today,
        scWonToday: 0,
        gamesPlayedToday: 0,
        sessionsToday: 0,
        lastActivity: new Date()
      };
    }
    
    userStats.scWonToday += scAmount;
    userStats.gamesPlayedToday += 1;
    userStats.lastActivity = new Date();
    
    this.userDailyStats.set(userId, userStats);
    this.recalculateDailySC();
    this.notifyListeners();
  }

  recordUserSession(userId: string) {
    const today = new Date().toDateString();
    let userStats = this.userDailyStats.get(userId);
    
    if (!userStats || userStats.date !== today) {
      userStats = {
        userId,
        date: today,
        scWonToday: 0,
        gamesPlayedToday: 0,
        sessionsToday: 0,
        lastActivity: new Date()
      };
    }
    
    userStats.sessionsToday += 1;
    userStats.lastActivity = new Date();
    
    this.userDailyStats.set(userId, userStats);
    this.platformStats.dailyStats.sessionsToday += 1;
    this.notifyListeners();
  }

  getUserDailyStats(userId: string): DailyUserStats {
    const today = new Date().toDateString();
    let userStats = this.userDailyStats.get(userId);
    
    if (!userStats || userStats.date !== today) {
      userStats = {
        userId,
        date: today,
        scWonToday: 0,
        gamesPlayedToday: 0,
        sessionsToday: 0,
        lastActivity: new Date()
      };
      this.userDailyStats.set(userId, userStats);
    }
    
    return userStats;
  }

  getPlatformStats(): PlatformStats {
    return { ...this.platformStats };
  }

  getGamesAvailable(): number {
    return this.platformStats.totalGamesAvailable;
  }

  getTotalSCWonToday(): number {
    return this.platformStats.totalSCWonToday;
  }

  getGamesByCategory(): GameCategory[] {
    return [...this.platformStats.gamesByCategory];
  }

  getGamesByProvider(): GameProvider[] {
    return [...this.platformStats.gamesByProvider];
  }

  subscribeToStats(callback: (stats: PlatformStats) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current stats
    callback(this.platformStats);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Admin methods
  updateGameCount(categoryId: string, newCount: number): boolean {
    const category = this.platformStats.gamesByCategory.find(cat => cat.id === categoryId);
    if (category) {
      const oldCount = category.count;
      category.count = newCount;
      
      // Update total
      this.platformStats.totalGamesAvailable += (newCount - oldCount);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  addNewGame(categoryId: string, providerId?: string) {
    const category = this.platformStats.gamesByCategory.find(cat => cat.id === categoryId);
    if (category) {
      category.count += 1;
      this.platformStats.totalGamesAvailable += 1;
    }
    
    if (providerId) {
      const provider = this.platformStats.gamesByProvider.find(prov => prov.id === providerId);
      if (provider) {
        provider.gameCount += 1;
      }
    }
    
    this.notifyListeners();
  }

  getTopPerformingGames(): { gameId: string; plays: number; scAwarded: number }[] {
    // This would typically come from game analytics
    return [
      { gameId: 'coinkrazy-spinner', plays: 1247, scAwarded: 234.50 },
      { gameId: 'lucky-scratch-gold', plays: 987, scAwarded: 189.25 },
      { gameId: 'sweet-bonanza', plays: 856, scAwarded: 167.80 },
      { gameId: 'gates-olympus', plays: 743, scAwarded: 145.60 },
      { gameId: 'book-dead', plays: 692, scAwarded: 134.20 }
    ];
  }

  getRecentWins(): { userId: string; amount: number; gameId: string; timestamp: Date }[] {
    // Simulate recent wins
    const games = ['Sweet Bonanza', 'Gates of Olympus', 'CoinKrazy Spinner', 'Lucky Scratch', 'Book of Dead'];
    const wins = [];
    
    for (let i = 0; i < 10; i++) {
      wins.push({
        userId: `player-${Math.floor(Math.random() * 1000)}`,
        amount: Math.random() * 10 + 0.5,
        gameId: games[Math.floor(Math.random() * games.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000) // Within last hour
      });
    }
    
    return wins.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const gamesTrackingService = GamesTrackingService.getInstance();
