import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Trophy, 
  Users, 
  Zap, 
  Shield, 
  Gift,
  Play,
  Star,
  TrendingUp,
  Crown
} from 'lucide-react';

export default function Index() {
  const [playersOnline, setPlayersOnline] = useState(2847);
  const [totalWinnings, setTotalWinnings] = useState(892847);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayersOnline(prev => prev + Math.floor(Math.random() * 10) - 5);
      setTotalWinnings(prev => prev + Math.floor(Math.random() * 1000));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const featuredGames = [
    { name: "Josey Duck Game", rtp: "96.8%", jackpot: "$125,847", players: 423 },
    { name: "Colin Shots", rtp: "97.2%", jackpot: "$89,234", players: 312 },
    { name: "Beth's Darts", rtp: "96.5%", jackpot: "$67,891", players: 289 },
    { name: "Golden Spades", rtp: "96.9%", jackpot: "$156,782", players: 567 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-casino-blue/20 via-gold/10 to-casino-blue/20 animate-pulse"></div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-24">
          <div className="text-center space-y-8">
            {/* Logo & Tagline */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                CoinKrazy
              </h1>
              <p className="text-xl md:text-2xl text-gold-300 font-medium">
                Where Fun Meets Fortune™
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline" className="border-gold-500 text-gold-400">
                  <Shield className="w-3 h-3 mr-1" />
                  18+ Only
                </Badge>
                <Badge variant="outline" className="border-casino-blue text-casino-blue-light">
                  <Zap className="w-3 h-3 mr-1" />
                  Sweepstakes Legal
                </Badge>
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-casino-blue" />
                  <span className="text-2xl font-bold text-foreground">{playersOnline.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Players Online</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-gold-500" />
                  <span className="text-2xl font-bold text-foreground">${totalWinnings.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Won Today</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-gold-500" />
                  <span className="text-2xl font-bold text-foreground">700+</span>
                </div>
                <p className="text-sm text-muted-foreground">Games Available</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/games">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-6 text-lg shadow-lg shadow-gold-500/25"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Now - Free Gold Coins
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-casino-blue text-casino-blue-light hover:bg-casino-blue/10 px-8 py-6 text-lg"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Sign Up Bonus
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Games</h2>
          <p className="text-muted-foreground text-lg">Experience our most popular slots and games</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames.map((game, index) => (
            <Card key={index} className="group hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-300 border-border/50 hover:border-gold-500/50">
              <CardContent className="p-6">
                <div className="aspect-square bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-lg mb-4 flex items-center justify-center">
                  <Coins className="w-12 h-12 text-gold-500" />
                </div>
                <h3 className="font-bold text-lg mb-2">{game.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RTP:</span>
                    <span className="text-green-400 font-medium">{game.rtp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jackpot:</span>
                    <span className="text-gold-400 font-bold">{game.jackpot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Playing:</span>
                    <span className="text-casino-blue-light">{game.players} players</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Game Categories */}
      <div className="bg-card/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Game Categories</h2>
            <p className="text-muted-foreground text-lg">Choose your adventure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Slots", count: "700+", icon: Coins, color: "gold" },
              { title: "Live Poker", count: "24/7", icon: Trophy, color: "casino-blue" },
              { title: "Bingo Rooms", count: "10+", icon: Star, color: "gold" },
              { title: "Sportsbook", count: "Live", icon: TrendingUp, color: "casino-blue" }
            ].map((category, index) => (
              <Link key={index} to="/games" className="group">
                <Card className="text-center p-8 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-gold-500/50">
                  <category.icon className={`w-12 h-12 mx-auto mb-4 ${category.color === 'gold' ? 'text-gold-500' : 'text-casino-blue'}`} />
                  <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-4">{category.count} Games</p>
                  <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                    Explore
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 border-gold-500/20">
          <CardContent className="text-center p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to Win Big?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of players winning real cash prizes daily. Start with free Gold Coins and unlock Sweeps Coins for real rewards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold px-8 py-6 text-lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Get Started Free
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                No purchase necessary • 18+ only • Play responsibly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
