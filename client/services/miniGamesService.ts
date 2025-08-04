export interface MiniGameConfig {
  id: string;
  name: string;
  description: string;
  category: "luck" | "skill" | "puzzle";
  difficulty: "easy" | "medium" | "hard";
  maxReward: number;
  minReward: number;
  cooldownHours: number;
  isActive: boolean;
}

export interface GameSession {
  userId: string;
  gameId: string;
  startTime: Date;
  endTime?: Date;
  scAwarded: number;
  success: boolean;
  multiplier: number;
  bonus: boolean;
}

export interface DailyGameLimits {
  userId: string;
  date: string; // YYYY-MM-DD format
  gamesPlayed: Map<string, number>; // gameId -> count
  totalSCEarned: number;
  lastReset: Date;
}

export interface CooldownInfo {
  gameId: string;
  lastPlayed: Date;
  remainingCooldown: number; // in milliseconds
  canPlay: boolean;
}

class MiniGamesService {
  private static instance: MiniGamesService;
  private gameConfigs: Map<string, MiniGameConfig> = new Map();
  private userSessions: Map<string, GameSession[]> = new Map();
  private dailyLimits: Map<string, DailyGameLimits> = new Map();
  private readonly DAILY_SC_LIMIT = 0.25; // Max 0.25 SC per day per game per user
  private readonly TOTAL_DAILY_SC_LIMIT = 2.5; // Max 2.5 SC total per day across all mini games

  static getInstance(): MiniGamesService {
    if (!MiniGamesService.instance) {
      MiniGamesService.instance = new MiniGamesService();
    }
    return MiniGamesService.instance;
  }

  constructor() {
    this.initializeGameConfigs();
    this.startCleanupTimer();
  }

  private initializeGameConfigs() {
    const configs: MiniGameConfig[] = [
      {
        id: "wheel-fortune",
        name: "Wheel of Fortune",
        description: "Spin the wheel to win instant SC!",
        category: "luck",
        difficulty: "easy",
        maxReward: 0.25,
        minReward: 0.01,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "lucky-dice",
        name: "Lucky Dice",
        description: "Roll the dice and match the target!",
        category: "luck",
        difficulty: "easy",
        maxReward: 0.25,
        minReward: 0.01,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "memory-match",
        name: "Memory Match",
        description: "Match the card pairs to win!",
        category: "skill",
        difficulty: "medium",
        maxReward: 0.25,
        minReward: 0.05,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "number-guesser",
        name: "Number Guesser",
        description: "Guess the mystery number!",
        category: "skill",
        difficulty: "medium",
        maxReward: 0.25,
        minReward: 0.03,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "color-sequence",
        name: "Color Sequence",
        description: "Remember and repeat the color pattern!",
        category: "skill",
        difficulty: "hard",
        maxReward: 0.25,
        minReward: 0.1,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "fruit-slash",
        name: "Fruit Slash",
        description: "Slash the fruits and avoid the bombs!",
        category: "skill",
        difficulty: "medium",
        maxReward: 0.25,
        minReward: 0.05,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "scratch-win",
        name: "Scratch & Win",
        description: "Scratch off the panels to reveal prizes!",
        category: "luck",
        difficulty: "easy",
        maxReward: 0.25,
        minReward: 0.01,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "coin-flip",
        name: "Coin Flip",
        description: "Call heads or tails!",
        category: "luck",
        difficulty: "easy",
        maxReward: 0.25,
        minReward: 0.02,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "pattern-puzzle",
        name: "Pattern Puzzle",
        description: "Complete the pattern to win!",
        category: "puzzle",
        difficulty: "hard",
        maxReward: 0.25,
        minReward: 0.08,
        cooldownHours: 24,
        isActive: true,
      },
      {
        id: "lightning-rounds",
        name: "Lightning Rounds",
        description: "Quick-fire mini challenges!",
        category: "skill",
        difficulty: "medium",
        maxReward: 0.25,
        minReward: 0.05,
        cooldownHours: 24,
        isActive: true,
      },
    ];

    configs.forEach((config) => {
      this.gameConfigs.set(config.id, config);
    });
  }

  private startCleanupTimer() {
    // Clean up old sessions and reset daily limits at midnight
    setInterval(() => {
      this.cleanupOldSessions();
      this.resetDailyLimitsIfNeeded();
    }, 60000); // Check every minute
  }

