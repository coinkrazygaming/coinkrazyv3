import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Spade,
  Heart,
  Diamond,
  Club,
  Coins,
  Crown,
  Trophy,
  Users,
  Play,
  Pause,
  RotateCcw,
  Target,
  DollarSign,
  Timer,
  Star,
  Zap,
  Eye,
  Settings,
  Volume2,
  VolumeX,
  Info,
  CheckCircle,
  XCircle,
  Shuffle,
  TrendingUp,
  BarChart3,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RefreshCw,
  Home,
  Square,
  Circle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Card and Game Types
interface PlayingCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
  value: number;
  faceUp: boolean;
}

interface GameState {
  gameId: string;
  gameType: "blackjack" | "roulette" | "baccarat" | "poker";
  status: "waiting" | "betting" | "playing" | "finished";
  players: Player[];
  dealer: Dealer;
  pot: number;
  minBet: number;
  maxBet: number;
  round: number;
  timer: number;
}

interface Player {
  id: string;
  username: string;
  avatar: string;
  chips: number;
  bet: number;
  hand: PlayingCard[];
  position: number;
  status: "active" | "folded" | "bust" | "blackjack" | "stand";
  insurance?: number;
  double?: boolean;
  split?: boolean;
}

interface Dealer {
  hand: PlayingCard[];
  status: "dealing" | "waiting" | "revealing";
}

interface RouletteNumber {
  number: number;
  color: "red" | "black" | "green";
  position: { x: number; y: number };
}

interface BaccaratHand {
  cards: PlayingCard[];
  value: number;
  natural: boolean;
}

interface PokerHand {
  cards: PlayingCard[];
  rank: string;
  strength: number;
}

