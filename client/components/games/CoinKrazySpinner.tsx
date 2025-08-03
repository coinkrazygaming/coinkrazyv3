import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trackSCWin } from '../../utils/scWinTracker';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX,
  Coins,
  Crown,
  Trophy,
  Star,
  Zap,
  Heart,
  Diamond,
  Gift
} from 'lucide-react';

interface SpinResult {
  symbols: string[];
  paylines: Array<{ line: number; symbols: string[]; multiplier: number; payout: number }>;
  totalPayout: number;
  isWin: boolean;
}

interface GameStats {
  totalSpins: number;
  totalBet: number;
  totalWon: number;
  biggestWin: number;
  currentStreak: number;
  balance: number;
}

const SYMBOLS = {
  '🪙': { value: 500, name: 'CoinKrazy Logo', rarity: 'legendary' },
  '👑': { value: 200, name: 'Crown', rarity: 'epic' },
  '💎': { value: 100, name: 'Diamond', rarity: 'rare' },
  '🎰': { value: 50, name: 'Slot Machine', rarity: 'uncommon' },
  '🍀': { value: 25, name: 'Lucky Clover', rarity: 'common' },
  '⭐': { value: 15, name: 'Star', rarity: 'common' },
  '🎯': { value: 10, name: 'Target', rarity: 'common' },
  '🎲': { value: 5, name: 'Dice', rarity: 'common' }
};

const PAYLINES = [
  [1, 1, 1, 1, 1], // Middle row
  [0, 0, 0, 0, 0], // Top row
  [2, 2, 2, 2, 2], // Bottom row
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // Inverted V
  [0, 0, 1, 2, 2], // Diagonal
  [2, 2, 1, 0, 0], // Reverse diagonal
  [1, 0, 0, 0, 1], // M shape
  [1, 2, 2, 2, 1], // W shape
  [0, 1, 0, 1, 0], // Zigzag
  [2, 1, 2, 1, 2], // Reverse zigzag
  [1, 1, 0, 1, 1], // Crown
  [1, 1, 2, 1, 1], // Inverted crown
  [0, 2, 0, 2, 0], // X pattern top
  [2, 0, 2, 0, 2], // X pattern bottom
  [0, 1, 1, 1, 0], // Tent
  [2, 1, 1, 1, 2], // Inverted tent
  [1, 0, 1, 0, 1], // Center zigzag
  [1, 2, 1, 2, 1], // Center reverse zigzag
  [0, 0, 2, 0, 0], // V top
  [2, 2, 0, 2, 2], // V bottom
  [1, 0, 2, 0, 1], // Diamond
  [1, 2, 0, 2, 1], // Reverse diamond
  [0, 1, 1, 0, 2], // Complex 1
  [2, 1, 1, 2, 0]  // Complex 2
];

