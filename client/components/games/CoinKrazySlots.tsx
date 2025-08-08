import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { gamesService } from "@/services/gamesService";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coins, 
  Crown, 
  Zap,
  Trophy,
  Diamond,
  Star,
  Heart,
  Cherry,
  Grape
} from "lucide-react";

interface SlotSymbol {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface SpinResult {
  symbols: string[][];
  winLines: number[];
  totalWin: number;
  multiplier: number;
  isJackpot: boolean;
}

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', icon: Cherry, value: 2, color: 'text-red-500', rarity: 'common' },
  { id: 'grape', icon: Grape, value: 3, color: 'text-purple-500', rarity: 'common' },
  { id: 'heart', icon: Heart, value: 5, color: 'text-pink-500', rarity: 'common' },
  { id: 'star', icon: Star, value: 8, color: 'text-yellow-500', rarity: 'rare' },
  { id: 'diamond', icon: Diamond, value: 15, color: 'text-blue-500', rarity: 'rare' },
  { id: 'crown', icon: Crown, value: 25, color: 'text-gold-500', rarity: 'epic' },
  { id: 'zap', icon: Zap, value: 50, color: 'text-purple-600', rarity: 'legendary' },
  { id: 'trophy', icon: Trophy, value: 100, color: 'text-gold-600', rarity: 'legendary' }
];

const PAYLINES = [
  [1, 1, 1, 1, 1], // Middle row
  [0, 0, 0, 0, 0], // Top row
  [2, 2, 2, 2, 2], // Bottom row
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // Inverted V
  [1, 0, 0, 0, 1], // W shape
  [1, 2, 2, 2, 1], // Inverted W
  [0, 0, 1, 2, 2], // Diagonal
  [2, 2, 1, 0, 0], // Reverse diagonal
  [1, 2, 1, 0, 1]  // Zigzag
];

interface CoinKrazySlotsProps {
  currency: 'GC' | 'SC';
  betAmount: number;
  onBetChange: (amount: number) => void;
  onSpinComplete: (result: { win: number; balance: number }) => void;
}

