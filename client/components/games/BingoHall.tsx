import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
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
  Target,
  Trophy,
  Users,
  Crown,
  Star,
  Zap,
  MessageCircle,
  Send,
  Volume2,
  VolumeX,
  Settings,
  Gift,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Heart,
  Award,
  TrendingUp,
  BarChart3,
  Clock,
  Coins,
  DollarSign,
  CheckCircle,
  Circle,
  Square,
  Shuffle,
  Grid3X3,
  MousePointer,
  Sparkles,
  Bell,
  AlertTriangle,
  Info,
  RefreshCw,
  Plus,
  Minus,
  X,
  Home,
  Megaphone,
  Music,
  Palette,
  User,
  UserPlus,
  Gamepad2,
  Calendar,
  Map,
  Filter,
  Search,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Bingo Types
interface BingoCard {
  id: string;
  type: "75-ball" | "90-ball";
  numbers: (number | null)[][];
  markedNumbers: Set<number>;
  cost: number;
  autoMark: boolean;
  active: boolean;
}

interface BingoPattern {
  id: string;
  name: string;
  description: string;
  pattern: boolean[][];
  payout: number;
  difficulty: "easy" | "medium" | "hard";
  special: boolean;
}

interface BingoRoom {
  id: string;
  name: string;
  type: "75-ball" | "90-ball";
  maxPlayers: number;
  currentPlayers: number;
  cardCost: number;
  gameStatus: "waiting" | "playing" | "finished";
  nextGame: Date;
  jackpot: number;
  progressiveJackpot: number;
  patterns: BingoPattern[];
  currentPattern: BingoPattern;
  calledNumbers: number[];
  gameNumber: number;
  isVIP: boolean;
  theme: string;
}

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: "player" | "moderator" | "system" | "winner";
  avatar?: string;
}

interface Player {
  id: string;
  username: string;
  avatar: string;
  cards: number;
  wins: number;
  isVIP: boolean;
  online: boolean;
  status: "playing" | "winner" | "waiting";
}

interface BingoGameStats {
  gamesPlayed: number;
  totalWins: number;
  biggestWin: number;
  favoritePattern: string;
  winRate: number;
  currentStreak: number;
  lastWin: Date | null;
  totalSpent: number;
  netWinnings: number;
}

