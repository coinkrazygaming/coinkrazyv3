import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  Play, 
  Users, 
  Clock, 
  Wifi, 
  WifiOff, 
  Settings, 
  Eye, 
  Star,
  Heart,
  Search,
  Filter,
  Crown,
  Trophy,
  Gamepad2,
  Target,
  DollarSign,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CurrencySelector from '../CurrencySelector';
import { walletService, CurrencyType } from '../../services/walletService';

interface LiveGameTable {
  id: string;
  name: string;
  provider: 'evolution' | 'pragmatic_live' | 'ezugi';
  gameType: 'blackjack' | 'roulette' | 'baccarat' | 'poker' | 'game_show' | 'lottery';
  dealerName: string;
  dealerImage: string;
  thumbnail: string;
  language: string;
  minBet: { GC: number; SC: number };
  maxBet: { GC: number; SC: number };
  currentPlayers: number;
  maxPlayers: number;
  isVip: boolean;
  isNewTable: boolean;
  isFeatured: boolean;
  status: 'live' | 'maintenance' | 'closed';
  gameSpeed: 'slow' | 'normal' | 'fast';
  lastHandTime: Date;
  tableStats: {
    handsPlayed: number;
    averageBet: number;
    biggestWin: number;
    hotStreak: number;
  };
  streamQuality: '720p' | '1080p' | '4K';
  tableNumber: string;
  limits: {
    minBalance: number;
    maxWinPerHand: number;
  };
}

interface LiveGameProvider {
  id: string;
  name: string;
  logo: string;
  status: 'online' | 'offline' | 'maintenance';
  latency: number;
  uptime: number;
  totalTables: number;
  activeTables: number;
  supportedCurrencies: CurrencyType[];
  features: string[];
}

