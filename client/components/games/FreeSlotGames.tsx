import React, { useState, useEffect, useRef } from "react";
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
} from "@/components/ui/dialog";
import {
  Coins,
  Crown,
  Star,
  Trophy,
  Play,
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
  ArrowLeft,
  Info,
  Gift,
  Flame,
  Sparkles,
  Gem,
  Award,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Home,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { slotsApiService, SlotGame, GameSession, SpinResult, SlotProvider } from "@/services/slotsApiService";
import { analyticsService } from "@/services/realTimeAnalytics";

interface SlotCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gameCount: number;
}

const DEMO_PROVIDERS = [
  {
    name: "Pragmatic Play",
    url: "https://demogamesfree.pragmaticplay.net",
    logo: "/providers/pragmatic-play.png",
    games: 250
  },
  {
    name: "NetEnt",
    url: "https://www.netent.com/casino/games/",
    logo: "/providers/netent.png", 
    games: 180
  },
  {
    name: "Microgaming",
    url: "https://demo.microgaming.com",
    logo: "/providers/microgaming.png",
    games: 320
  },
  {
    name: "Play'n GO",
    url: "https://www.playngo.com/games",
    logo: "/providers/playngo.png",
    games: 150
  }
];

export default function FreeSlotGames() {
  const { user } = useAuth();
  const [games, setGames] = useState<SlotGame[]>([]);
  const [providers, setProviders] = useState<SlotProvider[]>([]);
  const [filteredGames, setFilteredGames] = useState<SlotGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
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
  const [currency, setCurrency] = useState<"GC" | "SC">("GC");
  const [balance, setBalance] = useState(10000); // Demo balance
  const [jackpotAmount, setJackpotAmount] = useState(125847.92);
  const [featuredGames, setFeaturedGames] = useState<SlotGame[]>([]);
  const [popularGames, setPopularGames] = useState<SlotGame[]>([]);
  const [newGames, setNewGames] = useState<SlotGame[]>([]);
  const [jackpotGames, setJackpotGames] = useState<SlotGame[]>([]);
  
  const gameIframeRef = useRef<HTMLIFrameElement>(null);

  const categories: SlotCategory[] = [
    {
      id: "all",
      name: "All Games",
      icon: <Gamepad2 className="w-5 h-5" />,
      description: "Browse all available slot games",
      gameCount: games.length,
    },
    {
      id: "featured",
      name: "Featured",
      icon: <Star className="w-5 h-5" />,
      description: "Our top recommended games",
      gameCount: featuredGames.length,
    },
    {
      id: "popular",
      name: "Popular",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Most played games this week",
      gameCount: popularGames.length,
    },
    {
      id: "new",
      name: "New Releases",
      icon: <Sparkles className="w-5 h-5" />,
      description: "Latest games from providers",
      gameCount: newGames.length,
    },
    {
      id: "high-rtp",
      name: "High RTP",
      icon: <Trophy className="w-5 h-5" />,
      description: "Games with 97%+ RTP",
      gameCount: games.filter(g => g.rtp >= 97).length,
    },
    {
      id: "jackpot",
      name: "Jackpots",
      icon: <Crown className="w-5 h-5" />,
      description: "Progressive and fixed jackpots",
      gameCount: jackpotGames.length,
    },
    {
      id: "bonus",
      name: "Bonus Features",
      icon: <Gift className="w-5 h-5" />,
      description: "Games with exciting bonus rounds",
      gameCount: games.filter(g => g.features.some(f => f.toLowerCase().includes('bonus') || f.toLowerCase().includes('free'))).length,
    },
    {
      id: "classic",
      name: "Classic Slots",
      icon: <Gem className="w-5 h-5" />,
      description: "Traditional 3-reel slots",
      gameCount: games.filter(g => g.reels <= 3).length,
    },
  ];

  useEffect(() => {
    loadAllData();
    const interval = setInterval(updateJackpot, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAndSortGames();
  }, [games, selectedCategory, selectedProvider, searchTerm, sortBy, volatilityFilter]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [allGames, allProviders, featured, popular, newReleases, jackpots] = await Promise.all([
        slotsApiService.getAllGames(),
        slotsApiService.getProviders(),
        slotsApiService.getFeaturedGames(),
        slotsApiService.getPopularGames(),
        slotsApiService.getNewGames(),
        slotsApiService.getJackpotGames()
      ]);

      setGames(allGames);
      setProviders(allProviders);
      setFeaturedGames(featured);
      setPopularGames(popular);
      setNewGames(newReleases);
      setJackpotGames(jackpots);

      console.log(`Loaded ${allGames.length} slot games from ${allProviders.length} providers`);
    } catch (error) {
      console.error("Error loading slot games data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGames = () => {
    let filtered = games;

    // Filter by category
    if (selectedCategory !== "all") {
      switch (selectedCategory) {
        case "featured":
          filtered = featuredGames;
          break;
        case "popular":
          filtered = popularGames;
          break;
        case "new":
          filtered = newGames;
          break;
        case "jackpot":
          filtered = jackpotGames;
          break;
        case "high-rtp":
          filtered = games.filter(game => game.rtp >= 97);
          break;
        case "bonus":
          filtered = games.filter(game => 
            game.features.some(f => f.toLowerCase().includes('bonus') || f.toLowerCase().includes('free'))
          );
          break;
        case "classic":
          filtered = games.filter(game => game.reels <= 3);
          break;
        default:
          filtered = games.filter(game => game.category.includes(selectedCategory));
      }
    }

    // Filter by provider
    if (selectedProvider !== "all") {
      filtered = filtered.filter(game => 
        game.provider.toLowerCase().replace(/[^a-z0-9]/g, '-') === selectedProvider
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchLower) ||
        game.theme.toLowerCase().includes(searchLower) ||
        game.provider.toLowerCase().includes(searchLower) ||
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
    if (!user) {
      // Redirect to login for non-authenticated users
      window.location.href = '/login';
      return;
    }

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

      // Track game launch
      if (user?.id) {
        await analyticsService.trackGameLaunch(user.id, game.id, sessionCurrency);
      }

      console.log(`Launched ${game.name} in ${playMode} mode`);
    } catch (error) {
      console.error("Error launching game:", error);
    }
  };

  const closeGame = async () => {
    if (gameSession) {
      await slotsApiService.endSession(gameSession.sessionId);
    }
    
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

  const formatCurrency = (amount: number, currency: "GC" | "SC" = "GC") => {
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: currency === "SC" ? 2 : 0,
      maximumFractionDigits: currency === "SC" ? 2 : 0,
    });
    
    return `${formatter.format(amount)} ${currency}`;
  };

  // Game Player Interface
  if (currentGame) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
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
                  {currentGame.provider} • {currentGame.theme} • RTP: {currentGame.rtp}% • {currency} Mode
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
            <div className="flex justify-center">
              <div 
                className="transition-all duration-300"
                style={{ width: isFullscreen ? "100%" : getDeviceWidth() }}
              >
                {gameIframe ? (
                  <iframe
                    ref={gameIframeRef}
                    src={gameIframe}
                    className={`w-full border-none ${
                      isFullscreen ? 'h-screen' : 'h-96 md:h-[500px] lg:h-[600px]'
                    }`}
                    title={currentGame.name}
                    allowFullScreen
                    allow="autoplay; encrypted-media; fullscreen"
                  />
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
            </div>

            {/* Game Info Bar */}
            {!isFullscreen && (
              <div className="border-t bg-muted/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-lg font-bold text-purple-400">
                        {formatCurrency(balance, currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">Balance</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {currentGame.paylines === 0 ? 'Cluster' : currentGame.paylines}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentGame.paylines === 0 ? 'Pays' : 'Lines'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {currentGame.rtp}%
                      </div>
                      <div className="text-sm text-muted-foreground">RTP</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      Game Info
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Statistics
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Games Lobby
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
                Free Slot Games
                <Badge className="bg-purple-600 text-white">{games.length}+ Games</Badge>
                <Badge className="bg-green-600 text-white">100% Free</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Play real slot games from top providers completely free • No registration required • Instant play
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  ${jackpotAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-muted-foreground">Demo Jackpot</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {providers.length}
                </div>
                <div className="text-sm text-muted-foreground">Providers</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Provider Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Top Game Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {DEMO_PROVIDERS.map((provider) => (
              <Card key={provider.name} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">{provider.name.charAt(0)}</span>
                  </div>
                  <h4 className="font-semibold mb-1">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">{provider.games} games</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
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
            
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedProvider("all");
                setVolatilityFilter("all");
                setSortBy("popularity");
              }}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
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
          <h3 className="text-xl font-bold mb-2">Loading Free Slot Games...</h3>
          <p className="text-muted-foreground">Fetching games from top providers</p>
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
                  {game.isJackpot && (
                    <Badge className="bg-purple-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Jackpot
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
                  <Badge className={`text-xs ${getVolatilityColor(game.volatility)} border-current`}>
                    {game.volatility}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">{game.provider}</p>
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
                    <span className="font-medium">
                      {game.paylines === 0 ? 'Cluster' : game.paylines}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volatility:</span>
                    <span className={`font-medium ${getVolatilityColor(game.volatility)}`}>
                      {game.volatility.charAt(0).toUpperCase() + game.volatility.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {game.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {game.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{game.features.length - 2} more
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => launchGame(game, "demo")}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Free Demo
                  </Button>
                  
                  {user && (
                    <Button
                      onClick={() => launchGame(game, "real")}
                      variant="outline"
                      className="w-full border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black font-bold"
                      size="sm"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Play with SC
                    </Button>
                  )}
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
            setSelectedProvider("all");
            setVolatilityFilter("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Free Play Notice */}
      <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <div>
              <h3 className="text-lg font-bold mb-2">100% Free Slot Games</h3>
              <p className="text-muted-foreground mb-2">
                All games are completely free to play with unlimited spins. No downloads, no registration required.
              </p>
              <p className="text-sm text-muted-foreground">
                Want to play for real prizes? <a href="/register" className="text-purple-400 hover:underline">Create an account</a> to play with Sweeps Coins for real cash prizes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