export default function TableGames() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<string>("blackjack");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerChips, setPlayerChips] = useState(10000);
  const [currentBet, setCurrentBet] = useState(0);
  const [selectedChip, setSelectedChip] = useState(25);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  // Blackjack specific state
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [playerValue, setPlayerValue] = useState(0);
  const [dealerValue, setDealerValue] = useState(0);
  const [canHit, setCanHit] = useState(false);
  const [canStand, setCanStand] = useState(false);
  const [canDouble, setCanDouble] = useState(false);
  const [canSplit, setScanSplit] = useState(false);
  const [insurance, setInsurance] = useState(false);

  // Roulette specific state
  const [rouletteBets, setRouletteBets] = useState<{[key: string]: number}>({});
  const [rouletteHistory, setRouletteHistory] = useState<number[]>([]);
  const [rouletteResult, setRouletteResult] = useState<number | null>(null);
  const [wheelSpinning, setWheelSpinning] = useState(false);

  // Baccarat specific state
  const [playerHand_Baccarat, setPlayerHand_Baccarat] = useState<BaccaratHand>({ cards: [], value: 0, natural: false });
  const [bankerHand, setBankerHand] = useState<BaccaratHand>({ cards: [], value: 0, natural: false });
  const [baccaratBets, setBaccaratBets] = useState<{player: number, banker: number, tie: number}>({ player: 0, banker: 0, tie: 0 });

  // Poker specific state
  const [pokerHand, setPokerHand] = useState<PlayingCard[]>([]);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>([]);
  const [pokerPlayers, setPokerPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [pokerPot, setPokerPot] = useState(0);

  useEffect(() => {
    initializeGame(activeGame);
  }, [activeGame]);

  const initializeGame = (gameType: string) => {
    switch (gameType) {
      case "blackjack":
        initializeBlackjack();
        break;
      case "roulette":
        initializeRoulette();
        break;
      case "baccarat":
        initializeBaccarat();
        break;
      case "poker":
        initializePoker();
        break;
    }
  };

  const createDeck = (): PlayingCard[] => {
    const suits: ("hearts" | "diamonds" | "clubs" | "spades")[] = ["hearts", "diamonds", "clubs", "spades"];
    const ranks: ("A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K")[] = 
      ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const deck: PlayingCard[] = [];

    suits.forEach(suit => {
      ranks.forEach(rank => {
        deck.push({
          suit,
          rank,
          value: rank === "A" ? 11 : ["J", "Q", "K"].includes(rank) ? 10 : parseInt(rank) || 0,
          faceUp: false
        });
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  };

  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case "hearts": return <Heart className="w-4 h-4 text-red-500" />;
      case "diamonds": return <Diamond className="w-4 h-4 text-red-500" />;
      case "clubs": return <Club className="w-4 h-4 text-black" />;
      case "spades": return <Spade className="w-4 h-4 text-black" />;
      default: return null;
    }
  };

  const CardComponent = ({ card, faceDown = false }: { card: PlayingCard; faceDown?: boolean }) => (
    <div className={`relative w-16 h-24 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${
      animationsEnabled ? 'transform hover:scale-105' : ''
    }`}>
      {faceDown ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
          <Crown className="w-8 h-8 text-gold-400" />
        </div>
      ) : (
        <>
          <div className="absolute top-1 left-1">
            <div className="text-xs font-bold">{card.rank}</div>
            {getSuitIcon(card.suit)}
          </div>
          <div className="text-2xl">{getSuitIcon(card.suit)}</div>
          <div className="absolute bottom-1 right-1 rotate-180">
            <div className="text-xs font-bold">{card.rank}</div>
            {getSuitIcon(card.suit)}
          </div>
        </>
      )}
    </div>
  );

  // BLACKJACK IMPLEMENTATION
  const initializeBlackjack = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerValue(0);
    setDealerValue(0);
    setCanHit(false);
    setCanStand(false);
    setCanDouble(false);
    setScanSplit(false);
    setInsurance(false);
    setCurrentBet(0);
  };

  const dealBlackjackHand = () => {
    if (currentBet === 0 || currentBet > playerChips) return;

    const deck = createDeck();
    const newPlayerHand = [deck[0], deck[2]];
    const newDealerHand = [deck[1], { ...deck[3], faceUp: false }];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    
    const playerVal = calculateBlackjackValue(newPlayerHand);
    const dealerVal = calculateBlackjackValue([deck[1]]);
    
    setPlayerValue(playerVal);
    setDealerValue(dealerVal);
    
    setPlayerChips(prev => prev - currentBet);
    
    // Check for blackjack
    if (playerVal === 21) {
      finishBlackjackHand();
    } else {
      setCanHit(true);
      setCanStand(true);
      setCanDouble(currentBet <= playerChips);
      setScanSplit(newPlayerHand[0].rank === newPlayerHand[1].rank && currentBet <= playerChips);
    }
  };

  const calculateBlackjackValue = (hand: PlayingCard[]): number => {
    let value = 0;
    let aces = 0;

    hand.forEach(card => {
      if (card.rank === "A") {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    });

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  };

  const hitBlackjack = () => {
    const deck = createDeck();
    const newCard = deck[Math.floor(Math.random() * deck.length)];
    const newHand = [...playerHand, newCard];
    const newValue = calculateBlackjackValue(newHand);

    setPlayerHand(newHand);
    setPlayerValue(newValue);

    if (newValue >= 21) {
      finishBlackjackHand();
    } else {
      setCanDouble(false);
      setScanSplit(false);
    }
  };

  const standBlackjack = () => {
    finishBlackjackHand();
  };

  const doubleBlackjack = () => {
    if (currentBet > playerChips) return;
    
    setPlayerChips(prev => prev - currentBet);
    setCurrentBet(prev => prev * 2);
    hitBlackjack();
  };

  const finishBlackjackHand = () => {
    // Reveal dealer's face-down card
    const revealedDealerHand = dealerHand.map(card => ({ ...card, faceUp: true }));
    let dealerVal = calculateBlackjackValue(revealedDealerHand);
    
    // Dealer hits until 17 or higher
    const deck = createDeck();
    let newDealerHand = revealedDealerHand;
    
    while (dealerVal < 17) {
      const newCard = deck[Math.floor(Math.random() * deck.length)];
      newDealerHand = [...newDealerHand, newCard];
      dealerVal = calculateBlackjackValue(newDealerHand);
    }

    setDealerHand(newDealerHand);
    setDealerValue(dealerVal);

    // Determine winner
    let winnings = 0;
    if (playerValue > 21) {
      // Player bust
      winnings = 0;
    } else if (dealerVal > 21) {
      // Dealer bust
      winnings = currentBet * 2;
    } else if (playerValue === 21 && playerHand.length === 2) {
      // Player blackjack
      winnings = currentBet * 2.5;
    } else if (playerValue > dealerVal) {
      // Player wins
      winnings = currentBet * 2;
    } else if (playerValue === dealerVal) {
      // Push
      winnings = currentBet;
    }

    setPlayerChips(prev => prev + winnings);
    setCanHit(false);
    setCanStand(false);
    setCanDouble(false);
    setScanSplit(false);

    // Add to history
    setGameHistory(prev => [...prev, {
      game: "blackjack",
      bet: currentBet,
      result: winnings > currentBet ? "win" : winnings === currentBet ? "push" : "loss",
      winnings: winnings - currentBet,
      timestamp: new Date().toISOString()
    }]);
  };

  // ROULETTE IMPLEMENTATION
  const initializeRoulette = () => {
    setRouletteBets({});
    setRouletteResult(null);
    setWheelSpinning(false);
  };

  const rouletteNumbers = Array.from({ length: 37 }, (_, i) => i); // 0-36
  
  const getRouletteColor = (num: number): "red" | "black" | "green" => {
    if (num === 0) return "green";
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? "red" : "black";
  };

  const placeBet = (betType: string, amount: number) => {
    if (amount > playerChips) return;
    
    setRouletteBets(prev => ({
      ...prev,
      [betType]: (prev[betType] || 0) + amount
    }));
    setPlayerChips(prev => prev - amount);
  };

  const spinRoulette = () => {
    const totalBet = Object.values(rouletteBets).reduce((sum, bet) => sum + bet, 0);
    if (totalBet === 0) return;

    setWheelSpinning(true);
    
    setTimeout(() => {
      const result = Math.floor(Math.random() * 37);
      setRouletteResult(result);
      setWheelSpinning(false);
      
      // Calculate winnings
      let totalWinnings = 0;
      
      Object.entries(rouletteBets).forEach(([betType, amount]) => {
        let won = false;
        let payout = 1;

        switch (betType) {
          case "red":
            won = getRouletteColor(result) === "red";
            payout = 2;
            break;
          case "black":
            won = getRouletteColor(result) === "black";
            payout = 2;
            break;
          case "even":
            won = result !== 0 && result % 2 === 0;
            payout = 2;
            break;
          case "odd":
            won = result !== 0 && result % 2 === 1;
            payout = 2;
            break;
          case "1-18":
            won = result >= 1 && result <= 18;
            payout = 2;
            break;
          case "19-36":
            won = result >= 19 && result <= 36;
            payout = 2;
            break;
          default:
            if (betType.startsWith("number-")) {
              const number = parseInt(betType.split("-")[1]);
              won = result === number;
              payout = 36;
            }
        }

        if (won) {
          totalWinnings += amount * payout;
        }
      });

      setPlayerChips(prev => prev + totalWinnings);
      setRouletteHistory(prev => [result, ...prev.slice(0, 9)]);
      
      // Add to history
      setGameHistory(prev => [...prev, {
        game: "roulette",
        bet: totalBet,
        result: totalWinnings > 0 ? "win" : "loss",
        winnings: totalWinnings - totalBet,
        number: result,
        timestamp: new Date().toISOString()
      }]);

      setRouletteBets({});
    }, 3000);
  };

  // BACCARAT IMPLEMENTATION
  const initializeBaccarat = () => {
    setPlayerHand_Baccarat({ cards: [], value: 0, natural: false });
    setBankerHand({ cards: [], value: 0, natural: false });
    setBaccaratBets({ player: 0, banker: 0, tie: 0 });
  };

  const calculateBaccaratValue = (cards: PlayingCard[]): number => {
    const total = cards.reduce((sum, card) => {
      let value = card.value;
      if (value > 10) value = 0; // Face cards are worth 0
      if (card.rank === "A") value = 1; // Aces are worth 1
      return sum + value;
    }, 0);
    return total % 10;
  };

  const dealBaccarat = () => {
    const totalBet = baccaratBets.player + baccaratBets.banker + baccaratBets.tie;
    if (totalBet === 0) return;

    const deck = createDeck();
    const playerCards = [deck[0], deck[2]];
    const bankerCards = [deck[1], deck[3]];

    const playerValue = calculateBaccaratValue(playerCards);
    const bankerValue = calculateBaccaratValue(bankerCards);

    const playerNatural = playerValue >= 8;
    const bankerNatural = bankerValue >= 8;

    let finalPlayerCards = playerCards;
    let finalBankerCards = bankerCards;
    let finalPlayerValue = playerValue;
    let finalBankerValue = bankerValue;

    // Third card rules
    if (!playerNatural && !bankerNatural) {
      // Player third card rule
      if (playerValue <= 5) {
        const thirdCard = deck[4];
        finalPlayerCards = [...playerCards, thirdCard];
        finalPlayerValue = calculateBaccaratValue(finalPlayerCards);
      }

      // Banker third card rule (simplified)
      if (bankerValue <= 5) {
        const bankerThirdCard = deck[5];
        finalBankerCards = [...bankerCards, bankerThirdCard];
        finalBankerValue = calculateBaccaratValue(finalBankerCards);
      }
    }

    setPlayerHand_Baccarat({
      cards: finalPlayerCards,
      value: finalPlayerValue,
      natural: playerNatural
    });

    setBankerHand({
      cards: finalBankerCards,
      value: finalBankerValue,
      natural: bankerNatural
    });

    // Determine winner and calculate payouts
    let totalWinnings = 0;

    if (finalPlayerValue > finalBankerValue) {
      totalWinnings += baccaratBets.player * 2;
    } else if (finalBankerValue > finalPlayerValue) {
      totalWinnings += baccaratBets.banker * 1.95; // House edge
    } else {
      totalWinnings += baccaratBets.tie * 9; // 8:1 payout for tie
      totalWinnings += baccaratBets.player; // Return player bet
      totalWinnings += baccaratBets.banker; // Return banker bet
    }

    setPlayerChips(prev => prev + totalWinnings);

    // Add to history
    const betAmount = totalBet;
    setGameHistory(prev => [...prev, {
      game: "baccarat",
      bet: betAmount,
      result: totalWinnings > 0 ? "win" : "loss",
      winnings: totalWinnings - betAmount,
      playerValue: finalPlayerValue,
      bankerValue: finalBankerValue,
      timestamp: new Date().toISOString()
    }]);

    setBaccaratBets({ player: 0, banker: 0, tie: 0 });
  };

  // POKER IMPLEMENTATION (Texas Hold'em style)
  const initializePoker = () => {
    setPokerHand([]);
    setCommunityCards([]);
    setPokerPlayers([]);
    setPokerPot(0);
    setCurrentPlayer(0);
  };

  const dealPoker = () => {
    const deck = createDeck();
    const playerCards = [deck[0], deck[1]];
    const communityCards = [deck[2], deck[3], deck[4], deck[5], deck[6]];

    setPokerHand(playerCards);
    setCommunityCards(communityCards);
  };

  const getChipComponent = (value: number, selected: boolean = false) => (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all ${
        selected ? 'ring-2 ring-gold-500 transform scale-110' : ''
      } ${
        value === 25 ? 'bg-green-500' :
        value === 100 ? 'bg-red-500' :
        value === 500 ? 'bg-blue-500' :
        value === 1000 ? 'bg-purple-500' :
        'bg-gold-500'
      }`}
      onClick={() => setSelectedChip(value)}
    >
      <span className="text-white font-bold text-xs">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-600/10 to-red-600/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-red-600 rounded-full flex items-center justify-center">
                  <Spade className="w-6 h-6 text-white" />
                </div>
                Classic Table Games
                <Badge className="bg-green-600 text-white">Live Casino</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Professional casino games with realistic gameplay and fair odds
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-400">
                  {playerChips.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Chips</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Dialog open={showRules} onOpenChange={setShowRules}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Info className="w-4 h-4 mr-2" />
                      Rules
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Game Rules & Tips</DialogTitle>
                      <DialogDescription>
                        Learn how to play each table game effectively
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div>
                        <h3 className="font-bold">Blackjack</h3>
                        <p className="text-sm text-muted-foreground">
                          Get as close to 21 as possible without going over. Face cards = 10, Aces = 1 or 11.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold">Roulette</h3>
                        <p className="text-sm text-muted-foreground">
                          Bet on where the ball will land. Single numbers pay 35:1, colors/odd-even pay 1:1.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold">Baccarat</h3>
                        <p className="text-sm text-muted-foreground">
                          Bet on Player, Banker, or Tie. Closest to 9 wins. Third card rules apply automatically.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold">Poker</h3>
                        <p className="text-sm text-muted-foreground">
                          Make the best 5-card hand using your 2 cards and 5 community cards.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeGame} onValueChange={setActiveGame} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blackjack" className="flex items-center gap-2">
            <Spade className="w-4 h-4" />
            Blackjack
          </TabsTrigger>
          <TabsTrigger value="roulette" className="flex items-center gap-2">
            <Circle className="w-4 h-4" />
            Roulette
          </TabsTrigger>
          <TabsTrigger value="baccarat" className="flex items-center gap-2">
            <Diamond className="w-4 h-4" />
            Baccarat
          </TabsTrigger>
          <TabsTrigger value="poker" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Poker
          </TabsTrigger>
        </TabsList>

        {/* BLACKJACK */}
        <TabsContent value="blackjack" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-green-800 to-green-900 text-white min-h-96">
                <CardContent className="p-8">
                  {/* Dealer Section */}
                  <div className="text-center mb-8">
                    <h3 className="text-lg font-bold mb-4">Dealer ({dealerValue})</h3>
                    <div className="flex justify-center gap-2 mb-4">
                      {dealerHand.map((card, index) => (
                        <CardComponent key={`dealer-${index}-${card.suit}-${card.rank}`} card={card} faceDown={!card.faceUp} />
                      ))}
                    </div>
                  </div>

                  {/* Game Actions */}
                  <div className="flex justify-center gap-4 mb-8">
                    <Button
                      onClick={dealBlackjackHand}
                      disabled={currentBet === 0 || playerHand.length > 0}
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Deal
                    </Button>
                    <Button
                      onClick={hitBlackjack}
                      disabled={!canHit}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Hit
                    </Button>
                    <Button
                      onClick={standBlackjack}
                      disabled={!canStand}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Stand
                    </Button>
                    <Button
                      onClick={doubleBlackjack}
                      disabled={!canDouble}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      Double
                    </Button>
                  </div>

                  {/* Player Section */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-4">Player ({playerValue})</h3>
                    <div className="flex justify-center gap-2">
                      {playerHand.map((card, index) => (
                        <CardComponent key={`player-${index}-${card.suit}-${card.rank}`} card={card} />
                      ))}
                    </div>
                    {playerValue > 21 && (
                      <Badge className="mt-4 bg-red-500">BUST!</Badge>
                    )}
                    {playerValue === 21 && playerHand.length === 2 && (
                      <Badge className="mt-4 bg-gold-500 text-black">BLACKJACK!</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Betting Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Betting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Current Bet</label>
                  <div className="text-2xl font-bold text-gold-400">
                    {currentBet.toLocaleString()} chips
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Select Chip Value</label>
                  <div className="flex gap-2 mt-2">
                    {[25, 100, 500, 1000, 5000].map(value =>
                      <div key={`chip-${value}`}>
                        {getChipComponent(value, selectedChip === value)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentBet(prev => Math.min(prev + selectedChip, playerChips))}
                    disabled={playerHand.length > 0}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Bet
                  </Button>
                  <Button
                    onClick={() => setCurrentBet(0)}
                    disabled={playerHand.length > 0}
                    variant="outline"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Quick Bets</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[100, 500, 1000, 2500].map(amount => (
                      <Button
                        key={amount}
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentBet(amount)}
                        disabled={amount > playerChips || playerHand.length > 0}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROULETTE */}
        <TabsContent value="roulette" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-red-800 to-green-800 text-white">
                <CardContent className="p-6">
                  {/* Wheel */}
                  <div className="text-center mb-6">
                    <div className={`w-64 h-64 mx-auto rounded-full border-8 border-gold-400 bg-gradient-to-br from-red-600 to-green-600 flex items-center justify-center ${
                      wheelSpinning ? 'animate-spin' : ''
                    }`}>
                      <div className="text-4xl font-bold text-white">
                        {rouletteResult !== null ? rouletteResult : '?'}
                      </div>
                    </div>
                    
                    {rouletteResult !== null && (
                      <Badge className={`mt-4 ${
                        getRouletteColor(rouletteResult) === 'red' ? 'bg-red-500' :
                        getRouletteColor(rouletteResult) === 'black' ? 'bg-black' :
                        'bg-green-500'
                      }`}>
                        {rouletteResult} - {getRouletteColor(rouletteResult).toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {/* Betting Grid */}
                  <div className="grid grid-cols-13 gap-1 mb-4 text-xs">
                    {/* Numbers 1-36 */}
                    {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                      <Button
                        key={`roulette-${num}`}
                        size="sm"
                        className={`w-8 h-8 text-white ${
                          getRouletteColor(num) === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'
                        }`}
                        onClick={() => placeBet(`number-${num}`, selectedChip)}
                      >
                        {num}
                      </Button>
                    ))}
                    
                    {/* Zero */}
                    <Button
                      size="sm"
                      className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white col-span-1"
                      onClick={() => placeBet('number-0', selectedChip)}
                    >
                      0
                    </Button>
                  </div>

                  {/* Outside Bets */}
                  <div className="grid grid-cols-6 gap-2 mb-4">
                    <Button
                      onClick={() => placeBet('red', selectedChip)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Red
                    </Button>
                    <Button
                      onClick={() => placeBet('black', selectedChip)}
                      className="bg-black hover:bg-gray-800"
                    >
                      Black
                    </Button>
                    <Button
                      onClick={() => placeBet('even', selectedChip)}
                      variant="outline"
                    >
                      Even
                    </Button>
                    <Button
                      onClick={() => placeBet('odd', selectedChip)}
                      variant="outline"
                    >
                      Odd
                    </Button>
                    <Button
                      onClick={() => placeBet('1-18', selectedChip)}
                      variant="outline"
                    >
                      1-18
                    </Button>
                    <Button
                      onClick={() => placeBet('19-36', selectedChip)}
                      variant="outline"
                    >
                      19-36
                    </Button>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={spinRoulette}
                      disabled={wheelSpinning || Object.keys(rouletteBets).length === 0}
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Spin
                    </Button>
                    <Button
                      onClick={() => setRouletteBets({})}
                      disabled={wheelSpinning}
                      variant="outline"
                    >
                      Clear Bets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Betting Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Your Bets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Bet</label>
                  <div className="text-2xl font-bold text-gold-400">
                    {Object.values(rouletteBets).reduce((sum, bet) => sum + bet, 0).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  {Object.entries(rouletteBets).map(([betType, amount]) => (
                    <div key={`bet-${betType}`} className="flex justify-between text-sm">
                      <span className="capitalize">{betType.replace('-', ' ')}</span>
                      <span className="font-bold">{amount}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium">Chip Value</label>
                  <div className="flex gap-2 mt-2">
                    {[25, 100, 500, 1000].map(value => 
                      getChipComponent(value, selectedChip === value)
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent Numbers</h4>
                  <div className="flex gap-1 flex-wrap">
                    {rouletteHistory.map((num, index) => (
                      <div
                        key={`history-${index}-${num}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          getRouletteColor(num) === 'red' ? 'bg-red-500' :
                          getRouletteColor(num) === 'black' ? 'bg-black' :
                          'bg-green-500'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BACCARAT */}
        <TabsContent value="baccarat" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-br from-purple-800 to-blue-800 text-white min-h-96">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Player */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-4">
                        Player ({playerHand_Baccarat.value})
                        {playerHand_Baccarat.natural && <Badge className="ml-2 bg-gold-500 text-black">Natural</Badge>}
                      </h3>
                      <div className="flex justify-center gap-2">
                        {playerHand_Baccarat.cards.map((card, index) => (
                          <CardComponent key={`baccarat-player-${index}-${card.suit}-${card.rank}`} card={card} />
                        ))}
                      </div>
                    </div>

                    {/* Banker */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold mb-4">
                        Banker ({bankerHand.value})
                        {bankerHand.natural && <Badge className="ml-2 bg-gold-500 text-black">Natural</Badge>}
                      </h3>
                      <div className="flex justify-center gap-2">
                        {bankerHand.cards.map((card, index) => (
                          <CardComponent key={`baccarat-banker-${index}-${card.suit}-${card.rank}`} card={card} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Betting Areas */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div
                      className="bg-blue-600/50 border-2 border-blue-400 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-600/70 transition-colors"
                      onClick={() => {
                        setBaccaratBets(prev => ({ ...prev, player: prev.player + selectedChip }));
                        setPlayerChips(prev => prev - selectedChip);
                      }}
                    >
                      <h3 className="font-bold text-lg">PLAYER</h3>
                      <div className="text-sm">Pays 1:1</div>
                      <div className="text-gold-400 font-bold mt-2">
                        {baccaratBets.player > 0 && `${baccaratBets.player} chips`}
                      </div>
                    </div>

                    <div
                      className="bg-green-600/50 border-2 border-green-400 rounded-lg p-6 text-center cursor-pointer hover:bg-green-600/70 transition-colors"
                      onClick={() => {
                        setBaccaratBets(prev => ({ ...prev, tie: prev.tie + selectedChip }));
                        setPlayerChips(prev => prev - selectedChip);
                      }}
                    >
                      <h3 className="font-bold text-lg">TIE</h3>
                      <div className="text-sm">Pays 8:1</div>
                      <div className="text-gold-400 font-bold mt-2">
                        {baccaratBets.tie > 0 && `${baccaratBets.tie} chips`}
                      </div>
                    </div>

                    <div
                      className="bg-red-600/50 border-2 border-red-400 rounded-lg p-6 text-center cursor-pointer hover:bg-red-600/70 transition-colors"
                      onClick={() => {
                        setBaccaratBets(prev => ({ ...prev, banker: prev.banker + selectedChip }));
                        setPlayerChips(prev => prev - selectedChip);
                      }}
                    >
                      <h3 className="font-bold text-lg">BANKER</h3>
                      <div className="text-sm">Pays 0.95:1</div>
                      <div className="text-gold-400 font-bold mt-2">
                        {baccaratBets.banker > 0 && `${baccaratBets.banker} chips`}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={dealBaccarat}
                      disabled={baccaratBets.player + baccaratBets.banker + baccaratBets.tie === 0}
                      className="bg-gold-500 hover:bg-gold-600 text-black"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Deal
                    </Button>
                    <Button
                      onClick={() => setBaccaratBets({ player: 0, banker: 0, tie: 0 })}
                      variant="outline"
                    >
                      Clear Bets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Info Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Baccarat Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Bet</label>
                  <div className="text-2xl font-bold text-gold-400">
                    {(baccaratBets.player + baccaratBets.banker + baccaratBets.tie).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Chip Value</label>
                  <div className="flex gap-2 mt-2">
                    {[25, 100, 500, 1000].map(value => 
                      getChipComponent(value, selectedChip === value)
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Card Values</h4>
                  <div className="text-sm space-y-1">
                    <div>• Ace = 1 point</div>
                    <div>• 2-9 = Face value</div>
                    <div>• 10, J, Q, K = 0 points</div>
                    <div>• Only last digit counts</div>
                    <div>• Natural: 8 or 9 with 2 cards</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Payouts</h4>
                  <div className="text-sm space-y-1">
                    <div>• Player: 1:1</div>
                    <div>• Banker: 0.95:1 (5% commission)</div>
                    <div>• Tie: 8:1</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* POKER */}
        <TabsContent value="poker" className="mt-6">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Texas Hold'em Poker</h3>
                <Button
                  onClick={dealPoker}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Deal New Hand
                </Button>
              </div>

              {/* Community Cards */}
              <div className="text-center mb-8">
                <h4 className="text-lg font-bold mb-4">Community Cards</h4>
                <div className="flex justify-center gap-2">
                  {communityCards.map((card, index) => (
                    <CardComponent key={`community-${index}-${card.suit}-${card.rank}`} card={card} />
                  ))}
                </div>
              </div>

              {/* Player Hand */}
              <div className="text-center">
                <h4 className="text-lg font-bold mb-4">Your Hand</h4>
                <div className="flex justify-center gap-2 mb-4">
                  {pokerHand.map((card, index) => (
                    <CardComponent key={`poker-hand-${index}-${card.suit}-${card.rank}`} card={card} />
                  ))}
                </div>
                
                {pokerHand.length > 0 && (
                  <div className="flex justify-center gap-4">
                    <Button className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Raise
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600">
                      <XCircle className="w-4 h-4 mr-2" />
                      Fold
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gameHistory.slice(0, 5).map((game, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className="capitalize">{game.game}</Badge>
                  <span className="text-sm">Bet: {game.bet} chips</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    game.result === "win" ? "text-green-500" :
                    game.result === "push" ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    {game.winnings > 0 ? `+${game.winnings}` : game.winnings} chips
                  </span>
                  <Badge className={
                    game.result === "win" ? "bg-green-500" :
                    game.result === "push" ? "bg-yellow-500" :
                    "bg-red-500"
                  }>
                    {game.result}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