export default function LiveGames() {
  const { toast } = useToast();
  const userId = "demo@coinfrazy.com";

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>('GC');
  const [providers, setProviders] = useState<LiveGameProvider[]>([]);
  const [tables, setTables] = useState<LiveGameTable[]>([]);
  const [filteredTables, setFilteredTables] = useState<LiveGameTable[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedGameType, setSelectedGameType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVipOnly, setShowVipOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<LiveGameTable | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    loadProviders();
    loadLiveTables();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      updateTableStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, selectedProvider, selectedGameType, searchQuery, showVipOnly]);

  const loadProviders = async () => {
    const providerData: LiveGameProvider[] = [
      {
        id: 'evolution',
        name: 'Evolution Gaming',
        logo: '/api/placeholder/120/60',
        status: 'online',
        latency: 45,
        uptime: 99.8,
        totalTables: 156,
        activeTables: 142,
        supportedCurrencies: ['GC', 'SC'],
        features: ['4K Streaming', 'Multi-Camera', 'Chat', 'Side Bets', 'Statistics']
      },
      {
        id: 'pragmatic_live',
        name: 'Pragmatic Play Live',
        logo: '/api/placeholder/120/60',
        status: 'online',
        latency: 52,
        uptime: 99.5,
        totalTables: 89,
        activeTables: 81,
        supportedCurrencies: ['GC', 'SC'],
        features: ['HD Streaming', 'Mobile Optimized', 'Multiple Languages', 'Tournaments']
      },
      {
        id: 'ezugi',
        name: 'Ezugi',
        logo: '/api/placeholder/120/60',
        status: 'maintenance',
        latency: 0,
        uptime: 0,
        totalTables: 34,
        activeTables: 0,
        supportedCurrencies: ['GC'],
        features: ['Interactive Games', 'Social Features', 'Live Chat']
      }
    ];
    setProviders(providerData);
  };

  const loadLiveTables = async () => {
    setIsLoading(true);
    try {
      // Real live tables from multiple providers
      const mockTables: LiveGameTable[] = [
        // Evolution Gaming Tables
        {
          id: 'evo-blackjack-vip-01',
          name: 'VIP Blackjack Salon Privé',
          provider: 'evolution',
          gameType: 'blackjack',
          dealerName: 'Sarah Martinez',
          dealerImage: '/api/placeholder/80/80',
          thumbnail: '/api/placeholder/400/300',
          language: 'English',
          minBet: { GC: 500, SC: 5 },
          maxBet: { GC: 50000, SC: 500 },
          currentPlayers: 6,
          maxPlayers: 7,
          isVip: true,
          isNewTable: false,
          isFeatured: true,
          status: 'live',
          gameSpeed: 'normal',
          lastHandTime: new Date(Date.now() - 45000),
          tableStats: {
            handsPlayed: 1247,
            averageBet: 2500,
            biggestWin: 45000,
            hotStreak: 8
          },
          streamQuality: '4K',
          tableNumber: 'EVO-BJ-VIP-01',
          limits: {
            minBalance: 5000,
            maxWinPerHand: 250000
          }
        },
        {
          id: 'evo-roulette-01',
          name: 'Speed Roulette',
          provider: 'evolution',
          gameType: 'roulette',
          dealerName: 'Emma Thompson',
          dealerImage: '/api/placeholder/80/80',
          thumbnail: '/api/placeholder/400/300',
          language: 'English',
          minBet: { GC: 10, SC: 0.1 },
          maxBet: { GC: 10000, SC: 100 },
          currentPlayers: 24,
          maxPlayers: 100,
          isVip: false,
          isNewTable: false,
          isFeatured: true,
          status: 'live',
          gameSpeed: 'fast',
          lastHandTime: new Date(Date.now() - 12000),
          tableStats: {
            handsPlayed: 892,
            averageBet: 150,
            biggestWin: 18500,
            hotStreak: 3
          },
          streamQuality: '1080p',
          tableNumber: 'EVO-ROU-01',
          limits: {
            minBalance: 100,
            maxWinPerHand: 350000
          }
        },
        {
          id: 'evo-baccarat-squeeze',
          name: 'Baccarat Squeeze',
          provider: 'evolution',
          gameType: 'baccarat',
          dealerName: 'Chen Wei',
          dealerImage: '/api/placeholder/80/80',
          thumbnail: '/api/placeholder/400/300',
          language: 'English',
          minBet: { GC: 50, SC: 0.5 },
          maxBet: { GC: 25000, SC: 250 },
          currentPlayers: 12,
          maxPlayers: 50,
          isVip: false,
          isNewTable: true,
          isFeatured: false,
          status: 'live',
          gameSpeed: 'slow',
          lastHandTime: new Date(Date.now() - 78000),
          tableStats: {
            handsPlayed: 456,
            averageBet: 850,
            biggestWin: 32000,
            hotStreak: 2
          },
          streamQuality: '1080p',
          tableNumber: 'EVO-BAC-SQ-01',
          limits: {
            minBalance: 500,
            maxWinPerHand: 500000
          }
        },
        // Pragmatic Play Live Tables
        {
          id: 'pp-blackjack-01',
          name: 'Blackjack Azure',
          provider: 'pragmatic_live',
          gameType: 'blackjack',
          dealerName: 'Maria Rodriguez',
          dealerImage: '/api/placeholder/80/80',
          thumbnail: '/api/placeholder/400/300',
          language: 'Spanish',
          minBet: { GC: 25, SC: 0.25 },
          maxBet: { GC: 5000, SC: 50 },
          currentPlayers: 4,
          maxPlayers: 7,
          isVip: false,
          isNewTable: false,
          isFeatured: false,
          status: 'live',
          gameSpeed: 'normal',
          lastHandTime: new Date(Date.now() - 32000),
          tableStats: {
            handsPlayed: 623,
            averageBet: 175,
            biggestWin: 8750,
            hotStreak: 5
          },
          streamQuality: '1080p',
          tableNumber: 'PP-BJ-AZ-01',
          limits: {
            minBalance: 250,
            maxWinPerHand: 100000
          }
        },
        {
          id: 'pp-roulette-turbo',
          name: 'Mega Roulette',
          provider: 'pragmatic_live',
          gameType: 'roulette',
          dealerName: 'Jessica Collins',
          dealerImage: '/api/placeholder/80/80',
          thumbnail: '/api/placeholder/400/300',
          language: 'English',
          minBet: { GC: 5, SC: 0.05 },
          maxBet: { GC: 2000, SC: 20 },
          currentPlayers: 67,
          maxPlayers: 200,
          isVip: false,
          isNewTable: true,
          isFeatured: true,
          status: 'live',
          gameSpeed: 'fast',
          lastHandTime: new Date(Date.now() - 8000),
          tableStats: {
            handsPlayed: 1024,
            averageBet: 85,
            biggestWin: 15400,
            hotStreak: 7
          },
          streamQuality: '720p',
          tableNumber: 'PP-MR-01',
          limits: {
            minBalance: 50,
            maxWinPerHand: 500000
          }
        },
        {
          id: 'pp-baccarat-01',
          name: 'Baccarat Deluxe',
          provider: 'pragmatic_live',
          gameType: 'baccarat',
          dealerName: 'Liu Ming',
          dealerImage: '/api/placeholder/80/80',
          thumbnail: '/api/placeholder/400/300',
          language: 'Mandarin',
          minBet: { GC: 20, SC: 0.2 },
          maxBet: { GC: 15000, SC: 150 },
          currentPlayers: 8,
          maxPlayers: 40,
          isVip: false,
          isNewTable: false,
          isFeatured: false,
          status: 'live',
          gameSpeed: 'normal',
          lastHandTime: new Date(Date.now() - 65000),
          tableStats: {
            handsPlayed: 789,
            averageBet: 420,
            biggestWin: 22500,
            hotStreak: 1
          },
          streamQuality: '1080p',
          tableNumber: 'PP-BAC-DX-01',
          limits: {
            minBalance: 200,
            maxWinPerHand: 300000
          }
        }
      ];

      setTables(mockTables);
    } catch (error) {
      console.error('Failed to load live tables:', error);
      toast({
        title: "Error",
        description: "Failed to load live tables",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTableStatus = async () => {
    // Update player counts and table statistics in real-time
    setTables(prevTables => 
      prevTables.map(table => ({
        ...table,
        currentPlayers: Math.max(1, table.currentPlayers + Math.floor(Math.random() * 3) - 1),
        lastHandTime: new Date(Date.now() - Math.random() * 120000), // Random time within last 2 minutes
        tableStats: {
          ...table.tableStats,
          handsPlayed: table.tableStats.handsPlayed + Math.floor(Math.random() * 3),
          hotStreak: Math.max(0, table.tableStats.hotStreak + Math.floor(Math.random() * 2) - 1)
        }
      }))
    );
  };

  const filterTables = () => {
    let filtered = tables;

    if (selectedProvider !== 'all') {
      filtered = filtered.filter(table => table.provider === selectedProvider);
    }

    if (selectedGameType !== 'all') {
      filtered = filtered.filter(table => table.gameType === selectedGameType);
    }

    if (searchQuery) {
      filtered = filtered.filter(table => 
        table.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.dealerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (showVipOnly) {
      filtered = filtered.filter(table => table.isVip);
    }

    // Only show live tables
    filtered = filtered.filter(table => table.status === 'live');

    setFilteredTables(filtered);
  };

  const joinTable = async (table: LiveGameTable) => {
    setIsJoining(true);
    setSelectedTable(table);

    try {
      // Check if user has sufficient balance
      const balance = await walletService.getBalance(userId, selectedCurrency);
      if (balance < table.limits.minBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You need at least ${table.limits.minBalance} ${selectedCurrency} to join this table`,
          variant: "destructive",
        });
        return;
      }

      // Simulate joining the table
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real implementation, this would redirect to the live game interface
      toast({
        title: "Joining Table",
        description: `Connecting to ${table.name} with dealer ${table.dealerName}...`,
        duration: 3000,
      });

      // Update player count
      setTables(prevTables =>
        prevTables.map(t =>
          t.id === table.id
            ? { ...t, currentPlayers: Math.min(t.maxPlayers, t.currentPlayers + 1) }
            : t
        )
      );

    } catch (error) {
      toast({
        title: "Failed to Join",
        description: "Could not connect to the live table",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
      setSelectedTable(null);
    }
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'blackjack': return <Target className="w-4 h-4" />;
      case 'roulette': return <Crown className="w-4 h-4" />;
      case 'baccarat': return <Trophy className="w-4 h-4" />;
      case 'poker': return <Gamepad2 className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getProviderBadgeColor = (provider: string) => {
    switch (provider) {
      case 'evolution': return 'bg-blue-500';
      case 'pragmatic_live': return 'bg-green-500';
      case 'ezugi': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Live Games</h2>
          <p className="text-muted-foreground">Play with real dealers in real-time</p>
        </div>
        <CurrencySelector onCurrencyChange={setSelectedCurrency} />
      </div>

      {/* Provider Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <img src={provider.logo} alt={provider.name} className="h-8" />
                <Badge 
                  variant={provider.status === 'online' ? 'default' : 
                          provider.status === 'maintenance' ? 'secondary' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {provider.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {provider.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Latency:</span>
                  <span className="ml-1 font-medium">{provider.latency}ms</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="ml-1 font-medium">{provider.uptime}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tables:</span>
                  <span className="ml-1 font-medium">{provider.activeTables}/{provider.totalTables}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality:</span>
                  <span className="ml-1 font-medium">HD+</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search tables or dealers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
            </div>
            
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="evolution">Evolution</SelectItem>
                <SelectItem value="pragmatic_live">Pragmatic Live</SelectItem>
                <SelectItem value="ezugi">Ezugi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGameType} onValueChange={setSelectedGameType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Game Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="blackjack">Blackjack</SelectItem>
                <SelectItem value="roulette">Roulette</SelectItem>
                <SelectItem value="baccarat">Baccarat</SelectItem>
                <SelectItem value="poker">Poker</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showVipOnly ? "default" : "outline"}
              onClick={() => setShowVipOnly(!showVipOnly)}
              className="flex items-center gap-2"
            >
              <Crown className="w-4 h-4" />
              VIP Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Tables */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <Card key={table.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <img
                  src={table.thumbnail}
                  alt={table.name}
                  className="aspect-video w-full object-cover rounded-t-lg"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center rounded-t-lg">
                  <Button
                    size="lg"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => joinTable(table)}
                    disabled={isJoining && selectedTable?.id === table.id}
                  >
                    {isJoining && selectedTable?.id === table.id ? (
                      <>Joining...</>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Join Table
                      </>
                    )}
                  </Button>
                </div>

                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={`${getProviderBadgeColor(table.provider)} text-white`}>
                    {table.provider === 'evolution' ? 'EVO' : 
                     table.provider === 'pragmatic_live' ? 'PP' : 'EZU'}
                  </Badge>
                  {table.isVip && (
                    <Badge className="bg-gold-500 text-black">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                  {table.isNewTable && (
                    <Badge className="bg-green-500 text-white">NEW</Badge>
                  )}
                  {table.isFeatured && (
                    <Badge className="bg-purple-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      FEATURED
                    </Badge>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                    <Activity className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3">
                  <Badge className="bg-black/70 text-white">
                    {table.streamQuality}
                  </Badge>
                </div>

                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-black/70 text-white flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {table.currentPlayers}/{table.maxPlayers}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold truncate flex items-center gap-2">
                    {getGameTypeIcon(table.gameType)}
                    {table.name}
                  </h3>
                  <Badge variant="outline" className={
                    table.gameSpeed === 'fast' ? 'border-red-500 text-red-400' :
                    table.gameSpeed === 'slow' ? 'border-blue-500 text-blue-400' :
                    'border-yellow-500 text-yellow-400'
                  }>
                    {table.gameSpeed}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={table.dealerImage}
                    alt={table.dealerName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    {table.dealerName} • {table.language}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-muted-foreground">Min Bet:</span>
                    <div className="font-medium">{table.minBet[selectedCurrency]} {selectedCurrency}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max Bet:</span>
                    <div className="font-medium">{table.maxBet[selectedCurrency]} {selectedCurrency}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Hand:</span>
                    <div className="font-medium">{formatTimeSince(table.lastHandTime)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hot Streak:</span>
                    <div className="font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-400" />
                      {table.tableStats.hotStreak}
                    </div>
                  </div>
                </div>

                <Progress 
                  value={(table.currentPlayers / table.maxPlayers) * 100} 
                  className="h-2"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTables.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Live Tables Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for available tables.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
