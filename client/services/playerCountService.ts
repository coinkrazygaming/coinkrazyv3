export interface PlayerActivity {
  userId: string;
  username?: string;
  lastActivity: Date;
  currentGame?: string;
  isPlaying: boolean;
  sessionDuration: number; // in minutes
}

export interface PlayerStats {
  totalOnline: number;
  playingGames: number;
  browsing: number;
  peakToday: number;
  averageSessionTime: number;
}

class PlayerCountService {
  private static instance: PlayerCountService;
  private onlinePlayers: Map<string, PlayerActivity> = new Map();
  private listeners: Set<(count: number, stats: PlayerStats) => void> =
    new Set();
  private peakTodayCount: number = 0;
  private sessionStartTimes: Map<string, Date> = new Map();

  static getInstance(): PlayerCountService {
    if (!PlayerCountService.instance) {
      PlayerCountService.instance = new PlayerCountService();
    }
    return PlayerCountService.instance;
  }

  constructor() {
    this.initializeSimulatedPlayers();
    this.startActivitySimulation();
    this.startCleanupTimer();
  }

  private initializeSimulatedPlayers() {
    // Simulate some initial online players
    const initialPlayers = [
      { id: "player-001", username: "GoldRush23", game: "Sweet Bonanza" },
      { id: "player-002", username: "LuckySpinner", game: "Gates of Olympus" },
      { id: "player-003", username: "CasinoKing", game: "Book of Dead" },
      { id: "player-004", username: "SlotMaster", game: null },
      { id: "player-005", username: "BingoFan", game: "Bingo 75-Ball" },
      { id: "player-006", username: "PokerPro", game: "Texas Holdem" },
      { id: "player-007", username: "RouletteRed", game: "European Roulette" },
      { id: "coinkrazy00@gmail.com", username: "Admin", game: null },
    ];

    const now = new Date();
    initialPlayers.forEach((player, index) => {
      const sessionStart = new Date(
        now.getTime() - Math.random() * 120 * 60 * 1000,
      ); // 0-120 minutes ago

      this.onlinePlayers.set(player.id, {
        userId: player.id,
        username: player.username,
        lastActivity: new Date(now.getTime() - Math.random() * 5 * 60 * 1000), // 0-5 minutes ago
        currentGame: player.game || undefined,
        isPlaying: !!player.game,
        sessionDuration: Math.floor(
          (now.getTime() - sessionStart.getTime()) / (1000 * 60),
        ),
      });

      this.sessionStartTimes.set(player.id, sessionStart);
    });

    this.peakTodayCount =
      this.onlinePlayers.size + Math.floor(Math.random() * 20); // Peak was higher
    this.notifyListeners();
  }

  private startActivitySimulation() {
    // Simulate player activity every 10-30 seconds
    setInterval(
      () => {
        this.simulatePlayerActivity();
      },
      Math.random() * 20000 + 10000,
    );
  }

  private startCleanupTimer() {
    // Clean up inactive players every minute
    setInterval(() => {
      this.cleanupInactivePlayers();
    }, 60000);
  }

  private simulatePlayerActivity() {
    const actions = ["join", "leave", "game_switch", "activity_update"];

    const action = actions[Math.floor(Math.random() * actions.length)];

    switch (action) {
      case "join":
        this.simulatePlayerJoin();
        break;
      case "leave":
        this.simulatePlayerLeave();
        break;
      case "game_switch":
        this.simulateGameSwitch();
        break;
      case "activity_update":
        this.simulateActivityUpdate();
        break;
    }
  }

  private simulatePlayerJoin() {
    // Don't add too many players at once
    if (this.onlinePlayers.size >= 50) return;

    const newUserId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const usernames = [
      "SpinWinner",
      "LuckyStrike",
      "JackpotHunter",
      "GoldSeeker",
      "SlotFan",
      "BingoStar",
      "PokerAce",
      "RouletteKing",
      "CasinoChamp",
      "MegaWin",
      "DiamondPlayer",
      "VegasVibes",
      "FortuneSeeker",
      "WildSpinner",
      "BonusHunter",
    ];

    const games = [
      "Sweet Bonanza",
      "Gates of Olympus",
      "Book of Dead",
      "Starburst",
      "Gonzo's Quest",
      "Bonanza",
      "Reactoonz",
      "Big Bad Wolf",
      "Bingo 75-Ball",
      "Bingo 90-Ball",
      "Texas Holdem",
      "Blackjack",
      "European Roulette",
      "American Roulette",
      "Baccarat",
    ];

    const username =
      usernames[Math.floor(Math.random() * usernames.length)] +
      Math.floor(Math.random() * 999);
    const currentGame =
      Math.random() > 0.3
        ? games[Math.floor(Math.random() * games.length)]
        : undefined;

    const now = new Date();
    this.onlinePlayers.set(newUserId, {
      userId: newUserId,
      username,
      lastActivity: now,
      currentGame,
      isPlaying: !!currentGame,
      sessionDuration: 0,
    });

    this.sessionStartTimes.set(newUserId, now);
    this.updatePeakCount();
    this.notifyListeners();
  }

  private simulatePlayerLeave() {
    if (this.onlinePlayers.size <= 1) return; // Keep at least one player

    const playerIds = Array.from(this.onlinePlayers.keys());
    // Don't remove admin or key players
    const removableIds = playerIds.filter(
      (id) => !id.includes("coinkrazy") && !id.includes("player-00"),
    );

    if (removableIds.length === 0) return;

    const randomId =
      removableIds[Math.floor(Math.random() * removableIds.length)];
    this.onlinePlayers.delete(randomId);
    this.sessionStartTimes.delete(randomId);
    this.notifyListeners();
  }

