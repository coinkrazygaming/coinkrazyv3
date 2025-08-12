import { io, Socket } from "socket.io-client";

// Live Games Types
export interface LiveGame {
  id: string;
  name: string;
  type: LiveGameType;
  status: LiveGameStatus;
  dealer: LiveDealer;
  table: LiveTable;
  players: LivePlayer[];
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  streamUrl: string;
  chatEnabled: boolean;
  quality: StreamQuality[];
  language: string;
  features: LiveGameFeature[];
  gameHistory: LiveGameResult[];
  currentRound?: LiveGameRound;
  statistics: LiveGameStats;
  isVIP: boolean;
  thumbnail?: string;
  category: "featured" | "new" | "popular" | "vip" | "standard";
}

export interface LiveDealer {
  id: string;
  name: string;
  avatar: string;
  language: string;
  rating: number;
  experience: number; // years
  specialties: LiveGameType[];
  isOnline: boolean;
  shift: {
    start: string;
    end: string;
  };
  stats: {
    gamesDealt: number;
    averageRating: number;
    playerFavorites: number;
  };
}

export interface LiveTable {
  id: string;
  name: string;
  design: string;
  cameraAngles: CameraAngle[];
  lighting: "bright" | "ambient" | "dramatic";
  background: string;
  seatConfiguration: SeatPosition[];
}

export interface LivePlayer {
  id: string;
  username: string;
  avatar?: string;
  seat: number;
  chipCount: number;
  currentBet: number;
  isActive: boolean;
  isConnected: boolean;
  timeToAct?: number;
  isVIP: boolean;
  countryCode?: string;
  joinedAt: Date;
}

export interface LiveGameRound {
  id: string;
  roundNumber: number;
  startTime: Date;
  endTime?: Date;
  phase: string;
  gameData: any; // Game-specific data
  bets: LiveBet[];
  results?: LiveGameResult;
}

export interface LiveBet {
  id: string;
  playerId: string;
  amount: number;
  type: string;
  options: any; // Bet-specific options
  timestamp: Date;
  status: "pending" | "won" | "lost" | "void";
  payout?: number;
}

export interface LiveGameResult {
  id: string;
  gameId: string;
  roundId: string;
  timestamp: Date;
  outcome: any; // Game-specific outcome
  winningBets: string[];
  totalPayout: number;
  dealerActions?: string[];
}

export interface LiveGameStats {
  totalRounds: number;
  totalBets: number;
  totalPayout: number;
  averageRoundTime: number;
  playerRetention: number;
  popularBetTypes: Record<string, number>;
  recentResults: any[];
}

export interface CameraAngle {
  id: string;
  name: string;
  description: string;
  position: "overhead" | "side" | "close-up" | "wide" | "cards" | "wheel";
  isDefault: boolean;
}

export interface SeatPosition {
  seatNumber: number;
  position: { x: number; y: number };
  isAvailable: boolean;
  isVIP: boolean;
}

export interface StreamQuality {
  resolution: string;
  bitrate: number;
  fps: number;
  label: string;
}

export interface LiveChatMessage {
  id: string;
  gameId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "player" | "dealer" | "system" | "moderator";
  isPrivate?: boolean;
  targetPlayer?: string;
  emoji?: boolean;
  language?: string;
}

export interface LiveGameTournament {
  id: string;
  name: string;
  gameType: LiveGameType;
  status: "upcoming" | "registration" | "active" | "finished";
  startTime: Date;
  endTime: Date;
  buyIn: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  rounds: LiveTournamentRound[];
  leaderboard: LiveTournamentPlayer[];
  rules: string;
  dealer: LiveDealer;
}

export interface LiveTournamentRound {
  roundNumber: number;
  startTime: Date;
  duration: number;
  gameId: string;
  participants: string[];
  eliminated: string[];
  advancing: string[];
}

export interface LiveTournamentPlayer {
  playerId: string;
  username: string;
  score: number;
  position: number;
  isEliminated: boolean;
  prize?: number;
}

export interface LiveGamePromotion {
  id: string;
  title: string;
  description: string;
  gameTypes: LiveGameType[];
  type: "cashback" | "bonus" | "free_spins" | "multiplier" | "insurance";
  value: number;
  validUntil: Date;
  minBet: number;
  maxBenefit: number;
  isActive: boolean;
  gameIds?: string[];
}

