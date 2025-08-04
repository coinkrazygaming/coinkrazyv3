import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Coins,
  Crown,
  Star,
  Trophy,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  Heart,
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  Target,
  Gamepad2,
  Monitor,
  Smartphone,
  Tablet,
  BarChart3,
  Clock,
  DollarSign,
  Plus,
  Minus,
  X,
  Maximize,
  Minimize,
  Home,
  ArrowLeft,
  Info,
  Gift,
  Lightning,
  Flame,
  Sparkles,
  Gem,
  Award,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { slotsApiService, SlotGame, GameSession, SpinResult } from "@/services/slotsApiService";
import { analyticsService } from "@/services/realTimeAnalytics";

interface SlotCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gameCount: number;
}

export default function SlotsIntegration() {
  const { user } = useAuth();
  const [games, setGames] = useState<SlotGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<SlotGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"popularity" | "rtp" | "name" | "release">("popularity");
  const [volatilityFilter, setVolatilityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentGame, setCurrentGame] = useState<SlotGame | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [gameIframe, setGameIframe] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceView, setDeviceView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [betAmount, setBetAmount] = useState(1.0);
  const [betLines, setBetLines] = useState(25);
  const [balance, setBalance] = useState(10000); // Demo balance
  const [currency, setCurrency] = useState<"GC" | "SC">("GC");
  const [spinResults, setSpinResults] = useState<SpinResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(125847.92);
  
  const gameIframeRef = useRef<HTMLIFrameElement>(null);

  const categories: SlotCategory[] = [
    {
      id: "all",
      name: "All Games",
      icon: <Gamepad2 className="w-5 h-5" />,
      description: "Browse all available slot games",
      gameCount: 0,
    },
    {
      id: "featured",
      name: "Featured",
      icon: <Star className="w-5 h-5" />,
      description: "Our top recommended games",
      gameCount: 0,
    },
    {
      id: "popular",
      name: "Popular",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Most played games this week",
      gameCount: 0,
    },
    {
      id: "new",
      name: "New Releases",
      icon: <Sparkles className="w-5 h-5" />,
      description: "Latest games from providers",
      gameCount: 0,
    },
    {
      id: "high-rtp",
      name: "High RTP",
      icon: <Trophy className="w-5 h-5" />,
      description: "Games with 97%+ RTP",
      gameCount: 0,
    },
    {
      id: "jackpot",
      name: "Jackpots",
      icon: <Crown className="w-5 h-5" />,
      description: "Progressive and fixed jackpots",
      gameCount: 0,
    },
    {
      id: "bonus",
      name: "Bonus Features",
      icon: <Gift className="w-5 h-5" />,
      description: "Games with exciting bonus rounds",
      gameCount: 0,
    },
    {
      id: "classic",
      name: "Classic Slots",
      icon: <Gem className="w-5 h-5" />,
      description: "Traditional 3-reel slots",
      gameCount: 0,
    },
  ];

  useEffect(() => {
    loadSlotGames();
    const interval = setInterval(updateJackpot, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortGames();
  }, [games, selectedCategory, searchTerm, sortBy, volatilityFilter]);

  const loadSlotGames = async () => {
    setLoading(true);
    try {
      const allGames = await slotsApiService.getAllGames();
      setGames(allGames);
      
      // Update category counts
      categories.forEach(category => {
        if (category.id === "all") {
          category.gameCount = allGames.length;
        } else {
          category.gameCount = allGames.filter(game => 
            game.category.includes(category.id)
          ).length;
        }
      });

      console.log(`Loaded ${allGames.length} slot games`);
    } catch (error) {
      console.error("Error loading slot games:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGames = () => {
    let filtered = games;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(game => 
        game.category.includes(selectedCategory)
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchLower) ||
        game.theme.toLowerCase().includes(searchLower) ||
        game.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    // Filter by volatility
    if (volatilityFilter !== "all") {
      filtered = filtered.filter(game => game.volatility === volatilityFilter);
    }

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity;
        case "rtp":
          return b.rtp - a.rtp;
        case "name":
          return a.name.localeCompare(b.name);
        case "release":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  };

  const updateJackpot = () => {
    setJackpotAmount(prev => prev + Math.random() * 100);
  };

  const toggleFavorite = (gameId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(gameId)) {
        newFavorites.delete(gameId);
      } else {
        newFavorites.add(gameId);
      }
      return newFavorites;
    });
  };

  const launchGame = async (game: SlotGame, playMode: "demo" | "real" = "demo") => {
    if (!user) return;

    try {
      setCurrentGame(game);
      const sessionCurrency = playMode === "real" ? "SC" : "GC";
      setCurrency(sessionCurrency);

      // Create game session
      const session = await slotsApiService.createGameSession(
        game.id,
        user.id,
        sessionCurrency,
        balance
      );
      setGameSession(session);

      // Get game launch URL
      const gameUrl = await slotsApiService.getGameLaunchUrl(
        game.id,
        session.sessionId,
        sessionCurrency
      );
      setGameIframe(gameUrl);

      console.log(`Launched ${game.name} in ${playMode} mode`);
    } catch (error) {
      console.error("Error launching game:", error);
    }
  };

  const performSpin = async () => {
    if (!gameSession || isSpinning || betAmount > balance) return;

    setIsSpinning(true);
    try {
      const result = await slotsApiService.performSpin(
        gameSession.sessionId,
        betAmount,
        betLines
      );

      setSpinResults(prev => [result, ...prev.slice(0, 9)]);
      setBalance(result.gameState.balance);

      // Track SC wins
      if (currency === "SC" && result.winAmount > 0 && user?.id) {
        await analyticsService.trackSCWin(user.id, result.winAmount, `Slot: ${currentGame?.name}`);
      }

      if (soundEnabled && result.winAmount > 0) {
        // Play win sound
      }

      console.log("Spin result:", result);
    } catch (error) {
      console.error("Error performing spin:", error);
    } finally {
      setTimeout(() => setIsSpinning(false), 2000); // Simulate spin animation
    }
  };

  const closeGame = () => {
    setCurrentGame(null);
    setGameSession(null);
    setGameIframe("");
    setIsFullscreen(false);
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case "low": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (currentGame) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
        {/* Game Interface */}
        <Card className={`${isFullscreen ? 'h-full border-none rounded-none' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={closeGame}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lobby
              </Button>
              <div>
                <CardTitle className="text-lg">{currentGame.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currentGame.theme} • RTP: {currentGame.rtp}% • {currency} Mode
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Device View Toggles */}
              {!isFullscreen && (
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button 
                    size="sm" 
                    variant={deviceView === "desktop" ? "default" : "ghost"}
                    onClick={() => setDeviceView("desktop")}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={deviceView === "tablet" ? "default" : "ghost"}
                    onClick={() => setDeviceView("tablet")}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={deviceView === "mobile" ? "default" : "ghost"}
                    onClick={() => setDeviceView("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              )}
              
              {/* Game Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="flex">
              {/* Game Area */}
              <div className="flex-1">
                {gameIframe ? (
                  <div className="flex justify-center">
                    <div 
                      className="transition-all duration-300"
                      style={{ width: isFullscreen ? "100%" : getDeviceWidth() }}
                    >
                      <iframe
                        ref={gameIframeRef}
                        src={gameIframe}
                        className={`w-full border-none ${
                          isFullscreen ? 'h-screen' : 'h-96 md:h-[500px] lg:h-[600px]'
                        }`}
                        title={currentGame.name}
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-96 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Gamepad2 className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{currentGame.name}</h3>
                      <p className="mb-4">Loading game...</p>
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin" />
                    </div>
                  </div>
                )}
              </div>

              {/* Game Controls Sidebar */}
              {!isFullscreen && (
                <div className="w-80 border-l bg-muted/20">
                  <div className="p-4 space-y-4">
                    {/* Balance */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gold-400">
                            {formatCurrency(balance)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {currency} Balance
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bet Controls */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Bet Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Bet Amount</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBetAmount(Math.max(0.01, betAmount - 0.01))}
                              disabled={isSpinning}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="0.01"
                              max={balance}
                              step="0.01"
                              value={betAmount}
                              onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0.01)}
                              className="text-center"
                              disabled={isSpinning}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setBetAmount(Math.min(balance, betAmount + 0.01))}
                              disabled={isSpinning}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Paylines</label>
                          <Select value={betLines.toString()} onValueChange={(value) => setBetLines(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: currentGame.paylines }, (_, i) => i + 1).map(line => (
                                <SelectItem key={line} value={line.toString()}>
                                  {line} {line === 1 ? 'Line' : 'Lines'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={performSpin}
                          disabled={isSpinning || betAmount > balance}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          size="lg"
                        >
                          {isSpinning ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Spinning...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Spin ({formatCurrency(betAmount)})
                            </>
                          )}
                        </Button>

                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            <Zap className="w-3 h-3 mr-1" />
                            Max Bet
                          </Button>
                          <Button variant="outline" size="sm">
                            <Target className="w-3 h-3 mr-1" />
                            Auto Spin
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Spins */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Recent Spins</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {spinResults.map((result, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>Spin #{spinResults.length - index}</span>
                              <span className={`font-bold ${
                                result.winAmount > 0 ? 'text-green-500' : 'text-muted-foreground'
                              }`}>
                                {result.winAmount > 0 ? '+' : ''}{formatCurrency(result.winAmount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-gold-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                Premium Slots
                <Badge className="bg-purple-600 text-white">700+ Games</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Play real slot games from top providers with Gold Coins and Sweeps Coins
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  {formatCurrency(jackpotAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Progressive Jackpot</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {games.length}
                </div>
                <div className="text-sm text-muted-foreground">Available Games</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search games, themes, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="rtp">Highest RTP</SelectItem>
                  <SelectItem value="name">A-Z</SelectItem>
                  <SelectItem value="release">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={volatilityFilter} onValueChange={(value: any) => setVolatilityFilter(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volatility</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map(category => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-300 ${
              selectedCategory === category.id 
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                : 'hover:shadow-md hover:shadow-purple-500/20'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-4 text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                selectedCategory === category.id 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {category.icon}
              </div>
              <h3 className="font-medium text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {category.gameCount} games
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Loading Games...</h3>
          <p className="text-muted-foreground">Fetching the latest slot games from our providers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredGames.map(game => (
            <Card 
              key={game.id}
              className="group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 border-border/50 hover:border-purple-500/50 overflow-hidden"
            >
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-gold-500/20 flex items-center justify-center text-6xl">
                  <Coins className="w-16 h-16 text-purple-500" />
                </div>
                
                {/* Game Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {game.category.includes("featured") && (
                    <Badge className="bg-gold-500 text-black">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {game.rtp >= 97 && (
                    <Badge className="bg-green-500 text-white">
                      High RTP
                    </Badge>
                  )}
                  {game.category.includes("new") && (
                    <Badge className="bg-blue-500 text-white">
                      New
                    </Badge>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-white hover:bg-black/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(game.id);
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(game.id) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                  <Badge className={`text-xs ${getVolatilityColor(game.volatility)}`}>
                    {game.volatility}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                  {game.theme}
                </p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RTP:</span>
                    <span className="text-green-400 font-medium">{game.rtp}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paylines:</span>
                    <span className="font-medium">{game.paylines || 'Cluster'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Win:</span>
                    <span className="text-gold-400 font-bold">
                      {formatCurrency(game.maxBet * 1000)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {game.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {game.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{game.features.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => launchGame(game, "demo")}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play GC
                  </Button>
                  <Button
                    onClick={() => launchGame(game, "real")}
                    className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                    size="sm"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Play SC
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGames.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Games Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
            setVolatilityFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
