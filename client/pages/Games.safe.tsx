import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Search,
  TrendingUp,
  Crown,
  Zap,
  Star,
  Clock,
  Users,
  Trophy,
  Dice1,
  Spade,
  Target,
  Gift,
} from "lucide-react";

export default function GamesSafe() {
  // Static game data without hooks
  const featuredGames = [
    {
      name: "CoinKrazy Slots",
      description: "25 Premium Slot Games",
      category: "slots",
      image: "🎰",
      color: "gold",
      href: "/slots",
    },
    {
      name: "Mini Games",
      description: "Quick Play Collection",
      category: "mini",
      image: "🎲",
      color: "purple",
      href: "/games",
    },
    {
      name: "Lucky Scratch Gold",
      description: "Scratch & Win",
      category: "scratch",
      image: "🪙",
      color: "gold",
      href: "/games",
    },
    {
      name: "Bingo Hall",
      description: "Live Bingo Rooms",
      category: "bingo",
      image: "🎯",
      color: "blue",
      href: "/bingo",
    },
  ];

  const gameCategories = [
    {
      title: "Slots",
      count: "25+",
      icon: Zap,
      color: "gold",
      description: "Premium slot machines with progressive jackpots",
    },
    {
      title: "Live Games",
      count: "24/7",
      icon: Trophy,
      color: "casino-blue",
      description: "Real-time multiplayer games",
    },
    {
      title: "Table Games",
      count: "10+",
      icon: Spade,
      color: "green",
      description: "Classic casino table games",
    },
    {
      title: "Mini Games",
      count: "15+",
      icon: Dice1,
      color: "purple",
      description: "Quick play arcade style games",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Game Lobby</h1>
            <p className="text-muted-foreground text-lg">
              Premium Games • Real-Time Jackpots • Instant Play
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-6">
          <Card className="border-gold-500/20 bg-gold-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-gold-500" />
                <div>
                  <p className="text-gold-400 font-medium">
                    Welcome to CoinKrazy! Start playing with free Gold Coins.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Safe Mode: All games available for viewing • Create account
                    to start playing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Games */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Crown className="w-6 h-6 mr-2 text-gold-500" />
              Featured Games
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredGames.map((game, index) => (
              <Link key={index} to={game.href}>
                <Card className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-gold-500/20 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{game.image}</div>
                        <div className="text-sm text-muted-foreground">
                          {game.category}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-bold mb-1">{game.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {game.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30">
                        Featured
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-gold-500 hover:bg-gold-600 text-black"
                      >
                        Play
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Game Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Game Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameCategories.map((category, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-gold-500/50"
              >
                <category.icon
                  className={`w-12 h-12 mx-auto mb-4 ${
                    category.color === "gold"
                      ? "text-gold-500"
                      : category.color === "casino-blue"
                        ? "text-blue-500"
                        : category.color === "green"
                          ? "text-green-500"
                          : "text-purple-500"
                  }`}
                />
                <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {category.count} Games
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
                <Button variant="outline" size="sm">
                  Explore
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Games Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Games</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }, (_, i) => (
              <Card
                key={i}
                className="group cursor-pointer border-border hover:border-gold-500/50 transition-all duration-300"
              >
                <CardContent className="p-3">
                  <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-casino-blue/30 rounded-lg mb-2 overflow-hidden relative">
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🎰
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        className="bg-gold-500 hover:bg-gold-600 text-black"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-bold text-sm mb-1 truncate">
                    Sample Game {i + 1}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    CoinKrazy Studios
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-400">RTP 96.5%</span>
                    <span className="text-gold-400 font-mono">
                      ${(Math.random() * 50000 + 10000).toFixed(0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-sm text-muted-foreground">
                Players Online
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">$2.1M</div>
              <div className="text-sm text-muted-foreground">
                Total Jackpots
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">96.5%</div>
              <div className="text-sm text-muted-foreground">Average RTP</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Always Open</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