// Enums
export type LiveGameType =
  | "live-blackjack"
  | "live-roulette"
  | "live-baccarat"
  | "live-poker"
  | "live-craps"
  | "live-sic-bo"
  | "live-dragon-tiger"
  | "live-andar-bahar"
  | "live-teen-patti"
  | "live-wheel"
  | "live-lottery";

export type LiveGameStatus =
  | "preparing"
  | "active"
  | "break"
  | "maintenance"
  | "offline";

export type LiveGameFeature =
  | "multi-camera"
  | "side-bets"
  | "statistics"
  | "chat"
  | "tips"
  | "replay"
  | "multi-table"
  | "mobile-optimized"
  | "hd-streaming"
  | "4k-streaming";

class LiveGamesService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private liveGames: Map<string, LiveGame> = new Map();
  private dealers: Map<string, LiveDealer> = new Map();
  private tournaments: Map<string, LiveGameTournament> = new Map();
  private promotions: LiveGamePromotion[] = [];
  private chatHistory: Map<string, LiveChatMessage[]> = new Map();
  private currentGameId: string | null = null;
  private streamQuality: StreamQuality | null = null;
  private audioEnabled = true;
  private chatEnabled = true;
  private currentCameraAngle: string | null = null;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    if (process.env.NODE_ENV === "development") {
      this.loadMockData();
      this.simulateRealTimeUpdates();
    } else {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    if (typeof window === "undefined") return;

    try {
      this.socket = io(
        process.env.VITE_WEBSOCKET_URL || "ws://localhost:3001",
        {
          path: "/live-games",
          transports: ["websocket", "polling"],
          timeout: 20000,
          retries: 3,
        },
      );

      this.setupSocketListeners();
    } catch (error) {
      console.warn(
        "Live Games WebSocket initialization failed, using mock data:",
        error,
      );
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Live Games service connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Live Games service disconnected");
      this.handleReconnection();
    });

    this.socket.on("game_update", (game: LiveGame) => {
      this.liveGames.set(game.id, game);
    });

    this.socket.on("dealer_update", (dealer: LiveDealer) => {
      this.dealers.set(dealer.id, dealer);
    });

    this.socket.on(
      "round_start",
      (data: { gameId: string; round: LiveGameRound }) => {
        const game = this.liveGames.get(data.gameId);
        if (game) {
          game.currentRound = data.round;
        }
      },
    );

    this.socket.on(
      "round_end",
      (data: { gameId: string; result: LiveGameResult }) => {
        const game = this.liveGames.get(data.gameId);
        if (game) {
          game.gameHistory.unshift(data.result);
          game.gameHistory = game.gameHistory.slice(0, 50);
          game.currentRound = undefined;
        }
      },
    );

    this.socket.on("bet_placed", (data: { gameId: string; bet: LiveBet }) => {
      const game = this.liveGames.get(data.gameId);
      if (game && game.currentRound) {
        game.currentRound.bets.push(data.bet);
      }
    });

    this.socket.on("chat_message", (message: LiveChatMessage) => {
      const history = this.chatHistory.get(message.gameId) || [];
      history.push(message);
      this.chatHistory.set(message.gameId, history.slice(-200));
    });

    this.socket.on(
      "player_joined",
      (data: { gameId: string; player: LivePlayer }) => {
        const game = this.liveGames.get(data.gameId);
        if (game) {
          const existingPlayerIndex = game.players.findIndex(
            (p) => p.id === data.player.id,
          );
          if (existingPlayerIndex !== -1) {
            game.players[existingPlayerIndex] = data.player;
          } else {
            game.players.push(data.player);
          }
        }
      },
    );

    this.socket.on(
      "player_left",
      (data: { gameId: string; playerId: string }) => {
        const game = this.liveGames.get(data.gameId);
        if (game) {
          game.players = game.players.filter((p) => p.id !== data.playerId);
        }
      },
    );

    this.socket.on(
      "stream_quality_changed",
      (data: { gameId: string; quality: StreamQuality }) => {
        if (data.gameId === this.currentGameId) {
          this.streamQuality = data.quality;
        }
      },
    );

    this.socket.on(
      "dealer_action",
      (data: { gameId: string; action: string; timestamp: Date }) => {
        // Handle dealer actions like dealing cards, spinning wheel, etc.
      },
    );

    this.socket.on("tournament_update", (tournament: LiveGameTournament) => {
      this.tournaments.set(tournament.id, tournament);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(
        () => {
          console.log(
            `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
          );
          this.initializeWebSocket();
        },
        Math.pow(2, this.reconnectAttempts) * 1000,
      );
    } else {
      console.warn(
        "Max reconnection attempts reached, switching to offline mode",
      );
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private loadMockData() {
    // Load mock dealers
    const mockDealers: LiveDealer[] = [
      {
        id: "dealer-sarah",
        name: "Sarah Williams",
        avatar: "/avatars/dealer-sarah.jpg",
        language: "English",
        rating: 4.9,
        experience: 5,
        specialties: ["live-blackjack", "live-poker"],
        isOnline: true,
        shift: { start: "14:00", end: "22:00" },
        stats: {
          gamesDealt: 2847,
          averageRating: 4.9,
          playerFavorites: 156,
        },
      },
      {
        id: "dealer-marco",
        name: "Marco Rodriguez",
        avatar: "/avatars/dealer-marco.jpg",
        language: "Spanish",
        rating: 4.8,
        experience: 7,
        specialties: ["live-roulette", "live-baccarat"],
        isOnline: true,
        shift: { start: "18:00", end: "02:00" },
        stats: {
          gamesDealt: 3421,
          averageRating: 4.8,
          playerFavorites: 203,
        },
      },
      {
        id: "dealer-yuki",
        name: "Yuki Tanaka",
        avatar: "/avatars/dealer-yuki.jpg",
        language: "Japanese",
        rating: 4.9,
        experience: 4,
        specialties: ["live-baccarat", "live-sic-bo"],
        isOnline: true,
        shift: { start: "22:00", end: "06:00" },
        stats: {
          gamesDealt: 1876,
          averageRating: 4.9,
          playerFavorites: 134,
        },
      },
    ];

    mockDealers.forEach((dealer) => this.dealers.set(dealer.id, dealer));

    // Load mock live games
    const mockGames: LiveGame[] = [
      {
        id: "live-blackjack-vip-1",
        name: "VIP Blackjack - Table 1",
        type: "live-blackjack",
        status: "active",
        dealer: mockDealers[0],
        table: {
          id: "table-vip-1",
          name: "VIP Gold Table",
          design: "luxury-gold",
          cameraAngles: [
            {
              id: "main",
              name: "Main View",
              description: "Standard table view",
              position: "wide",
              isDefault: true,
            },
            {
              id: "cards",
              name: "Cards Close-up",
              description: "Close view of cards",
              position: "close-up",
              isDefault: false,
            },
            {
              id: "dealer",
              name: "Dealer View",
              description: "Focus on dealer",
              position: "side",
              isDefault: false,
            },
          ],
          lighting: "dramatic",
          background: "luxury-casino",
          seatConfiguration: Array.from({ length: 7 }, (_, i) => ({
            seatNumber: i + 1,
            position: { x: i * 100 + 50, y: 300 },
            isAvailable: i > 4,
            isVIP: true,
          })),
        },
        players: this.generateMockPlayers(5),
        maxPlayers: 7,
        minBet: 100,
        maxBet: 10000,
        streamUrl: "https://stream.example.com/live-blackjack-vip-1",
        chatEnabled: true,
        quality: [
          { resolution: "1920x1080", bitrate: 8000, fps: 60, label: "HD" },
          { resolution: "1280x720", bitrate: 4000, fps: 30, label: "Standard" },
          { resolution: "854x480", bitrate: 2000, fps: 30, label: "Mobile" },
        ],
        language: "English",
        features: [
          "multi-camera",
          "side-bets",
          "statistics",
          "chat",
          "hd-streaming",
        ],
        gameHistory: this.generateMockGameHistory("live-blackjack-vip-1", 20),
        currentRound: {
          id: "round-" + Date.now(),
          roundNumber: 1247,
          startTime: new Date(),
          phase: "betting",
          gameData: {},
          bets: [],
        },
        statistics: {
          totalRounds: 1246,
          totalBets: 8934,
          totalPayout: 456789,
          averageRoundTime: 120,
          playerRetention: 87.3,
          popularBetTypes: { main: 4567, insurance: 234, "side-bet": 890 },
          recentResults: [],
        },
        isVIP: true,
        category: "vip",
      },
      {
        id: "live-roulette-euro-1",
        name: "European Roulette - Classic",
        type: "live-roulette",
        status: "active",
        dealer: mockDealers[1],
        table: {
          id: "table-euro-1",
          name: "European Classic",
          design: "classic-green",
          cameraAngles: [
            {
              id: "wheel",
              name: "Wheel View",
              description: "Focus on roulette wheel",
              position: "overhead",
              isDefault: true,
            },
            {
              id: "table",
              name: "Table View",
              description: "Betting table view",
              position: "wide",
              isDefault: false,
            },
            {
              id: "dealer",
              name: "Dealer View",
              description: "Focus on dealer",
              position: "side",
              isDefault: false,
            },
          ],
          lighting: "bright",
          background: "classic-casino",
          seatConfiguration: Array.from({ length: 12 }, (_, i) => ({
            seatNumber: i + 1,
            position: {
              x: (i % 4) * 100 + 50,
              y: Math.floor(i / 4) * 100 + 50,
            },
            isAvailable: i > 7,
            isVIP: false,
          })),
        },
        players: this.generateMockPlayers(8),
        maxPlayers: 12,
        minBet: 10,
        maxBet: 5000,
        streamUrl: "https://stream.example.com/live-roulette-euro-1",
        chatEnabled: true,
        quality: [
          { resolution: "1920x1080", bitrate: 6000, fps: 30, label: "HD" },
          { resolution: "1280x720", bitrate: 3000, fps: 30, label: "Standard" },
        ],
        language: "English",
        features: ["multi-camera", "statistics", "chat", "replay"],
        gameHistory: this.generateMockGameHistory("live-roulette-euro-1", 15),
        currentRound: {
          id: "round-" + Date.now(),
          roundNumber: 892,
          startTime: new Date(),
          phase: "spinning",
          gameData: { lastNumber: 17, recentNumbers: [17, 23, 8, 34, 15] },
          bets: [],
        },
        statistics: {
          totalRounds: 891,
          totalBets: 5678,
          totalPayout: 234567,
          averageRoundTime: 90,
          playerRetention: 82.1,
          popularBetTypes: {
            straight: 1234,
            "red-black": 2890,
            "odd-even": 1554,
          },
          recentResults: [17, 23, 8, 34, 15, 29, 7, 22, 18, 31],
        },
        isVIP: false,
        category: "featured",
      },
      {
        id: "live-baccarat-vip-1",
        name: "VIP Baccarat - Dragon",
        type: "live-baccarat",
        status: "active",
        dealer: mockDealers[2],
        table: {
          id: "table-baccarat-vip",
          name: "Dragon VIP Table",
          design: "oriental-dragon",
          cameraAngles: [
            {
              id: "main",
              name: "Main View",
              description: "Full table view",
              position: "wide",
              isDefault: true,
            },
            {
              id: "cards",
              name: "Cards View",
              description: "Close-up of cards",
              position: "close-up",
              isDefault: false,
            },
            {
              id: "squeeze",
              name: "Card Squeeze",
              description: "Dramatic card reveal",
              position: "cards",
              isDefault: false,
            },
          ],
          lighting: "ambient",
          background: "oriental-luxury",
          seatConfiguration: Array.from({ length: 8 }, (_, i) => ({
            seatNumber: i + 1,
            position: { x: i * 100 + 50, y: 200 },
            isAvailable: i > 5,
            isVIP: true,
          })),
        },
        players: this.generateMockPlayers(6),
        maxPlayers: 8,
        minBet: 250,
        maxBet: 25000,
        streamUrl: "https://stream.example.com/live-baccarat-vip-1",
        chatEnabled: true,
        quality: [
          { resolution: "3840x2160", bitrate: 15000, fps: 60, label: "4K" },
          { resolution: "1920x1080", bitrate: 8000, fps: 60, label: "HD" },
        ],
        language: "Japanese",
        features: [
          "multi-camera",
          "side-bets",
          "statistics",
          "chat",
          "4k-streaming",
        ],
        gameHistory: this.generateMockGameHistory("live-baccarat-vip-1", 25),
        currentRound: {
          id: "round-" + Date.now(),
          roundNumber: 534,
          startTime: new Date(),
          phase: "dealing",
          gameData: { playerScore: 5, bankerScore: 6 },
          bets: [],
        },
        statistics: {
          totalRounds: 533,
          totalBets: 3421,
          totalPayout: 567890,
          averageRoundTime: 180,
          playerRetention: 91.7,
          popularBetTypes: { player: 1456, banker: 1678, tie: 287 },
          recentResults: [],
        },
        isVIP: true,
        category: "vip",
      },
      {
        id: "live-wheel-fortune",
        name: "Wheel of Fortune - Mega",
        type: "live-wheel",
        status: "active",
        dealer: mockDealers[0],
        table: {
          id: "table-wheel-1",
          name: "Mega Fortune Wheel",
          design: "colorful-neon",
          cameraAngles: [
            {
              id: "wheel",
              name: "Wheel View",
              description: "Giant wheel close-up",
              position: "overhead",
              isDefault: true,
            },
            {
              id: "host",
              name: "Host View",
              description: "Focus on game host",
              position: "side",
              isDefault: false,
            },
          ],
          lighting: "dramatic",
          background: "game-show",
          seatConfiguration: [],
        },
        players: this.generateMockPlayers(24),
        maxPlayers: 50,
        minBet: 5,
        maxBet: 1000,
        streamUrl: "https://stream.example.com/live-wheel-fortune",
        chatEnabled: true,
        quality: [
          { resolution: "1920x1080", bitrate: 6000, fps: 30, label: "HD" },
        ],
        language: "English",
        features: ["statistics", "chat", "mobile-optimized"],
        gameHistory: this.generateMockGameHistory("live-wheel-fortune", 30),
        currentRound: {
          id: "round-" + Date.now(),
          roundNumber: 267,
          startTime: new Date(),
          phase: "betting",
          gameData: {
            segments: [1, 2, 5, 10, 20, 40],
            multipliers: ["2x", "5x", "10x"],
          },
          bets: [],
        },
        statistics: {
          totalRounds: 266,
          totalBets: 12456,
          totalPayout: 345678,
          averageRoundTime: 60,
          playerRetention: 76.8,
          popularBetTypes: { "1": 5678, "2": 3456, "5": 2134, "10": 1088 },
          recentResults: [],
        },
        isVIP: false,
        category: "popular",
      },
    ];

    mockGames.forEach((game) => this.liveGames.set(game.id, game));

    // Load mock tournaments
    const mockTournaments: LiveGameTournament[] = [
      {
        id: "live-blackjack-tournament",
        name: "Live Blackjack Championship",
        gameType: "live-blackjack",
        status: "registration",
        startTime: new Date(Date.now() + 3600000), // 1 hour
        endTime: new Date(Date.now() + 7200000), // 2 hours
        buyIn: 500,
        prizePool: 25000,
        maxParticipants: 64,
        currentParticipants: 47,
        rounds: [],
        leaderboard: [],
        rules:
          "Standard blackjack rules. Tournament format with elimination rounds.",
        dealer: mockDealers[0],
      },
    ];

    mockTournaments.forEach((tournament) =>
      this.tournaments.set(tournament.id, tournament),
    );

    // Load mock promotions
    this.promotions = [
      {
        id: "live-games-welcome",
        title: "Live Games Welcome Bonus",
        description: "Get 25% cashback on your first live game session",
        gameTypes: ["live-blackjack", "live-roulette", "live-baccarat"],
        type: "cashback",
        value: 0.25,
        validUntil: new Date(Date.now() + 604800000), // 1 week
        minBet: 25,
        maxBenefit: 250,
        isActive: true,
      },
      {
        id: "vip-live-bonus",
        title: "VIP Live Games Multiplier",
        description: "VIP players get 2x rewards on all live games",
        gameTypes: [
          "live-blackjack",
          "live-roulette",
          "live-baccarat",
          "live-poker",
        ],
        type: "multiplier",
        value: 2.0,
        validUntil: new Date(Date.now() + 2592000000), // 30 days
        minBet: 100,
        maxBenefit: 5000,
        isActive: true,
        gameIds: ["live-blackjack-vip-1", "live-baccarat-vip-1"],
      },
    ];

    // Generate mock chat history
    mockGames.forEach((game) => {
      this.chatHistory.set(game.id, this.generateMockChatHistory(game.id, 20));
    });
  }

  private generateMockPlayers(count: number): LivePlayer[] {
    const players: LivePlayer[] = [];
    const names = [
      "BlackjackPro",
      "RouletteKing",
      "BaccaratQueen",
      "HighRoller",
      "LuckyPlayer",
      "CardShark",
      "WheelMaster",
      "VegasVet",
    ];

    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        username: names[i] || `Player${i + 1}`,
        seat: i + 1,
        chipCount: Math.floor(Math.random() * 50000) + 5000,
        currentBet: Math.floor(Math.random() * 1000) + 25,
        isActive: Math.random() > 0.3,
        isConnected: Math.random() > 0.1,
        timeToAct:
          Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 5 : undefined,
        isVIP: Math.random() > 0.7,
        countryCode: ["US", "UK", "CA", "AU", "DE", "JP"][
          Math.floor(Math.random() * 6)
        ],
        joinedAt: new Date(Date.now() - Math.random() * 7200000), // Within last 2 hours
      });
    }

    return players;
  }

  private generateMockGameHistory(
    gameId: string,
    count: number,
  ): LiveGameResult[] {
    const results: LiveGameResult[] = [];

    for (let i = 0; i < count; i++) {
      results.push({
        id: `result-${gameId}-${i}`,
        gameId,
        roundId: `round-${gameId}-${i}`,
        timestamp: new Date(Date.now() - i * 120000), // 2 minutes apart
        outcome: this.generateMockOutcome(gameId),
        winningBets: [`bet-${i}-1`, `bet-${i}-2`],
        totalPayout: Math.floor(Math.random() * 10000) + 500,
        dealerActions: ["deal", "hit", "stand"],
      });
    }

    return results;
  }

  private generateMockOutcome(gameId: string): any {
    if (gameId.includes("blackjack")) {
      return {
        dealerHand: ["AS", "KH"],
        dealerTotal: 21,
        playerResults: [
          { hand: ["10C", "9D"], total: 19, result: "lose" },
          { hand: ["AH", "QS"], total: 21, result: "blackjack" },
        ],
      };
    } else if (gameId.includes("roulette")) {
      return {
        number: Math.floor(Math.random() * 37),
        color: Math.random() > 0.5 ? "red" : "black",
        odd: Math.random() > 0.5,
      };
    } else if (gameId.includes("baccarat")) {
      return {
        playerScore: Math.floor(Math.random() * 10),
        bankerScore: Math.floor(Math.random() * 10),
        winner: ["player", "banker", "tie"][Math.floor(Math.random() * 3)],
      };
    } else if (gameId.includes("wheel")) {
      return {
        segment: [1, 2, 5, 10, 20, 40][Math.floor(Math.random() * 6)],
        multiplier: ["1x", "2x", "5x", "10x"][Math.floor(Math.random() * 4)],
      };
    }
    return {};
  }

  private generateMockChatHistory(
    gameId: string,
    count: number,
  ): LiveChatMessage[] {
    const messages: LiveChatMessage[] = [];
    const sampleMessages = [
      "Good luck everyone!",
      "Hit me dealer!",
      "Let it ride!",
      "Great game!",
      "Nice win!",
      "Dealer has been hot today",
      "Going all in this round",
      "Chat from mobile is working great",
      "Love this table",
      "See you all tomorrow!",
    ];

    for (let i = 0; i < count; i++) {
      messages.push({
        id: `msg-${gameId}-${i}`,
        gameId,
        username: `Player${Math.floor(Math.random() * 100)}`,
        message:
          sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        timestamp: new Date(Date.now() - i * 30000), // 30 seconds apart
        type: Math.random() > 0.9 ? "dealer" : "player",
        emoji: Math.random() > 0.8,
      });
    }

    return messages.reverse();
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate game round progression
      this.liveGames.forEach((game) => {
        if (game.status === "active" && game.currentRound) {
          // Simulate phase changes
          if (Math.random() > 0.85) {
            const phases = ["betting", "dealing", "playing", "complete"];
            const currentPhaseIndex = phases.indexOf(game.currentRound.phase);
            const nextPhase = phases[(currentPhaseIndex + 1) % phases.length];
            game.currentRound.phase = nextPhase;

            if (nextPhase === "complete") {
              // End round and start new one
              const result = {
                id: `result-${Date.now()}`,
                gameId: game.id,
                roundId: game.currentRound.id,
                timestamp: new Date(),
                outcome: this.generateMockOutcome(game.id),
                winningBets: [],
                totalPayout: Math.floor(Math.random() * 5000) + 100,
              };

              game.gameHistory.unshift(result);
              game.gameHistory = game.gameHistory.slice(0, 50);

              // Start new round
              game.currentRound = {
                id: "round-" + Date.now(),
                roundNumber: game.currentRound.roundNumber + 1,
                startTime: new Date(),
                phase: "betting",
                gameData: {},
                bets: [],
              };
            }
          }
        }

        // Simulate player actions
        if (Math.random() > 0.9) {
          const changeCount = Math.floor(Math.random() * 3) - 1;
          if (changeCount > 0 && game.players.length < game.maxPlayers) {
            // Add player
            const newPlayer = this.generateMockPlayers(1)[0];
            newPlayer.seat = game.players.length + 1;
            game.players.push(newPlayer);
          } else if (changeCount < 0 && game.players.length > 0) {
            // Remove player
            game.players.splice(
              Math.floor(Math.random() * game.players.length),
              1,
            );
          }
        }

        // Update player chip counts
        game.players.forEach((player) => {
          if (Math.random() > 0.95) {
            const change = Math.floor(Math.random() * 1000) - 500;
            player.chipCount = Math.max(0, player.chipCount + change);
          }
        });
      });

      // Simulate chat messages
      if (Math.random() > 0.8) {
        this.simulateRandomChatMessage();
      }

      // Update dealer stats
      this.dealers.forEach((dealer) => {
        if (Math.random() > 0.98) {
          dealer.stats.gamesDealt += 1;
        }
      });
    }, 3000);
  }

  private simulateRandomChatMessage() {
    const gameIds = Array.from(this.liveGames.keys());
    if (gameIds.length === 0) return;

    const randomGameId = gameIds[Math.floor(Math.random() * gameIds.length)];
    const game = this.liveGames.get(randomGameId);
    if (!game) return;

    const messages = [
      "Good luck!",
      "Nice hand!",
      "Great spin!",
      "Dealer is on fire!",
      "Let's go!",
      "Big win incoming!",
      "Love this table",
      "Feeling lucky today",
      "GG everyone",
      "See you next round!",
    ];

    const isDealer = Math.random() > 0.85;
    const username = isDealer
      ? game.dealer.name
      : game.players.length > 0
        ? game.players[Math.floor(Math.random() * game.players.length)].username
        : "Anonymous";

    const message: LiveChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      gameId: randomGameId,
      username,
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date(),
      type: isDealer ? "dealer" : "player",
      emoji: Math.random() > 0.8,
    };

    const history = this.chatHistory.get(randomGameId) || [];
    history.push(message);
    this.chatHistory.set(randomGameId, history.slice(-200));
  }

  // Public API methods
  public getLiveGames(filters?: {
    type?: LiveGameType;
    status?: LiveGameStatus;
    isVIP?: boolean;
    category?: string;
    minBet?: number;
    maxBet?: number;
  }): LiveGame[] {
    let games = Array.from(this.liveGames.values());

    if (filters) {
      if (filters.type) {
        games = games.filter((g) => g.type === filters.type);
      }
      if (filters.status) {
        games = games.filter((g) => g.status === filters.status);
      }
      if (filters.isVIP !== undefined) {
        games = games.filter((g) => g.isVIP === filters.isVIP);
      }
      if (filters.category) {
        games = games.filter((g) => g.category === filters.category);
      }
      if (filters.minBet !== undefined) {
        games = games.filter((g) => g.minBet >= filters.minBet!);
      }
      if (filters.maxBet !== undefined) {
        games = games.filter((g) => g.maxBet <= filters.maxBet!);
      }
    }

    return games.sort((a, b) => {
      // Sort by: featured > vip > popular > others, then by player count
      const aScore =
        a.category === "featured"
          ? 4
          : a.category === "vip"
            ? 3
            : a.category === "popular"
              ? 2
              : 1;
      const bScore =
        b.category === "featured"
          ? 4
          : b.category === "vip"
            ? 3
            : b.category === "popular"
              ? 2
              : 1;

      if (aScore !== bScore) return bScore - aScore;
      return b.players.length - a.players.length;
    });
  }

  public getLiveGame(gameId: string): LiveGame | undefined {
    return this.liveGames.get(gameId);
  }

  public getDealers(): LiveDealer[] {
    return Array.from(this.dealers.values());
  }

  public getDealer(dealerId: string): LiveDealer | undefined {
    return this.dealers.get(dealerId);
  }

  public getTournaments(): LiveGameTournament[] {
    return Array.from(this.tournaments.values());
  }

  public getPromotions(): LiveGamePromotion[] {
    return this.promotions.filter(
      (p) => p.isActive && p.validUntil > new Date(),
    );
  }

  public getChatHistory(gameId: string): LiveChatMessage[] {
    return this.chatHistory.get(gameId) || [];
  }

  public getCurrentGame(): LiveGame | null {
    return this.currentGameId
      ? this.liveGames.get(this.currentGameId) || null
      : null;
  }

  public joinGame(
    gameId: string,
    seatNumber?: number,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("join_game", { gameId, seatNumber });
        this.currentGameId = gameId;
        resolve({ success: true });
      } else {
        // Simulate join in development
        const game = this.liveGames.get(gameId);
        if (!game) {
          resolve({ success: false, error: "Game not found" });
          return;
        }

        if (game.players.length >= game.maxPlayers) {
          resolve({ success: false, error: "Game is full" });
          return;
        }

        this.currentGameId = gameId;
        resolve({ success: true });
      }
    });
  }

  public leaveGame(): void {
    if (this.socket && this.socket.connected && this.currentGameId) {
      this.socket.emit("leave_game", { gameId: this.currentGameId });
    }
    this.currentGameId = null;
  }

  public placeBet(
    gameId: string,
    bet: Omit<LiveBet, "id" | "timestamp" | "status">,
  ): Promise<{ success: boolean; betId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("place_bet", { gameId, bet });
        resolve({ success: true, betId: `bet_${Date.now()}` });
      } else {
        // Simulate bet placement in development
        const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fullBet: LiveBet = {
          ...bet,
          id: betId,
          timestamp: new Date(),
          status: "pending",
        };

        const game = this.liveGames.get(gameId);
        if (game && game.currentRound) {
          game.currentRound.bets.push(fullBet);
        }

        resolve({ success: true, betId });
      }
    });
  }

  public sendChatMessage(
    gameId: string,
    message: string,
    username: string,
  ): void {
    if (!this.chatEnabled) return;

    if (this.socket && this.socket.connected) {
      this.socket.emit("chat_message", { gameId, message, username });
    } else {
      // Add locally in development
      const chatMessage: LiveChatMessage = {
        id: `msg_${Date.now()}`,
        gameId,
        username,
        message,
        timestamp: new Date(),
        type: "player",
      };

      const history = this.chatHistory.get(gameId) || [];
      history.push(chatMessage);
      this.chatHistory.set(gameId, history.slice(-200));
    }
  }

  public switchCamera(gameId: string, cameraId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("switch_camera", { gameId, cameraId });
    }
    this.currentCameraAngle = cameraId;
  }

  public changeStreamQuality(gameId: string, quality: StreamQuality): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("change_quality", { gameId, quality });
    }
    this.streamQuality = quality;
  }

  public toggleAudio(): void {
    this.audioEnabled = !this.audioEnabled;
  }

  public toggleChat(): void {
    this.chatEnabled = !this.chatEnabled;
  }

  public getStreamQuality(): StreamQuality | null {
    return this.streamQuality;
  }

  public getCurrentCameraAngle(): string | null {
    return this.currentCameraAngle;
  }

  public isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  public isChatEnabled(): boolean {
    return this.chatEnabled;
  }

  public tipDealer(
    gameId: string,
    amount: number,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("tip_dealer", { gameId, amount });
        resolve({ success: true });
      } else {
        // Simulate tip in development
        setTimeout(() => {
          const chatMessage: LiveChatMessage = {
            id: `tip_${Date.now()}`,
            gameId,
            username: "System",
            message: `Anonymous player tipped the dealer $${amount}!`,
            timestamp: new Date(),
            type: "system",
          };

          const history = this.chatHistory.get(gameId) || [];
          history.push(chatMessage);
          this.chatHistory.set(gameId, history.slice(-200));

          resolve({ success: true });
        }, 500);
      }
    });
  }

  public registerForTournament(
    tournamentId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("register_tournament", { tournamentId });
        resolve({ success: true });
      } else {
        // Simulate registration in development
        const tournament = this.tournaments.get(tournamentId);
        if (!tournament) {
          resolve({ success: false, error: "Tournament not found" });
          return;
        }

        if (tournament.currentParticipants >= tournament.maxParticipants) {
          resolve({ success: false, error: "Tournament is full" });
          return;
        }

        tournament.currentParticipants++;
        resolve({ success: true });
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentGameId = null;
  }
}

export const liveGamesService = new LiveGamesService();
