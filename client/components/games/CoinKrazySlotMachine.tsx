import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Play,
  Pause,
  Settings,
  Volume2,
  VolumeX,
  RotateCcw,
  Coins,
  Crown,
  Zap,
  Trophy,
  Gift,
  Info,
  TrendingUp,
  Sparkles,
  Star,
  ArrowLeft,
  Maximize,
  Minimize,
  FastForward,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SlotGameConfig, SlotSymbol } from '@/services/slotsGamesConfig';
import { slotsGameEngine, SpinResult, GameSession } from '@/services/slotsGameEngine';
import { balanceService } from '@/services/balanceService';

interface CoinKrazySlotMachineProps {
  gameConfig: SlotGameConfig;
  onExit: () => void;
  currency: 'GC' | 'SC';
  onCurrencyChange: (currency: 'GC' | 'SC') => void;
}

export default function CoinKrazySlotMachine({
  gameConfig,
  onExit,
  currency,
  onCurrencyChange
}: CoinKrazySlotMachineProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentReels, setCurrentReels] = useState<SlotSymbol[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [betAmount, setBetAmount] = useState(gameConfig.minBet[currency]);
  const [balance, setBalance] = useState({ GC: 0, SC: 0 });
  const [winAnimation, setWinAnimation] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoPlayCount, setAutoPlayCount] = useState(0);
  const [maxAutoPlay, setMaxAutoPlay] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [jackpotAmount, setJackpotAmount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(2); // 1=slow, 2=normal, 3=fast
  const [showWinDetails, setShowWinDetails] = useState(true);
  const [gameHistory, setGameHistory] = useState<SpinResult[]>([]);
  const [sessionStats, setSessionStats] = useState({
    totalSpins: 0,
    totalBet: 0,
    totalWon: 0,
    biggestWin: 0,
    currentStreak: 0
  });

  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize component
  useEffect(() => {
    if (user) {
      // Create game session
      const newSession = slotsGameEngine.createSession(gameConfig, user.id, currency);
      setSession(newSession);

      // Load initial balance
      updateBalance();

      // Initialize reels with random symbols
      initializeReels();

      // Load jackpot amount
      const jackpot = slotsGameEngine.getJackpotAmount(gameConfig.id);
      setJackpotAmount(jackpot);

      // Update jackpot periodically
      const jackpotInterval = setInterval(() => {
        const newJackpot = slotsGameEngine.getJackpotAmount(gameConfig.id);
        setJackpotAmount(newJackpot);
      }, 5000);

      return () => {
        clearInterval(jackpotInterval);
        if (newSession) {
          slotsGameEngine.endSession(newSession.sessionId);
        }
      };
    }
  }, [user, gameConfig, currency]);

  // Update balance when it changes
  useEffect(() => {
    if (user) {
      const unsubscribe = balanceService.subscribeToBalanceUpdates(user.id, (userBalance) => {
        setBalance({
          GC: userBalance.gc,
          SC: userBalance.sc
        });
      });

      return unsubscribe;
    }
  }, [user]);

  // Auto play logic
  useEffect(() => {
    if (autoPlay && autoPlayCount < maxAutoPlay && !spinning && canSpin()) {
      const delay = spinSpeed === 3 ? 1000 : spinSpeed === 2 ? 2000 : 3000;
      autoPlayIntervalRef.current = setTimeout(() => {
        handleSpin();
      }, delay);
    } else if (autoPlayCount >= maxAutoPlay) {
      setAutoPlay(false);
      setAutoPlayCount(0);
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearTimeout(autoPlayIntervalRef.current);
      }
    };
  }, [autoPlay, autoPlayCount, maxAutoPlay, spinning, spinSpeed]);

  const updateBalance = () => {
    if (user) {
      const userBalance = balanceService.getUserBalance(user.id);
      setBalance({
        GC: userBalance.gc,
        SC: userBalance.sc
      });
    }
  };

  const initializeReels = () => {
    const initialReels: SlotSymbol[][] = [];
    for (let reel = 0; reel < gameConfig.reels; reel++) {
      const reelSymbols: SlotSymbol[] = [];
      for (let row = 0; row < gameConfig.rows; row++) {
        const randomSymbol = gameConfig.symbols[Math.floor(Math.random() * gameConfig.symbols.length)];
        reelSymbols.push(randomSymbol);
      }
      initialReels.push(reelSymbols);
    }
    setCurrentReels(initialReels);
  };

  const canSpin = (): boolean => {
    return !spinning && balance[currency] >= betAmount && !!session;
  };

  const handleSpin = async () => {
    if (!canSpin() || !session) return;

    setSpinning(true);
    setWinAnimation(false);
    setLastResult(null);

    // Play spin sound
    if (soundEnabled && spinSoundRef.current) {
      spinSoundRef.current.play().catch(() => {});
    }

    try {
      // Animate reels spinning
      const spinDuration = spinSpeed === 3 ? 1500 : spinSpeed === 2 ? 2500 : 3500;
      const spinInterval = setInterval(() => {
        const randomReels: SlotSymbol[][] = [];
        for (let reel = 0; reel < gameConfig.reels; reel++) {
          const reelSymbols: SlotSymbol[] = [];
          for (let row = 0; row < gameConfig.rows; row++) {
            const randomSymbol = gameConfig.symbols[Math.floor(Math.random() * gameConfig.symbols.length)];
            reelSymbols.push(randomSymbol);
          }
          randomReels.push(reelSymbols);
        }
        setCurrentReels(randomReels);
      }, 100);

      // Wait for spin animation to complete
      setTimeout(async () => {
        clearInterval(spinInterval);

        try {
          // Execute actual spin
          const result = slotsGameEngine.spin(session.sessionId, betAmount);
          setLastResult(result);
          setCurrentReels(result.symbols);
          
          // Update history and stats
          setGameHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 spins
          setSessionStats(prev => ({
            totalSpins: prev.totalSpins + 1,
            totalBet: prev.totalBet + betAmount,
            totalWon: prev.totalWon + result.totalWin,
            biggestWin: Math.max(prev.biggestWin, result.totalWin),
            currentStreak: result.totalWin > 0 ? prev.currentStreak + 1 : 0
          }));

          // Show win animation
          if (result.totalWin > 0) {
            setWinAnimation(true);
            if (soundEnabled && winSoundRef.current) {
              winSoundRef.current.play().catch(() => {});
            }
            
            // Auto-hide win animation after 3 seconds
            setTimeout(() => setWinAnimation(false), 3000);
          }

          // Update auto play counter
          if (autoPlay) {
            setAutoPlayCount(prev => prev + 1);
          }

        } catch (error) {
          console.error('Spin error:', error);
          // Handle error (insufficient funds, etc.)
        }

        setSpinning(false);
        updateBalance();
      }, spinDuration);

    } catch (error) {
      console.error('Spin execution error:', error);
      setSpinning(false);
    }
  };

  const handleBetChange = (newBet: number) => {
    if (!spinning) {
      const limits = slotsGameEngine.getBetLimits(gameConfig, currency);
      const clampedBet = Math.max(limits.min, Math.min(limits.max, newBet));
      setBetAmount(clampedBet);
    }
  };

  const handleMaxBet = () => {
    if (!spinning) {
      const maxAffordable = Math.floor(balance[currency] / gameConfig.minBet[currency]) * gameConfig.minBet[currency];
      const maxBet = Math.min(gameConfig.maxBet[currency], maxAffordable);
      setBetAmount(maxBet);
    }
  };

  const toggleAutoPlay = () => {
    if (autoPlay) {
      setAutoPlay(false);
      setAutoPlayCount(0);
      if (autoPlayIntervalRef.current) {
        clearTimeout(autoPlayIntervalRef.current);
      }
    } else if (canSpin()) {
      setAutoPlay(true);
      setAutoPlayCount(0);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getSymbolEmoji = (symbol: SlotSymbol): React.ReactNode => {
    return (
      <div 
        className={`text-4xl transition-all duration-300 ${spinning ? 'blur-sm scale-90' : 'scale-100'}`}
        style={{ color: symbol.color }}
      >
        {symbol.emoji}
      </div>
    );
  };

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'legendary': return 'from-purple-600 to-pink-600';
      case 'epic': return 'from-purple-500 to-blue-500';
      case 'rare': return 'from-blue-500 to-green-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!user || !session) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-black' : ''} space-y-4`}>
      {/* Game Header */}
      <Card className={`${fullscreen ? 'border-none rounded-none' : ''} bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onExit} size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div>
                <CardTitle className="text-xl">{gameConfig.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {gameConfig.provider} • RTP: {gameConfig.rtp}% • {gameConfig.volatility} volatility
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Currency Toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={currency === 'GC' ? 'default' : 'ghost'}
                  onClick={() => onCurrencyChange('GC')}
                  disabled={spinning}
                >
                  <Coins className="w-4 h-4 mr-1" />
                  GC
                </Button>
                <Button
                  size="sm"
                  variant={currency === 'SC' ? 'default' : 'ghost'}
                  onClick={() => onCurrencyChange('SC')}
                  disabled={spinning}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  SC
                </Button>
              </div>

              {/* Sound Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>

              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
              >
                {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              {/* Settings */}
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Game Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Spin Speed</label>
                      <Slider
                        value={[spinSpeed]}
                        onValueChange={(value) => setSpinSpeed(value[0])}
                        max={3}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Slow</span>
                        <span>Normal</span>
                        <span>Fast</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Auto Play Limit</label>
                      <Slider
                        value={[maxAutoPlay]}
                        onValueChange={(value) => setMaxAutoPlay(value[0])}
                        max={100}
                        min={5}
                        step={5}
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {maxAutoPlay} spins
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Balance and Jackpot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {formatCurrency(balance[currency])}
              </div>
              <div className="text-sm text-muted-foreground">Balance</div>
            </div>
          </CardContent>
        </Card>

        {gameConfig.jackpot.progressive && (
          <Card className="bg-gradient-to-r from-gold-500/10 to-yellow-500/10 border-gold-500/30">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold-500 animate-pulse">
                  ${jackpotAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Progressive Jackpot</div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {sessionStats.totalWon > 0 ? `+${formatCurrency(sessionStats.totalWon - sessionStats.totalBet)}` : formatCurrency(sessionStats.totalWon - sessionStats.totalBet)}
              </div>
              <div className="text-sm text-muted-foreground">Session P&L</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Game Area */}
      <Card className="bg-gradient-to-b from-gray-900 to-gray-800 border-purple-500/30">
        <CardContent className="p-6">
          {/* Slot Reels */}
          <div 
            className={`grid gap-2 mb-6 mx-auto max-w-fit`}
            style={{ gridTemplateColumns: `repeat(${gameConfig.reels}, 1fr)` }}
          >
            {currentReels.map((reel, reelIndex) => (
              <div key={reelIndex} className="space-y-2">
                {reel.map((symbol, rowIndex) => {
                  const isWinningSymbol = lastResult?.winLines.some(line => 
                    line.positions.some(pos => pos[0] === reelIndex && pos[1] === rowIndex)
                  );

                  return (
                    <div
                      key={`${reelIndex}-${rowIndex}`}
                      className={`
                        w-20 h-20 rounded-lg border-2 flex items-center justify-center
                        transition-all duration-500 relative overflow-hidden
                        ${spinning ? 'animate-pulse border-purple-400 bg-purple-500/20' : 'border-gray-600 bg-gray-800'}
                        ${isWinningSymbol && winAnimation ? 'border-gold-500 bg-gold-500/20 animate-bounce shadow-lg shadow-gold-500/50' : ''}
                      `}
                    >
                      {isWinningSymbol && winAnimation && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-500/30 to-transparent animate-pulse" />
                      )}
                      {getSymbolEmoji(symbol)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Win Display */}
          {lastResult && lastResult.totalWin > 0 && showWinDetails && (
            <Card className={`mb-6 ${winAnimation ? 'animate-pulse' : ''} bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-500/30`}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    🎉 WIN! {formatCurrency(lastResult.totalWin)} 🎉
                  </div>
                  {lastResult.isJackpot && (
                    <div className="text-xl font-bold text-gold-500 animate-bounce mb-2">
                      💰 JACKPOT! 💰
                    </div>
                  )}
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <span>{lastResult.winLines.length} winning line{lastResult.winLines.length !== 1 ? 's' : ''}</span>
                    <span>{lastResult.multiplier}x multiplier</span>
                    {lastResult.features.length > 0 && <span>{lastResult.features.join(', ')}</span>}
                  </div>
                  {lastResult.freeSpinsAwarded > 0 && (
                    <div className="text-lg font-bold text-purple-400 mt-2">
                      +{lastResult.freeSpinsAwarded} Free Spins!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Game Controls */}
          <div className="space-y-4">
            {/* Bet Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleBetChange(betAmount - gameConfig.minBet[currency])}
                disabled={spinning || betAmount <= gameConfig.minBet[currency]}
              >
                <Coins className="w-4 h-4 mr-1" />
                -{gameConfig.minBet[currency]}
              </Button>

              <div className="text-center min-w-32">
                <div className="text-sm text-muted-foreground">Bet Amount</div>
                <div className="text-xl font-bold">{formatCurrency(betAmount)}</div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleBetChange(betAmount + gameConfig.minBet[currency])}
                disabled={spinning || betAmount >= Math.min(gameConfig.maxBet[currency], balance[currency])}
              >
                <Coins className="w-4 h-4 mr-1" />
                +{gameConfig.minBet[currency]}
              </Button>

              <Button
                variant="outline"
                onClick={handleMaxBet}
                disabled={spinning}
              >
                Max Bet
              </Button>
            </div>

            {/* Spin Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleSpin}
                disabled={!canSpin()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-6 text-lg font-bold"
                size="lg"
              >
                {spinning ? (
                  <>
                    <RotateCcw className="w-6 h-6 animate-spin mr-2" />
                    Spinning...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    SPIN
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={toggleAutoPlay}
                disabled={!canSpin() && !autoPlay}
                className={autoPlay ? 'bg-orange-500/20 border-orange-500' : ''}
              >
                {autoPlay ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Stop Auto ({autoPlayCount}/{maxAutoPlay})
                  </>
                ) : (
                  <>
                    <FastForward className="w-4 h-4 mr-2" />
                    Auto Play
                  </>
                )}
              </Button>

              {/* Paytable Button */}
              <Dialog open={showPaytable} onOpenChange={setShowPaytable}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Info className="w-4 h-4 mr-2" />
                    Paytable
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Paytable - {gameConfig.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    {gameConfig.symbols.map((symbol) => (
                      <div key={symbol.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                        <div className="text-2xl" style={{ color: symbol.color }}>
                          {symbol.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{symbol.name}</div>
                          <div className="text-sm text-muted-foreground">
                            3: {symbol.multipliers.three}x • 4: {symbol.multipliers.four}x • 5: {symbol.multipliers.five}x
                          </div>
                          <Badge variant="outline" className={`text-xs mt-1 ${symbol.rarity === 'legendary' ? 'border-purple-500 text-purple-400' : symbol.rarity === 'epic' ? 'border-blue-500 text-blue-400' : symbol.rarity === 'rare' ? 'border-green-500 text-green-400' : 'border-gray-500 text-gray-400'}`}>
                            {symbol.rarity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{sessionStats.totalSpins}</div>
              <div className="text-sm text-muted-foreground">Total Spins</div>
            </div>
            <div>
              <div className="text-lg font-bold">{formatCurrency(sessionStats.totalBet)}</div>
              <div className="text-sm text-muted-foreground">Total Bet</div>
            </div>
            <div>
              <div className="text-lg font-bold">{formatCurrency(sessionStats.totalWon)}</div>
              <div className="text-sm text-muted-foreground">Total Won</div>
            </div>
            <div>
              <div className="text-lg font-bold">{formatCurrency(sessionStats.biggestWin)}</div>
              <div className="text-sm text-muted-foreground">Biggest Win</div>
            </div>
            <div>
              <div className="text-lg font-bold">{sessionStats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Win Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio elements */}
      <audio ref={spinSoundRef} preload="auto">
        <source src="/sounds/slot-spin.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={winSoundRef} preload="auto">
        <source src="/sounds/slot-win.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}
