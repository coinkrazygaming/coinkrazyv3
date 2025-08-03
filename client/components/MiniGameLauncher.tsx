import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Download,
  Upload,
  Code,
  Palette,
  Layers,
  Zap,
  Trophy,
  Coins,
  Crown,
  Gamepad2,
  Edit,
  Eye,
  Trash2,
  Plus,
  Star,
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Sparkles,
  Wand2,
  Bot,
  Shuffle,
  Target,
  Timer,
  Heart,
  Gift,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Circle,
  Square as SquareIcon,
  Triangle,
  Diamond,
  RefreshCw,
  Save,
  Share2,
  ExternalLink,
  Monitor,
  Smartphone,
  Search,
  Filter
} from 'lucide-react';

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  category: 'slots' | 'table' | 'puzzle' | 'arcade' | 'lottery' | 'instant';
  status: 'active' | 'development' | 'testing' | 'paused';
  version: string;
  thumbnail: string;
  rtp: number;
  minBet: number;
  maxBet: number;
  jackpot?: number;
  features: string[];
  payoutStructure: Array<{ symbol: string; multiplier: number; description: string }>;
  gameSettings: {
    autoPlay: boolean;
    quickSpin: boolean;
    soundEnabled: boolean;
    animationSpeed: number;
    responsiveDesign: boolean;
  };
  statistics: {
    totalPlays: number;
    totalBets: number;
    totalPayouts: number;
    uniquePlayers: number;
    averageSession: number;
    revenue: number;
  };
  createdDate: Date;
  lastUpdated: Date;
  creator: string;
}

export interface GameTemplate {
  id: string;
  name: string;
  type: 'slots' | 'scratch' | 'wheel' | 'card' | 'dice' | 'bingo';
  description: string;
  preview: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  code: string;
  assets: string[];
}

