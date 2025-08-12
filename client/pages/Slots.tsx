import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Coins,
  Crown,
  Star,
  Trophy,
  Play,
  Search,
  Filter,
  TrendingUp,
  Sparkles,
  Gem,
  Award,
  Gift,
  Gamepad2,
  RotateCcw,
  Heart,
  Eye,
  Zap,
  Target,
  ArrowLeft,
  Shuffle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  SLOT_GAMES_CONFIG, 
  SlotGameConfig, 
  getGamesByCategory, 
  getFeaturedGames, 
  getPopularGames, 
  getNewGames, 
  getJackpotGames, 
  getHighRTPGames 
} from '@/services/slotsGamesConfig';
import { slotsGameEngine } from '@/services/slotsGameEngine';
import { balanceService } from '@/services/balanceService';
import { walletService } from '@/services/walletService';
import CoinKrazySlotMachine from '@/components/games/CoinKrazySlotMachine';

interface SlotCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  gameCount: number;
}

export default function Slots() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<SlotGameConfig | null>(null);
  const [games, setGames] = useState<SlotGameConfig[]>(SLOT_GAMES_CONFIG);
  const [filteredGames, setFilteredGames] = useState<SlotGameConfig[]>(SLOT_GAMES_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'rtp' | 'name' | 'release'>('popularity');
  const [volatilityFilter, setVolatilityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currency, setCurrency] = useState<'GC' | 'SC'>('GC');
  const [balance, setBalance] = useState({ GC: 0, SC: 0 });
  const [jackpotAmounts, setJackpotAmounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);

  // Categories for slot games
  const categories: SlotCategory[] = [
    {
      id: 'all',
      name: 'All Games',
      icon: <Gamepad2 className="w-5 h-5" />,
      description: 'Browse all 25 slot games',
      gameCount: games.length,
    },
    {
      id: 'featured',
      name: 'Featured',
      icon: <Star className="w-5 h-5" />,
      description: 'Our top recommended games',
      gameCount: getFeaturedGames().length,
    },
    {
      id: 'popular',
      name: 'Popular',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Most played games',
      gameCount: getPopularGames().length,
    },
    {
      id: 'new',
      name: 'New',
      icon: <Sparkles className="w-5 h-5" />,
      description: 'Latest releases',
      gameCount: getNewGames().length,
    },
    {
      id: 'high-rtp',
      name: 'High RTP',
      icon: <Trophy className="w-5 h-5" />,
      description: 'Games with 97%+ RTP',
      gameCount: getHighRTPGames().length,
    },
    {
      id: 'jackpot',
      name: 'Jackpots',
      icon: <Crown className="w-5 h-5" />,
      description: 'Progressive & fixed jackpots',
      gameCount: getJackpotGames().length,
    },
    {
      id: 'bonus',
      name: 'Bonus Features',
      icon: <Gift className="w-5 h-5" />,
      description: 'Games with bonus rounds',
      gameCount: games.filter(g => g.bonusRounds || g.freeSpins).length,
    },
    {
      id: 'classic',
      name: 'Classic',
      icon: <Gem className="w-5 h-5" />,
      description: 'Traditional slot machines',
      gameCount: games.filter(g => g.reels <= 3).length,
    },
  ];

  // Initialize component
  useEffect(() => {
    if (user) {
      // Load user balance
      updateBalance();
      
      // Get selected currency from wallet service
      const selectedCurrency = walletService.getSelectedCurrency();
      if (selectedCurrency === 'GC' || selectedCurrency === 'SC') {
        setCurrency(selectedCurrency);
      }

      // Subscribe to wallet currency changes
      const unsubscribeCurrency = walletService.subscribeToCurrencyChanges((newCurrency) => {
        if (newCurrency === 'GC' || newCurrency === 'SC') {
          setCurrency(newCurrency);
        }
      });

      // Subscribe to balance updates
      const unsubscribeBalance = balanceService.subscribeToBalanceUpdates(user.id, (userBalance) => {
        setBalance({
          GC: userBalance.gc,
          SC: userBalance.sc
        });
      });

      // Load jackpot amounts
      loadJackpots();
      const jackpotInterval = setInterval(loadJackpots, 10000); // Update every 10 seconds

      return () => {
        unsubscribeCurrency();
        unsubscribeBalance();
        clearInterval(jackpotInterval);
      };
    }
  }, [user]);

  // Filter games when filters change
  useEffect(() => {
    filterGames();
  }, [selectedCategory, searchTerm, sortBy, volatilityFilter, games]);

  const updateBalance = () => {
    if (user) {
      const userBalance = balanceService.getUserBalance(user.id);
      setBalance({
        GC: userBalance.gc,
        SC: userBalance.sc
      });
    }
  };

  const loadJackpots = () => {
    const jackpots = new Map<string, number>();
    getJackpotGames().forEach(game => {
      const amount = slotsGameEngine.getJackpotAmount(game.id);
      jackpots.set(game.id, amount);
    });
    setJackpotAmounts(jackpots);
  };

  const filterGames = () => {
    let filtered = games;

    // Filter by category
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'featured':
          filtered = getFeaturedGames();
          break;
        case 'popular':
          filtered = getPopularGames();
          break;
        case 'new':
          filtered = getNewGames();
          break;
        case 'jackpot':
          filtered = getJackpotGames();
          break;
        case 'high-rtp':
          filtered = getHighRTPGames();
          break;
        case 'bonus':
          filtered = games.filter(game => game.bonusRounds || game.freeSpins);
          break;
        case 'classic':
          filtered = games.filter(game => game.reels <= 3);
          break;
        default:
          filtered = getGamesByCategory(selectedCategory);
      }
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchLower) ||
        game.theme.toLowerCase().includes(searchLower) ||
        game.features.some(feature => feature.toLowerCase().includes(searchLower))
      );
    }

    // Filter by volatility
    if (volatilityFilter !== 'all') {
      filtered = filtered.filter(game => game.volatility === volatilityFilter);
    }

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rtp':
          return b.rtp - a.rtp;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'release':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  };

  const handleCurrencyChange = (newCurrency: 'GC' | 'SC') => {
    setCurrency(newCurrency);
    walletService.setSelectedCurrency(newCurrency);
  };

  const toggleFavorite = (gameId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(gameId)) {
        newFavorites.delete(gameId);
      } else {
        newFavorites.add(gameId);
      }
      return newFavorites;
    });
  };

  const canPlayGame = (game: SlotGameConfig): boolean => {
    return balance[currency] >= game.minBet[currency];
  };

  const getVolatilityColor = (volatility: string): string => {
    switch (volatility) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number, curr: 'GC' | 'SC' = currency): string => {
    return `${amount.toLocaleString()} ${curr}`;
  };

  const getGameBadges = (game: SlotGameConfig): React.ReactNode[] => {
    const badges: React.ReactNode[] = [];

    if (game.category.includes('featured')) {
      badges.push(
        <Badge key="featured" className="bg-gold-500 text-black">
          <Star className="w-3 h-3 mr-1" />
          Featured
        </Badge>
      );
    }

    if (game.rtp >= 97) {
      badges.push(
        <Badge key="high-rtp" className="bg-green-500 text-white">
          High RTP
        </Badge>
      );
    }

    if (game.category.includes('new')) {
      badges.push(
        <Badge key="new" className="bg-blue-500 text-white">
          New
        </Badge>
      );
    }

    if (game.jackpot.progressive || game.category.includes('jackpot')) {
      badges.push(
        <Badge key="jackpot" className="bg-purple-500 text-white">
          <Crown className="w-3 h-3 mr-1" />
          Jackpot
        </Badge>
      );
    }

    return badges;
  };

  if (selectedGame) {
    return (
      <CoinKrazySlotMachine
        gameConfig={selectedGame}
        onExit={() => setSelectedGame(null)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />
    );
  }

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
                Premium slot games with real gameplay mechanics • Win with {currency} coins • Jackpots available
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Currency Selection */}
              <Card className="bg-gradient-to-r from-gold/10 to-casino-blue/10 border-gold-500/20">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Button
                        size="sm"
                        variant={currency === 'GC' ? 'default' : 'outline'}
                        onClick={() => handleCurrencyChange('GC')}
                        className={currency === 'GC' ? 'bg-purple-600' : ''}
                      >
                        <Coins className="w-4 h-4 mr-1" />
                        GC
                      </Button>
                      <Button
                        size="sm"
                        variant={currency === 'SC' ? 'default' : 'outline'}
                        onClick={() => handleCurrencyChange('SC')}
                        className={currency === 'SC' ? 'bg-gold-500 text-black' : ''}
                      >
                        <Crown className="w-4 h-4 mr-1" />
                        SC
                      </Button>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(balance[currency])}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Available Balance
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progressive Jackpots Display */}
              <Card className="bg-gradient-to-r from-gold-500/20 to-yellow-500/20 border-gold-500/30">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gold-500 animate-pulse">
                      ${Array.from(jackpotAmounts.values()).reduce((sum, amount) => sum + amount, 0).toLocaleString()}
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

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search games, themes, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="rtp">Highest RTP</SelectItem>
                  <SelectItem value="name">A-Z</SelectItem>
                  <SelectItem value="release">Newest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={volatilityFilter} onValueChange={(value: any) => setVolatilityFilter(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Volatility</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setVolatilityFilter('all');
                  setSortBy('popularity');
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const randomGame = filteredGames[Math.floor(Math.random() * filteredGames.length)];
                  if (randomGame && canPlayGame(randomGame)) {
                    setSelectedGame(randomGame);
                  }
                }}
                disabled={filteredGames.length === 0}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Random
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-all duration-300 ${
              selectedCategory === category.id
                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950'
                : 'hover:shadow-md hover:shadow-purple-500/20'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-4 text-center">
              <div
                className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  selectedCategory === category.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {category.icon}
              </div>
              <h3 className="font-medium text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground">
                {category.gameCount} games
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="text-center py-12">
          <RotateCcw className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-xl font-bold mb-2">Loading Slot Games...</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 border-border/50 hover:border-purple-500/50 overflow-hidden"
            >
              <div className="relative">
                {/* Game Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-gold-500/20 flex items-center justify-center text-6xl">
                  <div className="text-4xl">
                    {game.symbols[game.symbols.length - 1]?.emoji || '🎰'}
                  </div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(game.id);
                  }}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favorites.has(game.id) ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                </Button>

                {/* Jackpot Amount */}
                {(game.jackpot.progressive || game.category.includes('jackpot')) && jackpotAmounts.has(game.id) && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <Badge className="w-full bg-gold-500/90 text-black font-bold">
                      💰 ${jackpotAmounts.get(game.id)?.toLocaleString()}
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

                <p className="text-sm text-muted-foreground mb-1">{game.provider}</p>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{game.theme}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RTP:</span>
                    <span className="text-green-400 font-medium">{game.rtp}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Bet:</span>
                    <span className="font-medium">{formatCurrency(game.minBet[currency])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paylines:</span>
                    <span className="font-medium">
                      {game.paylines === 4096 || game.paylines === 1024 || game.paylines === 243 ? `${game.paylines} ways` : game.paylines}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {game.features.slice(0, 2).map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {game.features.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{game.features.length - 2} more
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setSelectedGame(game)}
                    disabled={!canPlayGame(game)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {canPlayGame(game) ? `Play with ${currency}` : `Need ${formatCurrency(game.minBet[currency])}`}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      // Demo mode - switch to GC if not enough SC
                      if (currency === 'SC' && balance.SC < game.minBet.SC && balance.GC >= game.minBet.GC) {
                        handleCurrencyChange('GC');
                      }
                      setSelectedGame(game);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Demo Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredGames.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Games Found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setVolatilityFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