  private cleanupOldSessions() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    for (const [userId, sessions] of this.userSessions.entries()) {
      const recentSessions = sessions.filter(
        (session) => session.startTime >= sevenDaysAgo,
      );
      this.userSessions.set(userId, recentSessions);
    }
  }

  private resetDailyLimitsIfNeeded() {
    const today = new Date().toDateString();

    for (const [userId, limits] of this.dailyLimits.entries()) {
      if (limits.date !== today) {
        // Reset daily limits for new day
        this.dailyLimits.set(userId, {
          userId,
          date: today,
          gamesPlayed: new Map(),
          totalSCEarned: 0,
          lastReset: new Date(),
        });
      }
    }
  }

  private getDailyLimits(userId: string): DailyGameLimits {
    const today = new Date().toDateString();
    let limits = this.dailyLimits.get(userId);

    if (!limits || limits.date !== today) {
      limits = {
        userId,
        date: today,
        gamesPlayed: new Map(),
        totalSCEarned: 0,
        lastReset: new Date(),
      };
      this.dailyLimits.set(userId, limits);
    }

    return limits;
  }

  canPlayGame(
    userId: string,
    gameId: string,
  ): { canPlay: boolean; reason?: string; cooldownRemaining?: number } {
    const config = this.gameConfigs.get(gameId);
    if (!config) {
      return { canPlay: false, reason: "Game not found" };
    }

    if (!config.isActive) {
      return { canPlay: false, reason: "Game is currently disabled" };
    }

    // Check daily limits
    const dailyLimits = this.getDailyLimits(userId);

    // Check if user has already played this specific game today
    const gamesPlayedToday = dailyLimits.gamesPlayed.get(gameId) || 0;
    if (gamesPlayedToday >= 1) {
      return {
        canPlay: false,
        reason: "You can only play each mini game once per day",
      };
    }

    // Check total daily SC limit across all mini games
    if (dailyLimits.totalSCEarned >= this.TOTAL_DAILY_SC_LIMIT) {
      return {
        canPlay: false,
        reason: `Daily SC limit reached (${this.TOTAL_DAILY_SC_LIMIT} SC max per day from mini games)`,
      };
    }

    // Check cooldown period
    const userSessions = this.userSessions.get(userId) || [];
    const lastSession = userSessions
      .filter((session) => session.gameId === gameId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];

    if (lastSession) {
      const cooldownEnd = new Date(
        lastSession.startTime.getTime() + config.cooldownHours * 60 * 60 * 1000,
      );
      const now = new Date();

      if (cooldownEnd > now) {
        const remainingMs = cooldownEnd.getTime() - now.getTime();
        return {
          canPlay: false,
          reason: `Cooldown active. Try again in ${Math.ceil(remainingMs / (1000 * 60 * 60))} hours`,
          cooldownRemaining: remainingMs,
        };
      }
    }

    return { canPlay: true };
  }

  async playGame(
    userId: string,
    gameId: string,
  ): Promise<{
    success: boolean;
    reward: number;
    session: GameSession | null;
    error?: string;
  }> {
    const canPlayResult = this.canPlayGame(userId, gameId);
    if (!canPlayResult.canPlay) {
      return {
        success: false,
        reward: 0,
        session: null,
        error: canPlayResult.reason,
      };
    }

    const config = this.gameConfigs.get(gameId);
    if (!config) {
      return {
        success: false,
        reward: 0,
        session: null,
        error: "Game configuration not found",
      };
    }

    // Calculate reward based on game type and difficulty
    const baseReward = this.calculateGameReward(config);
    const success = this.determineGameSuccess(config);
    const finalReward = success ? baseReward : 0;

    // Ensure reward doesn't exceed daily limit per game
    const actualReward = Math.min(finalReward, this.DAILY_SC_LIMIT);

    // Create game session
    const session: GameSession = {
      userId,
      gameId,
      startTime: new Date(),
      endTime: new Date(),
      scAwarded: actualReward,
      success,
      multiplier: success ? 1.0 : 0,
      bonus: false,
    };

    // Record session
    if (!this.userSessions.has(userId)) {
      this.userSessions.set(userId, []);
    }
    this.userSessions.get(userId)!.push(session);

    // Update daily limits
    const dailyLimits = this.getDailyLimits(userId);
    dailyLimits.gamesPlayed.set(
      gameId,
      (dailyLimits.gamesPlayed.get(gameId) || 0) + 1,
    );
    dailyLimits.totalSCEarned += actualReward;

    return {
      success,
      reward: actualReward,
      session,
    };
  }

  private calculateGameReward(config: MiniGameConfig): number {
    // Base reward calculation with some randomness
    const range = config.maxReward - config.minReward;
    const randomFactor = Math.random();

    // Skill-based games have slightly higher average rewards
    const skillMultiplier = config.category === "skill" ? 1.1 : 1.0;
    const difficultyMultiplier =
      config.difficulty === "hard"
        ? 1.2
        : config.difficulty === "medium"
          ? 1.1
          : 1.0;

    const baseReward = config.minReward + range * randomFactor;
    const adjustedReward = baseReward * skillMultiplier * difficultyMultiplier;

    // Ensure it doesn't exceed the per-game daily limit
    return Math.min(adjustedReward, this.DAILY_SC_LIMIT);
  }

  private determineGameSuccess(config: MiniGameConfig): boolean {
    // Success rate based on game difficulty and type
    let successRate = 0.7; // Base 70% success rate

    switch (config.difficulty) {
      case "easy":
        successRate = 0.8;
        break;
      case "medium":
        successRate = 0.6;
        break;
      case "hard":
        successRate = 0.4;
        break;
    }

    return Math.random() < successRate;
  }

  getUserGameHistory(
    userId: string,
    gameId?: string,
    limit: number = 20,
  ): GameSession[] {
    const sessions = this.userSessions.get(userId) || [];
    const filtered = gameId
      ? sessions.filter((s) => s.gameId === gameId)
      : sessions;

    return filtered
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  getUserDailyStats(userId: string): {
    gamesPlayedToday: number;
    scEarnedToday: number;
    remainingDailyLimit: number;
    availableGames: string[];
  } {
    const dailyLimits = this.getDailyLimits(userId);
    const gamesPlayedToday = Array.from(
      dailyLimits.gamesPlayed.values(),
    ).reduce((sum, count) => sum + count, 0);

    // Find games that can still be played today
    const availableGames: string[] = [];
    for (const [gameId, config] of this.gameConfigs.entries()) {
      const canPlay = this.canPlayGame(userId, gameId);
      if (canPlay.canPlay) {
        availableGames.push(gameId);
      }
    }

    return {
      gamesPlayedToday,
      scEarnedToday: dailyLimits.totalSCEarned,
      remainingDailyLimit: Math.max(
        0,
        this.TOTAL_DAILY_SC_LIMIT - dailyLimits.totalSCEarned,
      ),
      availableGames,
    };
  }

  getGameCooldowns(userId: string): CooldownInfo[] {
    const cooldowns: CooldownInfo[] = [];
    const now = new Date();

    for (const [gameId, config] of this.gameConfigs.entries()) {
      const userSessions = this.userSessions.get(userId) || [];
      const lastSession = userSessions
        .filter((session) => session.gameId === gameId)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];

      if (lastSession) {
        const cooldownEnd = new Date(
          lastSession.startTime.getTime() +
            config.cooldownHours * 60 * 60 * 1000,
        );
        const remainingCooldown = Math.max(
          0,
          cooldownEnd.getTime() - now.getTime(),
        );

        cooldowns.push({
          gameId,
          lastPlayed: lastSession.startTime,
          remainingCooldown,
          canPlay: remainingCooldown === 0,
        });
      } else {
        cooldowns.push({
          gameId,
          lastPlayed: new Date(0), // Never played
          remainingCooldown: 0,
          canPlay: true,
        });
      }
    }

    return cooldowns;
  }

  getAllGameConfigs(): MiniGameConfig[] {
    return Array.from(this.gameConfigs.values()).filter(
      (config) => config.isActive,
    );
  }

  getGameConfig(gameId: string): MiniGameConfig | undefined {
    return this.gameConfigs.get(gameId);
  }

  // Admin methods
  updateGameConfig(gameId: string, updates: Partial<MiniGameConfig>): boolean {
    const config = this.gameConfigs.get(gameId);
    if (!config) return false;

    const updatedConfig = { ...config, ...updates };
    this.gameConfigs.set(gameId, updatedConfig);
    return true;
  }

  getAdminStats(): {
    totalGamesPlayed: number;
    totalSCAwarded: number;
    activeUsers: number;
    averageSessionsPerUser: number;
    popularGames: { gameId: string; plays: number }[];
  } {
    let totalGamesPlayed = 0;
    let totalSCAwarded = 0;
    const gamePopularity = new Map<string, number>();

    for (const sessions of this.userSessions.values()) {
      totalGamesPlayed += sessions.length;
      totalSCAwarded += sessions.reduce(
        (sum, session) => sum + session.scAwarded,
        0,
      );

      sessions.forEach((session) => {
        gamePopularity.set(
          session.gameId,
          (gamePopularity.get(session.gameId) || 0) + 1,
        );
      });
    }

    const activeUsers = this.userSessions.size;
    const averageSessionsPerUser =
      activeUsers > 0 ? totalGamesPlayed / activeUsers : 0;

    const popularGames = Array.from(gamePopularity.entries())
      .map(([gameId, plays]) => ({ gameId, plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);

    return {
      totalGamesPlayed,
      totalSCAwarded,
      activeUsers,
      averageSessionsPerUser,
      popularGames,
    };
  }
}

export const miniGamesService = MiniGamesService.getInstance();
