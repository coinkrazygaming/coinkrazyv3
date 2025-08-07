import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Spade,
  Heart,
  Diamond,
  Club,
  Users,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  Target,
  Settings,
  Info,
  ArrowLeft,
  Plus,
  Minus,
  DollarSign,
  Activity,
  BarChart3,
  Crown,
  Star,
  Coins,
  Shuffle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Flame,
} from "lucide-react";
import CurrencySelector from "../CurrencySelector";
import {
  gameInterfaceService,
  TableGameResult,
} from "../../services/gameInterfaceService";
import { CurrencyType } from "../../services/walletService";
import { useToast } from "@/hooks/use-toast";

interface TableGame {
  id: string;
  name: string;
  type: "blackjack" | "roulette" | "baccarat" | "poker";
  thumbnail: string;
  description: string;
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  players: number;
  rtp: number;
  features: string[];
  rules: string[];
  isLive: boolean;
  dealer?: string;
}

interface GameSession {
  handsPlayed: number;
  totalBet: number;
  totalWin: number;
  netResult: number;
  winRate: number;
  bestHand: number;
  currentStreak: number;
  sessionTime: number;
}

interface BlackjackGame {
  playerHand: string[];
  dealerHand: string[];
  playerValue: number;
  dealerValue: number;
  gameStatus: "betting" | "playing" | "dealer" | "finished";
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  result?: "win" | "lose" | "push" | "blackjack";
}

interface RouletteGame {
  lastNumbers: number[];
  currentBets: Array<{
    type: string;
    value: any;
    amount: number;
    odds: number;
  }>;
  spinning: boolean;
  result?: number;
}

