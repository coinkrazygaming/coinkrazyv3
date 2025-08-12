import { io, Socket } from "socket.io-client";

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  gameType: "poker" | "bingo" | "blackjack" | "mixed";
  format: TournamentFormat;
  status: TournamentStatus;
  startTime: Date;
  endTime?: Date;
  registrationStart: Date;
  registrationEnd: Date;
  lateRegistrationEnd?: Date;
  buyIn: TournamentBuyIn;
  guaranteedPrize?: number;
  currentPrizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  registeredPlayers: TournamentPlayer[];
  structure: TournamentStructure;
  payouts: TournamentPayout[];
  currentLevel: number;
  nextLevelTime?: Date;
  description: string;
  rules: string;
  isVIP: boolean;
  isFeatured: boolean;
  category: "daily" | "weekly" | "monthly" | "special" | "satellite";
  image?: string;
  tags: string[];
  host?: TournamentHost;
  prizes: TournamentPrize[];
  statistics: TournamentStatistics;
}

export interface TournamentPlayer {
  id: string;
  username: string;
  registrationTime: Date;
  currentChips?: number;
  tableId?: string;
  seat?: number;
  position?: number;
  isEliminated: boolean;
  eliminationTime?: Date;
  eliminationType?: "knockout" | "timeout" | "disconnection";
  rebuysUsed: number;
  addOnsUsed: number;
  bountyCollected?: number;
  payout?: number;
  isOnline: boolean;
  lastActivity: Date;
}

export interface TournamentStructure {
  levels: TournamentLevel[];
  blindIncrease: BlindIncreaseType;
  startingChips: number;
  rebuyPeriod?: number; // minutes
  rebuyAmount?: number;
  rebuyChips?: number;
  addOnTime?: number; // minutes after start
  addOnAmount?: number;
  addOnChips?: number;
  maxRebuys?: number;
  maxAddOns?: number;
  breakSchedule: TournamentBreak[];
}

export interface TournamentLevel {
  level: number;
  smallBlind?: number;
  bigBlind?: number;
  ante?: number;
  duration: number; // minutes
  gameSpecificData?: any; // For non-poker games
}

export interface TournamentBreak {
  afterLevel: number;
  duration: number; // minutes
  type: "standard" | "dinner" | "extended";
  description?: string;
}

export interface TournamentBuyIn {
  gc: number;
  sc: number;
  fee: number;
  totalCost: number;
}

export interface TournamentPayout {
  position: number;
  percentage: number;
  amount?: number;
  description: string;
  isPaid: boolean;
}

export interface TournamentPrize {
  id: string;
  type: "cash" | "entry" | "merchandise" | "bonus";
  description: string;
  value: number;
  position?: number;
  isSpecial: boolean;
}

export interface TournamentHost {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  experience: number;
  rating: number;
  specialties: string[];
}

export interface TournamentStatistics {
  totalEntries: number;
  averageEntries: number;
  largestPrizePool: number;
  fastestFinish: number; // minutes
  longestGame: number; // minutes
  topFinishers: TopFinisher[];
  repeatWinners: number;
}

export interface TopFinisher {
  username: string;
  position: number;
  payout: number;
  timestamp: Date;
}

export interface TournamentSchedule {
  id: string;
  name: string;
  description: string;
  tournaments: ScheduledTournament[];
  timezone: string;
  isActive: boolean;
}

export interface ScheduledTournament {
  templateId: string;
  dayOfWeek?: number; // 0-6, Sunday = 0
  time: string; // HH:MM format
  frequency: "daily" | "weekly" | "monthly" | "once";
  isActive: boolean;
  nextOccurrence: Date;
}

export interface TournamentSatellite {
  id: string;
  name: string;
  targetTournament: string;
  seatsGuaranteed: number;
  currentSatellites: number;
  buyIn: TournamentBuyIn;
  structure: TournamentStructure;
  schedule: Date[];
}

