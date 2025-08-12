import { io, Socket } from "socket.io-client";

// Bingo Types
export interface BingoCard {
  id: string;
  type: "30-ball" | "75-ball" | "90-ball";
  numbers: (number | null)[][];
  markedNumbers: Set<number>;
  cost: number;
  autoMark: boolean;
  active: boolean;
  patterns: string[];
}

export interface BingoPattern {
  id: string;
  name: string;
  description: string;
  pattern: boolean[][];
  payout: number;
  difficulty: "easy" | "medium" | "hard";
  special: boolean;
  minNumbers?: number;
}

export interface BingoRoom {
  id: string;
  name: string;
  type: "30-ball" | "75-ball" | "90-ball";
  maxPlayers: number;
  currentPlayers: number;
  cardCost: { gc: number; sc: number };
  gameStatus: "waiting" | "playing" | "finished";
  nextGame: Date;
  jackpot: number;
  progressiveJackpot: number;
  patterns: BingoPattern[];
  currentPattern: BingoPattern;
  calledNumbers: number[];
  gameNumber: number;
  isVIP: boolean;
  theme: string;
  minBuyIn?: number;
  maxBuyIn?: number;
  roomImage?: string;
  description?: string;
  featured: boolean;
}

export interface BingoTournament {
  id: string;
  name: string;
  type: "single-elimination" | "multi-round" | "progressive";
  status: "upcoming" | "registration" | "active" | "finished";
  startTime: Date;
  endTime: Date;
  buyIn: { gc: number; sc: number };
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  rounds: BingoTournamentRound[];
  currentRound: number;
  winners: BingoTournamentWinner[];
  description: string;
  image?: string;
}

export interface BingoTournamentRound {
  id: string;
  roundNumber: number;
  status: "waiting" | "active" | "finished";
  participants: string[];
  winners: string[];
  pattern: BingoPattern;
  room: BingoRoom;
}

export interface BingoTournamentWinner {
  id: string;
  username: string;
  position: number;
  prize: number;
  timestamp: Date;
}

export interface BingoGameResult {
  id: string;
  cardId: string;
  pattern: BingoPattern;
  winningNumbers: number[];
  payout: number;
  timestamp: Date;
}

export interface BingoStats {
  gamesPlayed: number;
  totalWins: number;
  biggestWin: number;
  favoritePattern: string;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  lastWin: Date | null;
  totalSpent: { gc: number; sc: number };
  netWinnings: { gc: number; sc: number };
  patternsCompleted: Record<string, number>;
  roomsPlayed: Record<string, number>;
}

export interface BingoChatMessage {
  id: string;
  roomId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "player" | "moderator" | "system" | "winner" | "admin";
  avatar?: string;
  badges?: string[];
}

