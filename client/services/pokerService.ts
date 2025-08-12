import { io, Socket } from "socket.io-client";

// Poker Types
export interface PokerCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank:
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K";
  value: number;
}

export interface PokerHand {
  cards: PokerCard[];
  ranking: PokerHandRanking;
  highCard?: PokerCard;
  kickers?: PokerCard[];
}

export interface PokerHandRanking {
  name: string;
  value: number;
  description: string;
}

export interface PokerPlayer {
  id: string;
  username: string;
  avatar?: string;
  chipCount: number;
  position: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  totalBet: number;
  hand?: PokerCard[];
  seat: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  status: "sitting" | "playing" | "folded" | "away" | "disconnected";
  actionsThisRound: PokerAction[];
  timeToAct?: number;
  isVIP: boolean;
}

export interface PokerAction {
  type: "fold" | "check" | "call" | "bet" | "raise" | "all-in";
  amount?: number;
  timestamp: Date;
  playerId: string;
}

export interface PokerTable {
  id: string;
  name: string;
  gameType: "texas-holdem" | "omaha" | "seven-card-stud" | "five-card-draw";
  variant: "no-limit" | "pot-limit" | "fixed-limit";
  maxPlayers: number;
  currentPlayers: number;
  blinds: { small: number; big: number };
  ante?: number;
  buyIn: { min: number; max: number };
  status: "waiting" | "playing" | "paused" | "finished";
  players: PokerPlayer[];
  communityCards: PokerCard[];
  pot: { main: number; side: PokerSidePot[] };
  currentBet: number;
  gamePhase: "preflop" | "flop" | "turn" | "river" | "showdown";
  dealerPosition: number;
  activePlayer?: string;
  timeToAct: number;
  handNumber: number;
  isPrivate: boolean;
  password?: string;
  rakePercentage: number;
  level?: number; // For tournament play
  description?: string;
  image?: string;
}

export interface PokerSidePot {
  amount: number;
  eligiblePlayers: string[];
}

export interface PokerTournament {
  id: string;
  name: string;
  type:
    | "single-table"
    | "multi-table"
    | "sit-and-go"
    | "scheduled"
    | "heads-up"
    | "knockout";
  format: "freezeout" | "rebuy" | "add-on" | "progressive-knockout";
  gameType: "texas-holdem" | "omaha" | "seven-card-stud";
  status:
    | "scheduled"
    | "registering"
    | "active"
    | "break"
    | "finished"
    | "cancelled";
  startTime: Date;
  registrationEnd: Date;
  buyIn: { gc: number; sc: number; fee: number };
  guaranteedPrize?: number;
  currentPrizePool: number;
  maxPlayers: number;
  currentPlayers: number;
  registeredPlayers: PokerTournamentPlayer[];
  tables: PokerTable[];
  blindStructure: PokerBlindLevel[];
  currentLevel: number;
  nextLevelTime: Date;
  payoutStructure: PokerPayout[];
  rebuyPeriod?: number; // in minutes
  addOnTime?: Date;
  description: string;
  image?: string;
  isVIP: boolean;
  lateRegistration: boolean;
  lateRegistrationEnd?: Date;
}

export interface PokerTournamentPlayer {
  id: string;
  username: string;
  registrationTime: Date;
  chipCount: number;
  tableId?: string;
  position?: number;
  isEliminated: boolean;
  eliminationTime?: Date;
  finishPosition?: number;
  payout?: number;
  rebuysUsed: number;
  addOnsUsed: number;
  bountyCount?: number; // For knockout tournaments
}

export interface PokerBlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  duration: number; // in minutes
  breakAfter?: boolean;
  breakDuration?: number;
}

export interface PokerPayout {
  position: number;
  percentage: number;
  amount?: number;
  description: string;
}

export interface PokerStats {
  handsPlayed: number;
  handsWon: number;
  biggestPot: number;
  totalWinnings: { gc: number; sc: number };
  tournamentsCashed: number;
  tournamentsWon: number;
  biggestTournamentWin: number;
  vpip: number; // Voluntarily put money in pot
  pfr: number; // Pre-flop raise
  aggression: number;
  showdownWinning: number;
  favoriteHand: string;
  bestHand: PokerHandRanking;
  playTime: number; // in hours
  currentStreak: number;
  longestStreak: number;
}

