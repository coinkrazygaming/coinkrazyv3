import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Coins,
  Star,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Volume2,
  VolumeX,
  Heart,
  Search,
  Filter,
  TrendingUp,
  Crown,
  Trophy,
  Gift,
  Gem,
  Gamepad2,
  Sparkles,
  BarChart3,
  Plus,
  Minus,
  Maximize,
  Info,
  Flame,
  Zap,
  Target,
  DollarSign,
  ArrowLeft,
  Wallet,
  Activity,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import CurrencySelector from "../CurrencySelector";
import {
  gameInterfaceService,
  SlotSpinResult,
} from "../../services/gameInterfaceService";
import { walletService, CurrencyType } from "../../services/walletService";
import { jackpotService, Jackpot } from "../../services/jackpotService";
import { useToast } from "@/hooks/use-toast";

interface SlotGame {
  id: string;
  name: string;
  provider: string;
  thumbnail: string;
  rtp: number;
  volatility: "low" | "medium" | "high";
  maxWin: number;
  features: string[];
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  paylines: number;
  reels: number;
  category: string[];
  isNew: boolean;
  isFeatured: boolean;
  isJackpot: boolean;
  popularity: number;
  releaseDate: Date;
  currentJackpot?: number;
  jackpotFormatted?: string;
}

interface GameSession {
  totalSpins: number;
  totalBet: number;
  totalWin: number;
  netResult: number;
  biggestWin: number;
  currentStreak: number;
  sessionTime: number;
}

