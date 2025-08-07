import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Coins,
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
  Heart,
  Shuffle,
  Activity,
  BarChart3,
  Search,
  Filter,
  Plus,
  Flame,
  Gift,
  Sparkles,
  RefreshCw,
  Eye,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import CurrencySelector from "../components/CurrencySelector";
import EnhancedSlotsIntegration from "../components/games/EnhancedSlotsIntegration";
import EnhancedTableGames from "../components/games/EnhancedTableGames";
import BingoHall from "../components/games/BingoHall";
import MiniGames from "../components/games/MiniGames";
import { walletService, CurrencyType } from "../services/walletService";
import { gameInterfaceService } from "../services/gameInterfaceService";
import { playerCountService } from "../services/playerCountService";
import {
  gamesTrackingService,
  PlatformStats,
} from "../services/gamesTrackingService";
import { useToast } from "@/hooks/use-toast";

interface GameCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  playerCount: number;
  gameCount: number;
  currency: CurrencyType[];
  status: "active" | "maintenance" | "coming_soon";
}

interface QuickStats {
  totalPlayers: number;
  activeGames: number;
  totalWinnings: number;
  hotGame: string;
  jackpotPool: number;
}

const EnhancedGames: React.FC = () => {
  const { toast } = useToast();
  const userId = "user-current"; // This would come from auth context in production

  // State
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("GC");
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalPlayers: 0,
    activeGames: 0,
    totalWinnings: 0,
    hotGame: "",
    jackpotPool: 0,
  });
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const gameCategories: GameCategory[] = [
    {
      id: "slots",
      name: "Slot Games",
      icon: <Coins className="w-6 h-6" />,
      description: "Hundreds of themed slot machines with progressive jackpots",
      playerCount: 1247,
      gameCount: 387,
      currency: ["GC", "SC"],
      status: "active",
    },
    {
      id: "table",
      name: "Table Games",
      icon: <Target className="w-6 h-6" />,
      description:
        "Classic casino games like Blackjack, Roulette, and Baccarat",
      playerCount: 423,
      gameCount: 24,
      currency: ["GC", "SC"],
      status: "active",
    },
    {
      id: "live",
      name: "Live Dealer",
      icon: <Users className="w-6 h-6" />,
      description: "Real dealers streaming live from our studios",
      playerCount: 287,
      gameCount: 12,
      currency: ["GC", "SC"],
      status: "active",
    },
    {
      id: "bingo",
      name: "Bingo",
      icon: <Trophy className="w-6 h-6" />,
      description: "Multiple bingo rooms with various patterns and prizes",
      playerCount: 156,
      gameCount: 8,
      currency: ["GC", "SC"],
      status: "active",
    },
    {
      id: "sportsbook",
      name: "Sportsbook",
      icon: <Timer className="w-6 h-6" />,
      description: "Bet on live sports events with competitive odds",
      playerCount: 89,
      gameCount: 150,
      currency: ["SC"], // Sportsbook only allows Sweeps Coins
      status: "active",
    },
    {
      id: "mini",
      name: "Mini Games",
      icon: <Zap className="w-6 h-6" />,
      description: "Quick and fun mini-games for instant entertainment",
      playerCount: 234,
      gameCount: 15,
      currency: ["GC"],
      status: "active",
    },
  ];

  const featuredGames = [
    {
      id: "coinfrazy-special",
      name: "CoinKrazy Special",
      category: "slots",
      thumbnail: "/api/placeholder/300/200",
      players: 234,
      jackpot: 125847.92,
      isNew: true,
      isFeatured: true,
      rtp: 97.2,
    },
    {
      id: "live-blackjack-vip",
      name: "Live Blackjack VIP",
      category: "live",
      thumbnail: "/api/placeholder/300/200",
      players: 45,
      jackpot: 0,
      isNew: false,
      isFeatured: true,
      rtp: 99.5,
    },
    {
      id: "mega-bingo",
      name: "Mega Bingo Jackpot",
      category: "bingo",
      thumbnail: "/api/placeholder/300/200",
      players: 67,
      jackpot: 15247.5,
      isNew: false,
      isFeatured: true,
      rtp: 95.8,
    },
    {
      id: "champions-league",
      name: "UEFA Champions League",
      category: "sportsbook",
      thumbnail: "/api/placeholder/300/200",
      players: 123,
      jackpot: 0,
      isNew: false,
      isFeatured: true,
      rtp: 96.5,
    },
  ];

  useEffect(() => {
    loadGameData();
    const interval = setInterval(updateLiveStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadGameData = async () => {
    setIsLoading(true);
    try {
      // Load platform stats
      const stats = gamesTrackingService.getCurrentStats();
      setPlatformStats(stats);

      // Load player count
      const playerCount = await playerCountService.getCurrentPlayerCount();

      // Calculate quick stats
      setQuickStats({
        totalPlayers: playerCount,
        activeGames: gameCategories.reduce(
          (sum, cat) => sum + cat.gameCount,
          0,
        ),
        totalWinnings: stats.totalSCWonToday * 1000, // Convert to USD equivalent
        hotGame: "CoinKrazy Special",
        jackpotPool: 125847.92,
      });
    } catch (error) {
      console.error("Error loading game data:", error);
      toast({
        title: "Error",
        description: "Failed to load game data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLiveStats = () => {
    // Simulate real-time updates
    setQuickStats((prev) => ({
      ...prev,
      totalPlayers: prev.totalPlayers + Math.floor(Math.random() * 10) - 5,
      jackpotPool: prev.jackpotPool + Math.random() * 50,
    }));

    // Update game category player counts
    gameCategories.forEach((category) => {
      category.playerCount += Math.floor(Math.random() * 10) - 5;
      category.playerCount = Math.max(0, category.playerCount);
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveTab(categoryId);

    // Set currency based on category restrictions
    const category = gameCategories.find((cat) => cat.id === categoryId);
    if (category && category.currency.length === 1) {
      setSelectedCurrency(category.currency[0]);
      gameInterfaceService.setUserCurrency(
        userId,
        category.currency[0],
        categoryId as any,
      );
    }
  };

  const handleCurrencyChange = (currency: CurrencyType) => {
    setSelectedCurrency(currency);

    // Validate currency for current tab
    const category = gameCategories.find((cat) => cat.id === activeTab);
    if (category && !category.currency.includes(currency)) {
      toast({
        title: "Currency Not Available",
        description: `${currency} is not available for ${category.name}`,
        variant: "destructive",
      });
      return;
    }

    gameInterfaceService.setUserCurrency(userId, currency, activeTab as any);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "slots":
        return <EnhancedSlotsIntegration />;
      case "table":
      case "live":
        return <EnhancedTableGames />;
      case "bingo":
        return <BingoHall />;
      case "mini":
        return <MiniGames />;
      case "sportsbook":
        // For demo purposes, showing placeholder
        return (
          <div className="container mx-auto px-4 py-6">
            <Card className="text-center p-12">
              <Timer className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Sportsbook</h3>
              <p className="text-muted-foreground mb-4">
                Live sports betting with competitive odds
              </p>
              <Badge
                variant="outline"
                className="border-purple-500 text-purple-400"
              >
                Sweeps Coins Only
              </Badge>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  if (activeTab !== "overview") {
    return (
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setActiveTab("overview")}
                  className="flex items-center gap-2"
                >
                  <Gamepad2 className="w-4 h-4" />
                  All Games
                </Button>

                <div className="flex items-center gap-2">
                  {gameCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeTab === category.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex items-center gap-1"
                    >
                      {category.icon}
                      <span className="hidden md:inline">{category.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <CurrencySelector
                userId={userId}
                gameType={activeTab as any}
                onCurrencyChange={handleCurrencyChange}
                compact={true}
                showSettings={false}
                allowedCurrencies={
                  gameCategories.find((cat) => cat.id === activeTab)?.currency
                }
              />
            </div>
          </div>
        </div>

        {getTabContent()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              CoinKrazy Games
            </h1>
            <p className="text-muted-foreground text-lg">
              Experience the thrill of casino gaming with our extensive
              collection
            </p>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center p-4">
              <Users className="w-8 h-8 text-casino-blue mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {quickStats.totalPlayers.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Players Online
              </div>
            </Card>

            <Card className="text-center p-4">
              <Gamepad2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{quickStats.activeGames}</div>
              <div className="text-xs text-muted-foreground">Active Games</div>
            </Card>

            <Card className="text-center p-4">
              <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(quickStats.totalWinnings)}
              </div>
              <div className="text-xs text-muted-foreground">Won Today</div>
            </Card>

            <Card className="text-center p-4">
              <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {formatCurrency(quickStats.jackpotPool)}
              </div>
              <div className="text-xs text-muted-foreground">Jackpot Pool</div>
            </Card>

            <Card className="text-center p-4">
              <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-lg font-bold truncate">
                {quickStats.hotGame}
              </div>
              <div className="text-xs text-muted-foreground">Hot Game</div>
            </Card>
          </div>

          {/* Currency Selector */}
          <div className="flex justify-center">
            <CurrencySelector
              userId={userId}
              gameType="slots"
              onCurrencyChange={setSelectedCurrency}
              compact={false}
              showSettings={true}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Games */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Games</h2>
              <p className="text-muted-foreground">
                Our most popular and newest games
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <Card
                key={game.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleCategorySelect(game.category)}
              >
                <div className="relative">
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="aspect-video w-full object-cover rounded-t-lg"
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                    <Button
                      size="lg"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Play Now
                    </Button>
                  </div>

                  <div className="absolute top-3 left-3 flex gap-2">
                    {game.isNew && (
                      <Badge className="bg-green-500 text-white">NEW</Badge>
                    )}
                    {game.isFeatured && (
                      <Badge className="bg-gold-500 text-black">FEATURED</Badge>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 rounded px-2 py-1">
                    <Users className="w-3 h-3 text-white" />
                    <span className="text-white text-xs">{game.players}</span>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold truncate">{game.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {game.rtp}%
                    </Badge>
                  </div>

                  {game.jackpot > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Jackpot: </span>
                      <span className="font-bold text-gold-400">
                        {formatCurrency(game.jackpot)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      {game.category.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="w-3 h-3" />
                      <span>{game.players} playing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Game Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Game Categories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameCategories.map((category) => (
              <Card
                key={category.id}
                className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  category.status !== "active" ? "opacity-50" : ""
                }`}
                onClick={() =>
                  category.status === "active" &&
                  handleCategorySelect(category.id)
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          category.id === "slots"
                            ? "bg-gold-500/10 text-gold-500"
                            : category.id === "table"
                              ? "bg-green-500/10 text-green-500"
                              : category.id === "live"
                                ? "bg-red-500/10 text-red-500"
                                : category.id === "bingo"
                                  ? "bg-purple-500/10 text-purple-500"
                                  : category.id === "sportsbook"
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "bg-orange-500/10 text-orange-500"
                        }`}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.gameCount} games
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {category.playerCount}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {category.currency.map((curr) => (
                          <Badge
                            key={curr}
                            variant="outline"
                            className="text-xs"
                          >
                            {curr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {category.status === "active" && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {category.status === "maintenance" && (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-sm font-medium">
                        {category.status === "active"
                          ? "Available"
                          : category.status === "maintenance"
                            ? "Maintenance"
                            : "Coming Soon"}
                      </span>
                    </div>

                    {category.status === "active" && (
                      <Button
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Winners */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Recent Big Winners</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                game: "CoinKrazy Special",
                amount: 15247.5,
                player: "Player***23",
                time: "2 minutes ago",
              },
              {
                game: "Live Blackjack VIP",
                amount: 8950.0,
                player: "Winner***89",
                time: "8 minutes ago",
              },
              {
                game: "Mega Bingo",
                amount: 3420.75,
                player: "Lucky***45",
                time: "15 minutes ago",
              },
            ].map((winner, index) => (
              <Card
                key={index}
                className="bg-gradient-to-r from-gold/5 to-gold/10 border-gold-500/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-gold-500" />
                    <div className="flex-1">
                      <h4 className="font-bold">{winner.game}</h4>
                      <p className="text-sm text-muted-foreground">
                        {winner.player}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gold-500">
                        {formatCurrency(winner.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {winner.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Game Statistics */}
        {platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <div className="text-2xl font-bold">
                {platformStats.totalGamesAvailable}
              </div>
              <div className="text-sm text-muted-foreground">Total Games</div>
            </Card>

            <Card className="text-center p-6">
              <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <div className="text-2xl font-bold">
                {platformStats.totalSCWonToday.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">SC Won Today</div>
            </Card>

            <Card className="text-center p-6">
              <Star className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <div className="text-2xl font-bold">97.2%</div>
              <div className="text-sm text-muted-foreground">Average RTP</div>
            </Card>

            <Card className="text-center p-6">
              <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">
                Customer Support
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedGames;
