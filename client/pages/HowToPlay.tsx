import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Coins,
  Crown,
  Trophy,
  Star,
  Gift,
  PlayCircle,
  DollarSign,
  Shield,
  Info,
} from "lucide-react";

export default function HowToPlay() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12 border-b border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">How to Play at CoinKrazy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your complete guide to playing and winning at CoinKrazy.com. Learn
            the basics, master the games, and maximize your rewards!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <PlayCircle className="w-6 h-6 text-casino-blue" />
              Getting Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-casino-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-casino-blue">1</span>
                </div>
                <h3 className="font-bold mb-2">Create Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for free and get your welcome bonus of Gold Coins and
                  Sweeps Coins to start playing immediately.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-gold-500">2</span>
                </div>
                <h3 className="font-bold mb-2">Choose Your Game</h3>
                <p className="text-sm text-muted-foreground">
                  Browse our collection of slots, scratch cards, table games,
                  and more. Each game has different rules and payout structures.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-500">3</span>
                </div>
                <h3 className="font-bold mb-2">Start Playing</h3>
                <p className="text-sm text-muted-foreground">
                  Place your bets using Gold Coins for fun or Sweeps Coins for
                  real prizes. Win big and redeem your rewards!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coin Types */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Coins className="w-6 h-6 text-gold-500" />
              Understanding Coin Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gold-500/5 border border-gold-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="w-8 h-8 text-gold-500" />
                  <div>
                    <h3 className="font-bold text-lg">Gold Coins (GC)</h3>
                    <Badge className="bg-gold-500 text-black">
                      Entertainment Only
                    </Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Used for entertainment and fun gameplay</li>
                  <li>• Cannot be redeemed for real money</li>
                  <li>• Get more through daily bonuses and purchases</li>
                  <li>• Play any game in our casino</li>
                </ul>
              </div>

              <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-8 h-8 text-purple-500" />
                  <div>
                    <h3 className="font-bold text-lg">Sweeps Coins (SC)</h3>
                    <Badge className="bg-purple-500 text-white">
                      Real Prizes
                    </Badge>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <li>• Can be redeemed for real cash prizes</li>
                  <li>• Earned through promotions and purchases</li>
                  <li>• Minimum redemption: $100 (100 SC)</li>
                  <li>• Subject to terms and conditions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gamepad2 className="w-6 h-6 text-casino-blue" />
              Game Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold-500" />
                  Slot Machines
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Spin the reels and match symbols for wins. Features include
                  wilds, scatters, free spins, and progressive jackpots.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• CoinKrazy Spinner (5 reels, 25 paylines)</li>
                  <li>• Progressive jackpots</li>
                  <li>• Bonus rounds and free spins</li>
                  <li>• RTP: 96.8%</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  Scratch Cards
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Instant win games where you scratch to reveal symbols. Match
                  winning combinations for immediate payouts.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Lucky Scratch Gold</li>
                  <li>• Instant win prizes</li>
                  <li>• Touch/mouse scratching</li>
                  <li>• RTP: 97.2%</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-500" />
                  Table Games
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Classic casino games including blackjack, roulette, baccarat,
                  and poker variations.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Blackjack (multiple variants)</li>
                  <li>• Roulette (American & European)</li>
                  <li>• Baccarat</li>
                  <li>• Poker games</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                  Bingo
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Number matching games with progressive jackpots and special
                  patterns for bigger wins.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• 75-ball and 90-ball variants</li>
                  <li>• Progressive jackpots</li>
                  <li>• Special pattern games</li>
                  <li>• Community gameplay</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Sports Betting
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Bet on live sports events with competitive odds and multiple
                  betting options.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Live sports events</li>
                  <li>• Multiple bet types</li>
                  <li>• Real-time odds</li>
                  <li>• Parlay betting</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-orange-500" />
                  Mini Games
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Quick and fun arcade-style games with instant payouts and
                  simple gameplay.
                </p>
                <ul className="text-xs space-y-1">
                  <li>• Wheel of Fortune</li>
                  <li>• Dice games</li>
                  <li>• Card matching</li>
                  <li>• Daily challenges</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips for Success */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Star className="w-6 h-6 text-gold-500" />
              Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">Smart Gaming Strategies</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Set a budget and stick to it</li>
                  <li>• Take advantage of daily bonuses</li>
                  <li>• Learn game rules and RTP rates</li>
                  <li>• Try games in demo mode first</li>
                  <li>• Join our VIP program for better rewards</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3">Maximizing Rewards</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Complete daily challenges</li>
                  <li>• Participate in tournaments</li>
                  <li>• Follow our social media for bonuses</li>
                  <li>• Refer friends for bonus coins</li>
                  <li>• Check promotions page regularly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsible Gaming */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="w-6 h-6 text-green-500" />
              Responsible Gaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6">
              <p className="mb-4">
                At CoinKrazy, we promote responsible gaming and provide tools to
                help you stay in control:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Set deposit and loss limits</li>
                <li>• Take cooling-off periods</li>
                <li>• Self-exclusion options available</li>
                <li>• Access to problem gambling resources</li>
                <li>• 24/7 customer support</li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Remember: Gaming should be fun and entertaining. Never bet more
                than you can afford to lose.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
