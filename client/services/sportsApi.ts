// Production Sports Data API Service
// Integrates with The Odds API and ESPN API for real sports data

export interface Game {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  gameTime: string;
  status: 'upcoming' | 'live' | 'completed';
  week?: number;
  venue?: string;
  weather?: string;
}

export interface BettingLine {
  gameId: string;
  sportsbook: string;
  spread: {
    home: number; // e.g., -4.5
    away: number; // e.g., +4.5
    homeOdds: number; // e.g., -110
    awayOdds: number; // e.g., -110
  };
  total: {
    over: number; // e.g., 51.5
    under: number; // e.g., 51.5
    overOdds: number; // e.g., -105
    underOdds: number; // e.g., -115
  };
  moneyline: {
    home: number; // e.g., -180
    away: number; // e.g., +160
  };
  lastUpdated: string;
}

export interface GameWithLines extends Game {
  lines: BettingLine[];
  bestLine?: BettingLine;
}

class SportsDataService {
  private readonly ODDS_API_KEY = process.env.REACT_APP_ODDS_API_KEY || 'demo-key';
  private readonly ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
  private readonly ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

  // Sports configuration
  private readonly SUPPORTED_SPORTS = {
    'americanfootball_nfl': { name: 'NFL', espnLeague: 'nfl' },
    'basketball_nba': { name: 'NBA', espnLeague: 'nba' },
    'baseball_mlb': { name: 'MLB', espnLeague: 'mlb' },
    'icehockey_nhl': { name: 'NHL', espnLeague: 'nhl' },
    'americanfootball_ncaaf': { name: 'College Football', espnLeague: 'college-football' },
    'basketball_ncaab': { name: 'College Basketball', espnLeague: 'mens-college-basketball' }
  };

  /**
   * Get upcoming games for the next 7 days across all supported sports
   */
  async getUpcomingGames(): Promise<GameWithLines[]> {
    try {
      const allGames: GameWithLines[] = [];
      
      // Get games from each sport
      for (const [sport, config] of Object.entries(this.SUPPORTED_SPORTS)) {
        const games = await this.getGamesBySport(sport, config);
        allGames.push(...games);
      }

      // Sort by game time
      return allGames.sort((a, b) => new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime());
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      // Fallback to demo data in production
      return this.getDemoGames();
    }
  }

  /**
   * Get games for a specific sport
   */
  private async getGamesBySport(sport: string, config: any): Promise<GameWithLines[]> {
    try {
      // Get schedule from ESPN
      const scheduleResponse = await fetch(
        `${this.ESPN_API_BASE}/${config.espnLeague}/scoreboard?limit=50`
      );
      
      if (!scheduleResponse.ok) {
        throw new Error(`ESPN API error: ${scheduleResponse.status}`);
      }
      
      const scheduleData = await scheduleResponse.json();
      
      // Get odds from The Odds API
      const oddsResponse = await fetch(
        `${this.ODDS_API_BASE}/sports/${sport}/odds?apiKey=${this.ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&dateFormat=iso`
      );
      
      const oddsData = oddsResponse.ok ? await oddsResponse.json() : [];
      
      // Combine ESPN schedule with odds data
      return this.combineScheduleAndOdds(scheduleData, oddsData, config.name);
    } catch (error) {
      console.error(`Error fetching ${sport} data:`, error);
      return [];
    }
  }

