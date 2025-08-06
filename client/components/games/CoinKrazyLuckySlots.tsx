import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  RotateCcw,
  Crown,
  Coins,
  Zap,
  Star,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Info,
  TrendingUp,
  DollarSign,
  Plus,
  Minus,
  Gift,
  Flame,
  Sparkles,
  Target,
  Lock,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { balanceService } from "@/services/balanceService";
import { analyticsService } from "@/services/realTimeAnalytics";
import { cn } from "@/lib/utils";

interface SlotSymbol {
  id: string;
  symbol: string;
  value: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  color: string;
}

interface SpinResult {
  reels: SlotSymbol[][];
  winLines: WinLine[];
  totalWin: number;
  multiplier: number;
  bonusTriggered: boolean;
  freeSpins?: number;
}

interface WinLine {
  line: number;
  symbols: SlotSymbol[];
  positions: number[][];
  payout: number;
}

interface GameStats {
  totalSpins: number;
  totalWon: number;
  biggestWin: number;
  currentStreak: number;
  rtp: number;
}

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: "coin", symbol: "🪙", value: 5, rarity: "common", color: "text-yellow-500" },
  { id: "gem", symbol: "💎", value: 10, rarity: "rare", color: "text-blue-500" },
  { id: "crown", symbol: "👑", value: 15, rarity: "rare", color: "text-purple-500" },
  { id: "star", symbol: "⭐", value: 20, rarity: "epic", color: "text-amber-500" },
  { id: "fire", symbol: "🔥", value: 25, rarity: "epic", color: "text-red-500" },
  { id: "lightning", symbol: "⚡", value: 50, rarity: "legendary", color: "text-cyan-500" },
  { id: "coinkrazy", symbol: "CK", value: 100, rarity: "legendary", color: "text-gradient" },
  { id: "wild", symbol: "🌟", value: 0, rarity: "epic", color: "text-rainbow" },
  { id: "scatter", symbol: "💫", value: 0, rarity: "rare", color: "text-violet-500" },
];

const PAYLINES = [
  [1, 1, 1, 1, 1], // Middle row
  [0, 0, 0, 0, 0], // Top row
  [2, 2, 2, 2, 2], // Bottom row
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // Inverted V
  [1, 0, 0, 0, 1], // Roof
  [1, 2, 2, 2, 1], // Floor
  [0, 0, 1, 2, 2], // Diagonal
  [2, 2, 1, 0, 0], // Reverse diagonal
  [1, 0, 1, 2, 1], // W shape
];