export default function MiniGameLauncher() {
  const [games, setGames] = useState<MiniGame[]>([]);
  const [templates, setTemplates] = useState<GameTemplate[]>([]);
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('launcher');

  useEffect(() => {
    loadGamesData();
  }, []);

  const loadGamesData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockGames: MiniGame[] = [
      {
        id: 'coin-spinner',
        name: 'CoinKrazy Spinner',
        description: 'Classic slot machine with 5 reels and 25 paylines featuring CoinKrazy branding',
        category: 'slots',
        status: 'active',
        version: '2.1.4',
        thumbnail: '/games/coin-spinner.jpg',
        rtp: 96.8,
        minBet: 0.25,
        maxBet: 100,
        jackpot: 50000,
        features: ['Free Spins', 'Wild Symbols', 'Multipliers', 'Bonus Round', 'Auto Play'],
        payoutStructure: [
          { symbol: '🪙', multiplier: 500, description: 'CoinKrazy Logo - Jackpot Symbol' },
          { symbol: '👑', multiplier: 200, description: 'Crown - Premium Symbol' },
          { symbol: '💎', multiplier: 100, description: 'Diamond - High Value' },
          { symbol: '🎰', multiplier: 50, description: 'Slot Machine - Medium Value' },
          { symbol: '🍀', multiplier: 25, description: 'Lucky Clover - Low Value' }
        ],
        gameSettings: {
          autoPlay: true,
          quickSpin: true,
          soundEnabled: true,
          animationSpeed: 1.0,
          responsiveDesign: true
        },
        statistics: {
          totalPlays: 45678,
          totalBets: 234567.89,
          totalPayouts: 228934.56,
          uniquePlayers: 12345,
          averageSession: 18.5,
          revenue: 5633.33
        },
        createdDate: new Date('2024-01-10'),
        lastUpdated: new Date('2024-03-15'),
        creator: 'CoinKrazy Dev Team'
      },
      {
        id: 'lucky-scratch',
        name: 'Lucky Scratch Gold',
        description: 'Instant win scratch card game with gold coin themes and progressive jackpots',
        category: 'instant',
        status: 'active',
        version: '1.3.2',
        thumbnail: '/games/lucky-scratch.jpg',
        rtp: 97.2,
        minBet: 1,
        maxBet: 50,
        jackpot: 25000,
        features: ['Instant Win', 'Progressive Jackpot', 'Bonus Multipliers', 'Lucky Numbers'],
        payoutStructure: [
          { symbol: '🪙🪙🪙', multiplier: 1000, description: 'Triple Gold Coins - Top Prize' },
          { symbol: '💰💰', multiplier: 100, description: 'Double Money Bag' },
          { symbol: '🍀🍀', multiplier: 50, description: 'Double Lucky' },
          { symbol: '⭐', multiplier: 20, description: 'Single Star' }
        ],
        gameSettings: {
          autoPlay: false,
          quickSpin: false,
          soundEnabled: true,
          animationSpeed: 1.2,
          responsiveDesign: true
        },
        statistics: {
          totalPlays: 23456,
          totalBets: 78924.50,
          totalPayouts: 76742.31,
          uniquePlayers: 8934,
          averageSession: 12.3,
          revenue: 2182.19
        },
        createdDate: new Date('2024-02-01'),
        lastUpdated: new Date('2024-03-10'),
        creator: 'CoinKrazy Dev Team'
      },
      {
        id: 'wheel-fortune',
        name: 'CoinKrazy Wheel of Fortune',
        description: 'Spin the wheel for instant prizes with multipliers and bonus rounds',
        category: 'arcade',
        status: 'active',
        version: '1.8.1',
        thumbnail: '/games/wheel-fortune.jpg',
        rtp: 96.5,
        minBet: 0.50,
        maxBet: 25,
        features: ['Spin Wheel', 'Multipliers', 'Bonus Spins', 'Risk Game'],
        payoutStructure: [
          { symbol: '💎', multiplier: 500, description: 'Diamond Segment - Mega Win' },
          { symbol: '👑', multiplier: 100, description: 'Crown Segment - Big Win' },
          { symbol: '🪙', multiplier: 50, description: 'Gold Coin - Medium Win' },
          { symbol: '🍀', multiplier: 10, description: 'Clover - Small Win' }
        ],
        gameSettings: {
          autoPlay: true,
          quickSpin: false,
          soundEnabled: true,
          animationSpeed: 0.8,
          responsiveDesign: true
        },
        statistics: {
          totalPlays: 34567,
          totalBets: 156789.25,
          totalPayouts: 151234.78,
          uniquePlayers: 15678,
          averageSession: 15.7,
          revenue: 5554.47
        },
        createdDate: new Date('2024-01-20'),
        lastUpdated: new Date('2024-03-12'),
        creator: 'CoinKrazy Dev Team'
      },
      {
        id: 'number-rush',
        name: 'Number Rush Bingo',
        description: 'Fast-paced bingo game with progressive jackpots and special patterns',
        category: 'lottery',
        status: 'testing',
        version: '0.9.5',
        thumbnail: '/games/number-rush.jpg',
        rtp: 95.8,
        minBet: 0.10,
        maxBet: 10,
        features: ['Progressive Jackpot', 'Pattern Matching', 'Speed Rounds', 'Bonus Balls'],
        payoutStructure: [
          { symbol: 'FULL HOUSE', multiplier: 1000, description: 'Complete Card - Jackpot' },
          { symbol: 'LINE', multiplier: 50, description: 'Single Line - Big Win' },
          { symbol: 'CORNER', multiplier: 10, description: 'Four Corners - Medium Win' }
        ],
        gameSettings: {
          autoPlay: true,
          quickSpin: true,
          soundEnabled: true,
          animationSpeed: 1.5,
          responsiveDesign: true
        },
        statistics: {
          totalPlays: 8934,
          totalBets: 12456.78,
          totalPayouts: 11934.23,
          uniquePlayers: 3456,
          averageSession: 22.1,
          revenue: 522.55
        },
        createdDate: new Date('2024-03-01'),
        lastUpdated: new Date('2024-03-18'),
        creator: 'CoinKrazy Dev Team'
      }
    ];

    const mockTemplates: GameTemplate[] = [
      {
        id: 'basic-slots',
        name: 'Basic Slot Machine',
        type: 'slots',
        description: '3-reel classic slot machine template with customizable symbols and paylines',
        preview: '/templates/basic-slots.png',
        complexity: 'beginner',
        features: ['3 Reels', '5 Paylines', 'Wild Symbols', 'Basic Animations'],
        code: `// Basic Slot Machine Template
class BasicSlotMachine {
  constructor(reels = 3, symbols = ['🍒', '🍋', '🍊', '🍇', '⭐']) {
    this.reels = reels;
    this.symbols = symbols;
    this.paylines = this.generatePaylines();
  }
  
  spin() {
    return Array.from({length: this.reels}, () => 
      this.symbols[Math.floor(Math.random() * this.symbols.length)]
    );
  }
  
  calculatePayout(result, bet) {
    const winningLines = this.checkWinningLines(result);
    return winningLines.reduce((total, line) => 
      total + (line.multiplier * bet), 0
    );
  }
}`,
        assets: ['reel-background.png', 'symbols.png', 'spin-button.png']
      },
      {
        id: 'scratch-card',
        name: 'Scratch Card Game',
        type: 'scratch',
        description: 'Interactive scratch card with customizable design and win conditions',
        preview: '/templates/scratch-card.png',
        complexity: 'beginner',
        features: ['Touch/Mouse Scratch', 'Custom Graphics', 'Instant Win', 'Animations'],
        code: `// Scratch Card Template
class ScratchCard {
  constructor(canvas, scratchArea = 0.6, winCondition = 3) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scratchArea = scratchArea;
    this.winCondition = winCondition;
    this.scratchedPixels = 0;
  }
  
  generateCard() {
    const symbols = this.generateRandomSymbols();
    this.drawCard(symbols);
    this.addScratchLayer();
    return symbols;
  }
  
  checkWin(symbols) {
    const counts = this.countSymbols(symbols);
    return Object.values(counts).some(count => count >= this.winCondition);
  }
}`,
        assets: ['scratch-overlay.png', 'card-background.png', 'win-symbols.png']
      },
      {
        id: 'wheel-spinner',
        name: 'Wheel of Fortune',
        type: 'wheel',
        description: 'Spinning wheel game with customizable segments and prizes',
        preview: '/templates/wheel-spinner.png',
        complexity: 'intermediate',
        features: ['Custom Segments', 'Physics Simulation', 'Prize System', 'Sound Effects'],
        code: `// Wheel of Fortune Template
class WheelOfFortune {
  constructor(segments, canvas) {
    this.segments = segments;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.angle = 0;
    this.spinning = false;
  }
  
  spin(force = 1) {
    if (this.spinning) return;
    
    this.spinning = true;
    const spinAngle = (Math.random() * 360 + 720) * force;
    this.animateSpin(spinAngle);
  }
  
  getResult() {
    const segmentAngle = 360 / this.segments.length;
    const resultIndex = Math.floor(this.angle / segmentAngle) % this.segments.length;
    return this.segments[resultIndex];
  }
}`,
        assets: ['wheel-base.png', 'wheel-pointer.png', 'segment-dividers.png']
      }
    ];

    setGames(mockGames);
    setTemplates(mockTemplates);
    setIsLoading(false);
  };

  const createNewGame = (template?: GameTemplate) => {
    const newGame: Partial<MiniGame> = {
      id: `game-${Date.now()}`,
      name: template ? `New ${template.name}` : 'New Mini Game',
      description: 'Customize this game',
      category: template?.type || 'slots',
      status: 'development',
      version: '0.1.0',
      rtp: 96.0,
      minBet: 0.25,
      maxBet: 10,
      features: template?.features || ['Basic Gameplay'],
      payoutStructure: [],
      gameSettings: {
        autoPlay: false,
        quickSpin: false,
        soundEnabled: true,
        animationSpeed: 1.0,
        responsiveDesign: true
      },
      statistics: {
        totalPlays: 0,
        totalBets: 0,
        totalPayouts: 0,
        uniquePlayers: 0,
        averageSession: 0,
        revenue: 0
      },
      createdDate: new Date(),
      lastUpdated: new Date(),
      creator: 'Admin'
    };

    setIsCreating(true);
    setSelectedGame(newGame as MiniGame);
  };

  const updateGame = (gameId: string, updates: Partial<MiniGame>) => {
    setGames(games => 
      games.map(game => 
        game.id === gameId ? { ...game, ...updates, lastUpdated: new Date() } : game
      )
    );
  };

  const deleteGame = (gameId: string) => {
    setGames(games => games.filter(game => game.id !== gameId));
    if (selectedGame?.id === gameId) {
      setSelectedGame(null);
    }
  };

  const exportGame = (game: MiniGame) => {
    const gameData = {
      ...game,
      exportedAt: new Date().toISOString(),
      format: 'CoinKrazy Mini Game Package v1.0'
    };
    
    const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || game.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'development': return 'bg-blue-500';
      case 'testing': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Mini Game Launcher...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CoinKrazy Mini Game Launcher</h1>
          <p className="text-muted-foreground">
            Create, manage, and deploy branded mini games with visual builder
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button 
            onClick={() => createNewGame()}
            className="bg-gold-500 hover:bg-gold-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Game
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{games.length}</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Games</p>
                <p className="text-2xl font-bold text-green-500">
                  {games.filter(g => g.status === 'active').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-gold-500">
                  {formatCurrency(games.reduce((sum, game) => sum + game.statistics.revenue, 0))}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gold-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Players</p>
                <p className="text-2xl font-bold text-purple-500">
                  {games.reduce((sum, game) => sum + game.statistics.uniquePlayers, 0).toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="launcher">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Game Launcher
          </TabsTrigger>
          <TabsTrigger value="builder">
            <Code className="w-4 h-4 mr-2" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Layers className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Game Analytics
          </TabsTrigger>
        </TabsList>

        {/* Game Launcher Tab */}
        <TabsContent value="launcher" className="mt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      placeholder="Search games..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="all">All Categories</option>
                    <option value="slots">Slots</option>
                    <option value="table">Table Games</option>
                    <option value="puzzle">Puzzle</option>
                    <option value="arcade">Arcade</option>
                    <option value="lottery">Lottery</option>
                    <option value="instant">Instant Win</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card 
                  key={game.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => setSelectedGame(game)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-lg mb-4 flex items-center justify-center">
                      <Gamepad2 className="w-12 h-12 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">{game.name}</h3>
                        <Badge className={getStatusColor(game.status)}>
                          {game.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {game.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">RTP:</span>
                          <span className="font-medium ml-1">{game.rtp}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Players:</span>
                          <span className="font-medium ml-1">{game.statistics.uniquePlayers.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Revenue:</span>
                          <span className="font-medium ml-1 text-green-500">{formatCurrency(game.statistics.revenue)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Version:</span>
                          <span className="font-medium ml-1">{game.version}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {game.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {game.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{game.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <Play className="w-3 h-3 mr-1" />
                          Launch
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Visual Builder Tab */}
        <TabsContent value="builder" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Builder Controls */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Visual Game Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Wand2 className="w-16 h-16 text-gold-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold mb-2">Drag & Drop Game Builder</h3>
                      <p className="text-muted-foreground mb-4">
                        Create games visually with our AI-powered builder
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button className="bg-gold-500 hover:bg-gold-600 text-black">
                          <Plus className="w-4 h-4 mr-2" />
                          Start Building
                        </Button>
                        <Button variant="outline">
                          <Upload className="w-4 h-4 mr-2" />
                          Import Template
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Builder Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Builder Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Game Elements</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="h-12 flex-col">
                        <Circle className="w-4 h-4 mb-1" />
                        <span className="text-xs">Reel</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-12 flex-col">
                        <SquareIcon className="w-4 h-4 mb-1" />
                        <span className="text-xs">Button</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-12 flex-col">
                        <Triangle className="w-4 h-4 mb-1" />
                        <span className="text-xs">Wheel</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-12 flex-col">
                        <Diamond className="w-4 h-4 mb-1" />
                        <span className="text-xs">Symbol</span>
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Game Logic</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Dice1 className="w-4 h-4 mr-2" />
                        Random Generator
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Target className="w-4 h-4 mr-2" />
                        Win Conditions
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Timer className="w-4 h-4 mr-2" />
                        Animations
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">AI Assistant</h4>
                    <Button className="w-full bg-purple-500 hover:bg-purple-600">
                      <Bot className="w-4 h-4 mr-2" />
                      Generate Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
                    <Code className="w-12 h-12 text-muted-foreground" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{template.name}</h3>
                      <Badge variant="outline">{template.complexity}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => createNewGame(template)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Game Analytics Tab */}
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.filter(g => g.status === 'active').map((game, index) => (
                    <div key={game.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <div className="font-medium">{game.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {game.statistics.uniquePlayers} players • {game.statistics.totalPlays} plays
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">{formatCurrency(game.statistics.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Game Health Monitor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {games.map((game) => (
                    <div key={game.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(game.status)}`}></div>
                        <span className="font-medium">{game.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">RTP: {game.rtp}%</span>
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Game Detail Modal/Panel */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  {selectedGame.name}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedGame(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="font-medium">Game Name</label>
                    <Input 
                      value={selectedGame.name}
                      onChange={(e) => setSelectedGame({...selectedGame, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="font-medium">Description</label>
                    <Input 
                      value={selectedGame.description}
                      onChange={(e) => setSelectedGame({...selectedGame, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium">RTP (%)</label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={selectedGame.rtp}
                        onChange={(e) => setSelectedGame({...selectedGame, rtp: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="font-medium">Status</label>
                      <select 
                        value={selectedGame.status}
                        onChange={(e) => setSelectedGame({...selectedGame, status: e.target.value as any})}
                        className="w-full p-2 border rounded"
                      >
                        <option value="active">Active</option>
                        <option value="development">Development</option>
                        <option value="testing">Testing</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Game Statistics</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Plays:</span>
                        <div className="font-bold">{selectedGame.statistics.totalPlays.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <div className="font-bold text-green-500">{formatCurrency(selectedGame.statistics.revenue)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Players:</span>
                        <div className="font-bold">{selectedGame.statistics.uniquePlayers.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Avg Session:</span>
                        <div className="font-bold">{selectedGame.statistics.averageSession} min</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedGame.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={() => {
                    updateGame(selectedGame.id, selectedGame);
                    setSelectedGame(null);
                  }}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => exportGame(selectedGame)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Game
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => deleteGame(selectedGame.id)}
                  className="text-red-500 border-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
