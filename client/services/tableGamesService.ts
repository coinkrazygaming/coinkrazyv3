import { io, Socket } from "socket.io-client";

// Card Types
export interface Card {
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

// Blackjack Types
export interface BlackjackHand {
  cards: Card[];
  value: number;
  isSoft: boolean;
  isBlackjack: boolean;
  isBusted: boolean;
}

export interface BlackjackTable {
  id: string;
  name: string;
  minBet: number;
  maxBet: number;
  dealerHand: BlackjackHand;
  playerHands: Map<string, BlackjackHand[]>;
  gamePhase: "betting" | "dealing" | "playing" | "dealer-turn" | "complete";
  deck: Card[];
  currentPlayer?: string;
  bets: Map<string, number[]>;
  insurance: Map<string, number>;
  splits: Map<string, number>;
  doubleDowns: Map<string, boolean[]>;
  surrenders: Map<string, boolean[]>;
  results: Map<string, BlackjackResult[]>;
  players: BlackjackPlayer[];
  maxPlayers: number;
  rules: BlackjackRules;
}

export interface BlackjackPlayer {
  id: string;
  username: string;
  avatar?: string;
  chipCount: number;
  seat: number;
  isActive: boolean;
  currentHandIndex: number;
  timeToAct?: number;
}

export interface BlackjackRules {
  blackjackPayout: number; // 1.5 for 3:2, 1.2 for 6:5
  dealerHitSoft17: boolean;
  doubleAfterSplit: boolean;
  resplitAces: boolean;
  surrenderAllowed: boolean;
  maxSplits: number;
  deckCount: number;
}

export interface BlackjackResult {
  handIndex: number;
  outcome: "win" | "lose" | "push" | "blackjack" | "surrender";
  payout: number;
  bet: number;
}

// Roulette Types
export interface RouletteTable {
  id: string;
  name: string;
  type: "american" | "european" | "french";
  minBet: number;
  maxBet: number;
  gamePhase: "betting" | "spinning" | "complete";
  currentNumber?: number;
  lastNumbers: number[];
  bets: Map<string, RouletteBet[]>;
  players: RoulettePlayer[];
  maxPlayers: number;
  spinStartTime?: Date;
  bettingTimeLeft: number;
}

export interface RoulettePlayer {
  id: string;
  username: string;
  avatar?: string;
  chipCount: number;
  isActive: boolean;
}

export interface RouletteBet {
  id: string;
  type: RouletteBetType;
  numbers: number[];
  amount: number;
  payout: number;
  description: string;
}

export interface RouletteBetType {
  name: string;
  odds: number;
  description: string;
  positions?: string[];
}

// Baccarat Types
export interface BaccaratTable {
  id: string;
  name: string;
  minBet: number;
  maxBet: number;
  gamePhase: "betting" | "dealing" | "drawing" | "complete";
  playerHand: Card[];
  bankerHand: Card[];
  playerScore: number;
  bankerScore: number;
  bets: Map<string, BaccaratBet[]>;
  players: BaccaratPlayer[];
  maxPlayers: number;
  gameNumber: number;
  results: BaccaratResult[];
  commission: number; // Usually 5% on banker wins
}

export interface BaccaratPlayer {
  id: string;
  username: string;
  avatar?: string;
  chipCount: number;
  isActive: boolean;
}

export interface BaccaratBet {
  type: "player" | "banker" | "tie" | "player-pair" | "banker-pair";
  amount: number;
  payout: number;
}

export interface BaccaratResult {
  outcome: "player" | "banker" | "tie";
  playerScore: number;
  bankerScore: number;
  playerPair: boolean;
  bankerPair: boolean;
  timestamp: Date;
}

// Craps Types
export interface CrapsTable {
  id: string;
  name: string;
  minBet: number;
  maxBet: number;
  gamePhase: "come-out" | "point" | "rolling";
  point?: number;
  lastRoll?: CrapsRoll;
  rollHistory: CrapsRoll[];
  bets: Map<string, CrapsBet[]>;
  players: CrapsPlayer[];
  maxPlayers: number;
  shooter?: string;
  dice: [number, number];
}

export interface CrapsPlayer {
  id: string;
  username: string;
  avatar?: string;
  chipCount: number;
  position: number;
  isActive: boolean;
  isShooter: boolean;
}

export interface CrapsBet {
  type: CrapsBetType;
  amount: number;
  odds?: number;
  isWorking: boolean;
  point?: number;
}

export interface CrapsBetType {
  name: string;
  odds: number;
  description: string;
  oneRoll: boolean;
}

export interface CrapsRoll {
  dice: [number, number];
  total: number;
  timestamp: Date;
  isNatural?: boolean;
  isCraps?: boolean;
  isYo?: boolean;
  isHard?: boolean;
}

// General Types
export interface TableGameStats {
  blackjack: {
    handsPlayed: number;
    handsWon: number;
    blackjacksHit: number;
    biggestWin: number;
    totalWagered: number;
    netWinnings: number;
    perfectBasicStrategy: number;
  };
  roulette: {
    spinsPlayed: number;
    numbersHit: Record<number, number>;
    biggestWin: number;
    favoriteNumber: number;
    totalWagered: number;
    netWinnings: number;
    longestStreak: number;
  };
  baccarat: {
    handsPlayed: number;
    playerWins: number;
    bankerWins: number;
    ties: number;
    biggestWin: number;
    totalWagered: number;
    netWinnings: number;
    naturalCount: number;
  };
  craps: {
    rollsPlayed: number;
    pointsEstablished: number;
    pointsMade: number;
    crapsRolled: number;
    biggestWin: number;
    totalWagered: number;
    netWinnings: number;
    longestRoll: number;
  };
}

export interface TableGameChatMessage {
  id: string;
  tableId: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "player" | "dealer" | "system";
}

class TableGamesService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private blackjackTables: Map<string, BlackjackTable> = new Map();
  private rouletteTables: Map<string, RouletteTable> = new Map();
  private baccaratTables: Map<string, BaccaratTable> = new Map();
  private crapsTables: Map<string, CrapsTable> = new Map();
  private playerStats: TableGameStats | null = null;
  private chatHistory: Map<string, TableGameChatMessage[]> = new Map();

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
          path: "/table-games",
          transports: ["websocket", "polling"],
          timeout: 20000,
          retries: 3,
        },
      );

      this.setupSocketListeners();
    } catch (error) {
      console.warn(
        "Table Games WebSocket initialization failed, using mock data:",
        error,
      );
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Table Games service connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Table Games service disconnected");
      this.handleReconnection();
    });

    // Blackjack events
    this.socket.on("blackjack_table_update", (table: BlackjackTable) => {
      this.blackjackTables.set(table.id, table);
    });

    this.socket.on("cards_dealt", (data: { tableId: string; hands: any }) => {
      // Handle cards dealt
    });

    // Roulette events
    this.socket.on("roulette_table_update", (table: RouletteTable) => {
      this.rouletteTables.set(table.id, table);
    });

    this.socket.on(
      "roulette_spin",
      (data: { tableId: string; number: number }) => {
        const table = this.rouletteTables.get(data.tableId);
        if (table) {
          table.currentNumber = data.number;
          table.lastNumbers.unshift(data.number);
          table.lastNumbers = table.lastNumbers.slice(0, 20);
          table.gamePhase = "complete";
        }
      },
    );

    // Baccarat events
    this.socket.on("baccarat_table_update", (table: BaccaratTable) => {
      this.baccaratTables.set(table.id, table);
    });

    // Craps events
    this.socket.on("craps_table_update", (table: CrapsTable) => {
      this.crapsTables.set(table.id, table);
    });

    this.socket.on(
      "dice_rolled",
      (data: { tableId: string; dice: [number, number] }) => {
        const table = this.crapsTables.get(data.tableId);
        if (table) {
          table.dice = data.dice;
          const roll: CrapsRoll = {
            dice: data.dice,
            total: data.dice[0] + data.dice[1],
            timestamp: new Date(),
            isNatural: [7, 11].includes(data.dice[0] + data.dice[1]),
            isCraps: [2, 3, 12].includes(data.dice[0] + data.dice[1]),
            isYo: data.dice[0] + data.dice[1] === 11,
            isHard:
              data.dice[0] === data.dice[1] &&
              [4, 6, 8, 10].includes(data.dice[0] + data.dice[1]),
          };
          table.lastRoll = roll;
          table.rollHistory.unshift(roll);
          table.rollHistory = table.rollHistory.slice(0, 50);
        }
      },
    );

    // Chat messages
    this.socket.on("chat_message", (message: TableGameChatMessage) => {
      const history = this.chatHistory.get(message.tableId) || [];
      history.push(message);
      this.chatHistory.set(message.tableId, history.slice(-100));
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
    // Load mock blackjack tables
    const mockBlackjackTables: BlackjackTable[] = [
      {
        id: "blackjack-vip",
        name: "VIP Blackjack",
        minBet: 100,
        maxBet: 10000,
        dealerHand: {
          cards: [],
          value: 0,
          isSoft: false,
          isBlackjack: false,
          isBusted: false,
        },
        playerHands: new Map(),
        gamePhase: "betting",
        deck: this.createDeck(6),
        bets: new Map(),
        insurance: new Map(),
        splits: new Map(),
        doubleDowns: new Map(),
        surrenders: new Map(),
        results: new Map(),
        players: this.generateBlackjackPlayers(5),
        maxPlayers: 7,
        rules: {
          blackjackPayout: 1.5,
          dealerHitSoft17: true,
          doubleAfterSplit: true,
          resplitAces: false,
          surrenderAllowed: true,
          maxSplits: 3,
          deckCount: 6,
        },
      },
      {
        id: "blackjack-standard",
        name: "Standard Blackjack",
        minBet: 25,
        maxBet: 2500,
        dealerHand: {
          cards: [],
          value: 0,
          isSoft: false,
          isBlackjack: false,
          isBusted: false,
        },
        playerHands: new Map(),
        gamePhase: "betting",
        deck: this.createDeck(8),
        bets: new Map(),
        insurance: new Map(),
        splits: new Map(),
        doubleDowns: new Map(),
        surrenders: new Map(),
        results: new Map(),
        players: this.generateBlackjackPlayers(3),
        maxPlayers: 7,
        rules: {
          blackjackPayout: 1.5,
          dealerHitSoft17: false,
          doubleAfterSplit: true,
          resplitAces: true,
          surrenderAllowed: false,
          maxSplits: 4,
          deckCount: 8,
        },
      },
    ];

    mockBlackjackTables.forEach((table) =>
      this.blackjackTables.set(table.id, table),
    );

    // Load mock roulette tables
    const mockRouletteTables: RouletteTable[] = [
      {
        id: "roulette-european",
        name: "European Roulette",
        type: "european",
        minBet: 10,
        maxBet: 5000,
        gamePhase: "betting",
        lastNumbers: [17, 23, 8, 34, 15, 29, 7, 22, 18, 31],
        bets: new Map(),
        players: this.generateRouletteePlayers(8),
        maxPlayers: 12,
        bettingTimeLeft: 25,
      },
      {
        id: "roulette-american",
        name: "American Roulette",
        type: "american",
        minBet: 5,
        maxBet: 2500,
        gamePhase: "spinning",
        currentNumber: 17,
        lastNumbers: [12, 35, 3, 18, 25, 14, 36, 21, 4, 33],
        bets: new Map(),
        players: this.generateRouletteePlayers(6),
        maxPlayers: 12,
        bettingTimeLeft: 0,
        spinStartTime: new Date(Date.now() - 5000),
      },
    ];

    mockRouletteTables.forEach((table) =>
      this.rouletteTables.set(table.id, table),
    );

    // Load mock baccarat tables
    const mockBaccaratTables: BaccaratTable[] = [
      {
        id: "baccarat-vip",
        name: "VIP Baccarat",
        minBet: 100,
        maxBet: 25000,
        gamePhase: "betting",
        playerHand: [],
        bankerHand: [],
        playerScore: 0,
        bankerScore: 0,
        bets: new Map(),
        players: this.generateBaccaratPlayers(4),
        maxPlayers: 8,
        gameNumber: 1247,
        results: this.generateBaccaratResults(20),
        commission: 0.05,
      },
      {
        id: "baccarat-standard",
        name: "Standard Baccarat",
        minBet: 25,
        maxBet: 5000,
        gamePhase: "dealing",
        playerHand: [
          { suit: "hearts", rank: "7", value: 7 },
          { suit: "spades", rank: "5", value: 5 },
        ],
        bankerHand: [
          { suit: "clubs", rank: "K", value: 10 },
          { suit: "diamonds", rank: "3", value: 3 },
        ],
        playerScore: 2,
        bankerScore: 3,
        bets: new Map(),
        players: this.generateBaccaratPlayers(6),
        maxPlayers: 8,
        gameNumber: 834,
        results: this.generateBaccaratResults(15),
        commission: 0.05,
      },
    ];

    mockBaccaratTables.forEach((table) =>
      this.baccaratTables.set(table.id, table),
    );

    // Load mock craps tables
    const mockCrapsTables: CrapsTable[] = [
      {
        id: "craps-main",
        name: "Main Craps Table",
        minBet: 10,
        maxBet: 5000,
        gamePhase: "come-out",
        lastRoll: {
          dice: [4, 3],
          total: 7,
          timestamp: new Date(),
          isNatural: true,
        },
        rollHistory: this.generateCrapsRolls(30),
        bets: new Map(),
        players: this.generateCrapsPlayers(8),
        maxPlayers: 12,
        shooter: "player-3",
        dice: [0, 0],
      },
      {
        id: "craps-vip",
        name: "VIP Craps",
        minBet: 100,
        maxBet: 25000,
        gamePhase: "point",
        point: 6,
        lastRoll: {
          dice: [3, 3],
          total: 6,
          timestamp: new Date(),
          isHard: true,
        },
        rollHistory: this.generateCrapsRolls(25),
        bets: new Map(),
        players: this.generateCrapsPlayers(5),
        maxPlayers: 10,
        shooter: "player-1",
        dice: [0, 0],
      },
    ];

    mockCrapsTables.forEach((table) => this.crapsTables.set(table.id, table));

    // Generate mock stats
    this.playerStats = {
      blackjack: {
        handsPlayed: 567,
        handsWon: 245,
        blackjacksHit: 23,
        biggestWin: 5000,
        totalWagered: 28500,
        netWinnings: 3400,
        perfectBasicStrategy: 89.2,
      },
      roulette: {
        spinsPlayed: 234,
        numbersHit: { 17: 8, 23: 6, 7: 5, 0: 3 },
        biggestWin: 3500,
        favoriteNumber: 17,
        totalWagered: 11700,
        netWinnings: -850,
        longestStreak: 5,
      },
      baccarat: {
        handsPlayed: 189,
        playerWins: 89,
        bankerWins: 87,
        ties: 13,
        biggestWin: 2500,
        totalWagered: 9450,
        netWinnings: 1200,
        naturalCount: 34,
      },
      craps: {
        rollsPlayed: 145,
        pointsEstablished: 67,
        pointsMade: 29,
        crapsRolled: 12,
        biggestWin: 4200,
        totalWagered: 7250,
        netWinnings: 890,
        longestRoll: 23,
      },
    };
  }

  private createDeck(deckCount: number): Card[] {
    const suits: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: Card["rank"][] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    const deck: Card[] = [];

    for (let d = 0; d < deckCount; d++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          let value = parseInt(rank);
          if (isNaN(value)) {
            if (rank === "A") value = 11;
            else if (["J", "Q", "K"].includes(rank)) value = 10;
          }
          deck.push({ suit, rank, value });
        }
      }
    }

    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateBlackjackPlayers(count: number): BlackjackPlayer[] {
    const players: BlackjackPlayer[] = [];
    const names = [
      "CardCounter",
      "BasicStrategy",
      "LuckyPlayer",
      "HighRoller",
      "Conservative",
      "Aggressive",
      "Newbie",
    ];

    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        username: names[i] || `Player${i + 1}`,
        chipCount: Math.floor(Math.random() * 50000) + 5000,
        seat: i + 1,
        isActive: true,
        currentHandIndex: 0,
      });
    }

    return players;
  }

  private generateRouletteePlayers(count: number): RoulettePlayer[] {
    const players: RoulettePlayer[] = [];
    const names = [
      "RedPlayer",
      "BlackBetter",
      "NumberPicker",
      "SystemPlayer",
      "LuckyBetter",
      "Martingale",
      "Conservative",
    ];

    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        username: names[i] || `Player${i + 1}`,
        chipCount: Math.floor(Math.random() * 25000) + 2500,
        isActive: true,
      });
    }

    return players;
  }

  private generateBaccaratPlayers(count: number): BaccaratPlayer[] {
    const players: BaccaratPlayer[] = [];
    const names = [
      "BankerBetter",
      "PlayerPicker",
      "TieHunter",
      "PatternPlayer",
      "HighStakes",
      "Conservative",
    ];

    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        username: names[i] || `Player${i + 1}`,
        chipCount: Math.floor(Math.random() * 75000) + 10000,
        isActive: true,
      });
    }

    return players;
  }

  private generateCrapsPlayers(count: number): CrapsPlayer[] {
    const players: CrapsPlayer[] = [];
    const names = [
      "DiceShooter",
      "PassLineBetter",
      "DontPlayer",
      "FieldBetter",
      "OddsBetter",
      "HardWayPlayer",
    ];

    for (let i = 0; i < count; i++) {
      players.push({
        id: `player-${i + 1}`,
        username: names[i] || `Player${i + 1}`,
        chipCount: Math.floor(Math.random() * 30000) + 3000,
        position: i + 1,
        isActive: true,
        isShooter: i === 2,
      });
    }

    return players;
  }

  private generateBaccaratResults(count: number): BaccaratResult[] {
    const results: BaccaratResult[] = [];
    const outcomes: BaccaratResult["outcome"][] = ["player", "banker", "tie"];

    for (let i = 0; i < count; i++) {
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      results.push({
        outcome,
        playerScore: Math.floor(Math.random() * 10),
        bankerScore: Math.floor(Math.random() * 10),
        playerPair: Math.random() > 0.9,
        bankerPair: Math.random() > 0.9,
        timestamp: new Date(Date.now() - i * 120000), // 2 minutes apart
      });
    }

    return results;
  }

  private generateCrapsRolls(count: number): CrapsRoll[] {
    const rolls: CrapsRoll[] = [];

    for (let i = 0; i < count; i++) {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      const total = die1 + die2;

      rolls.push({
        dice: [die1, die2],
        total,
        timestamp: new Date(Date.now() - i * 30000), // 30 seconds apart
        isNatural: [7, 11].includes(total),
        isCraps: [2, 3, 12].includes(total),
        isYo: total === 11,
        isHard: die1 === die2 && [4, 6, 8, 10].includes(total),
      });
    }

    return rolls;
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate roulette spins
      this.rouletteTables.forEach((table) => {
        if (table.gamePhase === "betting") {
          table.bettingTimeLeft = Math.max(0, table.bettingTimeLeft - 1);
          if (table.bettingTimeLeft === 0) {
            table.gamePhase = "spinning";
            table.spinStartTime = new Date();
            // Simulate spin result after 5 seconds
            setTimeout(() => {
              const number = Math.floor(
                Math.random() * (table.type === "american" ? 38 : 37),
              );
              table.currentNumber = number;
              table.lastNumbers.unshift(number);
              table.lastNumbers = table.lastNumbers.slice(0, 20);
              table.gamePhase = "complete";

              // Reset for next round after 5 seconds
              setTimeout(() => {
                table.gamePhase = "betting";
                table.bettingTimeLeft = 30;
                table.currentNumber = undefined;
              }, 5000);
            }, 5000);
          }
        }
      });

      // Simulate craps rolls
      this.crapsTables.forEach((table) => {
        if (Math.random() > 0.85) {
          const die1 = Math.floor(Math.random() * 6) + 1;
          const die2 = Math.floor(Math.random() * 6) + 1;
          const total = die1 + die2;

          const roll: CrapsRoll = {
            dice: [die1, die2],
            total,
            timestamp: new Date(),
            isNatural: [7, 11].includes(total),
            isCraps: [2, 3, 12].includes(total),
            isYo: total === 11,
            isHard: die1 === die2 && [4, 6, 8, 10].includes(total),
          };

          table.lastRoll = roll;
          table.rollHistory.unshift(roll);
          table.rollHistory = table.rollHistory.slice(0, 50);

          if (table.gamePhase === "come-out") {
            if ([7, 11].includes(total)) {
              // Natural winner
            } else if ([2, 3, 12].includes(total)) {
              // Craps
            } else {
              // Point established
              table.point = total;
              table.gamePhase = "point";
            }
          } else if (table.gamePhase === "point") {
            if (total === table.point) {
              // Point made
              table.gamePhase = "come-out";
              table.point = undefined;
            } else if (total === 7) {
              // Seven out
              table.gamePhase = "come-out";
              table.point = undefined;
              // Change shooter
              const currentShooterIndex = table.players.findIndex(
                (p) => p.isShooter,
              );
              if (currentShooterIndex !== -1) {
                table.players[currentShooterIndex].isShooter = false;
                const nextShooterIndex =
                  (currentShooterIndex + 1) % table.players.length;
                table.players[nextShooterIndex].isShooter = true;
                table.shooter = table.players[nextShooterIndex].id;
              }
            }
          }
        }
      });

      // Update player counts randomly
      [
        this.blackjackTables,
        this.rouletteTables,
        this.baccaratTables,
        this.crapsTables,
      ].forEach((tableMap) => {
        tableMap.forEach((table) => {
          const change = Math.floor(Math.random() * 3) - 1;
          table.players = table.players.filter(() => Math.random() > 0.05); // Occasional player leaving

          // Occasionally add new players
          if (Math.random() > 0.9 && table.players.length < table.maxPlayers) {
            // Add logic to create new player
          }
        });
      });

      // Simulate chat messages
      if (Math.random() > 0.9) {
        this.simulateRandomChatMessage();
      }
    }, 1000);
  }

  private simulateRandomChatMessage() {
    const messages = [
      "Good luck everyone!",
      "Hit me!",
      "Let it ride!",
      "Come on red!",
      "Natural!",
      "Seven out!",
      "Banker wins!",
      "Nice hit!",
      "Dealer busts!",
      "Hot table!",
    ];

    const allTables = [
      ...Array.from(this.blackjackTables.keys()),
      ...Array.from(this.rouletteTables.keys()),
      ...Array.from(this.baccaratTables.keys()),
      ...Array.from(this.crapsTables.keys()),
    ];

    if (allTables.length === 0) return;

    const randomTableId =
      allTables[Math.floor(Math.random() * allTables.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const chatMessage: TableGameChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      tableId: randomTableId,
      username: `Player${Math.floor(Math.random() * 100)}`,
      message: randomMessage,
      timestamp: new Date(),
      type: "player",
    };

    const history = this.chatHistory.get(randomTableId) || [];
    history.push(chatMessage);
    this.chatHistory.set(randomTableId, history.slice(-100));
  }

  // Public API methods
  public getBlackjackTables(): BlackjackTable[] {
    return Array.from(this.blackjackTables.values());
  }

  public getRouletteTables(): RouletteTable[] {
    return Array.from(this.rouletteTables.values());
  }

  public getBaccaratTables(): BaccaratTable[] {
    return Array.from(this.baccaratTables.values());
  }

  public getCrapsTables(): CrapsTable[] {
    return Array.from(this.crapsTables.values());
  }

  public getPlayerStats(): TableGameStats | null {
    return this.playerStats;
  }

  public getChatHistory(tableId: string): TableGameChatMessage[] {
    return this.chatHistory.get(tableId) || [];
  }

  // Blackjack methods
  public hitCard(
    tableId: string,
    playerId: string,
    handIndex: number = 0,
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("blackjack_hit", { tableId, playerId, handIndex });
    }
  }

  public stand(tableId: string, playerId: string, handIndex: number = 0): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("blackjack_stand", { tableId, playerId, handIndex });
    }
  }

  public doubleDown(
    tableId: string,
    playerId: string,
    handIndex: number = 0,
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("blackjack_double", { tableId, playerId, handIndex });
    }
  }

  public splitHand(
    tableId: string,
    playerId: string,
    handIndex: number = 0,
  ): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("blackjack_split", { tableId, playerId, handIndex });
    }
  }

  public surrender(tableId: string, playerId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("blackjack_surrender", { tableId, playerId });
    }
  }

  // Roulette methods
  public placeBet(tableId: string, bet: RouletteBet): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("roulette_bet", { tableId, bet });
    }
  }

  public removeBet(tableId: string, betId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("roulette_remove_bet", { tableId, betId });
    }
  }

  // Baccarat methods
  public placeBaccaratBet(tableId: string, bet: BaccaratBet): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("baccarat_bet", { tableId, bet });
    }
  }

  // Craps methods
  public placeCrapsBet(tableId: string, bet: CrapsBet): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("craps_bet", { tableId, bet });
    }
  }

  public rollDice(tableId: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("craps_roll", { tableId });
    }
  }

  // General methods
  public joinTable(tableId: string, gameType: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("join_table", { tableId, gameType });
    }
  }

  public leaveTable(tableId: string, gameType: string): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leave_table", { tableId, gameType });
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
      const chatMessage: TableGameChatMessage = {
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

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const tableGamesService = new TableGamesService();