export default function CoinKrazySlots({ 
  currency, 
  betAmount, 
  onBetChange, 
  onSpinComplete 
}: CoinKrazySlotsProps) {
  const { user } = useAuth();
  const [reels, setReels] = useState<string[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [winAnimation, setWinAnimation] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(125847);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    initializeReels();
    
    // Update jackpot every 10 seconds
    const interval = setInterval(() => {
      setJackpotAmount(prev => prev + Math.floor(Math.random() * 100) + 10);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const initializeReels = () => {
    const initialReels = Array(5).fill(null).map(() => 
      Array(3).fill(null).map(() => 
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id
      )
    );
    setReels(initialReels);
  };

  const getSymbolByIndex = (reel: number, row: number): SlotSymbol => {
    const symbolId = reels[reel]?.[row] || 'cherry';
    return SLOT_SYMBOLS.find(s => s.id === symbolId) || SLOT_SYMBOLS[0];
  };

  const checkWinLines = (reels: string[][]): { winLines: number[]; totalWin: number } => {
    const winLines: number[] = [];
    let totalWin = 0;

    PAYLINES.forEach((line, lineIndex) => {
      const lineSymbols = line.map((row, reel) => reels[reel][row]);
      const winResult = checkLineWin(lineSymbols);
      
      if (winResult.win > 0) {
        winLines.push(lineIndex);
        totalWin += winResult.win * betAmount;
      }
    });

    return { winLines, totalWin };
  };

  const checkLineWin = (symbols: string[]): { win: number; count: number } => {
    const firstSymbol = symbols[0];
    let count = 1;
    
    for (let i = 1; i < symbols.length; i++) {
      if (symbols[i] === firstSymbol) {
        count++;
      } else {
        break;
      }
    }

    const symbol = SLOT_SYMBOLS.find(s => s.id === firstSymbol);
    if (!symbol) return { win: 0, count: 0 };

    // Win multipliers based on consecutive symbols
    const multipliers = { 3: 1, 4: 3, 5: 10 };
    const multiplier = multipliers[count as keyof typeof multipliers] || 0;
    
    return { win: symbol.value * multiplier, count };
  };

  const generateSpinResult = (): SpinResult => {
    const rtp = 0.96; // 96% RTP
    const random = Math.random();
    
    // Determine if this should be a winning spin
    const shouldWin = random < rtp;
    
    let newReels: string[][];
    
    if (shouldWin) {
      // Generate a winning combination
      newReels = generateWinningReels();
    } else {
      // Generate random losing combination
      newReels = Array(5).fill(null).map(() => 
        Array(3).fill(null).map(() => 
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id
        )
      );
    }

    const { winLines, totalWin } = checkWinLines(newReels);
    
    // Check for jackpot (very rare)
    const isJackpot = random < 0.0001 && totalWin > 0;
    const jackpotWin = isJackpot ? Math.floor(jackpotAmount * 0.1) : 0;
    
    return {
      symbols: newReels,
      winLines,
      totalWin: totalWin + jackpotWin,
      multiplier: totalWin > 0 ? Math.floor(totalWin / betAmount) + 1 : 1,
      isJackpot
    };
  };

  const generateWinningReels = (): string[][] => {
    const winSymbol = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
    const winLine = Math.floor(Math.random() * PAYLINES.length);
    const payline = PAYLINES[winLine];
    const winLength = Math.random() < 0.7 ? 3 : Math.random() < 0.9 ? 4 : 5;
    
    const newReels = Array(5).fill(null).map(() => 
      Array(3).fill(null).map(() => 
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id
      )
    );
    
    // Place winning symbols
    for (let i = 0; i < winLength; i++) {
      const row = payline[i];
      newReels[i][row] = winSymbol.id;
    }
    
    return newReels;
  };

  const spin = async () => {
    if (!user || spinning) return;
    
    setSpinning(true);
    setWinAnimation(false);
    setLastResult(null);
    
    // Simulate spinning animation
    const spinDuration = 2000 + Math.random() * 1000;
    const spinInterval = setInterval(() => {
      setReels(Array(5).fill(null).map(() => 
        Array(3).fill(null).map(() => 
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id
        )
      ));
    }, 100);
    
    setTimeout(async () => {
      clearInterval(spinInterval);
      
      const result = generateSpinResult();
      setReels(result.symbols);
      setLastResult(result);
      setSpinning(false);
      
      if (result.totalWin > 0) {
        setWinAnimation(true);
        playWinSound();
        
        // Update jackpot if won
        if (result.isJackpot) {
          setJackpotAmount(prev => prev * 0.9); // Reduce jackpot after win
        }
      }
      
      // Report result to parent
      onSpinComplete({
        win: result.totalWin,
        balance: result.totalWin - betAmount // Net change
      });
      
    }, spinDuration);
  };

  const playWinSound = () => {
    // In a real implementation, you'd have actual sound files
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const autoSpin = () => {
    if (!spinning) {
      const autoSpinInterval = setInterval(() => {
        if (!spinning) {
          spin();
        }
      }, 3000);
      
      // Stop auto spin after 10 spins
      setTimeout(() => clearInterval(autoSpinInterval), 30000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Jackpot Display */}
      <div className="text-center mb-6">
        <div className="bg-gradient-to-r from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-lg p-4">
          <div className="text-sm text-gold-400 mb-1">PROGRESSIVE JACKPOT</div>
          <div className="text-3xl font-bold text-gold-500 font-mono">
            ${jackpotAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Slot Machine */}
      <Card className="bg-gradient-to-b from-gray-900 to-gray-800 border-2 border-gold-500/30">
        <CardContent className="p-8">
          {/* Reels */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {reels.map((reel, reelIndex) => (
              <div key={reelIndex} className="space-y-2">
                {reel.map((symbolId, rowIndex) => {
                  const symbol = SLOT_SYMBOLS.find(s => s.id === symbolId) || SLOT_SYMBOLS[0];
                  const isWinningSymbol = lastResult?.winLines.some(lineIndex => {
                    const payline = PAYLINES[lineIndex];
                    return payline[reelIndex] === rowIndex;
                  });
                  
                  return (
                    <div
                      key={`${reelIndex}-${rowIndex}`}
                      className={`
                        aspect-square bg-gradient-to-br from-gray-700 to-gray-800 
                        border-2 border-gray-600 rounded-lg flex items-center justify-center
                        transition-all duration-300
                        ${spinning ? 'animate-pulse' : ''}
                        ${isWinningSymbol && winAnimation ? 'border-gold-500 bg-gold-500/20 animate-bounce' : ''}
                      `}
                    >
                      <symbol.icon 
                        className={`w-8 h-8 ${symbol.color} ${spinning ? 'blur-sm' : ''}`} 
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win Display */}
          {lastResult && lastResult.totalWin > 0 && (
            <div className={`text-center mb-4 ${winAnimation ? 'animate-pulse' : ''}`}>
              <div className="text-2xl font-bold text-green-400">
                WIN! +{lastResult.totalWin} {currency}
              </div>
              {lastResult.isJackpot && (
                <div className="text-lg font-bold text-gold-500 animate-bounce">
                  🎉 JACKPOT! 🎉
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                {lastResult.winLines.length} winning line{lastResult.winLines.length !== 1 ? 's' : ''} 
                × {lastResult.multiplier}x multiplier
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => onBetChange(Math.max(10, betAmount - 10))}
              disabled={spinning}
            >
              Bet -{currency === 'GC' ? '10' : '1'}
            </Button>
            
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Bet Amount</div>
              <div className="font-bold">{betAmount} {currency}</div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => onBetChange(betAmount + (currency === 'GC' ? 10 : 1))}
              disabled={spinning}
            >
              Bet +{currency === 'GC' ? '10' : '1'}
            </Button>
            
            <Button
              onClick={spin}
              disabled={spinning}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8"
            >
              {spinning ? (
                <RotateCcw className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {spinning ? 'Spinning...' : 'SPIN'}
            </Button>
            
            <Button
              variant="outline"
              onClick={autoSpin}
              disabled={spinning}
            >
              Auto Spin
            </Button>
          </div>

          {/* Paytable */}
          <div className="mt-6 grid grid-cols-4 gap-2 text-xs">
            {SLOT_SYMBOLS.map(symbol => (
              <div key={symbol.id} className="flex items-center space-x-2 p-2 bg-gray-700/50 rounded">
                <symbol.icon className={`w-4 h-4 ${symbol.color}`} />
                <div>
                  <div className="font-mono">{symbol.value}x</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      symbol.rarity === 'legendary' ? 'border-gold-500 text-gold-400' :
                      symbol.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                      symbol.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                      'border-gray-500 text-gray-400'
                    }`}
                  >
                    {symbol.rarity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for win sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/win.mp3" type="audio/mpeg" />
        <source src="/sounds/win.ogg" type="audio/ogg" />
      </audio>
    </div>
  );
}
