import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Bot,
  MessageCircle,
  Settings,
  Gift,
  BarChart3,
  Server,
  Cpu,
  Database,
  HardDrive,
  Network,
  Play,
  Pause,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Coins,
  Zap,
  Shield,
  Crown,
  Trophy,
  RefreshCw,
  Send,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface VMInstance {
  id: string;
  name: string;
  status: "running" | "stopped" | "paused" | "starting" | "stopping";
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  cost: number;
}

interface BonusOffer {
  id: string;
  title: string;
  description: string;
  value: number;
  type: "coins" | "sweeps" | "multiplier";
  expires: string;
  claimed: boolean;
  requirements?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: "user" | "ai";
  type?: "text" | "bonus" | "vm" | "analytics";
}

interface Analytics {
  totalGamesPlayed: number;
  totalWins: number;
  totalCoinsWon: number;
  totalSweepsWon: number;
  favoriteGame: string;
  winRate: number;
  streakDays: number;
  rankPosition: number;
}

const LuckyAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Welcome to CoinKrazy! I'm LuckyAI, your personal gaming assistant. How can I help you today?",
      timestamp: new Date(),
      sender: "ai",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // VM Management State
  const [vmInstances, setVmInstances] = useState<VMInstance[]>([
    {
      id: "vm-1",
      name: "Gaming Server Alpha",
      status: "running",
      cpu: 65,
      memory: 78,
      disk: 45,
      network: 32,
      uptime: "2d 14h 32m",
      cost: 24.5,
    },
    {
      id: "vm-2",
      name: "Analytics Engine",
      status: "running",
      cpu: 45,
      memory: 56,
      disk: 67,
      network: 28,
      uptime: "1d 8h 15m",
      cost: 18.75,
    },
    {
      id: "vm-3",
      name: "Backup Server",
      status: "paused",
      cpu: 0,
      memory: 0,
      disk: 23,
      network: 0,
      uptime: "0h 0m",
      cost: 0,
    },
  ]);

  // Bonus Management State
  const [bonusOffers, setBonusOffers] = useState<BonusOffer[]>([
    {
      id: "bonus-1",
      title: "Lucky Spin Bonus",
      description: "Get 100 free Gold Coins for your next spin!",
      value: 100,
      type: "coins",
      expires: "2024-12-31",
      claimed: false,
      requirements: "Play any slot game",
    },
    {
      id: "bonus-2",
      title: "Sweeps Multiplier",
      description: "2x multiplier on your next Sweeps Coin win!",
      value: 2,
      type: "multiplier",
      expires: "2024-12-25",
      claimed: false,
      requirements: "Win with Sweeps Coins",
    },
    {
      id: "bonus-3",
      title: "Daily Login Reward",
      description: "Claim your daily 50 Sweeps Coins!",
      value: 50,
      type: "sweeps",
      expires: "2024-12-24",
      claimed: true,
    },
  ]);

  // Analytics State
  const [analytics, setAnalytics] = useState<Analytics>({
    totalGamesPlayed: 1247,
    totalWins: 678,
    totalCoinsWon: 125400,
    totalSweepsWon: 847.5,
    favoriteGame: "CoinKrazy Spinner",
    winRate: 54.4,
    streakDays: 7,
    rankPosition: 342,
  });

  // Settings State
  const [settings, setSettings] = useState({
    autoPlay: false,
    soundEnabled: true,
    notifications: true,
    aiAssistance: true,
    responsiveness: [3],
    gameRecommendations: true,
    bonusAlerts: true,
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      timestamp: new Date(),
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great question! I'd be happy to help you with that. Let me check your account status and game history.",
        "Based on your recent gameplay, I recommend trying the Lucky Scratch Gold game - it has a high RTP and matches your playing style!",
        "I see you have some unclaimed bonuses! Would you like me to help you claim them?",
        "Your win rate is looking fantastic today! You're on a 7-day streak. Keep it up!",
        "I can help you optimize your VM instances for better performance. Would you like me to analyze your current setup?",
      ];

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        sender: "ai",
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleVMAction = (
    vmId: string,
    action: "start" | "stop" | "pause" | "restart",
  ) => {
    setVmInstances((prev) =>
      prev.map((vm) => {
        if (vm.id === vmId) {
          let newStatus = vm.status;
          switch (action) {
            case "start":
              newStatus = vm.status === "stopped" ? "starting" : "running";
              break;
            case "stop":
              newStatus = "stopping";
              break;
            case "pause":
              newStatus = "paused";
              break;
            case "restart":
              newStatus = "starting";
              break;
          }
          return { ...vm, status: newStatus };
        }
        return vm;
      }),
    );

    // Simulate status changes
    setTimeout(() => {
      setVmInstances((prev) =>
        prev.map((vm) => {
          if (vm.id === vmId) {
            switch (action) {
              case "start":
              case "restart":
                return { ...vm, status: "running" as const };
              case "stop":
                return {
                  ...vm,
                  status: "stopped" as const,
                  cpu: 0,
                  memory: 0,
                  network: 0,
                };
              default:
                return vm;
            }
          }
          return vm;
        }),
      );
    }, 2000);
  };

  const claimBonus = (bonusId: string) => {
    setBonusOffers((prev) =>
      prev.map((bonus) =>
        bonus.id === bonusId ? { ...bonus, claimed: true } : bonus,
      ),
    );

    const bonus = bonusOffers.find((b) => b.id === bonusId);
    if (bonus) {
      const bonusMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `🎉 Congratulations! You've claimed the "${bonus.title}" bonus! ${bonus.value} ${bonus.type} have been added to your account.`,
        timestamp: new Date(),
        sender: "ai",
        type: "bonus",
      };
      setMessages((prev) => [...prev, bonusMessage]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-red-500";
      case "paused":
        return "bg-yellow-500";
      case "starting":
      case "stopping":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 rounded-full p-4"
        >
          <Bot className="w-6 h-6 mr-2" />
          LuckyAI
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? "w-80 h-16" : "w-96 h-[600px]"}`}
    >
      <Card className="h-full bg-background/95 backdrop-blur-sm border-purple-500/20 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-lg">LuckyAI Assistant</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full"
            >
              <TabsList className="grid w-full grid-cols-5 bg-muted/50">
                <TabsTrigger value="chat" className="text-xs">
                  <MessageCircle className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="vm" className="text-xs">
                  <Server className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="bonuses" className="text-xs">
                  <Gift className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs">
                  <BarChart3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent
                value="chat"
                className="h-[calc(100%-3rem)] flex flex-col p-4"
              >
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {message.type === "bonus" && (
                          <Gift className="w-4 h-4 inline mr-2" />
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about CoinKrazy..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>

              {/* VM Manager Tab */}
              <TabsContent
                value="vm"
                className="h-[calc(100%-3rem)] overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">VM Instances</h3>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      New VM
                    </Button>
                  </div>

                  {vmInstances.map((vm) => (
                    <Card key={vm.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(vm.status)}`}
                          />
                          <h4 className="font-medium">{vm.name}</h4>
                        </div>
                        <Badge
                          variant={
                            vm.status === "running" ? "default" : "secondary"
                          }
                        >
                          {vm.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="flex items-center space-x-1">
                          <Cpu className="w-4 h-4 text-blue-500" />
                          <span>CPU: {vm.cpu}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="w-4 h-4 text-green-500" />
                          <span>RAM: {vm.memory}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HardDrive className="w-4 h-4 text-orange-500" />
                          <span>Disk: {vm.disk}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Network className="w-4 h-4 text-purple-500" />
                          <span>Net: {vm.network}%</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-3">
                        <p>Uptime: {vm.uptime}</p>
                        <p>Cost: {formatCurrency(vm.cost)}/day</p>
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVMAction(vm.id, "start")}
                          disabled={vm.status === "running"}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVMAction(vm.id, "pause")}
                          disabled={vm.status !== "running"}
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVMAction(vm.id, "stop")}
                          disabled={vm.status === "stopped"}
                        >
                          <Square className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVMAction(vm.id, "restart")}
                          disabled={vm.status !== "running"}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Bonuses Tab */}
              <TabsContent
                value="bonuses"
                className="h-[calc(100%-3rem)] overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Bonuses</h3>

                  {bonusOffers.map((bonus) => (
                    <Card key={bonus.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {bonus.type === "coins" && (
                            <Coins className="w-5 h-5 text-gold-500" />
                          )}
                          {bonus.type === "sweeps" && (
                            <Star className="w-5 h-5 text-purple-500" />
                          )}
                          {bonus.type === "multiplier" && (
                            <Zap className="w-5 h-5 text-orange-500" />
                          )}
                          <h4 className="font-medium">{bonus.title}</h4>
                        </div>
                        <Badge
                          variant={bonus.claimed ? "secondary" : "default"}
                        >
                          {bonus.claimed ? "Claimed" : "Available"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {bonus.description}
                      </p>

                      <div className="text-sm space-y-1 mb-3">
                        <p>
                          <span className="font-medium">Value:</span>{" "}
                          {bonus.value}{" "}
                          {bonus.type === "multiplier" ? "x" : bonus.type}
                        </p>
                        <p>
                          <span className="font-medium">Expires:</span>{" "}
                          {bonus.expires}
                        </p>
                        {bonus.requirements && (
                          <p>
                            <span className="font-medium">Requirements:</span>{" "}
                            {bonus.requirements}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => claimBonus(bonus.id)}
                        disabled={bonus.claimed}
                        className="w-full"
                      >
                        {bonus.claimed ? "Already Claimed" : "Claim Bonus"}
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent
                value="analytics"
                className="h-[calc(100%-3rem)] overflow-y-auto p-4"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Gaming Analytics</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          Games Played
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {analytics.totalGamesPlayed.toLocaleString()}
                      </p>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Trophy className="w-4 h-4 text-gold-500" />
                        <span className="text-sm font-medium">Total Wins</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {analytics.totalWins.toLocaleString()}
                      </p>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Coins className="w-4 h-4 text-gold-500" />
                        <span className="text-sm font-medium">Coins Won</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {analytics.totalCoinsWon.toLocaleString()}
                      </p>
                    </Card>

                    <Card className="p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Star className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Sweeps Won</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {analytics.totalSweepsWon.toFixed(2)}
                      </p>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Win Rate</span>
                          <span>{analytics.winRate}%</span>
                        </div>
                        <Progress value={analytics.winRate} className="h-2" />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Favorite Game:</span>
                        <span className="font-medium">
                          {analytics.favoriteGame}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Current Streak:</span>
                        <span className="font-medium">
                          {analytics.streakDays} days
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Leaderboard Rank:</span>
                        <span className="font-medium">
                          #{analytics.rankPosition}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent
                value="settings"
                className="h-[calc(100%-3rem)] overflow-y-auto p-4"
              >
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    AI Assistant Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Auto-Play Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Let AI play games automatically
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoPlay}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            autoPlay: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sound Enabled</p>
                        <p className="text-sm text-muted-foreground">
                          Play notification sounds
                        </p>
                      </div>
                      <Switch
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            soundEnabled: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive bonus and win alerts
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            notifications: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">AI Assistance</p>
                        <p className="text-sm text-muted-foreground">
                          Get game recommendations
                        </p>
                      </div>
                      <Switch
                        checked={settings.aiAssistance}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            aiAssistance: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Game Recommendations</p>
                        <p className="text-sm text-muted-foreground">
                          Show personalized game suggestions
                        </p>
                      </div>
                      <Switch
                        checked={settings.gameRecommendations}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            gameRecommendations: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bonus Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Alert when bonuses are available
                        </p>
                      </div>
                      <Switch
                        checked={settings.bonusAlerts}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            bonusAlerts: checked,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <p className="font-medium mb-2">AI Responsiveness</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        How quickly AI responds to events
                      </p>
                      <Slider
                        value={settings.responsiveness}
                        onValueChange={(value) =>
                          setSettings((prev) => ({
                            ...prev,
                            responsiveness: value,
                          }))
                        }
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default LuckyAI;
