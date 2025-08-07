import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Gamepad2,
  Dice1,
  PlayCircle,
  Star,
  TrendingUp,
  Filter,
  Search,
  Users,
  DollarSign,
  Crown,
  Zap,
  Trophy,
  Heart,
  Cherry,
  Spade,
} from "lucide-react";
import { authService } from "../services/authService";

interface GameProvider {
  id: string;
  name: string;
  logo: string;
  status: "active" | "maintenance";
  gameCount: number;
  rtp: number;
  categories: string[];
}

interface Game {
  id: string;
  name: string;
  provider: string;
  category: "slots" | "table" | "live" | "bingo";
  thumbnail: string;
  rtp: number;
  volatility: "low" | "medium" | "high";
  popularity: number;
  jackpot?: number;
  minBet: number;
  maxBet: number;
  features: string[];
  status: "active" | "maintenance" | "new";
  theme: string;
}

const GAME_PROVIDERS: GameProvider[] = [
  {
    id: "pragmatic",
    name: "Pragmatic Play",
    logo: "/providers/pragmatic.png",
    status: "active",
    gameCount: 250,
    rtp: 96.5,
    categories: ["slots", "live", "bingo"],
  },
  {
    id: "betsoft",
    name: "Betsoft Gaming",
    logo: "/providers/betsoft.png",
    status: "active",
    gameCount: 180,
    rtp: 95.8,
    categories: ["slots", "table"],
  },
  {
    id: "evolution",
    name: "Evolution Gaming",
    logo: "/providers/evolution.png",
    status: "active",
    gameCount: 45,
    rtp: 97.2,
    categories: ["live", "table"],
  },
  {
    id: "netent",
    name: "NetEnt",
    logo: "/providers/netent.png",
    status: "active",
    gameCount: 120,
    rtp: 96.1,
    categories: ["slots"],
  },
  {
    id: "microgaming",
    name: "Microgaming",
    logo: "/providers/microgaming.png",
    status: "active",
    gameCount: 300,
    rtp: 96.3,
    categories: ["slots", "table", "bingo"],
  },
];

const FEATURED_GAMES: Game[] = [
  {
    id: "wolf_gold",
    name: "Wolf Gold",
    provider: "pragmatic",
    category: "slots",
    thumbnail: "/games/wolf-gold.jpg",
    rtp: 96.01,
    volatility: "medium",
    popularity: 98,
    jackpot: 2847392,
    minBet: 0.25,
    maxBet: 125,
    features: ["Free Spins", "Money Respin", "Progressive Jackpot"],
    status: "active",
    theme: "Wildlife",
  },
  {
    id: "sweet_bonanza",
    name: "Sweet Bonanza",
    provider: "pragmatic",
    category: "slots",
    thumbnail: "/games/sweet-bonanza.jpg",
    rtp: 96.48,
    volatility: "high",
    popularity: 96,
    minBet: 0.2,
    maxBet: 100,
    features: ["Tumble Feature", "Free Spins", "Multipliers"],
    status: "active",
    theme: "Candy",
  },
  {
    id: "lightning_roulette",
    name: "Lightning Roulette",
    provider: "evolution",
    category: "live",
    thumbnail: "/games/lightning-roulette.jpg",
    rtp: 97.3,
    volatility: "medium",
    popularity: 94,
    minBet: 0.2,
    maxBet: 25000,
    features: ["Lightning Numbers", "Live Dealer", "Multipliers"],
    status: "active",
    theme: "Classic",
  },
  {
    id: "blackjack_vip",
    name: "Blackjack VIP",
    provider: "evolution",
    category: "live",
    thumbnail: "/games/blackjack-vip.jpg",
    rtp: 99.28,
    volatility: "low",
    popularity: 92,
    minBet: 5,
    maxBet: 5000,
    features: ["Side Bets", "Insurance", "Split"],
    status: "active",
    theme: "Classic",
  },
  {
    id: "mega_ball",
    name: "Mega Ball",
    provider: "evolution",
    category: "bingo",
    thumbnail: "/games/mega-ball.jpg",
    rtp: 95.05,
    volatility: "medium",
    popularity: 89,
    minBet: 0.1,
    maxBet: 100,
    features: ["Multiplier Balls", "Progressive Payouts", "Live Draw"],
    status: "active",
    theme: "Bingo",
  },
  {
    id: "big_bass_bonanza",
    name: "Big Bass Bonanza",
    provider: "pragmatic",
    category: "slots",
    thumbnail: "/games/big-bass-bonanza.jpg",
    rtp: 96.71,
    volatility: "high",
    popularity: 95,
    minBet: 0.1,
    maxBet: 250,
    features: ["Free Spins", "Money Collect", "Retrigger"],
    status: "new",
    theme: "Fishing",
  },
];

