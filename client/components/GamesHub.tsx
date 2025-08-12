import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Gamepad2,
  Target,
  Users,
  Crown,
  Star,
  Trophy,
  Clock,
  DollarSign,
  Coins,
  TrendingUp,
  Play,
  Eye,
  Zap,
  Fire,
  Sparkles,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Award,
  Timer,
  Tv,
  Radio,
  Football,
  Spade,
  Heart,
  Diamond,
  Club,
  CircleDot,
  Dice1,
  Grid3X3,
  Activity,
  Globe,
  MessageCircle,
  Bell,
  Settings,
  Info,
  Plus,
  ChevronRight,
  ArrowRight,
  TrendingDown,
  Layers,
  MonitorSpeaker,
  Headphones,
  Volume2,
  Maximize,
  Bookmark,
  Share2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Import all game components
import BingoHall from "./BingoHall";
import PokerTournaments from "./PokerTournaments";
import PokerGames from "./PokerGames";
import TableGames from "./TableGames";
import LiveGames from "./LiveGames";
import SportsBook from "./SportsBook";

interface GameSection {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'casino' | 'poker' | 'live' | 'sports' | 'specialty';
  featured: boolean;
  popular: boolean;
  status: 'active' | 'maintenance' | 'coming-soon';
  playerCount: number;
  minBet: number;
  maxWin: number;
  component: React.ComponentType;
  image?: string;
  features: string[];
  tags: string[];
}