export default function CoinKrazySpinner() {
  const [reels, setReels] = useState<string[][]>([
    ['🎲', '🎯', '⭐'],
    ['🍀', '🎰', '💎'],
    ['👑', '🪙', '🍀'],
    ['⭐', '🎯', '🎰'],
    ['🎲', '💎', '👑']
  ]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bet, setBet] = useState(1.00);
  const [balance, setBalance] = useState(1000.00);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalSpins: 0,
    totalBet: 0,
    totalWon: 0,
    biggestWin: 0,
    currentStreak: 0,
    balance: 1000.00
  });
  
  const [winAnimations, setWinAnimations] = useState<Array<{ line: number; symbols: string[] }>>([]);
  const [jackpotWin, setJackpotWin] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoPlay && !isSpinning && balance >= bet) {
      autoPlayRef.current = setTimeout(() => {
        spin();
      }, 2000);
    }
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, isSpinning, balance, bet]);

  const getRandomSymbol = () => {
    const symbolKeys = Object.keys(SYMBOLS);
    const weights = symbolKeys.map(symbol => {
      const rarity = SYMBOLS[symbol as keyof typeof SYMBOLS].rarity;
      switch (rarity) {
        case 'legendary': return 1;
        case 'epic': return 3;
        case 'rare': return 8;
        case 'uncommon': return 15;
        case 'common': return 25;
        default: return 10;
      }
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < symbolKeys.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbolKeys[i];
      }
    }
    
    return symbolKeys[symbolKeys.length - 1];
  };

  const generateReels = (): string[][] => {
    return Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => getRandomSymbol())
    );
  };

  const checkWinningLines = (newReels: string[][]): SpinResult => {
    const winningLines: Array<{ line: number; symbols: string[]; multiplier: number; payout: number }> = [];
    let totalPayout = 0;

    PAYLINES.forEach((payline, lineIndex) => {
      const lineSymbols = payline.map((row, col) => newReels[col][row]);
      
      // Check for matching symbols
      let matchCount = 1;
      const firstSymbol = lineSymbols[0];
      
      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i] === firstSymbol || lineSymbols[i] === '🪙') { // 🪙 is wild
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        const symbolValue = SYMBOLS[firstSymbol as keyof typeof SYMBOLS]?.value || 1;
        let multiplier = 1;
        
        switch (matchCount) {
          case 3: multiplier = 1; break;
          case 4: multiplier = 5; break;
          case 5: multiplier = 20; break;
        }

        // Bonus multipliers for special symbols
        if (firstSymbol === '🪙') multiplier *= 10; // CoinKrazy logo bonus
        if (firstSymbol === '👑') multiplier *= 3;  // Crown bonus
        if (firstSymbol === '💎') multiplier *= 2;  // Diamond bonus

        const linePayout = (bet * symbolValue * multiplier) / 100;
        
        winningLines.push({
          line: lineIndex,
          symbols: lineSymbols.slice(0, matchCount),
          multiplier,
          payout: linePayout
        });
        
        totalPayout += linePayout;
      }
    });

    // Jackpot check - 5 CoinKrazy logos
    const middleRow = newReels.map(reel => reel[1]);
    if (middleRow.every(symbol => symbol === '🪙')) {
      totalPayout += bet * 1000; // Jackpot multiplier
      setJackpotWin(true);
      setTimeout(() => setJackpotWin(false), 5000);
    }

    return {
      symbols: newReels.flat(),
      paylines: winningLines,
      totalPayout,
      isWin: totalPayout > 0
    };
  };

  const spin = async () => {
    if (isSpinning || balance < bet) return;
    
    setIsSpinning(true);
    setLastResult(null);
    setWinAnimations([]);
    
    // Deduct bet from balance
    const newBalance = balance - bet;
    setBalance(newBalance);
    
    // Update stats
    setGameStats(prev => ({
      ...prev,
      totalSpins: prev.totalSpins + 1,
      totalBet: prev.totalBet + bet,
      balance: newBalance
    }));

    // Simulate spinning animation
    const spinDuration = 2000 + Math.random() * 1000;
    const intervalDuration = 100;
    const totalIntervals = Math.floor(spinDuration / intervalDuration);
    let currentInterval = 0;

    const spinInterval = setInterval(() => {
      setReels(generateReels());
      currentInterval++;
      
      if (currentInterval >= totalIntervals) {
        clearInterval(spinInterval);
        
        // Final result
        const finalReels = generateReels();
        const result = checkWinningLines(finalReels);
        
        setReels(finalReels);
        setLastResult(result);
        
        if (result.isWin) {
          const newBalanceWithWin = newBalance + result.totalPayout;
          setBalance(newBalanceWithWin);
          setWinAnimations(result.paylines.map(line => ({ line: line.line, symbols: line.symbols })));
          
          // Update win stats
          setGameStats(prev => ({
            ...prev,
            totalWon: prev.totalWon + result.totalPayout,
            biggestWin: Math.max(prev.biggestWin, result.totalPayout),
            currentStreak: prev.currentStreak + 1,
            balance: newBalanceWithWin
          }));
          
          // Play win sound effect
          if (soundEnabled) {
            // Audio would be implemented here
          }
        } else {
          setGameStats(prev => ({
            ...prev,
            currentStreak: 0,
            balance: newBalance
          }));
        }
        
        setIsSpinning(false);
      }
    }, intervalDuration);
  };

  const getSymbolRarityColor = (symbol: string) => {
    const rarity = SYMBOLS[symbol as keyof typeof SYMBOLS]?.rarity;
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 animate-pulse';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      case 'uncommon': return 'text-green-400';
      case 'common': return 'text-gray-300';
      default: return 'text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gold-500/10 to-casino-blue/10 border-gold-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-black" />
            </div>
            CoinKrazy Spinner
            <Badge className="bg-gold-500 text-black">RTP: 96.8%</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Jackpot Alert */}
      {jackpotWin && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-gold-500/20 border-yellow-500 animate-pulse">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">🎊 JACKPOT! 🎊</div>
            <div className="text-xl text-gold-400">Congratulations! You hit the CoinKrazy Jackpot!</div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Slot Machine */}
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {reels.map((reel, reelIndex) => (
                    <div key={reelIndex} className="space-y-1">
                      {reel.map((symbol, symbolIndex) => (
                        <div
                          key={`${reelIndex}-${symbolIndex}`}
                          className={`
                            h-20 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg 
                            flex items-center justify-center text-4xl border-2 border-gray-600
                            transition-all duration-200 hover:border-gold-500/50
                            ${isSpinning ? 'animate-pulse' : ''}
                            ${getSymbolRarityColor(symbol)}
                          `}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Win Lines Overlay */}
                {winAnimations.length > 0 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {winAnimations.map((win, index) => (
                      <div
                        key={index}
                        className="absolute inset-0 bg-gold-500/20 animate-pulse rounded-lg"
                        style={{
                          animationDelay: `${index * 200}ms`,
                          animationDuration: '1s'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Paylines Display */}
                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-gold-400 border-gold-500">
                    25 Active Paylines
                  </Badge>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Bet Amount</label>
                    <select 
                      value={bet}
                      onChange={(e) => setBet(parseFloat(e.target.value))}
                      disabled={isSpinning}
                      className="w-24 p-2 rounded border bg-background"
                    >
                      <option value={0.25}>$0.25</option>
                      <option value={0.50}>$0.50</option>
                      <option value={1.00}>$1.00</option>
                      <option value={2.50}>$2.50</option>
                      <option value={5.00}>$5.00</option>
                      <option value={10.00}>$10.00</option>
                      <option value={25.00}>$25.00</option>
                      <option value={50.00}>$50.00</option>
                      <option value={100.00}>$100.00</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="outline"
                    size="sm"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>

                  <Button
                    onClick={() => setAutoPlay(!autoPlay)}
                    variant={autoPlay ? "default" : "outline"}
                    size="sm"
                    disabled={isSpinning}
                  >
                    {autoPlay ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    Auto Play
                  </Button>
                </div>

                <Button
                  onClick={spin}
                  disabled={isSpinning || balance < bet}
                  size="lg"
                  className={`
                    px-8 py-4 text-lg font-bold min-w-[120px]
                    ${isSpinning 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black'
                    }
                  `}
                >
                  {isSpinning ? (
                    <RotateCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    'SPIN'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Last Win Display */}
          {lastResult?.isWin && (
            <Card className="mt-4 bg-gradient-to-r from-green-500/10 to-green-500/20 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gold-400" />
                    <span className="font-bold text-green-400">WIN!</span>
                    <span className="text-sm text-muted-foreground">
                      {lastResult.paylines.length} winning line{lastResult.paylines.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-green-400">
                    +{formatCurrency(lastResult.totalPayout)}
                  </div>
                </div>
                
                <div className="mt-2 space-y-1">
                  {lastResult.paylines.map((line, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      Line {line.line + 1}: {line.symbols.join(' ')} × {line.multiplier} = {formatCurrency(line.payout)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(balance)}
              </div>
              {balance < bet && (
                <div className="text-sm text-red-400 mt-1">
                  Insufficient funds for current bet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spins:</span>
                <span className="font-medium">{gameStats.totalSpins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bet:</span>
                <span className="font-medium">{formatCurrency(gameStats.totalBet)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Won:</span>
                <span className="font-medium text-green-400">{formatCurrency(gameStats.totalWon)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biggest Win:</span>
                <span className="font-medium text-gold-400">{formatCurrency(gameStats.biggestWin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Win Streak:</span>
                <span className="font-medium">{gameStats.currentStreak}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Net:</span>
                <span className={`font-bold ${gameStats.totalWon - gameStats.totalBet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(gameStats.totalWon - gameStats.totalBet)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Paytable */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paytable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {Object.entries(SYMBOLS).map(([symbol, data]) => (
                  <div key={symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${getSymbolRarityColor(symbol)}`}>{symbol}</span>
                      <span className="text-xs text-muted-foreground">{data.name}</span>
                    </div>
                    <span className="font-medium">{data.value}x</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <div>🪙 = Wild Symbol (substitutes for any)</div>
                <div>5x 🪙 = Jackpot (1000x bet)</div>
                <div>Payouts shown are for 5-of-a-kind</div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-400" />
                  <span>25 Paylines</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Wild Symbols</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold-400" />
                  <span>Progressive Jackpot</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Auto Play</span>
                </div>
                <div className="flex items-center gap-2">
                  <Diamond className="w-4 h-4 text-purple-400" />
                  <span>Bonus Multipliers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
