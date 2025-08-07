import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import {
  Play,
  Pause,
  Square,
  Users,
  Clock,
  Trophy,
  Coins,
  Gem,
  Star,
  Crown,
  Zap,
  Target,
  Gift,
  Music,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  Timer,
  CheckCircle,
  Circle,
  X,
  Plus,
  Minus,
  Shuffle,
  RotateCcw,
  TrendingUp,
  Activity,
  Flame,
  Heart,
  Diamond,
  Club,
  Spade,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { walletService, type UserWallet } from "../services/walletService";
import {
  currencyToggleService,
  type GameCurrencyType,
} from "../services/currencyToggleService";

// Bingo Types
interface BingoCard {
  id: string;
  numbers: number[][];
  markedNumbers: boolean[][];
  cost: number;
  isWinner: boolean;
}

interface BingoGame {
  id: string;
  name: string;
  description: string;
  roomId: string;
  players: number;
  maxPlayers: number;
  cardCost: { GC: number; SC: number };
  prizePool: { GC: number; SC: number };
  status: "waiting" | "playing" | "finished";
  drawnNumbers: number[];
  nextNumber?: number;
  timeToNext: number;
  pattern: "line" | "full_house" | "four_corners" | "x_pattern" | "blackout";
  winners: string[];
  isSpeedBingo: boolean;
  jackpot: { GC: number; SC: number };
}

interface BingoRoom {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  cardCost: { GC: number; SC: number };
  averagePrize: { GC: number; SC: number };
  players: number;
  maxPlayers: number;
  nextGame: Date;
  gameFrequency: string;
  isVIP: boolean;
  features: string[];
}

// Poker Types
interface PokerCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank:
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K";
  value: number;
}

interface PokerHand {
  cards: PokerCard[];
  handType: string;
  handRank: number;
  highCard: PokerCard;
}

interface PokerTable {
  id: string;
  name: string;
  gameType: "texas_holdem" | "omaha" | "five_card_draw" | "seven_card_stud";
  stakes: {
    GC: { small: number; big: number };
    SC: { small: number; big: number };
  };
  players: number;
  maxPlayers: number;
  status: "waiting" | "playing" | "break";
  isVIP: boolean;
  avgPot: { GC: number; SC: number };
  handsPerHour: number;
}

interface PokerGame {
  id: string;
  tableId: string;
  gameType: string;
  playerCards: PokerCard[];
  communityCards: PokerCard[];
  pot: { GC: number; SC: number };
  currentBet: { GC: number; SC: number };
  playerBet: { GC: number; SC: number };
  phase: "preflop" | "flop" | "turn" | "river" | "showdown";
  playerAction: "fold" | "call" | "raise" | "check" | "all_in" | null;
  opponentAction: string;
  timeToAct: number;
  isPlayerTurn: boolean;
}

