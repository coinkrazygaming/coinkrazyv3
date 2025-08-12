import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { gamesService, Game } from "@/services/gamesService";
import CurrencyToggle from "@/components/CurrencyToggle";
import GamePlayer from "@/components/GamePlayer";
import CoinKrazySlots from "@/components/games/CoinKrazySlots";
import MiniGames from "@/components/games/MiniGames";
import FreeSlotGames from "@/components/games/FreeSlotGames";
import {
  Play,
  Search,
  TrendingUp,
  Crown,
  Zap,
  Filter,
  Star,
  Clock,
  Users,
  Trophy,
  Dice1,
  Spade,
  Target,
  Gift,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function Games() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedCurrency, setSelectedCurrency] = useState<"GC" | "SC">("GC");
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [showGamePlayer, setShowGamePlayer] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [showInHouseSlots, setShowInHouseSlots] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [betAmount, setBetAmount] = useState(20);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const [allGames, featured] = await Promise.all([
        gamesService.getActiveGames(),
        gamesService.getFeaturedGames(),
      ]);

      setGames(allGames);
      setFeaturedGames(featured);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || game.category === selectedCategory;
    const matchesProvider =
      selectedProvider === "all" || game.provider === selectedProvider;

    return matchesSearch && matchesCategory && matchesProvider;
  });

  const categories = ["all", "slots", "table", "live", "jackpot", "mini"];
  const providers = [
    "all",
    ...Array.from(new Set(games.map((g) => g.provider))),
  ];

  const playGame = (gameId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setSelectedGameId(gameId);
    setShowGamePlayer(true);
  };

  const playInHouseSlots = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowInHouseSlots(true);
  };

  const playMiniGames = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowMiniGames(true);
  };

  const formatJackpot = (amount: number): string => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const handleSpinComplete = (result: { win: number; balance: number }) => {
    // Handle spin results for in-house games
    console.log("Spin result:", result);
  };

  if (showGamePlayer && selectedGameId) {
    return (
      <GamePlayer
        gameId={selectedGameId}
        currency={selectedCurrency}
        onClose={() => {
          setShowGamePlayer(false);
          setSelectedGameId(null);
        }}
      />
    );
  }

  if (showInHouseSlots) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">CoinKrazy Slots</h1>
            <div className="flex items-center space-x-4">
              <CurrencyToggle
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              <Button
                variant="outline"
                onClick={() => setShowInHouseSlots(false)}
              >
                Back to Games
              </Button>
            </div>
          </div>

          <CoinKrazySlots
            currency={selectedCurrency}
            betAmount={betAmount}
            onBetChange={setBetAmount}
            onSpinComplete={handleSpinComplete}
          />
        </div>
      </div>
    );
  }

  if (showMiniGames) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mini Games</h1>
            <div className="flex items-center space-x-4">
              <CurrencyToggle
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              <Button variant="outline" onClick={() => setShowMiniGames(false)}>
                Back to Games
              </Button>
            </div>
          </div>

          <MiniGames
            currency={selectedCurrency}
            onGameComplete={handleSpinComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Game Lobby
              </h1>
              <p className="text-muted-foreground text-lg">
                {games.length}+ Premium Games • Real-Time Jackpots • Instant
                Play
              </p>
            </div>

            <CurrencyToggle
              selectedCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
              className="hidden md:flex"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Currency Toggle */}
        <div className="md:hidden mb-6">
          <CurrencyToggle
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
        </div>

        {/* Auth Warning */}
        {!isAuthenticated && (
          <Alert className="mb-6 border-gold-500/20 bg-gold-500/10">
            <Gift className="w-4 h-4 text-gold-500" />
            <AlertDescription className="text-gold-400">
              <Link to="/register" className="font-bold hover:underline">
                Create your free account
              </Link>{" "}
              to start playing with 10,000 Gold Coins + 10 Sweeps Coins welcome
              bonus!
            </AlertDescription>
          </Alert>
        )}

        {/* Featured Games Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Crown className="w-6 h-6 mr-2 text-gold-500" />
              Featured Games
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* In-House Slots */}
            <Card
              className="group cursor-pointer border-gold-500/20 hover:border-gold-500/50 transition-all duration-300"
              onClick={playInHouseSlots}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-12 h-12 text-gold-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gold-400">
                      CoinKrazy
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Original Slots
                    </div>
                  </div>
                </div>
                <h3 className="font-bold mb-1">CoinKrazy Slots</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  In-House • RTP 96.5%
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30">
                    Featured
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-gold-500 hover:bg-gold-600 text-black"
                  >
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mini Games */}
            <Card
              className="group cursor-pointer border-purple-500/20 hover:border-purple-500/50 transition-all duration-300"
              onClick={playMiniGames}
            >
              <CardContent className="p-4">
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <Dice1 className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg font-bold text-purple-400">
                      Mini
                    </div>
                    <div className="text-sm text-muted-foreground">Games</div>
                  </div>
                </div>
                <h3 className="font-bold mb-1">Mini Games</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Collection • Various RTPs
                </p>
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Hot
                  </Badge>
                  <Button
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured External Games */}
            {featuredGames.slice(0, 2).map((game) => (
              <Card
                key={game.id}
                className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300"
                onClick={() => playGame(game.game_id)}
              >
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-casino-blue/30 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={game.image_url}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold mb-1">{game.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {game.provider} • RTP {game.rtp}%
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-400"
                    >
                      {formatJackpot(game.current_jackpot_gc)}
                    </Badge>
                    <Button size="sm">Play</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all"
                      ? "All Categories"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-md"
              >
                {providers.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider === "all" ? "All Providers" : provider}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Game Categories */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="free-slots">Free Slots</TabsTrigger>
            <TabsTrigger value="slots">Slots</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="jackpot">Jackpots</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading games...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredGames.map((game) => (
                  <Card
                    key={game.id}
                    className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300"
                    onClick={() => playGame(game.game_id)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-casino-blue/30 rounded-lg mb-2 overflow-hidden relative">
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {game.is_featured && (
                          <Badge className="absolute top-2 left-2 bg-gold-500/90 text-black">
                            Featured
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            size="sm"
                            className="bg-gold-500 hover:bg-gold-600 text-black"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {game.provider}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400">RTP {game.rtp}%</span>
                        {game.current_jackpot_gc > 0 && (
                          <span className="text-gold-400 font-mono">
                            {formatJackpot(game.current_jackpot_gc)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Other tab contents would filter games by category */}
          <TabsContent value="slots">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames
                .filter((g) => g.category === "slots")
                .map((game) => (
                  <Card
                    key={game.id}
                    className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300"
                    onClick={() => playGame(game.game_id)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-casino-blue/30 rounded-lg mb-2 overflow-hidden relative">
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            size="sm"
                            className="bg-gold-500 hover:bg-gold-600 text-black"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {game.provider}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400">RTP {game.rtp}%</span>
                        {game.current_jackpot_gc > 0 && (
                          <span className="text-gold-400 font-mono">
                            {formatJackpot(game.current_jackpot_gc)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames
                .filter((g) => g.category === "table")
                .map((game) => (
                  <Card
                    key={game.id}
                    className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300"
                    onClick={() => playGame(game.game_id)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg mb-2 overflow-hidden relative">
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Spade className="w-4 h-4 mr-1" />
                            Play
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {game.provider}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400">RTP {game.rtp}%</span>
                        <Badge
                          variant="outline"
                          className="border-green-500 text-green-400 text-xs"
                        >
                          Table
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="live">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames
                .filter((g) => g.category === "live")
                .map((game) => (
                  <Card
                    key={game.id}
                    className="group cursor-pointer border-border hover:border-red-500/50 transition-all duration-300"
                    onClick={() => playGame(game.game_id)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg mb-2 overflow-hidden relative">
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500/90 text-white animate-pulse">
                            LIVE
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Join
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {game.provider}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-400">Live Dealer</span>
                        <span className="text-green-400">
                          {Math.floor(Math.random() * 50) + 1} players
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="jackpot">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames
                .filter((g) => g.current_jackpot_gc > 100000)
                .map((game) => (
                  <Card
                    key={game.id}
                    className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300"
                    onClick={() => playGame(game.game_id)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-lg mb-2 overflow-hidden relative">
                        <img
                          src={game.image_url}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-gold-500/90 text-black animate-pulse">
                            <Trophy className="w-3 h-3 mr-1" />
                            JACKPOT
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            size="sm"
                            className="bg-gold-500 hover:bg-gold-600 text-black"
                          >
                            <Crown className="w-4 h-4 mr-1" />
                            Win Big
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm mb-1 truncate">
                        {game.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {game.provider}
                      </p>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400">RTP {game.rtp}%</span>
                        <span className="text-gold-400 font-mono font-bold">
                          {formatJackpot(game.current_jackpot_gc)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredGames.slice(0, 12).map((game) => (
                <Card
                  key={game.id}
                  className="group cursor-pointer border-border hover:border-blue-500/50 transition-all duration-300"
                  onClick={() => playGame(game.game_id)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg mb-2 overflow-hidden relative">
                      <img
                        src={game.image_url}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-blue-500/90 text-white">NEW</Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Try Now
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm mb-1 truncate">
                      {game.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {game.provider}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400">RTP {game.rtp}%</span>
                      <span className="text-blue-400">New Release</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Game Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">
                Players Online
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">$2.1M</div>
              <div className="text-sm text-muted-foreground">
                Total Jackpots
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">96.5%</div>
              <div className="text-sm text-muted-foreground">Average RTP</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Always Open</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