const EnhancedSlotsIntegration: React.FC = () => {
  const { toast } = useToast();
  const userId = "demo@coinfrazy.com"; // In production, this would come from auth context

  // Game state
  const [games, setGames] = useState<SlotGame[]>([]);
  const [currentGame, setCurrentGame] = useState<SlotGame | null>(null);
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("GC");
  const [jackpots, setJackpots] = useState<Map<string, Jackpot>>(new Map());

  // Betting state
  const [betAmount, setBetAmount] = useState(10);
  const [betLines, setBetLines] = useState(25);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayCount, setAutoPlayCount] = useState(0);
  const [autoPlaySpins, setAutoPlaySpins] = useState(10);

  // Game session
  const [session, setSession] = useState<GameSession>({
    totalSpins: 0,
    totalBet: 0,
    totalWin: 0,
    netResult: 0,
    biggestWin: 0,
    currentStreak: 0,
    sessionTime: 0,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"popularity" | "rtp" | "name">(
    "popularity",
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [lastSpinResult, setLastSpinResult] = useState<SlotSpinResult | null>(
    null,
  );

  // Refs
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<Date>(new Date());

  useEffect(() => {
    loadSlotGames();
    startSessionTimer();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && autoPlayCount < autoPlaySpins && !isSpinning) {
      autoPlayRef.current = setTimeout(() => {
        handleSpin();
        setAutoPlayCount((prev) => prev + 1);
      }, 2000);
    } else if (autoPlayCount >= autoPlaySpins) {
      setAutoPlay(false);
      setAutoPlayCount(0);
      toast({
        title: "Auto Play Complete",
        description: `Completed ${autoPlaySpins} spins`,
      });
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayCount, autoPlaySpins, isSpinning]);

  const startSessionTimer = () => {
    setInterval(() => {
      const now = new Date();
      const sessionTime = Math.floor(
        (now.getTime() - sessionStartRef.current.getTime()) / 1000,
      );
      setSession((prev) => ({ ...prev, sessionTime }));
    }, 1000);
  };

  const loadSlotGames = async () => {
    setLoading(true);
    try {
      // Load real slot games with jackpot data
      const realGames: SlotGame[] = [
        {
          id: "coinkrazy-special",
          name: "CoinKrazy Special",
          provider: "CoinKrazy",
          thumbnail: "https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop&crop=center",
          rtp: 97.2,
          volatility: "medium",
          maxWin: 10000,
          features: ["Progressive Jackpot", "Free Spins", "Wild Multipliers"],
          minBet: { GC: 5, SC: 0.05 },
          maxBet: { GC: 10000, SC: 100 },
          paylines: 50,
          reels: 5,
          category: ["featured", "jackpot", "high-rtp", "new"],
          isNew: true,
          isFeatured: true,
          isJackpot: true,
          popularity: 98,
          releaseDate: new Date("2024-01-15"),
        },
        {
          id: "sweet-bonanza-pro",
          name: "Sweet Bonanza Pro",
          provider: "Pragmatic Play",
          thumbnail: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop&crop=center",
          rtp: 96.48,
          volatility: "high",
          maxWin: 21100,
          features: ["Progressive Jackpot", "Free Spins", "Multipliers", "Tumble"],
          minBet: { GC: 10, SC: 0.1 },
          maxBet: { GC: 5000, SC: 50 },
          paylines: 0,
          reels: 6,
          category: ["featured", "popular", "bonus", "jackpot"],
          isNew: false,
          isFeatured: true,
          isJackpot: true,
          popularity: 95,
          releaseDate: new Date("2019-06-27"),
        },
        {
          id: "gates-olympus-pro",
          name: "Gates of Olympus Pro",
          provider: "Pragmatic Play",
          thumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center",
          rtp: 96.5,
          volatility: "high",
          maxWin: 5000,
          features: ["Progressive Jackpot", "Free Spins", "Multipliers", "Ante Bet"],
          minBet: { GC: 10, SC: 0.1 },
          maxBet: { GC: 5000, SC: 50 },
          paylines: 20,
          reels: 6,
          category: ["featured", "high-rtp", "bonus", "jackpot"],
          isNew: false,
          isFeatured: true,
          isJackpot: true,
          popularity: 92,
          releaseDate: new Date("2021-02-13"),
        },
        {
          id: "classic-777",
          name: "Classic 777",
          provider: "CoinKrazy",
          thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center",
          rtp: 96.8,
          volatility: "low",
          maxWin: 2500,
          features: ["Progressive Jackpot", "Classic Symbols", "Simple Gameplay"],
          minBet: { GC: 1, SC: 0.01 },
          maxBet: { GC: 500, SC: 5 },
          paylines: 5,
          reels: 3,
          category: ["classic", "jackpot", "beginner"],
          isNew: false,
          isFeatured: false,
          isJackpot: true,
          popularity: 75,
          releaseDate: new Date("2020-03-10"),
        },
        {
          id: "cosmic-megaways",
          name: "Cosmic Megaways",
          provider: "CoinKrazy",
          thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop&crop=center",
          rtp: 96.2,
          volatility: "high",
          maxWin: 50000,
          features: ["Progressive Jackpot", "Megaways", "Free Spins", "Cascading Reels"],
          minBet: { GC: 20, SC: 0.2 },
          maxBet: { GC: 2000, SC: 20 },
          paylines: 117649,
          reels: 6,
          category: ["featured", "megaways", "jackpot", "high-volatility"],
          isNew: true,
          isFeatured: true,
          isJackpot: true,
          popularity: 88,
          releaseDate: new Date("2023-11-20"),
        },
      ];

      // Load jackpot data for all games
      const gamesWithJackpots = await Promise.all(
        realGames.map(async (game) => {
          try {
            const jackpotData = await jackpotService.getJackpotDisplayData(game.id);
            return {
              ...game,
              currentJackpot: jackpotData.amount,
              jackpotFormatted: jackpotData.formatted,
            };
          } catch (error) {
            console.error(`Failed to load jackpot for ${game.id}:`, error);
            return {
              ...game,
              currentJackpot: 0,
              jackpotFormatted: "$0",
            };
          }
        })
      );

      setGames(gamesWithJackpots);

      // Set up real-time jackpot updates
      setupJackpotUpdates();
    } catch (error) {
      console.error("Error loading slot games:", error);
      toast({
        title: "Error",
        description: "Failed to load slot games",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupJackpotUpdates = () => {
    // Set up jackpot update callback
    const handleJackpotUpdate = (jackpot: Jackpot) => {
      setGames((prevGames) =>
        prevGames.map((game) =>
          game.id === jackpot.gameId
            ? {
                ...game,
                currentJackpot: jackpot.amount,
                jackpotFormatted: new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(jackpot.amount),
              }
            : game
        )
      );
    };

    jackpotService.onJackpotUpdate(handleJackpotUpdate);

    // Cleanup on unmount
    return () => {
      jackpotService.removeJackpotUpdateCallback(handleJackpotUpdate);
    };
  };

  const handleGameSelect = async (game: SlotGame) => {
    setCurrentGame(game);
    setIsGameLoaded(false);

    // Start a new game session
    try {
      await gameInterfaceService.startGameSession(
        userId,
        "slots",
        selectedCurrency,
      );

      // Simulate game loading
      setTimeout(() => {
        setIsGameLoaded(true);
        toast({
          title: "Game Loaded",
          description: `${game.name} is ready to play`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load game",
        variant: "destructive",
      });
    }
  };

  const handleSpin = async () => {
    if (!currentGame || isSpinning) return;

    // Validate bet amount
    const minBet = currentGame.minBet[selectedCurrency];
    const maxBet = currentGame.maxBet[selectedCurrency];

    if (betAmount < minBet) {
      toast({
        title: "Bet Too Low",
        description: `Minimum bet is ${minBet} ${selectedCurrency}`,
        variant: "destructive",
      });
      return;
    }

    if (betAmount > maxBet) {
      toast({
        title: "Bet Too High",
        description: `Maximum bet is ${maxBet} ${selectedCurrency}`,
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);

    try {
      // Place bet and spin
      const result = await gameInterfaceService.spinSlots(
        userId,
        currentGame.id,
        betAmount,
        selectedCurrency,
      );

      setLastSpinResult(result.result);

      // Check for jackpot win
      if (currentGame.isJackpot) {
        try {
          // Contribute to jackpot based on bet
          await jackpotService.contributeToJackpot(
            currentGame.id,
            userId,
            betAmount,
            selectedCurrency
          );

          // Check if this spin wins the jackpot
          const jackpotWin = await jackpotService.checkJackpotWin(
            currentGame.id,
            userId,
            result.result,
            betAmount,
            selectedCurrency
          );

          if (jackpotWin) {
            toast({
              title: "🎉 JACKPOT WON! 🎉",
              description: `Congratulations! You won the ${jackpotWin.amount.toFixed(2)} ${selectedCurrency} jackpot!`,
              duration: 10000,
            });
          }
        } catch (error) {
          console.error('Jackpot processing error:', error);
        }
      }

      // Update session stats
      setSession((prev) => ({
        ...prev,
        totalSpins: prev.totalSpins + 1,
        totalBet: prev.totalBet + betAmount,
        totalWin: prev.totalWin + result.result.totalWin,
        netResult: prev.netResult + (result.result.totalWin - betAmount),
        biggestWin: Math.max(prev.biggestWin, result.result.totalWin),
        currentStreak: result.result.totalWin > 0 ? prev.currentStreak + 1 : 0,
      }));

      // Show result notification
      if (result.result.totalWin > 0) {
        toast({
          title: "Winner!",
          description: `You won ${result.result.totalWin.toFixed(2)} ${selectedCurrency}`,
        });
      }

      if (result.result.isBonus) {
        toast({
          title: "Bonus Round!",
          description: "You triggered a bonus feature!",
        });
      }

      if (result.result.isFreeSpins) {
        toast({
          title: "Free Spins!",
          description: `You won ${result.result.freeSpinsRemaining} free spins!`,
        });
      }
    } catch (error) {
      toast({
        title: "Spin Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsSpinning(false);
      }, 2000); // Simulate spin animation time
    }
  };

  const handleBetChange = (change: number) => {
    const newBet = Math.max(1, betAmount + change);
    const maxBet = currentGame?.maxBet[selectedCurrency] || 1000;
    setBetAmount(Math.min(newBet, maxBet));
  };

  const toggleAutoPlay = () => {
    if (autoPlay) {
      setAutoPlay(false);
      setAutoPlayCount(0);
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    } else {
      setAutoPlay(true);
      setAutoPlayCount(0);
    }
  };

  const toggleFavorite = (gameId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(gameId)) {
        newFavorites.delete(gameId);
      } else {
        newFavorites.add(gameId);
      }
      return newFavorites;
    });
  };

  const filteredGames = games
    .filter((game) => {
      const matchesSearch =
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || game.category.includes(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popularity":
          return b.popularity - a.popularity;
        case "rtp":
          return b.rtp - a.rtp;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (currentGame && isGameLoaded) {
    return (
      <div className="min-h-screen bg-background">
        {/* Game Header */}
        <div className="bg-gradient-to-r from-casino-blue/10 to-purple/10 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentGame(null)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Games
                </Button>

                <div className="flex items-center gap-3">
                  <img
                    src={currentGame.thumbnail}
                    alt={currentGame.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h1 className="text-xl font-bold">{currentGame.name}</h1>
                    <p className="text-sm text-muted-foreground">
                      {currentGame.provider}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="border-green-500 text-green-400"
                >
                  RTP: {currentGame.rtp}%
                </Badge>

                {currentGame.isJackpot && (
                  <Badge
                    variant="outline"
                    className="border-gold-500 text-gold-400"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Jackpot
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(currentGame.id)}
                  className={
                    favorites.has(currentGame.id) ? "text-red-500" : ""
                  }
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.has(currentGame.id) ? "fill-current" : ""}`}
                  />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGameInfo(true)}
                >
                  <Info className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-b from-card via-card to-card/50">
                <CardContent className="p-6">
                  {/* Game Canvas */}
                  <div className="aspect-video bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                    {isSpinning ? (
                      <div className="text-center">
                        <RefreshCw className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
                        <p className="text-gold-400 font-bold">Spinning...</p>
                      </div>
                    ) : lastSpinResult ? (
                      <div className="text-center text-white">
                        <div className="grid grid-cols-5 gap-4 mb-4">
                          {lastSpinResult.reels.map((reel, reelIndex) => (
                            <div key={reelIndex} className="space-y-2">
                              {reel.map((symbol, symbolIndex) => (
                                <div
                                  key={symbolIndex}
                                  className="w-12 h-12 bg-slate-700 rounded border flex items-center justify-center text-2xl"
                                >
                                  {symbol}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>

                        {lastSpinResult.totalWin > 0 && (
                          <div className="text-gold-400 font-bold text-xl">
                            WIN: {lastSpinResult.totalWin.toFixed(2)}{" "}
                            {selectedCurrency}
                          </div>
                        )}

                        {lastSpinResult.paylines.length > 0 && (
                          <div className="mt-2 text-sm">
                            <p>
                              Winning Lines: {lastSpinResult.paylines.length}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <Gamepad2 className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                        <p className="text-xl font-bold mb-2">
                          {currentGame.name}
                        </p>
                        <p className="text-muted-foreground">
                          Press SPIN to start playing
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Game Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bet Controls */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Bet Amount</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBetChange(-1)}
                            disabled={betAmount <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>

                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) =>
                              setBetAmount(
                                Math.max(1, parseFloat(e.target.value) || 1),
                              )
                            }
                            className="text-center"
                            min={currentGame.minBet[selectedCurrency]}
                            max={currentGame.maxBet[selectedCurrency]}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBetChange(1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Min: {currentGame.minBet[selectedCurrency]}{" "}
                          {selectedCurrency} | Max:{" "}
                          {currentGame.maxBet[selectedCurrency]}{" "}
                          {selectedCurrency}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Spin Controls */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Spin Controls</h3>
                        <div className="space-y-2">
                          <Button
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                          >
                            {isSpinning ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4 mr-2" />
                            )}
                            {isSpinning ? "Spinning..." : "SPIN"}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={toggleAutoPlay}
                            className="w-full"
                          >
                            {autoPlay ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Stop Auto ({autoPlaySpins - autoPlayCount})
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4 mr-2" />
                                Auto Play
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Session Stats</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Spins:</span>
                            <span className="font-medium">
                              {session.totalSpins}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Net:</span>
                            <span
                              className={`font-medium ${session.netResult >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {session.netResult >= 0 ? "+" : ""}
                              {session.netResult.toFixed(2)} {selectedCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Best Win:</span>
                            <span className="font-medium text-gold-400">
                              {session.biggestWin.toFixed(2)} {selectedCurrency}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Currency Selector */}
              <CurrencySelector
                userId={userId}
                gameType="slots"
                onCurrencyChange={setSelectedCurrency}
                compact={false}
                showSettings={true}
              />

              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Time Played</p>
                      <p className="font-bold">
                        {formatTime(session.sessionTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Win Streak</p>
                      <p className="font-bold">{session.currentStreak}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Total Bet</p>
                      <p className="font-bold">
                        {session.totalBet.toFixed(2)} {selectedCurrency}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Total Won</p>
                      <p className="font-bold text-green-400">
                        {session.totalWin.toFixed(2)} {selectedCurrency}
                      </p>
                    </div>
                  </div>

                  {session.totalSpins > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Win Rate</span>
                        <span>
                          {(
                            (session.totalWin / session.totalBet) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(session.totalWin / session.totalBet) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentGame.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}

                  <div className="pt-3 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Reels:</span>
                      <span className="font-medium">{currentGame.reels}</span>
                    </div>
                    {currentGame.paylines > 0 && (
                      <div className="flex justify-between">
                        <span>Paylines:</span>
                        <span className="font-medium">
                          {currentGame.paylines}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Volatility:</span>
                      <Badge
                        variant="outline"
                        className={
                          currentGame.volatility === "high"
                            ? "border-red-500 text-red-400"
                            : currentGame.volatility === "medium"
                              ? "border-yellow-500 text-yellow-400"
                              : "border-green-500 text-green-400"
                        }
                      >
                        {currentGame.volatility}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Win:</span>
                      <span className="font-medium text-gold-400">
                        {currentGame.maxWin}x
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Game Info Dialog */}
        <Dialog open={showGameInfo} onOpenChange={setShowGameInfo}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <img
                  src={currentGame.thumbnail}
                  alt={currentGame.name}
                  className="w-8 h-8 rounded object-cover"
                />
                {currentGame.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Game Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span>{currentGame.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>RTP:</span>
                      <span>{currentGame.rtp}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Release Date:</span>
                      <span>
                        {currentGame.releaseDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    Bet Limits ({selectedCurrency})
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Minimum:</span>
                      <span>
                        {currentGame.minBet[selectedCurrency]}{" "}
                        {selectedCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maximum:</span>
                      <span>
                        {currentGame.maxBet[selectedCurrency]}{" "}
                        {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {currentGame.features.map((feature, index) => (
                    <Badge key={index} variant="outline">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Slot Games</h1>
            <p className="text-muted-foreground">
              Choose from hundreds of exciting slot games
            </p>
          </div>

          <CurrencySelector
            userId={userId}
            gameType="slots"
            onCurrencyChange={setSelectedCurrency}
            compact={true}
            showSettings={false}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="new">New Releases</SelectItem>
              <SelectItem value="high-rtp">High RTP</SelectItem>
              <SelectItem value="jackpot">Jackpots</SelectItem>
              <SelectItem value="bonus">Bonus Features</SelectItem>
              <SelectItem value="classic">Classic</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy as any}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rtp">RTP</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleGameSelect(game)}
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
                  {game.isJackpot && (
                    <Badge className="bg-purple-500 text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      JACKPOT
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(game.id);
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${favorites.has(game.id) ? "fill-current text-red-500" : "text-white"}`}
                  />
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold truncate">{game.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {game.rtp}%
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-2">
                  {game.provider}
                </p>

                {game.isJackpot && game.currentJackpot !== undefined && (
                  <div className="bg-gradient-to-r from-purple-500/20 to-gold-500/20 border border-purple-500/30 rounded-lg p-2 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-gold-400" />
                        <span className="text-xs font-medium text-purple-300">Jackpot:</span>
                      </div>
                      <div className="text-sm font-bold text-gold-400">
                        {game.jackpotFormatted || `$${game.currentJackpot?.toFixed(0)}`}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Min:</span>
                    <span className="font-medium">
                      {game.minBet[selectedCurrency]} {selectedCurrency}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      game.volatility === "high"
                        ? "border-red-500 text-red-400"
                        : game.volatility === "medium"
                          ? "border-yellow-500 text-yellow-400"
                          : "border-green-500 text-green-400"
                    }
                  >
                    {game.volatility}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium text-gold-400">
                      {game.maxWin}x
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedSlotsIntegration;
