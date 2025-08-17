import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Crown,
} from "lucide-react";

export default function IndexSafe() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-gold-500 rounded-full flex items-center justify-center text-4xl">
                😎
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
                CoinKrazy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Premium Social Casino • 25 Slot Games • Free Daily Coins
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/slots">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg font-bold">
                  <Play className="w-6 h-6 mr-2" />
                  Play 25 Slot Games Now
                </Button>
              </Link>
              <Link to="/games">
                <Button size="lg" variant="outline" className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black px-8 py-6 text-lg font-bold">
                  <Crown className="w-6 h-6 mr-2" />
                  Explore All Games
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose CoinKrazy?</h2>
            <p className="text-xl text-muted-foreground">
              The ultimate social casino experience with real gameplay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">25 Premium Slots</h3>
                <p className="text-muted-foreground">
                  Enjoy our collection of 25 unique slot games with real gameplay mechanics and progressive jackpots
                </p>
              </CardContent>
            </Card>

            <Card className="border-gold-500/20 hover:border-gold-500/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Free Daily Coins</h3>
                <p className="text-muted-foreground">
                  Get free Gold Coins and Sweeps Coins daily. No purchase necessary to play and win
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  Licensed and regulated social casino with secure payment processing and fair play
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Social Features</h3>
                <p className="text-muted-foreground">
                  Connect with friends, join tournaments, and compete on leaderboards
                </p>
              </CardContent>
            </Card>

            <Card className="border-pink-500/20 hover:border-pink-500/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real Prizes</h3>
                <p className="text-muted-foreground">
                  Win real cash prizes with Sweeps Coins. Redeem your winnings for real money
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 hover:border-orange-500/40 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Bonus Rewards</h3>
                <p className="text-muted-foreground">
                  Earn bonus coins through daily challenges, achievements, and special promotions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">25+</div>
              <div className="text-muted-foreground">Slot Games</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-gold-400 mb-2">24/7</div>
              <div className="text-muted-foreground">Customer Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-muted-foreground">Safe & Secure</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">FREE</div>
              <div className="text-muted-foreground">To Play</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600/10 to-gold-500/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Playing?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of players winning big at CoinKrazy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/slots">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg font-bold">
                <Play className="w-6 h-6 mr-2" />
                Start Playing Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