export interface PokerChatMessage {
  id: string;
  tableId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "player" | "dealer" | "system" | "tournament";
  isAction?: boolean;
}

export interface PokerGameHistory {
  id: string;
  tableId: string;
  handNumber: number;
  timestamp: Date;
  players: PokerPlayer[];
  communityCards: PokerCard[];
  pot: number;
  winner: string;
  winningHand: PokerHand;
  actions: PokerAction[];
  rake: number;
}

class PokerService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private tables: Map<string, PokerTable> = new Map();
  private tournaments: Map<string, PokerTournament> = new Map();
  private playerStats: PokerStats | null = null;
  private chatHistory: Map<string, PokerChatMessage[]> = new Map();
  private gameHistory: Map<string, PokerGameHistory[]> = new Map();
  private handRankings: PokerHandRanking[] = [];

  constructor() {
    this.initializeHandRankings();
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
          path: "/poker",
          transports: ["websocket", "polling"],
          timeout: 20000,
          retries: 3,
        },
      );

      this.setupSocketListeners();
    } catch (error) {
      console.warn(
        "Poker WebSocket initialization failed, using mock data:",
        error,
      );
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Poker service connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Poker service disconnected");
      this.handleReconnection();
    });

    this.socket.on("table_update", (table: PokerTable) => {
      this.tables.set(table.id, table);
    });

    this.socket.on("tournament_update", (tournament: PokerTournament) => {
      this.tournaments.set(tournament.id, tournament);
    });

    this.socket.on(
      "hand_dealt",
      (data: { tableId: string; hand: PokerCard[] }) => {
        // Handle new hand dealt
      },
    );

    this.socket.on(
      "player_action",
      (action: PokerAction & { tableId: string }) => {
        const table = this.tables.get(action.tableId);
        if (table) {
          const player = table.players.find((p) => p.id === action.playerId);
          if (player) {
            player.actionsThisRound.push(action);
          }
        }
      },
    );

    this.socket.on(
      "game_phase_change",
      (data: {
        tableId: string;
        phase: string;
        communityCards?: PokerCard[];
      }) => {
        const table = this.tables.get(data.tableId);
        if (table) {
          table.gamePhase = data.phase as PokerTable["gamePhase"];
          if (data.communityCards) {
            table.communityCards = data.communityCards;
          }
        }
      },
    );

    this.socket.on(
      "pot_update",
      (data: { tableId: string; pot: PokerTable["pot"] }) => {
        const table = this.tables.get(data.tableId);
        if (table) {
          table.pot = data.pot;
        }
      },
    );

    this.socket.on("chat_message", (message: PokerChatMessage) => {
      const history = this.chatHistory.get(message.tableId) || [];
      history.push(message);
      this.chatHistory.set(message.tableId, history.slice(-100));
    });

    this.socket.on("hand_complete", (gameHistory: PokerGameHistory) => {
      const history = this.gameHistory.get(gameHistory.tableId) || [];
      history.push(gameHistory);
      this.gameHistory.set(gameHistory.tableId, history.slice(-50));
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

  private initializeHandRankings() {
    this.handRankings = [
      { name: "High Card", value: 1, description: "Highest card wins" },
      { name: "One Pair", value: 2, description: "Two cards of the same rank" },
      { name: "Two Pair", value: 3, description: "Two different pairs" },
      {
        name: "Three of a Kind",
        value: 4,
        description: "Three cards of the same rank",
      },
      { name: "Straight", value: 5, description: "Five consecutive cards" },
      { name: "Flush", value: 6, description: "Five cards of the same suit" },
      { name: "Full House", value: 7, description: "Three of a kind + a pair" },
      {
        name: "Four of a Kind",
        value: 8,
        description: "Four cards of the same rank",
      },
      { name: "Straight Flush", value: 9, description: "Straight + flush" },
      {
        name: "Royal Flush",
        value: 10,
        description: "A, K, Q, J, 10 of the same suit",
      },
    ];
  }

  private loadMockData() {
    // Load mock tables
    const mockTables: PokerTable[] = [
      {
        id: "nlhe-100-200",
        name: "High Stakes Hold'em",
        gameType: "texas-holdem",
        variant: "no-limit",
        maxPlayers: 9,
        currentPlayers: 6,
        blinds: { small: 100, big: 200 },
        buyIn: { min: 20000, max: 100000 },
        status: "playing",
        players: this.generateMockPlayers(6),
        communityCards: [
          { suit: "hearts", rank: "A", value: 14 },
          { suit: "spades", rank: "K", value: 13 },
          { suit: "diamonds", rank: "Q", value: 12 },
        ],
        pot: { main: 1500, side: [] },
        currentBet: 400,
        gamePhase: "flop",
        dealerPosition: 2,
        activePlayer: "player-3",
        timeToAct: 30,
        handNumber: 147,
        isPrivate: false,
        rakePercentage: 5,
        description: "High stakes no-limit Texas Hold'em",
      },
      {
        id: "omaha-50-100",
        name: "Omaha Hi-Lo",
        gameType: "omaha",
        variant: "pot-limit",
        maxPlayers: 8,
        currentPlayers: 4,
        blinds: { small: 50, big: 100 },
        buyIn: { min: 10000, max: 50000 },
        status: "waiting",
        players: this.generateMockPlayers(4),
        communityCards: [],
        pot: { main: 0, side: [] },
        currentBet: 0,
        gamePhase: "preflop",
        dealerPosition: 0,
        timeToAct: 0,
        handNumber: 89,
        isPrivate: false,
        rakePercentage: 5,
        description: "Pot-limit Omaha with hi-lo split",
      },
      {
        id: "stud-25-50",
        name: "Seven Card Stud",
        gameType: "seven-card-stud",
        variant: "fixed-limit",
        maxPlayers: 8,
        currentPlayers: 3,
        blinds: { small: 25, big: 50 },
        ante: 10,
        buyIn: { min: 5000, max: 25000 },
        status: "waiting",
        players: this.generateMockPlayers(3),
        communityCards: [],
        pot: { main: 0, side: [] },
        currentBet: 0,
        gamePhase: "preflop",
        dealerPosition: 0,
        timeToAct: 0,
        handNumber: 23,
        isPrivate: false,
        rakePercentage: 4,
        description: "Classic seven card stud poker",
      },
    ];

    mockTables.forEach((table) => this.tables.set(table.id, table));

    // Load mock tournaments
    const mockTournaments: PokerTournament[] = [
      {
        id: "sunday-major",
        name: "Sunday Major Championship",
        type: "multi-table",
        format: "freezeout",
        gameType: "texas-holdem",
        status: "registering",
        startTime: new Date(Date.now() + 3600000), // 1 hour
        registrationEnd: new Date(Date.now() + 3300000), // 55 minutes
        buyIn: { gc: 5000, sc: 25, fee: 500 },
        guaranteedPrize: 100000,
        currentPrizePool: 67500,
        maxPlayers: 1000,
        currentPlayers: 135,
        registeredPlayers: [],
        tables: [],
        blindStructure: this.generateBlindStructure(),
        currentLevel: 1,
        nextLevelTime: new Date(Date.now() + 900000), // 15 minutes
        payoutStructure: this.generatePayoutStructure(),
        description:
          "Weekly flagship tournament with guaranteed $100K prize pool",
        isVIP: false,
        lateRegistration: true,
        lateRegistrationEnd: new Date(Date.now() + 5400000), // 90 minutes
      },
      {
        id: "turbo-sng",
        name: "Turbo Sit & Go",
        type: "sit-and-go",
        format: "freezeout",
        gameType: "texas-holdem",
        status: "scheduled",
        startTime: new Date(),
        registrationEnd: new Date(),
        buyIn: { gc: 1000, sc: 5, fee: 100 },
        currentPrizePool: 0,
        maxPlayers: 9,
        currentPlayers: 0,
        registeredPlayers: [],
        tables: [],
        blindStructure: this.generateTurboBlindStructure(),
        currentLevel: 1,
        nextLevelTime: new Date(Date.now() + 300000), // 5 minutes
        payoutStructure: [
          { position: 1, percentage: 50, description: "Winner" },
          { position: 2, percentage: 30, description: "Runner-up" },
          { position: 3, percentage: 20, description: "Third place" },
        ],
        description: "Fast-paced 9-player sit and go tournament",
        isVIP: false,
        lateRegistration: false,
      },
      {
        id: "vip-freeroll",
        name: "VIP Exclusive Freeroll",
        type: "multi-table",
        format: "freezeout",
        gameType: "texas-holdem",
        status: "scheduled",
        startTime: new Date(Date.now() + 86400000), // 24 hours
        registrationEnd: new Date(Date.now() + 84600000), // 23.5 hours
        buyIn: { gc: 0, sc: 0, fee: 0 },
        guaranteedPrize: 25000,
        currentPrizePool: 25000,
        maxPlayers: 500,
        currentPlayers: 67,
        registeredPlayers: [],
        tables: [],
        blindStructure: this.generateBlindStructure(),
        currentLevel: 1,
        nextLevelTime: new Date(Date.now() + 900000),
        payoutStructure: this.generatePayoutStructure(),
        description: "Exclusive freeroll tournament for VIP players only",
        isVIP: true,
        lateRegistration: true,
        lateRegistrationEnd: new Date(Date.now() + 87300000),
      },
    ];

    mockTournaments.forEach((tournament) =>
      this.tournaments.set(tournament.id, tournament),
    );

    // Generate mock stats
    this.playerStats = {
      handsPlayed: 2847,
      handsWon: 567,
      biggestPot: 25000,
      totalWinnings: { gc: 45000, sc: 225 },
      tournamentsCashed: 23,
      tournamentsWon: 4,
      biggestTournamentWin: 50000,
      vpip: 24.5,
      pfr: 18.2,
      aggression: 2.8,
      showdownWinning: 52.3,
      favoriteHand: "Pocket Aces",
      bestHand: this.handRankings[9], // Royal Flush
      playTime: 156.7,
      currentStreak: 3,
      longestStreak: 12,
    };
  }

  private generateMockPlayers(count: number): PokerPlayer[] {
    const names = [
      "PokerPro",
      "ChipLeader",
      "BluffMaster",
      "CardShark",
      "AllInAnnie",
      "RiverRat",
      "FoldKing",
      "BetBeast",
    ];
    const players: PokerPlayer[] = [];

    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        username: names[i] || `Player${i + 1}`,
        chipCount: Math.floor(Math.random() * 50000) + 10000,
        position: i,
        isActive: i < 3, // First 3 players are active
        isFolded: i >= 3,
        isAllIn: false,
        currentBet: i === 0 ? 200 : i === 1 ? 400 : 0,
        totalBet: i === 0 ? 200 : i === 1 ? 400 : 0,
        seat: i + 1,
        isDealer: i === 2,
        isSmallBlind: i === 0,
        isBigBlind: i === 1,
        status: "playing",
        actionsThisRound: [],
        timeToAct: i === 2 ? 30 : undefined,
        isVIP: Math.random() > 0.7,
      });
    }

    return players;
  }

  private generateBlindStructure(): PokerBlindLevel[] {
    return [
      { level: 1, smallBlind: 10, bigBlind: 20, duration: 15 },
      { level: 2, smallBlind: 15, bigBlind: 30, duration: 15 },
      { level: 3, smallBlind: 25, bigBlind: 50, duration: 15 },
      {
        level: 4,
        smallBlind: 50,
        bigBlind: 100,
        duration: 15,
        breakAfter: true,
        breakDuration: 5,
      },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 15, duration: 15 },
      { level: 6, smallBlind: 100, bigBlind: 200, ante: 20, duration: 15 },
      { level: 7, smallBlind: 150, bigBlind: 300, ante: 30, duration: 15 },
      {
        level: 8,
        smallBlind: 200,
        bigBlind: 400,
        ante: 40,
        duration: 15,
        breakAfter: true,
        breakDuration: 5,
      },
    ];
  }

  private generateTurboBlindStructure(): PokerBlindLevel[] {
    return [
      { level: 1, smallBlind: 10, bigBlind: 20, duration: 5 },
      { level: 2, smallBlind: 15, bigBlind: 30, duration: 5 },
      { level: 3, smallBlind: 25, bigBlind: 50, duration: 5 },
      { level: 4, smallBlind: 50, bigBlind: 100, duration: 5 },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 15, duration: 5 },
      { level: 6, smallBlind: 100, bigBlind: 200, ante: 20, duration: 5 },
    ];
  }

  private generatePayoutStructure(): PokerPayout[] {
    return [
      { position: 1, percentage: 30, description: "Winner" },
      { position: 2, percentage: 20, description: "Runner-up" },
      { position: 3, percentage: 15, description: "Third place" },
      { position: 4, percentage: 10, description: "Fourth place" },
      { position: 5, percentage: 8, description: "Fifth place" },
      { position: 6, percentage: 6, description: "Sixth place" },
      { position: 7, percentage: 4, description: "Seventh place" },
      { position: 8, percentage: 3, description: "Eighth place" },
      { position: 9, percentage: 2, description: "Ninth place" },
      { position: 10, percentage: 2, description: "Tenth place" },
    ];
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate table updates
      this.tables.forEach((table) => {
        if (table.status === "playing") {
          // Simulate pot growth
          if (Math.random() > 0.7) {
            table.pot.main += Math.floor(Math.random() * 500) + 100;
          }

          // Simulate player actions
          if (table.activePlayer && Math.random() > 0.6) {
            this.simulatePlayerAction(table.id, table.activePlayer);
          }
        }

        // Update player counts
        const change = Math.floor(Math.random() * 3) - 1;
        table.currentPlayers = Math.max(
          0,
          Math.min(table.maxPlayers, table.currentPlayers + change),
        );
      });

      // Simulate tournament registration changes
      this.tournaments.forEach((tournament) => {
        if (tournament.status === "registering") {
          const change = Math.floor(Math.random() * 5);
          tournament.currentPlayers = Math.min(
            tournament.maxPlayers,
            tournament.currentPlayers + change,
          );
          tournament.currentPrizePool =
            tournament.currentPlayers *
            (tournament.buyIn.gc + tournament.buyIn.sc);
        }
      });

      // Simulate chat messages
      if (Math.random() > 0.8) {
        this.simulateRandomChatMessage();
      }
    }, 3000);
  }

  private simulatePlayerAction(tableId: string, playerId: string) {
    const actions = ["fold", "check", "call", "bet", "raise"] as const;
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const action: PokerAction = {
      type: randomAction,
      amount:
        randomAction === "bet" || randomAction === "raise"
          ? Math.floor(Math.random() * 1000) + 100
          : undefined,
      timestamp: new Date(),
      playerId,
    };

    const table = this.tables.get(tableId);
    if (table) {
      const player = table.players.find((p) => p.id === playerId);
      if (player) {
        player.actionsThisRound.push(action);

        // Move to next active player
        const nextPlayerIndex = (player.position + 1) % table.players.length;
        const nextPlayer = table.players[nextPlayerIndex];
        if (nextPlayer && !nextPlayer.isFolded) {
          table.activePlayer = nextPlayer.id;
        }
      }
    }
  }

  private simulateRandomChatMessage() {
    const messages = [
      "Nice hand!",
      "Good fold",
      "All in!",
      "That was a sick beat",
      "gg everyone",
      "Nice bluff",
      "Lucky river",
      "Fold pre",
      "Ship it!",
      "Variance...",
    ];

    const tableIds = Array.from(this.tables.keys());
    if (tableIds.length === 0) return;

    const randomTableId = tableIds[Math.floor(Math.random() * tableIds.length)];
    const table = this.tables.get(randomTableId);
    if (!table || table.players.length === 0) return;

    const randomPlayer =
      table.players[Math.floor(Math.random() * table.players.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const chatMessage: PokerChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      tableId: randomTableId,
      username: randomPlayer.username,
      message: randomMessage,
      timestamp: new Date(),
      type: "player",
    };

    const history = this.chatHistory.get(randomTableId) || [];
    history.push(chatMessage);
    this.chatHistory.set(randomTableId, history.slice(-100));
  }

  // Public API methods
  public getTables(): PokerTable[] {
    return Array.from(this.tables.values());
  }

  public getTable(tableId: string): PokerTable | undefined {
    return this.tables.get(tableId);
  }

  public getTournaments(): PokerTournament[] {
    return Array.from(this.tournaments.values());
  }

  public getTournament(tournamentId: string): PokerTournament | undefined {
    return this.tournaments.get(tournamentId);
  }

  public getPlayerStats(): PokerStats | null {
    return this.playerStats;
  }

  public getChatHistory(tableId: string): PokerChatMessage[] {
    return this.chatHistory.get(tableId) || [];
  }

  public getGameHistory(tableId: string): PokerGameHistory[] {
    return this.gameHistory.get(tableId) || [];
  }

  public getHandRankings(): PokerHandRanking[] {
    return this.handRankings;
  }

  public joinTable(tableId: string, seatNumber?: number): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_table", { tableId, seatNumber });
    }
  }

  public leaveTable(tableId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave_table", { tableId });
    }
  }

  public performAction(tableId: string, action: PokerAction): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("player_action", { tableId, ...action });
    } else {
      // Simulate locally in development
      this.simulatePlayerAction(tableId, action.playerId);
    }
  }

  public sendChatMessage(
    tableId: string,
    message: string,
    username: string,
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("chat_message", { tableId, message, username });
    } else {
      // Add locally in development
      const chatMessage: PokerChatMessage = {
        id: `msg_${Date.now()}`,
        tableId,
        username,
        message,
        timestamp: new Date(),
        type: "player",
      };

      const history = this.chatHistory.get(tableId) || [];
      history.push(chatMessage);
      this.chatHistory.set(tableId, history.slice(-100));
    }
  }

  public registerForTournament(tournamentId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("register_tournament", { tournamentId });
    }
  }

  public unregisterFromTournament(tournamentId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("unregister_tournament", { tournamentId });
    }
  }

  public sitOutNextHand(tableId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("sit_out", { tableId });
    }
  }

  public sitBackIn(tableId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("sit_back_in", { tableId });
    }
  }

  public requestTableChange(currentTableId: string, newTableId?: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("request_table_change", { currentTableId, newTableId });
    }
  }

  public evaluateHand(cards: PokerCard[]): PokerHand {
    // Simplified hand evaluation - in production this would be more sophisticated
    const sortedCards = cards.sort((a, b) => b.value - a.value);

    // Check for pairs, straights, flushes, etc.
    const isFlush = cards.every((card) => card.suit === cards[0].suit);
    const isStraight = this.checkStraight(sortedCards);
    const rankCounts = this.countRanks(cards);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    let ranking: PokerHandRanking;

    if (
      isFlush &&
      isStraight &&
      sortedCards[0].rank === "A" &&
      sortedCards[1].rank === "K"
    ) {
      ranking = this.handRankings[9]; // Royal Flush
    } else if (isFlush && isStraight) {
      ranking = this.handRankings[8]; // Straight Flush
    } else if (counts[0] === 4) {
      ranking = this.handRankings[7]; // Four of a Kind
    } else if (counts[0] === 3 && counts[1] === 2) {
      ranking = this.handRankings[6]; // Full House
    } else if (isFlush) {
      ranking = this.handRankings[5]; // Flush
    } else if (isStraight) {
      ranking = this.handRankings[4]; // Straight
    } else if (counts[0] === 3) {
      ranking = this.handRankings[3]; // Three of a Kind
    } else if (counts[0] === 2 && counts[1] === 2) {
      ranking = this.handRankings[2]; // Two Pair
    } else if (counts[0] === 2) {
      ranking = this.handRankings[1]; // One Pair
    } else {
      ranking = this.handRankings[0]; // High Card
    }

    return {
      cards: sortedCards,
      ranking,
      highCard: sortedCards[0],
      kickers: sortedCards.slice(1),
    };
  }

  private checkStraight(cards: PokerCard[]): boolean {
    // Simplified straight check
    for (let i = 0; i < cards.length - 1; i++) {
      if (cards[i].value - cards[i + 1].value !== 1) {
        return false;
      }
    }
    return true;
  }

  private countRanks(cards: PokerCard[]): Record<string, number> {
    const counts: Record<string, number> = {};
    cards.forEach((card) => {
      counts[card.rank] = (counts[card.rank] || 0) + 1;
    });
    return counts;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const pokerService = new PokerService();