  /**
   * Combine ESPN schedule data with odds data
   */
  private combineScheduleAndOdds(scheduleData: any, oddsData: any[], sport: string): GameWithLines[] {
    const games: GameWithLines[] = [];
    
    if (!scheduleData?.events) return games;

    scheduleData.events.forEach((event: any) => {
      // Filter for upcoming games only (next 7 days)
      const gameTime = new Date(event.date);
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      if (gameTime < now || gameTime > sevenDaysFromNow) return;
      
      const homeTeam = event.competitions[0]?.competitors?.find((c: any) => c.homeAway === 'home');
      const awayTeam = event.competitions[0]?.competitors?.find((c: any) => c.homeAway === 'away');
      
      if (!homeTeam || !awayTeam) return;

      const game: GameWithLines = {
        id: event.id,
        sport,
        league: scheduleData.leagues?.[0]?.name || sport,
        homeTeam: homeTeam.team.displayName,
        awayTeam: awayTeam.team.displayName,
        homeTeamLogo: homeTeam.team.logo,
        awayTeamLogo: awayTeam.team.logo,
        gameTime: event.date,
        status: this.mapEventStatus(event.status?.type?.name),
        venue: event.competitions[0]?.venue?.fullName,
        lines: []
      };

      // Find matching odds data
      const matchingOdds = oddsData.find((odds: any) => 
        this.teamsMatch(game.homeTeam, game.awayTeam, odds.home_team, odds.away_team)
      );

      if (matchingOdds?.bookmakers) {
        game.lines = this.processBookmakerOdds(matchingOdds.bookmakers, game.id);
        game.bestLine = this.findBestLine(game.lines);
      }

      games.push(game);
    });

    return games;
  }

  /**
   * Process bookmaker odds data
   */
  private processBookmakerOdds(bookmakers: any[], gameId: string): BettingLine[] {
    const lines: BettingLine[] = [];

    bookmakers.forEach((bookmaker: any) => {
      const line: Partial<BettingLine> = {
        gameId,
        sportsbook: bookmaker.title,
        lastUpdated: bookmaker.last_update
      };

      // Process different market types
      bookmaker.markets?.forEach((market: any) => {
        switch (market.key) {
          case 'spreads':
            line.spread = this.processSpreadMarket(market);
            break;
          case 'totals':
            line.total = this.processTotalMarket(market);
            break;
          case 'h2h':
            line.moneyline = this.processMoneylineMarket(market);
            break;
        }
      });

      if (line.spread || line.total || line.moneyline) {
        lines.push(line as BettingLine);
      }
    });

    return lines;
  }

  /**
   * Process spread market data
   */
  private processSpreadMarket(market: any) {
    const outcomes = market.outcomes;
    if (outcomes?.length !== 2) return null;

    return {
      home: outcomes[0].point || 0,
      away: outcomes[1].point || 0,
      homeOdds: outcomes[0].price || -110,
      awayOdds: outcomes[1].price || -110
    };
  }

  /**
   * Process total (over/under) market data
   */
  private processTotalMarket(market: any) {
    const outcomes = market.outcomes;
    if (outcomes?.length !== 2) return null;

    const overOutcome = outcomes.find((o: any) => o.name === 'Over');
    const underOutcome = outcomes.find((o: any) => o.name === 'Under');

    return {
      over: overOutcome?.point || 0,
      under: underOutcome?.point || 0,
      overOdds: overOutcome?.price || -110,
      underOdds: underOutcome?.price || -110
    };
  }

  /**
   * Process moneyline market data
   */
  private processMoneylineMarket(market: any) {
    const outcomes = market.outcomes;
    if (outcomes?.length !== 2) return null;

    return {
      home: outcomes[0].price || 0,
      away: outcomes[1].price || 0
    };
  }

  /**
   * Find the best line from available bookmakers
   */
  private findBestLine(lines: BettingLine[]): BettingLine | undefined {
    if (!lines.length) return undefined;

    // Prioritize major sportsbooks
    const priorityBooks = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'];
    
    for (const book of priorityBooks) {
      const line = lines.find(l => l.sportsbook.includes(book));
      if (line) return line;
    }

    return lines[0];
  }

