import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Crown,
  Star,
  Trophy,
  Play,
  Search,
  TrendingUp,
  Sparkles,
  Gem,
  Gift,
  Gamepad2,
  Heart,
  Eye,
  Zap,
  Target,
} from "lucide-react";

export default function SlotsSafe() {
  // Static slot games data
  const slotGames = [
    {
      id: 1,
      name: "Coin Krazy Classic",
      theme: "Classic Slots",
      rtp: 96.8,
      volatility: "Medium",
      minBet: { GC: 20, SC: 0.2 },
      emoji: "🎰",
    },
    {
      id: 2,
      name: "Golden Fortune",
      theme: "Treasure Hunt",
      rtp: 97.2,
      volatility: "High",
      minBet: { GC: 50, SC: 0.5 },
      emoji: "💰",
    },
    {
      id: 3,
      name: "Neon Nights",
      theme: "Cyberpunk",
      rtp: 96.5,
      volatility: "Medium",
      minBet: { GC: 30, SC: 0.3 },
      emoji: "🌆",
    },
    {
      id: 4,
      name: "Pirate's Treasure",
      theme: "Adventure",
      rtp: 96.9,
      volatility: "High",
      minBet: { GC: 40, SC: 0.4 },
      emoji: "🏴‍☠️",
    },
    {
      id: 5,
      name: "Egyptian Riches",
      theme: "Ancient Egypt",
      rtp: 97.1,
      volatility: "Medium",
      minBet: { GC: 25, SC: 0.25 },
      emoji: "🏺",
    },
    {
      id: 6,
      name: "Space Adventure",
      theme: "Sci-Fi",
      rtp: 96.7,
      volatility: "Low",
      minBet: { GC: 15, SC: 0.15 },
      emoji: "🚀",
    },
    {
      id: 7,
      name: "Wild West Gold",
      theme: "Western",
      rtp: 96.8,
      volatility: "High",
      minBet: { GC: 35, SC: 0.35 },
      emoji: "🤠",
    },
    {
      id: 8,
      name: "Dragon's Luck",
      theme: "Fantasy",
      rtp: 97.0,
      volatility: "Medium",
      minBet: { GC: 30, SC: 0.3 },
      emoji: "🐉",
    },
    {
      id: 9,
      name: "Ocean Deep",
      theme: "Underwater",
      rtp: 96.6,
      volatility: "Low",
      minBet: { GC: 20, SC: 0.2 },
      emoji: "🌊",
    },
    {
      id: 10,
      name: "Mystical Forest",
      theme: "Nature",
      rtp: 96.9,
      volatility: "Medium",
      minBet: { GC: 25, SC: 0.25 },
      emoji: "🌲",
    },
    {
      id: 11,
      name: "Diamond Dreams",
      theme: "Luxury",
      rtp: 97.3,
      volatility: "High",
      minBet: { GC: 60, SC: 0.6 },
      emoji: "💎",
    },
    {
      id: 12,
      name: "Fruit Fiesta",
      theme: "Classic Fruit",
      rtp: 96.4,
      volatility: "Low",
      minBet: { GC: 10, SC: 0.1 },
      emoji: "🍒",
    },
    {
      id: 13,
      name: "Lucky Leprechaun",
      theme: "Irish Luck",
      rtp: 96.8,
      volatility: "Medium",
      minBet: { GC: 25, SC: 0.25 },
      emoji: "🍀",
    },
    {
      id: 14,
      name: "Viking Voyage",
      theme: "Norse Mythology",
      rtp: 97.0,
      volatility: "High",
      minBet: { GC: 45, SC: 0.45 },
      emoji: "⚔️",
    },
    {
      id: 15,
      name: "Candy Castle",
      theme: "Sweet Treats",
      rtp: 96.7,
      volatility: "Low",
      minBet: { GC: 15, SC: 0.15 },
      emoji: "🍭",
    },
    {
      id: 16,
      name: "Lightning Strike",
      theme: "Storm",
      rtp: 96.9,
      volatility: "High",
      minBet: { GC: 40, SC: 0.4 },
      emoji: "⚡",
    },
    {
      id: 17,
      name: "Ancient Temples",
      theme: "Archaeological",
      rtp: 96.8,
      volatility: "Medium",
      minBet: { GC: 30, SC: 0.3 },
      emoji: "🏛️",
    },
    {
      id: 18,
      name: "Racing Thunder",
      theme: "Motor Sports",
      rtp: 96.6,
      volatility: "High",
      minBet: { GC: 35, SC: 0.35 },
      emoji: "🏎️",
    },
    {
      id: 19,
      name: "Royal Crown",
      theme: "Monarchy",
      rtp: 97.2,
      volatility: "Medium",
      minBet: { GC: 50, SC: 0.5 },
      emoji: "👑",
    },
    {
      id: 20,
      name: "Safari Quest",
      theme: "African Safari",
      rtp: 96.7,
      volatility: "Low",
      minBet: { GC: 20, SC: 0.2 },
      emoji: "🦁",
    },
    {
      id: 21,
      name: "Crystal Caverns",
      theme: "Underground",
      rtp: 96.9,
      volatility: "Medium",
      minBet: { GC: 25, SC: 0.25 },
      emoji: "💠",
    },
    {
      id: 22,
      name: "Firebird Phoenix",
      theme: "Mythical",
      rtp: 97.1,
      volatility: "High",
      minBet: { GC: 45, SC: 0.45 },
      emoji: "🔥",
    },
    {
      id: 23,
      name: "Winter Wonderland",
      theme: "Seasonal",
      rtp: 96.5,
      volatility: "Low",
      minBet: { GC: 15, SC: 0.15 },
      emoji: "❄️",
    },
    {
      id: 24,
      name: "Samurai Honor",
      theme: "Japanese",
      rtp: 97.0,
      volatility: "Medium",
      minBet: { GC: 35, SC: 0.35 },
      emoji: "⚔️",
    },
    {
      id: 25,
      name: "Cosmic Jackpot",
      theme: "Space",
      rtp: 97.4,
      volatility: "High",
      minBet: { GC: 100, SC: 1.0 },
      emoji: "🌌",
    },
  ];

  const categories = [
    {
      id: "all",
      name: "All Games",
      icon: <Gamepad2 className="w-5 h-5" />,
      count: 25,
    },
    {
      id: "featured",
      name: "Featured",
      icon: <Star className="w-5 h-5" />,
      count: 8,
    },
    {
      id: "popular",
      name: "Popular",
      icon: <TrendingUp className="w-5 h-5" />,
      count: 12,
    },
    {
      id: "new",
      name: "New",
      icon: <Sparkles className="w-5 h-5" />,
      count: 6,
    },
    {
      id: "high-rtp",
      name: "High RTP",
      icon: <Trophy className="w-5 h-5" />,
      count: 9,
    },
    {
      id: "jackpot",
      name: "Jackpots",
      icon: <Crown className="w-5 h-5" />,
      count: 7,
    },
    {
      id: "bonus",
      name: "Bonus Features",
      icon: <Gift className="w-5 h-5" />,
      count: 15,
    },
    {
      id: "classic",
      name: "Classic",
      icon: <Gem className="w-5 h-5" />,
      count: 5,
    },
  ];

  const getVolatilityColor = (volatility: string): string => {
    switch (volatility) {
      case "Low":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "High":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getGameBadges = (game: any): React.ReactNode[] => {
    const badges: React.ReactNode[] = [];

    if (game.id <= 8) {
      badges.push(
        <Badge key="featured" className="bg-gold-500 text-black">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Badge>,
      );
    }

    if (game.rtp >= 97) {
      badges.push(
        <Badge key="high-rtp" className="bg-green-500 text-white">
          High RTP
        </Badge>,
      );
    }

    if (game.id >= 20) {
      badges.push(
        <Badge key="new" className="bg-blue-500 text-white">
          New
        </Badge>,
      );
    }

    if (game.id % 5 === 0) {
      badges.push(
        <Badge key="jackpot" className="bg-purple-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Jackpot
        </Badge>,
      );
    }

    return badges;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-gold-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                CoinKrazy Slots
                <Badge className="bg-purple-600 text-white text-base px-3 py-1">
                  25 Games
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Premium slot games with real gameplay mechanics • Win with GC/SC
                coins • Jackpots available
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Currency Display */}
              <Card className="bg-gradient-to-r from-gold/10 to-casino-blue/10 border-gold-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Button size="sm" className="bg-purple-600">
                        <Coins className="w-4 h-4 mr-1" />
                        GC
                      </Button>
                      <Button size="sm" variant="outline">
                        <Crown className="w-4 h-4 mr-1" />
                        SC
                      </Button>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      10,000 GC
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Balance
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jackpots Display */}
              <Card className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 border-gold-500/30">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gold-500 animate-pulse">
                      $2,847,593
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Jackpots
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              placeholder="Search games, themes, or features..."
              className="flex-1 bg-transparent border-none outline-none"
            />
            <Button variant="outline">Reset</Button>
            <Button variant="outline">Random</Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-purple-500/20"
          >
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                {category.icon}
              </div>
              <h3 className="font-medium text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {category.count} games
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {slotGames.map((game) => (
          <Card
            key={game.id}
            className="group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 border-border/50 hover:border-purple-500/50 overflow-hidden"
          >
            <div className="relative">
              {/* Game Thumbnail */}
              <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-gold-500/20 flex items-center justify-center text-6xl">
                <div className="text-4xl">{game.emoji}</div>
              </div>

              {/* Game Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {getGameBadges(game)}
              </div>

              {/* Favorite Button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:bg-black/20"
              >
                <Heart className="w-4 h-4" />
              </Button>

              {/* Jackpot Amount */}
              {game.id % 5 === 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <Badge className="w-full bg-gold-500/90 text-black font-bold">
                    💰 ${(Math.random() * 500000 + 100000).toFixed(0)}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg group-hover:text-purple-400 transition-colors line-clamp-1">
                  {game.name}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-xs ${getVolatilityColor(game.volatility)} border-current`}
                >
                  {game.volatility}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-1">
                CoinKrazy Studios
              </p>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                {game.theme}
              </p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RTP:</span>
                  <span className="text-green-400 font-medium">
                    {game.rtp}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min Bet:</span>
                  <span className="font-medium">{game.minBet.GC} GC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paylines:</span>
                  <span className="font-medium">25</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                <Badge variant="outline" className="text-xs">
                  Free Spins
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Wild Symbols
                </Badge>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play with GC
                </Button>

                <Button variant="outline" className="w-full" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Demo Play
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Safe Mode Notice */}
      <Card className="border-blue-500/20 bg-blue-500/10">
        <CardContent className="p-4 text-center">
          <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold mb-2">Safe Mode Active</h3>
          <p className="text-muted-foreground">
            All 25 slot games are available for viewing. Create an account to
            start playing with real currency.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
