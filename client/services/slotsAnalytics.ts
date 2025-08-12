export interface SlotGameStats {
  gameId: string;
  gameName: string;
  totalSpins: number;
  totalWins: number;
  totalWinAmount: number;
  biggestWin: number;
  averageWin: number;
  winRate: number;
  rtp: number;
  favoriteStatus: boolean;
  timeSpent: number; // in milliseconds
  lastPlayed: Date;
  jackpotsWon: number;
  bonusRoundsTriggered: number;
  freeSpinsWon: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLossStreak: number;
}

export interface UserSlotProfile {
  userId: string;
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  totalSpins: number;
  totalWins: number;
  totalWinAmount: number;
  biggestSingleWin: number;
  lifetimeWinnings: number;
  favoriteGameId: string;
  preferredCurrency: 'GC' | 'SC';
  playtime: number; // total time in milliseconds
  achievements: string[];
  badges: string[];
  joinDate: Date;
  lastActive: Date;
  winRate: number;
  averageBet: number;
  highestMultiplier: number;
  jackpotsWon: number;
  gamesUnlocked: string[];
}

export interface SlotSession {
  sessionId: string;
  userId: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  totalSpins: number;
  totalBet: number;
  totalWin: number;
  netResult: number;
  biggestWin: number;
  currency: 'GC' | 'SC';
  bonusRoundsTriggered: number;
  jackpotsWon: number;
  achievements: string[];
  avgSpinTime: number;
}

export interface SlotGameAnalytics {
  gameId: string;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  timestamp: Date;
  metrics: {
    totalPlayers: number;
    totalSpins: number;
    totalWagers: number;
    totalPayouts: number;
    actualRTP: number;
    avgSessionLength: number;
    popularityScore: number;
    retentionRate: number;
    newPlayerPercentage: number;
    conversionRate: number;
  };
}

export interface HotColdAnalysis {
  gameId: string;
  status: 'hot' | 'cold' | 'normal';
  temperature: number; // -100 to 100
  recentPayouts: number[];
  payoutTrend: 'increasing' | 'decreasing' | 'stable';
  recommendation: 'play_now' | 'wait' | 'neutral';
  confidence: number; // 0 to 1
}

export class SlotsAnalyticsService {
  private static instance: SlotsAnalyticsService;
  private userProfiles: Map<string, UserSlotProfile> = new Map();
  private gameStats: Map<string, Map<string, SlotGameStats>> = new Map(); // userId -> gameId -> stats
  private sessions: Map<string, SlotSession> = new Map();
  private analytics: Map<string, SlotGameAnalytics[]> = new Map(); // gameId -> analytics[]
  private hotColdData: Map<string, HotColdAnalysis> = new Map();

  static getInstance(): SlotsAnalyticsService {
    if (!SlotsAnalyticsService.instance) {
      SlotsAnalyticsService.instance = new SlotsAnalyticsService();
    }
    return SlotsAnalyticsService.instance;
  }

  constructor() {
    this.initializeAnalytics();
    this.startAnalyticsCollection();
  }

  private initializeAnalytics() {
    // Initialize with sample data
    this.generateSampleAnalytics();
    this.updateHotColdAnalysis();
  }

  private generateSampleAnalytics() {
    // Generate sample analytics for demonstration
    const sampleGames = [
      'coin-krazy-classic', 'golden-fortune', 'neon-nights', 'pirate-treasure',
      'diamond-deluxe', 'aztec-gold', 'lucky-sevens', 'wild-west-gold'
    ];

    sampleGames.forEach(gameId => {
      const analytics: SlotGameAnalytics = {
        gameId,
        period: 'daily',
        timestamp: new Date(),
        metrics: {
          totalPlayers: Math.floor(Math.random() * 1000) + 100,
          totalSpins: Math.floor(Math.random() * 50000) + 5000,
          totalWagers: Math.floor(Math.random() * 1000000) + 100000,
          totalPayouts: Math.floor(Math.random() * 950000) + 90000,
          actualRTP: 95 + Math.random() * 3, // 95-98%
          avgSessionLength: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
          popularityScore: Math.random() * 100,
          retentionRate: 0.7 + Math.random() * 0.3, // 70-100%
          newPlayerPercentage: Math.random() * 0.4, // 0-40%
          conversionRate: Math.random() * 0.15 // 0-15%
        }
      };

      if (!this.analytics.has(gameId)) {
        this.analytics.set(gameId, []);
      }
      this.analytics.get(gameId)!.push(analytics);
    });
  }