const RealGameAggregator = () => {
  const [games, setGames] = useState<Game[]>(FEATURED_GAMES);
  const [providers, setProviders] = useState<GameProvider[]>(GAME_PROVIDERS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameLoading, setGameLoading] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const token = localStorage.getItem("auth_token");
    if (token) {
      const user = authService.getUserByToken(token);
      setCurrentUser(user);
    }
  }, []);

  const filteredGames = games.filter((game) => {
    const matchesCategory =
      selectedCategory === "all" || game.category === selectedCategory;
    const matchesProvider =
      selectedProvider === "all" || game.provider === selectedProvider;
    const matchesSearch =
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.theme.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesProvider && matchesSearch;
  });

  const launchGame = async (game: Game) => {
    if (!currentUser) {
      alert("Please log in to play games");
      return;
    }

    setGameLoading(game.id);

    try {
      // Simulate game loading
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create game session
      const gameSession = {
        gameId: game.id,
        gameName: game.name,
        provider: game.provider,
        category: game.category,
        startTime: new Date(),
        userId: currentUser.id,
      };

      console.log("Launching game:", gameSession);

      // In production, this would open the game in iframe or new window
      alert(
        `Launching ${game.name}!\n\nGame Provider: ${GAME_PROVIDERS.find((p) => p.id === game.provider)?.name}\nRTP: ${game.rtp}%\nMin Bet: $${game.minBet}`,
      );
    } catch (error) {
      console.error("Failed to launch game:", error);
      alert("Failed to launch game. Please try again.");
    } finally {
      setGameLoading(null);
    }
  };

  const getProviderName = (providerId: string) => {
    return GAME_PROVIDERS.find((p) => p.id === providerId)?.name || "Unknown";
  };

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-blue-500" />
            Real Game Aggregator
          </CardTitle>
          <CardDescription>
            {games.length} premium games from {providers.length} top providers
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="slots">Slots</option>
                <option value="table">Table Games</option>
                <option value="live">Live Dealer</option>
                <option value="bingo">Bingo</option>
              </select>

              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Providers</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Game Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="text-center p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="h-8 w-8 text-blue-500" />
                </div>
                <h4 className="font-medium">{provider.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {provider.gameCount} games
                </p>
                <Badge
                  variant={
                    provider.status === "active" ? "default" : "destructive"
                  }
                  className="mt-1"
                >
                  {provider.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game) => (
          <Card
            key={game.id}
            className="group hover:shadow-lg transition-all duration-200"
          >
            <div className="relative">
              <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                {game.category === "slots" && (
                  <Cherry className="h-16 w-16 text-white opacity-80" />
                )}
                {game.category === "table" && (
                  <Spade className="h-16 w-16 text-white opacity-80" />
                )}
                {game.category === "live" && (
                  <PlayCircle className="h-16 w-16 text-white opacity-80" />
                )}
                {game.category === "bingo" && (
                  <Dice1 className="h-16 w-16 text-white opacity-80" />
                )}
              </div>

              {game.status === "new" && (
                <Badge className="absolute top-2 left-2 bg-green-500">
                  New
                </Badge>
              )}

              {game.jackpot && (
                <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                  <Crown className="h-3 w-3 mr-1" />$
                  {game.jackpot.toLocaleString()}
                </Badge>
              )}
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                    {game.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getProviderName(game.provider)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{game.popularity}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>{game.rtp}%</span>
                  </div>
                  <div
                    className={`font-medium ${getVolatilityColor(game.volatility)}`}
                  >
                    {game.volatility.toUpperCase()}
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Min: ${game.minBet}</span>
                  <span>Max: ${game.maxBet}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {game.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {game.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{game.features.length - 2}
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => launchGame(game)}
                  disabled={gameLoading === game.id || !currentUser}
                >
                  {gameLoading === game.id ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Play Now
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Games Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search term
            </p>
          </CardContent>
        </Card>
      )}

      {/* Game Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {games.filter((g) => g.category === "slots").length}
              </div>
              <div className="text-sm text-muted-foreground">Slot Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {games.filter((g) => g.category === "live").length}
              </div>
              <div className="text-sm text-muted-foreground">Live Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {games.filter((g) => g.category === "table").length}
              </div>
              <div className="text-sm text-muted-foreground">Table Games</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {games.filter((g) => g.jackpot).length}
              </div>
              <div className="text-sm text-muted-foreground">Jackpot Games</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealGameAggregator;
