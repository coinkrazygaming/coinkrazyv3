import { io, Socket } from "socket.io-client";

// Sports Types
export interface SportEvent {
  id: string;
  sport: SportType;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: Date;
  status: EventStatus;
  period?: string;
  clock?: string;
  homeScore?: number;
  awayScore?: number;
  markets: BettingMarket[];
  featured: boolean;
  live: boolean;
  popular: boolean;
  category: 'main' | 'futures' | 'props' | 'live' | 'parlay';
}

export interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  logo?: string;
  record?: string;
  ranking?: number;
  form?: string; // Last 5 games: WWLWL
}

export interface BettingMarket {
  id: string;
  name: string;
  type: MarketType;
  outcomes: BettingOutcome[];
  isLive: boolean;
  isSuspended: boolean;
  category: 'main' | 'alt' | 'prop' | 'futures';
  description?: string;
  minBet: number;
  maxBet: number;
}

export interface BettingOutcome {
  id: string;
  name: string;
  odds: number;
  americanOdds: string;
  isAvailable: boolean;
  line?: number;
  total?: number;
  handicap?: number;
  implied_probability: number;
}

export interface SportsBet {
  id: string;
  userId: string;
  eventId: string;
  marketId: string;
  outcomeId: string;
  amount: number;
  odds: number;
  potentialPayout: number;
  status: BetStatus;
  placedAt: Date;
  settledAt?: Date;
  betType: 'single' | 'parlay' | 'system' | 'live';
  legs?: SportsBet[]; // For parlays
  cashOutValue?: number;
  cashOutAvailable: boolean;
}

export interface Parlay {
  id: string;
  legs: ParlayLeg[];
  totalOdds: number;
  totalAmount: number;
  potentialPayout: number;
  status: BetStatus;
  minLegs: number;
  maxLegs: number;
}

export interface ParlayLeg {
  eventId: string;
  marketId: string;
  outcomeId: string;
  eventName: string;
  selection: string;
  odds: number;
  status: 'pending' | 'won' | 'lost' | 'void';
}

export interface BettingStats {
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  winRate: number;
  avgBetSize: number;
  biggestWin: number;
  biggestLoss: number;
  favoriteLeague: string;
  favoriteBetType: string;
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  parlayAccuracy: number;
  liveWinRate: number;
  sportBreakdown: Record<string, {
    bets: number;
    wagered: number;
    profit: number;
    winRate: number;
  }>;
}

export interface LiveOddsUpdate {
  eventId: string;
  marketId: string;
  outcomeId: string;
  newOdds: number;
  timestamp: Date;
  movement: 'up' | 'down' | 'unchanged';
}

export interface BetSlip {
  selections: BetSlipSelection[];
  betType: 'single' | 'parlay' | 'system';
  totalStake: number;
  totalOdds: number;
  potentialPayout: number;
  systemBetOptions?: SystemBetOption[];
}

export interface BetSlipSelection {
  id: string;
  eventId: string;
  eventName: string;
  marketName: string;
  outcomeName: string;
  odds: number;
  line?: number;
  isLive: boolean;
  stake?: number; // For individual bets
}

export interface SystemBetOption {
  name: string;
  combinations: number;
  minCorrect: number;
  description: string;
}

// Enums
export type SportType = 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer' | 'tennis' | 'golf' | 'mma' | 'boxing' | 'racing' | 'esports';

export type EventStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled' | 'suspended';

export type MarketType = 'moneyline' | 'spread' | 'total' | 'props' | 'futures' | 'period' | 'live' | 'specials';

export type BetStatus = 'pending' | 'won' | 'lost' | 'void' | 'cash_out' | 'partial_cash_out';

export interface SportsPromotion {
  id: string;
  title: string;
  description: string;
  type: 'odds_boost' | 'free_bet' | 'deposit_match' | 'risk_free' | 'parlay_insurance';
  value: number;
  minOdds?: number;
  maxBet?: number;
  validUntil: Date;
  sports?: SportType[];
  leagues?: string[];
  isActive: boolean;
  termsAndConditions: string;
}

