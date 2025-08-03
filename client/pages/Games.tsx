import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Coins, 
  Filter,
  Search,
  Star,
  Trophy,
  Users,
  TrendingUp,
  Play,
  Crown,
  Zap,
  Target,
  Gamepad2,
  Timer,
  DollarSign,
  Eye,
  Heart,
  Shuffle
} from 'lucide-react';

// Simulated game data
const slotGames = [
  // Popular Pragmatic Play games
  { id: 1, name: "Sweet Bonanza", provider: "Pragmatic Play", rtp: "96.48%", jackpot: "$125,847", players: 423, category: "slots", featured: true, image: "🍭" },
  { id: 2, name: "The Dog House", provider: "Pragmatic Play", rtp: "96.51%", jackpot: "$89,234", players: 312, category: "slots", featured: true, image: "🐕" },
  { id: 3, name: "Gates of Olympus", provider: "Pragmatic Play", rtp: "96.50%", jackpot: "$267,891", players: 578, category: "slots", featured: true, image: "⚡" },
  { id: 4, name: "Wolf Gold", provider: "Pragmatic Play", rtp: "96.01%", jackpot: "$156,782", players: 445, category: "slots", featured: true, image: "🐺" },
  
  // NetEnt classics
  { id: 5, name: "Starburst", provider: "NetEnt", rtp: "96.09%", jackpot: "$45,234", players: 678, category: "slots", image: "💎" },
  { id: 6, name: "Gonzo's Quest", provider: "NetEnt", rtp: "95.97%", jackpot: "$78,123", players: 534, category: "slots", image: "🗿" },
  { id: 7, name: "Dead or Alive 2", provider: "NetEnt", rtp: "96.82%", jackpot: "$189,456", players: 389, category: "slots", image: "🤠" },
  
  // Play'n GO games
  { id: 8, name: "Book of Dead", provider: "Play'n GO", rtp: "96.21%", jackpot: "$123,567", players: 445, category: "slots", image: "📚" },
  { id: 9, name: "Reactoonz", provider: "Play'n GO", rtp: "96.51%", jackpot: "$234,789", players: 356, category: "slots", image: "👽" },
  
  // Custom CoinKrazy games
  { id: 10, name: "Josey Duck Game", provider: "CoinKrazy", rtp: "96.8%", jackpot: "$425,847", players: 723, category: "slots", featured: true, image: "🦆" },
  { id: 11, name: "Colin Shots", provider: "CoinKrazy", rtp: "97.2%", jackpot: "$189,234", players: 612, category: "slots", featured: true, image: "🎯" },
  { id: 12, name: "Beth's Darts", provider: "CoinKrazy", rtp: "96.5%", jackpot: "$167,891", players: 489, category: "slots", featured: true, image: "🎯" },
];

const liveGames = [
  { id: 13, name: "Texas Hold'em", type: "poker", players: 245, pot: "$12,450", status: "active", image: "♠️" },
  { id: 14, name: "Omaha Hi-Lo", type: "poker", players: 156, pot: "$8,750", status: "active", image: "♥️" },
  { id: 15, name: "7-Card Stud", type: "poker", players: 89, pot: "$5,250", status: "active", image: "♦️" },
  { id: 16, name: "Jailhouse Spades", type: "spades", players: 123, pot: "$3,450", status: "active", image: "♠️" },
];

const bingoRooms = [
  { id: 17, name: "Golden Room", nextGame: "2 min", pot: "$15,450", players: 234, type: "90-ball", image: "🏆" },
  { id: 18, name: "Silver Room", nextGame: "5 min", pot: "$8,750", players: 167, type: "75-ball", image: "🥈" },
  { id: 19, name: "Bronze Room", nextGame: "1 min", pot: "$4,250", players: 89, type: "30-ball", image: "🥉" },
];