export default function BingoPokerGames() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [currency, setCurrency] = useState<GameCurrencyType>("GC");
  const [activeTab, setActiveTab] = useState<"bingo" | "poker">("bingo");

  // Bingo State
  const [bingoRooms, setBingoRooms] = useState<BingoRoom[]>([]);
  const [activeBingoGame, setActiveBingoGame] = useState<BingoGame | null>(
    null,
  );
  const [bingoCards, setBingoCards] = useState<BingoCard[]>([]);
  const [selectedBingoRoom, setSelectedBingoRoom] = useState<string | null>(
    null,
  );
  const [bingoAudioEnabled, setBingoAudioEnabled] = useState(true);
  const [bingoAutoMark, setBingoAutoMark] = useState(true);

  // Poker State
  const [pokerTables, setPokerTables] = useState<PokerTable[]>([]);
  const [activePokerGame, setActivePokerGame] = useState<PokerGame | null>(
    null,
  );
  const [selectedPokerTable, setSelectedPokerTable] = useState<string | null>(
    null,
  );
  const [pokerShowTutorial, setPokerShowTutorial] = useState(false);

  const [loading, setLoading] = useState(true);
  const gameTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeGames();
    if (user?.id) {
      loadWallet();
      loadUserCurrency();
    }
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (gameTimer.current) {
        clearTimeout(gameTimer.current);
      }
    };
  }, []);

  const initializeGames = async () => {
    try {
      setLoading(true);
      await Promise.all([initializeBingo(), initializePoker()]);
    } catch (error) {
      console.error("Failed to initialize games:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    if (!user?.id) return;
    try {
      const userWallet = await walletService.getUserWallet(user.id);
      setWallet(userWallet);
    } catch (error) {
      console.error("Failed to load wallet:", error);
    }
  };

  const loadUserCurrency = () => {
    if (!user?.id) return;
    const userCurrency = currencyToggleService.getUserCurrency(user.id);
    setCurrency(userCurrency);
  };

  const initializeBingo = async () => {
    const rooms: BingoRoom[] = [
      {
        id: "bingo-newbie",
        name: "Newbie Room",
        description: "Perfect for beginners - lower stakes, friendly players",
        minLevel: 1,
        cardCost: { GC: 100, SC: 1.0 },
        averagePrize: { GC: 2500, SC: 25 },
        players: 34,
        maxPlayers: 75,
        nextGame: new Date(Date.now() + 180000), // 3 minutes
        gameFrequency: "Every 5 minutes",
        isVIP: false,
        features: ["Auto-Mark", "Chat", "Free Cards Daily"],
      },
      {
        id: "bingo-classic",
        name: "Classic Bingo",
        description: "Traditional 75-ball bingo with great prizes",
        minLevel: 5,
        cardCost: { GC: 250, SC: 2.5 },
        averagePrize: { GC: 8500, SC: 85 },
        players: 67,
        maxPlayers: 100,
        nextGame: new Date(Date.now() + 120000), // 2 minutes
        gameFrequency: "Every 3 minutes",
        isVIP: false,
        features: ["Progressive Jackpot", "Multiple Patterns", "Bonus Rounds"],
      },
      {
        id: "bingo-speed",
        name: "Speed Bingo",
        description: "Fast-paced 30-ball bingo for quick wins",
        minLevel: 10,
        cardCost: { GC: 500, SC: 5.0 },
        averagePrize: { GC: 12000, SC: 120 },
        players: 45,
        maxPlayers: 50,
        nextGame: new Date(Date.now() + 60000), // 1 minute
        gameFrequency: "Every 2 minutes",
        isVIP: false,
        features: ["Lightning Fast", "Higher Payouts", "Adrenaline Rush"],
      },
      {
        id: "bingo-vip",
        name: "VIP High Roller",
        description: "Exclusive room for VIP players - massive jackpots",
        minLevel: 25,
        cardCost: { GC: 2500, SC: 25.0 },
        averagePrize: { GC: 75000, SC: 750 },
        players: 18,
        maxPlayers: 25,
        nextGame: new Date(Date.now() + 300000), // 5 minutes
        gameFrequency: "Every 10 minutes",
        isVIP: true,
        features: [
          "Massive Jackpots",
          "VIP Chat",
          "Personal Host",
          "Premium Patterns",
        ],
      },
    ];

    setBingoRooms(rooms);
  };

  const initializePoker = async () => {
    const tables: PokerTable[] = [
      {
        id: "poker-micro",
        name: "Micro Stakes",
        gameType: "texas_holdem",
        stakes: { GC: { small: 10, big: 20 }, SC: { small: 0.1, big: 0.2 } },
        players: 4,
        maxPlayers: 6,
        status: "playing",
        isVIP: false,
        avgPot: { GC: 150, SC: 1.5 },
        handsPerHour: 85,
      },
      {
        id: "poker-low",
        name: "Low Stakes",
        gameType: "texas_holdem",
        stakes: { GC: { small: 50, big: 100 }, SC: { small: 0.5, big: 1.0 } },
        players: 6,
        maxPlayers: 8,
        status: "playing",
        isVIP: false,
        avgPot: { GC: 750, SC: 7.5 },
        handsPerHour: 78,
      },
      {
        id: "poker-medium",
        name: "Medium Stakes",
        gameType: "texas_holdem",
        stakes: { GC: { small: 250, big: 500 }, SC: { small: 2.5, big: 5.0 } },
        players: 5,
        maxPlayers: 8,
        status: "playing",
        isVIP: false,
        avgPot: { GC: 3500, SC: 35 },
        handsPerHour: 72,
      },
      {
        id: "poker-omaha",
        name: "Omaha High",
        gameType: "omaha",
        stakes: { GC: { small: 100, big: 200 }, SC: { small: 1.0, big: 2.0 } },
        players: 3,
        maxPlayers: 6,
        status: "waiting",
        isVIP: false,
        avgPot: { GC: 1200, SC: 12 },
        handsPerHour: 65,
      },
      {
        id: "poker-vip",
        name: "VIP High Roller",
        gameType: "texas_holdem",
        stakes: { GC: { small: 1000, big: 2000 }, SC: { small: 10, big: 20 } },
        players: 2,
        maxPlayers: 6,
        status: "waiting",
        isVIP: true,
        avgPot: { GC: 25000, SC: 250 },
        handsPerHour: 55,
      },
    ];

    setPokerTables(tables);
  };

  const joinBingoRoom = async (roomId: string) => {
    if (!user?.id || !wallet) {
      toast({
        title: "Login Required",
        description: "Please log in to play bingo",
        variant: "destructive",
      });
      return;
    }

    const room = bingoRooms.find((r) => r.id === roomId);
    if (!room) return;

    const cardCost = currency === "GC" ? room.cardCost.GC : room.cardCost.SC;
    const currentBalance =
      currency === "GC" ? wallet.goldCoins : wallet.sweepsCoins;

    if (currentBalance < cardCost) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${cardCost} ${currency} to join this room`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create bingo card
      const card = generateBingoCard(cardCost);
      setBingoCards([card]);

      // Start game simulation
      const game: BingoGame = {
        id: `game-${Date.now()}`,
        name: room.name,
        description: room.description,
        roomId: room.id,
        players: room.players + 1,
        maxPlayers: room.maxPlayers,
        cardCost: room.cardCost,
        prizePool: room.averagePrize,
        status: "waiting",
        drawnNumbers: [],
        timeToNext: 30,
        pattern: "line",
        winners: [],
        isSpeedBingo: room.id === "bingo-speed",
        jackpot: { GC: room.averagePrize.GC * 3, SC: room.averagePrize.SC * 3 },
      };

      setActiveBingoGame(game);
      setSelectedBingoRoom(roomId);

      // Deduct card cost
      await walletService.updateBalance(
        user.id,
        currency === "GC" ? -cardCost : 0,
        currency === "SC" ? -cardCost : 0,
        `Bingo Card Purchase - ${room.name}`,
        undefined,
        "bingo",
      );

      await loadWallet();

      toast({
        title: "Joined Bingo Room",
        description: `Welcome to ${room.name}! Game starts soon.`,
      });

      // Start countdown
      startBingoCountdown(game);
    } catch (error) {
      console.error("Failed to join bingo room:", error);
      toast({
        title: "Error",
        description: "Failed to join bingo room",
        variant: "destructive",
      });
    }
  };

  const generateBingoCard = (cost: number): BingoCard => {
    const numbers: number[][] = [];
    const markedNumbers: boolean[][] = [];

    // Generate 5x5 bingo card
    for (let col = 0; col < 5; col++) {
      const colNumbers: number[] = [];
      const colMarked: boolean[] = [];
      const min = col * 15 + 1;
      const max = col * 15 + 15;

      const availableNumbers = Array.from({ length: 15 }, (_, i) => min + i);

      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) {
          // Free space in center
          colNumbers.push(0);
          colMarked.push(true);
        } else {
          const randomIndex = Math.floor(
            Math.random() * availableNumbers.length,
          );
          const number = availableNumbers.splice(randomIndex, 1)[0];
          colNumbers.push(number);
          colMarked.push(false);
        }
      }

      numbers.push(colNumbers);
      markedNumbers.push(colMarked);
    }

    return {
      id: `card-${Date.now()}`,
      numbers,
      markedNumbers,
      cost,
      isWinner: false,
    };
  };

  const startBingoCountdown = (game: BingoGame) => {
    let timeLeft = 30;

    const countdown = setInterval(() => {
      timeLeft--;

      setActiveBingoGame((prev) =>
        prev ? { ...prev, timeToNext: timeLeft } : null,
      );

      if (timeLeft <= 0) {
        clearInterval(countdown);
        startBingoGame(game);
      }
    }, 1000);
  };

  const startBingoGame = (game: BingoGame) => {
    setActiveBingoGame((prev) =>
      prev ? { ...prev, status: "playing", timeToNext: 0 } : null,
    );

    const drawInterval = game.isSpeedBingo ? 1000 : 3000; // Speed bingo draws every 1s, regular every 3s
    let drawnCount = 0;
    const maxDraws = 75;

    const drawNumber = () => {
      if (drawnCount >= maxDraws) return;

      const availableNumbers = Array.from(
        { length: 75 },
        (_, i) => i + 1,
      ).filter((num) => !game.drawnNumbers.includes(num));

      if (availableNumbers.length === 0) {
        endBingoGame();
        return;
      }

      const drawnNumber =
        availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

      setActiveBingoGame((prev) => {
        if (!prev) return null;

        const updatedGame = {
          ...prev,
          drawnNumbers: [...prev.drawnNumbers, drawnNumber],
          nextNumber: drawnNumber,
        };

        // Auto-mark if enabled
        if (bingoAutoMark) {
          markNumberOnCards(drawnNumber);
        }

        // Check for winners after a few numbers
        if (updatedGame.drawnNumbers.length >= 5) {
          checkForWinners(updatedGame);
        }

        return updatedGame;
      });

      if (bingoAudioEnabled) {
        // Play number call sound
        playBingoSound(drawnNumber);
      }

      drawnCount++;

      if (drawnCount < maxDraws && drawnCount < 25) {
        // End game early for demo
        gameTimer.current = setTimeout(drawNumber, drawInterval);
      } else {
        endBingoGame();
      }
    };

    gameTimer.current = setTimeout(drawNumber, drawInterval);
  };

  const markNumberOnCards = (number: number) => {
    setBingoCards((prevCards) =>
      prevCards.map((card) => {
        const newMarkedNumbers = card.markedNumbers.map((col) => [...col]);

        for (let col = 0; col < 5; col++) {
          for (let row = 0; row < 5; row++) {
            if (card.numbers[col][row] === number) {
              newMarkedNumbers[col][row] = true;
            }
          }
        }

        return { ...card, markedNumbers: newMarkedNumbers };
      }),
    );
  };

  const checkForWinners = (game: BingoGame) => {
    bingoCards.forEach((card) => {
      let hasWin = false;

      // Check for line wins (horizontal, vertical, diagonal)
      for (let row = 0; row < 5; row++) {
        if (card.markedNumbers.every((col) => col[row])) {
          hasWin = true;
          break;
        }
      }

      if (!hasWin) {
        for (let col = 0; col < 5; col++) {
          if (card.markedNumbers[col].every((marked) => marked)) {
            hasWin = true;
            break;
          }
        }
      }

      // Check diagonals
      if (!hasWin) {
        if (card.markedNumbers.every((col, i) => col[i])) hasWin = true;
        if (card.markedNumbers.every((col, i) => col[4 - i])) hasWin = true;
      }

      if (hasWin && !card.isWinner) {
        card.isWinner = true;
        claimBingoWin(game);
      }
    });
  };

  const claimBingoWin = async (game: BingoGame) => {
    if (!user?.id) return;

    try {
      const prizeAmount =
        currency === "GC" ? game.prizePool.GC : game.prizePool.SC;

      await walletService.updateBalance(
        user.id,
        currency === "GC" ? prizeAmount : 0,
        currency === "SC" ? prizeAmount : 0,
        `Bingo Win - ${game.name}`,
        undefined,
        "bingo",
        0,
        prizeAmount,
      );

      await loadWallet();

      toast({
        title: "BINGO! 🎉",
        description: `Congratulations! You won ${prizeAmount} ${currency}!`,
      });

      endBingoGame();
    } catch (error) {
      console.error("Failed to claim bingo win:", error);
    }
  };

  const endBingoGame = () => {
    if (gameTimer.current) {
      clearTimeout(gameTimer.current);
      gameTimer.current = null;
    }

    setActiveBingoGame((prev) =>
      prev ? { ...prev, status: "finished" } : null,
    );

    setTimeout(() => {
      setActiveBingoGame(null);
      setBingoCards([]);
      setSelectedBingoRoom(null);
    }, 5000);
  };

  const playBingoSound = (number: number) => {
    // In a real implementation, you would play audio files
    console.log(`Called: ${getBingoCall(number)}`);
  };

  const getBingoCall = (number: number): string => {
    const calls: { [key: number]: string } = {
      1: "Kelly's Eye, Number One",
      7: "Lucky Seven",
      11: "Legs Eleven",
      13: "Unlucky for Some",
      16: "Sweet Sixteen",
      21: "Key of the Door",
      22: "Two Little Ducks",
      30: "Dirty Thirty",
      39: "39 Steps",
      50: "Half a Century",
      66: "Clickety Click",
      75: "Diamond Jubilee",
      88: "Two Fat Ladies",
    };

    return calls[number] || `Number ${number}`;
  };

  const joinPokerTable = async (tableId: string) => {
    if (!user?.id || !wallet) {
      toast({
        title: "Login Required",
        description: "Please log in to play poker",
        variant: "destructive",
      });
      return;
    }

    const table = pokerTables.find((t) => t.id === tableId);
    if (!table) return;

    const bigBlind =
      currency === "GC" ? table.stakes.GC.big : table.stakes.SC.big;
    const buyIn = bigBlind * 100; // Typical 100 BB buy-in
    const currentBalance =
      currency === "GC" ? wallet.goldCoins : wallet.sweepsCoins;

    if (currentBalance < buyIn) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${buyIn} ${currency} to join this table (100 BB buy-in)`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Start poker game
      const game: PokerGame = {
        id: `poker-${Date.now()}`,
        tableId: table.id,
        gameType: table.gameType,
        playerCards: dealPokerCards(table.gameType === "omaha" ? 4 : 2),
        communityCards: [],
        pot: { GC: 0, SC: 0 },
        currentBet: {
          GC: currency === "GC" ? table.stakes.GC.big : 0,
          SC: currency === "SC" ? table.stakes.SC.big : 0,
        },
        playerBet: { GC: 0, SC: 0 },
        phase: "preflop",
        playerAction: null,
        opponentAction: "",
        timeToAct: 30,
        isPlayerTurn: true,
      };

      setActivePokerGame(game);
      setSelectedPokerTable(tableId);

      // Deduct buy-in
      await walletService.updateBalance(
        user.id,
        currency === "GC" ? -buyIn : 0,
        currency === "SC" ? -buyIn : 0,
        `Poker Buy-in - ${table.name}`,
        undefined,
        "poker",
      );

      await loadWallet();

      toast({
        title: "Joined Poker Table",
        description: `Welcome to ${table.name}! Your cards have been dealt.`,
      });

      startPokerActionTimer(game);
    } catch (error) {
      console.error("Failed to join poker table:", error);
      toast({
        title: "Error",
        description: "Failed to join poker table",
        variant: "destructive",
      });
    }
  };

  const dealPokerCards = (count: number): PokerCard[] => {
    const suits: ("hearts" | "diamonds" | "clubs" | "spades")[] = [
      "hearts",
      "diamonds",
      "clubs",
      "spades",
    ];
    const ranks: (
      | "A"
      | "2"
      | "3"
      | "4"
      | "5"
      | "6"
      | "7"
      | "8"
      | "9"
      | "10"
      | "J"
      | "Q"
      | "K"
    )[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    const cards: PokerCard[] = [];

    for (let i = 0; i < count; i++) {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const rank = ranks[Math.floor(Math.random() * ranks.length)];
      const value =
        rank === "A"
          ? 14
          : rank === "K"
            ? 13
            : rank === "Q"
              ? 12
              : rank === "J"
                ? 11
                : parseInt(rank);

      cards.push({ suit, rank, value });
    }

    return cards;
  };

  const startPokerActionTimer = (game: PokerGame) => {
    let timeLeft = 30;

    const timer = setInterval(() => {
      timeLeft--;

      setActivePokerGame((prev) =>
        prev ? { ...prev, timeToAct: timeLeft } : null,
      );

      if (timeLeft <= 0) {
        clearInterval(timer);
        // Auto-fold if no action taken
        handlePokerAction("fold");
      }
    }, 1000);
  };

  const handlePokerAction = async (
    action: "fold" | "call" | "raise" | "check" | "all_in",
  ) => {
    if (!activePokerGame || !user?.id) return;

    const game = { ...activePokerGame };

    switch (action) {
      case "fold":
        game.playerAction = "fold";
        endPokerHand(false);
        return;

      case "call":
        const callAmount =
          currency === "GC" ? game.currentBet.GC : game.currentBet.SC;
        game.playerBet =
          currency === "GC"
            ? { ...game.playerBet, GC: callAmount }
            : { ...game.playerBet, SC: callAmount };
        break;

      case "raise":
        const raiseAmount =
          currency === "GC" ? game.currentBet.GC * 2 : game.currentBet.SC * 2;
        game.playerBet =
          currency === "GC"
            ? { ...game.playerBet, GC: raiseAmount }
            : { ...game.playerBet, SC: raiseAmount };
        game.currentBet =
          currency === "GC"
            ? { ...game.currentBet, GC: raiseAmount }
            : { ...game.currentBet, SC: raiseAmount };
        break;

      case "check":
        // No additional bet
        break;
    }

    game.playerAction = action;
    game.isPlayerTurn = false;

    setActivePokerGame(game);

    // Simulate opponent action
    setTimeout(() => {
      simulateOpponentAction(game);
    }, 2000);
  };

  const simulateOpponentAction = (game: PokerGame) => {
    const actions = ["call", "fold", "raise"];
    const opponentAction = actions[Math.floor(Math.random() * actions.length)];

    game.opponentAction = opponentAction;

    // Move to next phase
    advancePokerPhase(game);
  };

  const advancePokerPhase = (game: PokerGame) => {
    switch (game.phase) {
      case "preflop":
        game.phase = "flop";
        game.communityCards = dealPokerCards(3);
        break;
      case "flop":
        game.phase = "turn";
        game.communityCards.push(...dealPokerCards(1));
        break;
      case "turn":
        game.phase = "river";
        game.communityCards.push(...dealPokerCards(1));
        break;
      case "river":
        game.phase = "showdown";
        evaluatePokerHand(game);
        return;
    }

    game.isPlayerTurn = true;
    game.timeToAct = 30;
    setActivePokerGame(game);
    startPokerActionTimer(game);
  };

  const evaluatePokerHand = async (game: PokerGame) => {
    // Simple hand evaluation - in reality this would be much more complex
    const playerHandStrength = Math.random();
    const opponentHandStrength = Math.random();

    const playerWins = playerHandStrength > opponentHandStrength;

    if (playerWins) {
      const potAmount =
        currency === "GC" ? game.currentBet.GC * 2 : game.currentBet.SC * 2;

      await walletService.updateBalance(
        user!.id,
        currency === "GC" ? potAmount : 0,
        currency === "SC" ? potAmount : 0,
        `Poker Win - ${game.gameType}`,
        undefined,
        "poker",
        0,
        potAmount,
      );

      await loadWallet();

      toast({
        title: "You Win! 🎉",
        description: `Congratulations! You won ${potAmount} ${currency}!`,
      });
    } else {
      toast({
        title: "You Lose",
        description: "Better luck next hand!",
        variant: "destructive",
      });
    }

    endPokerHand(playerWins);
  };

  const endPokerHand = (won: boolean) => {
    setTimeout(() => {
      setActivePokerGame(null);
      setSelectedPokerTable(null);
    }, 3000);
  };

  const renderBingoCard = (card: BingoCard) => {
    const headers = ["B", "I", "N", "G", "O"];

    return (
      <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-blue-500">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {headers.map((header) => (
            <div
              key={header}
              className="bg-blue-600 text-white font-bold text-center py-2 rounded"
            >
              {header}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1">
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 5 }, (_, col) => {
              const number = card.numbers[col][row];
              const isMarked = card.markedNumbers[col][row];
              const isFreeSpace = col === 2 && row === 2;

              return (
                <div
                  key={`${col}-${row}`}
                  className={`
                    aspect-square flex items-center justify-center text-sm font-bold rounded
                    ${
                      isMarked
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    }
                    ${isFreeSpace ? "bg-yellow-400 text-black" : ""}
                  `}
                  onClick={() => {
                    if (!bingoAutoMark && !isFreeSpace) {
                      // Manual marking
                      setBingoCards((prev) =>
                        prev.map((c) =>
                          c.id === card.id
                            ? {
                                ...c,
                                markedNumbers: c.markedNumbers.map(
                                  (colMarked, cIndex) =>
                                    cIndex === col
                                      ? colMarked.map((marked, rIndex) =>
                                          rIndex === row ? !marked : marked,
                                        )
                                      : colMarked,
                                ),
                              }
                            : c,
                        ),
                      );
                    }
                  }}
                >
                  {isFreeSpace ? "FREE" : number || ""}
                </div>
              );
            }),
          )}
        </div>

        {card.isWinner && (
          <div className="mt-2 text-center">
            <Badge className="bg-gold-500 text-black font-bold text-lg px-4 py-2">
              🎉 BINGO! 🎉
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const renderPokerCard = (card: PokerCard, hidden: boolean = false) => {
    if (hidden) {
      return (
        <div className="w-12 h-16 bg-blue-600 rounded border-2 border-white flex items-center justify-center">
          <div className="w-8 h-8 bg-blue-800 rounded"></div>
        </div>
      );
    }

    const suitIcons = {
      hearts: <Heart className="w-4 h-4 text-red-500" />,
      diamonds: <Diamond className="w-4 h-4 text-red-500" />,
      clubs: <Club className="w-4 h-4 text-black" />,
      spades: <Spade className="w-4 h-4 text-black" />,
    };

    return (
      <div className="w-12 h-16 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-between p-1 text-xs font-bold">
        <div
          className={`${card.suit === "hearts" || card.suit === "diamonds" ? "text-red-500" : "text-black"}`}
        >
          {card.rank}
        </div>
        {suitIcons[card.suit]}
        <div
          className={`${card.suit === "hearts" || card.suit === "diamonds" ? "text-red-500" : "text-black"} transform rotate-180`}
        >
          {card.rank}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-green-500 bg-clip-text text-transparent mb-2">
          Bingo & Poker Games
        </h1>
        <p className="text-muted-foreground">
          Classic games with exciting prizes and jackpots
        </p>

        {wallet && (
          <div className="flex items-center gap-4 mt-4">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">
                  {wallet.goldCoins.toLocaleString()} GC
                </span>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">
                  {wallet.sweepsCoins.toFixed(2)} SC
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "bingo" | "poker")}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bingo" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Bingo
          </TabsTrigger>
          <TabsTrigger value="poker" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Poker
          </TabsTrigger>
        </TabsList>

        {/* Bingo Tab */}
        <TabsContent value="bingo" className="space-y-6">
          {activeBingoGame ? (
            <div className="space-y-6">
              {/* Active Bingo Game */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {activeBingoGame.name}
                      <Badge
                        className={
                          activeBingoGame.status === "live"
                            ? "bg-green-600"
                            : activeBingoGame.status === "waiting"
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                        }
                      >
                        {activeBingoGame.status.toUpperCase()}
                      </Badge>
                    </CardTitle>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBingoAudioEnabled(!bingoAudioEnabled)}
                      >
                        {bingoAudioEnabled ? (
                          <Volume2 className="w-4 h-4" />
                        ) : (
                          <VolumeX className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setBingoAutoMark(!bingoAutoMark)}
                      >
                        Auto-Mark: {bingoAutoMark ? "ON" : "OFF"}
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={endBingoGame}
                      >
                        Leave Game
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bingo Card */}
                    <div className="lg:col-span-2">
                      {bingoCards.map((card) => (
                        <div key={card.id}>{renderBingoCard(card)}</div>
                      ))}
                    </div>

                    {/* Game Info */}
                    <div className="space-y-4">
                      {activeBingoGame.status === "waiting" && (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2" />
                            <h3 className="font-semibold mb-2">
                              Game Starting Soon
                            </h3>
                            <div className="text-2xl font-bold text-green-600">
                              {activeBingoGame.timeToNext}s
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {activeBingoGame.nextNumber && (
                        <Card>
                          <CardContent className="pt-6 text-center">
                            <h3 className="font-semibold mb-2">
                              Latest Number
                            </h3>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                              {activeBingoGame.nextNumber}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getBingoCall(activeBingoGame.nextNumber)}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="font-semibold mb-3">Numbers Called</h3>
                          <div className="grid grid-cols-5 gap-1 text-xs">
                            {Array.from({ length: 75 }, (_, i) => i + 1).map(
                              (num) => (
                                <div
                                  key={num}
                                  className={`
                                  aspect-square flex items-center justify-center rounded text-xs
                                  ${
                                    activeBingoGame.drawnNumbers.includes(num)
                                      ? "bg-green-600 text-white"
                                      : "bg-gray-200"
                                  }
                                `}
                                >
                                  {num}
                                </div>
                              ),
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Players:</span>
                              <span>
                                {activeBingoGame.players}/
                                {activeBingoGame.maxPlayers}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Prize Pool:</span>
                              <span className="font-semibold">
                                {currency === "GC"
                                  ? activeBingoGame.prizePool.GC
                                  : activeBingoGame.prizePool.SC}{" "}
                                {currency}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pattern:</span>
                              <span className="capitalize">
                                {activeBingoGame.pattern.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {bingoRooms.map((room) => (
                <Card
                  key={room.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {room.isVIP && (
                          <Crown className="w-5 h-5 text-gold-500" />
                        )}
                        {room.name}
                      </CardTitle>
                      <Badge
                        variant={
                          room.players < room.maxPlayers
                            ? "default"
                            : "destructive"
                        }
                      >
                        {room.players}/{room.maxPlayers}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {room.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Card Cost:</span>
                        <div>
                          {room.cardCost.GC} GC / {room.cardCost.SC} SC
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Avg Prize:</span>
                        <div className="text-green-600 font-semibold">
                          {room.averagePrize.GC} GC / {room.averagePrize.SC} SC
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Next Game:</span>
                        <div>
                          {Math.ceil(
                            (room.nextGame.getTime() - Date.now()) / 60000,
                          )}
                          m
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>
                        <div>{room.gameFrequency}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {room.features.map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => joinBingoRoom(room.id)}
                      disabled={room.players >= room.maxPlayers}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {room.players >= room.maxPlayers
                        ? "Room Full"
                        : "Join Room"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Poker Tab */}
        <TabsContent value="poker" className="space-y-6">
          {activePokerGame ? (
            <div className="space-y-6">
              {/* Active Poker Game */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      {
                        pokerTables.find((t) => t.id === selectedPokerTable)
                          ?.name
                      }
                      <Badge>{activePokerGame.phase.toUpperCase()}</Badge>
                    </CardTitle>

                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        Time to act:{" "}
                        <span className="font-bold">
                          {activePokerGame.timeToAct}s
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => endPokerHand(false)}
                      >
                        Leave Table
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    {/* Community Cards */}
                    {activePokerGame.communityCards.length > 0 && (
                      <div className="text-center">
                        <h3 className="font-semibold mb-3">Community Cards</h3>
                        <div className="flex justify-center gap-2">
                          {activePokerGame.communityCards.map((card, index) => (
                            <div key={index}>{renderPokerCard(card)}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Player Cards */}
                      <div className="text-center">
                        <h3 className="font-semibold mb-3">Your Cards</h3>
                        <div className="flex justify-center gap-2 mb-4">
                          {activePokerGame.playerCards.map((card, index) => (
                            <div key={index}>{renderPokerCard(card)}</div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        {activePokerGame.isPlayerTurn &&
                          activePokerGame.phase !== "showdown" && (
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="destructive"
                                onClick={() => handlePokerAction("fold")}
                              >
                                Fold
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handlePokerAction("check")}
                              >
                                Check
                              </Button>
                              <Button onClick={() => handlePokerAction("call")}>
                                Call{" "}
                                {currency === "GC"
                                  ? activePokerGame.currentBet.GC
                                  : activePokerGame.currentBet.SC}{" "}
                                {currency}
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => handlePokerAction("raise")}
                              >
                                Raise
                              </Button>
                            </div>
                          )}
                      </div>

                      {/* Game Info */}
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Pot:</span>
                                <span className="font-semibold">
                                  {currency === "GC"
                                    ? activePokerGame.pot.GC
                                    : activePokerGame.pot.SC}{" "}
                                  {currency}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Current Bet:</span>
                                <span>
                                  {currency === "GC"
                                    ? activePokerGame.currentBet.GC
                                    : activePokerGame.currentBet.SC}{" "}
                                  {currency}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Your Bet:</span>
                                <span>
                                  {currency === "GC"
                                    ? activePokerGame.playerBet.GC
                                    : activePokerGame.playerBet.SC}{" "}
                                  {currency}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {activePokerGame.opponentAction && (
                          <Card>
                            <CardContent className="pt-6 text-center">
                              <h4 className="font-semibold mb-2">
                                Opponent Action
                              </h4>
                              <Badge className="capitalize">
                                {activePokerGame.opponentAction}
                              </Badge>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pokerTables.map((table) => (
                <Card
                  key={table.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {table.isVIP && (
                          <Crown className="w-5 h-5 text-gold-500" />
                        )}
                        {table.name}
                      </CardTitle>
                      <Badge
                        variant={
                          table.status === "playing"
                            ? "default"
                            : table.status === "waiting"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {table.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Game:</span>
                        <span className="capitalize font-medium">
                          {table.gameType.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stakes:</span>
                        <span className="font-medium">
                          {currency === "GC"
                            ? `${table.stakes.GC.small}/${table.stakes.GC.big}`
                            : `${table.stakes.SC.small}/${table.stakes.SC.big}`}{" "}
                          {currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Players:</span>
                        <span>
                          {table.players}/{table.maxPlayers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Pot:</span>
                        <span className="text-green-600 font-semibold">
                          {currency === "GC"
                            ? table.avgPot.GC
                            : table.avgPot.SC}{" "}
                          {currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hands/Hour:</span>
                        <span>{table.handsPerHour}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => joinPokerTable(table.id)}
                      disabled={table.players >= table.maxPlayers}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {table.players >= table.maxPlayers
                        ? "Table Full"
                        : "Join Table"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
