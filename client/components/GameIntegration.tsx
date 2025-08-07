import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RefreshCw,
  Loader,
  AlertTriangle,
  Coins,
  Gem,
  Trophy,
  Home,
  RotateCcw,
  ExternalLink,
  Shield,
  Clock,
  Info,
  Zap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { gameProviderService, type ProviderGame, type GameSession } from '../services/gameProviderService';
import { walletService, type UserWallet } from '../services/walletService';
import { currencyToggleService, type GameCurrencyType } from '../services/currencyToggleService';

interface GameIntegrationProps {
  gameId: string;
  currency: GameCurrencyType;
  onGameEnd?: (session: GameSession) => void;
  onBalanceUpdate?: (wallet: UserWallet) => void;
  fullscreen?: boolean;
  autoPlay?: boolean;
}

interface GameState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  hasError: boolean;
  errorMessage?: string;
  loadingProgress: number;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

interface GameStats {
  totalBet: number;
  totalWin: number;
  netResult: number;
  spinCount: number;
  biggestWin: number;
  sessionTime: number;
}

export default function GameIntegration({
  gameId,
  currency,
  onGameEnd,
  onBalanceUpdate,
  fullscreen = false,
  autoPlay = false
}: GameIntegrationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [game, setGame] = useState<ProviderGame | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    hasError: false,
    loadingProgress: 0,
    connectionStatus: 'connecting'
  });
  const [gameStats, setGameStats] = useState<GameStats>({
    totalBet: 0,
    totalWin: 0,
    netResult: 0,
    spinCount: 0,
    biggestWin: 0,
    sessionTime: 0
  });
  
  const [isFullscreen, setIsFullscreen] = useState(fullscreen);
  const [isMuted, setIsMuted] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const sessionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (gameId && user?.id) {
      initializeGame();
    }
  }, [gameId, user?.id, currency]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.isPlaying) {
        setGameStats(prev => ({
          ...prev,
          sessionTime: Math.floor((Date.now() - sessionStartTime.current) / 1000)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isPlaying]);

  const initializeGame = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true, hasError: false }));
      
      // Load game data
      const gameData = gameProviderService.getGame(gameId);
      if (!gameData) {
        throw new Error('Game not found');
      }
      
      setGame(gameData);
      
      // Load user wallet
      const userWallet = await walletService.getUserWallet(user!.id);
      setWallet(userWallet);
      
      // Check if user has sufficient balance
      const minBet = currency === 'GC' ? gameData.minBet.GC : gameData.minBet.SC;
      const currentBalance = currency === 'GC' ? userWallet.goldCoins : userWallet.sweepsCoins;
      
      if (currentBalance < minBet) {
        throw new Error(`Insufficient ${currency} balance. Need at least ${minBet} ${currency}`);
      }
      
      // Create game session
      const gameSession = await gameProviderService.createGameSession(user!.id, gameId, currency);
      setSession(gameSession);
      
      // Simulate loading progress
      simulateLoadingProgress();
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setGameState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: error instanceof Error ? error.message : 'Failed to load game'
      }));
      
      toast({
        title: "Game Error",
        description: error instanceof Error ? error.message : 'Failed to load game',
        variant: "destructive"
      });
    }
  };

  const simulateLoadingProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      
      setGameState(prev => ({
        ...prev,
        loadingProgress: Math.min(progress, 100)
      }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setGameState(prev => ({
          ...prev,
          isLoading: false,
          connectionStatus: 'connected',
          isPlaying: autoPlay
        }));
        
        if (autoPlay) {
          startGame();
        }
      }
    }, 200);
  };

  const startGame = useCallback(() => {
    if (!session || !game) return;
    
    setGameState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    sessionStartTime.current = Date.now();
    
    // Send message to iframe to start game
    if (iframeRef.current) {
      const message = {
        type: 'GAME_START',
        sessionId: session.id,
        currency,
        gameId: game.id
      };
      
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
    
    toast({
      title: "Game Started",
      description: `${game.name} is now active`,
    });
  }, [session, game, currency]);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true }));
    
    if (iframeRef.current) {
      const message = { type: 'GAME_PAUSE' };
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false }));
    
    if (iframeRef.current) {
      const message = { type: 'GAME_RESUME' };
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  }, []);

  const endGame = useCallback(async () => {
    if (!session) return;
    
    setGameState(prev => ({ ...prev, isPlaying: false, isPaused: false }));
    
    try {
      const endedSession = await gameProviderService.endGameSession(session.id);
      
      if (endedSession && onGameEnd) {
        onGameEnd(endedSession);
      }
      
      // Update wallet
      const updatedWallet = await walletService.getUserWallet(user!.id);
      setWallet(updatedWallet);
      
      if (onBalanceUpdate) {
        onBalanceUpdate(updatedWallet);
      }
      
      toast({
        title: "Game Ended",
        description: `Session completed. Net result: ${gameStats.netResult >= 0 ? '+' : ''}${gameStats.netResult} ${currency}`,
      });
      
    } catch (error) {
      console.error('Failed to end game session:', error);
    }
  }, [session, onGameEnd, onBalanceUpdate, gameStats.netResult, currency, user]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    
    if (iframeRef.current) {
      const message = { type: 'GAME_MUTE', muted: !isMuted };
      iframeRef.current.contentWindow?.postMessage(message, '*');
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    
    if (!isFullscreen && iframeRef.current?.parentElement) {
      iframeRef.current.parentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [isFullscreen]);

  const refreshGame = useCallback(() => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setGameState(prev => ({ ...prev, isLoading: true, loadingProgress: 0 }));
      simulateLoadingProgress();
    }
  }, []);

  // Handle messages from game iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'GAME_LOADED':
          setGameState(prev => ({ ...prev, isLoading: false, connectionStatus: 'connected' }));
          break;
          
        case 'GAME_ERROR':
          setGameState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: data.message || 'Game error occurred'
          }));
          break;
          
        case 'BET_PLACED':
          setGameStats(prev => ({
            ...prev,
            totalBet: prev.totalBet + data.amount,
            spinCount: prev.spinCount + 1,
            netResult: prev.netResult - data.amount
          }));
          break;
          
        case 'WIN_RESULT':
          setGameStats(prev => ({
            ...prev,
            totalWin: prev.totalWin + data.amount,
            netResult: prev.netResult + data.amount,
            biggestWin: Math.max(prev.biggestWin, data.amount)
          }));
          break;
          
        case 'BALANCE_UPDATE':
          if (wallet) {
            const updatedWallet = { ...wallet };
            if (currency === 'GC') {
              updatedWallet.goldCoins = data.balance;
            } else {
              updatedWallet.sweepsCoins = data.balance;
            }
            setWallet(updatedWallet);
            
            if (onBalanceUpdate) {
              onBalanceUpdate(updatedWallet);
            }
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [wallet, currency, onBalanceUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative'}`}>
      <Card className={`${isFullscreen ? 'h-full border-0 rounded-none' : ''}`}>
        {/* Game Header */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={game.thumbnailUrl}
                alt={game.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/games/placeholder.jpg';
                }}
              />
              <div>
                <CardTitle className="text-lg">{game.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{gameProviderService.getProvider(game.providerId)?.displayName}</span>
                  <Badge variant="outline" className="text-xs">
                    {currency} Mode
                  </Badge>
                  <div className={`flex items-center gap-1 text-xs ${
                    gameState.connectionStatus === 'connected' ? 'text-green-500' :
                    gameState.connectionStatus === 'error' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      gameState.connectionStatus === 'connected' ? 'bg-green-500' :
                      gameState.connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    {gameState.connectionStatus}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Balance Display */}
              {wallet && (
                <div className="flex items-center gap-4 px-3 py-1 bg-muted rounded-lg">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {wallet.goldCoins.toLocaleString()} GC
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">
                      {wallet.sweepsCoins.toFixed(2)} SC
                    </span>
                  </div>
                </div>
              )}

              {/* Game Controls */}
              <div className="flex items-center gap-1">
                {!gameState.isPlaying ? (
                  <Button size="sm" onClick={startGame} disabled={gameState.isLoading || gameState.hasError}>
                    <Play className="w-4 h-4" />
                  </Button>
                ) : (
                  <>
                    {gameState.isPaused ? (
                      <Button size="sm" onClick={resumeGame}>
                        <Play className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button size="sm" onClick={pauseGame}>
                        <Pause className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={endGame}>
                      <Square className="w-4 h-4" />
                    </Button>
                  </>
                )}
                
                <Button size="sm" variant="outline" onClick={toggleMute}>
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <Button size="sm" variant="outline" onClick={refreshGame}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => setShowStats(!showStats)}>
                  <Trophy className="w-4 h-4" />
                </Button>
                
                <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading Progress */}
          {gameState.isLoading && (
            <div className="space-y-2">
              <Progress value={gameState.loadingProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">
                Loading game... {Math.round(gameState.loadingProgress)}%
              </p>
            </div>
          )}

          {/* Error Display */}
          {gameState.hasError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {gameState.errorMessage}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="ml-2"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Game Stats Panel */}
          {showStats && (
            <div className="p-4 bg-muted/50 border-b">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium">{gameStats.spinCount}</div>
                  <div className="text-muted-foreground">Spins</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{gameStats.totalBet.toFixed(2)} {currency}</div>
                  <div className="text-muted-foreground">Total Bet</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{gameStats.totalWin.toFixed(2)} {currency}</div>
                  <div className="text-muted-foreground">Total Win</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${gameStats.netResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {gameStats.netResult >= 0 ? '+' : ''}{gameStats.netResult.toFixed(2)} {currency}
                  </div>
                  <div className="text-muted-foreground">Net Result</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{gameStats.biggestWin.toFixed(2)} {currency}</div>
                  <div className="text-muted-foreground">Biggest Win</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{formatTime(gameStats.sessionTime)}</div>
                  <div className="text-muted-foreground">Session Time</div>
                </div>
              </div>
            </div>
          )}

          {/* Game Container */}
          <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-black`}>
            {session && !gameState.hasError ? (
              <iframe
                ref={iframeRef}
                src={session.gameUrl}
                className="w-full h-full border-0"
                allow="fullscreen; microphone; camera; payment; autoplay"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                title={game.name}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                {gameState.isLoading ? (
                  <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                    <p>Connecting to game server...</p>
                  </div>
                ) : gameState.hasError ? (
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                    <p className="mb-4">Failed to load game</p>
                    <Button onClick={initializeGame}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-4" />
                    <p className="mb-4">Ready to play {game.name}</p>
                    <Button onClick={startGame} size="lg">
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Game Status Overlay */}
            {gameState.isPaused && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                <div className="text-center text-white">
                  <Pause className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Game Paused</h3>
                  <Button onClick={resumeGame} size="lg">
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