class BingoService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private rooms: Map<string, BingoRoom> = new Map();
  private tournaments: Map<string, BingoTournament> = new Map();
  private playerCards: Map<string, BingoCard> = new Map();
  private gameStats: BingoStats | null = null;
  private chatHistory: Map<string, BingoChatMessage[]> = new Map();

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Initialize with mock data in development
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
          path: "/bingo",
          transports: ["websocket", "polling"],
          timeout: 20000,
          retries: 3,
        },
      );

      this.setupSocketListeners();
    } catch (error) {
      console.warn(
        "Bingo WebSocket initialization failed, using mock data:",
        error,
      );
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Bingo service connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Bingo service disconnected");
      this.handleReconnection();
    });

    this.socket.on("room_update", (room: BingoRoom) => {
      this.rooms.set(room.id, room);
    });

    this.socket.on(
      "game_start",
      (data: { roomId: string; gameNumber: number }) => {
        const room = this.rooms.get(data.roomId);
        if (room) {
          room.gameStatus = "playing";
          room.gameNumber = data.gameNumber;
          room.calledNumbers = [];
        }
      },
    );

    this.socket.on(
      "number_called",
      (data: { roomId: string; number: number }) => {
        const room = this.rooms.get(data.roomId);
        if (room && !room.calledNumbers.includes(data.number)) {
          room.calledNumbers.push(data.number);
          this.checkAutoMark(data.roomId, data.number);
        }
      },
    );

    this.socket.on("game_end", (data: { roomId: string; winners: any[] }) => {
      const room = this.rooms.get(data.roomId);
      if (room) {
        room.gameStatus = "waiting";
        room.nextGame = new Date(Date.now() + 120000); // 2 minutes
      }
    });

    this.socket.on("tournament_update", (tournament: BingoTournament) => {
      this.tournaments.set(tournament.id, tournament);
    });

    this.socket.on("chat_message", (message: BingoChatMessage) => {
      const history = this.chatHistory.get(message.roomId) || [];
      history.push(message);
      this.chatHistory.set(message.roomId, history.slice(-100)); // Keep last 100 messages
    });

    this.socket.on("player_win", (data: BingoGameResult) => {
      // Handle player win notifications
      console.log("Player won!", data);
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
    // Load mock rooms
    const mockRooms: BingoRoom[] = [
      {
        id: "golden-75",
        name: "Golden Hall",
        type: "75-ball",
        maxPlayers: 200,
        currentPlayers: 156,
        cardCost: { gc: 1000, sc: 5 },
        gameStatus: "playing",
        nextGame: new Date(Date.now() + 120000),
        jackpot: 15450,
        progressiveJackpot: 125847,
        patterns: this.generate75BallPatterns(),
        currentPattern: this.generate75BallPatterns()[0],
        calledNumbers: [12, 23, 34, 45, 56, 67, 78, 89, 90, 15, 25, 35],
        gameNumber: 1247,
        isVIP: false,
        theme: "classic-gold",
        featured: true,
        description:
          "The premium 75-ball bingo experience with huge progressive jackpots",
      },
      {
        id: "silver-90",
        name: "Silver Lounge",
        type: "90-ball",
        maxPlayers: 150,
        currentPlayers: 98,
        cardCost: { gc: 500, sc: 2 },
        gameStatus: "waiting",
        nextGame: new Date(Date.now() + 45000),
        jackpot: 8750,
        progressiveJackpot: 89234,
        patterns: this.generate90BallPatterns(),
        currentPattern: this.generate90BallPatterns()[0],
        calledNumbers: [],
        gameNumber: 892,
        isVIP: false,
        theme: "silver-modern",
        featured: false,
        description:
          "Classic 90-ball bingo with traditional patterns and steady payouts",
      },
      {
        id: "bronze-30",
        name: "Speed Zone",
        type: "30-ball",
        maxPlayers: 100,
        currentPlayers: 67,
        cardCost: { gc: 250, sc: 1 },
        gameStatus: "waiting",
        nextGame: new Date(Date.now() + 30000),
        jackpot: 3500,
        progressiveJackpot: 45678,
        patterns: this.generate30BallPatterns(),
        currentPattern: this.generate30BallPatterns()[0],
        calledNumbers: [],
        gameNumber: 534,
        isVIP: false,
        theme: "neon-speed",
        featured: false,
        description:
          "Fast-paced 30-ball bingo for quick wins and non-stop action",
      },
      {
        id: "vip-progressive",
        name: "VIP Diamond Room",
        type: "75-ball",
        maxPlayers: 50,
        currentPlayers: 34,
        cardCost: { gc: 5000, sc: 25 },
        gameStatus: "waiting",
        nextGame: new Date(Date.now() + 180000),
        jackpot: 45000,
        progressiveJackpot: 456789,
        patterns: this.generateSpecialPatterns(),
        currentPattern: this.generateSpecialPatterns()[0],
        calledNumbers: [],
        gameNumber: 234,
        isVIP: true,
        theme: "vip-luxury",
        featured: true,
        description:
          "Exclusive high-stakes bingo with massive progressive jackpots",
      },
      {
        id: "tournament-chamber",
        name: "Tournament Chamber",
        type: "75-ball",
        maxPlayers: 32,
        currentPlayers: 28,
        cardCost: { gc: 2500, sc: 10 },
        gameStatus: "waiting",
        nextGame: new Date(Date.now() + 300000),
        jackpot: 25000,
        progressiveJackpot: 0,
        patterns: this.generateTournamentPatterns(),
        currentPattern: this.generateTournamentPatterns()[0],
        calledNumbers: [],
        gameNumber: 87,
        isVIP: false,
        theme: "tournament-arena",
        featured: true,
        description:
          "Competitive tournament-style bingo with elimination rounds",
      },
    ];

    mockRooms.forEach((room) => this.rooms.set(room.id, room));

    // Load mock tournaments
    const mockTournaments: BingoTournament[] = [
      {
        id: "weekend-warrior",
        name: "Weekend Warrior Championship",
        type: "single-elimination",
        status: "registration",
        startTime: new Date(Date.now() + 3600000), // 1 hour
        endTime: new Date(Date.now() + 7200000), // 2 hours
        buyIn: { gc: 2500, sc: 10 },
        prizePool: 50000,
        maxParticipants: 64,
        currentParticipants: 47,
        rounds: [],
        currentRound: 0,
        winners: [],
        description:
          "Single elimination tournament with massive prizes for the best bingo players",
      },
      {
        id: "progressive-madness",
        name: "Progressive Madness",
        type: "progressive",
        status: "upcoming",
        startTime: new Date(Date.now() + 86400000), // 24 hours
        endTime: new Date(Date.now() + 90000000), // 25 hours
        buyIn: { gc: 5000, sc: 20 },
        prizePool: 100000,
        maxParticipants: 128,
        currentParticipants: 23,
        rounds: [],
        currentRound: 0,
        winners: [],
        description:
          "Progressive tournament where prize pools grow with each elimination",
      },
    ];

    mockTournaments.forEach((tournament) =>
      this.tournaments.set(tournament.id, tournament),
    );

    // Generate mock stats
    this.gameStats = {
      gamesPlayed: 247,
      totalWins: 23,
      biggestWin: 5000,
      favoritePattern: "Full House",
      winRate: 9.3,
      currentStreak: 3,
      longestStreak: 8,
      lastWin: new Date(Date.now() - 86400000),
      totalSpent: { gc: 12350, sc: 62 },
      netWinnings: { gc: 28470, sc: 142 },
      patternsCompleted: {
        line: 15,
        "full-house": 4,
        "x-pattern": 2,
        "four-corners": 8,
      },
      roomsPlayed: {
        "golden-75": 123,
        "silver-90": 89,
        "bronze-30": 35,
      },
    };
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate player count changes
      this.rooms.forEach((room) => {
        const change = Math.floor(Math.random() * 10) - 5;
        room.currentPlayers = Math.max(
          0,
          Math.min(room.maxPlayers, room.currentPlayers + change),
        );
        room.progressiveJackpot += Math.random() * 100;
      });

      // Simulate number calling for active games
      this.rooms.forEach((room) => {
        if (room.gameStatus === "playing" && Math.random() > 0.7) {
          this.simulateNumberCall(room.id);
        }
      });

      // Simulate chat messages
      if (Math.random() > 0.8) {
        this.simulateRandomChatMessage();
      }
    }, 5000);
  }

  private simulateNumberCall(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const maxNumber =
      room.type === "75-ball" ? 75 : room.type === "90-ball" ? 90 : 30;
    const availableNumbers = Array.from(
      { length: maxNumber },
      (_, i) => i + 1,
    ).filter((num) => !room.calledNumbers.includes(num));

    if (availableNumbers.length === 0) return;

    const newNumber =
      availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    room.calledNumbers.push(newNumber);
    this.checkAutoMark(roomId, newNumber);
  }

  private simulateRandomChatMessage() {
    const messages = [
      "Good luck everyone! 🍀",
      "This room is on fire today! 🔥",
      "One more number for bingo! 🎯",
      "Great game everyone!",
      "Progressive jackpot is huge! 💰",
      "Let's go for the full house! 🏠",
    ];

    const usernames = [
      "BingoKing",
      "LuckyLady",
      "NumberMaster",
      "BingoQueen",
      "WinnerWinner",
    ];
    const roomIds = Array.from(this.rooms.keys());

    if (roomIds.length === 0) return;

    const randomRoomId = roomIds[Math.floor(Math.random() * roomIds.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const randomUsername =
      usernames[Math.floor(Math.random() * usernames.length)];

    const chatMessage: BingoChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      roomId: randomRoomId,
      username: randomUsername,
      message: randomMessage,
      timestamp: new Date(),
      type: "player",
    };

    const history = this.chatHistory.get(randomRoomId) || [];
    history.push(chatMessage);
    this.chatHistory.set(randomRoomId, history.slice(-100));
  }

  private checkAutoMark(roomId: string, number: number) {
    this.playerCards.forEach((card) => {
      if (card.autoMark && card.active) {
        const flatNumbers = card.numbers
          .flat()
          .filter((n) => n !== null) as number[];
        if (flatNumbers.includes(number)) {
          card.markedNumbers.add(number);
        }
      }
    });
  }

  // Pattern generators
  private generate75BallPatterns(): BingoPattern[] {
    return [
      {
        id: "line-horizontal",
        name: "Any Line",
        description: "Complete any horizontal, vertical, or diagonal line",
        pattern: [
          [true, true, true, true, true],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
        payout: 100,
        difficulty: "easy",
        special: false,
        minNumbers: 5,
      },
      {
        id: "four-corners",
        name: "Four Corners",
        description: "Mark all four corners of the card",
        pattern: [
          [true, false, false, false, true],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [true, false, false, false, true],
        ],
        payout: 250,
        difficulty: "easy",
        special: false,
        minNumbers: 4,
      },
      {
        id: "x-pattern",
        name: "X Pattern",
        description: "Complete both diagonal lines to form an X",
        pattern: [
          [true, false, false, false, true],
          [false, true, false, true, false],
          [false, false, true, false, false],
          [false, true, false, true, false],
          [true, false, false, false, true],
        ],
        payout: 500,
        difficulty: "medium",
        special: true,
        minNumbers: 9,
      },
      {
        id: "full-house",
        name: "Full House",
        description: "Fill the entire bingo card",
        pattern: [
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
        ],
        payout: 1000,
        difficulty: "hard",
        special: true,
        minNumbers: 24,
      },
    ];
  }

  private generate90BallPatterns(): BingoPattern[] {
    return [
      {
        id: "one-line",
        name: "One Line",
        description: "Complete any horizontal line",
        pattern: [
          [true, true, true, true, true, true, true, true, true],
          [false, false, false, false, false, false, false, false, false],
          [false, false, false, false, false, false, false, false, false],
        ],
        payout: 50,
        difficulty: "easy",
        special: false,
        minNumbers: 5,
      },
      {
        id: "two-lines",
        name: "Two Lines",
        description: "Complete any two horizontal lines",
        pattern: [
          [true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true],
          [false, false, false, false, false, false, false, false, false],
        ],
        payout: 200,
        difficulty: "medium",
        special: false,
        minNumbers: 10,
      },
      {
        id: "full-house-90",
        name: "Full House",
        description: "Fill the entire card",
        pattern: [
          [true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true],
          [true, true, true, true, true, true, true, true, true],
        ],
        payout: 500,
        difficulty: "hard",
        special: true,
        minNumbers: 15,
      },
    ];
  }

  private generate30BallPatterns(): BingoPattern[] {
    return [
      {
        id: "line-30",
        name: "Any Line",
        description: "Complete any line on the 3x3 grid",
        pattern: [
          [true, true, true],
          [false, false, false],
          [false, false, false],
        ],
        payout: 25,
        difficulty: "easy",
        special: false,
        minNumbers: 3,
      },
      {
        id: "full-house-30",
        name: "Full House",
        description: "Fill the entire 3x3 grid",
        pattern: [
          [true, true, true],
          [true, true, true],
          [true, true, true],
        ],
        payout: 100,
        difficulty: "medium",
        special: true,
        minNumbers: 9,
      },
    ];
  }

  private generateSpecialPatterns(): BingoPattern[] {
    return [
      {
        id: "diamond",
        name: "Diamond",
        description: "Complete a diamond shape",
        pattern: [
          [false, false, true, false, false],
          [false, true, false, true, false],
          [true, false, false, false, true],
          [false, true, false, true, false],
          [false, false, true, false, false],
        ],
        payout: 2500,
        difficulty: "hard",
        special: true,
        minNumbers: 9,
      },
      {
        id: "crown",
        name: "Crown",
        description: "Complete a crown shape for VIP players",
        pattern: [
          [true, false, true, false, true],
          [true, true, true, true, true],
          [false, true, true, true, false],
          [false, false, true, false, false],
          [false, false, true, false, false],
        ],
        payout: 5000,
        difficulty: "hard",
        special: true,
        minNumbers: 11,
      },
      {
        id: "progressive-special",
        name: "Progressive Special",
        description: "Unique pattern for progressive jackpot",
        pattern: [
          [true, false, false, false, true],
          [false, true, true, true, false],
          [false, true, false, true, false],
          [false, true, true, true, false],
          [true, false, false, false, true],
        ],
        payout: 10000,
        difficulty: "hard",
        special: true,
        minNumbers: 13,
      },
    ];
  }

  private generateTournamentPatterns(): BingoPattern[] {
    return [
      {
        id: "tournament-cross",
        name: "Tournament Cross",
        description: "Complete the cross pattern for tournament play",
        pattern: [
          [false, false, true, false, false],
          [false, false, true, false, false],
          [true, true, true, true, true],
          [false, false, true, false, false],
          [false, false, true, false, false],
        ],
        payout: 1500,
        difficulty: "medium",
        special: true,
        minNumbers: 9,
      },
      {
        id: "tournament-frame",
        name: "Tournament Frame",
        description: "Complete the outer frame pattern",
        pattern: [
          [true, true, true, true, true],
          [true, false, false, false, true],
          [true, false, false, false, true],
          [true, false, false, false, true],
          [true, true, true, true, true],
        ],
        payout: 3000,
        difficulty: "hard",
        special: true,
        minNumbers: 16,
      },
    ];
  }

  // Public API methods
  public getRooms(): BingoRoom[] {
    return Array.from(this.rooms.values());
  }

  public getRoom(roomId: string): BingoRoom | undefined {
    return this.rooms.get(roomId);
  }

  public getTournaments(): BingoTournament[] {
    return Array.from(this.tournaments.values());
  }

  public getTournament(tournamentId: string): BingoTournament | undefined {
    return this.tournaments.get(tournamentId);
  }

  public getPlayerCards(): BingoCard[] {
    return Array.from(this.playerCards.values());
  }

  public getPlayerStats(): BingoStats | null {
    return this.gameStats;
  }

  public getChatHistory(roomId: string): BingoChatMessage[] {
    return this.chatHistory.get(roomId) || [];
  }

  public generateBingoCard(
    type: "30-ball" | "75-ball" | "90-ball",
    cost: { gc: number; sc: number },
  ): BingoCard {
    const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let numbers: (number | null)[][];
    let patterns: string[] = [];

    switch (type) {
      case "30-ball":
        numbers = this.generate30BallCard();
        patterns = ["line-30", "full-house-30"];
        break;
      case "75-ball":
        numbers = this.generate75BallCard();
        patterns = [
          "line-horizontal",
          "four-corners",
          "x-pattern",
          "full-house",
        ];
        break;
      case "90-ball":
        numbers = this.generate90BallCard();
        patterns = ["one-line", "two-lines", "full-house-90"];
        break;
    }

    const card: BingoCard = {
      id,
      type,
      numbers,
      markedNumbers: new Set(),
      cost: cost.gc + cost.sc,
      autoMark: true,
      active: true,
      patterns,
    };

    this.playerCards.set(id, card);
    return card;
  }

  private generate30BallCard(): (number | null)[][] {
    const numbers: (number | null)[][] = [];
    const usedNumbers = new Set<number>();

    for (let row = 0; row < 3; row++) {
      numbers[row] = [];
      for (let col = 0; col < 3; col++) {
        let num;
        do {
          num = Math.floor(Math.random() * 30) + 1;
        } while (usedNumbers.has(num));

        usedNumbers.add(num);
        numbers[row][col] = num;
      }
    }

    return numbers;
  }

  private generate75BallCard(): (number | null)[][] {
    const numbers: (number | null)[][] = [];

    for (let col = 0; col < 5; col++) {
      const colNumbers: number[] = [];
      const min = col * 15 + 1;
      const max = col * 15 + 15;

      while (colNumbers.length < 5) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!colNumbers.includes(num)) {
          colNumbers.push(num);
        }
      }
      colNumbers.sort((a, b) => a - b);

      for (let row = 0; row < 5; row++) {
        if (!numbers[row]) numbers[row] = [];
        numbers[row][col] = row === 2 && col === 2 ? null : colNumbers[row]; // Center is free space
      }
    }

    return numbers;
  }

  private generate90BallCard(): (number | null)[][] {
    const numbers: (number | null)[][] = Array(3)
      .fill(null)
      .map(() => Array(9).fill(null));
    const usedNumbers = new Set<number>();

    // Place 15 numbers randomly
    let placed = 0;
    while (placed < 15) {
      const row = Math.floor(Math.random() * 3);
      const col = Math.floor(Math.random() * 9);

      if (numbers[row][col] === null) {
        const min = col * 10 + 1;
        const max = col === 8 ? 90 : col * 10 + 10;

        let num;
        do {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers.has(num));

        numbers[row][col] = num;
        usedNumbers.add(num);
        placed++;
      }
    }

    return numbers;
  }

  public markNumber(cardId: string, number: number): boolean {
    const card = this.playerCards.get(cardId);
    if (!card) return false;

    const flatNumbers = card.numbers
      .flat()
      .filter((n) => n !== null) as number[];
    if (!flatNumbers.includes(number)) return false;

    if (card.markedNumbers.has(number)) {
      card.markedNumbers.delete(number);
    } else {
      card.markedNumbers.add(number);
    }

    return true;
  }

  public sendChatMessage(
    roomId: string,
    message: string,
    username: string,
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("chat_message", { roomId, message, username });
    } else {
      // Add locally in development
      const chatMessage: BingoChatMessage = {
        id: `msg_${Date.now()}`,
        roomId,
        username,
        message,
        timestamp: new Date(),
        type: "player",
      };

      const history = this.chatHistory.get(roomId) || [];
      history.push(chatMessage);
      this.chatHistory.set(roomId, history.slice(-100));
    }
  }

  public joinRoom(roomId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_room", { roomId });
    }
  }

  public leaveRoom(roomId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave_room", { roomId });
    }
  }

  public joinTournament(tournamentId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_tournament", { tournamentId });
    }
  }

  public checkForWin(cardId: string, pattern: BingoPattern): boolean {
    const card = this.playerCards.get(cardId);
    if (!card) return false;

    const rows = card.numbers.length;
    const cols = card.numbers[0].length;

    for (let row = 0; row < rows && row < pattern.pattern.length; row++) {
      for (
        let col = 0;
        col < cols && col < pattern.pattern[row].length;
        col++
      ) {
        if (pattern.pattern[row][col]) {
          const number = card.numbers[row][col];
          if (number !== null && !card.markedNumbers.has(number)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const bingoService = new BingoService();
