import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gamepad2,
  Trophy,
  Crown,
  Star,
  Zap,
  Target,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Coins,
  Gift,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  Diamond,
  Spade,
  Club,
  Shuffle,
  RefreshCw,
  Circle,
  Square,
  Triangle,
  Plus,
  Minus,
  X,
  Eye,
  Volume2,
  VolumeX,
  Settings,
  Info,
  BarChart3,
  Flame,
  Sparkles,
  Gem,
  Cherry,
  Apple,
  Grape,
  Lemon,
  Banana,
  Watermelon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { analyticsService } from "@/services/realTimeAnalytics";

// Game Types
interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "wheel" | "dice" | "cards" | "memory" | "skill" | "puzzle";
  difficulty: "easy" | "medium" | "hard";
  maxReward: number;
  playCount: number;
  averageReward: number;
  winRate: number;
  isActive: boolean;
  cooldown: number;
  lastPlayed?: Date;
}

interface GameResult {
  gameId: string;
  reward: number;
  success: boolean;
  timestamp: Date;
  multiplier: number;
  bonus: boolean;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  gameId: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: Date;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  gameId: string;
  avatar: string;
  isToday: boolean;
}

export default function MiniGames() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<any>({});
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [totalSCEarned, setTotalSCEarned] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dailyRewardsCollected, setDailyRewardsCollected] = useState(false);

  // Wheel of Fortune state
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);

  // Dice Game state
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [diceTarget, setDiceTarget] = useState(7);

  // Card Memory state
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<Set<number>>(new Set());
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Number Guess state
  const [targetNumber, setTargetNumber] = useState(0);
  const [guessValue, setGuessValue] = useState("");
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessHistory, setGuessHistory] = useState<{guess: number, hint: string}[]>([]);

  // Color Match state
  const [colorSequence, setColorSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [showingSequence, setShowingSequence] = useState(false);
  const [sequenceLevel, setSequenceLevel] = useState(1);

  // Fruit Ninja state
  const [fruits, setFruits] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(false);

  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const miniGames: MiniGame[] = [
    {
      id: "mary-cucumber",
      name: "Mary Had a lil cucumber",
      description: "60-second cucumber collection challenge!",
      icon: <span className="text-lg">🥒</span>,
      category: "skill",
      difficulty: "medium",
      maxReward: 10.0,
      playCount: 2456,
      averageReward: 3.5,
      winRate: 75,
      isActive: true,
      cooldown: 86400, // 24 hours
    },
    {
      id: "wheel-fortune",
      name: "Wheel of Fortune",
      description: "Spin the wheel to win instant SC rewards!",
      icon: <Circle className="w-6 h-6" />,
      category: "wheel",
      difficulty: "easy",
      maxReward: 5.0,
      playCount: 12456,
      averageReward: 1.2,
      winRate: 85,
      isActive: true,
      cooldown: 300, // 5 minutes
    },
    {
      id: "lucky-dice",
      name: "Lucky Dice",
      description: "Roll the dice and match the target number!",
      icon: <Dice1 className="w-6 h-6" />,
      category: "dice",
      difficulty: "easy",
      maxReward: 3.0,
      playCount: 8923,
      averageReward: 0.8,
      winRate: 60,
      isActive: true,
      cooldown: 180, // 3 minutes
    },
    {
      id: "memory-match",
      name: "Memory Match",
      description: "Flip cards and match pairs to win SC!",
      icon: <Square className="w-6 h-6" />,
      category: "memory",
      difficulty: "medium",
      maxReward: 8.0,
      playCount: 5432,
      averageReward: 2.1,
      winRate: 45,
      isActive: true,
      cooldown: 600, // 10 minutes
    },
    {
      id: "number-guess",
      name: "Number Guesser",
      description: "Guess the secret number in fewer attempts!",
      icon: <Target className="w-6 h-6" />,
      category: "skill",
      difficulty: "medium",
      maxReward: 6.0,
      playCount: 3456,
      averageReward: 1.5,
      winRate: 35,
      isActive: true,
      cooldown: 240, // 4 minutes
    },
    {
      id: "color-sequence",
      name: "Color Sequence",
      description: "Remember and repeat the color pattern!",
      icon: <Sparkles className="w-6 h-6" />,
      category: "memory",
      difficulty: "hard",
      maxReward: 10.0,
      playCount: 2134,
      averageReward: 2.8,
      winRate: 25,
      isActive: true,
      cooldown: 900, // 15 minutes
    },
    {
      id: "fruit-slash",
      name: "Fruit Slash",
      description: "Slice fruits as they appear to earn SC!",
      icon: <Apple className="w-6 h-6" />,
      category: "skill",
      difficulty: "medium",
      maxReward: 7.0,
      playCount: 6789,
      averageReward: 1.9,
      winRate: 40,
      isActive: true,
      cooldown: 420, // 7 minutes
    },
    {
      id: "scratch-winner",
      name: "Scratch & Win",
      description: "Scratch off the surface to reveal prizes!",
      icon: <Star className="w-6 h-6" />,
      category: "cards",
      difficulty: "easy",
      maxReward: 15.0,
      playCount: 9876,
      averageReward: 3.2,
      winRate: 55,
      isActive: true,
      cooldown: 120, // 2 minutes
    },
    {
      id: "coin-flip",
      name: "Coin Flip Challenge",
      description: "Call heads or tails for instant rewards!",
      icon: <Coins className="w-6 h-6" />,
      category: "dice",
      difficulty: "easy",
      maxReward: 4.0,
      playCount: 15432,
      averageReward: 1.0,
      winRate: 50,
      isActive: true,
      cooldown: 60, // 1 minute
    },
    {
      id: "pattern-puzzle",
      name: "Pattern Puzzle",
      description: "Complete the pattern to unlock SC rewards!",
      icon: <Gem className="w-6 h-6" />,
      category: "puzzle",
      difficulty: "hard",
      maxReward: 12.0,
      playCount: 1234,
      averageReward: 3.5,
      winRate: 30,
      isActive: true,
      cooldown: 720, // 12 minutes
    },
    {
      id: "lightning-rounds",
      name: "Lightning Rounds",
      description: "Quick-fire mini challenges for fast SC!",
      icon: <Zap className="w-6 h-6" />,
      category: "skill",
      difficulty: "medium",
      maxReward: 9.0,
      playCount: 4567,
      averageReward: 2.3,
      winRate: 42,
      isActive: true,
      cooldown: 480, // 8 minutes
    },
  ];

  useEffect(() => {
    loadGameData();
    loadDailyChallenges();
    loadLeaderboard();
    
    const interval = setInterval(updateGameData, 10000);
    return () => {
      clearInterval(interval);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  const loadGameData = async () => {
    // Load user's game history and statistics
    try {
      // In production: const response = await fetch('/api/minigames/history');
      const mockResults: GameResult[] = [
        {
          gameId: "wheel-fortune",
          reward: 2.5,
          success: true,
          timestamp: new Date(Date.now() - 3600000),
          multiplier: 1.0,
          bonus: false,
        },
        {
          gameId: "lucky-dice",
          reward: 1.0,
          success: true,
          timestamp: new Date(Date.now() - 7200000),
          multiplier: 1.0,
          bonus: false,
        },
      ];
      
      setGameResults(mockResults);
      setTotalSCEarned(mockResults.reduce((sum, result) => sum + result.reward, 0));
      setCurrentStreak(3);
    } catch (error) {
      console.error("Error loading game data:", error);
    }
  };

  const loadDailyChallenges = async () => {
    const challenges: DailyChallenge[] = [
      {
        id: "daily-1",
        title: "Wheel Master",
        description: "Spin the Wheel of Fortune 5 times",
        gameId: "wheel-fortune",
        target: 5,
        progress: 2,
        reward: 10.0,
        completed: false,
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        id: "daily-2",
        title: "Memory Champion",
        description: "Complete Memory Match in under 20 moves",
        gameId: "memory-match",
        target: 1,
        progress: 0,
        reward: 15.0,
        completed: false,
        expiresAt: new Date(Date.now() + 86400000),
      },
      {
        id: "daily-3",
        title: "Streak Builder",
        description: "Win 3 mini games in a row",
        gameId: "all",
        target: 3,
        progress: 1,
        reward: 25.0,
        completed: false,
        expiresAt: new Date(Date.now() + 86400000),
      },
    ];
    
    setDailyChallenges(challenges);
  };

  const loadLeaderboard = async () => {
    const leaderboardData: LeaderboardEntry[] = [
      { rank: 1, username: "MiniGameMaster", score: 1250.50, gameId: "all", avatar: "👑", isToday: true },
      { rank: 2, username: "LuckySpinner", score: 892.25, gameId: "all", avatar: "🍀", isToday: true },
      { rank: 3, username: "MemoryKing", score: 734.75, gameId: "all", avatar: "🧠", isToday: true },
      { rank: 4, username: "DiceRoller", score: 623.40, gameId: "all", avatar: "🎲", isToday: false },
      { rank: 5, username: "PatternPro", score: 567.80, gameId: "all", avatar: "🎯", isToday: false },
    ];
    
    setLeaderboard(leaderboardData);
  };

  const updateGameData = () => {
    // Update real-time data like player counts, recent wins, etc.
    if (Math.random() > 0.7) {
      // Simulate other players winning
      console.log("Another player just won SC in mini games!");
    }
  };

  const canPlayGame = (gameId: string): boolean => {
    const game = miniGames.find(g => g.id === gameId);
    if (!game) return false;
    
    const lastPlayed = game.lastPlayed;
    if (!lastPlayed) return true;
    
    const timeDiff = Date.now() - lastPlayed.getTime();
    return timeDiff >= game.cooldown * 1000;
  };

  const playGame = async (gameId: string) => {
    if (!canPlayGame(gameId)) return;
    
    setActiveGame(gameId);
    
    switch (gameId) {
      case "wheel-fortune":
        playWheelOfFortune();
        break;
      case "lucky-dice":
        playLuckyDice();
        break;
      case "memory-match":
        playMemoryMatch();
        break;
      case "number-guess":
        playNumberGuess();
        break;
      case "color-sequence":
        playColorSequence();
        break;
      case "fruit-slash":
        playFruitSlash();
        break;
      case "scratch-winner":
        playScratchWin();
        break;
      case "coin-flip":
        playCoinFlip();
        break;
      case "pattern-puzzle":
        playPatternPuzzle();
        break;
      case "lightning-rounds":
        playLightningRounds();
        break;
    }
  };

  // Game Implementations
  const playWheelOfFortune = () => {
    if (wheelSpinning) return;
    
    setWheelSpinning(true);
    setWheelResult(null);
    
    setTimeout(() => {
      const segments = [0.1, 0.5, 1.0, 0.2, 2.0, 0.3, 5.0, 0.1, 1.5, 0.5];
      const result = segments[Math.floor(Math.random() * segments.length)];
      setWheelResult(result);
      setWheelSpinning(false);
      
      awardSC(result, "wheel-fortune");
    }, 3000);
  };

  const playLuckyDice = () => {
    if (diceRolling) return;
    
    setDiceRolling(true);
    
    setTimeout(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;
      
      setDiceValues([dice1, dice2]);
      setDiceRolling(false);
      
      const reward = total === diceTarget ? 3.0 : total === diceTarget - 1 || total === diceTarget + 1 ? 1.0 : 0;
      awardSC(reward, "lucky-dice");
    }, 2000);
  };

  const playMemoryMatch = () => {
    const symbols = ["🍎", "🍌", "🍒", "🍇", "🍋", "🍊", "🥝", "🍓"];
    const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    
    setMemoryCards(cards.map((symbol, index) => ({ id: index, symbol, flipped: false })));
    setFlippedCards([]);
    setMatchedCards(new Set());
    setMemoryMoves(0);
  };

  const flipMemoryCard = (cardIndex: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardIndex) || matchedCards.has(cardIndex)) return;
    
    const newFlipped = [...flippedCards, cardIndex];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [first, second] = newFlipped;
        if (memoryCards[first]?.symbol === memoryCards[second]?.symbol) {
          setMatchedCards(prev => new Set([...prev, first, second]));
          
          if (matchedCards.size + 2 === memoryCards.length) {
            const reward = memoryMoves < 15 ? 8.0 : memoryMoves < 25 ? 4.0 : 1.0;
            awardSC(reward, "memory-match");
          }
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  const playNumberGuess = () => {
    const target = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(target);
    setGuessAttempts(0);
    setGuessHistory([]);
    setGuessValue("");
  };

  const makeNumberGuess = () => {
    const guess = parseInt(guessValue);
    if (isNaN(guess) || guess < 1 || guess > 100) return;
    
    const attempts = guessAttempts + 1;
    setGuessAttempts(attempts);
    
    let hint = "";
    let reward = 0;
    
    if (guess === targetNumber) {
      hint = "🎉 Correct!";
      reward = attempts <= 5 ? 6.0 : attempts <= 10 ? 3.0 : 1.0;
      awardSC(reward, "number-guess");
    } else if (guess < targetNumber) {
      hint = "📈 Higher!";
    } else {
      hint = "📉 Lower!";
    }
    
    setGuessHistory(prev => [...prev, { guess, hint }]);
    setGuessValue("");
    
    if (attempts >= 10 && guess !== targetNumber) {
      setGuessHistory(prev => [...prev, { guess: targetNumber, hint: `Answer was ${targetNumber}` }]);
    }
  };

  const playColorSequence = () => {
    const colors = ["red", "blue", "green", "yellow"];
    const sequence = Array.from({ length: sequenceLevel }, () => 
      colors[Math.floor(Math.random() * colors.length)]
    );
    
    setColorSequence(sequence);
    setPlayerSequence([]);
    setShowingSequence(true);
    
    setTimeout(() => setShowingSequence(false), sequence.length * 800 + 1000);
  };

  const addColorToSequence = (color: string) => {
    if (showingSequence) return;
    
    const newSequence = [...playerSequence, color];
    setPlayerSequence(newSequence);
    
    if (newSequence.length === colorSequence.length) {
      const correct = newSequence.every((color, index) => color === colorSequence[index]);
      
      if (correct) {
        const reward = sequenceLevel * 2;
        awardSC(reward, "color-sequence");
        setSequenceLevel(prev => prev + 1);
        
        setTimeout(() => playColorSequence(), 1500);
      } else {
        setSequenceLevel(1);
        setTimeout(() => playColorSequence(), 1500);
      }
    }
  };

  const playFruitSlash = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setFruits([]);
    
    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameActive(false);
          clearInterval(gameTimer);
          
          const reward = score > 50 ? 7.0 : score > 30 ? 4.0 : score > 10 ? 2.0 : 0;
          awardSC(reward, "fruit-slash");
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const fruitTimer = setInterval(() => {
      if (!gameActive) {
        clearInterval(fruitTimer);
        return;
      }
      
      const newFruit = {
        id: Date.now(),
        type: ["🍎", "🍌", "🍒", "🍇", "🍋"][Math.floor(Math.random() * 5)],
        x: Math.random() * 300,
        y: 300,
        speed: Math.random() * 3 + 2,
      };
      
      setFruits(prev => [...prev, newFruit]);
      
      setTimeout(() => {
        setFruits(prev => prev.filter(f => f.id !== newFruit.id));
      }, 3000);
    }, 800);
    
    gameTimerRef.current = gameTimer;
  };

  const slashFruit = (fruitId: number) => {
    setFruits(prev => prev.filter(f => f.id !== fruitId));
    setScore(prev => prev + 1);
  };

  const playScratchWin = () => {
    const prizes = [0, 0, 0.5, 0, 1.0, 0, 2.0, 0, 15.0];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    awardSC(prize, "scratch-winner");
  };

  const playCoinFlip = () => {
    // Simple coin flip implementation
    const result = Math.random() > 0.5;
    const reward = result ? 2.0 : 0;
    awardSC(reward, "coin-flip");
  };

  const playPatternPuzzle = () => {
    // Complex pattern puzzle implementation
    const success = Math.random() > 0.7; // 30% success rate
    const reward = success ? 12.0 : 0;
    awardSC(reward, "pattern-puzzle");
  };

  const playLightningRounds = () => {
    // Quick mini challenges
    const challenges = 5;
    let completed = 0;
    
    // Simulate quick challenges
    for (let i = 0; i < challenges; i++) {
      if (Math.random() > 0.4) completed++;
    }
    
    const reward = (completed / challenges) * 9.0;
    awardSC(reward, "lightning-rounds");
  };

  const awardSC = async (amount: number, gameId: string) => {
    if (amount <= 0) return;
    
    const newResult: GameResult = {
      gameId,
      reward: amount,
      success: true,
      timestamp: new Date(),
      multiplier: 1.0,
      bonus: false,
    };
    
    setGameResults(prev => [newResult, ...prev.slice(0, 9)]);
    setTotalSCEarned(prev => prev + amount);
    
    // Track the win with analytics service
    if (user?.id) {
      await analyticsService.trackSCWin(user.id, amount, `Mini Game: ${gameId}`);
    }
    
    // Update daily challenges
    updateDailyChallenge(gameId);
    
    // Update user's balance (in production, this would be an API call)
    console.log(`Awarded ${amount} SC from ${gameId}`);
    
    if (soundEnabled) {
      // Play win sound
    }
  };

  const updateDailyChallenge = (gameId: string) => {
    setDailyChallenges(prev => prev.map(challenge => {
      if (challenge.gameId === gameId || challenge.gameId === "all") {
        const newProgress = challenge.progress + 1;
        const completed = newProgress >= challenge.target;
        
        if (completed && !challenge.completed) {
          awardSC(challenge.reward, "daily-challenge");
        }
        
        return {
          ...challenge,
          progress: Math.min(newProgress, challenge.target),
          completed,
        };
      }
      return challenge;
    }));
  };

  const collectDailyReward = () => {
    if (dailyRewardsCollected) return;
    
    const baseReward = 5.0;
    const streakBonus = currentStreak * 0.5;
    const totalReward = baseReward + streakBonus;
    
    awardSC(totalReward, "daily-bonus");
    setDailyRewardsCollected(true);
    setCurrentStreak(prev => prev + 1);
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const getRemainingCooldown = (gameId: string): number => {
    const game = miniGames.find(g => g.id === gameId);
    if (!game?.lastPlayed) return 0;
    
    const timeDiff = Date.now() - game.lastPlayed.getTime();
    const remaining = (game.cooldown * 1000) - timeDiff;
    return Math.max(0, Math.floor(remaining / 1000));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredGames = miniGames.filter(game => 
    selectedCategory === "all" || game.category === selectedCategory
  );

  const getDiceIcon = (value: number) => {
    const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
    const Icon = icons[value - 1];
    return <Icon className="w-8 h-8" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                Mini Games Arcade
                <Badge className="bg-purple-600 text-white">Free SC Rewards</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Play fun arcade games and earn free Sweeps Coins to use across the platform!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(totalSCEarned)} SC
                </div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  {currentStreak}
                </div>
                <div className="text-sm text-muted-foreground">Win Streak</div>
              </div>
              <Button
                onClick={collectDailyReward}
                disabled={dailyRewardsCollected}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Gift className="w-4 h-4 mr-2" />
                {dailyRewardsCollected ? "Collected" : "Daily Bonus"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Games Area */}
        <div className="lg:col-span-3">
          {/* Game Categories */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Game Categories</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Games</SelectItem>
                      <SelectItem value="wheel">Wheel</SelectItem>
                      <SelectItem value="dice">Dice</SelectItem>
                      <SelectItem value="cards">Cards</SelectItem>
                      <SelectItem value="memory">Memory</SelectItem>
                      <SelectItem value="skill">Skill</SelectItem>
                      <SelectItem value="puzzle">Puzzle</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {filteredGames.map(game => {
                  const cooldownRemaining = getRemainingCooldown(game.id);
                  const canPlay = canPlayGame(game.id);
                  
                  return (
                    <Card 
                      key={game.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        canPlay 
                          ? 'hover:shadow-lg hover:shadow-purple-500/20 border-border hover:border-purple-500/50'
                          : 'opacity-60'
                      }`}
                      onClick={() => canPlay && playGame(game.id)}
                    >
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                            canPlay 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {game.icon}
                          </div>
                          <h3 className="font-bold mb-1">{game.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3 h-8">
                            {game.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span>Max Reward:</span>
                              <span className="font-bold text-purple-500">{formatCurrency(game.maxReward)} SC</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Win Rate:</span>
                              <span className="font-bold text-green-500">{game.winRate}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span>Difficulty:</span>
                              <Badge className={`text-xs ${
                                game.difficulty === "easy" ? "bg-green-500" :
                                game.difficulty === "medium" ? "bg-yellow-500" :
                                "bg-red-500"
                              }`}>
                                {game.difficulty}
                              </Badge>
                            </div>
                          </div>
                          
                          {!canPlay && cooldownRemaining > 0 && (
                            <div className="mt-3 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatTime(cooldownRemaining)}
                            </div>
                          )}
                          
                          <Button 
                            className={`w-full mt-3 ${
                              canPlay 
                                ? 'bg-purple-500 hover:bg-purple-600'
                                : 'bg-muted'
                            }`}
                            disabled={!canPlay}
                            size="sm"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            {canPlay ? 'Play Now' : 'Cooldown'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Game */}
          {activeGame && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {miniGames.find(g => g.id === activeGame)?.name}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setActiveGame(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Wheel of Fortune Game */}
                {activeGame === "wheel-fortune" && (
                  <div className="text-center">
                    <div className={`w-64 h-64 mx-auto mb-6 rounded-full border-8 border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center ${
                      wheelSpinning ? 'animate-spin' : ''
                    }`}>
                      <div className="text-4xl font-bold text-white">
                        {wheelResult !== null ? `${wheelResult} SC` : '🎰'}
                      </div>
                    </div>
                    
                    <Button
                      onClick={playWheelOfFortune}
                      disabled={wheelSpinning}
                      className="bg-purple-500 hover:bg-purple-600"
                      size="lg"
                    >
                      {wheelSpinning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                      {wheelSpinning ? 'Spinning...' : 'Spin Wheel'}
                    </Button>
                  </div>
                )}

                {/* Lucky Dice Game */}
                {activeGame === "lucky-dice" && (
                  <div className="text-center">
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4">Target Sum: {diceTarget}</h3>
                      <div className="flex justify-center gap-4 mb-6">
                        {diceValues.map((value, index) => (
                          <div key={index} className={`w-20 h-20 border-2 border-purple-500 rounded-lg flex items-center justify-center bg-white ${
                            diceRolling ? 'animate-bounce' : ''
                          }`}>
                            {getDiceIcon(value)}
                          </div>
                        ))}
                      </div>
                      <div className="text-xl font-bold mb-4">
                        Total: {diceValues[0] + diceValues[1]}
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2 mb-4">
                      {[5, 6, 7, 8, 9].map(target => (
                        <Button
                          key={target}
                          variant={diceTarget === target ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDiceTarget(target)}
                          disabled={diceRolling}
                        >
                          {target}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      onClick={playLuckyDice}
                      disabled={diceRolling}
                      className="bg-purple-500 hover:bg-purple-600"
                      size="lg"
                    >
                      {diceRolling ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Dice1 className="w-4 h-4 mr-2" />}
                      {diceRolling ? 'Rolling...' : 'Roll Dice'}
                    </Button>
                  </div>
                )}

                {/* Memory Match Game */}
                {activeGame === "memory-match" && (
                  <div className="text-center">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold">Moves: {memoryMoves}</h3>
                    </div>
                    
                    {memoryCards.length === 0 ? (
                      <Button onClick={playMemoryMatch} className="bg-purple-500 hover:bg-purple-600">
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                        {memoryCards.map((card, index) => (
                          <Button
                            key={index}
                            className={`h-16 text-2xl ${
                              flippedCards.includes(index) || matchedCards.has(index)
                                ? 'bg-white text-black border-2 border-purple-500'
                                : 'bg-purple-500 hover:bg-purple-600'
                            }`}
                            onClick={() => flipMemoryCard(index)}
                            disabled={flippedCards.includes(index) || matchedCards.has(index)}
                          >
                            {flippedCards.includes(index) || matchedCards.has(index) 
                              ? card.symbol 
                              : '?'
                            }
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Number Guess Game */}
                {activeGame === "number-guess" && (
                  <div className="text-center max-w-md mx-auto">
                    <h3 className="text-lg font-bold mb-4">Guess the number (1-100)</h3>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Attempts: {guessAttempts}/10</p>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={guessValue}
                          onChange={(e) => setGuessValue(e.target.value)}
                          placeholder="Enter your guess"
                          className="flex-1"
                        />
                        <Button onClick={makeNumberGuess} disabled={!guessValue}>
                          Guess
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      {guessHistory.map((entry, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Guess {index + 1}: {entry.guess}</span>
                          <span>{entry.hint}</span>
                        </div>
                      ))}
                    </div>
                    
                    {targetNumber === 0 && (
                      <Button onClick={playNumberGuess} className="mt-4 bg-purple-500 hover:bg-purple-600">
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    )}
                  </div>
                )}

                {/* Fruit Slash Game */}
                {activeGame === "fruit-slash" && (
                  <div className="text-center">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-lg font-bold">Score: {score}</div>
                      <div className="text-lg font-bold">Time: {timeLeft}s</div>
                    </div>
                    
                    {!gameActive && timeLeft === 30 ? (
                      <Button onClick={playFruitSlash} className="bg-purple-500 hover:bg-purple-600">
                        <Play className="w-4 h-4 mr-2" />
                        Start Game
                      </Button>
                    ) : (
                      <div className="relative w-full h-64 border border-purple-500 rounded-lg overflow-hidden">
                        {fruits.map(fruit => (
                          <div
                            key={fruit.id}
                            className="absolute cursor-pointer text-4xl hover:scale-110 transition-transform"
                            style={{
                              left: `${fruit.x}px`,
                              top: `${fruit.y - (Date.now() - fruit.id) * fruit.speed / 50}px`
                            }}
                            onClick={() => slashFruit(fruit.id)}
                          >
                            {fruit.type}
                          </div>
                        ))}
                        
                        {!gameActive && timeLeft === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                            <div className="text-center">
                              <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                              <p>Final Score: {score}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Wins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-500" />
                Recent Wins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gameResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">
                        {miniGames.find(g => g.id === result.gameId)?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-green-500 font-bold">
                      +{formatCurrency(result.reward)} SC
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Daily Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyChallenges.map(challenge => (
                  <div key={challenge.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{challenge.title}</div>
                      {challenge.completed && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <Progress 
                        value={(challenge.progress / challenge.target) * 100} 
                        className="flex-1 mr-2"
                      />
                      <span>{challenge.progress}/{challenge.target}</span>
                    </div>
                    <div className="text-xs text-purple-500 font-bold mt-1">
                      Reward: {formatCurrency(challenge.reward)} SC
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Top Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div key={entry.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        entry.rank === 1 ? "bg-gold-500 text-black" :
                        entry.rank === 2 ? "bg-gray-400 text-white" :
                        entry.rank === 3 ? "bg-orange-600 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1">
                          {entry.username}
                          {entry.isToday && <Badge className="text-xs bg-green-500">Today</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="text-purple-500 font-bold text-sm">
                      {formatCurrency(entry.score)} SC
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
