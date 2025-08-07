import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Gamepad2,
  Crown,
  Coins,
  DollarSign,
  Star,
  Trophy,
  Zap,
  Target,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Spade,
  Heart,
  Club,
  Diamond,
  Play,
  Pause,
  RefreshCw,
  Settings,
  TrendingUp,
  Gift,
  Sparkles,
  RotateCcw,
  Flame,
  Shuffle,
  Calendar,
  Users,
  BarChart3,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { walletService } from '../../services/walletService';
import { jackpotService } from '../../services/jackpotService';
import { useToast } from '@/hooks/use-toast';

interface SlotMachine {
  id: string;
  name: string;
  theme: string;
  reels: number;
  rows: number;
  paylines: number;
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  jackpot: number;
  features: string[];
  thumbnail: string;
  symbols: SlotSymbol[];
  isActive: boolean;
  popularity: number;
}

interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  value: number;
  rarity: number;
  isWild?: boolean;
  isScatter?: boolean;
  multiplier?: number;
}

interface MiniGame {
  id: string;
  name: string;
  description: string;
  type: 'scratch' | 'dice' | 'wheel' | 'card' | 'number';
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  rtp: number;
  maxWin: number;
  thumbnail: string;
  isActive: boolean;
  rules: string[];
  quickPlay: boolean;
}

interface GameSession {
  gameId: string;
  userId: string;
  gameType: 'slot' | 'mini';
  startTime: Date;
  totalBet: number;
  totalWin: number;
  spins: number;
  biggestWin: number;
  currency: 'GC' | 'SC';
  isActive: boolean;
}

interface GameResult {
  success: boolean;
  symbols?: string[];
  winAmount: number;
  winlines?: number[];
  bonusTriggered: boolean;
  freeSpinsWon?: number;
  multiplier?: number;
  jackpotWon?: boolean;
  message: string;
}

