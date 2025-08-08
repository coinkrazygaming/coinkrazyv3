import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Crown,
  Gift,
  CheckCircle,
  Clock,
  Star,
  Zap,
  Target,
  Award,
  Sparkles,
  Heart,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { balanceService } from "@/services/balanceService";
import { analyticsService } from "@/services/realTimeAnalytics";
import { cn } from "@/lib/utils";

interface GameState {
  isPlaying: boolean;
  timeLeft: number;
  score: number;
  cucumbersCollected: number;
  level: number;
  multiplier: number;
}

interface Cucumber {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: "normal" | "golden" | "bonus";
  points: number;
}

interface GameSession {
  startTime: Date;
  endTime?: Date;
  finalScore: number;
  cucumbersCollected: number;
  scAwarded: number;
  levelReached: number;
}

export default function MaryHadALilCucumber() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    timeLeft: 60,
    score: 0,
    cucumbersCollected: 0,
    level: 1,
    multiplier: 1.0,
  });
  
  const [cucumbers, setCucumbers] = useState<Cucumber[]>([]);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [canPlay, setCanPlay] = useState(true);
  const [nextPlayTime, setNextPlayTime] = useState<Date | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentSessions, setRecentSessions] = useState<GameSession[]>([]);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number>();

  const GAME_DURATION = 60; // 60 seconds
  const COOLDOWN_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  useEffect(() => {
    checkCooldownStatus();
    loadRecentSessions();
    
    return () => {
      stopGame();
    };
  }, []);

  useEffect(() => {
    if (gameState.isPlaying) {
      animationRef.current = requestAnimationFrame(updateCucumbers);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, cucumbers]);

  const checkCooldownStatus = () => {
    const lastPlayedStr = localStorage.getItem('maryGameLastPlayed');
    if (lastPlayedStr) {
      const lastPlayed = new Date(lastPlayedStr);
      const now = new Date();
      const timeDiff = now.getTime() - lastPlayed.getTime();
      
      if (timeDiff < COOLDOWN_DURATION) {
        setCanPlay(false);
        const nextPlay = new Date(lastPlayed.getTime() + COOLDOWN_DURATION);
        setNextPlayTime(nextPlay);
      }
    }
  };

  const loadRecentSessions = () => {
    const sessionsStr = localStorage.getItem('maryGameSessions');
    if (sessionsStr) {
      try {
        const sessions = JSON.parse(sessionsStr).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        }));
        setRecentSessions(sessions.slice(0, 5)); // Keep last 5 sessions
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
  };

  const saveGameSession = (session: GameSession) => {
    const currentSessions = [...recentSessions, session];
    const limitedSessions = currentSessions.slice(-10); // Keep last 10
    setRecentSessions(limitedSessions.slice(0, 5)); // Display last 5
    
    localStorage.setItem('maryGameSessions', JSON.stringify(limitedSessions));
    localStorage.setItem('maryGameLastPlayed', session.endTime?.toISOString() || new Date().toISOString());
  };

  const startGame = () => {
    if (!canPlay || !user) return;

    const newSession: GameSession = {
      startTime: new Date(),
      finalScore: 0,
      cucumbersCollected: 0,
      scAwarded: 0,
      levelReached: 1,
    };
    
    setGameSession(newSession);
    setGameState({
      isPlaying: true,
      timeLeft: GAME_DURATION,
      score: 0,
      cucumbersCollected: 0,
      level: 1,
      multiplier: 1.0,
    });
    
    setCucumbers([]);
    startGameTimer();
    startCucumberSpawning();
    
    if (soundEnabled) {
      playSound('start');
    }
  };

  const stopGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: false }));
    
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
    
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const endGame = async () => {
    stopGame();
    
    if (!gameSession || !user) return;

    // Calculate SC reward based on performance
    const baseReward = Math.min(gameState.score / 1000, 5); // Max 5 SC base
    const levelBonus = (gameState.level - 1) * 0.5; // 0.5 SC per level above 1
    const collectionBonus = Math.min(gameState.cucumbersCollected / 50, 2); // Max 2 SC for collections
    
    const totalSCReward = Math.min(baseReward + levelBonus + collectionBonus, 10); // Cap at 10 SC
    const finalReward = Math.round(totalSCReward * 100) / 100; // Round to 2 decimals

    const finalSession: GameSession = {
      ...gameSession,
      endTime: new Date(),
      finalScore: gameState.score,
      cucumbersCollected: gameState.cucumbersCollected,
      scAwarded: finalReward,
      levelReached: gameState.level,
    };

    setGameSession(finalSession);
    saveGameSession(finalSession);

    // Award SC to player
    if (finalReward > 0) {
      await balanceService.updateBalance(
        user.id,
        0,
        finalReward,
        "Mary Had a lil cucumber - Mini Game Reward"
      );

      // Track with analytics
      await analyticsService.trackSCWin(
        user.id,
        finalReward,
        "Mini Game: Mary Had a lil cucumber"
      );
    }

    // Set cooldown
    setCanPlay(false);
    const nextPlay = new Date(Date.now() + COOLDOWN_DURATION);
    setNextPlayTime(nextPlay);

    setShowResults(true);
    
    if (soundEnabled) {
      playSound('end');
    }
  };

  const startGameTimer = () => {
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          endGame();
          return prev;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const startCucumberSpawning = () => {
    const spawnCucumber = () => {
      if (!gameAreaRef.current) return;
      
      const rect = gameAreaRef.current.getBoundingClientRect();
      const newCucumber: Cucumber = {
        id: Date.now() + Math.random(),
        x: Math.random() * (rect.width - 40),
        y: -40,
        size: 30 + Math.random() * 20,
        speed: 1 + Math.random() * 2 + (gameState.level * 0.3),
        type: Math.random() < 0.1 ? 'golden' : Math.random() < 0.05 ? 'bonus' : 'normal',
        points: 0,
      };

      // Set points based on type
      switch (newCucumber.type) {
        case 'golden':
          newCucumber.points = 50;
          break;
        case 'bonus':
          newCucumber.points = 100;
          break;
        default:
          newCucumber.points = 10;
      }

      setCucumbers(prev => [...prev, newCucumber]);
    };

    const spawnInterval = Math.max(500 - (gameState.level * 50), 200); // Faster spawning as level increases
    spawnTimerRef.current = setInterval(spawnCucumber, spawnInterval);
  };

  const updateCucumbers = () => {
    if (!gameAreaRef.current) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    
    setCucumbers(prev => {
      return prev
        .map(cucumber => ({
          ...cucumber,
          y: cucumber.y + cucumber.speed
        }))
        .filter(cucumber => cucumber.y < rect.height + 50); // Remove cucumbers that went off screen
    });

    if (gameState.isPlaying) {
      animationRef.current = requestAnimationFrame(updateCucumbers);
    }
  };

  const collectCucumber = (cucumberId: number) => {
    const cucumber = cucumbers.find(c => c.id === cucumberId);
    if (!cucumber) return;

    setCucumbers(prev => prev.filter(c => c.id !== cucumberId));
    
    setGameState(prev => {
      const newScore = prev.score + (cucumber.points * prev.multiplier);
      const newCollected = prev.cucumbersCollected + 1;
      const newLevel = Math.floor(newCollected / 20) + 1; // Level up every 20 cucumbers
      const newMultiplier = 1 + (newLevel - 1) * 0.2; // 20% increase per level

      return {
        ...prev,
        score: Math.round(newScore),
        cucumbersCollected: newCollected,
        level: newLevel,
        multiplier: Math.round(newMultiplier * 10) / 10, // Round to 1 decimal
      };
    });

    if (soundEnabled) {
      playSound('collect');
    }
  };

  const playSound = (type: 'start' | 'collect' | 'end') => {
    // In a real implementation, you would play actual sound files
    if (!soundEnabled) return;
    
    // Mock sound playing
    console.log(`Playing sound: ${type}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCooldown = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) {
      setCanPlay(true);
      setNextPlayTime(null);
      return "Ready to play!";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getCucumberEmoji = (type: string) => {
    switch (type) {
      case 'golden': return '🥒✨';
      case 'bonus': return '🥒💎';
      default: return '🥒';
    }
  };

  const getCucumberStyle = (cucumber: Cucumber) => {
    let className = "absolute cursor-pointer transition-transform hover:scale-110 ";
    
    switch (cucumber.type) {
      case 'golden':
        className += "animate-pulse filter drop-shadow-lg";
        break;
      case 'bonus':
        className += "animate-bounce filter drop-shadow-xl";
        break;
      default:
        className += "hover:animate-pulse";
    }

    return {
      className,
      style: {
        left: `${cucumber.x}px`,
        top: `${cucumber.y}px`,
        fontSize: `${cucumber.size}px`,
        zIndex: cucumber.type === 'bonus' ? 10 : cucumber.type === 'golden' ? 5 : 1,
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-2xl">
                  🥒
                </div>
                Mary Had a lil cucumber
                <Badge className="bg-green-600 text-white">60 Second Challenge</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Collect falling cucumbers in 60 seconds! Free SC rewards • 1 play per 24 hours
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">
                  {gameState.level}
                </div>
                <div className="text-sm text-muted-foreground">Level</div>
              </div>
              
              <div className="text-center">
                <div className="text-xl font-bold text-emerald-400">
                  {gameState.multiplier}x
                </div>
                <div className="text-sm text-muted-foreground">Multiplier</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3">
          <Card className="h-96 lg:h-[500px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-500 text-white">
                    <Timer className="w-3 h-3 mr-1" />
                    {formatTime(gameState.timeLeft)}
                  </Badge>
                  
                  <Badge variant="outline">
                    <Target className="w-3 h-3 mr-1" />
                    Score: {gameState.score.toLocaleString()}
                  </Badge>
                  
                  <Badge variant="outline">
                    🥒 {gameState.cucumbersCollected}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {!gameState.isPlaying && canPlay && (
                    <Button
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  )}
                  
                  {gameState.isPlaying && (
                    <Button
                      onClick={stopGame}
                      variant="outline"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
              
              {gameState.isPlaying && (
                <Progress 
                  value={(gameState.timeLeft / GAME_DURATION) * 100} 
                  className="mt-2"
                />
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              <div
                ref={gameAreaRef}
                className="relative w-full h-80 lg:h-96 bg-gradient-to-b from-sky-100 to-green-100 dark:from-sky-900/20 dark:to-green-900/20 overflow-hidden border-2 border-dashed border-green-300 dark:border-green-700"
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)'
                }}
              >
                {!gameState.isPlaying && !canPlay && nextPlayTime && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                      <h3 className="text-2xl font-bold mb-2">Cooldown Active</h3>
                      <p className="text-lg mb-4">Next play available in:</p>
                      <div className="text-3xl font-mono font-bold text-yellow-400">
                        {formatCooldown(nextPlayTime)}
                      </div>
                      <p className="text-sm mt-4 opacity-75">
                        You can play once every 24 hours
                      </p>
                    </div>
                  </div>
                )}

                {!gameState.isPlaying && canPlay && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-8xl mb-4">🥒</div>
                      <h3 className="text-2xl font-bold mb-4">Mary Had a lil cucumber</h3>
                      <p className="text-muted-foreground mb-6">
                        Collect falling cucumbers for 60 seconds!<br />
                        Golden cucumbers are worth more points.
                      </p>
                      <Button
                        onClick={startGame}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Game
                      </Button>
                    </div>
                  </div>
                )}

                {gameState.isPlaying && (
                  <>
                    {/* Game Instructions */}
                    <div className="absolute top-4 left-4 bg-black/75 text-white p-2 rounded-lg text-sm">
                      <p>Click cucumbers to collect them!</p>
                      <p>🥒 Normal: {10 * gameState.multiplier} pts</p>
                      <p>🥒✨ Golden: {50 * gameState.multiplier} pts</p>
                      <p>🥒💎 Bonus: {100 * gameState.multiplier} pts</p>
                    </div>

                    {/* Falling Cucumbers */}
                    {cucumbers.map(cucumber => {
                      const { className, style } = getCucumberStyle(cucumber);
                      return (
                        <div
                          key={cucumber.id}
                          className={className}
                          style={style}
                          onClick={() => collectCucumber(cucumber.id)}
                        >
                          {getCucumberEmoji(cucumber.type)}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Stats Sidebar */}
        <div className="space-y-4">
          {/* Current Game Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Score:</span>
                <span className="font-bold">{gameState.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Collected:</span>
                <span className="font-bold">{gameState.cucumbersCollected} 🥒</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Level:</span>
                <span className="font-bold">{gameState.level}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Multiplier:</span>
                <span className="font-bold text-green-500">{gameState.multiplier}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Time Left:</span>
                <span className="font-bold font-mono">{formatTime(gameState.timeLeft)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent games
                  </p>
                ) : (
                  recentSessions.map((session, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium">{session.finalScore.toLocaleString()} pts</div>
                        <div className="text-xs text-muted-foreground">
                          {session.startTime.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">
                          +{session.scAwarded.toFixed(2)} SC
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Level {session.levelReached}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Game Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Golden cucumbers are worth 5x points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Bonus cucumbers give massive points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span>Level up every 20 cucumbers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-500" />
                  <span>Higher levels = bigger multipliers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-gold-500" />
                Game Complete!
              </div>
            </DialogTitle>
            <DialogDescription className="text-center">
              Thanks for playing! Here are your results:
            </DialogDescription>
          </DialogHeader>

          {gameSession && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="text-6xl mb-4">🥒</div>
                <div className="text-3xl font-bold mb-2">
                  {gameSession.finalScore.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Final Score</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <div className="text-2xl font-bold">{gameSession.cucumbersCollected}</div>
                  <div className="text-sm text-muted-foreground">Cucumbers</div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <div className="text-2xl font-bold">{gameSession.levelReached}</div>
                  <div className="text-sm text-muted-foreground">Level Reached</div>
                </div>
              </div>

              <div className="text-center p-4 bg-gold-500/10 border border-gold-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-gold-500" />
                  <span className="font-bold">SC Reward</span>
                </div>
                <div className="text-2xl font-bold text-gold-500">
                  +{gameSession.scAwarded.toFixed(2)} SC
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Will be credited to your account soon!
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 inline mr-1" />
                You can play again in 24 hours
              </div>

              <Button 
                onClick={() => setShowResults(false)}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Awesome!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