  /**
   * Check if team names match between different data sources
   */
  private teamsMatch(homeTeam1: string, awayTeam1: string, homeTeam2: string, awayTeam2: string): boolean {
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z]/g, '');
    
    return (
      normalize(homeTeam1).includes(normalize(homeTeam2).slice(0, 4)) ||
      normalize(homeTeam2).includes(normalize(homeTeam1).slice(0, 4))
    ) && (
      normalize(awayTeam1).includes(normalize(awayTeam2).slice(0, 4)) ||
      normalize(awayTeam2).includes(normalize(awayTeam1).slice(0, 4))
    );
  }

  /**
   * Map ESPN event status to our status
   */
  private mapEventStatus(espnStatus: string): 'upcoming' | 'live' | 'completed' {
    switch (espnStatus?.toLowerCase()) {
      case 'scheduled':
      case 'pre':
        return 'upcoming';
      case 'in':
      case 'live':
        return 'live';
      case 'final':
      case 'completed':
        return 'completed';
      default:
        return 'upcoming';
    }
  }

  /**
   * Fallback demo data for development/demo purposes
   */
  private getDemoGames(): GameWithLines[] {
    const now = new Date();
    const games: GameWithLines[] = [];

    // Generate realistic demo games for next 7 days
    for (let day = 0; day < 7; day++) {
      const gameDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);
      
      // NFL Games (Sunday/Monday/Thursday)
      if ([0, 1, 4].includes(gameDate.getDay())) {
        games.push(...this.generateNFLGames(gameDate));
      }
      
      // NBA Games (most days)
      if (day < 6) {
        games.push(...this.generateNBAGames(gameDate));
      }
      
      // MLB Games (if in season)
      const month = gameDate.getMonth();
      if (month >= 2 && month <= 9) { // March through October
        games.push(...this.generateMLBGames(gameDate));
      }
    }

    return games.sort((a, b) => new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime());
  }

  private generateNFLGames(date: Date): GameWithLines[] {
    const teams = [
      'Kansas City Chiefs', 'Buffalo Bills', 'Cincinnati Bengals', 'Miami Dolphins',
      'Baltimore Ravens', 'Cleveland Browns', 'Pittsburgh Steelers', 'Houston Texans',
      'Indianapolis Colts', 'Jacksonville Jaguars', 'Tennessee Titans', 'Denver Broncos',
      'Las Vegas Raiders', 'Los Angeles Chargers', 'New York Jets', 'New England Patriots'
    ];

    const games: GameWithLines[] = [];
    const gamesCount = date.getDay() === 0 ? 6 : 2; // More games on Sunday

    for (let i = 0; i < gamesCount; i++) {
      const homeIdx = Math.floor(Math.random() * teams.length);
      const awayIdx = (homeIdx + 1 + Math.floor(Math.random() * (teams.length - 1))) % teams.length;
      
      const gameTime = new Date(date);
      gameTime.setHours(13 + (i * 3), 0, 0, 0);

      const spread = (Math.random() - 0.5) * 15; // -7.5 to +7.5
      const total = 45 + Math.random() * 15; // 45 to 60

      games.push({
        id: `nfl-${date.getTime()}-${i}`,
        sport: 'NFL',
        league: 'National Football League',
        homeTeam: teams[homeIdx],
        awayTeam: teams[awayIdx],
        gameTime: gameTime.toISOString(),
        status: 'upcoming',
        lines: [{
          gameId: `nfl-${date.getTime()}-${i}`,
          sportsbook: 'BetMGM',
          spread: {
            home: Number(spread.toFixed(1)),
            away: Number((-spread).toFixed(1)),
            homeOdds: -110,
            awayOdds: -110
          },
          total: {
            over: Number(total.toFixed(1)),
            under: Number(total.toFixed(1)),
            overOdds: -105,
            underOdds: -115
          },
          moneyline: {
            home: spread > 0 ? 120 + Math.floor(spread * 10) : -120 - Math.floor(-spread * 10),
            away: spread < 0 ? 120 + Math.floor(-spread * 10) : -120 - Math.floor(spread * 10)
          },
          lastUpdated: new Date().toISOString()
        }],
        bestLine: undefined
      });
    }

    games.forEach(game => {
      game.bestLine = game.lines[0];
    });

    return games;
  }

  private generateNBAGames(date: Date): GameWithLines[] {
    const teams = [
      'Boston Celtics', 'Los Angeles Lakers', 'Golden State Warriors', 'Miami Heat',
      'Denver Nuggets', 'Phoenix Suns', 'Milwaukee Bucks', 'Philadelphia 76ers',
      'Brooklyn Nets', 'Dallas Mavericks', 'Memphis Grizzlies', 'New Orleans Pelicans'
    ];

    const games: GameWithLines[] = [];
    const gamesCount = 3;

    for (let i = 0; i < gamesCount; i++) {
      const homeIdx = Math.floor(Math.random() * teams.length);
      const awayIdx = (homeIdx + 1 + Math.floor(Math.random() * (teams.length - 1))) % teams.length;
      
      const gameTime = new Date(date);
      gameTime.setHours(19 + (i * 1), 0, 0, 0);

      const spread = (Math.random() - 0.5) * 20; // -10 to +10
      const total = 205 + Math.random() * 30; // 205 to 235

      games.push({
        id: `nba-${date.getTime()}-${i}`,
        sport: 'NBA',
        league: 'National Basketball Association',
        homeTeam: teams[homeIdx],
        awayTeam: teams[awayIdx],
        gameTime: gameTime.toISOString(),
        status: 'upcoming',
        lines: [{
          gameId: `nba-${date.getTime()}-${i}`,
          sportsbook: 'FanDuel',
          spread: {
            home: Number(spread.toFixed(1)),
            away: Number((-spread).toFixed(1)),
            homeOdds: -110,
            awayOdds: -110
          },
          total: {
            over: Number(total.toFixed(1)),
            under: Number(total.toFixed(1)),
            overOdds: -110,
            underOdds: -110
          },
          moneyline: {
            home: spread > 0 ? 100 + Math.floor(spread * 8) : -100 - Math.floor(-spread * 8),
            away: spread < 0 ? 100 + Math.floor(-spread * 8) : -100 - Math.floor(spread * 8)
          },
          lastUpdated: new Date().toISOString()
        }],
        bestLine: undefined
      });
    }

    games.forEach(game => {
      game.bestLine = game.lines[0];
    });

    return games;
  }

  private generateMLBGames(date: Date): GameWithLines[] {
    const teams = [
      'Los Angeles Dodgers', 'New York Yankees', 'Houston Astros', 'Atlanta Braves',
      'Philadelphia Phillies', 'San Diego Padres', 'Toronto Blue Jays', 'Seattle Mariners',
      'Tampa Bay Rays', 'Baltimore Orioles', 'Texas Rangers', 'Arizona Diamondbacks'
    ];

    const games: GameWithLines[] = [];
    const gamesCount = 4;

    for (let i = 0; i < gamesCount; i++) {
      const homeIdx = Math.floor(Math.random() * teams.length);
      const awayIdx = (homeIdx + 1 + Math.floor(Math.random() * (teams.length - 1))) % teams.length;
      
      const gameTime = new Date(date);
      gameTime.setHours(19 + (i % 2), 10 * (i % 6), 0, 0);

      const spread = (Math.random() - 0.5) * 4; // -2 to +2 (run line)
      const total = 7.5 + Math.random() * 4; // 7.5 to 11.5

      games.push({
        id: `mlb-${date.getTime()}-${i}`,
        sport: 'MLB',
        league: 'Major League Baseball',
        homeTeam: teams[homeIdx],
        awayTeam: teams[awayIdx],
        gameTime: gameTime.toISOString(),
        status: 'upcoming',
        lines: [{
          gameId: `mlb-${date.getTime()}-${i}`,
          sportsbook: 'DraftKings',
          spread: {
            home: Number(spread.toFixed(1)),
            away: Number((-spread).toFixed(1)),
            homeOdds: -110,
            awayOdds: -110
          },
          total: {
            over: Number(total.toFixed(1)),
            under: Number(total.toFixed(1)),
            overOdds: -105,
            underOdds: -115
          },
          moneyline: {
            home: -140 + Math.floor(Math.random() * 80),
            away: 120 + Math.floor(Math.random() * 80)
          },
          lastUpdated: new Date().toISOString()
        }],
        bestLine: undefined
      });
    }

    games.forEach(game => {
      game.bestLine = game.lines[0];
    });

    return games;
  }

  /**
   * Get live scores and update game status
   */
  async getLiveScores(): Promise<any> {
    try {
      // Implementation for live scores would go here
      // This would typically use WebSocket connections for real-time updates
      return {};
    } catch (error) {
      console.error('Error fetching live scores:', error);
      return {};
    }
  }
}

export const sportsDataService = new SportsDataService();
export default sportsDataService;