  private updateHotColdAnalysis() {
    // Update hot/cold analysis for games
    this.analytics.forEach((analyticsArray, gameId) => {
      const latest = analyticsArray[analyticsArray.length - 1];
      if (latest) {
        const rtp = latest.metrics.actualRTP;
        const temperature = (rtp - 96) * 20; // Scale around 96% RTP
        
        let status: 'hot' | 'cold' | 'normal' = 'normal';
        if (temperature > 10) status = 'hot';
        else if (temperature < -10) status = 'cold';

        const recentPayouts = Array.from({ length: 10 }, () => Math.random() * 1000);
        
        this.hotColdData.set(gameId, {
          gameId,
          status,
          temperature: Math.max(-100, Math.min(100, temperature)),
          recentPayouts,
          payoutTrend: temperature > 0 ? 'increasing' : temperature < 0 ? 'decreasing' : 'stable',
          recommendation: status === 'hot' ? 'play_now' : status === 'cold' ? 'wait' : 'neutral',
          confidence: 0.7 + Math.random() * 0.3
        });
      }
    });
  }

  private startAnalyticsCollection() {
    // Update analytics every 5 minutes
    setInterval(() => {
      this.updateHotColdAnalysis();
    }, 5 * 60 * 1000);
  }

  // User Profile Management
  getUserProfile(userId: string): UserSlotProfile {
    if (!this.userProfiles.has(userId)) {
      const profile: UserSlotProfile = {
        userId,
        level: 1,
        experience: 0,
        experienceToNext: 1000,
        title: 'Novice Spinner',
        totalSpins: 0,
        totalWins: 0,
        totalWinAmount: 0,
        biggestSingleWin: 0,
        lifetimeWinnings: 0,
        favoriteGameId: '',
        preferredCurrency: 'GC',
        playtime: 0,
        achievements: [],
        badges: [],
        joinDate: new Date(),
        lastActive: new Date(),
        winRate: 0,
        averageBet: 0,
        highestMultiplier: 0,
        jackpotsWon: 0,
        gamesUnlocked: []
      };
      this.userProfiles.set(userId, profile);
    }
    return this.userProfiles.get(userId)!;
  }

  updateUserProfile(userId: string, updates: Partial<UserSlotProfile>) {
    const profile = this.getUserProfile(userId);
    Object.assign(profile, updates);
    this.calculateLevel(profile);
  }

  private calculateLevel(profile: UserSlotProfile) {
    const expRequired = [0, 1000, 2500, 5000, 10000, 20000, 35000, 55000, 80000, 120000];
    
    for (let level = expRequired.length - 1; level >= 0; level--) {
      if (profile.experience >= expRequired[level]) {
        profile.level = level + 1;
        profile.experienceToNext = level < expRequired.length - 1 ? 
          expRequired[level + 1] - profile.experience : 0;
        
        // Update title based on level
        const titles = [
          'Novice Spinner', 'Casual Player', 'Regular Spinner', 'Experienced Player',
          'Skilled Spinner', 'Expert Player', 'Master Spinner', 'Slot Veteran',
          'Legendary Player', 'Grand Master'
        ];
        profile.title = titles[Math.min(level, titles.length - 1)];
        break;
      }
    }
  }

  // Game Statistics
  getGameStats(userId: string, gameId: string): SlotGameStats {
    if (!this.gameStats.has(userId)) {
      this.gameStats.set(userId, new Map());
    }
    
    const userStats = this.gameStats.get(userId)!;
    if (!userStats.has(gameId)) {
      const stats: SlotGameStats = {
        gameId,
        gameName: '', // Will be set when first accessed
        totalSpins: 0,
        totalWins: 0,
        totalWinAmount: 0,
        biggestWin: 0,
        averageWin: 0,
        winRate: 0,
        rtp: 0,
        favoriteStatus: false,
        timeSpent: 0,
        lastPlayed: new Date(),
        jackpotsWon: 0,
        bonusRoundsTriggered: 0,
        freeSpinsWon: 0,
        currentStreak: 0,
        longestWinStreak: 0,
        longestLossStreak: 0
      };
      userStats.set(gameId, stats);
    }
    
    return userStats.get(gameId)!;
  }

  updateGameStats(userId: string, gameId: string, spinResult: any) {
    const stats = this.getGameStats(userId, gameId);
    const profile = this.getUserProfile(userId);
    
    stats.totalSpins++;
    stats.lastPlayed = new Date();
    
    if (spinResult.totalWin > 0) {
      stats.totalWins++;
      stats.totalWinAmount += spinResult.totalWin;
      stats.biggestWin = Math.max(stats.biggestWin, spinResult.totalWin);
      stats.currentStreak++;
      stats.longestWinStreak = Math.max(stats.longestWinStreak, stats.currentStreak);
      
      if (spinResult.isJackpot) {
        stats.jackpotsWon++;
      }
      
      if (spinResult.bonusTriggered) {
        stats.bonusRoundsTriggered++;
      }
      
      if (spinResult.freeSpinsAwarded > 0) {
        stats.freeSpinsWon += spinResult.freeSpinsAwarded;
      }
    } else {
      if (stats.currentStreak > 0) {
        stats.longestLossStreak = 0;
      } else {
        stats.longestLossStreak++;
      }
      stats.currentStreak = 0;
    }
    
    // Calculate derived stats
    stats.winRate = stats.totalWins / stats.totalSpins;
    stats.averageWin = stats.totalWins > 0 ? stats.totalWinAmount / stats.totalWins : 0;
    
    // Update user profile
    profile.totalSpins++;
    profile.lastActive = new Date();
    profile.experience += 10; // Base XP per spin
    
    if (spinResult.totalWin > 0) {
      profile.totalWins++;
      profile.totalWinAmount += spinResult.totalWin;
      profile.biggestSingleWin = Math.max(profile.biggestSingleWin, spinResult.totalWin);
      profile.experience += Math.floor(spinResult.totalWin / 100); // Bonus XP for wins
    }
    
    this.calculateLevel(profile);
  }

