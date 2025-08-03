import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  Users,
  Timer,
  Trophy,
  Crown,
  Coins,
  Star,
  Gift,
  Volume2,
  VolumeX,
  Settings,
  TrendingUp
} from 'lucide-react';

interface BingoRoom {
  id: string;
  name: string;
  type: '30-ball' | '75-ball' | '90-ball';
  nextGame: string;
  pot: number;
  players: number;
  ticketPrice: { gc: number; sc: number };
  icon: string;
  featured: boolean;
}

interface BingoCard {
  id: string;
  numbers: (number | null)[];
  marked: boolean[];
}

export default function Bingo() {
  const [selectedRoom, setSelectedRoom] = useState<BingoRoom | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [playerCards, setPlayerCards] = useState<BingoCard[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoMark, setAutoMark] = useState(true);
  
  const [rooms] = useState<BingoRoom[]>([
    { 
      id: '1', 
      name: 'Golden Room', 
      type: '90-ball', 
      nextGame: '2 min', 
      pot: 15450, 
      players: 234, 
      ticketPrice: { gc: 1000, sc: 5 },
      icon: '🏆',
      featured: true
    },
    { 
      id: '2', 
      name: 'Silver Room', 
      type: '75-ball', 
      nextGame: '5 min', 
      pot: 8750, 
      players: 167, 
      ticketPrice: { gc: 500, sc: 2 },
      icon: '🥈',
      featured: false
    },
    { 
      id: '3', 
      name: 'Bronze Room', 
      type: '30-ball', 
      nextGame: '1 min', 
      pot: 4250, 
      players: 89, 
      ticketPrice: { gc: 250, sc: 1 },
      icon: '🥉',
      featured: false
    },
    { 
      id: '4', 
      name: 'Speed Bingo', 
      type: '30-ball', 
      nextGame: '30 sec', 
      pot: 2100, 
      players: 156, 
      ticketPrice: { gc: 100, sc: 0 },
      icon: '⚡',
      featured: false
    }
  ]);

  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [gameTimer, setGameTimer] = useState(120);

  useEffect(() => {
    if (gameState === 'active') {
      const interval = setInterval(() => {
        // Simulate calling numbers
        const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1)
          .filter(n => !calledNumbers.includes(n));
        
        if (availableNumbers.length > 0 && Math.random() > 0.7) {
          const newNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
          setCurrentNumber(newNumber);
          setCalledNumbers(prev => [...prev, newNumber]);
          
          if (soundEnabled) {
            // Play sound effect
            console.log(`Called: ${newNumber}`);
          }
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [gameState, calledNumbers, soundEnabled]);

  useEffect(() => {
    if (gameState === 'waiting') {
      const countdown = setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            setGameState('active');
            setGameTimer(300); // 5 minutes game time
            return 300;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    } else if (gameState === 'active') {
      const countdown = setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [gameState]);

  const generateBingoCard = (type: '30-ball' | '75-ball' | '90-ball'): BingoCard => {
    let numbers: (number | null)[];
    
    switch (type) {
      case '30-ball':
        numbers = Array.from({ length: 9 }, (_, i) => Math.floor(Math.random() * 30) + 1);
        break;
      case '75-ball':
        numbers = Array.from({ length: 25 }, (_, i) => {
          if (i === 12) return null; // Free space
          const col = Math.floor(i / 5);
          return Math.floor(Math.random() * 15) + (col * 15) + 1;
        });
        break;
      case '90-ball':
        numbers = Array.from({ length: 27 }, (_, i) => {
          if (Math.random() > 0.5) return null;
          const col = i % 9;
          return Math.floor(Math.random() * 10) + (col * 10) + 1;
        });
        break;
    }
    
    return {
      id: Date.now().toString(),
      numbers,
      marked: new Array(numbers.length).fill(false)
    };
  };

  const enterRoom = (room: BingoRoom) => {
    setSelectedRoom(room);
    setPlayerCards([generateBingoCard(room.type)]);
    setCalledNumbers([]);
    setCurrentNumber(null);
    setGameState('waiting');
    setGameTimer(120);
  };

  const buyExtraCard = () => {
    if (selectedRoom) {
      setPlayerCards(prev => [...prev, generateBingoCard(selectedRoom.type)]);
    }
  };

  const markNumber = (cardId: string, index: number) => {
    setPlayerCards(prev => prev.map(card => {
      if (card.id === cardId && card.numbers[index] && calledNumbers.includes(card.numbers[index]!)) {
        const newMarked = [...card.marked];
        newMarked[index] = !newMarked[index];
        return { ...card, marked: newMarked };
      }
      return card;
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Live Bingo Rooms</h1>
              <p className="text-muted-foreground text-lg">Join thousands of players in real-time bingo action</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Room Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Card key={room.id} className={`hover:shadow-xl transition-all duration-300 ${
                room.featured ? 'border-gold-500/50 bg-gradient-to-br from-gold/5 to-gold/10' : 'border-border/50 hover:border-casino-blue/50'
              }`}>
                {room.featured && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gold-500 text-black">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{room.icon}</div>
                  <CardTitle>{room.name}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {room.type}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Game:</span>
                      <span className="font-bold text-casino-blue">{room.nextGame}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prize Pool:</span>
                      <span className="text-gold-400 font-bold">${room.pot.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-bold">{room.players}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket Cost:</span>
                      <div className="text-sm">
                        <span className="text-gold-400">{room.ticketPrice.gc} GC</span>
                        {room.ticketPrice.sc > 0 && (
                          <span className="text-casino-blue ml-2">+ {room.ticketPrice.sc} SC</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => enterRoom(room)}
                    className={`w-full ${
                      room.featured 
                        ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold'
                        : 'bg-casino-blue hover:bg-casino-blue-dark'
                    }`}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Enter Room
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Users className="w-12 h-12 text-casino-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Live Multiplayer</h3>
              <p className="text-muted-foreground">
                Play with hundreds of real players in real-time bingo games
              </p>
            </div>
            <div className="text-center">
              <Trophy className="w-12 h-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Big Jackpots</h3>
              <p className="text-muted-foreground">
                Win massive cash prizes with Sweeps Coins in every game
              </p>
            </div>
            <div className="text-center">
              <Gift className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Auto-Play</h3>
              <p className="text-muted-foreground">
                Smart auto-marking and multiple card management features
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Game Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-6 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => setSelectedRoom(null)}>
                ← Back to Rooms
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-2xl">{selectedRoom.icon}</span>
                  {selectedRoom.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{selectedRoom.type}</span>
                  <span>{selectedRoom.players} players</span>
                  <span>Prize: ${selectedRoom.pot.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-casino-blue">
                  {formatTime(gameTimer)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {gameState === 'waiting' ? 'Next Game' : gameState === 'active' ? 'Time Left' : 'Game Over'}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Called Numbers */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Called Numbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentNumber && (
                  <div className="text-center mb-4 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg">
                    <div className="text-3xl font-bold text-gold-400">{currentNumber}</div>
                    <div className="text-sm text-muted-foreground">Latest</div>
                  </div>
                )}
                
                <div className="grid grid-cols-5 gap-1 text-xs">
                  {Array.from({ length: 90 }, (_, i) => i + 1).map(num => (
                    <div
                      key={num}
                      className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${
                        calledNumbers.includes(num)
                          ? 'bg-gold-500 text-black'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bingo Cards */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Cards ({playerCards.length})</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={buyExtraCard}
                  disabled={gameState === 'active'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buy Extra Card
                </Button>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoMark"
                    checked={autoMark}
                    onChange={(e) => setAutoMark(e.target.checked)}
                  />
                  <label htmlFor="autoMark" className="text-sm">Auto Mark</label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {playerCards.map((card) => (
                <Card key={card.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className={`grid gap-1 ${
                      selectedRoom.type === '30-ball' ? 'grid-cols-3' :
                      selectedRoom.type === '75-ball' ? 'grid-cols-5' : 'grid-cols-9'
                    }`}>
                      {card.numbers.map((number, index) => (
                        <button
                          key={index}
                          onClick={() => markNumber(card.id, index)}
                          disabled={!number || !calledNumbers.includes(number)}
                          className={`w-12 h-12 flex items-center justify-center rounded font-bold text-sm transition-all ${
                            number === null
                              ? 'bg-gold-500 text-black' // Free space
                              : card.marked[index]
                              ? 'bg-casino-blue text-white'
                              : calledNumbers.includes(number)
                              ? 'bg-green-500 text-white animate-pulse'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {number || 'FREE'}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
