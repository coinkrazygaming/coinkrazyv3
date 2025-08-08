import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { gamesService, Game } from "@/services/gamesService";
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Maximize,
  AlertTriangle,
  Loader2,
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
  const [game, setGame] = useState<Game | null>(null);
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

      const gameData = await gamesService.getGameById(gameId);
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
              src={game.image_url}
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
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Volume2 className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm">
              <Maximize className="w-4 h-4" />
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
            <div className="text-center">
              <img
                src={game.image_url}
                alt={game.name}
                className="w-48 h-32 object-cover rounded-lg mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
              <p className="text-muted-foreground mb-4">{game.description}</p>
              <Button
                onClick={startGame}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-96 bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold mb-4">Game Loading...</div>
              <div className="text-muted-foreground">
                In a real implementation, this would load the game iframe
              </div>
              <Button
                onClick={() => setIsPlaying(false)}
                className="mt-4"
                variant="outline"
              >
                Back to Game Info
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