const EnhancedTableGames: React.FC = () => {
  const { toast } = useToast();
  const userId = "demo@coinfrazy.com";

  // Game state
  const [games, setGames] = useState<TableGame[]>([]);
  const [currentGame, setCurrentGame] = useState<TableGame | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>("GC");
  const [betAmount, setBetAmount] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  // Game session
  const [session, setSession] = useState<GameSession>({
    handsPlayed: 0,
    totalBet: 0,
    totalWin: 0,
    netResult: 0,
    winRate: 0,
    bestHand: 0,
    currentStreak: 0,
    sessionTime: 0,
  });

  // Blackjack state
  const [blackjackGame, setBlackjackGame] = useState<BlackjackGame>({
    playerHand: [],
    dealerHand: [],
    playerValue: 0,
    dealerValue: 0,
    gameStatus: "betting",
    canHit: false,
    canStand: false,
    canDouble: false,
    canSplit: false,
  });

  // Roulette state
  const [rouletteGame, setRouletteGame] = useState<RouletteGame>({
    lastNumbers: [32, 15, 19, 4, 21, 2],
    currentBets: [],
    spinning: false,
  });

  // UI state
  const [showGameInfo, setShowGameInfo] = useState(false);
  const [gameMode, setGameMode] = useState<"list" | "playing">("list");
  const sessionStartRef = React.useRef<Date>(new Date());

  useEffect(() => {
    loadTableGames();
    startSessionTimer();
  }, []);

  const startSessionTimer = () => {
    setInterval(() => {
      const now = new Date();
      const sessionTime = Math.floor(
        (now.getTime() - sessionStartRef.current.getTime()) / 1000,
      );
      setSession((prev) => ({ ...prev, sessionTime }));
    }, 1000);
  };

  const loadTableGames = async () => {
    setIsLoading(true);
    try {
      const mockGames: TableGame[] = [
        {
          id: "blackjack-classic",
          name: "Classic Blackjack",
          type: "blackjack",
          thumbnail: "/api/placeholder/300/200",
          description: "Traditional blackjack with 3:2 payouts",
          minBet: { GC: 25, SC: 0.25 },
          maxBet: { GC: 10000, SC: 100 },
          players: 12,
          rtp: 99.5,
          features: ["Insurance", "Double Down", "Split"],
          rules: [
            "Dealer stands on soft 17",
            "Blackjack pays 3:2",
            "Double after split allowed",
            "Insurance pays 2:1",
          ],
          isLive: false,
        },
        {
          id: "live-blackjack",
          name: "Live Blackjack VIP",
          type: "blackjack",
          thumbnail: "/api/placeholder/300/200",
          description: "Live dealer blackjack with professional dealers",
          minBet: { GC: 100, SC: 1 },
          maxBet: { GC: 50000, SC: 500 },
          players: 7,
          rtp: 99.5,
          features: ["Live Dealer", "Chat", "Side Bets"],
          rules: [
            "Dealer stands on soft 17",
            "Blackjack pays 3:2",
            "Perfect Pairs side bet available",
            "21+3 side bet available",
          ],
          isLive: true,
          dealer: "Sarah M.",
        },
        {
          id: "european-roulette",
          name: "European Roulette",
          type: "roulette",
          thumbnail: "/api/placeholder/300/200",
          description: "Single zero roulette with La Partage rule",
          minBet: { GC: 5, SC: 0.05 },
          maxBet: { GC: 5000, SC: 50 },
          players: 23,
          rtp: 97.3,
          features: ["La Partage", "Call Bets", "Statistics"],
          rules: [
            "Single zero wheel",
            "La Partage rule applies",
            "Maximum 5 neighbors bets",
            "Straight up pays 35:1",
          ],
          isLive: false,
        },
        {
          id: "live-roulette",
          name: "Live Roulette Gold",
          type: "roulette",
          thumbnail: "/api/placeholder/300/200",
          description: "Premium live roulette with enhanced features",
          minBet: { GC: 10, SC: 0.1 },
          maxBet: { GC: 25000, SC: 250 },
          players: 45,
          rtp: 97.3,
          features: ["Live Dealer", "Multi-Camera", "Hot/Cold Numbers"],
          rules: [
            "European wheel layout",
            "Live streaming HD quality",
            "Racetrack betting available",
            "Statistics panel included",
          ],
          isLive: true,
          dealer: "Michael R.",
        },
        {
          id: "baccarat-classic",
          name: "Classic Baccarat",
          type: "baccarat",
          thumbnail: "/api/placeholder/300/200",
          description: "Traditional baccarat with side bets",
          minBet: { GC: 50, SC: 0.5 },
          maxBet: { GC: 25000, SC: 250 },
          players: 8,
          rtp: 98.9,
          features: ["Player Pair", "Banker Pair", "Perfect Pair"],
          rules: [
            "Third card rules applied",
            "Banker wins pay 95%",
            "Tie pays 8:1",
            "Pairs pay 11:1",
          ],
          isLive: false,
        },
        {
          id: "live-baccarat",
          name: "Live Baccarat Squeeze",
          type: "baccarat",
          thumbnail: "/api/placeholder/300/200",
          description: "Live baccarat with card squeeze feature",
          minBet: { GC: 100, SC: 1 },
          maxBet: { GC: 100000, SC: 1000 },
          players: 15,
          rtp: 98.9,
          features: ["Card Squeeze", "Live Dealer", "Statistics"],
          rules: [
            "Punto Banco rules",
            "Squeeze feature available",
            "Multiple camera angles",
            "Roadmap displays included",
          ],
          isLive: true,
          dealer: "Elena K.",
        },
      ];

      setGames(mockGames);
    } catch (error) {
      console.error("Error loading table games:", error);
      toast({
        title: "Error",
        description: "Failed to load table games",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameSelect = async (game: TableGame) => {
    setCurrentGame(game);
    setGameMode("playing");

    try {
      await gameInterfaceService.startGameSession(
        userId,
        "table",
        selectedCurrency,
      );

      // Initialize game-specific state
      if (game.type === "blackjack") {
        setBlackjackGame({
          playerHand: [],
          dealerHand: [],
          playerValue: 0,
          dealerValue: 0,
          gameStatus: "betting",
          canHit: false,
          canStand: false,
          canDouble: false,
          canSplit: false,
        });
      } else if (game.type === "roulette") {
        setRouletteGame({
          lastNumbers: [32, 15, 19, 4, 21, 2],
          currentBets: [],
          spinning: false,
        });
      }

      toast({
        title: "Game Ready",
        description: `${game.name} is ready to play`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start game",
        variant: "destructive",
      });
    }
  };

  const handleBetChange = (change: number) => {
    if (!currentGame) return;
    const newBet = Math.max(
      currentGame.minBet[selectedCurrency],
      betAmount + change,
    );
    const maxBet = currentGame.maxBet[selectedCurrency];
    setBetAmount(Math.min(newBet, maxBet));
  };

  const startBlackjackHand = async () => {
    if (!currentGame) return;

    try {
      const bet = await gameInterfaceService.placeBet(
        userId,
        currentGame.id,
        "table",
        betAmount,
        selectedCurrency,
      );

      // Simulate dealing cards
      const playerCards = ["AS", "KH"]; // Ace of Spades, King of Hearts
      const dealerCards = ["7C", "??"]; // 7 of Clubs, hidden card

      setBlackjackGame({
        playerHand: playerCards,
        dealerHand: dealerCards,
        playerValue: 21, // Blackjack!
        dealerValue: 7,
        gameStatus: "playing",
        canHit: true,
        canStand: true,
        canDouble: true,
        canSplit: false,
        result:
          playerCards[0][0] === "A" &&
          ["K", "Q", "J", "10"].includes(playerCards[1][0])
            ? "blackjack"
            : undefined,
      });

      // Update session
      setSession((prev) => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        totalBet: prev.totalBet + betAmount,
      }));

      if (blackjackGame.result === "blackjack") {
        const winAmount = betAmount * 2.5; // 3:2 payout
        await gameInterfaceService.processGameResult(bet, "win", winAmount, {
          gameType: "blackjack",
          result: "blackjack",
        });

        setSession((prev) => ({
          ...prev,
          totalWin: prev.totalWin + winAmount,
          netResult: prev.netResult + (winAmount - betAmount),
          bestHand: Math.max(prev.bestHand, winAmount),
          currentStreak: prev.currentStreak + 1,
          winRate:
            ((prev.totalWin + winAmount) / (prev.totalBet + betAmount)) * 100,
        }));

        toast({
          title: "Blackjack!",
          description: `You won ${winAmount.toFixed(2)} ${selectedCurrency}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const blackjackHit = () => {
    // Simulate hitting
    const newCard = ["2H", "3S", "4D", "5C", "6H"][
      Math.floor(Math.random() * 5)
    ];
    const newHand = [...blackjackGame.playerHand, newCard];
    const newValue = calculateHandValue(newHand);

    setBlackjackGame((prev) => ({
      ...prev,
      playerHand: newHand,
      playerValue: newValue,
      canHit: newValue < 21,
      canDouble: false,
    }));

    if (newValue > 21) {
      setBlackjackGame((prev) => ({
        ...prev,
        result: "lose",
        gameStatus: "finished",
      }));
      toast({
        title: "Bust!",
        description: "You went over 21",
        variant: "destructive",
      });
    }
  };

  const blackjackStand = () => {
    setBlackjackGame((prev) => ({
      ...prev,
      gameStatus: "dealer",
      canHit: false,
      canStand: false,
      canDouble: false,
    }));

    // Simulate dealer play
    setTimeout(() => {
      const dealerFinalValue = Math.floor(Math.random() * 6) + 17; // 17-22
      const result =
        blackjackGame.playerValue > dealerFinalValue || dealerFinalValue > 21
          ? "win"
          : blackjackGame.playerValue < dealerFinalValue
            ? "lose"
            : "push";

      setBlackjackGame((prev) => ({
        ...prev,
        dealerValue: dealerFinalValue,
        dealerHand: ["7C", dealerFinalValue > 21 ? "KS" : "10D"],
        result,
        gameStatus: "finished",
      }));

      if (result === "win") {
        const winAmount = betAmount * 2;
        setSession((prev) => ({
          ...prev,
          totalWin: prev.totalWin + winAmount,
          netResult: prev.netResult + betAmount,
          currentStreak: prev.currentStreak + 1,
        }));
        toast({
          title: "You Win!",
          description: `You won ${winAmount.toFixed(2)} ${selectedCurrency}`,
        });
      } else if (result === "lose") {
        setSession((prev) => ({
          ...prev,
          netResult: prev.netResult - betAmount,
          currentStreak: 0,
        }));
        toast({
          title: "Dealer Wins",
          description: `You lost ${betAmount.toFixed(2)} ${selectedCurrency}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Push",
          description: "Tie game - bet returned",
        });
      }
    }, 2000);
  };

  const calculateHandValue = (hand: string[]): number => {
    let value = 0;
    let aces = 0;

    hand.forEach((card) => {
      const rank = card[0];
      if (rank === "A") {
        aces++;
        value += 11;
      } else if (["K", "Q", "J"].includes(rank)) {
        value += 10;
      } else {
        value += parseInt(rank);
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const spinRoulette = async () => {
    if (!currentGame) return;

    try {
      // Place bet on red for demo
      await gameInterfaceService.placeBet(
        userId,
        currentGame.id,
        "table",
        betAmount,
        selectedCurrency,
      );

      setRouletteGame((prev) => ({ ...prev, spinning: true }));

      setTimeout(() => {
        const result = Math.floor(Math.random() * 37); // 0-36
        const isRed = [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ].includes(result);
        const won = result !== 0 && isRed; // Assume bet on red

        setRouletteGame((prev) => ({
          ...prev,
          spinning: false,
          result,
          lastNumbers: [result, ...prev.lastNumbers.slice(0, 5)],
        }));

        setSession((prev) => ({
          ...prev,
          handsPlayed: prev.handsPlayed + 1,
          totalBet: prev.totalBet + betAmount,
        }));

        if (won) {
          const winAmount = betAmount * 2;
          setSession((prev) => ({
            ...prev,
            totalWin: prev.totalWin + winAmount,
            netResult: prev.netResult + betAmount,
            currentStreak: prev.currentStreak + 1,
          }));
          toast({
            title: "Winner!",
            description: `Red ${result} - You won ${winAmount.toFixed(2)} ${selectedCurrency}`,
          });
        } else {
          setSession((prev) => ({
            ...prev,
            netResult: prev.netResult - betAmount,
            currentStreak: 0,
          }));
          toast({
            title: "No Win",
            description: `${result === 0 ? "Green" : "Black"} ${result}`,
            variant: "destructive",
          });
        }
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (gameMode === "playing" && currentGame) {
    return (
      <div className="min-h-screen bg-background">
        {/* Game Header */}
        <div className="bg-gradient-to-r from-casino-blue/10 to-green/10 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setGameMode("list")}
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
                      {currentGame.isLive
                        ? `Live Dealer: ${currentGame.dealer}`
                        : "RNG Table Game"}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="border-green-500 text-green-400"
                >
                  RTP: {currentGame.rtp}%
                </Badge>

                {currentGame.isLive && (
                  <Badge
                    variant="outline"
                    className="border-red-500 text-red-400"
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                    LIVE
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGameInfo(true)}
                >
                  <Info className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-b from-green-900/20 to-green-800/10">
                <CardContent className="p-6">
                  {/* Game Table */}
                  <div className="aspect-video bg-gradient-to-b from-green-800 to-green-900 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                    {currentGame.type === "blackjack" && (
                      <div className="text-white w-full h-full flex flex-col items-center justify-center">
                        <div className="text-center mb-8">
                          <h3 className="text-2xl font-bold mb-4">Blackjack</h3>

                          {/* Dealer Hand */}
                          <div className="mb-6">
                            <p className="text-sm mb-2">
                              Dealer ({blackjackGame.dealerValue})
                            </p>
                            <div className="flex justify-center gap-2">
                              {blackjackGame.dealerHand.map((card, index) => (
                                <div
                                  key={index}
                                  className="w-12 h-16 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-black font-bold"
                                >
                                  {card === "??" ? "?" : card}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Player Hand */}
                          <div>
                            <p className="text-sm mb-2">
                              Player ({blackjackGame.playerValue})
                            </p>
                            <div className="flex justify-center gap-2">
                              {blackjackGame.playerHand.map((card, index) => (
                                <div
                                  key={index}
                                  className="w-12 h-16 bg-white rounded border-2 border-gray-300 flex items-center justify-center text-black font-bold"
                                >
                                  {card}
                                </div>
                              ))}
                            </div>
                          </div>

                          {blackjackGame.result && (
                            <div className="mt-4 text-xl font-bold">
                              {blackjackGame.result === "win" && (
                                <span className="text-green-400">YOU WIN!</span>
                              )}
                              {blackjackGame.result === "lose" && (
                                <span className="text-red-400">
                                  DEALER WINS
                                </span>
                              )}
                              {blackjackGame.result === "push" && (
                                <span className="text-yellow-400">PUSH</span>
                              )}
                              {blackjackGame.result === "blackjack" && (
                                <span className="text-gold-400">
                                  BLACKJACK!
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentGame.type === "roulette" && (
                      <div className="text-white w-full h-full flex flex-col items-center justify-center">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold mb-4">
                            European Roulette
                          </h3>

                          {/* Roulette Wheel */}
                          <div
                            className={`w-32 h-32 border-4 border-gold-500 rounded-full mx-auto mb-4 flex items-center justify-center ${rouletteGame.spinning ? "animate-spin" : ""}`}
                          >
                            <div className="text-3xl font-bold">
                              {rouletteGame.spinning
                                ? "🎰"
                                : rouletteGame.result !== undefined
                                  ? rouletteGame.result
                                  : "?"}
                            </div>
                          </div>

                          {/* Last Numbers */}
                          <div className="mb-4">
                            <p className="text-sm mb-2">Last Numbers</p>
                            <div className="flex justify-center gap-1">
                              {rouletteGame.lastNumbers.map((num, index) => {
                                const isRed = [
                                  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25,
                                  27, 30, 32, 34, 36,
                                ].includes(num);
                                return (
                                  <div
                                    key={index}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                      num === 0
                                        ? "bg-green-600"
                                        : isRed
                                          ? "bg-red-600"
                                          : "bg-black"
                                    }`}
                                  >
                                    {num}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {rouletteGame.spinning && (
                            <p className="text-gold-400 font-bold">
                              Spinning...
                            </p>
                          )}
                        </div>
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
                            onClick={() => handleBetChange(-5)}
                            disabled={
                              betAmount <= currentGame.minBet[selectedCurrency]
                            }
                          >
                            <Minus className="w-4 h-4" />
                          </Button>

                          <Input
                            type="number"
                            value={betAmount}
                            onChange={(e) =>
                              setBetAmount(
                                Math.max(
                                  currentGame.minBet[selectedCurrency],
                                  parseFloat(e.target.value) ||
                                    currentGame.minBet[selectedCurrency],
                                ),
                              )
                            }
                            className="text-center"
                            min={currentGame.minBet[selectedCurrency]}
                            max={currentGame.maxBet[selectedCurrency]}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBetChange(5)}
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

                    {/* Game Actions */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Game Actions</h3>

                        {currentGame.type === "blackjack" && (
                          <div className="space-y-2">
                            {blackjackGame.gameStatus === "betting" && (
                              <Button
                                onClick={startBlackjackHand}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Deal Cards
                              </Button>
                            )}

                            {blackjackGame.gameStatus === "playing" && (
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  onClick={blackjackHit}
                                  disabled={!blackjackGame.canHit}
                                  variant="outline"
                                >
                                  Hit
                                </Button>
                                <Button
                                  onClick={blackjackStand}
                                  disabled={!blackjackGame.canStand}
                                  variant="outline"
                                >
                                  Stand
                                </Button>
                                <Button
                                  disabled={!blackjackGame.canDouble}
                                  variant="outline"
                                >
                                  Double
                                </Button>
                                <Button
                                  disabled={!blackjackGame.canSplit}
                                  variant="outline"
                                >
                                  Split
                                </Button>
                              </div>
                            )}

                            {blackjackGame.gameStatus === "finished" && (
                              <Button
                                onClick={() =>
                                  setBlackjackGame({
                                    playerHand: [],
                                    dealerHand: [],
                                    playerValue: 0,
                                    dealerValue: 0,
                                    gameStatus: "betting",
                                    canHit: false,
                                    canStand: false,
                                    canDouble: false,
                                    canSplit: false,
                                  })
                                }
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                New Hand
                              </Button>
                            )}
                          </div>
                        )}

                        {currentGame.type === "roulette" && (
                          <div className="space-y-2">
                            <Button
                              onClick={spinRoulette}
                              disabled={rouletteGame.spinning}
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                            >
                              {rouletteGame.spinning ? (
                                <>
                                  <Timer className="w-4 h-4 mr-2 animate-spin" />
                                  Spinning...
                                </>
                              ) : (
                                <>
                                  <Target className="w-4 h-4 mr-2" />
                                  Spin (Bet on Red)
                                </>
                              )}
                            </Button>

                            <p className="text-xs text-muted-foreground text-center">
                              Demo: Automatically bets on Red
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-3">Session Stats</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Hands:</span>
                            <span className="font-medium">
                              {session.handsPlayed}
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
                              {session.bestHand.toFixed(2)} {selectedCurrency}
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
                gameType="table"
                onCurrencyChange={setSelectedCurrency}
                compact={false}
                showSettings={true}
              />

              {/* Session Stats */}
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

                  {session.handsPlayed > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Win Rate</span>
                        <span>{session.winRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={session.winRate} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Game Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Game Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentGame.rules.slice(0, 3).map((rule, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGameInfo(true)}
                    className="w-full mt-3"
                  >
                    View All Rules
                  </Button>
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
              <p className="text-muted-foreground">{currentGame.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Game Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>RTP:</span>
                      <span>{currentGame.rtp}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span>{currentGame.players} online</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{currentGame.isLive ? "Live Dealer" : "RNG"}</span>
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

              <div>
                <h4 className="font-medium mb-2">Rules</h4>
                <ul className="space-y-1 text-sm">
                  {currentGame.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
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
            <h1 className="text-3xl font-bold">Table Games</h1>
            <p className="text-muted-foreground">
              Classic casino table games with live dealers
            </p>
          </div>

          <CurrencySelector
            userId={userId}
            gameType="table"
            onCurrencyChange={setSelectedCurrency}
            compact={true}
            showSettings={false}
          />
        </div>
      </div>

      {/* Game Categories */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="blackjack">Blackjack</TabsTrigger>
          <TabsTrigger value="roulette">Roulette</TabsTrigger>
          <TabsTrigger value="baccarat">Baccarat</TabsTrigger>
          <TabsTrigger value="live">Live Dealer</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Games Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Play Now
                  </Button>
                </div>

                <div className="absolute top-3 left-3 flex gap-2">
                  {game.isLive && (
                    <Badge className="bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      LIVE
                    </Badge>
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
                  <Badge
                    variant="outline"
                    className="text-xs border-green-500 text-green-400"
                  >
                    {game.rtp}%
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {game.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Min:</span>
                    <span className="font-medium">
                      {game.minBet[selectedCurrency]} {selectedCurrency}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">
                      {game.maxBet[selectedCurrency]} {selectedCurrency}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedTableGames;