export default function GamesHub() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'casino' | 'poker' | 'live' | 'sports' | 'specialty'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFeatured, setShowFeatured] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  
  const gameSections: GameSection[] = [
    {
      id: 'bingo',
      name: 'Bingo Hall',
      title: 'Live Bingo Hall',
      description: 'Multi-room bingo with tournaments and progressive jackpots',
      icon: <Grid3X3 className="w-8 h-8" />,
      category: 'specialty',
      featured: true,
      popular: true,
      status: 'active',
      playerCount: 1247,
      minBet: 1,
      maxWin: 50000,
      component: BingoHall,
      features: ['Live Chat', 'Auto-Mark', 'Multiple Rooms', 'Tournaments', 'Progressive Jackpots'],
      tags: ['Community', 'Easy to Play', 'Big Prizes', 'Social']
    },
    {
      id: 'poker-tournaments',
      name: 'Poker Tournaments',
      title: 'Tournament Poker',
      description: 'Multi-table tournaments with guaranteed prize pools',
      icon: <Trophy className="w-8 h-8" />,
      category: 'poker',
      featured: true,
      popular: true,
      status: 'active',
      playerCount: 856,
      minBet: 10,
      maxWin: 100000,
      component: PokerTournaments,
      features: ['Multi-Table', 'Blind Structure', 'Prize Pools', 'Sit & Go', 'Scheduled Events'],
      tags: ['Competitive', 'Strategy', 'Big Prizes', 'Skill-Based']
    },
    {
      id: 'poker-games',
      name: 'Poker Games',
      title: 'Cash Game Poker',
      description: 'Texas Hold\'em, Omaha, and Seven Card Stud tables',
      icon: <Target className="w-8 h-8" />,
      category: 'poker',
      featured: false,
      popular: true,
      status: 'active',
      playerCount: 634,
      minBet: 5,
      maxWin: 25000,
      component: PokerGames,
      features: ['Multiple Variants', 'Real-time Play', 'Chat', 'Statistics', 'Hand History'],
      tags: ['Strategy', 'Multiplayer', 'Skill-Based', 'Classic']
    },
    {
      id: 'table-games',
      name: 'Table Games',
      title: 'Classic Casino Games',
      description: 'Blackjack, Roulette, Baccarat, and Craps',
      icon: <Spade className="w-8 h-8" />,
      category: 'casino',
      featured: true,
      popular: true,
      status: 'active',
      playerCount: 923,
      minBet: 10,
      maxWin: 10000,
      component: TableGames,
      features: ['Multiple Tables', 'Professional Rules', 'Statistics', 'Chat', 'Live Action'],
      tags: ['Classic', 'Fast-Paced', 'Strategy', 'Traditional']
    },
    {
      id: 'live-games',
      name: 'Live Casino',
      title: 'Live Dealer Games',
      description: 'Real dealers and live streaming casino action',
      icon: <Tv className="w-8 h-8" />,
      category: 'live',
      featured: true,
      popular: true,
      status: 'active',
      playerCount: 445,
      minBet: 25,
      maxWin: 25000,
      component: LiveGames,
      features: ['Live Dealers', 'HD Streaming', 'Multi-Camera', 'Tip Dealers', 'VIP Tables'],
      tags: ['Authentic', 'Live Streaming', 'Professional', 'Interactive']
    },
    {
      id: 'sportsbook',
      name: 'Sports Book',
      title: 'Sports Betting',
      description: 'Live sports betting with real-time odds',
      icon: <Football className="w-8 h-8" />,
      category: 'sports',
      featured: true,
      popular: true,
      status: 'active',
      playerCount: 1156,
      minBet: 5,
      maxWin: 50000,
      component: SportsBook,
      features: ['Live Betting', 'Multiple Sports', 'Parlays', 'Live Odds', 'Cash Out'],
      tags: ['Live Betting', 'Real Sports', 'Multiple Markets', 'Cash Out']
    }
  ];

  const getFilteredSections = () => {
    let filtered = gameSections;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(section => section.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(section =>
        section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => {
      // Sort by: featured > popular > others, then by player count
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return b.playerCount - a.playerCount;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPlayerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'casino': return <Spade className="w-5 h-5" />;
      case 'poker': return <Target className="w-5 h-5" />;
      case 'live': return <Tv className="w-5 h-5" />;
      case 'sports': return <Football className="w-5 h-5" />;
      case 'specialty': return <Grid3X3 className="w-5 h-5" />;
      default: return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'destructive';
      case 'coming-soon': return 'secondary';
      default: return 'outline';
    }
  };

  const GameSectionCard = ({ section }: { section: GameSection }) => (
    <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer group ${
      section.featured ? 'border-gold-500/50 bg-gradient-to-br from-gold/5 to-gold/10' : ''
    } ${section.popular ? 'border-purple-500/30' : ''}`}>
      {section.featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-gold-500 text-black">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}
      
      {section.popular && !section.featured && (
        <div className="absolute -top-2 -right-2 z-10">
          <Badge className="bg-purple-600 text-white">
            <Fire className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              section.category === 'casino' ? 'bg-blue-500/10 text-blue-500' :
              section.category === 'poker' ? 'bg-purple-500/10 text-purple-500' :
              section.category === 'live' ? 'bg-red-500/10 text-red-500' :
              section.category === 'sports' ? 'bg-green-500/10 text-green-500' :
              'bg-orange-500/10 text-orange-500'
            }`}>
              {section.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{section.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {section.category.charAt(0).toUpperCase() + section.category.slice(1)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(section.status)}>
              {section.status === 'active' && <Radio className="w-3 h-3 mr-1 animate-pulse" />}
              {section.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-muted-foreground">{section.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-blue-500">
              {formatPlayerCount(section.playerCount)}
            </div>
            <div className="text-muted-foreground">Players</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-500">
              {formatCurrency(section.minBet)}
            </div>
            <div className="text-muted-foreground">Min Bet</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-gold-500">
              {formatCurrency(section.maxWin)}
            </div>
            <div className="text-muted-foreground">Max Win</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Features</div>
          <div className="flex flex-wrap gap-1">
            {section.features.slice(0, 4).map(feature => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {section.features.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{section.features.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {section.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => setActiveSection(section.id)}
            className="flex-1 group-hover:scale-105 transition-transform"
            disabled={section.status !== 'active'}
          >
            <Play className="w-4 h-4 mr-2" />
            Play Now
          </Button>
          
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button variant="outline" size="sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const QuickStatsWidget = () => (
    <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Live Gaming Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {gameSections.reduce((sum, section) => sum + section.playerCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Players</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {gameSections.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">Active Games</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {gameSections.filter(s => s.featured).length}
            </div>
            <div className="text-sm text-muted-foreground">Featured</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gold-500">
              $2.4M
            </div>
            <div className="text-sm text-muted-foreground">Daily Prizes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PromotionsWidget = () => (
    <Card className="bg-gradient-to-r from-gold-500/10 to-orange-500/10 border-gold-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-gold-500" />
          Featured Promotions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-gold-500/10 border border-gold-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Welcome Bonus</div>
              <div className="text-sm text-muted-foreground">Get 100% match on first deposit</div>
            </div>
            <Badge className="bg-gold-500 text-black">NEW</Badge>
          </div>
        </div>
        
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Daily Spin</div>
              <div className="text-sm text-muted-foreground">Free spins every 24 hours</div>
            </div>
            <Badge className="bg-purple-500 text-white">DAILY</Badge>
          </div>
        </div>
        
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Tournament Special</div>
              <div className="text-sm text-muted-foreground">Double points this weekend</div>
            </div>
            <Badge className="bg-blue-500 text-white">LIMITED</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const RecentActivityWidget = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Big Win in Poker!</div>
              <div className="text-sm text-muted-foreground">Player123 won $15,000</div>
            </div>
            <div className="text-xs text-muted-foreground">2m ago</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Tournament Starting</div>
              <div className="text-sm text-muted-foreground">Sunday Major begins in 5 min</div>
            </div>
            <div className="text-xs text-muted-foreground">5m ago</div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">New Feature</div>
              <div className="text-sm text-muted-foreground">Multi-camera live games now available</div>
            </div>
            <div className="text-xs text-muted-foreground">1h ago</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render active section
  if (activeSection) {
    const section = gameSections.find(s => s.id === activeSection);
    if (section) {
      const Component = section.component;
      return (
        <div className="space-y-6">
          {/* Navigation Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveSection(null)}
                  >
                    ← Back to Games Hub
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <div>
                      <div className="font-bold">{section.name}</div>
                      <div className="text-sm text-muted-foreground">{section.description}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{formatPlayerCount(section.playerCount)} players</Badge>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Render Game Component */}
          <Component />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-4xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-white" />
                </div>
                Gaming Hub
                <Badge className="bg-purple-600 text-white text-lg px-4 py-2">Live Now</Badge>
              </CardTitle>
              <p className="text-muted-foreground text-lg mt-2">
                Your gateway to world-class casino gaming, poker tournaments, live dealers, and sports betting
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {gameSections.filter(s => s.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Games</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <QuickStatsWidget />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search games, features, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="casino">Casino Games</SelectItem>
                  <SelectItem value="poker">Poker</SelectItem>
                  <SelectItem value="live">Live Casino</SelectItem>
                  <SelectItem value="sports">Sports Betting</SelectItem>
                  <SelectItem value="specialty">Specialty Games</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFeatured ? 'default' : 'outline'}
                onClick={() => setShowFeatured(!showFeatured)}
              >
                <Star className="w-4 h-4 mr-2" />
                Featured
              </Button>

              <Button variant="outline">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            All Games
          </TabsTrigger>
          <TabsTrigger value="casino" className="flex items-center gap-2">
            <Spade className="w-4 h-4" />
            Casino
          </TabsTrigger>
          <TabsTrigger value="poker" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Poker
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            Live Casino
          </TabsTrigger>
          <TabsTrigger value="sports" className="flex items-center gap-2">
            <Football className="w-4 h-4" />
            Sports
          </TabsTrigger>
          <TabsTrigger value="specialty" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Specialty
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Games Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getFilteredSections().map(section => (
                  <GameSectionCard key={section.id} section={section} />
                ))}
              </div>

              {getFilteredSections().length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Games Found</h3>
                    <p className="text-muted-foreground">
                      No games match your current filters. Try adjusting your search criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PromotionsWidget />
              <RecentActivityWidget />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
