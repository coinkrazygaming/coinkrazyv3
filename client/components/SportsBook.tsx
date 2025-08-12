import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Football,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Star,
  Zap,
  Play,
  Users,
  Calendar,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Bell,
  Info,
  Plus,
  Minus,
  X,
  CheckCircle,
  AlertCircle,
  MapPin,
  Timer,
  Flame,
  Crown,
  Award,
  Bookmark,
  Share2,
  Eye,
  Activity,
  Radio,
  Tv,
  Globe,
  Calculator,
  Coins,
  Settings,
  History,
  FileText,
  ArrowUp,
  ArrowDown,
  Gamepad2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  sportsBookService,
  SportEvent,
  SportsBet,
  BetSlip,
  BetSlipSelection,
  SportsPromotion,
  BettingStats,
  SportType,
} from "@/services/sportsBookService";

export default function SportsBook() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [selectedSport, setSelectedSport] = useState<SportType | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "live" | "upcoming" | "popular"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [betSlip, setBetSlip] = useState<BetSlip>({
    selections: [],
    betType: "single",
    totalStake: 0,
    totalOdds: 1,
    potentialPayout: 0,
  });
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [playerBets, setPlayerBets] = useState<SportsBet[]>([]);
  const [promotions, setPromotions] = useState<SportsPromotion[]>([]);
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [oddsFormat, setOddsFormat] = useState<
    "american" | "decimal" | "fractional"
  >("american");
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showPromotionsDialog, setShowPromotionsDialog] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSportsData();
    startRealTimeUpdates();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updatedBetSlip = sportsBookService.getBetSlip();
    setBetSlip(updatedBetSlip);
  }, [betSlip.selections.length]);

  const loadSportsData = () => {
    const allEvents = sportsBookService.getEvents();
    setEvents(allEvents);
    setPlayerBets(sportsBookService.getBets());
    setPromotions(sportsBookService.getPromotions());
    setStats(sportsBookService.getStats());
  };

  const startRealTimeUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      const updatedEvents = sportsBookService.getEvents();
      setEvents(updatedEvents);

      const updatedBetSlip = sportsBookService.getBetSlip();
      setBetSlip(updatedBetSlip);
    }, 5000);
  };

  const getFilteredEvents = () => {
    let filtered = events;

    // Filter by sport
    if (selectedSport !== "all") {
      filtered = filtered.filter((event) => event.sport === selectedSport);
    }

    // Filter by category
    switch (selectedCategory) {
      case "live":
        filtered = filtered.filter((event) => event.live);
        break;
      case "upcoming":
        filtered = filtered.filter((event) => event.startTime > new Date());
        break;
      case "popular":
        filtered = filtered.filter((event) => event.popular);
        break;
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.homeTeam.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          event.awayTeam.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          event.league.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      // Sort by: live > upcoming > others
      if (a.live && !b.live) return -1;
      if (!a.live && b.live) return 1;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  };

  const addToBetSlip = (
    event: SportEvent,
    marketName: string,
    outcomeName: string,
    odds: number,
    line?: number,
  ) => {
    const selection: BetSlipSelection = {
      id: `${event.id}-${marketName}-${outcomeName}`,
      eventId: event.id,
      eventName: `${event.awayTeam.name} @ ${event.homeTeam.name}`,
      marketName,
      outcomeName,
      odds,
      line,
      isLive: event.live,
    };

    sportsBookService.addToBetSlip(selection);
    setShowBetSlip(true);
  };

  const removeFromBetSlip = (selectionId: string) => {
    sportsBookService.removeFromBetSlip(selectionId);
  };

  const setBetType = (type: "single" | "parlay" | "system") => {
    sportsBookService.setBetType(type);
  };

  const setStake = (amount: number, selectionId?: string) => {
    sportsBookService.setStake(amount, selectionId);
  };

  const placeBet = async () => {
    setIsPlacingBet(true);
    try {
      const result = await sportsBookService.placeBet();
      if (result.success) {
        sportsBookService.clearBetSlip();
        setShowBetSlip(false);
        await loadSportsData();
      } else {
        console.error("Bet placement failed:", result.error);
      }
    } catch (error) {
      console.error("Error placing bet:", error);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const formatOdds = (odds: number) => {
    switch (oddsFormat) {
      case "american":
        return odds >= 2.0
          ? `+${Math.round((odds - 1) * 100)}`
          : `-${Math.round(100 / (odds - 1))}`;
      case "fractional":
        const decimal = odds - 1;
        // Convert to simplest fraction
        const gcd = (a: number, b: number): number =>
          b === 0 ? a : gcd(b, a % b);
        const numerator = Math.round(decimal * 100);
        const denominator = 100;
        const divisor = gcd(numerator, denominator);
        return `${numerator / divisor}/${denominator / divisor}`;
      case "decimal":
      default:
        return odds.toFixed(2);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return "Live";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getSportIcon = (sport: SportType) => {
    switch (sport) {
      case "football":
        return <Football className="w-5 h-5" />;
      case "basketball":
        return <Target className="w-5 h-5" />;
      case "baseball":
        return <Target className="w-5 h-5" />;
      case "hockey":
        return <Target className="w-5 h-5" />;
      case "soccer":
        return <Football className="w-5 h-5" />;
      case "tennis":
        return <Target className="w-5 h-5" />;
      case "golf":
        return <Target className="w-5 h-5" />;
      case "mma":
        return <Target className="w-5 h-5" />;
      case "boxing":
        return <Target className="w-5 h-5" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const EventCard = ({ event }: { event: SportEvent }) => {
    const moneylineMarket = event.markets.find((m) => m.type === "moneyline");
    const spreadMarket = event.markets.find((m) => m.type === "spread");
    const totalMarket = event.markets.find((m) => m.type === "total");

    return (
      <Card
        className={`hover:shadow-lg transition-all duration-300 ${
          event.live ? "border-red-500/50 bg-red-500/5" : ""
        } ${event.featured ? "border-gold-500/50 bg-gold-500/5" : ""}`}
      >
        {event.live && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-red-500 text-white animate-pulse">
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getSportIcon(event.sport)}
              <div>
                <div className="font-bold text-sm text-muted-foreground">
                  {event.league}
                </div>
                <div className="text-xs text-muted-foreground">
                  {event.live
                    ? `${event.period} - ${event.clock}`
                    : formatTimeUntil(event.startTime)}
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              {event.featured && (
                <Badge
                  variant="outline"
                  className="border-gold-500 text-gold-500"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              {event.popular && (
                <Badge
                  variant="outline"
                  className="border-orange-500 text-orange-500"
                >
                  <Flame className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Teams and Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{event.awayTeam.name}</div>
                {event.awayTeam.record && (
                  <div className="text-xs text-muted-foreground">
                    ({event.awayTeam.record})
                  </div>
                )}
              </div>
              {event.live && event.awayScore !== undefined && (
                <div className="text-lg font-bold">{event.awayScore}</div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{event.homeTeam.name}</div>
                {event.homeTeam.record && (
                  <div className="text-xs text-muted-foreground">
                    ({event.homeTeam.record})
                  </div>
                )}
              </div>
              {event.live && event.homeScore !== undefined && (
                <div className="text-lg font-bold">{event.homeScore}</div>
              )}
            </div>
          </div>

          {/* Betting Markets */}
          <div className="space-y-3">
            {/* Moneyline */}
            {moneylineMarket && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Moneyline
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {moneylineMarket.outcomes.map((outcome) => (
                    <Button
                      key={outcome.id}
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto p-2"
                      onClick={() =>
                        addToBetSlip(
                          event,
                          "Moneyline",
                          outcome.name,
                          outcome.odds,
                        )
                      }
                      disabled={!outcome.isAvailable}
                    >
                      <div className="text-xs">{outcome.name}</div>
                      <div className="font-bold">
                        {formatOdds(outcome.odds)}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Spread */}
            {spreadMarket && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Point Spread
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {spreadMarket.outcomes.map((outcome) => (
                    <Button
                      key={outcome.id}
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto p-2"
                      onClick={() =>
                        addToBetSlip(
                          event,
                          "Point Spread",
                          `${outcome.name} ${outcome.line}`,
                          outcome.odds,
                          outcome.line,
                        )
                      }
                      disabled={!outcome.isAvailable}
                    >
                      <div className="text-xs">{outcome.name}</div>
                      <div className="font-bold">
                        {outcome.line && outcome.line > 0 ? "+" : ""}
                        {outcome.line} ({formatOdds(outcome.odds)})
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            {totalMarket && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">
                  Total Points
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {totalMarket.outcomes.map((outcome) => (
                    <Button
                      key={outcome.id}
                      variant="outline"
                      size="sm"
                      className="flex flex-col h-auto p-2"
                      onClick={() =>
                        addToBetSlip(
                          event,
                          "Total Points",
                          `${outcome.name} ${outcome.total}`,
                          outcome.odds,
                          outcome.total,
                        )
                      }
                      disabled={!outcome.isAvailable}
                    >
                      <div className="text-xs">{outcome.name}</div>
                      <div className="font-bold">
                        {outcome.total} ({formatOdds(outcome.odds)})
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* More Markets Button */}
          <Button variant="ghost" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            {event.markets.length - 3} More Markets
          </Button>
        </CardContent>
      </Card>
    );
  };

  const BetSlipComponent = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Bet Slip ({betSlip.selections.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sportsBookService.clearBetSlip()}
            disabled={betSlip.selections.length === 0}
          >
            Clear All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {betSlip.selections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No selections yet</p>
            <p className="text-sm">Click on odds to add bets</p>
          </div>
        ) : (
          <>
            {/* Bet Type Selection */}
            <div className="flex gap-1">
              {(["single", "parlay", "system"] as const).map((type) => (
                <Button
                  key={type}
                  variant={betSlip.betType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBetType(type)}
                  disabled={type !== "single" && betSlip.selections.length < 2}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            {/* Selections */}
            <div className="space-y-2">
              {betSlip.selections.map((selection) => (
                <Card key={selection.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {selection.eventName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selection.marketName}
                      </div>
                      <div className="text-sm">{selection.outcomeName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatOdds(selection.odds)}
                        {selection.isLive && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            LIVE
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromBetSlip(selection.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {betSlip.betType === "single" && (
                    <div className="mt-2">
                      <Input
                        type="number"
                        placeholder="Stake"
                        value={selection.stake || ""}
                        onChange={(e) =>
                          setStake(Number(e.target.value), selection.id)
                        }
                        className="h-8"
                      />
                      {selection.stake && (
                        <div className="text-xs text-muted-foreground mt-1">
                          To win:{" "}
                          {formatCurrency(
                            (selection.stake || 0) * selection.odds,
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Stake Input for Parlay/System */}
            {betSlip.betType !== "single" && (
              <div>
                <label className="text-sm font-medium">Stake Amount</label>
                <Input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => {
                    const amount = Number(e.target.value);
                    setStakeAmount(amount);
                    setStake(amount);
                  }}
                  placeholder="Enter stake"
                />
              </div>
            )}

            {/* Totals */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Stake:</span>
                <span className="font-bold">
                  {formatCurrency(betSlip.totalStake)}
                </span>
              </div>

              {betSlip.betType === "parlay" && (
                <div className="flex justify-between text-sm">
                  <span>Total Odds:</span>
                  <span className="font-bold">
                    {formatOdds(betSlip.totalOdds)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Potential Payout:</span>
                <span className="font-bold text-green-500">
                  {formatCurrency(betSlip.potentialPayout)}
                </span>
              </div>
            </div>

            {/* Place Bet Button */}
            <Button
              onClick={placeBet}
              disabled={isPlacingBet || betSlip.totalStake <= 0}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isPlacingBet ? "Placing Bet..." : "Place Bet"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-green-600/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <Football className="w-6 h-6 text-white" />
                </div>
                Sports Book
                <Badge className="bg-blue-600 text-white">Live Betting</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Live sports betting with real-time odds and comprehensive
                markets
              </p>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {events.filter((e) => e.live).length}
                </div>
                <div className="text-sm text-muted-foreground">Live Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {events.filter((e) => e.startTime > new Date()).length}
                </div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search teams, leagues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={selectedSport}
                onValueChange={(value) =>
                  setSelectedSport(value as SportType | "all")
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="baseball">Baseball</SelectItem>
                  <SelectItem value="hockey">Hockey</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="mma">MMA</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={oddsFormat}
                onValueChange={(value) => setOddsFormat(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="fractional">Fractional</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowStatsDialog(true)}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowPromotionsDialog(true)}
              >
                <Star className="w-4 h-4" />
              </Button>

              <Button variant="outline" onClick={loadSportsData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            All Events
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Live Now
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Events */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {getFilteredEvents().map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {getFilteredEvents().length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Football className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Events Found</h3>
                    <p className="text-muted-foreground">
                      No events match your current filters. Try adjusting your
                      search criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Bet Slip */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <BetSlipComponent />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Your Betting Statistics</DialogTitle>
          </DialogHeader>
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Overall Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Bets:</span>
                    <span className="font-bold">{stats.totalBets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="font-bold text-green-500">
                      {stats.winRate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Profit:</span>
                    <span
                      className={`font-bold ${stats.netProfit >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {formatCurrency(stats.netProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biggest Win:</span>
                    <span className="font-bold text-gold-400">
                      {formatCurrency(stats.biggestWin)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Favorite Sports */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sport Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats.sportBreakdown)
                    .slice(0, 5)
                    .map(([sport, data]) => (
                      <div key={sport} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{sport}:</span>
                          <span className="font-bold">{data.bets} bets</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Win Rate:
                          </span>
                          <span
                            className={
                              data.winRate >= 50
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {data.winRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>

              {/* Recent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Current Streak:
                    </span>
                    <span className="font-bold">{stats.currentStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Longest Win Streak:
                    </span>
                    <span className="font-bold text-green-500">
                      {stats.longestWinStreak}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Parlay Accuracy:
                    </span>
                    <span className="font-bold">{stats.parlayAccuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Live Win Rate:
                    </span>
                    <span className="font-bold">{stats.liveWinRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Promotions Dialog */}
      <Dialog
        open={showPromotionsDialog}
        onOpenChange={setShowPromotionsDialog}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Active Promotions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {promotions.map((promo) => (
              <Card key={promo.id} className="border-gold-500/20 bg-gold-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-gold-500" />
                        {promo.title}
                      </h4>
                      <p className="text-muted-foreground mb-2">
                        {promo.description}
                      </p>

                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Value: </span>
                          <span className="font-bold">
                            {promo.type === "multiplier"
                              ? `${promo.value}x`
                              : promo.type === "cashback"
                                ? `${promo.value * 100}%`
                                : `${promo.value}`}
                          </span>
                        </div>
                        {promo.minBet && (
                          <div>
                            <span className="text-muted-foreground">
                              Min Bet:{" "}
                            </span>
                            <span className="font-bold">
                              {formatCurrency(promo.minBet)}
                            </span>
                          </div>
                        )}
                        {promo.maxBenefit && (
                          <div>
                            <span className="text-muted-foreground">
                              Max Benefit:{" "}
                            </span>
                            <span className="font-bold">
                              {formatCurrency(promo.maxBenefit)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground mt-2">
                        Valid until: {promo.validUntil.toLocaleDateString()}
                      </div>
                    </div>

                    <Badge className="bg-gold-500 text-black">
                      {promo.type.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
