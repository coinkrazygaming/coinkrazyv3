import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Filter,
  Search,
  Star,
  Trophy,
  Users,
  TrendingUp
} from 'lucide-react';

export default function Games() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Game Lobby</h1>
            <p className="text-muted-foreground text-lg">Choose from over 700 exciting games</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search games..." 
              className="bg-card border border-border rounded-lg px-3 py-2 flex-1"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All Games', 'Slots', 'Live Poker', 'Bingo', 'Sportsbook', 'Table Games'].map((category) => (
            <Button 
              key={category}
              variant={category === 'All Games' ? 'default' : 'outline'}
              className={category === 'All Games' ? 'bg-gold-500 text-black hover:bg-gold-600' : ''}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Placeholder Message */}
        <Card className="text-center p-12 border-gold-500/20">
          <CardContent>
            <Coins className="w-16 h-16 text-gold-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Games Coming Soon!</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're building an amazing game library with 700+ slots, live poker, bingo rooms, and more. 
              Check back soon or continue the conversation to help us build out this section!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                <Star className="w-4 h-4 mr-2" />
                Get Notified
              </Button>
              <Button variant="outline">
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