export default function BingoHall() {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<string>("golden-75");
  const [rooms, setRooms] = useState<BingoRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<BingoRoom | null>(null);
  const [playerCards, setPlayerCards] = useState<BingoCard[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [playersInRoom, setPlayersInRoom] = useState<Player[]>([]);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [gameStats, setGameStats] = useState<BingoGameStats | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMarkEnabled, setAutoMarkEnabled] = useState(true);
  const [chatFilter, setChatFilter] = useState("all");
  const [selectedCard, setSelectedCard] = useState<BingoCard | null>(null);
  const [gameInProgress, setGameInProgress] = useState(false);
  const [timeToNextGame, setTimeToNextGame] = useState(0);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [numberHistory, setNumberHistory] = useState<number[]>([]);
  const [winningCards, setWinningCards] = useState<Set<string>>(new Set());
  const [showPatterns, setShowPatterns] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(true);
  const [playerCount, setPlayerCount] = useState(0);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeBingoHall();
    const interval = setInterval(updateGameData, 5000);
    return () => {
      clearInterval(interval);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const initializeBingoHall = () => {
    const mockRooms: BingoRoom[] = [
      {
        id: "golden-75",
        name: "Golden Room",
        type: "75-ball",
        maxPlayers: 200,
        currentPlayers: 156,
        cardCost: 5,
        gameStatus: "playing",
        nextGame: new Date(Date.now() + 120000), // 2 minutes
        jackpot: 15450,
        progressiveJackpot: 125847,
        patterns: generate75BallPatterns(),
        currentPattern: generate75BallPatterns()[0],
        calledNumbers: [12, 23, 34, 45, 56, 67, 78, 89, 90, 15, 25, 35],
        gameNumber: 1247,
        isVIP: false,
        theme: "classic-gold",
      },
      {
        id: "silver-90",
        name: "Silver Room",
        type: "90-ball",
        maxPlayers: 150,
        currentPlayers: 98,
        cardCost: 3,
        gameStatus: "waiting",
        nextGame: new Date(Date.now() + 45000), // 45 seconds
        jackpot: 8750,
        progressiveJackpot: 89234,
        patterns: generate90BallPatterns(),
        currentPattern: generate90BallPatterns()[0],
        calledNumbers: [],
        gameNumber: 892,
        isVIP: false,
        theme: "silver-modern",
      },
      {
        id: "vip-progressive",
        name: "VIP Progressive",
        type: "75-ball",
        maxPlayers: 50,
        currentPlayers: 34,
        cardCost: 25,
        gameStatus: "waiting",
        nextGame: new Date(Date.now() + 180000), // 3 minutes
        jackpot: 45000,
        progressiveJackpot: 456789,
        patterns: generateSpecialPatterns(),
        currentPattern: generateSpecialPatterns()[0],
        calledNumbers: [],
        gameNumber: 234,
        isVIP: true,
        theme: "vip-luxury",
      },
    ];

    setRooms(mockRooms);
    setCurrentRoom(mockRooms[0]);
    generateMockChat();
    generateMockPlayers();
    generateMockStats();
    setPlayerCount(156);
  };

  const updateGameData = () => {
    // Simulate real-time updates
    setPlayerCount(prev => {
      const change = Math.floor(Math.random() * 10) - 5;
      return Math.max(50, Math.min(200, prev + change));
    });

    if (currentRoom) {
      setCurrentRoom(prev => prev ? {
        ...prev,
        currentPlayers: playerCount,
        progressiveJackpot: prev.progressiveJackpot + Math.random() * 50,
      } : null);
    }

    // Add random chat messages
    if (Math.random() > 0.7) {
      addSystemMessage();
    }
  };

  const generate75BallPatterns = (): BingoPattern[] => {
    return [
      {
        id: "line-horizontal",
        name: "Horizontal Line",
        description: "Complete any horizontal line",
        pattern: [
          [true, true, true, true, true],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
        ],
        payout: 100,
        difficulty: "easy",
        special: false,
      },
      {
        id: "full-house",
        name: "Full House",
        description: "Fill entire card",
        pattern: [
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
          [true, true, true, true, true],
        ],
        payout: 1000,
        difficulty: "hard",
        special: true,
      },
      {
        id: "x-pattern",
        name: "X Pattern",
        description: "Complete an X shape",
        pattern: [
          [true, false, false, false, true],
          [false, true, false, true, false],
          [false, false, true, false, false],
          [false, true, false, true, false],
          [true, false, false, false, true],
        ],
        payout: 500,
        difficulty: "medium",
        special: true,
      },
      {
        id: "four-corners",
        name: "Four Corners",
        description: "Mark all four corners",
        pattern: [
          [true, false, false, false, true],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [false, false, false, false, false],
          [true, false, false, false, true],
        ],
        payout: 250,
        difficulty: "easy",
        special: false,
      },
    ];
  };

  const generate90BallPatterns = (): BingoPattern[] => {
    return [
      {
        id: "one-line",
        name: "One Line",
        description: "Complete any horizontal line",
        pattern: Array(3).fill(null).map((_, i) => 
          Array(9).fill(i === 0)
        ),
        payout: 50,
        difficulty: "easy",
        special: false,
      },
      {
        id: "two-lines",
        name: "Two Lines",
        description: "Complete any two horizontal lines",
        pattern: [
          Array(9).fill(true),
          Array(9).fill(true),
          Array(9).fill(false),
        ],
        payout: 200,
        difficulty: "medium",
        special: false,
      },
      {
        id: "full-house-90",
        name: "Full House",
        description: "Fill entire card",
        pattern: Array(3).fill(null).map(() => Array(9).fill(true)),
        payout: 500,
        difficulty: "hard",
        special: true,
      },
    ];
  };

  const generateSpecialPatterns = (): BingoPattern[] => {
    return [
      {
        id: "diamond",
        name: "Diamond",
        description: "Complete a diamond shape",
        pattern: [
          [false, false, true, false, false],
          [false, true, false, true, false],
          [true, false, false, false, true],
          [false, true, false, true, false],
          [false, false, true, false, false],
        ],
        payout: 2500,
        difficulty: "hard",
        special: true,
      },
      {
        id: "crown",
        name: "Crown",
        description: "Complete a crown shape",
        pattern: [
          [true, false, true, false, true],
          [true, true, true, true, true],
          [false, true, true, true, false],
          [false, false, true, false, false],
          [false, false, true, false, false],
        ],
        payout: 5000,
        difficulty: "hard",
        special: true,
      },
      {
        id: "progressive-special",
        name: "Progressive Special",
        description: "Unique pattern for progressive jackpot",
        pattern: [
          [true, false, false, false, true],
          [false, true, true, true, false],
          [false, true, false, true, false],
          [false, true, true, true, false],
          [true, false, false, false, true],
        ],
        payout: 10000,
        difficulty: "hard",
        special: true,
      },
    ];
  };

  const generateBingoCard = (type: "75-ball" | "90-ball"): BingoCard => {
    const id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (type === "75-ball") {
      const numbers: (number | null)[][] = [];
      
      for (let col = 0; col < 5; col++) {
        const colNumbers: number[] = [];
        const min = col * 15 + 1;
        const max = col * 15 + 15;
        
        while (colNumbers.length < 5) {
          const num = Math.floor(Math.random() * (max - min + 1)) + min;
          if (!colNumbers.includes(num)) {
            colNumbers.push(num);
          }
        }
        colNumbers.sort((a, b) => a - b);
        
        for (let row = 0; row < 5; row++) {
          if (!numbers[row]) numbers[row] = [];
          numbers[row][col] = row === 2 && col === 2 ? null : colNumbers[row]; // Center is free space
        }
      }
      
      return {
        id,
        type,
        numbers,
        markedNumbers: new Set([0]), // Free space
        cost: currentRoom?.cardCost || 5,
        autoMark: autoMarkEnabled,
        active: true,
      };
    } else {
      // 90-ball bingo card (3x9 grid with 15 numbers)
      const numbers: (number | null)[][] = Array(3).fill(null).map(() => Array(9).fill(null));
      const usedNumbers = new Set<number>();
      
      // Place 15 numbers randomly
      let placed = 0;
      while (placed < 15) {
        const row = Math.floor(Math.random() * 3);
        const col = Math.floor(Math.random() * 9);
        
        if (numbers[row][col] === null) {
          const min = col * 10 + 1;
          const max = col === 8 ? 90 : col * 10 + 10;
          
          let num;
          do {
            num = Math.floor(Math.random() * (max - min + 1)) + min;
          } while (usedNumbers.has(num));
          
          numbers[row][col] = num;
          usedNumbers.add(num);
          placed++;
        }
      }
      
      return {
        id,
        type,
        numbers,
        markedNumbers: new Set(),
        cost: currentRoom?.cardCost || 3,
        autoMark: autoMarkEnabled,
        active: true,
      };
    }
  };

  const buyBingoCard = () => {
    if (!currentRoom || !user) return;
    
    const newCard = generateBingoCard(currentRoom.type);
    setPlayerCards(prev => [...prev, newCard]);
    
    // In production, this would deduct from user's balance
    addChatMessage({
      id: `msg_${Date.now()}`,
      username: "System",
      message: `${user.username} bought a new ${currentRoom.type} card!`,
      timestamp: new Date(),
      type: "system",
    });
  };

  const markNumber = (cardId: string, number: number) => {
    setPlayerCards(prev => prev.map(card => {
      if (card.id === cardId && card.numbers.flat().includes(number)) {
        const newMarked = new Set(card.markedNumbers);
        if (newMarked.has(number)) {
          newMarked.delete(number);
        } else {
          newMarked.add(number);
        }
        return { ...card, markedNumbers: newMarked };
      }
      return card;
    }));
  };

  const checkForWin = (card: BingoCard, pattern: BingoPattern): boolean => {
    if (!currentRoom) return false;
    
    if (currentRoom.type === "75-ball") {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (pattern.pattern[row][col]) {
            const number = card.numbers[row][col];
            if (number !== null && !card.markedNumbers.has(number)) {
              return false;
            }
          }
        }
      }
    } else {
      // 90-ball logic
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
          if (pattern.pattern[row] && pattern.pattern[row][col]) {
            const number = card.numbers[row][col];
            if (number !== null && !card.markedNumbers.has(number)) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  };

  const callNumber = () => {
    if (!currentRoom || !gameInProgress) return;
    
    const maxNumber = currentRoom.type === "75-ball" ? 75 : 90;
    const availableNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1)
      .filter(num => !currentRoom.calledNumbers.includes(num));
    
    if (availableNumbers.length === 0) return;
    
    const newNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    setCurrentNumber(newNumber);
    setNumberHistory(prev => [newNumber, ...prev.slice(0, 9)]);
    
    if (currentRoom) {
      setCurrentRoom(prev => prev ? {
        ...prev,
        calledNumbers: [...prev.calledNumbers, newNumber],
      } : null);
    }

    // Auto-mark for players with auto-mark enabled
    setPlayerCards(prev => prev.map(card => {
      if (card.autoMark && card.numbers.flat().includes(newNumber)) {
        const newMarked = new Set(card.markedNumbers);
        newMarked.add(newNumber);
        return { ...card, markedNumbers: newMarked };
      }
      return card;
    }));

    // Add to chat
    addChatMessage({
      id: `msg_${Date.now()}`,
      username: "Caller",
      message: `${getBingoLetter(newNumber, currentRoom.type)} ${newNumber}`,
      timestamp: new Date(),
      type: "system",
    });

    // Check for wins
    setTimeout(checkAllWins, 1000);
  };

  const getBingoLetter = (number: number, type: "75-ball" | "90-ball"): string => {
    if (type === "90-ball") return "";
    
    if (number <= 15) return "B";
    if (number <= 30) return "I";
    if (number <= 45) return "N";
    if (number <= 60) return "G";
    return "O";
  };

  const checkAllWins = () => {
    if (!currentRoom) return;
    
    const winners = new Set<string>();
    
    playerCards.forEach(card => {
      if (checkForWin(card, currentRoom.currentPattern)) {
        winners.add(card.id);
        
        addChatMessage({
          id: `msg_${Date.now()}`,
          username: user?.username || "Player",
          message: `BINGO! Won with ${currentRoom.currentPattern.name}!`,
          timestamp: new Date(),
          type: "winner",
        });
      }
    });
    
    setWinningCards(winners);
    
    if (winners.size > 0) {
      if (soundEnabled) {
        // Play win sound
      }
    }
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev.slice(-99), message]);
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    addChatMessage({
      id: `msg_${Date.now()}`,
      username: user.username,
      message: newMessage,
      timestamp: new Date(),
      type: "player",
      avatar: user.email,
    });
    
    setNewMessage("");
  };

  const generateMockChat = () => {
    const mockMessages: ChatMessage[] = [
      {
        id: "1",
        username: "BingoMaster",
        message: "Welcome to the Golden Room! Good luck everyone! 🍀",
        timestamp: new Date(Date.now() - 300000),
        type: "moderator",
      },
      {
        id: "2",
        username: "LuckyPlayer123",
        message: "This is my lucky room! 🎯",
        timestamp: new Date(Date.now() - 240000),
        type: "player",
      },
      {
        id: "3",
        username: "System",
        message: "Progressive jackpot is now over $125,000! 💰",
        timestamp: new Date(Date.now() - 180000),
        type: "system",
      },
      {
        id: "4",
        username: "BingoQueen",
        message: "Anyone else going for the X pattern? 🎲",
        timestamp: new Date(Date.now() - 120000),
        type: "player",
      },
      {
        id: "5",
        username: "WinnerWinner",
        message: "BINGO! Just won with full house! 🏆",
        timestamp: new Date(Date.now() - 60000),
        type: "winner",
      },
    ];
    
    setChatMessages(mockMessages);
  };

  const generateMockPlayers = () => {
    const mockPlayers: Player[] = [
      {
        id: "1",
        username: "BingoKing",
        avatar: "👑",
        cards: 4,
        wins: 23,
        isVIP: true,
        online: true,
        status: "playing",
      },
      {
        id: "2",
        username: "LuckyLady",
        avatar: "🍀",
        cards: 6,
        wins: 18,
        isVIP: false,
        online: true,
        status: "playing",
      },
      {
        id: "3",
        username: "NumberCruncher",
        avatar: "🎯",
        cards: 2,
        wins: 31,
        isVIP: true,
        online: true,
        status: "winner",
      },
    ];
    
    setPlayersInRoom(mockPlayers);
    setLeaderboard(mockPlayers.sort((a, b) => b.wins - a.wins));
  };

  const generateMockStats = () => {
    const stats: BingoGameStats = {
      gamesPlayed: 247,
      totalWins: 23,
      biggestWin: 5000,
      favoritePattern: "Full House",
      winRate: 9.3,
      currentStreak: 3,
      lastWin: new Date(Date.now() - 86400000), // Yesterday
      totalSpent: 1235,
      netWinnings: 2847,
    };
    
    setGameStats(stats);
  };

  const addSystemMessage = () => {
    const messages = [
      "New player joined the room! 👋",
      "Don't forget to check the progressive jackpot! 💰",
      "Special pattern game starting in 10 minutes! ⭐",
      "Daily tournament registration is now open! 🏆",
      "Lucky numbers today: 7, 13, 21! 🍀",
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    addChatMessage({
      id: `system_${Date.now()}`,
      username: "System",
      message: randomMessage,
      timestamp: new Date(),
      type: "system",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const BingoCardComponent = ({ card }: { card: BingoCard }) => (
    <Card className={`transition-all duration-300 ${
      selectedCard?.id === card.id ? 'ring-2 ring-gold-500 bg-gold-50 dark:bg-gold-950' : ''
    } ${
      winningCards.has(card.id) ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{card.type.toUpperCase()}</CardTitle>
          <div className="flex items-center gap-2">
            {card.autoMark && <Badge variant="outline" className="text-xs">Auto</Badge>}
            {winningCards.has(card.id) && <Badge className="bg-green-500">WINNER!</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {card.type === "75-ball" ? (
          <div className="space-y-1">
            <div className="grid grid-cols-5 gap-1 text-center font-bold text-xs mb-2">
              <div>B</div><div>I</div><div>N</div><div>G</div><div>O</div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {card.numbers.map((row, rowIndex) =>
                row.map((number, colIndex) => (
                  <Button
                    key={`${rowIndex}-${colIndex}`}
                    size="sm"
                    className={`w-10 h-10 text-xs ${
                      number === null ? 'bg-gold-500 text-black' :
                      card.markedNumbers.has(number) ? 'bg-blue-500 text-white' :
                      'bg-white border border-gray-300 text-black hover:bg-gray-100'
                    }`}
                    onClick={() => number !== null && markNumber(card.id, number)}
                  >
                    {number === null ? "★" : number}
                  </Button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-9 gap-1">
            {card.numbers.map((row, rowIndex) =>
              row.map((number, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  size="sm"
                  className={`w-8 h-8 text-xs ${
                    number === null ? 'bg-transparent border-none' :
                    card.markedNumbers.has(number) ? 'bg-blue-500 text-white' :
                    'bg-white border border-gray-300 text-black hover:bg-gray-100'
                  }`}
                  onClick={() => number !== null && markNumber(card.id, number)}
                  disabled={number === null}
                >
                  {number || ""}
                </Button>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Bingo Hall
                <Badge className="bg-purple-600 text-white">Live Community</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                75-ball & 90-ball bingo with progressive jackpots and special patterns
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {playerCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Players Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  {formatCurrency(currentRoom?.progressiveJackpot || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Progressive Jackpot</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          {/* Room Selection */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Bingo Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rooms.map(room => (
                  <Card 
                    key={room.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      activeRoom === room.id 
                        ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setActiveRoom(room.id);
                      setCurrentRoom(room);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">{room.name}</h3>
                        {room.isVIP && <Crown className="w-4 h-4 text-gold-500" />}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <Badge variant="outline">{room.type}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Players:</span>
                          <span>{room.currentPlayers}/{room.maxPlayers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Card Cost:</span>
                          <span className="font-bold">{formatCurrency(room.cardCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Jackpot:</span>
                          <span className="font-bold text-gold-500">{formatCurrency(room.jackpot)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Game:</span>
                          <span className="text-purple-500 font-medium">
                            {Math.ceil((room.nextGame.getTime() - Date.now()) / 1000)}s
                          </span>
                        </div>
                      </div>
                      <Badge className={`mt-2 w-full justify-center ${
                        room.gameStatus === "playing" ? "bg-green-500" :
                        room.gameStatus === "waiting" ? "bg-yellow-500" :
                        "bg-gray-500"
                      }`}>
                        {room.gameStatus.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Interface */}
          {currentRoom && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{currentRoom.name} - Game #{currentRoom.gameNumber}</CardTitle>
                    <p className="text-muted-foreground">
                      Pattern: {currentRoom.currentPattern.name} • Payout: {formatCurrency(currentRoom.currentPattern.payout)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={buyBingoCard}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Buy Card ({formatCurrency(currentRoom.cardCost)})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPatterns(true)}
                    >
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Patterns
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Number Caller */}
                <div className="text-center mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-white">
                      {currentNumber ? (
                        <div>
                          <div className="text-lg">{getBingoLetter(currentNumber, currentRoom.type)}</div>
                          <div>{currentNumber}</div>
                        </div>
                      ) : "?"}
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    <Button
                      onClick={() => setGameInProgress(!gameInProgress)}
                      className={gameInProgress ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
                    >
                      {gameInProgress ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {gameInProgress ? "Pause" : "Start"}
                    </Button>
                    <Button onClick={callNumber} disabled={!gameInProgress}>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Call Number
                    </Button>
                  </div>

                  {/* Recent Numbers */}
                  <div>
                    <h4 className="font-medium mb-2">Recent Numbers</h4>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {numberHistory.map((num, index) => (
                        <div
                          key={index}
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-gold-500 text-black' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Your Cards ({playerCards.length})</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAutoMarkEnabled(!autoMarkEnabled)}
                      >
                        {autoMarkEnabled ? <CheckCircle className="w-4 h-4 mr-2" /> : <Circle className="w-4 h-4 mr-2" />}
                        Auto Mark
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSoundEnabled(!soundEnabled)}
                      >
                        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  {playerCards.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                      <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Cards Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Buy your first bingo card to start playing!
                      </p>
                      <Button onClick={buyBingoCard} className="bg-purple-500 hover:bg-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Buy First Card
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {playerCards.map(card => (
                        <BingoCardComponent key={card.id} card={card} />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Community Chat */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Community Chat</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setChatExpanded(!chatExpanded)}
                >
                  {chatExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            {chatExpanded && (
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={chatFilter} onValueChange={setChatFilter}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="player">Players</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="winner">Winners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-64" ref={chatScrollRef}>
                  <div className="space-y-2">
                    {chatMessages
                      .filter(msg => chatFilter === "all" || msg.type === chatFilter)
                      .map(message => (
                        <div key={message.id} className="text-sm">
                          <div className="flex items-start gap-2">
                            <div className={`font-bold ${
                              message.type === "moderator" ? "text-purple-500" :
                              message.type === "system" ? "text-blue-500" :
                              message.type === "winner" ? "text-gold-500" :
                              "text-foreground"
                            }`}>
                              {message.username}:
                            </div>
                            <div className="flex-1">{message.message}</div>
                          </div>
                          <div className="text-xs text-muted-foreground ml-2">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={sendChatMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold-500" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? "bg-gold-500 text-black" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-orange-600 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          {player.username}
                          {player.isVIP && <Crown className="w-3 h-3 text-gold-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {player.cards} cards playing
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-500">{player.wins}</div>
                      <div className="text-xs text-muted-foreground">wins</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Player Stats */}
          {gameStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">Games Played</div>
                    <div className="font-bold">{gameStats.gamesPlayed}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Wins</div>
                    <div className="font-bold text-green-500">{gameStats.totalWins}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Win Rate</div>
                    <div className="font-bold">{gameStats.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Biggest Win</div>
                    <div className="font-bold text-gold-500">{formatCurrency(gameStats.biggestWin)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Current Streak</div>
                    <div className="font-bold text-purple-500">{gameStats.currentStreak}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Net Winnings</div>
                    <div className={`font-bold ${gameStats.netWinnings >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatCurrency(gameStats.netWinnings)}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground">Favorite Pattern</div>
                  <div className="font-bold">{gameStats.favoritePattern}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Pattern Preview Dialog */}
      <Dialog open={showPatterns} onOpenChange={setShowPatterns}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bingo Patterns</DialogTitle>
            <DialogDescription>
              Current patterns and payouts for {currentRoom?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRoom?.patterns.map(pattern => (
              <Card key={pattern.id} className={pattern.special ? "border-gold-500" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pattern.name}</CardTitle>
                    {pattern.special && <Star className="w-5 h-5 text-gold-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {pattern.pattern.map((row, rowIndex) =>
                      row.map((marked, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                            marked ? 'bg-purple-500 text-white' : 'bg-muted'
                          }`}
                        >
                          {marked ? "●" : "○"}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={
                      pattern.difficulty === "easy" ? "bg-green-500" :
                      pattern.difficulty === "medium" ? "bg-yellow-500" :
                      "bg-red-500"
                    }>
                      {pattern.difficulty}
                    </Badge>
                    <div className="font-bold text-gold-500">{formatCurrency(pattern.payout)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