export interface TournamentSeries {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tournaments: string[];
  leaderboard: SeriesLeaderboard[];
  overallPrizes: TournamentPrize[];
  isActive: boolean;
}

export interface SeriesLeaderboard {
  playerId: string;
  username: string;
  points: number;
  position: number;
  tournamentsPlayed: number;
  bestFinish: number;
  totalWinnings: number;
}

export interface TournamentRegistration {
  tournamentId: string;
  playerId: string;
  registrationTime: Date;
  buyInPaid: TournamentBuyIn;
  status: "pending" | "confirmed" | "cancelled" | "waitlist";
  waitlistPosition?: number;
  notes?: string;
}

export interface TournamentTable {
  id: string;
  tournamentId: string;
  tableNumber: number;
  players: TournamentPlayer[];
  currentLevel: number;
  status: "waiting" | "playing" | "finished";
  dealer?: string;
  gameState?: any;
}

// Enums
export type TournamentType =
  | "single-table"
  | "multi-table"
  | "sit-and-go"
  | "scheduled"
  | "heads-up"
  | "knockout"
  | "bounty"
  | "satellite"
  | "freeroll";

export type TournamentFormat =
  | "freezeout"
  | "rebuy"
  | "add-on"
  | "unlimited-rebuy"
  | "progressive-knockout"
  | "mystery-bounty"
  | "turbo"
  | "hyper-turbo";

export type TournamentStatus =
  | "scheduled"
  | "registering"
  | "starting"
  | "active"
  | "break"
  | "final-table"
  | "heads-up"
  | "finished"
  | "cancelled"
  | "postponed";

export type BlindIncreaseType = "time-based" | "hand-based" | "level-based";