export default function Games() {
  const [selectedCategory, setSelectedCategory] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyMode, setCurrencyMode] = useState<'GC' | 'SC'>('GC');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Live updating stats
  const [liveStats, setLiveStats] = useState({
    totalPlayers: 4567,
    activeGames: 342,
    totalPayout: 892847
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        totalPlayers: prev.totalPlayers + Math.floor(Math.random() * 20) - 10,
        activeGames: prev.activeGames + Math.floor(Math.random() * 6) - 3,
        totalPayout: prev.totalPayout + Math.floor(Math.random() * 5000)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = slotGames.filter(game => {
    if (selectedCategory === 'featured') return game.featured;
    if (selectedCategory === 'slots') return game.category === 'slots';
    return true;
  }).filter(game => 
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = (gameId: number) => {
    setFavorites(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-casino-blue/10 via-gold/5 to-casino-blue/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">Game Lobby</h1>
              <p className="text-muted-foreground text-lg">700+ Premium Games • Live Tournaments • Real Prizes</p>
            </div>
            
            {/* Live Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-casino-blue" />
                  <span className="text-2xl font-bold">{liveStats.totalPlayers.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Players Online</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="w-5 h-5 text-gold-500" />
                  <span className="text-2xl font-bold">{liveStats.activeGames}</span>
                </div>
                <p className="text-sm text-muted-foreground">Games Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold">${liveStats.totalPayout.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Won Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Currency Selector & Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex bg-card rounded-lg p-1">
              <Button 
                variant={currencyMode === 'GC' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrencyMode('GC')}
                className={currencyMode === 'GC' ? 'bg-gold-500 text-black hover:bg-gold-600' : ''}
              >
                <Coins className="w-4 h-4 mr-2" />
                Gold Coins (Play)
              </Button>
              <Button 
                variant={currencyMode === 'SC' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrencyMode('SC')}
                className={currencyMode === 'SC' ? 'bg-casino-blue text-white hover:bg-casino-blue-dark' : ''}
              >
                <Crown className="w-4 h-4 mr-2" />
                Sweeps Coins (Win)
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search games, providers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-card border-border"
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Game Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="featured">
              <Star className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="slots">
              <Coins className="w-4 h-4 mr-2" />
              Slots
            </TabsTrigger>
            <TabsTrigger value="live">
              <Users className="w-4 h-4 mr-2" />
              Live Games
            </TabsTrigger>
            <TabsTrigger value="bingo">
              <Target className="w-4 h-4 mr-2" />
              Bingo
            </TabsTrigger>
            <TabsTrigger value="sports">
              <Trophy className="w-4 h-4 mr-2" />
              Sports
            </TabsTrigger>
          </TabsList>

          {/* Slot Games */}
          <TabsContent value="featured" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="group hover:shadow-xl hover:shadow-gold-500/20 transition-all duration-300 border-border/50 hover:border-gold-500/50 overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-gold/20 flex items-center justify-center text-6xl">
                      {game.image}
                    </div>
                    {game.featured && (
                      <Badge className="absolute top-2 left-2 bg-gold-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-black/20"
                      onClick={() => toggleFavorite(game.id)}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-gold-400 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{game.provider}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
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
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play {currencyMode}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="slots" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="group hover:shadow-xl hover:shadow-gold-500/20 transition-all duration-300 border-border/50 hover:border-gold-500/50 overflow-hidden">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-gold/20 flex items-center justify-center text-6xl">
                      {game.image}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-white hover:bg-black/20"
                      onClick={() => toggleFavorite(game.id)}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(game.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-gold-400 transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{game.provider}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
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
                    
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play {currencyMode}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Games */}
          <TabsContent value="live" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveGames.map((game) => (
                <Card key={game.id} className="hover:shadow-xl transition-all duration-300 border-border/50 hover:border-casino-blue/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-3xl">{game.image}</span>
                        {game.name}
                      </CardTitle>
                      <Badge variant="outline" className="border-green-500 text-green-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        LIVE
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-bold">{game.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Pot:</span>
                        <span className="text-gold-400 font-bold">{game.pot}</span>
                      </div>
                      <Button className="w-full bg-casino-blue hover:bg-casino-blue-dark">
                        <Users className="w-4 h-4 mr-2" />
                        Join Table
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bingo Rooms */}
          <TabsContent value="bingo" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bingoRooms.map((room) => (
                <Card key={room.id} className="hover:shadow-xl transition-all duration-300 border-border/50 hover:border-gold-500/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-3xl">{room.image}</span>
                      {room.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Game:</span>
                        <span className="font-bold text-casino-blue">{room.nextGame}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prize Pool:</span>
                        <span className="text-gold-400 font-bold">{room.pot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Players:</span>
                        <span className="font-bold">{room.players}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="text-sm">{room.type}</span>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold">
                        <Timer className="w-4 h-4 mr-2" />
                        Enter Room
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sportsbook */}
          <TabsContent value="sports" className="mt-8">
            <Card className="text-center p-12 border-casino-blue/20">
              <CardContent>
                <Trophy className="w-16 h-16 text-casino-blue mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Live Sportsbook Coming Soon!</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Live betting on NFL, NBA, MLB, soccer and more with real-time odds integration via TheOddsAPI.
                </p>
                <Button className="bg-casino-blue hover:bg-casino-blue-dark">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Get Notified
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