export interface LiveScoreUpdate {
  eventId: string;
  homeScore: number;
  awayScore: number;
  period: string;
  clock: string;
  lastPlay?: string;
  timestamp: Date;
}

class SportsBookService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private events: Map<string, SportEvent> = new Map();
  private bets: Map<string, SportsBet> = new Map();
  private betSlip: BetSlip = {
    selections: [],
    betType: 'single',
    totalStake: 0,
    totalOdds: 1,
    potentialPayout: 0
  };
  private stats: BettingStats | null = null;
  private promotions: SportsPromotion[] = [];
  private liveUpdatesEnabled = true;
  private oddsFormat: 'decimal' | 'american' | 'fractional' = 'american';

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    if (process.env.NODE_ENV === 'development') {
      this.loadMockData();
      this.simulateRealTimeUpdates();
    } else {
      this.initializeWebSocket();
    }
  }

  private initializeWebSocket() {
    if (typeof window === 'undefined') return;

    try {
      this.socket = io(process.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        path: '/sportsbook',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        retries: 3,
      });

      this.setupSocketListeners();
    } catch (error) {
      console.warn('SportsBook WebSocket initialization failed, using mock data:', error);
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('SportsBook service connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('SportsBook service disconnected');
      this.handleReconnection();
    });

    this.socket.on('odds_update', (update: LiveOddsUpdate) => {
      const event = this.events.get(update.eventId);
      if (event) {
        const market = event.markets.find(m => m.id === update.marketId);
        if (market) {
          const outcome = market.outcomes.find(o => o.id === update.outcomeId);
          if (outcome) {
            outcome.odds = update.newOdds;
            outcome.americanOdds = this.convertToAmericanOdds(update.newOdds);
            outcome.implied_probability = this.calculateImpliedProbability(update.newOdds);
          }
        }
      }
    });

    this.socket.on('score_update', (update: LiveScoreUpdate) => {
      const event = this.events.get(update.eventId);
      if (event) {
        event.homeScore = update.homeScore;
        event.awayScore = update.awayScore;
        event.period = update.period;
        event.clock = update.clock;
      }
    });

    this.socket.on('event_status_change', (data: { eventId: string; status: EventStatus }) => {
      const event = this.events.get(data.eventId);
      if (event) {
        event.status = data.status;
      }
    });

    this.socket.on('bet_settled', (bet: SportsBet) => {
      this.bets.set(bet.id, bet);
    });

    this.socket.on('market_suspended', (data: { eventId: string; marketId: string }) => {
      const event = this.events.get(data.eventId);
      if (event) {
        const market = event.markets.find(m => m.id === data.marketId);
        if (market) {
          market.isSuspended = true;
        }
      }
    });

    this.socket.on('new_event', (event: SportEvent) => {
      this.events.set(event.id, event);
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.initializeWebSocket();
      }, Math.pow(2, this.reconnectAttempts) * 1000);
    } else {
      console.warn('Max reconnection attempts reached, switching to offline mode');
      this.loadMockData();
      this.simulateRealTimeUpdates();
    }
  }

  private loadMockData() {
    // Generate mock events
    const mockEvents: SportEvent[] = [
      {
        id: 'nfl-chiefs-bills',
        sport: 'football',
        league: 'NFL',
        homeTeam: {
          id: 'kc',
          name: 'Chiefs',
          city: 'Kansas City',
          abbreviation: 'KC',
          record: '11-3',
          ranking: 1,
          form: 'WWWLW'
        },
        awayTeam: {
          id: 'buf',
          name: 'Bills',
          city: 'Buffalo',
          abbreviation: 'BUF',
          record: '10-4',
          ranking: 3,
          form: 'WLWWW'
        },
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        status: 'scheduled',
        markets: this.generateFootballMarkets(),
        featured: true,
        live: false,
        popular: true,
        category: 'main'
      },
      {
        id: 'nba-lakers-celtics',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: {
          id: 'bos',
          name: 'Celtics',
          city: 'Boston',
          abbreviation: 'BOS',
          record: '24-8',
          ranking: 2
        },
        awayTeam: {
          id: 'lal',
          name: 'Lakers',
          city: 'Los Angeles',
          abbreviation: 'LAL',
          record: '19-13',
          ranking: 8
        },
        startTime: new Date(Date.now() + 7200000), // 2 hours
        status: 'live',
        period: '2nd Quarter',
        clock: '8:45',
        homeScore: 58,
        awayScore: 52,
        markets: this.generateBasketballMarkets(),
        featured: true,
        live: true,
        popular: true,
        category: 'live'
      },
      {
        id: 'mlb-yankees-dodgers',
        sport: 'baseball',
        league: 'MLB',
        homeTeam: {
          id: 'lad',
          name: 'Dodgers',
          city: 'Los Angeles',
          abbreviation: 'LAD',
          record: '98-54'
        },
        awayTeam: {
          id: 'nyy',
          name: 'Yankees',
          city: 'New York',
          abbreviation: 'NYY',
          record: '95-57'
        },
        startTime: new Date(Date.now() + 43200000), // 12 hours
        status: 'scheduled',
        markets: this.generateBaseballMarkets(),
        featured: false,
        live: false,
        popular: true,
        category: 'main'
      },
      {
        id: 'ucl-madrid-barcelona',
        sport: 'soccer',
        league: 'UEFA Champions League',
        homeTeam: {
          id: 'rm',
          name: 'Real Madrid',
          city: 'Madrid',
          abbreviation: 'RM'
        },
        awayTeam: {
          id: 'fcb',
          name: 'Barcelona',
          city: 'Barcelona',
          abbreviation: 'FCB'
        },
        startTime: new Date(Date.now() + 172800000), // 2 days
        status: 'scheduled',
        markets: this.generateSoccerMarkets(),
        featured: true,
        live: false,
        popular: true,
        category: 'main'
      },
      {
        id: 'ufc-284',
        sport: 'mma',
        league: 'UFC',
        homeTeam: {
          id: 'fighter1',
          name: 'Jon Jones',
          city: '',
          abbreviation: 'JJ'
        },
        awayTeam: {
          id: 'fighter2',
          name: 'Stipe Miocic',
          city: '',
          abbreviation: 'SM'
        },
        startTime: new Date(Date.now() + 259200000), // 3 days
        status: 'scheduled',
        markets: this.generateMMAMarkets(),
        featured: true,
        live: false,
        popular: false,
        category: 'main'
      }
    ];

    mockEvents.forEach(event => this.events.set(event.id, event));

    // Generate mock promotions
    this.promotions = [
      {
        id: 'odds-boost-nfl',
        title: 'NFL Sunday Boost',
        description: 'Get enhanced odds on any NFL game this Sunday',
        type: 'odds_boost',
        value: 1.25, // 25% boost
        minOdds: 1.5,
        maxBet: 100,
        validUntil: new Date(Date.now() + 604800000), // 1 week
        sports: ['football'],
        leagues: ['NFL'],
        isActive: true,
        termsAndConditions: 'Valid for new and existing customers. Max bet $100. Enhanced odds paid as free bets.'
      },
      {
        id: 'parlay-insurance',
        title: 'Parlay Insurance',
        description: 'Get your stake back if one leg lets you down on 4+ leg parlays',
        type: 'parlay_insurance',
        value: 1.0, // 100% stake back
        minOdds: 2.0,
        maxBet: 50,
        validUntil: new Date(Date.now() + 1209600000), // 2 weeks
        isActive: true,
        termsAndConditions: 'Min 4 legs, each leg must be -200 or longer. Max refund $50.'
      },
      {
        id: 'first-bet-insurance',
        title: 'First Bet Insurance',
        description: 'Place your first bet with confidence - get your stake back if it loses',
        type: 'risk_free',
        value: 1.0,
        maxBet: 1000,
        validUntil: new Date(Date.now() + 2592000000), // 30 days
        isActive: true,
        termsAndConditions: 'New customers only. Refund paid as site credit.'
      }
    ];

    // Generate mock stats
    this.stats = {
      totalBets: 247,
      totalWagered: 12450,
      totalWon: 8670,
      totalLost: 6830,
      netProfit: 1840,
      winRate: 41.7,
      avgBetSize: 50.4,
      biggestWin: 850,
      biggestLoss: 200,
      favoriteLeague: 'NFL',
      favoriteBetType: 'moneyline',
      currentStreak: 3,
      longestWinStreak: 8,
      longestLoseStreak: 5,
      parlayAccuracy: 23.1,
      liveWinRate: 38.2,
      sportBreakdown: {
        'football': { bets: 89, wagered: 4450, profit: 670, winRate: 44.9 },
        'basketball': { bets: 67, wagered: 3350, profit: 120, winRate: 41.8 },
        'baseball': { bets: 45, wagered: 2250, profit: 340, winRate: 42.2 },
        'soccer': { bets: 32, wagered: 1600, profit: 580, winRate: 46.9 },
        'hockey': { bets: 14, wagered: 800, profit: 130, winRate: 35.7 }
      }
    };
  }

  private generateFootballMarkets(): BettingMarket[] {
    return [
      {
        id: 'ml-nfl-1',
        name: 'Moneyline',
        type: 'moneyline',
        outcomes: [
          {
            id: 'ml-kc',
            name: 'Kansas City Chiefs',
            odds: 1.85,
            americanOdds: '-118',
            isAvailable: true,
            implied_probability: 54.1
          },
          {
            id: 'ml-buf',
            name: 'Buffalo Bills',
            odds: 2.00,
            americanOdds: '+100',
            isAvailable: true,
            implied_probability: 50.0
          }
        ],
        isLive: false,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 5000
      },
      {
        id: 'spread-nfl-1',
        name: 'Point Spread',
        type: 'spread',
        outcomes: [
          {
            id: 'spread-kc',
            name: 'Kansas City Chiefs',
            odds: 1.91,
            americanOdds: '-110',
            isAvailable: true,
            line: -2.5,
            implied_probability: 52.4
          },
          {
            id: 'spread-buf',
            name: 'Buffalo Bills',
            odds: 1.91,
            americanOdds: '-110',
            isAvailable: true,
            line: 2.5,
            implied_probability: 52.4
          }
        ],
        isLive: false,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 5000
      },
      {
        id: 'total-nfl-1',
        name: 'Total Points',
        type: 'total',
        outcomes: [
          {
            id: 'over',
            name: 'Over',
            odds: 1.91,
            americanOdds: '-110',
            isAvailable: true,
            total: 47.5,
            implied_probability: 52.4
          },
          {
            id: 'under',
            name: 'Under',
            odds: 1.91,
            americanOdds: '-110',
            isAvailable: true,
            total: 47.5,
            implied_probability: 52.4
          }
        ],
        isLive: false,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 5000
      }
    ];
  }

  private generateBasketballMarkets(): BettingMarket[] {
    return [
      {
        id: 'ml-nba-1',
        name: 'Moneyline',
        type: 'moneyline',
        outcomes: [
          {
            id: 'ml-bos',
            name: 'Boston Celtics',
            odds: 1.75,
            americanOdds: '-133',
            isAvailable: true,
            implied_probability: 57.1
          },
          {
            id: 'ml-lal',
            name: 'Los Angeles Lakers',
            odds: 2.10,
            americanOdds: '+110',
            isAvailable: true,
            implied_probability: 47.6
          }
        ],
        isLive: true,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 3000
      }
    ];
  }

  private generateBaseballMarkets(): BettingMarket[] {
    return [
      {
        id: 'ml-mlb-1',
        name: 'Moneyline',
        type: 'moneyline',
        outcomes: [
          {
            id: 'ml-lad',
            name: 'Los Angeles Dodgers',
            odds: 1.67,
            americanOdds: '-150',
            isAvailable: true,
            implied_probability: 60.0
          },
          {
            id: 'ml-nyy',
            name: 'New York Yankees',
            odds: 2.25,
            americanOdds: '+125',
            isAvailable: true,
            implied_probability: 44.4
          }
        ],
        isLive: false,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 2500
      }
    ];
  }

  private generateSoccerMarkets(): BettingMarket[] {
    return [
      {
        id: 'ml-ucl-1',
        name: 'Match Result',
        type: 'moneyline',
        outcomes: [
          {
            id: 'ml-rm',
            name: 'Real Madrid',
            odds: 2.20,
            americanOdds: '+120',
            isAvailable: true,
            implied_probability: 45.5
          },
          {
            id: 'draw',
            name: 'Draw',
            odds: 3.40,
            americanOdds: '+240',
            isAvailable: true,
            implied_probability: 29.4
          },
          {
            id: 'ml-fcb',
            name: 'Barcelona',
            odds: 3.00,
            americanOdds: '+200',
            isAvailable: true,
            implied_probability: 33.3
          }
        ],
        isLive: false,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 2000
      }
    ];
  }

  private generateMMAMarkets(): BettingMarket[] {
    return [
      {
        id: 'ml-ufc-1',
        name: 'Fight Winner',
        type: 'moneyline',
        outcomes: [
          {
            id: 'ml-jj',
            name: 'Jon Jones',
            odds: 1.45,
            americanOdds: '-222',
            isAvailable: true,
            implied_probability: 69.0
          },
          {
            id: 'ml-sm',
            name: 'Stipe Miocic',
            odds: 2.75,
            americanOdds: '+175',
            isAvailable: true,
            implied_probability: 36.4
          }
        ],
        isLive: false,
        isSuspended: false,
        category: 'main',
        minBet: 5,
        maxBet: 1000
      }
    ];
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate odds changes
      this.events.forEach(event => {
        if (Math.random() > 0.85) {
          event.markets.forEach(market => {
            market.outcomes.forEach(outcome => {
              if (Math.random() > 0.7) {
                const change = (Math.random() - 0.5) * 0.2;
                outcome.odds = Math.max(1.01, outcome.odds + change);
                outcome.americanOdds = this.convertToAmericanOdds(outcome.odds);
                outcome.implied_probability = this.calculateImpliedProbability(outcome.odds);
              }
            });
          });
        }

        // Simulate score updates for live events
        if (event.live && event.status === 'live' && Math.random() > 0.9) {
          if (event.sport === 'basketball') {
            const scorer = Math.random() > 0.5 ? 'home' : 'away';
            const points = Math.random() > 0.7 ? 3 : 2;
            
            if (scorer === 'home') {
              event.homeScore = (event.homeScore || 0) + points;
            } else {
              event.awayScore = (event.awayScore || 0) + points;
            }
          }
        }
      });

      // Simulate new events occasionally
      if (Math.random() > 0.95) {
        this.addRandomEvent();
      }
    }, 2000);
  }

  private addRandomEvent() {
    const sports: SportType[] = ['football', 'basketball', 'baseball', 'hockey', 'soccer'];
    const sport = sports[Math.floor(Math.random() * sports.length)];
    
    const event: SportEvent = {
      id: `event-${Date.now()}`,
      sport,
      league: this.getRandomLeague(sport),
      homeTeam: this.generateRandomTeam(),
      awayTeam: this.generateRandomTeam(),
      startTime: new Date(Date.now() + Math.random() * 604800000), // Within a week
      status: 'scheduled',
      markets: [],
      featured: false,
      live: false,
      popular: false,
      category: 'main'
    };

    this.events.set(event.id, event);
  }

  private getRandomLeague(sport: SportType): string {
    const leagues = {
      'football': ['NFL', 'NCAA Football'],
      'basketball': ['NBA', 'NCAA Basketball', 'WNBA'],
      'baseball': ['MLB', 'NCAA Baseball'],
      'hockey': ['NHL', 'NCAA Hockey'],
      'soccer': ['Premier League', 'La Liga', 'Serie A', 'MLS']
    };
    
    const sportLeagues = leagues[sport] || ['League'];
    return sportLeagues[Math.floor(Math.random() * sportLeagues.length)];
  }

  private generateRandomTeam(): Team {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Boston', 'Miami', 'Dallas', 'Phoenix'];
    const names = ['Eagles', 'Lions', 'Bears', 'Tigers', 'Sharks', 'Thunder', 'Fire'];
    
    const city = cities[Math.floor(Math.random() * cities.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return {
      id: `${city.toLowerCase()}-${name.toLowerCase()}`,
      name,
      city,
      abbreviation: city.substring(0, 2).toUpperCase() + name.substring(0, 1).toUpperCase()
    };
  }

  private convertToAmericanOdds(decimal: number): string {
    if (decimal >= 2.0) {
      return `+${Math.round((decimal - 1) * 100)}`;
    } else {
      return `-${Math.round(100 / (decimal - 1))}`;
    }
  }

  private calculateImpliedProbability(odds: number): number {
    return Math.round((1 / odds) * 100 * 10) / 10;
  }

  // Public API methods
  public getEvents(filters?: {
    sport?: SportType;
    league?: string;
    live?: boolean;
    featured?: boolean;
    popular?: boolean;
  }): SportEvent[] {
    let events = Array.from(this.events.values());

    if (filters) {
      if (filters.sport) {
        events = events.filter(e => e.sport === filters.sport);
      }
      if (filters.league) {
        events = events.filter(e => e.league === filters.league);
      }
      if (filters.live !== undefined) {
        events = events.filter(e => e.live === filters.live);
      }
      if (filters.featured !== undefined) {
        events = events.filter(e => e.featured === filters.featured);
      }
      if (filters.popular !== undefined) {
        events = events.filter(e => e.popular === filters.popular);
      }
    }

    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  public getEvent(eventId: string): SportEvent | undefined {
    return this.events.get(eventId);
  }

  public getBets(): SportsBet[] {
    return Array.from(this.bets.values());
  }

  public getBetSlip(): BetSlip {
    return this.betSlip;
  }

  public getStats(): BettingStats | null {
    return this.stats;
  }

  public getPromotions(): SportsPromotion[] {
    return this.promotions.filter(p => p.isActive && p.validUntil > new Date());
  }

  public addToBetSlip(selection: BetSlipSelection): void {
    // Remove existing selection for same market if exists
    this.betSlip.selections = this.betSlip.selections.filter(
      s => s.eventId !== selection.eventId || s.marketName !== selection.marketName
    );

    this.betSlip.selections.push(selection);
    this.updateBetSlipCalculations();
  }

  public removeFromBetSlip(selectionId: string): void {
    this.betSlip.selections = this.betSlip.selections.filter(s => s.id !== selectionId);
    this.updateBetSlipCalculations();
  }

  public clearBetSlip(): void {
    this.betSlip.selections = [];
    this.betSlip.totalStake = 0;
    this.betSlip.totalOdds = 1;
    this.betSlip.potentialPayout = 0;
  }

  public setBetType(type: 'single' | 'parlay' | 'system'): void {
    this.betSlip.betType = type;
    this.updateBetSlipCalculations();
  }

  public setStake(amount: number, selectionId?: string): void {
    if (this.betSlip.betType === 'single' && selectionId) {
      const selection = this.betSlip.selections.find(s => s.id === selectionId);
      if (selection) {
        selection.stake = amount;
      }
    } else {
      this.betSlip.totalStake = amount;
    }
    this.updateBetSlipCalculations();
  }

  private updateBetSlipCalculations(): void {
    if (this.betSlip.betType === 'single') {
      this.betSlip.totalStake = this.betSlip.selections.reduce((sum, s) => sum + (s.stake || 0), 0);
      this.betSlip.potentialPayout = this.betSlip.selections.reduce((sum, s) => {
        return sum + ((s.stake || 0) * s.odds);
      }, 0);
    } else if (this.betSlip.betType === 'parlay') {
      this.betSlip.totalOdds = this.betSlip.selections.reduce((product, s) => product * s.odds, 1);
      this.betSlip.potentialPayout = this.betSlip.totalStake * this.betSlip.totalOdds;
    }
  }

  public placeBet(): Promise<{ success: boolean; betId?: string; error?: string }> {
    return new Promise((resolve) => {
      // Simulate API call
      setTimeout(() => {
        if (this.betSlip.selections.length === 0) {
          resolve({ success: false, error: 'No selections in bet slip' });
          return;
        }

        if (this.betSlip.totalStake <= 0) {
          resolve({ success: false, error: 'Invalid stake amount' });
          return;
        }

        const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const bet: SportsBet = {
          id: betId,
          userId: 'current-user',
          eventId: this.betSlip.selections[0].eventId,
          marketId: 'market-id',
          outcomeId: 'outcome-id',
          amount: this.betSlip.totalStake,
          odds: this.betSlip.totalOdds,
          potentialPayout: this.betSlip.potentialPayout,
          status: 'pending',
          placedAt: new Date(),
          betType: this.betSlip.betType,
          cashOutAvailable: true
        };

        this.bets.set(betId, bet);
        this.clearBetSlip();

        resolve({ success: true, betId });
      }, 1000);
    });
  }

  public cashOut(betId: string): Promise<{ success: boolean; amount?: number; error?: string }> {
    return new Promise((resolve) => {
      const bet = this.bets.get(betId);
      if (!bet) {
        resolve({ success: false, error: 'Bet not found' });
        return;
      }

      if (!bet.cashOutAvailable) {
        resolve({ success: false, error: 'Cash out not available' });
        return;
      }

      // Simulate cash out calculation (usually less than potential payout)
      const cashOutAmount = bet.potentialPayout * 0.85;

      setTimeout(() => {
        bet.status = 'cash_out';
        bet.settledAt = new Date();
        bet.cashOutValue = cashOutAmount;

        resolve({ success: true, amount: cashOutAmount });
      }, 500);
    });
  }

  public getOddsFormat(): 'decimal' | 'american' | 'fractional' {
    return this.oddsFormat;
  }

  public setOddsFormat(format: 'decimal' | 'american' | 'fractional'): void {
    this.oddsFormat = format;
  }

  public toggleLiveUpdates(): void {
    this.liveUpdatesEnabled = !this.liveUpdatesEnabled;
  }

  public searchEvents(query: string): SportEvent[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.events.values()).filter(event =>
      event.homeTeam.name.toLowerCase().includes(lowercaseQuery) ||
      event.awayTeam.name.toLowerCase().includes(lowercaseQuery) ||
      event.league.toLowerCase().includes(lowercaseQuery) ||
      event.sport.toLowerCase().includes(lowercaseQuery)
    );
  }

  public getUpcomingEvents(hours: number = 24): SportEvent[] {
    const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000);
    return Array.from(this.events.values())
      .filter(event => event.startTime <= cutoff && event.status === 'scheduled')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  public getLiveEvents(): SportEvent[] {
    return Array.from(this.events.values())
      .filter(event => event.live && event.status === 'live')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const sportsBookService = new SportsBookService();