  // Session Management
  startSession(userId: string, gameId: string): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: SlotSession = {
      sessionId,
      userId,
      gameId,
      startTime: new Date(),
      totalSpins: 0,
      totalBet: 0,
      totalWin: 0,
      netResult: 0,
      biggestWin: 0,
      currency: 'GC',
      bonusRoundsTriggered: 0,
      jackpotsWon: 0,
      achievements: [],
      avgSpinTime: 0
    };
    
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  endSession(sessionId: string): SlotSession | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.endTime = new Date();
      session.avgSpinTime = session.totalSpins > 0 ? 
        (session.endTime.getTime() - session.startTime.getTime()) / session.totalSpins : 0;
    }
    return session || null;
  }

  updateSession(sessionId: string, spinResult: any) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.totalSpins++;
      session.totalBet += spinResult.betAmount || 0;
      session.totalWin += spinResult.totalWin || 0;
      session.netResult = session.totalWin - session.totalBet;
      session.biggestWin = Math.max(session.biggestWin, spinResult.totalWin || 0);
      
      if (spinResult.isJackpot) {
        session.jackpotsWon++;
      }
      
      if (spinResult.bonusTriggered) {
        session.bonusRoundsTriggered++;
      }
    }
  }

  // Analytics and Insights
  getGameAnalytics(gameId: string, period: 'daily' | 'weekly' | 'monthly' = 'daily'): SlotGameAnalytics[] {
    return this.analytics.get(gameId)?.filter(a => a.period === period) || [];
  }

  getHotColdAnalysis(gameId: string): HotColdAnalysis | null {
    return this.hotColdData.get(gameId) || null;
  }

  getAllHotColdAnalysis(): HotColdAnalysis[] {
    return Array.from(this.hotColdData.values());
  }

  getTopPerformingGames(limit: number = 10): { gameId: string; score: number }[] {
    const scores: { gameId: string; score: number }[] = [];
    
    this.analytics.forEach((analyticsArray, gameId) => {
      const latest = analyticsArray[analyticsArray.length - 1];
      if (latest) {
        // Calculate performance score based on multiple metrics
        const score = (
          latest.metrics.popularityScore * 0.3 +
          latest.metrics.retentionRate * 100 * 0.3 +
          latest.metrics.actualRTP * 0.2 +
          (latest.metrics.avgSessionLength / 1800) * 100 * 0.2
        );
        scores.push({ gameId, score });
      }
    });
    
    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  getPersonalizedRecommendations(userId: string): string[] {
    const profile = this.getUserProfile(userId);
    const userStats = this.gameStats.get(userId) || new Map();
    
    const recommendations: string[] = [];
    
    // Recommend based on favorite games
    const favoriteGames = Array.from(userStats.entries())
      .filter(([_, stats]) => stats.favoriteStatus)
      .map(([gameId, _]) => gameId);
    
    // Recommend hot games
    const hotGames = this.getAllHotColdAnalysis()
      .filter(analysis => analysis.status === 'hot')
      .map(analysis => analysis.gameId);
    
    // Combine recommendations (removing duplicates)
    const combined = [...new Set([...favoriteGames, ...hotGames])];
    
    return combined.slice(0, 5); // Top 5 recommendations
  }

  // Leaderboards
  getWinLeaderboard(period: 'daily' | 'weekly' | 'monthly' = 'daily', limit: number = 10) {
    const leaderboard: { userId: string; totalWins: number; winAmount: number }[] = [];
    
    this.userProfiles.forEach((profile, userId) => {
      leaderboard.push({
        userId,
        totalWins: profile.totalWins,
        winAmount: profile.totalWinAmount
      });
    });
    
    return leaderboard
      .sort((a, b) => b.winAmount - a.winAmount)
      .slice(0, limit);
  }

  getSpinLeaderboard(period: 'daily' | 'weekly' | 'monthly' = 'daily', limit: number = 10) {
    const leaderboard: { userId: string; totalSpins: number }[] = [];
    
    this.userProfiles.forEach((profile, userId) => {
      leaderboard.push({
        userId,
        totalSpins: profile.totalSpins
      });
    });
    
    return leaderboard
      .sort((a, b) => b.totalSpins - a.totalSpins)
      .slice(0, limit);
  }
}

export const slotsAnalyticsService = SlotsAnalyticsService.getInstance();
export default slotsAnalyticsService;
