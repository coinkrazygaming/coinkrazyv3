import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  Search,
  Filter,
  Star,
  Play,
  Heart,
  Share2,
  Trophy,
  Zap,
  Crown,
  Flame,
  Gift,
  Eye,
  Users,
  Calendar,
  Coins,
  Gem,
  TrendingUp,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  gameProviderService,
  type ProviderGame,
  type GameProvider,
} from "../services/gameProviderService";
import {
  currencyToggleService,
  type GameCurrencyType,
} from "../services/currencyToggleService";
import { walletService } from "../services/walletService";

interface GamesLibraryProps {
  showHeader?: boolean;
  embedded?: boolean;
  defaultCategory?: string;
  maxResults?: number;
}

export default function GamesLibrary({
  showHeader = true,
  embedded = false,
  defaultCategory = "all",
  maxResults = 50,
}: GamesLibraryProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [games, setGames] = useState<ProviderGame[]>([]);
  const [providers, setProviders] = useState<GameProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedVolatility, setSelectedVolatility] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedGame, setSelectedGame] = useState<ProviderGame | null>(null);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [currency, setCurrency] = useState<GameCurrencyType>("GC");

  useEffect(() => {
    loadGamesData();
    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = currencyToggleService.subscribeToUserCurrency(
        user.id,
        (newCurrency) => {
          setCurrency(newCurrency);
        },
      );
      return unsubscribe;
    }
  }, [user?.id]);

  const loadGamesData = async () => {
    try {
      setLoading(true);

      // Load providers and games
      const allProviders = gameProviderService.getActiveProviders();
      const allGames = gameProviderService.getAllGames();

      setProviders(allProviders);
      setGames(allGames);

      console.log(
        `✅ Loaded ${allGames.length} games from ${allProviders.length} providers`,
      );
    } catch (error) {
      console.error("Failed to load games:", error);
      toast({
        title: "Error",
        description: "Failed to load games library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    try {
      const savedFavorites = localStorage.getItem(
        `favorites_${user?.id || "guest"}`,
      );
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }

      const savedViewMode = localStorage.getItem("games_view_mode");
      if (
        savedViewMode &&
        (savedViewMode === "grid" || savedViewMode === "list")
      ) {
        setViewMode(savedViewMode as "grid" | "list");
      }
    } catch (error) {
      console.error("Failed to load user preferences:", error);
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(
      `favorites_${user?.id || "guest"}`,
      JSON.stringify(newFavorites),
    );
  };

  const toggleFavorite = (gameId: string) => {
    const newFavorites = favorites.includes(gameId)
      ? favorites.filter((id) => id !== gameId)
      : [...favorites, gameId];
    saveFavorites(newFavorites);

    toast({
      title: favorites.includes(gameId)
        ? "Removed from Favorites"
        : "Added to Favorites",
      description: `Game ${favorites.includes(gameId) ? "removed from" : "added to"} your favorites`,
    });
  };

  const filteredAndSortedGames = useMemo(() => {
    let filtered = games;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.name.toLowerCase().includes(query) ||
          game.description.toLowerCase().includes(query) ||
          game.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          game.category.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "favorites") {
        filtered = filtered.filter((game) => favorites.includes(game.id));
      } else if (selectedCategory === "new") {
        filtered = filtered.filter((game) => game.isNew);
      } else if (selectedCategory === "popular") {
        filtered = filtered.filter((game) => game.isPopular);
      } else if (selectedCategory === "featured") {
        filtered = filtered.filter((game) => game.isFeatured);
      } else {
        filtered = filtered.filter((game) => game.type === selectedCategory);
      }
    }

    // Apply provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter(
        (game) => game.providerId === selectedProvider,
      );
    }

    // Apply volatility filter
    if (selectedVolatility !== "all") {
      filtered = filtered.filter(
        (game) => game.volatility === selectedVolatility,
      );
    }

    // Apply currency filter (some games may not support certain currencies)
    filtered = filtered.filter((game) => {
      const provider = providers.find((p) => p.id === game.providerId);
      return provider?.supportedCurrencies.includes(currency) ?? true;
    });

    // Sort games
    switch (sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort(
          (a, b) => b.releaseDate.getTime() - a.releaseDate.getTime(),
        );
        break;
      case "rtp":
        filtered.sort((a, b) => b.rtp - a.rtp);
        break;
      case "popularity":
      default:
        filtered.sort((a, b) => b.playCount - a.playCount);
        break;
    }

    return filtered.slice(0, maxResults);
  }, [
    games,
    searchQuery,
    selectedCategory,
    selectedProvider,
    selectedVolatility,
    sortBy,
    favorites,
    currency,
    maxResults,
    providers,
  ]);

  const categories = [
    { id: "all", name: "All Games", icon: Grid3X3, count: games.length },
    {
      id: "slot",
      name: "Slots",
      icon: Crown,
      count: games.filter((g) => g.type === "slot").length,
    },
    {
      id: "live",
      name: "Live Casino",
      icon: Users,
      count: games.filter((g) => g.type === "live").length,
    },
    {
      id: "sports",
      name: "Sports",
      icon: Trophy,
      count: games.filter((g) => g.type === "sports").length,
    },
    {
      id: "bingo",
      name: "Bingo",
      icon: Gift,
      count: games.filter((g) => g.type === "bingo").length,
    },
    {
      id: "poker",
      name: "Poker",
      icon: Star,
      count: games.filter((g) => g.type === "poker").length,
    },
    {
      id: "popular",
      name: "Popular",
      icon: Flame,
      count: games.filter((g) => g.isPopular).length,
    },
    {
      id: "new",
      name: "New Games",
      icon: Zap,
      count: games.filter((g) => g.isNew).length,
    },
    {
      id: "featured",
      name: "Featured",
      icon: Star,
      count: games.filter((g) => g.isFeatured).length,
    },
    {
      id: "favorites",
      name: "Favorites",
      icon: Heart,
      count: favorites.length,
    },
  ];

  const handlePlayGame = async (game: ProviderGame) => {
    if (!user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to play games",
        variant: "destructive",
      });
      return;
    }

    try {
      const wallet = await walletService.getUserWallet(user.id);
      const minBet = currency === "GC" ? game.minBet.GC : game.minBet.SC;
      const currentBalance =
        currency === "GC" ? wallet.goldCoins : wallet.sweepsCoins;

      if (currentBalance < minBet) {
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${minBet} ${currency} to play this game`,
          variant: "destructive",
        });
        return;
      }

      // Create game session
      const session = await gameProviderService.createGameSession(
        user.id,
        game.id,
        currency,
      );

      // Open game in new window or iframe
      if (embedded) {
        // For embedded mode, we could show an iframe
        setSelectedGame(game);
        setGameDialogOpen(true);
      } else {
        // Open in new window
        window.open(
          session.gameUrl,
          "_blank",
          "width=1200,height=800,scrollbars=yes,resizable=yes",
        );
      }

      toast({
        title: "Game Launched",
        description: `${game.name} is starting...`,
      });
    } catch (error) {
      console.error("Failed to launch game:", error);
      toast({
        title: "Error",
        description: "Failed to launch game",
        variant: "destructive",
      });
    }
  };

  const getProviderLogo = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.logoUrl || "/providers/default.png";
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.displayName || "Unknown Provider";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading games library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? "" : "container mx-auto px-4 py-6"}`}>
      {showHeader && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-gold-500 bg-clip-text text-transparent">
                Games Library
              </h1>
              <p className="text-muted-foreground">
                {games.length}+ premium games from top providers
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-400"
              >
                <Coins className="w-3 h-3 mr-1" />
                {currency} Mode
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search games by name, provider, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Select
                value={selectedProvider}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popular</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rtp">RTP</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Volatility
                    </label>
                    <Select
                      value={selectedVolatility}
                      onValueChange={setSelectedVolatility}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Volatility</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Min RTP
                    </label>
                    <Select value="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Any RTP" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any RTP</SelectItem>
                        <SelectItem value="95">95%+</SelectItem>
                        <SelectItem value="96">96%+</SelectItem>
                        <SelectItem value="97">97%+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Features
                    </label>
                    <Select value="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Any Features" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Features</SelectItem>
                        <SelectItem value="free-spins">Free Spins</SelectItem>
                        <SelectItem value="multipliers">Multipliers</SelectItem>
                        <SelectItem value="bonus-rounds">
                          Bonus Rounds
                        </SelectItem>
                        <SelectItem value="progressive">Progressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Categories Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto p-1">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col items-center gap-1 py-3 text-xs"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{category.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {category.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Games Grid/List */}
      <div
        className={`
        ${
          viewMode === "grid"
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            : "space-y-4"
        }
      `}
      >
        {filteredAndSortedGames.map((game) => (
          <Card
            key={game.id}
            className={`
              group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer
              ${viewMode === "list" ? "flex" : ""}
            `}
            onClick={() => handlePlayGame(game)}
          >
            {viewMode === "grid" ? (
              <>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={game.thumbnailUrl}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/games/placeholder.jpg";
                    }}
                  />

                  {/* Overlay with badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {game.isNew && (
                      <Badge className="bg-green-600 text-white text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        New
                      </Badge>
                    )}
                    {game.isFeatured && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {game.isPopular && (
                      <Badge className="bg-orange-600 text-white text-xs">
                        <Flame className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Favorite button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(game.id);
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.includes(game.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                    />
                  </Button>

                  {/* Play button overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="lg" className="gap-2">
                      <Play className="w-5 h-5" />
                      Play Now
                    </Button>
                  </div>
                </div>

                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                        {game.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {game.rating.toFixed(1)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{getProviderName(game.providerId)}</span>
                      <span>RTP: {game.rtp.toFixed(1)}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {game.volatility}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {currency === "GC" ? game.minBet.GC : game.minBet.SC}{" "}
                        {currency} min
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              /* List View */
              <div className="flex w-full">
                <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-l-lg">
                  <img
                    src={game.thumbnailUrl}
                    alt={game.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/games/placeholder.jpg";
                    }}
                  />
                </div>

                <CardContent className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{game.name}</h3>
                        <div className="flex gap-1">
                          {game.isNew && (
                            <Badge className="bg-green-600 text-white text-xs">
                              New
                            </Badge>
                          )}
                          {game.isFeatured && (
                            <Badge className="bg-purple-600 text-white text-xs">
                              Featured
                            </Badge>
                          )}
                          {game.isPopular && (
                            <Badge className="bg-orange-600 text-white text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {game.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{getProviderName(game.providerId)}</span>
                        <span>RTP: {game.rtp.toFixed(1)}%</span>
                        <span>Volatility: {game.volatility}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {game.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(game.id);
                        }}
                      >
                        <Heart
                          className={`w-4 h-4 ${favorites.includes(game.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Play className="w-4 h-4" />
                        Play
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* No games found */}
      {filteredAndSortedGames.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No games found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedProvider("all");
              setSelectedVolatility("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Game Details Dialog */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedGame?.name}
              <Badge variant="outline">
                {getProviderName(selectedGame?.providerId || "")}
              </Badge>
            </DialogTitle>
            <DialogDescription>{selectedGame?.description}</DialogDescription>
          </DialogHeader>

          {selectedGame && (
            <div className="space-y-4">
              {/* Game iframe would go here in production */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Game would load here</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    URL: {selectedGame.gameUrl}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="font-medium">RTP</label>
                  <p>{selectedGame.rtp.toFixed(1)}%</p>
                </div>
                <div>
                  <label className="font-medium">Volatility</label>
                  <p className="capitalize">{selectedGame.volatility}</p>
                </div>
                <div>
                  <label className="font-medium">Max Win</label>
                  <p>{selectedGame.maxWin.toLocaleString()}x</p>
                </div>
                <div>
                  <label className="font-medium">Min Bet</label>
                  <p>
                    {currency === "GC"
                      ? selectedGame.minBet.GC
                      : selectedGame.minBet.SC}{" "}
                    {currency}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