  private simulateGameSwitch() {
    const playerIds = Array.from(this.onlinePlayers.keys());
    if (playerIds.length === 0) return;

    const randomId = playerIds[Math.floor(Math.random() * playerIds.length)];
    const player = this.onlinePlayers.get(randomId);
    if (!player) return;

    const games = [
      "Sweet Bonanza",
      "Gates of Olympus",
      "Book of Dead",
      "Starburst",
      "Gonzo's Quest",
      "Bonanza",
      "Reactoonz",
      "Big Bad Wolf",
      "Bingo 75-Ball",
      "Bingo 90-Ball",
      "Texas Holdem",
      "Blackjack",
      "European Roulette",
      "American Roulette",
      "Baccarat",
    ];

    // 70% chance to switch to a game, 30% chance to stop playing
    const newGame =
      Math.random() > 0.3
        ? games[Math.floor(Math.random() * games.length)]
        : undefined;

    player.currentGame = newGame;
    player.isPlaying = !!newGame;
    player.lastActivity = new Date();

    this.notifyListeners();
  }

  private simulateActivityUpdate() {
    // Update random players' last activity
    const playerIds = Array.from(this.onlinePlayers.keys());
    const updateCount = Math.min(3, playerIds.length);

    for (let i = 0; i < updateCount; i++) {
      const randomId = playerIds[Math.floor(Math.random() * playerIds.length)];
      const player = this.onlinePlayers.get(randomId);
      if (player) {
        player.lastActivity = new Date();

        // Update session duration
        const sessionStart = this.sessionStartTimes.get(randomId);
        if (sessionStart) {
          player.sessionDuration = Math.floor(
            (Date.now() - sessionStart.getTime()) / (1000 * 60),
          );
        }
      }
    }

    this.notifyListeners();
  }

  private cleanupInactivePlayers() {
    const now = new Date();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minutes

    const toRemove: string[] = [];

    this.onlinePlayers.forEach((player, userId) => {
      // Don't remove admin or core players
      if (userId.includes("coinkrazy") || userId.includes("player-00")) {
        // Update admin activity to keep them active
        player.lastActivity = now;
        return;
      }

      if (now.getTime() - player.lastActivity.getTime() > inactiveThreshold) {
        toRemove.push(userId);
      }
    });

    toRemove.forEach((userId) => {
      this.onlinePlayers.delete(userId);
      this.sessionStartTimes.delete(userId);
    });

    if (toRemove.length > 0) {
      this.notifyListeners();
    }
  }

  private updatePeakCount() {
    const currentCount = this.onlinePlayers.size;
    if (currentCount > this.peakTodayCount) {
      this.peakTodayCount = currentCount;
    }
  }

  private notifyListeners() {
    const stats = this.getPlayerStats();
    this.listeners.forEach((callback) => {
      callback(this.onlinePlayers.size, stats);
    });
  }

  // Public methods
  getPlayerCount(): number {
    return this.onlinePlayers.size;
  }

  getOnlinePlayers(): PlayerActivity[] {
    return Array.from(this.onlinePlayers.values()).sort(
      (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime(),
    );
  }

  getPlayerStats(): PlayerStats {
    const players = Array.from(this.onlinePlayers.values());
    const playingGames = players.filter((p) => p.isPlaying).length;
    const browsing = players.length - playingGames;

    const totalSessionTime = players.reduce(
      (sum, player) => sum + player.sessionDuration,
      0,
    );
    const averageSessionTime =
      players.length > 0 ? totalSessionTime / players.length : 0;

    return {
      totalOnline: players.length,
      playingGames,
      browsing,
      peakToday: this.peakTodayCount,
      averageSessionTime: Math.round(averageSessionTime),
    };
  }

  subscribeToPlayerCount(
    callback: (count: number, stats: PlayerStats) => void,
  ): () => void {
    this.listeners.add(callback);

    // Immediately call with current data
    const stats = this.getPlayerStats();
    callback(this.onlinePlayers.size, stats);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Simulate player joining (for testing)
  addPlayer(userId: string, username?: string): void {
    const now = new Date();
    this.onlinePlayers.set(userId, {
      userId,
      username: username || `Player${Math.floor(Math.random() * 9999)}`,
      lastActivity: now,
      currentGame: undefined,
      isPlaying: false,
      sessionDuration: 0,
    });

    this.sessionStartTimes.set(userId, now);
    this.updatePeakCount();
    this.notifyListeners();
  }

  // Remove player (for testing)
  removePlayer(userId: string): void {
    this.onlinePlayers.delete(userId);
    this.sessionStartTimes.delete(userId);
    this.notifyListeners();
  }

  // Update player activity
  updatePlayerActivity(userId: string, game?: string): void {
    const player = this.onlinePlayers.get(userId);
    if (player) {
      player.lastActivity = new Date();
      if (game !== undefined) {
        player.currentGame = game;
        player.isPlaying = !!game;
      }

      // Update session duration
      const sessionStart = this.sessionStartTimes.get(userId);
      if (sessionStart) {
        player.sessionDuration = Math.floor(
          (Date.now() - sessionStart.getTime()) / (1000 * 60),
        );
      }

      this.notifyListeners();
    }
  }
}

export const playerCountService = PlayerCountService.getInstance();