class TournamentService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private tournaments: Map<string, Tournament> = new Map();
  private schedules: Map<string, TournamentSchedule> = new Map();
  private satellites: Map<string, TournamentSatellite> = new Map();
  private series: Map<string, TournamentSeries> = new Map();
  private registrations: Map<string, TournamentRegistration> = new Map();
  private tables: Map<string, TournamentTable[]> = new Map();

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
          path: "/tournaments",
          transports: ["websocket", "polling"],
          timeout: 20000,
          retries: 3,
        },
      );

      this.setupSocketListeners();
    } catch (error) {
      console.warn(
        "Tournament WebSocket initialization failed, using mock data:",
        error,
      );
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Tournament service connected");
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", () => {
      console.log("Tournament service disconnected");
      this.handleReconnection();
    });

    this.socket.on("tournament_update", (tournament: Tournament) => {
      this.tournaments.set(tournament.id, tournament);
    });

    this.socket.on(
      "tournament_registration",
      (data: { tournamentId: string; player: TournamentPlayer }) => {
        const tournament = this.tournaments.get(data.tournamentId);
        if (tournament) {
          tournament.registeredPlayers.push(data.player);
          tournament.currentParticipants++;
          tournament.currentPrizePool += tournament.buyIn.totalCost;
        }
      },
    );

    this.socket.on(
      "tournament_started",
      (data: { tournamentId: string; tables: TournamentTable[] }) => {
        const tournament = this.tournaments.get(data.tournamentId);
        if (tournament) {
          tournament.status = "active";
          this.tables.set(data.tournamentId, data.tables);
        }
      },
    );

    this.socket.on(
      "level_change",
      (data: { tournamentId: string; level: number }) => {
        const tournament = this.tournaments.get(data.tournamentId);
        if (tournament) {
          tournament.currentLevel = data.level;
          tournament.nextLevelTime = new Date(
            Date.now() +
              tournament.structure.levels[data.level - 1].duration * 60000,
          );
        }
      },
    );

    this.socket.on(
      "player_eliminated",
      (data: { tournamentId: string; playerId: string; position: number }) => {
        const tournament = this.tournaments.get(data.tournamentId);
        if (tournament) {
          const player = tournament.registeredPlayers.find(
            (p) => p.id === data.playerId,
          );
          if (player) {
            player.isEliminated = true;
            player.eliminationTime = new Date();
            player.position = data.position;

            // Calculate payout if in money
            const payout = tournament.payouts.find(
              (p) => p.position === data.position,
            );
            if (payout) {
              player.payout =
                (tournament.currentPrizePool * payout.percentage) / 100;
              payout.isPaid = true;
            }
          }
        }
      },
    );

    this.socket.on(
      "tournament_break",
      (data: { tournamentId: string; breakDuration: number }) => {
        const tournament = this.tournaments.get(data.tournamentId);
        if (tournament) {
          tournament.status = "break";
        }
      },
    );

    this.socket.on(
      "tournament_finished",
      (data: { tournamentId: string; winner: TournamentPlayer }) => {
        const tournament = this.tournaments.get(data.tournamentId);
        if (tournament) {
          tournament.status = "finished";
          tournament.endTime = new Date();
        }
      },
    );
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
    // Load mock tournaments
    const mockTournaments: Tournament[] = [
      {
        id: "daily-turbo",
        name: "Daily Turbo Championship",
        type: "multi-table",
        gameType: "poker",
        format: "turbo",
        status: "registering",
        startTime: new Date(Date.now() + 1800000), // 30 minutes
        registrationStart: new Date(Date.now() - 3600000), // 1 hour ago
        registrationEnd: new Date(Date.now() + 1500000), // 25 minutes
        buyIn: { gc: 1000, sc: 5, fee: 100, totalCost: 1105 },
        guaranteedPrize: 25000,
        currentPrizePool: 18500,
        maxParticipants: 200,
        currentParticipants: 87,
        registeredPlayers: [],
        structure: this.generateTournamentStructure("turbo"),
        payouts: this.generatePayoutStructure(200),
        currentLevel: 1,
        description: "Fast-paced daily tournament with guaranteed prize pool",
        rules:
          "Standard poker tournament rules apply. Turbo structure with 8-minute levels.",
        isVIP: false,
        isFeatured: true,
        category: "daily",
        tags: ["Fast", "Guaranteed", "Popular"],
        prizes: [
          {
            id: "p1",
            type: "cash",
            description: "First Place",
            value: 7500,
            position: 1,
            isSpecial: false,
          },
          {
            id: "p2",
            type: "entry",
            description: "Sunday Major Entry",
            value: 500,
            position: 1,
            isSpecial: true,
          },
        ],
        statistics: {
          totalEntries: 2847,
          averageEntries: 156,
          largestPrizePool: 45000,
          fastestFinish: 123,
          longestGame: 287,
          topFinishers: [],
          repeatWinners: 23,
        },
      },
      {
        id: "sunday-major",
        name: "Sunday Major Championship",
        type: "multi-table",
        gameType: "poker",
        format: "freezeout",
        status: "scheduled",
        startTime: new Date(Date.now() + 86400000 * 3), // 3 days
        registrationStart: new Date(Date.now() + 86400000 * 2), // 2 days
        registrationEnd: new Date(Date.now() + 86400000 * 3 - 1800000), // 30 min before start
        lateRegistrationEnd: new Date(Date.now() + 86400000 * 3 + 3600000), // 1 hour after start
        buyIn: { gc: 5000, sc: 25, fee: 500, totalCost: 5525 },
        guaranteedPrize: 100000,
        currentPrizePool: 34500,
        maxParticipants: 1000,
        currentParticipants: 67,
        registeredPlayers: [],
        structure: this.generateTournamentStructure("standard"),
        payouts: this.generatePayoutStructure(1000),
        currentLevel: 1,
        description:
          "Weekly flagship tournament with massive guaranteed prize pool",
        rules:
          "Standard tournament rules. Deep stack structure with 15-minute levels.",
        isVIP: false,
        isFeatured: true,
        category: "weekly",
        tags: ["Major", "Guaranteed", "Deep Stack"],
        host: {
          id: "host-1",
          name: "Tournament Director Sarah",
          title: "Senior Tournament Director",
          experience: 8,
          rating: 4.9,
          specialties: ["Multi-Table", "Major Events", "Live Streaming"],
        },
        prizes: [
          {
            id: "p1",
            type: "cash",
            description: "Champion Prize",
            value: 30000,
            position: 1,
            isSpecial: false,
          },
          {
            id: "p2",
            type: "merchandise",
            description: "Champion Trophy",
            value: 500,
            position: 1,
            isSpecial: true,
          },
          {
            id: "p3",
            type: "entry",
            description: "Monthly Series Entry",
            value: 1000,
            position: 1,
            isSpecial: true,
          },
        ],
        statistics: {
          totalEntries: 12456,
          averageEntries: 845,
          largestPrizePool: 125000,
          fastestFinish: 234,
          longestGame: 567,
          topFinishers: [],
          repeatWinners: 67,
        },
      },
      {
        id: "bingo-tournament",
        name: "Bingo Championship Series",
        type: "multi-table",
        gameType: "bingo",
        format: "freezeout",
        status: "active",
        startTime: new Date(Date.now() - 1800000), // 30 minutes ago
        registrationStart: new Date(Date.now() - 7200000), // 2 hours ago
        registrationEnd: new Date(Date.now() - 1800000), // 30 minutes ago
        buyIn: { gc: 500, sc: 2, fee: 50, totalCost: 552 },
        guaranteedPrize: 15000,
        currentPrizePool: 18750,
        maxParticipants: 150,
        currentParticipants: 127,
        registeredPlayers: [],
        structure: this.generateBingoStructure(),
        payouts: this.generatePayoutStructure(150),
        currentLevel: 3,
        nextLevelTime: new Date(Date.now() + 420000), // 7 minutes
        description: "Multi-round bingo tournament with progressive difficulty",
        rules:
          "Standard bingo rules. Multiple patterns and increasing difficulty each round.",
        isVIP: false,
        isFeatured: false,
        category: "special",
        tags: ["Bingo", "Multi-Round", "Community"],
        prizes: [
          {
            id: "p1",
            type: "cash",
            description: "Bingo Champion",
            value: 5000,
            position: 1,
            isSpecial: false,
          },
          {
            id: "p2",
            type: "bonus",
            description: "Free Cards Bonus",
            value: 100,
            position: 1,
            isSpecial: true,
          },
        ],
        statistics: {
          totalEntries: 1876,
          averageEntries: 124,
          largestPrizePool: 25000,
          fastestFinish: 45,
          longestGame: 123,
          topFinishers: [],
          repeatWinners: 15,
        },
      },
      {
        id: "vip-exclusive",
        name: "VIP Exclusive Tournament",
        type: "single-table",
        gameType: "poker",
        format: "freezeout",
        status: "registering",
        startTime: new Date(Date.now() + 7200000), // 2 hours
        registrationStart: new Date(Date.now() - 1800000), // 30 minutes ago
        registrationEnd: new Date(Date.now() + 6900000), // 1h 55m
        buyIn: { gc: 10000, sc: 50, fee: 1000, totalCost: 11050 },
        currentPrizePool: 45000,
        maxParticipants: 8,
        currentParticipants: 6,
        registeredPlayers: [],
        structure: this.generateTournamentStructure("vip"),
        payouts: [
          { position: 1, percentage: 60, description: "Winner", isPaid: false },
          {
            position: 2,
            percentage: 40,
            description: "Runner-up",
            isPaid: false,
          },
        ],
        currentLevel: 1,
        description: "Exclusive VIP tournament for high-stakes players",
        rules:
          "VIP tournament rules. Professional dealer and premium experience.",
        isVIP: true,
        isFeatured: true,
        category: "special",
        tags: ["VIP", "High Stakes", "Exclusive", "Single Table"],
        host: {
          id: "host-2",
          name: "VIP Host Marcus",
          title: "VIP Tournament Manager",
          experience: 12,
          rating: 5.0,
          specialties: ["VIP Events", "High Stakes", "Personal Service"],
        },
        prizes: [
          {
            id: "p1",
            type: "cash",
            description: "VIP Champion Prize",
            value: 27000,
            position: 1,
            isSpecial: false,
          },
          {
            id: "p2",
            type: "merchandise",
            description: "VIP Champion Ring",
            value: 2000,
            position: 1,
            isSpecial: true,
          },
          {
            id: "p3",
            type: "entry",
            description: "Monthly VIP Series",
            value: 5000,
            position: 1,
            isSpecial: true,
          },
        ],
        statistics: {
          totalEntries: 234,
          averageEntries: 7,
          largestPrizePool: 75000,
          fastestFinish: 67,
          longestGame: 245,
          topFinishers: [],
          repeatWinners: 8,
        },
      },
    ];

    mockTournaments.forEach((tournament) =>
      this.tournaments.set(tournament.id, tournament),
    );

    // Load mock tournament series
    const mockSeries: TournamentSeries[] = [
      {
        id: "championship-series",
        name: "Monthly Championship Series",
        description:
          "Compete across multiple tournaments for the overall championship",
        startDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
        endDate: new Date(Date.now() + 86400000 * 25), // 25 days
        tournaments: ["daily-turbo", "sunday-major", "vip-exclusive"],
        leaderboard: [
          {
            playerId: "player-1",
            username: "ChampionPlayer",
            points: 250,
            position: 1,
            tournamentsPlayed: 5,
            bestFinish: 1,
            totalWinnings: 15000,
          },
          {
            playerId: "player-2",
            username: "SeriesGrinder",
            points: 200,
            position: 2,
            tournamentsPlayed: 8,
            bestFinish: 2,
            totalWinnings: 12000,
          },
        ],
        overallPrizes: [
          {
            id: "series-1",
            type: "cash",
            description: "Series Champion",
            value: 50000,
            isSpecial: true,
          },
          {
            id: "series-2",
            type: "entry",
            description: "Next Series Entry",
            value: 10000,
            isSpecial: true,
          },
        ],
        isActive: true,
      },
    ];

    mockSeries.forEach((series) => this.series.set(series.id, series));

    // Load mock schedules
    const mockSchedules: TournamentSchedule[] = [
      {
        id: "daily-schedule",
        name: "Daily Tournament Schedule",
        description: "Regular daily tournaments throughout the week",
        tournaments: [
          {
            templateId: "daily-turbo-template",
            time: "19:00",
            frequency: "daily",
            isActive: true,
            nextOccurrence: new Date(Date.now() + 3600000),
          },
          {
            templateId: "evening-freeroll-template",
            time: "21:00",
            frequency: "daily",
            isActive: true,
            nextOccurrence: new Date(Date.now() + 7200000),
          },
        ],
        timezone: "UTC",
        isActive: true,
      },
    ];

    mockSchedules.forEach((schedule) =>
      this.schedules.set(schedule.id, schedule),
    );
  }

  private generateTournamentStructure(type: string): TournamentStructure {
    switch (type) {
      case "turbo":
        return {
          levels: [
            { level: 1, smallBlind: 10, bigBlind: 20, duration: 8 },
            { level: 2, smallBlind: 15, bigBlind: 30, duration: 8 },
            { level: 3, smallBlind: 25, bigBlind: 50, duration: 8 },
            { level: 4, smallBlind: 50, bigBlind: 100, duration: 8 },
            { level: 5, smallBlind: 75, bigBlind: 150, ante: 15, duration: 8 },
            { level: 6, smallBlind: 100, bigBlind: 200, ante: 20, duration: 8 },
          ],
          blindIncrease: "time-based",
          startingChips: 3000,
          breakSchedule: [
            { afterLevel: 6, duration: 5, type: "standard" },
            { afterLevel: 12, duration: 5, type: "standard" },
          ],
        };
      case "standard":
        return {
          levels: [
            { level: 1, smallBlind: 25, bigBlind: 50, duration: 15 },
            { level: 2, smallBlind: 50, bigBlind: 100, duration: 15 },
            { level: 3, smallBlind: 75, bigBlind: 150, duration: 15 },
            { level: 4, smallBlind: 100, bigBlind: 200, duration: 15 },
            {
              level: 5,
              smallBlind: 150,
              bigBlind: 300,
              ante: 25,
              duration: 15,
            },
            {
              level: 6,
              smallBlind: 200,
              bigBlind: 400,
              ante: 50,
              duration: 15,
            },
          ],
          blindIncrease: "time-based",
          startingChips: 10000,
          rebuyPeriod: 120,
          rebuyAmount: 500,
          rebuyChips: 5000,
          addOnTime: 120,
          addOnAmount: 500,
          addOnChips: 7500,
          maxRebuys: 3,
          maxAddOns: 1,
          breakSchedule: [
            { afterLevel: 6, duration: 15, type: "standard" },
            { afterLevel: 12, duration: 60, type: "dinner" },
            { afterLevel: 18, duration: 15, type: "standard" },
          ],
        };
      case "vip":
        return {
          levels: [
            { level: 1, smallBlind: 50, bigBlind: 100, duration: 20 },
            { level: 2, smallBlind: 75, bigBlind: 150, duration: 20 },
            { level: 3, smallBlind: 100, bigBlind: 200, duration: 20 },
            { level: 4, smallBlind: 150, bigBlind: 300, duration: 20 },
          ],
          blindIncrease: "time-based",
          startingChips: 25000,
          breakSchedule: [{ afterLevel: 4, duration: 10, type: "standard" }],
        };
      default:
        return this.generateTournamentStructure("standard");
    }
  }

  private generateBingoStructure(): TournamentStructure {
    return {
      levels: [
        {
          level: 1,
          duration: 15,
          gameSpecificData: { pattern: "line", difficulty: "easy" },
        },
        {
          level: 2,
          duration: 15,
          gameSpecificData: { pattern: "four-corners", difficulty: "easy" },
        },
        {
          level: 3,
          duration: 20,
          gameSpecificData: { pattern: "x-pattern", difficulty: "medium" },
        },
        {
          level: 4,
          duration: 20,
          gameSpecificData: { pattern: "full-house", difficulty: "hard" },
        },
      ],
      blindIncrease: "level-based",
      startingChips: 1,
      breakSchedule: [{ afterLevel: 2, duration: 5, type: "standard" }],
    };
  }

  private generatePayoutStructure(maxPlayers: number): TournamentPayout[] {
    const payoutPercentages = [
      { pos: 1, pct: 30 },
      { pos: 2, pct: 20 },
      { pos: 3, pct: 15 },
      { pos: 4, pct: 10 },
      { pos: 5, pct: 8 },
      { pos: 6, pct: 6 },
      { pos: 7, pct: 4 },
      { pos: 8, pct: 3 },
      { pos: 9, pct: 2 },
      { pos: 10, pct: 2 },
    ];

    const payoutPositions = Math.min(Math.floor(maxPlayers / 10), 10);

    return payoutPercentages.slice(0, payoutPositions).map((p) => ({
      position: p.pos,
      percentage: p.pct,
      description:
        p.pos === 1
          ? "Winner"
          : p.pos === 2
            ? "Runner-up"
            : p.pos === 3
              ? "Third place"
              : `${p.pos}th place`,
      isPaid: false,
    }));
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate tournament registration changes
      this.tournaments.forEach((tournament) => {
        if (tournament.status === "registering") {
          const change = Math.floor(Math.random() * 3);
          tournament.currentParticipants = Math.min(
            tournament.maxParticipants,
            tournament.currentParticipants + change,
          );
          tournament.currentPrizePool =
            tournament.currentParticipants * tournament.buyIn.totalCost;

          // Start tournament if time reached
          if (new Date() >= tournament.startTime) {
            tournament.status = "starting";
          }
        }

        // Simulate level progression for active tournaments
        if (tournament.status === "active" && tournament.nextLevelTime) {
          if (new Date() >= tournament.nextLevelTime) {
            tournament.currentLevel++;
            const nextLevel =
              tournament.structure.levels[tournament.currentLevel - 1];
            if (nextLevel) {
              tournament.nextLevelTime = new Date(
                Date.now() + nextLevel.duration * 60000,
              );
            }
          }
        }
      });

      // Update series leaderboards
      this.series.forEach((series) => {
        if (series.isActive) {
          series.leaderboard.forEach((player) => {
            // Simulate small point changes
            if (Math.random() > 0.95) {
              player.points += Math.floor(Math.random() * 10);
            }
          });

          // Sort leaderboard
          series.leaderboard.sort((a, b) => b.points - a.points);
          series.leaderboard.forEach((player, index) => {
            player.position = index + 1;
          });
        }
      });
    }, 5000);
  }

  // Public API methods
  public getTournaments(filters?: {
    gameType?: string;
    status?: TournamentStatus;
    category?: string;
    isVIP?: boolean;
    isFeatured?: boolean;
  }): Tournament[] {
    let tournaments = Array.from(this.tournaments.values());

    if (filters) {
      if (filters.gameType) {
        tournaments = tournaments.filter(
          (t) => t.gameType === filters.gameType,
        );
      }
      if (filters.status) {
        tournaments = tournaments.filter((t) => t.status === filters.status);
      }
      if (filters.category) {
        tournaments = tournaments.filter(
          (t) => t.category === filters.category,
        );
      }
      if (filters.isVIP !== undefined) {
        tournaments = tournaments.filter((t) => t.isVIP === filters.isVIP);
      }
      if (filters.isFeatured !== undefined) {
        tournaments = tournaments.filter(
          (t) => t.isFeatured === filters.isFeatured,
        );
      }
    }

    return tournaments.sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );
  }

  public getTournament(tournamentId: string): Tournament | undefined {
    return this.tournaments.get(tournamentId);
  }

  public getTournamentSeries(): TournamentSeries[] {
    return Array.from(this.series.values()).filter((s) => s.isActive);
  }

  public getSchedules(): TournamentSchedule[] {
    return Array.from(this.schedules.values()).filter((s) => s.isActive);
  }

  public getSatellites(): TournamentSatellite[] {
    return Array.from(this.satellites.values());
  }

  public getTournamentTables(tournamentId: string): TournamentTable[] {
    return this.tables.get(tournamentId) || [];
  }

  public registerForTournament(
    tournamentId: string,
    playerId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const tournament = this.tournaments.get(tournamentId);
      if (!tournament) {
        resolve({ success: false, error: "Tournament not found" });
        return;
      }

      if (
        tournament.status !== "registering" &&
        tournament.status !== "scheduled"
      ) {
        resolve({ success: false, error: "Registration is closed" });
        return;
      }

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        resolve({ success: false, error: "Tournament is full" });
        return;
      }

      if (tournament.registeredPlayers.some((p) => p.id === playerId)) {
        resolve({ success: false, error: "Already registered" });
        return;
      }

      // Simulate registration
      setTimeout(() => {
        const registration: TournamentRegistration = {
          tournamentId,
          playerId,
          registrationTime: new Date(),
          buyInPaid: tournament.buyIn,
          status: "confirmed",
        };

        this.registrations.set(`${tournamentId}-${playerId}`, registration);

        const player: TournamentPlayer = {
          id: playerId,
          username: `Player${Math.random().toString(36).substr(2, 6)}`,
          registrationTime: new Date(),
          isEliminated: false,
          rebuysUsed: 0,
          addOnsUsed: 0,
          isOnline: true,
          lastActivity: new Date(),
        };

        tournament.registeredPlayers.push(player);
        tournament.currentParticipants++;
        tournament.currentPrizePool += tournament.buyIn.totalCost;

        resolve({ success: true });
      }, 1000);
    });
  }

  public unregisterFromTournament(
    tournamentId: string,
    playerId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const tournament = this.tournaments.get(tournamentId);
      if (!tournament) {
        resolve({ success: false, error: "Tournament not found" });
        return;
      }

      const playerIndex = tournament.registeredPlayers.findIndex(
        (p) => p.id === playerId,
      );
      if (playerIndex === -1) {
        resolve({
          success: false,
          error: "Not registered for this tournament",
        });
        return;
      }

      if (tournament.status === "active" || tournament.status === "finished") {
        resolve({
          success: false,
          error: "Cannot unregister from active or finished tournament",
        });
        return;
      }

      // Simulate unregistration
      setTimeout(() => {
        tournament.registeredPlayers.splice(playerIndex, 1);
        tournament.currentParticipants--;
        tournament.currentPrizePool -= tournament.buyIn.totalCost;

        this.registrations.delete(`${tournamentId}-${playerId}`);

        resolve({ success: true });
      }, 500);
    });
  }

  public getPlayerRegistrations(playerId: string): TournamentRegistration[] {
    return Array.from(this.registrations.values()).filter(
      (r) => r.playerId === playerId,
    );
  }

  public createTournament(
    tournamentData: Partial<Tournament>,
  ): Promise<{ success: boolean; tournamentId?: string; error?: string }> {
    return new Promise((resolve) => {
      if (this.socket && this.socket.connected) {
        this.socket.emit("create_tournament", tournamentData);
        resolve({ success: true, tournamentId: `tournament_${Date.now()}` });
      } else {
        // Simulate tournament creation in development
        const tournamentId = `custom_${Date.now()}`;
        const newTournament: Tournament = {
          id: tournamentId,
          name: tournamentData.name || "Custom Tournament",
          type: tournamentData.type || "multi-table",
          gameType: tournamentData.gameType || "poker",
          format: tournamentData.format || "freezeout",
          status: "scheduled",
          startTime: tournamentData.startTime || new Date(Date.now() + 3600000),
          registrationStart: new Date(),
          registrationEnd:
            tournamentData.startTime || new Date(Date.now() + 3600000),
          buyIn: tournamentData.buyIn || {
            gc: 1000,
            sc: 5,
            fee: 100,
            totalCost: 1105,
          },
          currentPrizePool: 0,
          maxParticipants: tournamentData.maxParticipants || 100,
          currentParticipants: 0,
          registeredPlayers: [],
          structure:
            tournamentData.structure ||
            this.generateTournamentStructure("standard"),
          payouts:
            tournamentData.payouts ||
            this.generatePayoutStructure(tournamentData.maxParticipants || 100),
          currentLevel: 1,
          description: tournamentData.description || "Custom tournament",
          rules: tournamentData.rules || "Standard tournament rules apply",
          isVIP: tournamentData.isVIP || false,
          isFeatured: false,
          category: tournamentData.category || "special",
          tags: tournamentData.tags || ["Custom"],
          prizes: tournamentData.prizes || [],
          statistics: {
            totalEntries: 0,
            averageEntries: 0,
            largestPrizePool: 0,
            fastestFinish: 0,
            longestGame: 0,
            topFinishers: [],
            repeatWinners: 0,
          },
        };

        this.tournaments.set(tournamentId, newTournament);
        resolve({ success: true, tournamentId });
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const tournamentService = new TournamentService();