export default function InHouseCasino() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [slotMachines] = useState<SlotMachine[]>([
    {
      id: 'diamond_deluxe',
      name: 'Diamond Deluxe',
      theme: 'Luxury',
      reels: 5,
      rows: 3,
      paylines: 25,
      minBet: { GC: 25, SC: 0.25 },
      maxBet: { GC: 2500, SC: 25 },
      rtp: 96.8,
      volatility: 'high',
      jackpot: 15750.50,
      features: ['Wild Symbols', 'Free Spins', 'Progressive Jackpot', 'Multipliers'],
      thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
      symbols: [
        { id: 'diamond', name: 'Diamond', icon: '💎', value: 1000, rarity: 5, isWild: true, multiplier: 2 },
        { id: 'crown', name: 'Crown', icon: '👑', value: 500, rarity: 10, isScatter: true },
        { id: 'ruby', name: 'Ruby', icon: '♦️', value: 250, rarity: 15 },
        { id: 'emerald', name: 'Emerald', icon: '💚', value: 150, rarity: 20 },
        { id: 'gold', name: 'Gold Bar', icon: '🟨', value: 100, rarity: 25 },
        { id: 'seven', name: 'Lucky Seven', icon: '7️⃣', value: 75, rarity: 30 }
      ],
      isActive: true,
      popularity: 95
    },
    {
      id: 'wild_west_gold',
      name: 'Wild West Gold',
      theme: 'Western',
      reels: 5,
      rows: 4,
      paylines: 40,
      minBet: { GC: 40, SC: 0.40 },
      maxBet: { GC: 4000, SC: 40 },
      rtp: 96.5,
      volatility: 'medium',
      jackpot: 8920.25,
      features: ['Expanding Wilds', 'Bonus Game', 'Free Spins', 'Cascading Reels'],
      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop',
      symbols: [
        { id: 'sheriff', name: 'Sheriff', icon: '🤠', value: 800, rarity: 8, isWild: true },
        { id: 'horse', name: 'Horse', icon: '🐎', value: 400, rarity: 12, isScatter: true },
        { id: 'gun', name: 'Gun', icon: '🔫', value: 200, rarity: 18 },
        { id: 'boot', name: 'Cowboy Boot', icon: '👢', value: 150, rarity: 22 },
        { id: 'hat', name: 'Cowboy Hat', icon: '🎩', value: 100, rarity: 28 },
        { id: 'cactus', name: 'Cactus', icon: '🌵', value: 50, rarity: 35 }
      ],
      isActive: true,
      popularity: 88
    },
    {
      id: 'egyptian_treasure',
      name: 'Egyptian Treasure',
      theme: 'Ancient',
      reels: 5,
      rows: 3,
      paylines: 20,
      minBet: { GC: 20, SC: 0.20 },
      maxBet: { GC: 2000, SC: 20 },
      rtp: 96.2,
      volatility: 'medium',
      jackpot: 5430.75,
      features: ['Mystery Symbols', 'Free Spins', 'Pick Bonus', 'Gamble Feature'],
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      symbols: [
        { id: 'pharaoh', name: 'Pharaoh', icon: '👨‍💼', value: 600, rarity: 10, isWild: true },
        { id: 'pyramid', name: 'Pyramid', icon: '🔺', value: 300, rarity: 15, isScatter: true },
        { id: 'ankh', name: 'Ankh', icon: '☥', value: 200, rarity: 20 },
        { id: 'eye', name: 'Eye of Horus', icon: '👁️', value: 150, rarity: 25 },
        { id: 'scarab', name: 'Scarab', icon: '🪲', value: 100, rarity: 30 },
        { id: 'hieroglyph', name: 'Hieroglyph', icon: '𓂀', value: 75, rarity: 35 }
      ],
      isActive: true,
      popularity: 82
    }
  ]);

  const [miniGames] = useState<MiniGame[]>([
    {
      id: 'lucky_scratch',
      name: 'Lucky Scratch',
      description: 'Scratch off panels to reveal prizes',
      type: 'scratch',
      minBet: { GC: 10, SC: 0.10 },
      maxBet: { GC: 100, SC: 1 },
      rtp: 75.0,
      maxWin: 5000,
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      isActive: true,
      rules: [
        'Scratch off 3 panels',
        'Match 3 symbols to win',
        'Special symbols multiply winnings',
        'Instant win with crown symbol'
      ],
      quickPlay: true
    },
    {
      id: 'dice_master',
      name: 'Dice Master',
      description: 'Roll dice and predict the outcome',
      type: 'dice',
      minBet: { GC: 5, SC: 0.05 },
      maxBet: { GC: 500, SC: 5 },
      rtp: 94.0,
      maxWin: 10000,
      thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=200&fit=crop',
      isActive: true,
      rules: [
        'Choose your bet type',
        'Predict the dice outcome',
        'Higher risk = higher reward',
        'Special combinations pay extra'
      ],
      quickPlay: true
    },
    {
      id: 'fortune_wheel',
      name: 'Fortune Wheel',
      description: 'Spin the wheel of fortune',
      type: 'wheel',
      minBet: { GC: 15, SC: 0.15 },
      maxBet: { GC: 1500, SC: 15 },
      rtp: 90.0,
      maxWin: 25000,
      thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
      isActive: true,
      rules: [
        'Place your bet',
        'Spin the wheel',
        'Land on your chosen section',
        'Bonus rounds available'
      ],
      quickPlay: false
    },
    {
      id: 'card_flip',
      name: 'Card Flip',
      description: 'Flip cards to find matching pairs',
      type: 'card',
      minBet: { GC: 20, SC: 0.20 },
      maxBet: { GC: 200, SC: 2 },
      rtp: 85.0,
      maxWin: 2000,
      thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=300&h=200&fit=crop',
      isActive: true,
      rules: [
        'Flip cards one by one',
        'Find matching pairs',
        'Complete all pairs to win',
        'Bonus for speed completion'
      ],
      quickPlay: true
    },
    {
      id: 'number_guess',
      name: 'Number Guess',
      description: 'Guess the lucky number',
      type: 'number',
      minBet: { GC: 1, SC: 0.01 },
      maxBet: { GC: 50, SC: 0.50 },
      rtp: 98.0,
      maxWin: 5000,
      thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
      isActive: true,
      rules: [
        'Choose a number 1-100',
        'Closer guess = higher payout',
        'Exact match = maximum win',
        'Multiple attempts allowed'
      ],
      quickPlay: true
    }
  ]);

  const [currentGame, setCurrentGame] = useState<SlotMachine | MiniGame | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [betAmount, setBetAmount] = useState(25);
  const [selectedCurrency, setSelectedCurrency] = useState<'GC' | 'SC'>('GC');
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlaySpins, setAutoPlaySpins] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showGameDialog, setShowGameDialog] = useState(false);

  // Slot game state
  const [slotReels, setSlotReels] = useState<string[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningLines, setWinningLines] = useState<number[]>([]);

  // Mini game state
  const [scratchPanels, setScratchPanels] = useState<boolean[]>([]);
  const [diceValues, setDiceValues] = useState<number[]>([]);
  const [wheelPosition, setWheelPosition] = useState(0);
  const [cardPositions, setCardPositions] = useState<string[]>([]);

  useEffect(() => {
    if (currentGame && 'reels' in currentGame) {
      initializeSlotReels(currentGame);
    }
  }, [currentGame]);

  const initializeSlotReels = (slot: SlotMachine) => {
    const reels: string[][] = [];
    for (let i = 0; i < slot.reels; i++) {
      const reel: string[] = [];
      for (let j = 0; j < slot.rows; j++) {
        const randomSymbol = slot.symbols[Math.floor(Math.random() * slot.symbols.length)];
        reel.push(randomSymbol.icon);
      }
      reels.push(reel);
    }
    setSlotReels(reels);
  };

  const startGameSession = async (game: SlotMachine | MiniGame) => {
    const session: GameSession = {
      gameId: game.id,
      userId: user?.id || 'guest',
      gameType: 'reels' in game ? 'slot' : 'mini',
      startTime: new Date(),
      totalBet: 0,
      totalWin: 0,
      spins: 0,
      biggestWin: 0,
      currency: selectedCurrency,
      isActive: true
    };
    
    setGameSession(session);
    setCurrentGame(game);
    setShowGameDialog(true);
    
    toast({
      title: "Game Started",
      description: `Starting ${game.name}. Good luck!`,
    });
  };

  const playSlot = async () => {
    if (!currentGame || !('reels' in currentGame) || isSpinning) return;
    
    const slot = currentGame as SlotMachine;
    
    // Check balance
    const balance = await walletService.getBalance(user?.id || 'guest', selectedCurrency);
    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${betAmount} ${selectedCurrency} to play`,
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    
    try {
      // Deduct bet
      await walletService.deductBalance(user?.id || 'guest', betAmount, selectedCurrency);
      
      // Simulate spinning
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate result
      const result = generateSlotResult(slot);
      setGameResult(result);
      
      // Update reels with result
      if (result.symbols) {
        const newReels: string[][] = [];
        for (let i = 0; i < slot.reels; i++) {
          const reel: string[] = [];
          for (let j = 0; j < slot.rows; j++) {
            const symbolIndex = i * slot.rows + j;
            reel.push(result.symbols[symbolIndex] || slot.symbols[0].icon);
          }
          newReels.push(reel);
        }
        setSlotReels(newReels);
      }
      
      // Award winnings
      if (result.winAmount > 0) {
        await walletService.addBalance(user?.id || 'guest', result.winAmount, selectedCurrency);
        
        // Check for jackpot contribution
        if (result.jackpotWon) {
          await jackpotService.checkJackpotWin(slot.id, user?.id || 'guest', result, betAmount, selectedCurrency);
        } else {
          await jackpotService.contributeToJackpot(slot.id, user?.id || 'guest', betAmount, selectedCurrency);
        }
      }
      
      // Update session
      if (gameSession) {
        setGameSession({
          ...gameSession,
          totalBet: gameSession.totalBet + betAmount,
          totalWin: gameSession.totalWin + result.winAmount,
          spins: gameSession.spins + 1,
          biggestWin: Math.max(gameSession.biggestWin, result.winAmount)
        });
      }
      
      toast({
        title: result.winAmount > 0 ? "Winner!" : "Try Again!",
        description: result.message,
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "Game Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  const playMiniGame = async (gameType: string) => {
    if (!currentGame || 'reels' in currentGame) return;
    
    const miniGame = currentGame as MiniGame;
    
    // Check balance
    const balance = await walletService.getBalance(user?.id || 'guest', selectedCurrency);
    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: `You need at least ${betAmount} ${selectedCurrency} to play`,
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    
    try {
      // Deduct bet
      await walletService.deductBalance(user?.id || 'guest', betAmount, selectedCurrency);
      
      let result: GameResult;
      
      switch (gameType) {
        case 'scratch':
          result = await playScratchGame(miniGame);
          break;
        case 'dice':
          result = await playDiceGame(miniGame);
          break;
        case 'wheel':
          result = await playWheelGame(miniGame);
          break;
        case 'card':
          result = await playCardGame(miniGame);
          break;
        case 'number':
          result = await playNumberGame(miniGame);
          break;
        default:
          throw new Error('Unknown game type');
      }
      
      setGameResult(result);
      
      // Award winnings
      if (result.winAmount > 0) {
        await walletService.addBalance(user?.id || 'guest', result.winAmount, selectedCurrency);
      }
      
      // Update session
      if (gameSession) {
        setGameSession({
          ...gameSession,
          totalBet: gameSession.totalBet + betAmount,
          totalWin: gameSession.totalWin + result.winAmount,
          spins: gameSession.spins + 1,
          biggestWin: Math.max(gameSession.biggestWin, result.winAmount)
        });
      }
      
      toast({
        title: result.winAmount > 0 ? "Winner!" : "Try Again!",
        description: result.message,
        duration: 3000,
      });
      
    } catch (error) {
      toast({
        title: "Game Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlaying(false);
    }
  };

  const generateSlotResult = (slot: SlotMachine): GameResult => {
    const symbols: string[] = [];
    const totalPositions = slot.reels * slot.rows;
    
    // Generate random symbols based on rarity
    for (let i = 0; i < totalPositions; i++) {
      const rand = Math.random() * 100;
      let cumulativeRarity = 0;
      
      for (const symbol of slot.symbols) {
        cumulativeRarity += symbol.rarity;
        if (rand <= cumulativeRarity) {
          symbols.push(symbol.icon);
          break;
        }
      }
    }
    
    // Check for wins (simplified logic)
    const winAmount = calculateSlotWin(symbols, slot);
    const jackpotWon = winAmount > slot.jackpot * 0.8; // 80% of jackpot triggers win
    
    return {
      success: winAmount > 0,
      symbols,
      winAmount,
      winlines: winAmount > 0 ? [1, 2, 3] : [],
      bonusTriggered: Math.random() < 0.1, // 10% bonus chance
      freeSpinsWon: Math.random() < 0.05 ? Math.floor(Math.random() * 10) + 5 : 0,
      multiplier: winAmount > 0 ? Math.floor(Math.random() * 3) + 1 : 1,
      jackpotWon,
      message: jackpotWon ? "🎉 JACKPOT WON! 🎉" : 
               winAmount > 0 ? `You won ${winAmount} ${selectedCurrency}!` : 
               "Better luck next time!"
    };
  };

  const calculateSlotWin = (symbols: string[], slot: SlotMachine): number => {
    // Simplified win calculation
    const symbolCounts: { [key: string]: number } = {};
    
    symbols.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });
    
    let totalWin = 0;
    
    Object.entries(symbolCounts).forEach(([symbol, count]) => {
      if (count >= 3) {
        const symbolData = slot.symbols.find(s => s.icon === symbol);
        if (symbolData) {
          totalWin += symbolData.value * count * (betAmount / 100);
        }
      }
    });
    
    return Math.floor(totalWin);
  };

  const playScratchGame = async (game: MiniGame): Promise<GameResult> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const winChance = game.rtp / 100;
    const won = Math.random() < winChance;
    const winAmount = won ? Math.floor(Math.random() * game.maxWin * 0.1) + betAmount : 0;
    
    setScratchPanels([true, true, true]); // Reveal all panels
    
    return {
      success: won,
      winAmount,
      bonusTriggered: false,
      message: won ? `Scratch win: ${winAmount} ${selectedCurrency}!` : "No match this time!"
    };
  };

  const playDiceGame = async (game: MiniGame): Promise<GameResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ];
    
    setDiceValues(dice);
    
    const sum = dice.reduce((a, b) => a + b, 0);
    const won = sum >= 7; // Simple win condition
    const winAmount = won ? betAmount * (sum >= 11 ? 5 : 2) : 0;
    
    return {
      success: won,
      winAmount,
      bonusTriggered: sum === 12, // Double 6 bonus
      message: `Dice rolled: ${dice.join(', ')} (${sum}). ${won ? `Won ${winAmount} ${selectedCurrency}!` : 'Try again!'}`
    };
  };

  const playWheelGame = async (game: MiniGame): Promise<GameResult> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const position = Math.floor(Math.random() * 36); // 36 segments
    setWheelPosition(position);
    
    const won = position % 3 === 0; // Every 3rd segment wins
    const multiplier = position === 0 ? 10 : position % 6 === 0 ? 5 : 2;
    const winAmount = won ? betAmount * multiplier : 0;
    
    return {
      success: won,
      winAmount,
      bonusTriggered: position === 0,
      message: `Wheel stopped at ${position}. ${won ? `Won ${winAmount} ${selectedCurrency}!` : 'Spin again!'}`
    };
  };

  const playCardGame = async (game: MiniGame): Promise<GameResult> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const cards = ['♠️', '♥️', '♣️', '♦️', '♠️', '♥️', '♣️', '♦️'];
    const shuffled = cards.sort(() => Math.random() - 0.5);
    setCardPositions(shuffled);
    
    const pairs = shuffled.filter((card, index) => shuffled.indexOf(card) !== index);
    const won = pairs.length >= 2;
    const winAmount = won ? betAmount * pairs.length : 0;
    
    return {
      success: won,
      winAmount,
      bonusTriggered: pairs.length >= 4,
      message: `Found ${pairs.length} pairs. ${won ? `Won ${winAmount} ${selectedCurrency}!` : 'Try again!'}`
    };
  };

  const playNumberGame = async (game: MiniGame): Promise<GameResult> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const luckyNumber = Math.floor(Math.random() * 100) + 1;
    const guessedNumber = Math.floor(Math.random() * 100) + 1; // Simulate user guess
    const difference = Math.abs(luckyNumber - guessedNumber);
    
    const won = difference <= 10; // Within 10 numbers
    const multiplier = difference <= 5 ? 10 : difference <= 10 ? 5 : 1;
    const winAmount = won ? betAmount * multiplier : 0;
    
    return {
      success: won,
      winAmount,
      bonusTriggered: difference === 0,
      message: `Lucky: ${luckyNumber}, Guess: ${guessedNumber}. ${won ? `Won ${winAmount} ${selectedCurrency}!` : 'Keep trying!'}`
    };
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getGameIcon = (type: string) => {
    switch (type) {
      case 'scratch': return <Star className="w-4 h-4" />;
      case 'dice': return <Dice1 className="w-4 h-4" />;
      case 'wheel': return <RotateCcw className="w-4 h-4" />;
      case 'card': return <Spade className="w-4 h-4" />;
      case 'number': return <Target className="w-4 h-4" />;
      default: return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
          CoinKrazy Casino
        </h1>
        <p className="text-lg text-muted-foreground">
          Premium in-house slots and mini games with real-time jackpots
        </p>
      </div>

      {/* Currency Selection */}
      <Card className="max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={selectedCurrency === 'GC' ? 'default' : 'outline'}
              onClick={() => setSelectedCurrency('GC')}
              className="flex items-center gap-2"
            >
              <Coins className="w-4 h-4" />
              Gold Coins
            </Button>
            <Button
              variant={selectedCurrency === 'SC' ? 'default' : 'outline'}
              onClick={() => setSelectedCurrency('SC')}
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Sweep Coins
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="slots" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="slots">Slot Machines</TabsTrigger>
          <TabsTrigger value="mini">Mini Games</TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slotMachines.map((slot) => (
              <Card key={slot.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative">
                  <img
                    src={slot.thumbnail}
                    alt={slot.name}
                    className="aspect-video w-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                    <Button
                      size="lg"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => startGameSession(slot)}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Play Now
                    </Button>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <Badge className={`${slot.volatility === 'high' ? 'bg-red-500' : 
                                        slot.volatility === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {slot.volatility} volatility
                    </Badge>
                  </div>
                  
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-purple-500">
                      <Crown className="w-3 h-3 mr-1" />
                      {formatCurrency(slot.jackpot, selectedCurrency)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg">{slot.name}</h3>
                      <p className="text-sm text-muted-foreground">{slot.theme} • {slot.paylines} paylines</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>RTP: {slot.rtp}%</span>
                      <span>Max Win: {slot.maxWin}x</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {slot.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span>Min: {formatCurrency(slot.minBet[selectedCurrency], selectedCurrency)}</span>
                      <span>Max: {formatCurrency(slot.maxBet[selectedCurrency], selectedCurrency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mini" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniGames.map((game) => (
              <Card key={game.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <div className="relative">
                  <img
                    src={game.thumbnail}
                    alt={game.name}
                    className="aspect-video w-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                    <Button
                      size="lg"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      onClick={() => startGameSession(game)}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Play Now
                    </Button>
                  </div>
                  
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-blue-500">
                      {getGameIcon(game.type)}
                      <span className="ml-1 capitalize">{game.type}</span>
                    </Badge>
                  </div>
                  
                  {game.quickPlay && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500">
                        <Zap className="w-3 h-3 mr-1" />
                        Quick Play
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg">{game.name}</h3>
                      <p className="text-sm text-muted-foreground">{game.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>RTP: {game.rtp}%</span>
                      <span>Max Win: {formatCurrency(game.maxWin, selectedCurrency)}</span>
                    </div>
                    
                    <div className="space-y-1">
                      {game.rules.slice(0, 2).map((rule, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-muted-foreground">{rule}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span>Min: {formatCurrency(game.minBet[selectedCurrency], selectedCurrency)}</span>
                      <span>Max: {formatCurrency(game.maxBet[selectedCurrency], selectedCurrency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Game Dialog */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentGame?.name}</DialogTitle>
            <DialogDescription>
              {currentGame && 'theme' in currentGame 
                ? `${currentGame.theme} themed slot with ${currentGame.paylines} paylines`
                : currentGame?.description
              }
            </DialogDescription>
          </DialogHeader>

          {currentGame && (
            <div className="space-y-6">
              {/* Game Interface */}
              {'reels' in currentGame ? (
                // Slot Machine Interface
                <div className="space-y-4">
                  <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-lg">
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {slotReels.map((reel, reelIndex) => (
                        <div key={reelIndex} className="space-y-2">
                          {reel.map((symbol, symbolIndex) => (
                            <div
                              key={symbolIndex}
                              className={`w-16 h-16 bg-white rounded flex items-center justify-center text-2xl ${
                                isSpinning ? 'animate-pulse' : ''
                              }`}
                            >
                              {symbol}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    
                    {gameResult && (
                      <div className="text-center p-4 bg-gray-700 rounded mb-4">
                        <p className="text-white font-bold">{gameResult.message}</p>
                        {gameResult.winAmount > 0 && (
                          <p className="text-green-400">
                            Won: {formatCurrency(gameResult.winAmount, selectedCurrency)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label>Bet:</Label>
                      <Input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        min={currentGame.minBet[selectedCurrency]}
                        max={currentGame.maxBet[selectedCurrency]}
                        className="w-24"
                      />
                      <span className="text-sm">{selectedCurrency}</span>
                    </div>
                    
                    <Button
                      onClick={playSlot}
                      disabled={isSpinning}
                      className="bg-gradient-to-r from-purple-500 to-gold-500 hover:from-purple-600 hover:to-gold-600"
                    >
                      {isSpinning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Spinning...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Spin
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // Mini Game Interface
                <div className="space-y-4">
                  <div className="bg-gradient-to-b from-blue-900 to-blue-800 p-6 rounded-lg text-center">
                    <div className="text-4xl mb-4">
                      {currentGame.type === 'scratch' && '🎫'}
                      {currentGame.type === 'dice' && '🎲'}
                      {currentGame.type === 'wheel' && '🎡'}
                      {currentGame.type === 'card' && '🃏'}
                      {currentGame.type === 'number' && '🔢'}
                    </div>
                    
                    {gameResult && (
                      <div className="p-4 bg-blue-700 rounded mb-4">
                        <p className="text-white font-bold">{gameResult.message}</p>
                        {gameResult.winAmount > 0 && (
                          <p className="text-green-400">
                            Won: {formatCurrency(gameResult.winAmount, selectedCurrency)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label>Bet:</Label>
                      <Input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        min={currentGame.minBet[selectedCurrency]}
                        max={currentGame.maxBet[selectedCurrency]}
                        className="w-24"
                      />
                      <span className="text-sm">{selectedCurrency}</span>
                    </div>
                    
                    <Button
                      onClick={() => playMiniGame(currentGame.type)}
                      disabled={isPlaying}
                      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                    >
                      {isPlaying ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Game Session Stats */}
              {gameSession && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-bold">{gameSession.spins}</div>
                        <div className="text-muted-foreground">Spins/Plays</div>
                      </div>
                      <div>
                        <div className="font-bold">{formatCurrency(gameSession.totalBet, selectedCurrency)}</div>
                        <div className="text-muted-foreground">Total Bet</div>
                      </div>
                      <div>
                        <div className="font-bold">{formatCurrency(gameSession.totalWin, selectedCurrency)}</div>
                        <div className="text-muted-foreground">Total Win</div>
                      </div>
                      <div>
                        <div className="font-bold">{formatCurrency(gameSession.biggestWin, selectedCurrency)}</div>
                        <div className="text-muted-foreground">Biggest Win</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGameDialog(false)}>
              Exit Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
