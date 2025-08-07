import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Play,
  Circle,
  Star,
  Calendar,
  Users,
  Activity,
  DollarSign,
  Zap,
  Shield,
  Info,
  AlertTriangle,
  CheckCircle,
  X,
  Filter,
  Search,
  Refresh,
  BarChart3,
  Timer,
  Flame,
  Crown,
  Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { walletService, type UserWallet } from '../services/walletService';
import { currencyToggleService } from '../services/currencyToggleService';

interface SportEvent {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  startTime: Date;
  status: 'upcoming' | 'live' | 'finished' | 'postponed';
  liveScore?: {
    home: number;
    away: number;
    period: string;
    timeRemaining?: string;
  };
  markets: BettingMarket[];
  isPopular: boolean;
  isFeatured: boolean;
  viewers?: number;
  venue?: string;
}

interface BettingMarket {
  id: string;
  type: 'moneyline' | 'spread' | 'total' | 'props' | 'live';
  name: string;
  description: string;
  outcomes: BettingOutcome[];
  isLive: boolean;
  isSuspended: boolean;
}

interface BettingOutcome {
  id: string;
  name: string;
  odds: number;
  americanOdds: string;
  probability: number;
  isAvailable: boolean;
  line?: number;
}

interface Bet {
  id: string;
  userId: string;
  eventId: string;
  marketId: string;
  outcomeId: string;
  stake: number;
  currency: 'SC'; // Sports betting only uses Sweeps Coins
  odds: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost' | 'void' | 'cashed_out';
  placedAt: Date;
  settledAt?: Date;
  isLive: boolean;
  cashOutValue?: number;
}

interface BetSlip {
  bets: BetSlipItem[];
  totalStake: number;
  totalPayout: number;
  combinedOdds: number;
  betType: 'single' | 'parlay' | 'round_robin';
}

interface BetSlipItem {
  eventId: string;
  marketId: string;
  outcomeId: string;
  eventName: string;
  marketName: string;
  outcomeName: string;
  odds: number;
  stake: number;
  line?: number;
}

