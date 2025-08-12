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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Play,
  Pause,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Users,
  Star,
  Crown,
  Trophy,
  Target,
  Heart,
  Gift,
  Camera,
  MessageCircle,
  Send,
  Settings,
  Eye,
  EyeOff,
  Tv,
  Radio,
  MonitorSpeaker,
  Gamepad2,
  Zap,
  Clock,
  DollarSign,
  Coins,
  TrendingUp,
  Award,
  Timer,
  RefreshCw,
  Filter,
  Search,
  Bookmark,
  Share2,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Flame,
  Sparkles,
  Bell,
  Calendar,
  MapPin,
  Globe,
  Languages,
  Headphones,
  Mic,
  MicOff,
  PhoneCall,
  Plus,
  Minus,
  X,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  liveGamesService,
  LiveGame,
  LiveDealer,
  LiveGameTournament,
  LiveChatMessage,
  LiveGameType,
  LiveGameStatus,
  LiveGamePromotion,
  CameraAngle,
  StreamQuality,
} from "@/services/liveGamesService";

export default function LiveGames() {
  const { user } = useAuth();
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [dealers, setDealers] = useState<LiveDealer[]>([]);
  const [tournaments, setTournaments] = useState<LiveGameTournament[]>([]);
  const [promotions, setPromotions] = useState<LiveGamePromotion[]>([]);
  const [selectedGame, setSelectedGame] = useState<LiveGame | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<
    LiveGameType | "all"
  >("all");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "featured" | "vip" | "new" | "popular"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGameDialog, setShowGameDialog] = useState(false);
  const [showDealerDialog, setShowDealerDialog] = useState(false);
  const [showTournamentDialog, setShowTournamentDialog] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<LiveDealer | null>(null);
  const [selectedTournament, setSelectedTournament] =
    useState<LiveGameTournament | null>(null);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [currentCamera, setCurrentCamera] = useState<string>("main");
  const [streamQuality, setStreamQuality] = useState<StreamQuality | null>(
    null,
  );
  const [isStreamFullscreen, setIsStreamFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadLiveGamesData();
    startRealTimeUpdates();

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const loadLiveGamesData = () => {
    const games = liveGamesService.getLiveGames();
    setLiveGames(games);
    setDealers(liveGamesService.getDealers());
    setTournaments(liveGamesService.getTournaments());
    setPromotions(liveGamesService.getPromotions());
  };

  const startRealTimeUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      const updatedGames = liveGamesService.getLiveGames();
      setLiveGames(updatedGames);

      if (selectedGame) {
        const updatedGame = updatedGames.find((g) => g.id === selectedGame.id);
        if (updatedGame) {
          setSelectedGame(updatedGame);
          const history = liveGamesService.getChatHistory(updatedGame.id);
          setChatMessages(history);
        }
      }
    }, 3000);
  };

  const getFilteredGames = () => {
    let filtered = liveGames;

    // Filter by game type
    if (selectedGameType !== "all") {
      filtered = filtered.filter((game) => game.type === selectedGameType);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((game) => game.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (game) =>
          game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          game.dealer.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      // Sort by: featured > vip > popular > others, then by player count
      const aScore =
        a.category === "featured"
          ? 4
          : a.category === "vip"
            ? 3
            : a.category === "popular"
              ? 2
              : 1;
      const bScore =
        b.category === "featured"
          ? 4
          : b.category === "vip"
            ? 3
            : b.category === "popular"
              ? 2
              : 1;

      if (aScore !== bScore) return bScore - aScore;
      return b.players.length - a.players.length;
    });
  };

  const joinGame = async (game: LiveGame, seatNumber?: number) => {
    setIsJoiningGame(true);
    try {
      const result = await liveGamesService.joinGame(game.id, seatNumber);
      if (result.success) {
        setSelectedGame(game);
        setShowGameDialog(true);

        // Initialize stream quality
        if (game.quality.length > 0) {
          setStreamQuality(game.quality[0]);
        }

        // Load chat history
        const history = liveGamesService.getChatHistory(game.id);
        setChatMessages(history);
      } else {
        console.error("Failed to join game:", result.error);
      }
    } catch (error) {
      console.error("Error joining game:", error);
    } finally {
      setIsJoiningGame(false);
    }
  };

  const leaveGame = () => {
    if (selectedGame) {
      liveGamesService.leaveGame();
      setSelectedGame(null);
      setShowGameDialog(false);
      setChatMessages([]);
    }
  };

  const placeBet = async (betType: string, amount: number, options?: any) => {
    if (!selectedGame || !user) return;

    try {
      await liveGamesService.placeBet(selectedGame.id, {
        playerId: user.id,
        amount,
        type: betType,
        options,
      });
    } catch (error) {
      console.error("Error placing bet:", error);
    }
  };

  const sendChatMessage = () => {
    if (!newChatMessage.trim() || !selectedGame || !user) return;

    liveGamesService.sendChatMessage(
      selectedGame.id,
      newChatMessage,
      user.username,
    );
    setNewChatMessage("");
  };

  const switchCamera = (cameraId: string) => {
    if (selectedGame) {
      liveGamesService.switchCamera(selectedGame.id, cameraId);
      setCurrentCamera(cameraId);
    }
  };

  const changeStreamQuality = (quality: StreamQuality) => {
    if (selectedGame) {
      liveGamesService.changeStreamQuality(selectedGame.id, quality);
      setStreamQuality(quality);
    }
  };

  const tipDealer = async (amount: number) => {
    if (!selectedGame) return;

    try {
      await liveGamesService.tipDealer(selectedGame.id, amount);
    } catch (error) {
      console.error("Error tipping dealer:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getGameTypeIcon = (type: LiveGameType) => {
    switch (type) {
      case "live-blackjack":
        return <Target className="w-5 h-5" />;
      case "live-roulette":
        return <Target className="w-5 h-5" />;
      case "live-baccarat":
        return <Crown className="w-5 h-5" />;
      case "live-poker":
        return <Target className="w-5 h-5" />;
      case "live-craps":
        return <Target className="w-5 h-5" />;
      case "live-wheel":
        return <Target className="w-5 h-5" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getStatusBadgeVariant = (status: LiveGameStatus) => {
    switch (status) {
      case "active":
        return "default";
      case "break":
        return "secondary";
      case "maintenance":
        return "destructive";
      case "offline":
        return "outline";
      default:
        return "outline";
    }
  };

  const LiveGameCard = ({ game }: { game: LiveGame }) => (
    <Card
      className={`hover:shadow-xl transition-all duration-300 cursor-pointer ${
        game.isVIP
          ? "border-gold-500/50 bg-gradient-to-br from-gold/5 to-gold/10"
          : ""
      } ${game.category === "featured" ? "border-purple-500/50 bg-purple-500/5" : ""}`}
    >
      {game.category === "featured" && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-purple-600 text-white">
            <Star className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      {game.isVIP && (
        <div className="absolute -top-2 -left-2">
          <Badge className="bg-gold-500 text-black">
            <Crown className="w-3 h-3 mr-1" />
            VIP
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getGameTypeIcon(game.type)}
            <div>
              <CardTitle className="text-lg">{game.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {game.type.replace("live-", "").replace("-", " ").toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(game.status)}>
              {game.status === "active" && (
                <Radio className="w-3 h-3 mr-1 animate-pulse" />
              )}
              {game.status.toUpperCase()}
            </Badge>
            {game.status === "active" && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-500 font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dealer Info */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {game.dealer.name[0]}
            </div>
            <div>
              <div className="font-medium">{game.dealer.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Languages className="w-3 h-3" />
                {game.dealer.language}
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-gold-500" />
                  {game.dealer.rating}
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDealer(game.dealer);
              setShowDealerDialog(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Min Bet</div>
            <div className="font-bold">{formatCurrency(game.minBet)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Max Bet</div>
            <div className="font-bold">{formatCurrency(game.maxBet)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Players</div>
            <div className="font-bold">
              {game.players.length}/{game.maxPlayers}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Language</div>
            <div className="font-medium">{game.language}</div>
          </div>
        </div>

        {/* Stream Quality & Features */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Stream Quality</div>
            <Badge variant="outline" className="text-xs">
              {game.quality[0]?.label || "HD"}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-1">
            {game.features.slice(0, 4).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature.replace("-", " ")}
              </Badge>
            ))}
            {game.features.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{game.features.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Players Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Table Capacity</span>
            <span className="text-muted-foreground">
              {game.players.length}/{game.maxPlayers}
            </span>
          </div>
          <Progress
            value={(game.players.length / game.maxPlayers) * 100}
            className="h-2"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => joinGame(game)}
            disabled={
              isJoiningGame ||
              game.players.length >= game.maxPlayers ||
              game.status !== "active"
            }
            className="flex-1"
          >
            {isJoiningGame ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Join Game
              </>
            )}
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

  const LiveGameInterface = ({ game }: { game: LiveGame }) => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Stream Area */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getGameTypeIcon(game.type)}
                <div>
                  <CardTitle>{game.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Dealer: {game.dealer.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-500 font-medium">LIVE</span>
                </div>
                <Badge variant="outline">{game.players.length} players</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Video Stream */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <Tv className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Live Video Stream</p>
                  <p className="text-sm opacity-75">
                    {game.streamUrl
                      ? "Connected to live stream"
                      : "Connecting..."}
                  </p>
                </div>
              </div>

              {/* Stream Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                  >
                    {audioEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                  >
                    {videoEnabled ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <VideoOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={streamQuality?.label || ""}
                    onValueChange={(value) => {
                      const quality = game.quality.find(
                        (q) => q.label === value,
                      );
                      if (quality) changeStreamQuality(quality);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {game.quality.map((quality) => (
                        <SelectItem key={quality.label} value={quality.label}>
                          {quality.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsStreamFullscreen(!isStreamFullscreen)}
                  >
                    {isStreamFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Maximize className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Camera Angles */}
            <div className="flex gap-2 overflow-x-auto">
              {game.table.cameraAngles.map((angle) => (
                <Button
                  key={angle.id}
                  variant={currentCamera === angle.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchCamera(angle.id)}
                  className="whitespace-nowrap"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {angle.name}
                </Button>
              ))}
            </div>

            {/* Game Interface */}
            <div className="border-t pt-4">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">
                  {getGameTypeIcon(game.type)}
                </div>
                <h3 className="text-xl font-bold mb-2">Live Game Interface</h3>
                <p className="text-muted-foreground mb-4">
                  Interactive betting interface for{" "}
                  {game.type.replace("live-", "")}
                </p>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => placeBet("main", 10)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Bet $10
                  </Button>
                  <Button
                    onClick={() => placeBet("main", 25)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Bet $25
                  </Button>
                  <Button
                    onClick={() => placeBet("main", 50)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Bet $50
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Game Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Game Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={leaveGame}
                className="flex-1"
              >
                Leave Game
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Chat</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChatEnabled(!chatEnabled)}
                >
                  {chatEnabled ? (
                    <MessageCircle className="w-4 h-4" />
                  ) : (
                    <MessageCircle className="w-4 h-4 opacity-50" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dealer Tip */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Tip Dealer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {[1, 5, 10].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => tipDealer(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Chat */}
        {chatEnabled && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-48" ref={chatScrollRef}>
                <div className="space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <div
                          className={`font-bold ${
                            message.type === "dealer"
                              ? "text-purple-500"
                              : message.type === "system"
                                ? "text-blue-500"
                                : message.type === "moderator"
                                  ? "text-green-500"
                                  : "text-foreground"
                          }`}
                        >
                          {message.username}:
                        </div>
                        <div className="flex-1">{message.message}</div>
                      </div>
                      <div className="text-xs text-muted-foreground ml-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={sendChatMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Players List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({game.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {game.players.slice(0, 8).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {player.username[0]}
                    </div>
                    <span className="font-medium">{player.username}</span>
                    {player.isVIP && (
                      <Crown className="w-3 h-3 text-gold-500" />
                    )}
                    {!player.isConnected && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ${player.chipCount.toLocaleString()}
                    </div>
                    {player.currentBet > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Bet: ${player.currentBet}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                Live Casino Games
                <Badge className="bg-purple-600 text-white">Live Dealers</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Real dealers, live streaming, and authentic casino atmosphere
              </p>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {liveGames.filter((g) => g.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">Live Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-400">
                  {dealers.filter((d) => d.isOnline).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Dealers Online
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search live games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={selectedGameType}
                onValueChange={(value) =>
                  setSelectedGameType(value as LiveGameType | "all")
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Game Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="live-blackjack">Blackjack</SelectItem>
                  <SelectItem value="live-roulette">Roulette</SelectItem>
                  <SelectItem value="live-baccarat">Baccarat</SelectItem>
                  <SelectItem value="live-poker">Poker</SelectItem>
                  <SelectItem value="live-wheel">Game Shows</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadLiveGamesData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value as any)}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            All Games
          </TabsTrigger>
          <TabsTrigger value="featured" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="vip" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            VIP
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            New
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Popular
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Live Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredGames().map((game) => (
              <LiveGameCard key={game.id} game={game} />
            ))}
          </div>

          {getFilteredGames().length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Live Games Found</h3>
                <p className="text-muted-foreground">
                  No games match your current filters. Try adjusting your search
                  criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Game Interface Dialog */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedGame && getGameTypeIcon(selectedGame.type)}
              {selectedGame?.name || "Live Game"}
            </DialogTitle>
          </DialogHeader>
          {selectedGame && <LiveGameInterface game={selectedGame} />}
        </DialogContent>
      </Dialog>

      {/* Dealer Info Dialog */}
      <Dialog open={showDealerDialog} onOpenChange={setShowDealerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dealer Information</DialogTitle>
          </DialogHeader>
          {selectedDealer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                  {selectedDealer.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedDealer.name}</h3>
                  <p className="text-muted-foreground">
                    Professional Live Dealer
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500" />
                      <span className="font-medium">
                        {selectedDealer.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        {selectedDealer.experience} years
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        {selectedDealer.stats.playerFavorites} favorites
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Language</div>
                  <div className="font-medium">{selectedDealer.language}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Specialties
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedDealer.specialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="outline"
                        className="text-xs"
                      >
                        {specialty.replace("live-", "")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Shift Hours
                  </div>
                  <div className="font-medium">
                    {selectedDealer.shift.start} - {selectedDealer.shift.end}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Games Dealt
                  </div>
                  <div className="font-medium">
                    {selectedDealer.stats.gamesDealt.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
