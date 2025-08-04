import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Coins,
  Filter,
  Search,
  Star,
  Trophy,
  Users,
  TrendingUp,
  Play,
  Crown,
  Zap,
  Target,
  Gamepad2,
  Timer,
  DollarSign,
  Eye,
  Heart,
  Shuffle,
  Plus,
  ShoppingCart,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { sportsDataService, GameWithLines } from "@/services/sportsApi";
import { Link } from "react-router-dom";
import TableGames from "@/components/games/TableGames";
import BingoHall from "@/components/games/BingoHall";
import MiniGames from "@/components/games/MiniGames";
import SlotsIntegration from "@/components/games/SlotsIntegration";
import { playerCountService } from "@/services/playerCountService";
import {
  gamesTrackingService,
  PlatformStats,
} from "@/services/gamesTrackingService";

// Import the BetSelection interface from the original Sportsbook
interface BetSelection {
  gameId: string;
  game: GameWithLines;
  betType: "spread" | "total" | "moneyline";
  selection: string;
  odds: number;
  line?: number;
  amount?: number;
}

// Simulated game data
const slotGames = [
  // Popular Pragmatic Play games
  {
    id: 1,
    name: "Sweet Bonanza",
    provider: "Pragmatic Play",
    rtp: "96.48%",
    jackpot: "$125,847",
    players: 423,
    category: "slots",
    featured: true,
    image: "🍬",
  },
  {
    id: 2,
    name: "The Dog House",
    provider: "Pragmatic Play",
    rtp: "96.51%",
    jackpot: "$89,234",
    players: 312,
    category: "slots",
    featured: true,
    image: "🐕",
  },
  {
    id: 3,
    name: "Gates of Olympus",
    provider: "Pragmatic Play",
    rtp: "96.50%",
    jackpot: "$267,891",
    players: 578,
    category: "slots",
    featured: true,
    image: "⚡",
  },
  {
    id: 4,
    name: "Wolf Gold",
    provider: "Pragmatic Play",
    rtp: "96.01%",
    jackpot: "$156,782",
    players: 445,
    category: "slots",
    featured: true,
    image: "🐺",
  },

  // NetEnt classics
  {
    id: 5,
    name: "Starburst",
    provider: "NetEnt",
    rtp: "96.09%",
    jackpot: "$45,234",
    players: 678,
    category: "slots",
    image: "💎",
  },
  {
    id: 6,
    name: "Gonzo's Quest",
    provider: "NetEnt",
    rtp: "95.97%",
    jackpot: "$78,123",
    players: 534,
    category: "slots",
    image: "🗿",
  },
  {
    id: 7,
    name: "Dead or Alive 2",
    provider: "NetEnt",
    rtp: "96.82%",
    jackpot: "$189,456",
    players: 389,
    category: "slots",
    image: "🤠",
  },

  // Play'n GO games
  {
    id: 8,
    name: "Book of Dead",
    provider: "Play'n GO",
    rtp: "96.21%",
    jackpot: "$123,567",
    players: 445,
    category: "slots",
    image: "📚",
  },
  {
    id: 9,
    name: "Reactoonz",
    provider: "Play'n GO",
    rtp: "96.51%",
    jackpot: "$234,789",
    players: 356,
    category: "slots",
    image: "���",
  },

  // Custom CoinKrazy games
  {
    id: 10,
    name: "Josey Duck Game",
    provider: "CoinKrazy",
    rtp: "96.8%",
    jackpot: "$425,847",
    players: 723,
    category: "slots",
    featured: true,
    image: "🦆",
  },
  {
    id: 11,
    name: "Colin Shots",
    provider: "CoinKrazy",
    rtp: "97.2%",
    jackpot: "$189,234",
    players: 612,
    category: "slots",
    featured: true,
    image: "🎯",
  },
  {
    id: 12,
    name: "Beth's Darts",
    provider: "CoinKrazy",
    rtp: "96.5%",
    jackpot: "$167,891",
    players: 489,
    category: "slots",
    featured: true,
    image: "🎯",
  },
];

