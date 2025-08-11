import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { coinKrazySlotsServer, GameSession, SpinResponse } from "@/services/coinKrazySlotsServer";
import { walletService } from "@/services/walletService";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertTriangle,
  Loader2,
  Settings,
  RefreshCw,
  Home,
  Coins,
  Trophy,
} from "lucide-react";

interface GameIframeLoaderProps {
  gameId: string;
  currency: "GC" | "SC";
  onClose: () => void;
  onError?: (error: string) => void;
}

interface GameControls {
  soundEnabled: boolean;
  autoPlay: boolean;
  fastSpin: boolean;
  fullscreen: boolean;
}

export default function GameIframeLoader({
  gameId,
  currency,
  onClose,
  onError,
}: GameIframeLoaderProps) {
  const { user } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [session, setSession] = useState<GameSession | null>(null);
  const [gameUrl, setGameUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [gameLoading, setGameLoading] = useState(true);
  const [gameReady, setGameReady] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [lastSpin, setLastSpin] = useState<SpinResponse | null>(null);
  const [controls, setControls] = useState<GameControls>({
    soundEnabled: true,
    autoPlay: false,
    fastSpin: false,
    fullscreen: false,
  });

  useEffect(() => {
    if (!user) {
      setError("Please log in to play games");
      return;
    }
    initializeGame();
  }, [gameId, currency, user]);

  // Listen for iframe messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const { type, data } = event.data;

      switch (type) {
        case "GAME_LOADED":
          setGameLoading(false);
          setGameReady(true);
          console.log("Game loaded successfully");
          break;
        case "GAME_ERROR":
          setError(data.message || "Game loading error");
          setGameLoading(false);
          break;
        case "SPIN_REQUEST":
          handleSpinRequest(data);
          break;
        case "BALANCE_REQUEST":
          sendBalanceUpdate();
          break;
        case "SETTINGS_UPDATE":
          updateGameSettings(data);
          break;
        default:
          console.log("Unknown message from game:", type, data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [session]);

  const initializeGame = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create game session
      const newSession = await coinKrazySlotsServer.createSession(gameId, user.email, currency);
      setSession(newSession);
      setBalance(newSession.balance);

      // Get game launch URL
      const launchUrl = await coinKrazySlotsServer.getGameLaunchUrl(newSession.sessionId);
      setGameUrl(launchUrl);

      console.log("Game initialized:", { gameId, currency, sessionId: newSession.sessionId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize game";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSpinRequest = async (spinData: any) => {
    if (!session) return;

    try {
      const spinResult = await coinKrazySlotsServer.spin({
        sessionId: session.sessionId,
        betAmount: spinData.betAmount,
        betLines: spinData.betLines || 25,
        currency,
      });

      setLastSpin(spinResult);
      setBalance(spinResult.newBalance);

      // Send result back to iframe
      sendMessageToGame("SPIN_RESULT", spinResult);

      // Update wallet service
      const wallet = walletService.getUserBalance(user!.email);
      if (wallet.currencies[currency]) {
        walletService.updateBalance(
          user!.email,
          currency,
          spinResult.winAmount - spinResult.betAmount,
          `Game ${gameId} - ${spinResult.winAmount > 0 ? 'Win' : 'Bet'}`
        );
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Spin failed";
      sendMessageToGame("SPIN_ERROR", { message: errorMessage });
      console.error("Spin error:", error);
    }
  };

  const sendBalanceUpdate = () => {
    if (!session) return;
    
    sendMessageToGame("BALANCE_UPDATE", {
      balance: balance,
      currency: currency,
      timestamp: Date.now(),
    });
  };

  const updateGameSettings = (settings: Partial<GameControls>) => {
    setControls(prev => ({ ...prev, ...settings }));
  };

  const sendMessageToGame = (type: string, data: any) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        { type, data },
        window.location.origin
      );
    }
  };

  const handleControlChange = (control: keyof GameControls, value: boolean) => {
    const newControls = { ...controls, [control]: value };
    setControls(newControls);
    sendMessageToGame("CONTROLS_UPDATE", newControls);
  };

  const endGameSession = async () => {
    if (session) {
      try {
        await coinKrazySlotsServer.endSession(session.sessionId);
        console.log("Game session ended");
      } catch (error) {
        console.error("Error ending session:", error);
      }
    }
    onClose();
  };

  const refreshGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setGameLoading(true);
      setGameReady(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current?.requestFullscreen();
      setControls(prev => ({ ...prev, fullscreen: true }));
    } else {
      document.exitFullscreen();
      setControls(prev => ({ ...prev, fullscreen: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gold-500" />
          <div className="text-lg font-bold mb-2">Initializing CoinKrazy Game</div>
          <div className="text-sm text-muted-foreground">Setting up your gaming session...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/50 bg-red-500/10">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-400 mb-2">Game Error</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={initializeGame} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
              <Button onClick={onClose} variant="destructive">
                <Home className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full bg-background">
      {/* Game Header */}
      <div className="bg-gradient-to-r from-casino-blue/20 to-gold/20 border-b border-gold-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-gold-500" />
              <div>
                <h2 className="text-xl font-bold text-foreground">CoinKrazy Game</h2>
                <p className="text-sm text-muted-foreground">
                  Session: {session?.sessionId.slice(-8)}
                </p>
              </div>
            </div>

            {/* Balance Display */}
            <Card className="bg-gradient-to-r from-gold/10 to-casino-blue/10 border-gold-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-gold-500 text-gold-400">
                    {currency === "GC" ? "🪙" : "👑"} {currency}
                  </Badge>
                  <span className="font-bold text-lg">
                    {balance.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Last Win Display */}
            {lastSpin && lastSpin.winAmount > 0 && (
              <Card className="bg-gradient-to-r from-green-500/10 to-gold/10 border-green-500/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 font-bold">
                      +{lastSpin.winAmount.toLocaleString()} {currency}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Game Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleControlChange("soundEnabled", !controls.soundEnabled)}
              className={controls.soundEnabled ? "border-green-500 text-green-400" : ""}
            >
              {controls.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refreshGame}
              title="Refresh Game"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
            >
              {controls.fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>

            <Button
              variant="outline"
              size="sm"
              title="Game Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={endGameSession}
              title="End Game"
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Game Iframe Container */}
      <div className="relative w-full h-[600px] bg-black">
        {gameLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-casino-blue/20 to-gold/20 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gold-500" />
              <div className="text-xl font-bold mb-2 text-foreground">Loading Game</div>
              <div className="text-sm text-muted-foreground">Please wait while we load your game...</div>
            </div>
          </div>
        )}

        {gameUrl && (
          <iframe
            ref={iframeRef}
            src={gameUrl}
            className="w-full h-full border-0"
            allow="fullscreen; autoplay; camera; microphone; geolocation"
            sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-orientation-lock allow-fullscreen"
            onLoad={() => {
              setGameLoading(false);
              setGameReady(true);
              console.log("Iframe loaded");
            }}
            onError={(e) => {
              console.error("Iframe error:", e);
              setError("Failed to load game content");
              setGameLoading(false);
            }}
          />
        )}
      </div>

      {/* Game Status Bar */}
      <div className="bg-gradient-to-r from-casino-blue/10 to-gold/10 border-t border-gold-500/20 p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${gameReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-muted-foreground">
                Status: {gameReady ? "Ready" : "Loading"}
              </span>
            </div>
            {session && (
              <div className="text-muted-foreground">
                Spins: {session.spinCount} | Total Bets: {session.totalBets.toLocaleString()} {currency}
              </div>
            )}
          </div>
          <div className="text-muted-foreground">
            CoinKrazy.com - Licensed Gaming Platform
          </div>
        </div>
      </div>
    </div>
  );
}
