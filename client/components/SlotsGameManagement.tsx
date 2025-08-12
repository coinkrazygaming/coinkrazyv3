import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Coins,
  Crown,
  Star,
  Trophy,
  Play,
  Pause,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Gamepad2,
  Monitor,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Target,
  Clock,
} from "lucide-react";
import {
  slotsApiService,
  SlotGame,
  SlotProvider,
} from "../services/slotsApiService";

interface GameStats {
  totalPlays: number;
  totalRevenue: number;
  averageRTP: number;
  mostPopularGame: string;
  totalPlayers: number;
  revenueToday: number;
  playsToday: number;
}

interface ProviderStats {
  name: string;
  gamesCount: number;
  totalPlays: number;
  revenue: number;
  isActive: boolean;
}

export default function SlotsGameManagement() {
  const [games, setGames] = useState<SlotGame[]>([]);
  const [providers, setProviders] = useState<SlotProvider[]>([]);
  const [filteredGames, setFilteredGames] = useState<SlotGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "popularity" | "rtp" | "revenue"
  >("popularity");
  const [gameStats, setGameStats] = useState<GameStats>({
    totalPlays: 0,
    totalRevenue: 0,
    averageRTP: 0,
    mostPopularGame: "",
    totalPlayers: 0,
    revenueToday: 0,
    playsToday: 0,
  });
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [selectedGame, setSelectedGame] = useState<SlotGame | null>(null);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showEditGame, setShowEditGame] = useState(false);
  const [newGame, setNewGame] = useState<Partial<SlotGame>>({
    name: "",
    provider: "",
    theme: "",
    rtp: 96.0,
    volatility: "medium",
    minBet: 0.01,
    maxBet: 100.0,
    paylines: 25,
    reels: 5,
    rows: 3,
    features: [],
    category: [],
    description: "",
    isJackpot: false,
    isMobile: true,
    isDesktop: true,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    filterGames();
  }, [
    games,
    searchTerm,
    selectedProvider,
    selectedCategory,
    statusFilter,
    sortBy,
  ]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [gamesData, providersData] = await Promise.all([
        slotsApiService.getAllGames(),
        slotsApiService.getProviders(),
      ]);

      setGames(gamesData);
      setProviders(providersData);

      // Calculate stats
      calculateStats(gamesData);
      calculateProviderStats(gamesData, providersData);

      console.log(
        `Loaded ${gamesData.length} games from ${providersData.length} providers`,
      );
    } catch (error) {
      console.error("Error loading slots data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (gamesData: SlotGame[]) => {
    const totalPlays = gamesData.reduce(
      (sum, game) => sum + game.popularity * 100,
      0,
    );
    const totalRevenue = totalPlays * 2.5; // Estimated revenue
    const averageRTP =
      gamesData.reduce((sum, game) => sum + game.rtp, 0) / gamesData.length;
    const mostPopularGame =
      gamesData.sort((a, b) => b.popularity - a.popularity)[0]?.name || "";

    setGameStats({
      totalPlays: Math.floor(totalPlays),
      totalRevenue: Math.floor(totalRevenue),
      averageRTP: Math.round(averageRTP * 100) / 100,
      mostPopularGame,
      totalPlayers: Math.floor(totalPlays / 50),
      revenueToday: Math.floor(totalRevenue * 0.1),
      playsToday: Math.floor(totalPlays * 0.05),
    });
  };

  const calculateProviderStats = (
    gamesData: SlotGame[],
    providersData: SlotProvider[],
  ) => {
    const stats = providersData.map((provider) => {
      const providerGames = gamesData.filter(
        (game) =>
          game.provider.toLowerCase().replace(/[^a-z0-9]/g, "-") ===
          provider.id,
      );

      const totalPlays = providerGames.reduce(
        (sum, game) => sum + game.popularity * 100,
        0,
      );

      return {
        name: provider.name,
        gamesCount: providerGames.length,
        totalPlays: Math.floor(totalPlays),
        revenue: Math.floor(totalPlays * 2.5),
        isActive: provider.isActive,
      };
    });

    setProviderStats(stats.sort((a, b) => b.revenue - a.revenue));
  };

  const filterGames = () => {
    let filtered = games;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (game) =>
          game.name.toLowerCase().includes(search) ||
          game.provider.toLowerCase().includes(search) ||
          game.theme.toLowerCase().includes(search),
      );
    }

    // Provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter(
        (game) =>
          game.provider.toLowerCase().replace(/[^a-z0-9]/g, "-") ===
          selectedProvider,
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((game) =>
        game.category.includes(selectedCategory),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "popularity":
          return b.popularity - a.popularity;
        case "rtp":
          return b.rtp - a.rtp;
        case "revenue":
          return b.popularity * 100 - a.popularity * 100;
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  };

  const handleAddGame = async () => {
    try {
      // In a real app, this would call an API
      const gameToAdd: SlotGame = {
        id: `game-${Date.now()}`,
        name: newGame.name || "",
        provider: newGame.provider || "",
        category: newGame.category || [],
        theme: newGame.theme || "",
        rtp: newGame.rtp || 96.0,
        volatility: newGame.volatility || "medium",
        minBet: newGame.minBet || 0.01,
        maxBet: newGame.maxBet || 100.0,
        paylines: newGame.paylines || 25,
        reels: newGame.reels || 5,
        rows: newGame.rows || 3,
        features: newGame.features || [],
        imageUrl: "/games/default-game.jpg",
        demoUrl: "",
        realUrl: "",
        description: newGame.description || "",
        releaseDate: new Date().toISOString(),
        popularity: 50,
        isJackpot: newGame.isJackpot || false,
        isMobile: newGame.isMobile !== false,
        isDesktop: newGame.isDesktop !== false,
        gameSize: { width: 800, height: 600 },
      };

      setGames((prev) => [...prev, gameToAdd]);
      setShowAddGame(false);
      setNewGame({});

      console.log("Game added successfully");
    } catch (error) {
      console.error("Error adding game:", error);
    }
  };

  const handleUpdateGame = async (
    gameId: string,
    updates: Partial<SlotGame>,
  ) => {
    try {
      setGames((prev) =>
        prev.map((game) =>
          game.id === gameId ? { ...game, ...updates } : game,
        ),
      );

      console.log("Game updated successfully");
    } catch (error) {
      console.error("Error updating game:", error);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (window.confirm("Are you sure you want to delete this game?")) {
      try {
        setGames((prev) => prev.filter((game) => game.id !== gameId));
        console.log("Game deleted successfully");
      } catch (error) {
        console.error("Error deleting game:", error);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin mr-2" />
        <span>Loading slot games...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{games.length}</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plays</p>
                <p className="text-2xl font-bold">
                  {formatNumber(gameStats.totalPlays)}
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
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(gameStats.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-gold-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg RTP</p>
                <p className="text-2xl font-bold">{gameStats.averageRTP}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="games">Games Management</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Games Management Tab */}
        <TabsContent value="games" className="space-y-4">
          {/* Filters and Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={selectedProvider}
                    onValueChange={setSelectedProvider}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Providers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Providers</SelectItem>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="rtp">RTP</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={showAddGame} onOpenChange={setShowAddGame}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Game
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Slot Game</DialogTitle>
                        <DialogDescription>
                          Configure a new slot game for the platform
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gameName">Game Name</Label>
                          <Input
                            id="gameName"
                            value={newGame.name || ""}
                            onChange={(e) =>
                              setNewGame((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="provider">Provider</Label>
                          <Select
                            value={newGame.provider || ""}
                            onValueChange={(value) =>
                              setNewGame((prev) => ({
                                ...prev,
                                provider: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {providers.map((provider) => (
                                <SelectItem
                                  key={provider.id}
                                  value={provider.name}
                                >
                                  {provider.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="theme">Theme</Label>
                          <Input
                            id="theme"
                            value={newGame.theme || ""}
                            onChange={(e) =>
                              setNewGame((prev) => ({
                                ...prev,
                                theme: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="rtp">RTP (%)</Label>
                          <Input
                            id="rtp"
                            type="number"
                            min="80"
                            max="99"
                            step="0.01"
                            value={newGame.rtp || 96}
                            onChange={(e) =>
                              setNewGame((prev) => ({
                                ...prev,
                                rtp: parseFloat(e.target.value),
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="volatility">Volatility</Label>
                          <Select
                            value={newGame.volatility || "medium"}
                            onValueChange={(value: any) =>
                              setNewGame((prev) => ({
                                ...prev,
                                volatility: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="paylines">Paylines</Label>
                          <Input
                            id="paylines"
                            type="number"
                            min="0"
                            max="1024"
                            value={newGame.paylines || 25}
                            onChange={(e) =>
                              setNewGame((prev) => ({
                                ...prev,
                                paylines: parseInt(e.target.value),
                              }))
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={newGame.description || ""}
                            onChange={(e) =>
                              setNewGame((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isJackpot"
                              checked={newGame.isJackpot || false}
                              onCheckedChange={(checked) =>
                                setNewGame((prev) => ({
                                  ...prev,
                                  isJackpot: checked,
                                }))
                              }
                            />
                            <Label htmlFor="isJackpot">Jackpot Game</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="isMobile"
                              checked={newGame.isMobile !== false}
                              onCheckedChange={(checked) =>
                                setNewGame((prev) => ({
                                  ...prev,
                                  isMobile: checked,
                                }))
                              }
                            />
                            <Label htmlFor="isMobile">Mobile Compatible</Label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowAddGame(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddGame}>Add Game</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Games Table */}
          <Card>
            <CardHeader>
              <CardTitle>Slot Games ({filteredGames.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>RTP</TableHead>
                    <TableHead>Volatility</TableHead>
                    <TableHead>Paylines</TableHead>
                    <TableHead>Popularity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                            <Coins className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{game.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {game.theme}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{game.provider}</TableCell>
                      <TableCell>
                        <Badge
                          variant={game.rtp >= 97 ? "default" : "secondary"}
                        >
                          {game.rtp}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            game.volatility === "high"
                              ? "destructive"
                              : game.volatility === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {game.volatility}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {game.paylines === 0 ? "Cluster" : game.paylines}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${game.popularity}%` }}
                            />
                          </div>
                          <span className="text-sm">{game.popularity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGame(game.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Game Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providerStats.map((provider) => (
                  <Card key={provider.name}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <Badge
                          variant={provider.isActive ? "default" : "secondary"}
                        >
                          {provider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Games:</span>
                          <span className="font-medium">
                            {provider.gamesCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Plays:</span>
                          <span className="font-medium">
                            {formatNumber(provider.totalPlays)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(provider.revenue)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Plays Today:</span>
                    <span className="font-bold">
                      {formatNumber(gameStats.playsToday)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue Today:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(gameStats.revenueToday)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Most Popular:</span>
                    <span className="font-bold">
                      {gameStats.mostPopularGame}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Games</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {games
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 5)
                    .map((game, index) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono">
                            #{index + 1}
                          </span>
                          <span className="text-sm">{game.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {game.popularity}%
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Slot Games Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableSlots">Enable Slot Games</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to access slot games
                  </p>
                </div>
                <Switch id="enableSlots" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowDemo">Allow Demo Play</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable free demo mode for all games
                  </p>
                </div>
                <Switch id="allowDemo" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableJackpots">Enable Jackpots</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow progressive and fixed jackpot games
                  </p>
                </div>
                <Switch id="enableJackpots" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mobileOptimized">Mobile Optimization</Label>
                  <p className="text-sm text-muted-foreground">
                    Prioritize mobile-friendly games
                  </p>
                </div>
                <Switch id="mobileOptimized" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBetGC">Maximum Bet (Gold Coins)</Label>
                <Input
                  id="maxBetGC"
                  type="number"
                  defaultValue="1000"
                  min="1"
                  max="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBetSC">Maximum Bet (Sweeps Coins)</Label>
                <Input
                  id="maxBetSC"
                  type="number"
                  defaultValue="10"
                  min="0.1"
                  max="100"
                  step="0.1"
                />
              </div>

              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