export default function CoinKrazyLuckySlots() {
  const { user } = useAuth();
  const [reels, setReels] = useState<SlotSymbol[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [betAmount, setBetAmount] = useState(1.0);
  const [betLines, setBetLines] = useState(10);
  const [currency, setCurrency] = useState<"GC" | "SC">("GC");
  const [balance, setBalance] = useState({ gc: 100000, sc: 500 });
  const [lastWin, setLastWin] = useState(0);
  const [totalWin, setTotalWin] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalSpins: 0,
    totalWon: 0,
    biggestWin: 0,
    currentStreak: 0,
    rtp: 96.5,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [winLines, setWinLines] = useState<WinLine[]>([]);
  const [bonusGame, setBonusGame] = useState(false);
  const [freeSpins, setFreeSpins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [recentWins, setRecentWins] = useState<number[]>([]);
  const [jackpotAmount, setJackpotAmount] = useState(25847.92);

  const spinTimeoutRef = useRef<NodeJS.Timeout>();
  const autoPlayRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeGame();
    const jackpotInterval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.random() * 10);
    }, 5000);

    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      if (autoPlayRef.current) clearTimeout(autoPlayRef.current);
      clearInterval(jackpotInterval);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      const userBalance = balanceService.getUserBalance(user.id);
      setBalance({ gc: userBalance.gc, sc: userBalance.sc });
    }
  }, [user?.id]);

  const initializeGame = () => {
    const initialReels = Array(5).fill(null).map(() => 
      Array(3).fill(null).map(() => 
        SLOT_SYMBOLS[Math.floor(Math.random() * (SLOT_SYMBOLS.length - 2))] // Exclude wild and scatter from initial
      )
    );
    setReels(initialReels);
  };

  const getRandomSymbol = (excludeSpecial = false): SlotSymbol => {
    let symbols = SLOT_SYMBOLS;
    
    if (excludeSpecial) {
      symbols = SLOT_SYMBOLS.filter(s => s.id !== "wild" && s.id !== "scatter");
    }

    // Weighted random selection based on rarity
    const weights = symbols.map(symbol => {
      switch (symbol.rarity) {
        case "legendary": return 1;
        case "epic": return 3;
        case "rare": return 8;
        case "common": return 20;
        default: return 10;
      }
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < symbols.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbols[i];
      }
    }

    return symbols[0];
  };

  const checkWinLines = (spinReels: SlotSymbol[][]): WinLine[] => {
    const wins: WinLine[] = [];

    for (let lineIndex = 0; lineIndex < betLines; lineIndex++) {
      const line = PAYLINES[lineIndex];
      const lineSymbols: SlotSymbol[] = [];
      const positions: number[][] = [];

      for (let reelIndex = 0; reelIndex < 5; reelIndex++) {
        const symbol = spinReels[reelIndex][line[reelIndex]];
        lineSymbols.push(symbol);
        positions.push([reelIndex, line[reelIndex]]);
      }

      const winResult = calculateLineWin(lineSymbols);
      if (winResult.payout > 0) {
        wins.push({
          line: lineIndex + 1,
          symbols: lineSymbols,
          positions,
          payout: winResult.payout * betAmount,
        });
      }
    }

    return wins;
  };

  const calculateLineWin = (lineSymbols: SlotSymbol[]): { payout: number; count: number } => {
    let consecutiveCount = 1;
    let winSymbol = lineSymbols[0];

    // Handle wild symbols
    if (winSymbol.id === "wild") {
      // Find first non-wild symbol
      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i].id !== "wild") {
          winSymbol = lineSymbols[i];
          break;
        }
      }
    }

    // Count consecutive matching symbols (including wilds)
    for (let i = 1; i < lineSymbols.length; i++) {
      const currentSymbol = lineSymbols[i];
      if (currentSymbol.id === winSymbol.id || currentSymbol.id === "wild" || winSymbol.id === "wild") {
        consecutiveCount++;
      } else {
        break;
      }
    }

    // Minimum 3 symbols for a win
    if (consecutiveCount < 3) {
      return { payout: 0, count: 0 };
    }

    // Calculate payout based on symbol value and count
    const baseValue = winSymbol.value || 1;
    const multipliers = [0, 0, 1, 2, 5, 10]; // 3, 4, 5 symbol multipliers
    const payout = baseValue * multipliers[consecutiveCount];

    return { payout, count: consecutiveCount };
  };

  const checkScatterWin = (spinReels: SlotSymbol[][]): number => {
    let scatterCount = 0;
    
    for (let reel = 0; reel < 5; reel++) {
      for (let row = 0; row < 3; row++) {
        if (spinReels[reel][row].id === "scatter") {
          scatterCount++;
        }
      }
    }

    // 3 or more scatters trigger free spins
    if (scatterCount >= 3) {
      const freeSpinsAwarded = scatterCount * 5; // 5 free spins per scatter
      setFreeSpins(prev => prev + freeSpinsAwarded);
      return scatterCount * betAmount * 2; // Scatter pays 2x bet per symbol
    }

    return 0;
  };

  const performSpin = async () => {
    if (isSpinning || !user) return;

    const currentBalance = currency === "GC" ? balance.gc : balance.sc;
    const totalBet = betAmount * betLines;

    if (currentBalance < totalBet) {
      alert(`Insufficient ${currency} balance`);
      return;
    }

    setIsSpinning(true);
    setWinLines([]);
    setLastWin(0);

    // Deduct bet from balance
    await balanceService.updateBalance(
      user.id,
      currency === "GC" ? -totalBet : 0,
      currency === "SC" ? -totalBet : 0,
      `CoinKrazy Lucky Slots - Bet (${betLines} lines @ ${betAmount} ${currency})`
    );

    // Update local balance
    setBalance(prev => ({
      ...prev,
      [currency.toLowerCase()]: prev[currency.toLowerCase() as keyof typeof prev] - totalBet
    }));

    // Simulate reel spinning animation
    const spinDuration = 2000 + Math.random() * 1000; // 2-3 seconds
    
    // Generate multiple intermediate results for animation
    const animationSteps = 10;
    for (let step = 0; step < animationSteps; step++) {
      setTimeout(() => {
        const tempReels = Array(5).fill(null).map(() => 
          Array(3).fill(null).map(() => getRandomSymbol(true))
        );
        setReels(tempReels);
      }, (step * spinDuration) / animationSteps);
    }

    // Final result
    spinTimeoutRef.current = setTimeout(async () => {
      const finalReels = Array(5).fill(null).map(() => 
        Array(3).fill(null).map(() => getRandomSymbol())
      );
      
      setReels(finalReels);

      // Calculate wins
      const lineWins = checkWinLines(finalReels);
      const scatterWin = checkScatterWin(finalReels);
      
      const totalLineWin = lineWins.reduce((sum, win) => sum + win.payout, 0);
      const totalWinAmount = (totalLineWin + scatterWin) * multiplier;

      setWinLines(lineWins);
      setLastWin(totalWinAmount);
      
      // Award winnings
      if (totalWinAmount > 0) {
        await balanceService.updateBalance(
          user.id,
          currency === "GC" ? totalWinAmount : 0,
          currency === "SC" ? totalWinAmount : 0,
          `CoinKrazy Lucky Slots - Win`
        );

        // Update local balance
        setBalance(prev => ({
          ...prev,
          [currency.toLowerCase()]: prev[currency.toLowerCase() as keyof typeof prev] + totalWinAmount
        }));

        // Track SC wins
        if (currency === "SC") {
          await analyticsService.trackSCWin(user.id, totalWinAmount, "CoinKrazy Lucky Slots");
        }

        // Update recent wins
        setRecentWins(prev => [totalWinAmount, ...prev.slice(0, 9)]);

        if (soundEnabled) {
          // Play win sound
          playWinSound(totalWinAmount);
        }
      }

      // Update stats
      setGameStats(prev => ({
        ...prev,
        totalSpins: prev.totalSpins + 1,
        totalWon: prev.totalWon + totalWinAmount,
        biggestWin: Math.max(prev.biggestWin, totalWinAmount),
        currentStreak: totalWinAmount > 0 ? prev.currentStreak + 1 : 0,
      }));

      setIsSpinning(false);

      // Handle auto play
      if (autoPlay && autoSpinsLeft > 1) {
        setAutoSpinsLeft(prev => prev - 1);
        autoPlayRef.current = setTimeout(() => {
          performSpin();
        }, 1500);
      } else if (autoSpinsLeft <= 1) {
        setAutoPlay(false);
        setAutoSpinsLeft(0);
      }

      // Handle free spins
      if (freeSpins > 0) {
        setFreeSpins(prev => prev - 1);
        setTimeout(() => {
          performSpin();
        }, 2000);
      }
    }, spinDuration);
  };

  const playWinSound = (winAmount: number) => {
    // Mock sound playing based on win amount
    if (winAmount > betAmount * 100) {
      console.log("Playing BIG WIN sound!");
    } else if (winAmount > betAmount * 10) {
      console.log("Playing NICE WIN sound!");
    } else {
      console.log("Playing win sound");
    }
  };

  const startAutoPlay = (spins: number) => {
    setAutoPlay(true);
    setAutoSpinsLeft(spins);
    if (!isSpinning) {
      performSpin();
    }
  };

  const stopAutoPlay = () => {
    setAutoPlay(false);
    setAutoSpinsLeft(0);
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
  };

  const formatCurrency = (amount: number) => {
    if (currency === "SC") {
      return amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });
    }
    return amount.toLocaleString();
  };

  const getSymbolStyle = (symbol: SlotSymbol, isWinning = false) => {
    return cn(
      "text-4xl transition-all duration-300",
      symbol.color,
      isWinning && "animate-pulse scale-110 drop-shadow-lg",
      symbol.id === "coinkrazy" && "font-bold text-2xl bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent"
    );
  };

  const isWinningPosition = (reelIndex: number, rowIndex: number) => {
    return winLines.some(win => 
      win.positions.some(pos => pos[0] === reelIndex && pos[1] === rowIndex)
    );
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-gold-600/10 to-purple-600/10 border-gold-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                CoinKrazy Lucky Slots
                <Badge className="bg-gold-600 text-white">96.5% RTP</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Premium 5-reel slots with CoinKrazy branding • Wild symbols • Free spins • Progressive jackpot
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  {formatCurrency(jackpotAmount)}
                </div>
                <div className="text-sm text-muted-foreground">Jackpot</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">
                  {gameStats.totalSpins}
                </div>
                <div className="text-sm text-muted-foreground">Spins</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`${currency === "GC" ? "bg-yellow-500" : "bg-blue-500"} text-white`}>
                    {currency} Mode
                  </Badge>
                  
                  {lastWin > 0 && (
                    <Badge className="bg-green-500 text-white animate-pulse">
                      <Trophy className="w-3 h-3 mr-1" />
                      Win: {formatCurrency(lastWin)}
                    </Badge>
                  )}
                  
                  {freeSpins > 0 && (
                    <Badge className="bg-purple-500 text-white">
                      <Gift className="w-3 h-3 mr-1" />
                      {freeSpins} Free Spins
                    </Badge>
                  )}
                  
                  {multiplier > 1 && (
                    <Badge className="bg-red-500 text-white">
                      <Flame className="w-3 h-3 mr-1" />
                      {multiplier}x Multiplier
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
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
                    onClick={() => setShowPaytable(true)}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Slot Machine */}
              <div className="relative">
                {/* Reels */}
                <div className="grid grid-cols-5 gap-2 p-6 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg border-4 border-gold-500">
                  {reels.map((reel, reelIndex) => (
                    <div key={reelIndex} className="space-y-2">
                      {reel.map((symbol, rowIndex) => (
                        <div
                          key={`${reelIndex}-${rowIndex}`}
                          className={cn(
                            "h-20 bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center border-2",
                            isWinningPosition(reelIndex, rowIndex) 
                              ? "border-gold-400 shadow-lg shadow-gold-400/50" 
                              : "border-gray-300",
                            isSpinning && "animate-bounce"
                          )}
                        >
                          <div className={getSymbolStyle(symbol, isWinningPosition(reelIndex, rowIndex))}>
                            {symbol.symbol}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Paylines Overlay */}
                {winLines.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 500 240">
                      {winLines.map((win, index) => {
                        const lineColors = ["#fbbf24", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];
                        const color = lineColors[index % lineColors.length];

                        return (
                          <g key={index}>
                            <polyline
                              points={win.positions.map((pos, i) => {
                                const x = 50 + (i * 90); // Reel position
                                const y = 40 + (pos[1] * 80); // Row position
                                return `${x},${y}`;
                              }).join(" ")}
                              fill="none"
                              stroke={color}
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeDasharray="5,5"
                              className="animate-pulse"
                            />
                            {/* Line number indicator */}
                            <circle
                              cx="20"
                              cy={120}
                              r="12"
                              fill={color}
                              opacity="0.9"
                            />
                            <text
                              x="20"
                              y="125"
                              textAnchor="middle"
                              className="text-xs font-bold fill-white"
                            >
                              {win.line}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                )}
              </div>

              {/* Win Display */}
              {lastWin > 0 && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-500">
                    🎉 WIN: {formatCurrency(lastWin)} 🎉
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {winLines.length} winning line{winLines.length !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls Sidebar */}
        <div className="space-y-4">
          {/* Balance */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  {formatCurrency(currency === "GC" ? balance.gc : balance.sc)}
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
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Currency</label>
                <Select value={currency} onValueChange={(value: "GC" | "SC") => setCurrency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GC">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        Gold Coins
                      </div>
                    </SelectItem>
                    <SelectItem value="SC">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-blue-500" />
                        Sweeps Coins
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Bet Per Line</label>
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
                    max="100"
                    step="0.01"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0.01)}
                    className="text-center"
                    disabled={isSpinning}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBetAmount(Math.min(100, betAmount + 0.01))}
                    disabled={isSpinning}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Active Lines</label>
                <Select 
                  value={betLines.toString()} 
                  onValueChange={(value) => setBetLines(parseInt(value))}
                  disabled={isSpinning}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(line => (
                      <SelectItem key={line} value={line.toString()}>
                        {line} Line{line !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Total Bet:</span>
                  <span className="font-bold">{formatCurrency(betAmount * betLines)}</span>
                </div>
              </div>

              <Button
                onClick={performSpin}
                disabled={isSpinning || autoPlay || (currency === "GC" ? balance.gc : balance.sc) < betAmount * betLines}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                size="lg"
              >
                {isSpinning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Spinning...
                  </>
                ) : freeSpins > 0 ? (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Free Spin
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Spin
                  </>
                )}
              </Button>

              {/* Auto Play */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startAutoPlay(10)}
                  disabled={isSpinning || autoPlay}
                >
                  Auto 10
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => startAutoPlay(25)}
                  disabled={isSpinning || autoPlay}
                >
                  Auto 25
                </Button>
              </div>

              {autoPlay && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={stopAutoPlay}
                  className="w-full"
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Stop Auto ({autoSpinsLeft})
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spins:</span>
                <span className="font-bold">{gameStats.totalSpins}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Won:</span>
                <span className="font-bold text-green-500">{formatCurrency(gameStats.totalWon)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Biggest Win:</span>
                <span className="font-bold text-gold-500">{formatCurrency(gameStats.biggestWin)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Win Streak:</span>
                <span className="font-bold text-purple-500">{gameStats.currentStreak}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>RTP:</span>
                <span className="font-bold">{gameStats.rtp}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Wins */}
          {recentWins.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentWins.slice(0, 5).map((win, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>Win #{recentWins.length - index}</span>
                      <span className="font-bold text-green-500">
                        {formatCurrency(win)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Paytable Dialog */}
      <Dialog open={showPaytable} onOpenChange={setShowPaytable}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Paytable - CoinKrazy Lucky Slots</DialogTitle>
            <DialogDescription>
              Symbol values and game rules
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-4">Symbol Values (3/4/5 in a line)</h3>
              <div className="space-y-2">
                {SLOT_SYMBOLS.filter(s => s.value > 0).map(symbol => (
                  <div key={symbol.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-2xl", symbol.color)}>{symbol.symbol}</span>
                      <span className="font-medium">{symbol.id}</span>
                    </div>
                    <div className="text-sm">
                      {symbol.value} / {symbol.value * 2} / {symbol.value * 5}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Special Symbols</h3>
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🌟</span>
                    <span className="font-bold">Wild Symbol</span>
                  </div>
                  <p className="text-sm">Substitutes for all symbols except scatter</p>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">💫</span>
                    <span className="font-bold">Scatter Symbol</span>
                  </div>
                  <p className="text-sm">3+ scatters trigger free spins</p>
                </div>
                
                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">CK</span>
                    <span className="font-bold">CoinKrazy Symbol</span>
                  </div>
                  <p className="text-sm">Highest paying symbol - jackpot eligible</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
