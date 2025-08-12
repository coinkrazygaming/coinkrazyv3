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
  TrendingUp,
  Users,
  Crown,
  Star,
  Coins,
  DollarSign,
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Split,
  Plus,
  Minus,
  Eye,
  Settings,
  Volume2,
  VolumeX,
  MessageCircle,
  BarChart3,
  Trophy,
  Clock,
  Gamepad2,
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  CircleDot,
  Square,
  Triangle,
  Hexagon,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Fire,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  tableGamesService,
  BlackjackTable,
  RouletteTable,
  BaccaratTable,
  CrapsTable,
  TableGameStats,
  TableGameChatMessage,
} from "@/services/tableGamesService";

export default function TableGames() {
  const { user } = useAuth();
  const [activeGameType, setActiveGameType] = useState<
    "blackjack" | "roulette" | "baccarat" | "craps"
  >("blackjack");
  const [blackjackTables, setBlackjackTables] = useState<BlackjackTable[]>([]);
  const [rouletteTables, setRouletteTables] = useState<RouletteTable[]>([]);
  const [baccaratTables, setBaccaratTables] = useState<BaccaratTable[]>([]);
  const [crapsTables, setCrapsTables] = useState<CrapsTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [gameStats, setGameStats] = useState<TableGameStats | null>(null);
  const [chatMessages, setChatMessages] = useState<TableGameChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGameDialog, setShowGameDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [currentGameState, setCurrentGameState] = useState<any>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTableData();
    loadGameStats();
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

  const loadTableData = () => {
    setBlackjackTables(tableGamesService.getBlackjackTables());
    setRouletteTables(tableGamesService.getRouletteTables());
    setBaccaratTables(tableGamesService.getBaccaratTables());
    setCrapsTables(tableGamesService.getCrapsTables());
  };

  const loadGameStats = () => {
    setGameStats(tableGamesService.getPlayerStats());
  };

  const startRealTimeUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      loadTableData();

      if (selectedTable) {
        const updatedMessages = tableGamesService.getChatHistory(
          selectedTable.id,
        );
        setChatMessages(updatedMessages);
      }
    }, 2000);
  };

  const joinTable = async (table: any, gameType: string) => {
    try {
      tableGamesService.joinTable(table.id, gameType);
      setSelectedTable(table);
      setShowGameDialog(true);

      // Load chat history for this table
      const history = tableGamesService.getChatHistory(table.id);
      setChatMessages(history);
    } catch (error) {
      console.error("Failed to join table:", error);
    }
  };

  const leaveTable = () => {
    if (selectedTable) {
      tableGamesService.leaveTable(selectedTable.id, activeGameType);
      setSelectedTable(null);
      setShowGameDialog(false);
      setChatMessages([]);
    }
  };

  const sendChatMessage = () => {
    if (!newChatMessage.trim() || !selectedTable || !user) return;

    tableGamesService.sendChatMessage(
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

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "blackjack":
        return <Spade className="w-6 h-6" />;
      case "roulette":
        return <CircleDot className="w-6 h-6" />;
      case "baccarat":
        return <Diamond className="w-6 h-6" />;
      case "craps":
        return <Dice1 className="w-6 h-6" />;
      default:
        return <Gamepad2 className="w-6 h-6" />;
    }
  };

  const BlackjackTableCard = ({ table }: { table: BlackjackTable }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Spade className="w-5 h-5" />
            <CardTitle className="text-lg">{table.name}</CardTitle>
          </div>
          <Badge
            variant={
              table.players.length >= table.maxPlayers
                ? "destructive"
                : "default"
            }
          >
            {table.players.length}/{table.maxPlayers}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Min/Max Bet</div>
            <div className="font-bold">
              {formatCurrency(table.minBet)} - {formatCurrency(table.maxBet)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Game Phase</div>
            <div className="font-medium capitalize">{table.gamePhase}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Blackjack Pays</div>
            <div className="font-bold text-gold-400">
              {table.rules.blackjackPayout === 1.5 ? "3:2" : "6:5"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Decks</div>
            <div className="font-medium">{table.rules.deckCount}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Table Rules</div>
          <div className="flex flex-wrap gap-1">
            {table.rules.dealerHitSoft17 && (
              <Badge variant="outline" className="text-xs">
                Dealer Hits Soft 17
              </Badge>
            )}
            {table.rules.doubleAfterSplit && (
              <Badge variant="outline" className="text-xs">
                Double After Split
              </Badge>
            )}
            {table.rules.surrenderAllowed && (
              <Badge variant="outline" className="text-xs">
                Surrender
              </Badge>
            )}
          </div>
        </div>

        <Button
          onClick={() => joinTable(table, "blackjack")}
          className="w-full"
          disabled={table.players.length >= table.maxPlayers}
        >
          <Play className="w-4 h-4 mr-2" />
          Join Table
        </Button>
      </CardContent>
    </Card>
  );

  const RouletteTableCard = ({ table }: { table: RouletteTable }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDot className="w-5 h-5 text-red-500" />
            <CardTitle className="text-lg">{table.name}</CardTitle>
          </div>
          <Badge
            variant={table.gamePhase === "spinning" ? "destructive" : "default"}
          >
            {table.gamePhase}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Min/Max Bet</div>
            <div className="font-bold">
              {formatCurrency(table.minBet)} - {formatCurrency(table.maxBet)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Type</div>
            <div className="font-medium capitalize">{table.type}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Players</div>
            <div className="font-bold">
              {table.players.length}/{table.maxPlayers}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">
              {table.gamePhase === "betting"
                ? "Betting Time"
                : "Current Number"}
            </div>
            <div className="font-bold text-blue-500">
              {table.gamePhase === "betting"
                ? `${table.bettingTimeLeft}s`
                : table.currentNumber !== undefined
                  ? table.currentNumber
                  : "-"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Recent Numbers</div>
          <div className="flex gap-1 flex-wrap">
            {table.lastNumbers.slice(0, 8).map((num, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  num === 0
                    ? "bg-green-600"
                    : [
                          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30,
                          32, 34, 36,
                        ].includes(num)
                      ? "bg-red-600"
                      : "bg-black"
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => joinTable(table, "roulette")}
          className="w-full"
          disabled={table.players.length >= table.maxPlayers}
        >
          <Play className="w-4 h-4 mr-2" />
          Join Table
        </Button>
      </CardContent>
    </Card>
  );

  const BaccaratTableCard = ({ table }: { table: BaccaratTable }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Diamond className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">{table.name}</CardTitle>
          </div>
          <Badge
            variant={table.gamePhase === "dealing" ? "destructive" : "default"}
          >
            {table.gamePhase}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Min/Max Bet</div>
            <div className="font-bold">
              {formatCurrency(table.minBet)} - {formatCurrency(table.maxBet)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Game #</div>
            <div className="font-medium">{table.gameNumber}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Players</div>
            <div className="font-bold">
              {table.players.length}/{table.maxPlayers}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Commission</div>
            <div className="font-medium">{table.commission * 100}%</div>
          </div>
        </div>

        {table.gamePhase === "dealing" && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-blue-500/10 rounded">
              <div className="text-xs text-muted-foreground">Player</div>
              <div className="font-bold text-lg">{table.playerScore}</div>
            </div>
            <div className="text-center p-2 bg-red-500/10 rounded">
              <div className="text-xs text-muted-foreground">Banker</div>
              <div className="font-bold text-lg">{table.bankerScore}</div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Recent Results</div>
          <div className="flex gap-1">
            {table.results.slice(0, 10).map((result, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  result.outcome === "player"
                    ? "bg-blue-600"
                    : result.outcome === "banker"
                      ? "bg-red-600"
                      : "bg-green-600"
                }`}
                title={`${result.outcome} (${result.playerScore}-${result.bankerScore})`}
              >
                {result.outcome === "player"
                  ? "P"
                  : result.outcome === "banker"
                    ? "B"
                    : "T"}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => joinTable(table, "baccarat")}
          className="w-full"
          disabled={table.players.length >= table.maxPlayers}
        >
          <Play className="w-4 h-4 mr-2" />
          Join Table
        </Button>
      </CardContent>
    </Card>
  );

  const CrapsTableCard = ({ table }: { table: CrapsTable }) => (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dice1 className="w-5 h-5 text-green-500" />
            <CardTitle className="text-lg">{table.name}</CardTitle>
          </div>
          <Badge
            variant={table.gamePhase === "rolling" ? "destructive" : "default"}
          >
            {table.gamePhase}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Min/Max Bet</div>
            <div className="font-bold">
              {formatCurrency(table.minBet)} - {formatCurrency(table.maxBet)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Point</div>
            <div className="font-bold text-green-500">
              {table.point || "Off"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Players</div>
            <div className="font-bold">
              {table.players.length}/{table.maxPlayers}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Shooter</div>
            <div className="font-medium">
              {table.players.find((p) => p.isShooter)?.username || "N/A"}
            </div>
          </div>
        </div>

        {table.lastRoll && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Last Roll</div>
            <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const DiceIcon = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6][
                    num - 1
                  ];
                  return (
                    <DiceIcon
                      key={num}
                      className={`w-8 h-8 ${table.lastRoll?.dice.includes(num) ? "text-green-500" : "text-muted-foreground"}`}
                    />
                  );
                })}
              </div>
              <div className="text-lg font-bold">
                Total: {table.lastRoll.total}
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={() => joinTable(table, "craps")}
          className="w-full"
          disabled={table.players.length >= table.maxPlayers}
        >
          <Play className="w-4 h-4 mr-2" />
          Join Table
        </Button>
      </CardContent>
    </Card>
  );

  const GameInterface = ({
    table,
    gameType,
  }: {
    table: any;
    gameType: string;
  }) => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Game Area */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getGameIcon(gameType)}
                {table.name}
              </CardTitle>
              <div className="flex gap-2">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStatsDialog(true)}
                >
                  <BarChart3 className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={leaveTable}>
                  Leave Table
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Game-specific interface would go here */}
            <div className="text-center py-20">
              <div className="text-6xl mb-4">{getGameIcon(gameType)}</div>
              <h3 className="text-2xl font-bold mb-2">
                {gameType.charAt(0).toUpperCase() + gameType.slice(1)} Game
                Interface
              </h3>
              <p className="text-muted-foreground">
                Interactive game interface would be implemented here with cards,
                wheels, dice, etc.
              </p>
              <div className="mt-6 flex gap-4 justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Play className="w-4 h-4 mr-2" />
                  Place Bet
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Round
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Chat */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Table Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-40" ref={chatScrollRef}>
              <div className="space-y-2">
                {chatMessages.map((message) => (
                  <div key={message.id} className="text-sm">
                    <div className="flex items-start gap-2">
                      <div
                        className={`font-bold ${
                          message.type === "dealer"
                            ? "text-blue-500"
                            : message.type === "system"
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
                Send
              </Button>
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
                <span className="text-muted-foreground">Min Bet:</span>
                <span className="font-bold">
                  {formatCurrency(table.minBet)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Bet:</span>
                <span className="font-bold">
                  {formatCurrency(table.maxBet)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Players:</span>
                <span className="font-bold">
                  {table.players?.length || 0}/{table.maxPlayers}
                </span>
              </div>
              {gameType === "blackjack" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Blackjack Pays:
                    </span>
                    <span className="font-bold text-gold-400">
                      {table.rules?.blackjackPayout === 1.5 ? "3:2" : "6:5"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Decks:</span>
                    <span className="font-bold">{table.rules?.deckCount}</span>
                  </div>
                </>
              )}
              {gameType === "roulette" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-bold capitalize">{table.type}</span>
                </div>
              )}
              {gameType === "baccarat" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game Number:</span>
                    <span className="font-bold">{table.gameNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission:</span>
                    <span className="font-bold">{table.commission * 100}%</span>
                  </div>
                </>
              )}
              {gameType === "craps" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Point:</span>
                  <span className="font-bold text-green-500">
                    {table.point || "Off"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Players */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Players ({table.players?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(table.players || [])
                .slice(0, 8)
                .map((player: any, index: number) => (
                  <div
                    key={player.id || index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {player.username?.[0] || "P"}
                      </div>
                      <span className="font-medium">
                        {player.username || `Player ${index + 1}`}
                      </span>
                      {player.isVIP && (
                        <Crown className="w-3 h-3 text-gold-500" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatCurrency(player.chipCount || 0)}
                      </div>
                      {player.currentBet > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Bet: {formatCurrency(player.currentBet)}
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
      <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Spade className="w-6 h-6 text-white" />
                </div>
                Table Games
                <Badge className="bg-green-600 text-white">Live Casino</Badge>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Classic casino table games with professional dealers and
                real-time action
              </p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {blackjackTables.length +
                  rouletteTables.length +
                  baccaratTables.length +
                  crapsTables.length}
              </div>
              <div className="text-sm text-muted-foreground">Live Tables</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Game Tabs */}
      <Tabs
        value={activeGameType}
        onValueChange={(value) => setActiveGameType(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="blackjack" className="flex items-center gap-2">
            <Spade className="w-4 h-4" />
            Blackjack
          </TabsTrigger>
          <TabsTrigger value="roulette" className="flex items-center gap-2">
            <CircleDot className="w-4 h-4" />
            Roulette
          </TabsTrigger>
          <TabsTrigger value="baccarat" className="flex items-center gap-2">
            <Diamond className="w-4 h-4" />
            Baccarat
          </TabsTrigger>
          <TabsTrigger value="craps" className="flex items-center gap-2">
            <Dice1 className="w-4 h-4" />
            Craps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blackjack" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blackjackTables.map((table) => (
              <BlackjackTableCard key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roulette" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rouletteTables.map((table) => (
              <RouletteTableCard key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="baccarat" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baccaratTables.map((table) => (
              <BaccaratTableCard key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="craps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crapsTables.map((table) => (
              <CrapsTableCard key={table.id} table={table} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Game Dialog */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTable && getGameIcon(activeGameType)}
              {selectedTable?.name || "Table Game"}
            </DialogTitle>
          </DialogHeader>
          {selectedTable && (
            <GameInterface table={selectedTable} gameType={activeGameType} />
          )}
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Your Table Games Statistics</DialogTitle>
          </DialogHeader>
          {gameStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blackjack Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Spade className="w-5 h-5" />
                    Blackjack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Hands Played</div>
                      <div className="font-bold">
                        {gameStats.blackjack.handsPlayed}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Hands Won</div>
                      <div className="font-bold text-green-500">
                        {gameStats.blackjack.handsWon}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Blackjacks Hit
                      </div>
                      <div className="font-bold text-gold-400">
                        {gameStats.blackjack.blackjacksHit}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Biggest Win</div>
                      <div className="font-bold">
                        {formatCurrency(gameStats.blackjack.biggestWin)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Roulette Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDot className="w-5 h-5" />
                    Roulette
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Spins Played</div>
                      <div className="font-bold">
                        {gameStats.roulette.spinsPlayed}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Favorite Number
                      </div>
                      <div className="font-bold text-red-500">
                        {gameStats.roulette.favoriteNumber}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">
                        Longest Streak
                      </div>
                      <div className="font-bold text-purple-500">
                        {gameStats.roulette.longestStreak}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Biggest Win</div>
                      <div className="font-bold">
                        {formatCurrency(gameStats.roulette.biggestWin)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Baccarat Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Diamond className="w-5 h-5" />
                    Baccarat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Hands Played</div>
                      <div className="font-bold">
                        {gameStats.baccarat.handsPlayed}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Player Wins</div>
                      <div className="font-bold text-blue-500">
                        {gameStats.baccarat.playerWins}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Banker Wins</div>
                      <div className="font-bold text-red-500">
                        {gameStats.baccarat.bankerWins}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Naturals</div>
                      <div className="font-bold text-gold-400">
                        {gameStats.baccarat.naturalCount}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Craps Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dice1 className="w-5 h-5" />
                    Craps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Rolls Played</div>
                      <div className="font-bold">
                        {gameStats.craps.rollsPlayed}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Points Made</div>
                      <div className="font-bold text-green-500">
                        {gameStats.craps.pointsMade}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Longest Roll</div>
                      <div className="font-bold text-purple-500">
                        {gameStats.craps.longestRoll}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Biggest Win</div>
                      <div className="font-bold">
                        {formatCurrency(gameStats.craps.biggestWin)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