export default function SportsBook() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [betSlip, setBetSlip] = useState<BetSlip>({
    bets: [],
    totalStake: 0,
    totalPayout: 0,
    combinedOdds: 1,
    betType: 'single'
  });
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [showMyBets, setShowMyBets] = useState(false);

  useEffect(() => {
    loadSportsData();
    loadUserBets();
    
    if (user?.id) {
      loadWallet();
      const interval = setInterval(loadWallet, 5000); // Update wallet every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  useEffect(() => {
    // Simulate live updates for odds and scores
    const interval = setInterval(() => {
      updateLiveData();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSportsData = async () => {
    try {
      setLoading(true);
      
      // Simulate loading sports events from API
      const mockEvents: SportEvent[] = [
        {
          id: 'nfl-chiefs-bills',
          sport: 'NFL',
          league: 'National Football League',
          homeTeam: 'Kansas City Chiefs',
          awayTeam: 'Buffalo Bills',
          homeTeamLogo: '/teams/chiefs.png',
          awayTeamLogo: '/teams/bills.png',
          startTime: new Date(Date.now() + 3600000), // 1 hour from now
          status: 'upcoming',
          isPopular: true,
          isFeatured: true,
          viewers: 45000,
          venue: 'Arrowhead Stadium',
          markets: [
            {
              id: 'ml-1',
              type: 'moneyline',
              name: 'Moneyline',
              description: 'Pick the winner',
              isLive: false,
              isSuspended: false,
              outcomes: [
                { id: 'ml-1-home', name: 'Kansas City Chiefs', odds: 1.85, americanOdds: '-118', probability: 54.1, isAvailable: true },
                { id: 'ml-1-away', name: 'Buffalo Bills', odds: 1.95, americanOdds: '-105', probability: 51.3, isAvailable: true }
              ]
            },
            {
              id: 'spread-1',
              type: 'spread',
              name: 'Point Spread',
              description: 'Bet against the spread',
              isLive: false,
              isSuspended: false,
              outcomes: [
                { id: 'spread-1-home', name: 'Kansas City Chiefs', odds: 1.91, americanOdds: '-110', probability: 52.4, isAvailable: true, line: -2.5 },
                { id: 'spread-1-away', name: 'Buffalo Bills', odds: 1.91, americanOdds: '-110', probability: 52.4, isAvailable: true, line: 2.5 }
              ]
            },
            {
              id: 'total-1',
              type: 'total',
              name: 'Total Points',
              description: 'Over/Under total points',
              isLive: false,
              isSuspended: false,
              outcomes: [
                { id: 'total-1-over', name: 'Over', odds: 1.91, americanOdds: '-110', probability: 52.4, isAvailable: true, line: 47.5 },
                { id: 'total-1-under', name: 'Under', odds: 1.91, americanOdds: '-110', probability: 52.4, isAvailable: true, line: 47.5 }
              ]
            }
          ]
        },
        {
          id: 'nba-lakers-warriors',
          sport: 'NBA',
          league: 'National Basketball Association',
          homeTeam: 'Los Angeles Lakers',
          awayTeam: 'Golden State Warriors',
          homeTeamLogo: '/teams/lakers.png',
          awayTeamLogo: '/teams/warriors.png',
          startTime: new Date(Date.now() - 1800000), // Started 30 minutes ago
          status: 'live',
          liveScore: { home: 89, away: 92, period: '3rd Quarter', timeRemaining: '8:45' },
          isPopular: true,
          isFeatured: true,
          viewers: 28000,
          venue: 'Staples Center',
          markets: [
            {
              id: 'live-ml-1',
              type: 'live',
              name: 'Live Moneyline',
              description: 'Live betting on winner',
              isLive: true,
              isSuspended: false,
              outcomes: [
                { id: 'live-ml-1-home', name: 'Los Angeles Lakers', odds: 2.10, americanOdds: '+110', probability: 47.6, isAvailable: true },
                { id: 'live-ml-1-away', name: 'Golden State Warriors', odds: 1.75, americanOdds: '-133', probability: 57.1, isAvailable: true }
              ]
            },
            {
              id: 'live-spread-1',
              type: 'live',
              name: 'Live Spread',
              description: 'Live point spread',
              isLive: true,
              isSuspended: false,
              outcomes: [
                { id: 'live-spread-1-home', name: 'Los Angeles Lakers', odds: 1.91, americanOdds: '-110', probability: 52.4, isAvailable: true, line: 2.5 },
                { id: 'live-spread-1-away', name: 'Golden State Warriors', odds: 1.91, americanOdds: '-110', probability: 52.4, isAvailable: true, line: -2.5 }
              ]
            }
          ]
        },
        {
          id: 'mlb-yankees-redsox',
          sport: 'MLB',
          league: 'Major League Baseball',
          homeTeam: 'Boston Red Sox',
          awayTeam: 'New York Yankees',
          homeTeamLogo: '/teams/redsox.png',
          awayTeamLogo: '/teams/yankees.png',
          startTime: new Date(Date.now() + 7200000), // 2 hours from now
          status: 'upcoming',
          isPopular: true,
          isFeatured: false,
          viewers: 15000,
          venue: 'Fenway Park',
          markets: [
            {
              id: 'ml-2',
              type: 'moneyline',
              name: 'Moneyline',
              description: 'Pick the winner',
              isLive: false,
              isSuspended: false,
              outcomes: [
                { id: 'ml-2-home', name: 'Boston Red Sox', odds: 2.20, americanOdds: '+120', probability: 45.5, isAvailable: true },
                { id: 'ml-2-away', name: 'New York Yankees', odds: 1.67, americanOdds: '-149', probability: 59.9, isAvailable: true }
              ]
            }
          ]
        }
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to load sports data:', error);
      toast({
        title: "Error",
        description: "Failed to load sports events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    if (!user?.id) return;
    
    try {
      const userWallet = await walletService.getUserWallet(user.id);
      setWallet(userWallet);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const loadUserBets = () => {
    if (!user?.id) return;
    
    try {
      const savedBets = localStorage.getItem(`sports_bets_${user.id}`);
      if (savedBets) {
        const bets = JSON.parse(savedBets).map((bet: any) => ({
          ...bet,
          placedAt: new Date(bet.placedAt),
          settledAt: bet.settledAt ? new Date(bet.settledAt) : undefined
        }));
        setUserBets(bets);
      }
    } catch (error) {
      console.error('Failed to load user bets:', error);
    }
  };

  const saveUserBets = (bets: Bet[]) => {
    if (!user?.id) return;
    localStorage.setItem(`sports_bets_${user.id}`, JSON.stringify(bets));
  };

  const updateLiveData = () => {
    setEvents(prevEvents => 
      prevEvents.map(event => {
        if (event.status === 'live') {
          // Simulate live score updates
          const updatedEvent = { ...event };
          if (updatedEvent.liveScore) {
            // Randomly update scores
            if (Math.random() > 0.95) {
              updatedEvent.liveScore = {
                ...updatedEvent.liveScore,
                home: updatedEvent.liveScore.home + (Math.random() > 0.5 ? 1 : 0),
                away: updatedEvent.liveScore.away + (Math.random() > 0.5 ? 1 : 0)
              };
            }
          }
          
          // Simulate odds changes
          updatedEvent.markets = updatedEvent.markets.map(market => ({
            ...market,
            outcomes: market.outcomes.map(outcome => ({
              ...outcome,
              odds: market.isLive ? outcome.odds + (Math.random() - 0.5) * 0.1 : outcome.odds
            }))
          }));
          
          return updatedEvent;
        }
        return event;
      })
    );
  };

  const addToBetSlip = (event: SportEvent, market: BettingMarket, outcome: BettingOutcome) => {
    const betSlipItem: BetSlipItem = {
      eventId: event.id,
      marketId: market.id,
      outcomeId: outcome.id,
      eventName: `${event.awayTeam} @ ${event.homeTeam}`,
      marketName: market.name,
      outcomeName: outcome.name,
      odds: outcome.odds,
      stake: 0,
      line: outcome.line
    };

    setBetSlip(prev => {
      const existingIndex = prev.bets.findIndex(
        bet => bet.eventId === event.id && bet.marketId === market.id && bet.outcomeId === outcome.id
      );

      let newBets;
      if (existingIndex >= 0) {
        // Remove if already in bet slip
        newBets = prev.bets.filter((_, index) => index !== existingIndex);
      } else {
        // Add to bet slip
        newBets = [...prev.bets, betSlipItem];
      }

      return {
        ...prev,
        bets: newBets,
        totalStake: newBets.reduce((sum, bet) => sum + bet.stake, 0),
        totalPayout: newBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0),
        combinedOdds: newBets.reduce((odds, bet) => odds * bet.odds, 1)
      };
    });

    toast({
      title: existingIndex >= 0 ? "Removed from Bet Slip" : "Added to Bet Slip",
      description: `${outcome.name} for ${event.awayTeam} @ ${event.homeTeam}`,
    });
  };

  const updateBetStake = (index: number, stake: number) => {
    setBetSlip(prev => {
      const newBets = [...prev.bets];
      newBets[index].stake = stake;

      return {
        ...prev,
        bets: newBets,
        totalStake: newBets.reduce((sum, bet) => sum + bet.stake, 0),
        totalPayout: newBets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0)
      };
    });
  };

  const placeBets = async () => {
    if (!user?.id || !wallet) {
      toast({
        title: "Error",
        description: "Please log in to place bets",
        variant: "destructive"
      });
      return;
    }

    if (betSlip.totalStake <= 0) {
      toast({
        title: "Error",
        description: "Please enter bet amounts",
        variant: "destructive"
      });
      return;
    }

    if (wallet.sweepsCoins < betSlip.totalStake) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${betSlip.totalStake} SC but only have ${wallet.sweepsCoins.toFixed(2)} SC`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Place bets
      const newBets: Bet[] = betSlip.bets.map((betItem, index) => ({
        id: `bet_${Date.now()}_${index}`,
        userId: user.id,
        eventId: betItem.eventId,
        marketId: betItem.marketId,
        outcomeId: betItem.outcomeId,
        stake: betItem.stake,
        currency: 'SC',
        odds: betItem.odds,
        potentialPayout: betItem.stake * betItem.odds,
        status: 'pending',
        placedAt: new Date(),
        isLive: events.find(e => e.id === betItem.eventId)?.status === 'live' || false
      }));

      // Deduct from wallet
      await walletService.updateBalance(
        user.id,
        0, // No GC change
        -betSlip.totalStake, // Deduct SC
        `Sports Betting - ${newBets.length} bet(s) placed`,
        undefined,
        'sportsbook'
      );

      // Save bets
      const updatedBets = [...userBets, ...newBets];
      setUserBets(updatedBets);
      saveUserBets(updatedBets);

      // Clear bet slip
      setBetSlip({
        bets: [],
        totalStake: 0,
        totalPayout: 0,
        combinedOdds: 1,
        betType: 'single'
      });

      // Update wallet
      await loadWallet();

      toast({
        title: "Bets Placed Successfully",
        description: `${newBets.length} bet(s) placed for ${betSlip.totalStake.toFixed(2)} SC`,
      });

    } catch (error) {
      console.error('Failed to place bets:', error);
      toast({
        title: "Error",
        description: "Failed to place bets",
        variant: "destructive"
      });
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedSport !== 'all') {
      filtered = filtered.filter(event => event.sport === selectedSport);
    }

    if (showLiveOnly) {
      filtered = filtered.filter(event => event.status === 'live');
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.homeTeam.toLowerCase().includes(query) ||
        event.awayTeam.toLowerCase().includes(query) ||
        event.league.toLowerCase().includes(query) ||
        event.sport.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }, [events, selectedSport, showLiveOnly, searchQuery]);

  const sports = Array.from(new Set(events.map(event => event.sport)));

  const formatOdds = (odds: number, american: string) => {
    return `${odds.toFixed(2)} (${american})`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-600 animate-pulse"><Circle className="w-2 h-2 mr-1" />LIVE</Badge>;
      case 'upcoming':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Upcoming</Badge>;
      case 'finished':
        return <Badge variant="secondary">Final</Badge>;
      case 'postponed':
        return <Badge variant="destructive">Postponed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading sportsbook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            CoinFrazy Sportsbook
          </h1>
          <p className="text-muted-foreground">Live sports betting with Sweeps Coins</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Wallet Balance */}
          {wallet && (
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">{wallet.sweepsCoins.toFixed(2)} SC</span>
              </div>
            </Card>
          )}

          {/* Bet Slip Toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowBetSlip(!showBetSlip)}
            className="relative"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Bet Slip
            {betSlip.bets.length > 0 && (
              <Badge className="ml-2 px-1.5 py-0.5 text-xs">{betSlip.bets.length}</Badge>
            )}
          </Button>

          {/* My Bets */}
          <Button 
            variant="outline" 
            onClick={() => setShowMyBets(!showMyBets)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            My Bets ({userBets.length})
          </Button>
        </div>
      </div>

      {/* Only Sweeps Coins Notice */}
      <Alert className="mb-6 border-purple-500 bg-purple-500/10">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Sports betting is only available with Sweeps Coins (SC).</strong> 
          {' '}Gold Coins cannot be used for sports wagering to ensure sweepstakes compliance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search teams, leagues, or sports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedSport} onValueChange={setSelectedSport}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    {sports.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant={showLiveOnly ? "default" : "outline"}
                  onClick={() => setShowLiveOnly(!showLiveOnly)}
                  className="gap-2"
                >
                  <Circle className="w-3 h-3" />
                  Live Only
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <img src={event.awayTeamLogo} alt={event.awayTeam} className="w-8 h-8" onError={(e) => { const target = e.target as HTMLImageElement; target.src = '/teams/default.png'; }} />
                        <span className="font-semibold">{event.awayTeam}</span>
                      </div>
                      <span className="text-muted-foreground">@</span>
                      <div className="flex items-center gap-2">
                        <img src={event.homeTeamLogo} alt={event.homeTeam} className="w-8 h-8" onError={(e) => { const target = e.target as HTMLImageElement; target.src = '/teams/default.png'; }} />
                        <span className="font-semibold">{event.homeTeam}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(event.status)}
                      {event.isPopular && <Badge variant="outline"><Flame className="w-3 h-3 mr-1" />Popular</Badge>}
                      {event.isFeatured && <Badge variant="outline"><Star className="w-3 h-3 mr-1" />Featured</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>{event.sport} • {event.league}</span>
                      {event.venue && <span>• {event.venue}</span>}
                      {event.viewers && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.viewers.toLocaleString()} watching
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.status === 'live' && event.liveScore ? (
                        <div className="text-lg font-bold">
                          {event.liveScore.away} - {event.liveScore.home}
                          <span className="text-xs ml-2">{event.liveScore.period}</span>
                          {event.liveScore.timeRemaining && (
                            <span className="text-xs ml-1">• {event.liveScore.timeRemaining}</span>
                          )}
                        </div>
                      ) : (
                        <span>{event.startTime.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-4">
                    {event.markets.map(market => (
                      <div key={market.id}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{market.name}</h4>
                          <div className="flex items-center gap-2">
                            {market.isLive && <Badge className="bg-red-600 text-xs">LIVE</Badge>}
                            {market.isSuspended && <Badge variant="destructive" className="text-xs">Suspended</Badge>}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {market.outcomes.map(outcome => (
                            <Button
                              key={outcome.id}
                              variant={betSlip.bets.some(bet => 
                                bet.eventId === event.id && 
                                bet.marketId === market.id && 
                                bet.outcomeId === outcome.id
                              ) ? "default" : "outline"}
                              disabled={!outcome.isAvailable || market.isSuspended}
                              onClick={() => addToBetSlip(event, market, outcome)}
                              className="flex-col h-auto p-3 text-xs"
                            >
                              <div className="font-medium">
                                {outcome.name}
                                {outcome.line !== undefined && ` ${outcome.line > 0 ? '+' : ''}${outcome.line}`}
                              </div>
                              <div className="text-xs opacity-75">
                                {formatOdds(outcome.odds, outcome.americanOdds)}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bet Slip */}
          <Card className={showBetSlip ? '' : 'hidden lg:block'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Bet Slip ({betSlip.bets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {betSlip.bets.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Click on odds to add bets
                </p>
              ) : (
                <div className="space-y-4">
                  {betSlip.bets.map((bet, index) => (
                    <div key={`${bet.eventId}-${bet.marketId}-${bet.outcomeId}`} className="border rounded p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm">
                          <div className="font-medium">{bet.eventName}</div>
                          <div className="text-muted-foreground">
                            {bet.marketName}: {bet.outcomeName}
                            {bet.line !== undefined && ` ${bet.line > 0 ? '+' : ''}${bet.line}`}
                          </div>
                          <div className="text-xs">Odds: {bet.odds.toFixed(2)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBetSlip(prev => ({
                              ...prev,
                              bets: prev.bets.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          type="number"
                          placeholder="Stake (SC)"
                          min="0.01"
                          step="0.01"
                          value={bet.stake || ''}
                          onChange={(e) => updateBetStake(index, parseFloat(e.target.value) || 0)}
                        />
                        {bet.stake > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Potential payout: {(bet.stake * bet.odds).toFixed(2)} SC
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {betSlip.totalStake > 0 && (
                    <div className="border-t pt-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Stake:</span>
                          <span className="font-medium">{betSlip.totalStake.toFixed(2)} SC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Potential Payout:</span>
                          <span className="font-medium">{betSlip.totalPayout.toFixed(2)} SC</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Potential Profit:</span>
                          <span className="font-medium">
                            +{(betSlip.totalPayout - betSlip.totalStake).toFixed(2)} SC
                          </span>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-4" 
                        onClick={placeBets}
                        disabled={!wallet || wallet.sweepsCoins < betSlip.totalStake}
                      >
                        Place Bets
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Bets */}
          {showMyBets && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  My Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {userBets.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No bets placed yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {userBets.slice().reverse().map(bet => (
                        <div key={bet.id} className="border rounded p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant={
                              bet.status === 'won' ? 'default' :
                              bet.status === 'lost' ? 'destructive' :
                              bet.status === 'pending' ? 'secondary' : 'outline'
                            }>
                              {bet.status.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {bet.placedAt.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="font-medium mb-1">
                            {events.find(e => e.id === bet.eventId)?.awayTeam} @{' '}
                            {events.find(e => e.id === bet.eventId)?.homeTeam}
                          </div>
                          
                          <div className="text-muted-foreground text-xs mb-2">
                            Stake: {bet.stake.toFixed(2)} SC • Odds: {bet.odds.toFixed(2)}
                          </div>
                          
                          <div className="text-xs">
                            Potential Payout: {bet.potentialPayout.toFixed(2)} SC
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