const liveGames = [
  {
    id: 13,
    name: "Texas Hold'em",
    type: "poker",
    players: 245,
    pot: "$12,450",
    status: "active",
    image: "♠️",
  },
  {
    id: 14,
    name: "Omaha Hi-Lo",
    type: "poker",
    players: 156,
    pot: "$8,750",
    status: "active",
    image: "♥️",
  },
  {
    id: 15,
    name: "7-Card Stud",
    type: "poker",
    players: 89,
    pot: "$5,250",
    status: "active",
    image: "♦️",
  },
  {
    id: 16,
    name: "Jailhouse Spades",
    type: "spades",
    players: 123,
    pot: "$3,450",
    status: "active",
    image: "♠️",
  },
];

const bingoRooms = [
  {
    id: 17,
    name: "Golden Room",
    nextGame: "2 min",
    pot: "$15,450",
    players: 234,
    type: "90-ball",
    image: "🏆",
  },
  {
    id: 18,
    name: "Silver Room",
    nextGame: "5 min",
    pot: "$8,750",
    players: 167,
    type: "75-ball",
    image: "🥈",
  },
  {
    id: 19,
    name: "Bronze Room",
    nextGame: "1 min",
    pot: "$4,250",
    players: 89,
    type: "30-ball",
    image: "🥉",
  },
];

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState("featured");
  const [searchTerm, setSearchTerm] = useState("");
  const [currencyMode, setCurrencyMode] = useState<"GC" | "SC">("SC");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Sportsbook state
  const [sportsGames, setSportsGames] = useState<GameWithLines[]>([]);
  const [sportsLoading, setSportsLoading] = useState(false);
  const [betSlip, setBetSlip] = useState<BetSelection[]>([]);
  const [showBetSlip, setShowBetSlip] = useState(false);
  const [userBalance] = useState({ gc: 125000, sc: 450 });

  // Real-time stats from services
  const [liveStats, setLiveStats] = useState({
    totalPlayers: 0,
    activeGames: 0,
    totalPayout: 0,
  });
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null,
  );

  useEffect(() => {
    // Subscribe to real-time player count
    const unsubscribePlayers = playerCountService.subscribeToPlayerCount(
      (count) => {
        setLiveStats((prev) => ({ ...prev, totalPlayers: count }));
      },
    );

    // Subscribe to platform stats for games and payouts
    const unsubscribeStats = gamesTrackingService.subscribeToStats((stats) => {
      setPlatformStats(stats);
      setLiveStats((prev) => ({
        ...prev,
        activeGames: stats.totalGamesAvailable,
        totalPayout: Math.round(stats.totalSCWonToday * 1000), // Convert SC to USD equivalent
      }));
    });

    return () => {
      unsubscribePlayers();
      unsubscribeStats();
    };
  }, []);

  // Load sports games when sports tab is selected
  useEffect(() => {
    if (selectedCategory === "sports") {
      loadSportsGames();
    }
  }, [selectedCategory]);

  const loadSportsGames = async () => {
    setSportsLoading(true);
    try {
      const games = await sportsDataService.getUpcomingGames();
      setSportsGames(games || []); // Ensure we always have an array
    } catch (error) {
      console.error("Error loading sports games:", error);
      // Set empty array as fallback
      setSportsGames([]);
    } finally {
      setSportsLoading(false);
    }
  };

  const filteredGames = slotGames
    .filter((game) => {
      if (selectedCategory === "featured") return game.featured;
      if (selectedCategory === "slots") return game.category === "slots";
      return true;
    })
    .filter(
      (game) =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const toggleFavorite = (gameId: number) => {
    setFavorites((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId],
    );
  };

  // Sportsbook functions
  const addToBetSlip = (
    game: GameWithLines,
    betType: "spread" | "total" | "moneyline",
    selection: string,
    odds: number,
    line?: number,
  ) => {
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
      const updatedSlip = [...betSlip];
      updatedSlip[existingIndex] = newSelection;
      setBetSlip(updatedSlip);
    } else {
      setBetSlip([...betSlip, newSelection]);
    }

    setShowBetSlip(true);
  };

  const removeFromBetSlip = (gameId: string) => {
    setBetSlip(betSlip.filter((bet) => bet.gameId !== gameId));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                Game Lobby
              </h1>
              <p className="text-muted-foreground text-lg">
                700+ Games • Live Sports Betting • Tournaments
              </p>
            </div>

            {/* Live Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-casino-blue" />
                  <span className="text-2xl font-bold">
                    {liveStats.totalPlayers.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Players Online</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="w-5 h-5 text-gold-500" />
                  <span className="text-2xl font-bold">
                    {liveStats.activeGames}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Games Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">
                    ${liveStats.totalPayout.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Won Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex bg-card rounded-lg p-1">
              <Button
                variant={currencyMode === "GC" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrencyMode("GC")}
                className={
                  currencyMode === "GC"
                    ? "bg-gold-500 text-black hover:bg-gold-600"
                    : ""
                }
              >
                <Coins className="w-4 h-4 mr-2" />
                Gold Coins (Play)
              </Button>
              <Button
                variant={currencyMode === "SC" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrencyMode("SC")}
                className={
                  currencyMode === "SC"
                    ? "bg-casino-blue text-white hover:bg-casino-blue-dark"
                    : ""
                }
              >
                <Crown className="w-4 h-4 mr-2" />
                Sweeps Coins (Win)
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border border-border"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Game Categories */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
            <TabsTrigger value="featured">
              <Star className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="slots">
              <Coins className="w-4 h-4 mr-2" />
              Slots
            </TabsTrigger>
            <TabsTrigger value="table">
              <Heart className="w-4 h-4 mr-2" />
              Table Games
            </TabsTrigger>
            <TabsTrigger value="live">
              <Users className="w-4 h-4 mr-2" />
              Live Games
            </TabsTrigger>
            <TabsTrigger value="bingo">
              <Target className="w-4 h-4 mr-2" />
              Bingo
            </TabsTrigger>
            <TabsTrigger value="mini">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Mini Games
            </TabsTrigger>
            <TabsTrigger value="sports">
              <Trophy className="w-4 h-4 mr-2" />
              Sports
            </TabsTrigger>
          </TabsList>

          {/* Featured Games */}
          <TabsContent value="featured" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <Card
                  key={game.id}
                  className="group hover:shadow-xl hover:shadow-gold-500/20 transition-all duration-300 border-border/50 hover:border-gold-500/50 overflow-hidden"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-gold/20 flex items-center justify-center text-6xl">
                      {game.image}
                    </div>
                    {game.featured && (
                      <Badge className="absolute top-2 left-2 bg-gold-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-black/20"
                      onClick={() => toggleFavorite(game.id)}
                    >
                      <Heart
                        className={`w-4 h-4 ${favorites.includes(game.id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-gold-400 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {game.provider}
                    </p>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RTP:</span>
                        <span className="text-green-400 font-medium">
                          {game.rtp}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jackpot:</span>
                        <span className="text-gold-400 font-bold">
                          {game.jackpot}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Playing:</span>
                        <span className="text-casino-blue-light">
                          {game.players} players
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play {currencyMode}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Slots */}
          <TabsContent value="slots" className="mt-8">
            <SlotsIntegration />
          </TabsContent>

          {/* Live Games */}
          <TabsContent value="live" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveGames.map((game) => (
                <Card
                  key={game.id}
                  className="hover:shadow-xl transition-all duration-300 border-border/50 hover:border-casino-blue/50"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-3xl">{game.image}</span>
                        {game.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-400"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-bold">{game.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Current Pot:
                        </span>
                        <span className="text-gold-400 font-bold">
                          {game.pot}
                        </span>
                      </div>
                      <Button className="w-full bg-casino-blue hover:bg-casino-blue-dark">
                        <Users className="w-4 h-4 mr-2" />
                        Join Table
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bingo Rooms */}
          <TabsContent value="bingo" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bingoRooms.map((room) => (
                <Card
                  key={room.id}
                  className="hover:shadow-xl transition-all duration-300 border-border/50 hover:border-gold-500/50"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-3xl">{room.image}</span>
                      {room.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Next Game:
                        </span>
                        <span className="font-bold text-casino-blue">
                          {room.nextGame}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Prize Pool:
                        </span>
                        <span className="text-gold-400 font-bold">
                          {room.pot}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-bold">{room.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-sm">{room.type}</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                        <Timer className="w-4 h-4 mr-2" />
                        Enter Room
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Table Games */}
          <TabsContent value="table" className="mt-8">
            <TableGames />
          </TabsContent>

          {/* Bingo Hall */}
          <TabsContent value="bingo" className="mt-8">
            <BingoHall />
          </TabsContent>

          {/* Mini Games */}
          <TabsContent value="mini" className="mt-8">
            <MiniGames />
          </TabsContent>

          {/* Sports Betting */}
          <TabsContent value="sports" className="mt-8">
            {/* Sports betting notice */}
            <div className="mb-6 p-4 bg-casino-blue/10 border border-casino-blue/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-casino-blue" />
                <span className="font-bold text-casino-blue">
                  Sports Betting - Sweeps Coins Only
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                All sports bets must be placed using Sweeps Coins (SC). Win real
                cash prizes with successful predictions!
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Sports Content */}
              <div className="lg:col-span-3">
                {sportsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      Loading live sports data...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sportsGames.length === 0 ? (
                      <Card className="text-center p-12">
                        <CardContent>
                          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-bold mb-2">
                            No Games Available
                          </h3>
                          <p className="text-muted-foreground">
                            Check back later for upcoming games and live betting
                            opportunities.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      sportsGames.map((game) => (
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
                                    <h4 className="font-bold mb-2">
                                      Point Spread
                                    </h4>
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
                                          {game.bestLine.spread.away > 0
                                            ? "+"
                                            : ""}
                                          {game.bestLine.spread.away}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatOdds(
                                            game.bestLine.spread.awayOdds,
                                          )}
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
                                          {game.bestLine.spread.home > 0
                                            ? "+"
                                            : ""}
                                          {game.bestLine.spread.home}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {formatOdds(
                                            game.bestLine.spread.homeOdds,
                                          )}
                                        </div>
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Total (Over/Under) */}
                                {game.bestLine.total && (
                                  <div>
                                    <h4 className="font-bold mb-2">
                                      Total Points (O/U{" "}
                                      {game.bestLine.total.over})
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
                                          {formatOdds(
                                            game.bestLine.total.overOdds,
                                          )}
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
                                          {formatOdds(
                                            game.bestLine.total.underOdds,
                                          )}
                                        </div>
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Moneyline */}
                                {game.bestLine.moneyline && (
                                  <div>
                                    <h4 className="font-bold mb-2">
                                      Moneyline
                                    </h4>
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
                                          {formatOdds(
                                            game.bestLine.moneyline.away,
                                          )}
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
                                          {formatOdds(
                                            game.bestLine.moneyline.home,
                                          )}
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
                )}
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
                          <p className="text-muted-foreground">
                            No bets selected
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Click on odds to add bets
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="text-center">
                            <Badge className="bg-gold-500 text-black">
                              {betSlip.length === 1
                                ? "Single Bet"
                                : `${betSlip.length}-Pick Parlay`}
                            </Badge>
                          </div>

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
                                    onClick={() =>
                                      removeFromBetSlip(bet.gameId)
                                    }
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

                          <Link to="/pick-cards" className="block">
                            <Button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Pick Card
                            </Button>
                          </Link>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Sports Betting</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link to="/pick-cards">
                      <Button variant="outline" className="w-full">
                        <Trophy className="w-4 h-4 mr-2" />
                        My Pick Cards
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowBetSlip(!showBetSlip)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Bet Slip ({betSlip.length})
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
