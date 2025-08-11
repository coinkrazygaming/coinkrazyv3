import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { coinKrazySlotsServer, SlotGameConfig } from "@/services/coinKrazySlotsServer";
import GameIframeLoader from "@/components/GameIframeLoader";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  AlertTriangle,
  Loader2,
  Trophy,
  Info,
} from "lucide-react";

interface GamePlayerProps {
  gameId: string;
  currency: "GC" | "SC";
  onClose: () => void;
}

export default function GamePlayer({
  gameId,
  currency,
  onClose,
}: GamePlayerProps) {
  const { user } = useAuth();
  const [game, setGame] = useState<SlotGameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadGame();
  }, [gameId, currency, user]);

  const loadGame = async () => {
    try {
      setLoading(true);
      setError("");

      const gameData = await coinKrazySlotsServer.getGameById(gameId);
      if (!gameData) {
        throw new Error("Game not found");
      }

      setGame(gameData);
    } catch (error) {
      console.error("Error loading game:", error);
      setError(error instanceof Error ? error.message : "Failed to load game");
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    setIsPlaying(true);
  };

  const stopGame = () => {
    setIsPlaying(false);
    onClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading game...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-400">{error}</span>
        </div>
        <Button onClick={onClose}>Back to Games</Button>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-4">
        <div>Game not found</div>
        <Button onClick={onClose}>Back to Games</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Game Header */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={game.thumbnailUrl}
              alt={game.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-bold">{game.name}</h2>
              <p className="text-sm text-muted-foreground">{game.provider}</p>
            </div>
            <Badge variant="outline" className="border-gold-500 text-gold-400">
              RTP: {game.rtp}%
            </Badge>
            <Badge variant="outline" className="border-casino-blue text-casino-blue">
              {game.volatility.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-green-500 text-green-400">
              {currency === "GC" ? "🪙 Gold Coins" : "👑 Sweeps Coins"}
            </Badge>

            <Button variant="outline" size="sm" title="Game Info">
              <Info className="w-4 h-4" />
            </Button>

            <Button variant="destructive" size="sm" onClick={stopGame}>
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Game Display */}
      <div className="relative">
        {!isPlaying ? (
          <div className="h-96 bg-gradient-to-br from-casino-blue/20 to-gold/20 flex items-center justify-center">
            <div className="text-center max-w-2xl">
              <img
                src={game.thumbnailUrl}
                alt={game.name}
                className="w-64 h-40 object-cover rounded-lg mx-auto mb-6 shadow-lg"
              />
              <h3 className="text-3xl font-bold mb-4 text-foreground">{game.name}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400">{game.rtp}%</div>
                  <div className="text-xs text-muted-foreground">RTP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-casino-blue">{game.paylines}</div>
                  <div className="text-xs text-muted-foreground">Paylines</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{game.minBet}-{game.maxBet}</div>
                  <div className="text-xs text-muted-foreground">Bet Range</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{game.volatility}</div>
                  <div className="text-xs text-muted-foreground">Volatility</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {game.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="border-gold-500/50 text-gold-400">
                    {feature}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-4 text-lg"
                >
                  <Play className="w-6 h-6 mr-2" />
                  Play with {currency === "GC" ? "Gold Coins" : "Sweeps Coins"}
                </Button>

                <Button
                  variant="outline"
                  className="px-6 py-4"
                  title="Game Rules"
                >
                  <Info className="w-5 h-5 mr-2" />
                  How to Play
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <GameIframeLoader
            gameId={gameId}
            currency={currency}
            onClose={() => setIsPlaying(false)}
            onError={(error) => {
              setError(error);
              setIsPlaying(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
