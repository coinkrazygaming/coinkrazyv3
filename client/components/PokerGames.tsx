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
  Spade,
  Heart,
  Diamond,
  Club,
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
  Pause,
  RotateCcw,
  Shuffle,
  Eye,
  EyeOff,
  Settings,
  Volume2,
  VolumeX,
  MessageCircle,
  Send,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Award,
  BarChart3,
  Gamepad2,
  Zap,
  Flame,
  Sparkles,
  Info,
  History,
  UserPlus,
  UserMinus,
  Maximize,
  Minimize,
  Calculator,
  PieChart,
  TrendingDown,
  Activity,
  Layers,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  pokerService,
  PokerTable,
  PokerPlayer,
  PokerCard,
  PokerAction,
  PokerHand,
  PokerHandRanking,
  PokerChatMessage,
  PokerStats,
  PokerGameHistory,
} from "@/services/pokerService";

export default function PokerGames() {
  const { user } = useAuth();
  const [tables, setTables] = useState<PokerTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<PokerTable | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<
    "all" | "texas-holdem" | "omaha" | "seven-card-stud"
  >("all");
  const [selectedVariant, setSelectedVariant] = useState<
    "all" | "no-limit" | "pot-limit" | "fixed-limit"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [showHandHistoryDialog, setShowHandHistoryDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<PokerChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [playerStats, setPlayerStats] = useState<PokerStats | null>(null);
  const [gameHistory, setGameHistory] = useState<PokerGameHistory[]>([]);
  const [currentPlayerSeat, setCurrentPlayerSeat] = useState<number | null>(
    null,
  );
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoActions, setAutoActions] = useState(false);
  const [showCards, setShowCards] = useState(true);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [isJoiningTable, setIsJoiningTable] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPokerData();
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

  const loadPokerData = () => {
    const allTables = pokerService.getTables();
    setTables(allTables);
    setPlayerStats(pokerService.getPlayerStats());
  };

  const startRealTimeUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      const updatedTables = pokerService.getTables();
      setTables(updatedTables);

      if (selectedTable) {
        const updatedTable = updatedTables.find(
          (t) => t.id === selectedTable.id,
        );
        if (updatedTable) {
          setSelectedTable(updatedTable);
          const history = pokerService.getChatHistory(updatedTable.id);
          setChatMessages(history);
        }
      }
    }, 3000);
  };

  const getFilteredTables = () => {
    let filtered = tables;

    // Filter by game type
    if (selectedGameType !== "all") {
      filtered = filtered.filter(
        (table) => table.gameType === selectedGameType,
      );
    }

    // Filter by variant
    if (selectedVariant !== "all") {
      filtered = filtered.filter((table) => table.variant === selectedVariant);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter((table) =>
        table.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered.sort((a, b) => {
      // Sort by: playing tables first, then by player count
      if (a.status === "playing" && b.status !== "playing") return -1;
      if (a.status !== "playing" && b.status === "playing") return 1;
      return b.currentPlayers - a.currentPlayers;
    });
  };

  const joinTable = async (table: PokerTable, seatNumber?: number) => {
    setIsJoiningTable(true);
    try {
      pokerService.joinTable(table.id, seatNumber);
      setSelectedTable(table);
      setShowTableDialog(true);

      // Find player's seat
      const playerSeat = table.players.find((p) => p.id === user?.id)?.seat;
      setCurrentPlayerSeat(playerSeat || null);

      // Load chat history
      const history = pokerService.getChatHistory(table.id);
      setChatMessages(history);

      // Load game history
      const gameHist = pokerService.getGameHistory(table.id);
      setGameHistory(gameHist);
    } catch (error) {
      console.error("Failed to join table:", error);
    } finally {
      setIsJoiningTable(false);
    }
  };

  const leaveTable = () => {
    if (selectedTable) {
      pokerService.leaveTable(selectedTable.id);
      setSelectedTable(null);
      setShowTableDialog(false);
      setCurrentPlayerSeat(null);
      setChatMessages([]);
      setGameHistory([]);
    }
  };

  const performAction = (actionType: PokerAction["type"], amount?: number) => {
    if (!selectedTable || !user) return;

    const action: PokerAction = {
      type: actionType,
      amount,
      timestamp: new Date(),
      playerId: user.id,
    };

    pokerService.performAction(selectedTable.id, action);
    setBetAmount(0);
  };

  const sendChatMessage = () => {
    if (!newChatMessage.trim() || !selectedTable || !user) return;

    pokerService.sendChatMessage(
      selectedTable.id,
      newChatMessage,
      user.username,
    );
    setNewChatMessage("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case "texas-holdem":
        return <Target className="w-5 h-5" />;
      case "omaha":
        return <Layers className="w-5 h-5" />;
      case "seven-card-stud":
        return <Activity className="w-5 h-5" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getVariantBadgeColor = (variant: string) => {
    switch (variant) {
      case "no-limit":
        return "bg-red-500";
      case "pot-limit":
        return "bg-yellow-500";
      case "fixed-limit":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSuitIcon = (suit: PokerCard["suit"]) => {
    switch (suit) {
      case "hearts":
        return <Heart className="w-4 h-4 text-red-500" />;
      case "diamonds":
        return <Diamond className="w-4 h-4 text-red-500" />;
      case "clubs":
        return <Club className="w-4 h-4 text-black" />;
      case "spades":
        return <Spade className="w-4 h-4 text-black" />;
    }
  };

  const PokerTableCard = ({ table }: { table: PokerTable }) => (
    <Card
      className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
        table.isPrivate ? "border-gold-500/50 bg-gold-500/5" : ""
      } ${table.status === "playing" ? "border-green-500/50 bg-green-500/5" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getGameTypeIcon(table.gameType)}
            <div>
              <CardTitle className="text-lg">{table.name}</CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {table.gameType.replace("-", " ")} •{" "}
                {table.variant.replace("-", " ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getVariantBadgeColor(table.variant)}>
              {table.variant.toUpperCase()}
            </Badge>
            {table.isPrivate && (
              <Badge
                variant="outline"
                className="border-gold-500 text-gold-500"
              >
                <Crown className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Table Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Blinds</div>
            <div className="font-bold">
              {formatCurrency(table.blinds.small)}/
              {formatCurrency(table.blinds.big)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Buy-in</div>
            <div className="font-bold">
              {formatCurrency(table.buyIn.min)} -{" "}
              {formatCurrency(table.buyIn.max)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Players</div>
            <div className="font-bold">
              {table.currentPlayers}/{table.maxPlayers}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Pot</div>
            <div className="font-bold text-green-500">
              {formatCurrency(table.pot.main)}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                table.status === "playing"
                  ? "bg-green-500 animate-pulse"
                  : table.status === "waiting"
                    ? "bg-yellow-500"
                    : "bg-gray-500"
              }`}
            ></div>
            <span className="font-medium capitalize">{table.status}</span>
            {table.status === "playing" && (
              <Badge variant="outline" className="text-xs">
                {table.gamePhase}
              </Badge>
            )}
          </div>

          {table.status === "playing" && table.activePlayer && (
            <div className="text-xs text-muted-foreground">
              Hand #{table.handNumber}
            </div>
          )}
        </div>

        {/* Community Cards (for Hold'em and Omaha) */}
        {(table.gameType === "texas-holdem" || table.gameType === "omaha") &&
          table.communityCards.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                Community Cards
              </div>
              <div className="flex gap-1">
                {table.communityCards.map((card, index) => (
                  <div
                    key={index}
                    className="w-8 h-12 bg-white border rounded flex flex-col items-center justify-center text-xs"
                  >
                    <div className="font-bold">{card.rank}</div>
                    {getSuitIcon(card.suit)}
                  </div>
                ))}
                {/* Placeholder cards */}
                {Array.from({ length: 5 - table.communityCards.length }).map(
                  (_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="w-8 h-12 bg-gray-200 border rounded flex items-center justify-center"
                    >
                      <div className="w-4 h-6 bg-gray-300 rounded"></div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

        {/* Players Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Table Capacity</span>
            <span className="text-muted-foreground">
              {table.currentPlayers}/{table.maxPlayers}
            </span>
          </div>
          <Progress
            value={(table.currentPlayers / table.maxPlayers) * 100}
            className="h-2"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => joinTable(table)}
            disabled={
              isJoiningTable || table.currentPlayers >= table.maxPlayers
            }
            className="flex-1"
          >
            {isJoiningTable ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Join Table
              </>
            )}
          </Button>

          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const PokerTableInterface = ({ table }: { table: PokerTable }) => {
    const currentPlayer = table.players.find((p) => p.id === user?.id);
    const isActivePlayer = table.activePlayer === user?.id;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getGameTypeIcon(table.gameType)}
                  <div>
                    <CardTitle>{table.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {table.gameType.replace("-", " ").toUpperCase()} •{" "}
                      {table.variant.replace("-", " ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getVariantBadgeColor(table.variant)}>
                    {table.variant.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">Hand #{table.handNumber}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Poker Table Layout */}
              <div className="relative bg-green-800 rounded-full p-8 min-h-[400px] flex items-center justify-center">
                {/* Community Cards */}
                {(table.gameType === "texas-holdem" ||
                  table.gameType === "omaha") && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-center mb-4">
                      <div className="text-white font-bold mb-2">
                        Pot: {formatCurrency(table.pot.main)}
                      </div>
                      <div className="flex gap-2 justify-center">
                        {table.communityCards.map((card, index) => (
                          <div
                            key={index}
                            className="w-12 h-16 bg-white border-2 border-gray-300 rounded flex flex-col items-center justify-center"
                          >
                            <div className="font-bold text-lg">{card.rank}</div>
                            {getSuitIcon(card.suit)}
                          </div>
                        ))}
                        {/* Placeholder cards */}
                        {Array.from({
                          length: 5 - table.communityCards.length,
                        }).map((_, index) => (
                          <div
                            key={`placeholder-${index}`}
                            className="w-12 h-16 bg-gray-300 border-2 border-gray-400 rounded flex items-center justify-center"
                          >
                            <div className="w-8 h-10 bg-blue-600 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Player Seats */}
                {Array.from({ length: table.maxPlayers }).map(
                  (_, seatIndex) => {
                    const player = table.players.find(
                      (p) => p.seat === seatIndex + 1,
                    );
                    const angle = (seatIndex / table.maxPlayers) * 2 * Math.PI;
                    const radius = 140;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    return (
                      <div
                        key={seatIndex}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                        }}
                      >
                        {player ? (
                          <div
                            className={`bg-white rounded-lg p-2 text-center min-w-[100px] ${
                              player.id === table.activePlayer
                                ? "ring-2 ring-yellow-400"
                                : ""
                            } ${player.isFolded ? "opacity-50" : ""}`}
                          >
                            <div className="font-bold text-sm">
                              {player.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(player.chipCount)}
                            </div>
                            {player.currentBet > 0 && (
                              <div className="text-xs font-bold text-green-600">
                                Bet: {formatCurrency(player.currentBet)}
                              </div>
                            )}
                            {player.isDealer && (
                              <Badge className="text-xs mt-1">D</Badge>
                            )}
                            {player.isSmallBlind && (
                              <Badge variant="outline" className="text-xs mt-1">
                                SB
                              </Badge>
                            )}
                            {player.isBigBlind && (
                              <Badge variant="outline" className="text-xs mt-1">
                                BB
                              </Badge>
                            )}

                            {/* Player Cards */}
                            {showCards &&
                              player.hand &&
                              player.id === user?.id && (
                                <div className="flex gap-1 mt-2 justify-center">
                                  {player.hand.map((card, cardIndex) => (
                                    <div
                                      key={cardIndex}
                                      className="w-6 h-8 bg-white border rounded flex flex-col items-center justify-center text-xs"
                                    >
                                      <div className="font-bold">
                                        {card.rank}
                                      </div>
                                      <div className="text-xs">
                                        {getSuitIcon(card.suit)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="bg-gray-200 rounded-lg p-2 text-center min-w-[100px] opacity-50">
                            <div className="text-sm text-gray-500">
                              Empty Seat
                            </div>
                            <div className="text-xs text-gray-400">
                              Seat {seatIndex + 1}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>

              {/* Action Buttons */}
              {isActivePlayer && currentPlayer && (
                <div className="flex items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Action:</span>
                    <Timer className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-orange-500">
                      {currentPlayer.timeToAct || 30}s
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => performAction("fold")}
                    >
                      Fold
                    </Button>

                    {table.currentBet === 0 ? (
                      <Button
                        variant="outline"
                        onClick={() => performAction("check")}
                      >
                        Check
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => performAction("call")}
                      >
                        Call {formatCurrency(table.currentBet)}
                      </Button>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        placeholder="Amount"
                        className="w-24"
                      />
                      <Button
                        onClick={() => performAction("bet", betAmount)}
                        disabled={betAmount <= 0}
                      >
                        {table.currentBet > 0 ? "Raise" : "Bet"}
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => performAction("all-in")}
                    >
                      All-in
                    </Button>
                  </div>
                </div>
              )}
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
                Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={leaveTable}
                  className="flex-1"
                >
                  Leave Table
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sound</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Cards</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCards(!showCards)}
                  >
                    {showCards ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto Actions</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoActions(!autoActions)}
                  >
                    {autoActions ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5" />
                Table Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Small Blind:</span>
                  <span className="font-bold">
                    {formatCurrency(table.blinds.small)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Big Blind:</span>
                  <span className="font-bold">
                    {formatCurrency(table.blinds.big)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Bet:</span>
                  <span className="font-bold">
                    {formatCurrency(table.currentBet)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pot:</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(table.pot.main)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Players:</span>
                  <span className="font-bold">
                    {table.currentPlayers}/{table.maxPlayers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rake:</span>
                  <span className="font-bold">{table.rakePercentage}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Table Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-32" ref={chatScrollRef}>
                <div className="space-y-2">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <div
                          className={`font-bold ${
                            message.type === "system"
                              ? "text-blue-500"
                              : message.type === "tournament"
                                ? "text-purple-500"
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

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowStatsDialog(true)}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Stats
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowHandHistoryDialog(true)}
              >
                <History className="w-4 h-4 mr-2" />
                Hand History
              </Button>

              <Button variant="outline" size="sm" className="w-full">
                <Calculator className="w-4 h-4 mr-2" />
                Odds Calculator
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Poker Games
                <Badge className="bg-blue-600 text-white">Live Tables</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Texas Hold'em, Omaha, and Seven Card Stud with real-time
                multiplayer action
              </p>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {tables.filter((t) => t.status === "playing").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Tables
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {tables.reduce((sum, t) => sum + t.currentPlayers, 0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Players Online
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
                  placeholder="Search poker tables..."
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
                onValueChange={(value) => setSelectedGameType(value as any)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Game Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="texas-holdem">Texas Hold'em</SelectItem>
                  <SelectItem value="omaha">Omaha</SelectItem>
                  <SelectItem value="seven-card-stud">
                    Seven Card Stud
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedVariant}
                onValueChange={(value) => setSelectedVariant(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Variants</SelectItem>
                  <SelectItem value="no-limit">No Limit</SelectItem>
                  <SelectItem value="pot-limit">Pot Limit</SelectItem>
                  <SelectItem value="fixed-limit">Fixed Limit</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowStatsDialog(true)}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>

              <Button variant="outline" onClick={loadPokerData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Type Tabs */}
      <Tabs
        value={selectedGameType}
        onValueChange={(value) => setSelectedGameType(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            All Games
          </TabsTrigger>
          <TabsTrigger value="texas-holdem" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Hold'em
          </TabsTrigger>
          <TabsTrigger value="omaha" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Omaha
          </TabsTrigger>
          <TabsTrigger
            value="seven-card-stud"
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Stud
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedGameType} className="space-y-6">
          {/* Tables Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredTables().map((table) => (
              <PokerTableCard key={table.id} table={table} />
            ))}
          </div>

          {getFilteredTables().length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Tables Found</h3>
                <p className="text-muted-foreground">
                  No poker tables match your current filters. Try adjusting your
                  search criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Poker Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTable && getGameTypeIcon(selectedTable.gameType)}
              {selectedTable?.name || "Poker Table"}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && <PokerTableInterface table={selectedTable} />}
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Your Poker Statistics</DialogTitle>
          </DialogHeader>
          {playerStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Overall Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overall Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hands Played:</span>
                    <span className="font-bold">
                      {playerStats.handsPlayed.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hands Won:</span>
                    <span className="font-bold text-green-500">
                      {playerStats.handsWon.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="font-bold">
                      {(
                        (playerStats.handsWon / playerStats.handsPlayed) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biggest Pot:</span>
                    <span className="font-bold text-gold-400">
                      {formatCurrency(playerStats.biggestPot)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tournament Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tournament Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tournaments Cashed:
                    </span>
                    <span className="font-bold">
                      {playerStats.tournamentsCashed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tournaments Won:
                    </span>
                    <span className="font-bold text-gold-500">
                      {playerStats.tournamentsWon}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Biggest Tournament Win:
                    </span>
                    <span className="font-bold text-gold-400">
                      {formatCurrency(playerStats.biggestTournamentWin)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Net Winnings:</span>
                    <span
                      className={`font-bold ${playerStats.totalWinnings.gc >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {playerStats.totalWinnings.gc >= 0 ? "+" : ""}
                      {playerStats.totalWinnings.gc} GC
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Playing Style */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Playing Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VPIP:</span>
                    <span className="font-bold">{playerStats.vpip}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PFR:</span>
                    <span className="font-bold">{playerStats.pfr}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aggression:</span>
                    <span className="font-bold">{playerStats.aggression}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Showdown Winning:
                    </span>
                    <span className="font-bold">
                      {playerStats.showdownWinning}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hand History Dialog */}
      <Dialog
        open={showHandHistoryDialog}
        onOpenChange={setShowHandHistoryDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Hand History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hand #</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Pot</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gameHistory.slice(0, 10).map((hand) => (
                  <TableRow key={hand.id}>
                    <TableCell className="font-medium">
                      #{hand.handNumber}
                    </TableCell>
                    <TableCell>{hand.tableId}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          hand.winner === user?.id ? "default" : "outline"
                        }
                      >
                        {hand.winner === user?.id ? "Won" : "Lost"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(hand.pot)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {hand.timestamp.toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
