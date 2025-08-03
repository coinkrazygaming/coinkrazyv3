import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  TrendingUp,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Clock,
  Star,
  Zap,
  Target,
  Users,
  Calendar,
  Filter,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Coins,
} from "lucide-react";
import {
  sportsDataService,
  GameWithLines,
  BettingLine,
} from "@/services/sportsApi";
import { Link } from "react-router-dom";

export interface BetSelection {
  gameId: string;
  game: GameWithLines;
  betType: "spread" | "total" | "moneyline";
  selection: string;
  odds: number;
  line?: number;
  amount?: number;
}

export interface BetSlip {
  id: string;
  selections: BetSelection[];
  betType: "single" | "parlay";
  totalOdds: number;
  potentialPayout: number;
  wagerAmount: number;
  status: "pending" | "placed" | "won" | "lost";
  timestamp: string;
}

export default function Sportsbook() {
  const [games, setGames] = useState<GameWithLines[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [wagerAmount, setWagerAmount] = useState<string>("");
  const [userBalance] = useState({ gc: 125000, sc: 450 }); // This would come from auth context
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [liveBets, setLiveBets] = useState<BetSlip[]>([]);

  // Parlay odds multipliers
  const PARLAY_ODDS = {
    1: 1, // Single bet
    2: 3, // 2-pick parlay = 3x
    3: 5, // 3-pick parlay = 5x
    4: 10, // 4-pick parlay = 10x
    5: 20, // 5-pick parlay = 20x
    6: 40, // 6-pick parlay = 40x
  };

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      const upcomingGames = await sportsDataService.getUpcomingGames();
      setGames(upcomingGames);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) => {
    const matchesSport =
      selectedSport === "all" ||
      game.sport.toLowerCase().includes(selectedSport);
    const matchesSearch =
      game.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.awayTeam.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const addToBetSlip = (
    game: GameWithLines,
    betType: "spread" | "total" | "moneyline",
    selection: string,
    odds: number,
    line?: number,
  ) => {
    // Check if this game is already in bet slip
    const existingIndex = betSlip.findIndex((bet) => bet.gameId === game.id);

    const newSelection: BetSelection = {
      gameId: game.id,
      game,
      betType,
      selection,
      odds,
      line,
    };

    if (existingIndex >= 0) {
      // Replace existing selection for this game
      const updatedSlip = [...betSlip];
      updatedSlip[existingIndex] = newSelection;
      setBetSlip(updatedSlip);
    } else {
      // Add new selection
      setBetSlip([...betSlip, newSelection]);
    }

    setShowBetSlip(true);
  };

  const removeFromBetSlip = (gameId: string) => {
    setBetSlip(betSlip.filter((bet) => bet.gameId !== gameId));
  };

  const calculateParlay = () => {
    const numPicks = betSlip.length;
    if (numPicks === 0) return { totalOdds: 0, potentialPayout: 0 };

    if (numPicks === 1) {
      // Single bet - use actual odds
      const bet = betSlip[0];
      const decimalOdds =
        bet.odds > 0 ? bet.odds / 100 + 1 : 100 / Math.abs(bet.odds) + 1;
      const wager = parseFloat(wagerAmount) || 0;
      return {
        totalOdds: decimalOdds,
        potentialPayout: wager * decimalOdds,
      };
    } else {
      // Parlay - use fixed multipliers
      const multiplier = PARLAY_ODDS[Math.min(numPicks, 6)] || 1;
      const wager = parseFloat(wagerAmount) || 0;
      return {
        totalOdds: multiplier,
        potentialPayout: wager * multiplier,
      };
    }
  };

  const placeBet = async () => {
    if (betSlip.length === 0 || !wagerAmount) return;

    const wager = parseFloat(wagerAmount);
    if (wager > userBalance.gc) {
      // Redirect to Gold Coin Store
      window.location.href = "/store";
      return;
    }

    const { totalOdds, potentialPayout } = calculateParlay();

    const newBet: BetSlip = {
      id: Date.now().toString(),
      selections: [...betSlip],
      betType: betSlip.length === 1 ? "single" : "parlay",
      totalOdds,
      potentialPayout,
      wagerAmount: wager,
      status: "placed",
      timestamp: new Date().toISOString(),
    };

    setLiveBets([newBet, ...liveBets]);
    setBetSlip([]);
    setWagerAmount("");
    setShowBetSlip(false);

    // In production, this would make an API call to place the bet
    console.log("Bet placed:", newBet);
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = "";
    if (date.toDateString() === today.toDateString()) {
      dateStr = "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = "Tomorrow";
    } else {
      dateStr = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateStr} ${timeStr}`;
  };

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case "nfl":
        return "🏈";
      case "nba":
        return "🏀";
      case "mlb":
        return "⚾";
      case "nhl":
        return "🏒";
      default:
        return "🏆";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live sports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">CoinKrazy Sportsbook</h1>
              <p className="text-muted-foreground">
                Live odds on upcoming US sports games
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gold-400">
                  {userBalance.gc.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Gold Coins</div>
              </div>
              <Button
                onClick={() => setShowBetSlip(!showBetSlip)}
                className="relative bg-casino-blue hover:bg-casino-blue-dark"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Bet Slip
                {betSlip.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-gold-500 text-black min-w-[20px] h-5 text-xs">
                    {betSlip.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["all", "nfl", "nba", "mlb", "nhl"].map((sport) => (
                  <Button
                    key={sport}
                    variant={selectedSport === sport ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSport(sport)}
                    className={
                      selectedSport === sport
                        ? "bg-gold-500 text-black hover:bg-gold-600"
                        : ""
                    }
                  >
                    {sport.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Games List */}
            <div className="space-y-4">
              {filteredGames.length === 0 ? (
                <Card className="text-center p-12">
                  <CardContent>
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Games Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or check back later for more
                      games.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredGames.map((game) => (
                  <Card
                    key={game.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getSportIcon(game.sport)}
                          </span>
                          <div>
                            <Badge variant="outline">{game.sport}</Badge>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDateTime(game.gameTime)}
                            </div>
                          </div>
                        </div>
                        {game.status === "live" && (
                          <Badge className="bg-red-500 text-white animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                            LIVE
                          </Badge>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="font-bold text-lg">
                            {game.awayTeam}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Away
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-lg">
                            {game.homeTeam}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Home
                          </div>
                        </div>
                      </div>

                      {/* Betting Lines */}
                      {game.bestLine && (
                        <div className="space-y-4">
                          {/* Spread */}
                          {game.bestLine.spread && (
                            <div>
                              <h4 className="font-bold mb-2">Point Spread</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  className="flex flex-col h-auto p-3 hover:bg-casino-blue/10"
                                  onClick={() =>
                                    addToBetSlip(
                                      game,
                                      "spread",
                                      `${game.awayTeam} ${game.bestLine!.spread.away > 0 ? "+" : ""}${game.bestLine!.spread.away}`,
                                      game.bestLine!.spread.awayOdds,
                                      game.bestLine!.spread.away,
                                    )
                                  }
                                >
                                  <div className="font-bold">
                                    {game.awayTeam}
                                  </div>
                                  <div className="text-lg text-casino-blue">
                                    {game.bestLine.spread.away > 0 ? "+" : ""}
                                    {game.bestLine.spread.away}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatOdds(game.bestLine.spread.awayOdds)}
                                  </div>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex flex-col h-auto p-3 hover:bg-casino-blue/10"
                                  onClick={() =>
                                    addToBetSlip(
                                      game,
                                      "spread",
                                      `${game.homeTeam} ${game.bestLine!.spread.home > 0 ? "+" : ""}${game.bestLine!.spread.home}`,
                                      game.bestLine!.spread.homeOdds,
                                      game.bestLine!.spread.home,
                                    )
                                  }
                                >
                                  <div className="font-bold">
                                    {game.homeTeam}
                                  </div>
                                  <div className="text-lg text-casino-blue">
                                    {game.bestLine.spread.home > 0 ? "+" : ""}
                                    {game.bestLine.spread.home}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatOdds(game.bestLine.spread.homeOdds)}
                                  </div>
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Total (Over/Under) */}
                          {game.bestLine.total && (
                            <div>
                              <h4 className="font-bold mb-2">
                                Total Points (O/U {game.bestLine.total.over})
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  className="flex flex-col h-auto p-3 hover:bg-gold/10"
                                  onClick={() =>
                                    addToBetSlip(
                                      game,
                                      "total",
                                      `Over ${game.bestLine!.total.over}`,
                                      game.bestLine!.total.overOdds,
                                      game.bestLine!.total.over,
                                    )
                                  }
                                >
                                  <div className="font-bold">Over</div>
                                  <div className="text-lg text-gold-500">
                                    {game.bestLine.total.over}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatOdds(game.bestLine.total.overOdds)}
                                  </div>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex flex-col h-auto p-3 hover:bg-gold/10"
                                  onClick={() =>
                                    addToBetSlip(
                                      game,
                                      "total",
                                      `Under ${game.bestLine!.total.under}`,
                                      game.bestLine!.total.underOdds,
                                      game.bestLine!.total.under,
                                    )
                                  }
                                >
                                  <div className="font-bold">Under</div>
                                  <div className="text-lg text-gold-500">
                                    {game.bestLine.total.under}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatOdds(game.bestLine.total.underOdds)}
                                  </div>
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Moneyline */}
                          {game.bestLine.moneyline && (
                            <div>
                              <h4 className="font-bold mb-2">Moneyline</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant="outline"
                                  className="flex flex-col h-auto p-3 hover:bg-green-500/10"
                                  onClick={() =>
                                    addToBetSlip(
                                      game,
                                      "moneyline",
                                      game.awayTeam,
                                      game.bestLine!.moneyline.away,
                                    )
                                  }
                                >
                                  <div className="font-bold">
                                    {game.awayTeam}
                                  </div>
                                  <div className="text-lg text-green-500">
                                    {formatOdds(game.bestLine.moneyline.away)}
                                  </div>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="flex flex-col h-auto p-3 hover:bg-green-500/10"
                                  onClick={() =>
                                    addToBetSlip(
                                      game,
                                      "moneyline",
                                      game.homeTeam,
                                      game.bestLine!.moneyline.home,
                                    )
                                  }
                                >
                                  <div className="font-bold">
                                    {game.homeTeam}
                                  </div>
                                  <div className="text-lg text-green-500">
                                    {formatOdds(game.bestLine.moneyline.home)}
                                  </div>
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Bet Slip Sidebar */}
          <div className="lg:col-span-1">
            {showBetSlip && (
              <Card className="sticky top-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Bet Slip</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowBetSlip(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {betSlip.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No bets selected</p>
                      <p className="text-sm text-muted-foreground">
                        Click on odds to add bets
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Bet Type Indicator */}
                      <div className="text-center">
                        <Badge className="bg-gold-500 text-black">
                          {betSlip.length === 1
                            ? "Single Bet"
                            : `${betSlip.length}-Pick Parlay`}
                        </Badge>
                        {betSlip.length > 1 && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Pays {PARLAY_ODDS[Math.min(betSlip.length, 6)]}x
                            your wager
                          </div>
                        )}
                      </div>

                      {/* Selected Bets */}
                      <div className="space-y-3">
                        {betSlip.map((bet, index) => (
                          <div
                            key={`${bet.gameId}-${index}`}
                            className="p-3 bg-muted/20 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-bold text-sm">
                                {bet.selection}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromBetSlip(bet.gameId)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {bet.game.awayTeam} @ {bet.game.homeTeam}
                            </div>
                            <div className="text-xs text-casino-blue font-bold">
                              {formatOdds(bet.odds)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Wager Amount */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Wager Amount (GC)
                        </label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={wagerAmount}
                          onChange={(e) => setWagerAmount(e.target.value)}
                          min="1"
                          max={userBalance.gc}
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          Available: {userBalance.gc.toLocaleString()} GC
                        </div>
                      </div>

                      {/* Potential Payout */}
                      {wagerAmount && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex justify-between">
                            <span>Potential Payout:</span>
                            <span className="font-bold text-green-400">
                              {calculateParlay().potentialPayout.toLocaleString()}{" "}
                              GC
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Odds: {calculateParlay().totalOdds.toFixed(2)}x
                          </div>
                        </div>
                      )}

                      {/* Place Bet Button */}
                      <Button
                        onClick={placeBet}
                        disabled={!wagerAmount || betSlip.length === 0}
                        className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                      >
                        {parseFloat(wagerAmount || "0") > userBalance.gc ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy More Coins
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Place Bet
                          </>
                        )}
                      </Button>

                      {parseFloat(wagerAmount || "0") > userBalance.gc && (
                        <p className="text-center text-sm text-orange-500">
                          Insufficient balance.{" "}
                          <Link to="/store" className="underline">
                            Buy more Gold Coins
                          </Link>
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Live Bets */}
            {liveBets.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Your Bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveBets.slice(0, 5).map((bet) => (
                      <div key={bet.id} className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant={
                              bet.betType === "single" ? "default" : "secondary"
                            }
                          >
                            {bet.betType === "single"
                              ? "Single"
                              : `${bet.selections.length}-Pick`}
                          </Badge>
                          <Badge
                            variant={
                              bet.status === "won"
                                ? "default"
                                : bet.status === "lost"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {bet.status}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          Wager: {bet.wagerAmount.toLocaleString()} GC
                        </div>
                        <div className="text-sm text-green-400">
                          To Win: {bet.potentialPayout.toLocaleString()} GC
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
