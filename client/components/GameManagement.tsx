import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Gamepad2,
  Copy,
  Edit,
  Trash2,
  Play,
  Pause,
  Settings,
  Eye,
  Check,
  X,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Crown,
  Zap,
  Bot,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Download,
  Upload,
  Globe,
  Shield,
  Award,
  Target,
  BarChart3,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  Gem,
  Coins,
  Heart,
  MessageSquare,
  Send,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface GameTemplate {
  id: string;
  name: string;
  provider: string;
  originalName: string;
  category: string;
  theme: string;
  rtp: number;
  volatility: "low" | "medium" | "high";
  minBet: number;
  maxBet: number;
  paylines: number;
  features: string[];
  status: "pending" | "in_review" | "approved" | "rejected" | "live";
  lastModified: Date;
  clonedBy: string;
  adminNotes: string[];
  brandingApplied: boolean;
  complianceUpdated: boolean;
  customizations: {
    buttonText: string;
    gameTitle: string;
    description: string;
    symbolChanges: string[];
    uiChanges: string[];
  };
}

interface SlotsAITask {
  id: string;
  type: "clone" | "modify" | "rebrand";
  gameId: string;
  instructions: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  result?: GameTemplate;
  error?: string;
}

export default function GameManagement() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameTemplate[]>([]);
  const [aiTasks, setAITasks] = useState<SlotsAITask[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameTemplate | null>(null);
  const [editingGame, setEditingGame] = useState<GameTemplate | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [selectedProviderGame, setSelectedProviderGame] = useState("");
  const [aiInstructions, setAIInstructions] = useState("");
  const [adminNoteText, setAdminNoteText] = useState("");
  const [dailyConversions, setDailyConversions] = useState(2);
  const [activeTab, setActiveTab] = useState("games");

  // Mock provider games for cloning
  const providerGames = [
    { id: "pg_sweet_bonanza", name: "Sweet Bonanza", provider: "Pragmatic Play" },
    { id: "pg_gates_olympus", name: "Gates of Olympus", provider: "Pragmatic Play" },
    { id: "ne_starburst", name: "Starburst", provider: "NetEnt" },
    { id: "ne_gonzo_quest", name: "Gonzo's Quest", provider: "NetEnt" },
    { id: "pgo_book_dead", name: "Book of Dead", provider: "Play'n GO" },
    { id: "pgo_reactoonz", name: "Reactoonz", provider: "Play'n GO" },
  ];

  useEffect(() => {
    loadGameTemplates();
    loadAITasks();
    
    // Start AI processing simulation
    const aiInterval = setInterval(() => {
      processAITasks();
      if (Math.random() < 0.3) { // 30% chance every 5 seconds
        generateNewConversion();
      }
    }, 5000);

    return () => clearInterval(aiInterval);
  }, []);

  const loadGameTemplates = () => {
    // Mock game templates
    const mockGames: GameTemplate[] = [
      {
        id: "ck_001",
        name: "CoinKrazy.com Exclusive Golden Rush",
        provider: "CoinKrazy",
        originalName: "Sweet Bonanza",
        category: "slots",
        theme: "Fruit/Candy",
        rtp: 96.8,
        volatility: "high",
        minBet: 0.20,
        maxBet: 100,
        paylines: 25,
        features: ["Free Spins", "Multipliers", "Tumbling Reels"],
        status: "approved",
        lastModified: new Date(Date.now() - 86400000),
        clonedBy: "SlotsAI",
        adminNotes: ["Initial clone approved", "Branding applied successfully"],
        brandingApplied: true,
        complianceUpdated: true,
        customizations: {
          buttonText: "Spin",
          gameTitle: "CoinKrazy.com Exclusive Golden Rush",
          description: "Experience the golden rush with CoinKrazy's exclusive slot!",
          symbolChanges: ["Replaced provider logo with CoinKrazy logo", "Updated paytable colors"],
          uiChanges: ["CoinKrazy themed buttons", "Custom background gradient"]
        }
      },
      {
        id: "ck_002",
        name: "CoinKrazy.com Exclusive Lightning Strike",
        provider: "CoinKrazy",
        originalName: "Gates of Olympus",
        category: "slots",
        theme: "Greek Mythology",
        rtp: 97.2,
        volatility: "high",
        minBet: 0.10,
        maxBet: 50,
        paylines: 20,
        features: ["Wild Symbols", "Scatter Pays", "Free Games"],
        status: "in_review",
        lastModified: new Date(Date.now() - 3600000),
        clonedBy: "SlotsAI",
        adminNotes: ["Needs compliance review for bet button text"],
        brandingApplied: true,
        complianceUpdated: false,
        customizations: {
          buttonText: "Place Bet",
          gameTitle: "CoinKrazy.com Exclusive Lightning Strike",
          description: "Harness the power of Zeus with CoinKrazy's exclusive slot!",
          symbolChanges: ["Added CoinKrazy coin symbols", "Updated god symbols"],
          uiChanges: ["CoinKrazy color scheme", "Custom lightning effects"]
        }
      },
      {
        id: "ck_003",
        name: "CoinKrazy.com Exclusive Diamond Dreams",
        provider: "CoinKrazy",
        originalName: "Starburst",
        category: "slots",
        theme: "Gems/Space",
        rtp: 96.5,
        volatility: "low",
        minBet: 0.01,
        maxBet: 25,
        paylines: 10,
        features: ["Expanding Wilds", "Re-spins", "Both Ways Pays"],
        status: "pending",
        lastModified: new Date(Date.now() - 1800000),
        clonedBy: "SlotsAI",
        adminNotes: [],
        brandingApplied: false,
        complianceUpdated: false,
        customizations: {
          buttonText: "Bet",
          gameTitle: "CoinKrazy.com Exclusive Diamond Dreams",
          description: "Reach for the stars with CoinKrazy's diamond slot!",
          symbolChanges: ["Pending customization"],
          uiChanges: ["Pending customization"]
        }
      }
    ];

    setGames(mockGames);
  };

  const loadAITasks = () => {
    // Mock AI tasks
    const mockTasks: SlotsAITask[] = [
      {
        id: "task_001",
        type: "clone",
        gameId: "pg_sweet_bonanza",
        instructions: "Clone Sweet Bonanza with CoinKrazy branding. Change 'Bet' button to 'Spin'. Update colors to gold theme.",
        status: "processing",
        progress: 75,
        startTime: new Date(Date.now() - 1800000),
        estimatedCompletion: new Date(Date.now() + 600000)
      },
      {
        id: "task_002",
        type: "modify",
        gameId: "ck_002",
        instructions: "Update button text from 'Place Bet' to 'Spin' for compliance. Admin requested changes.",
        status: "queued",
        progress: 0,
        startTime: new Date(Date.now() - 300000)
      }
    ];

    setAITasks(mockTasks);
  };

  const processAITasks = () => {
    setAITasks(prev => prev.map(task => {
      if (task.status === "processing" && task.progress < 100) {
        const newProgress = Math.min(100, task.progress + Math.random() * 15);
        
        if (newProgress >= 100) {
          // Task completed
          return {
            ...task,
            status: "completed",
            progress: 100
          };
        }
        
        return {
          ...task,
          progress: newProgress
        };
      }
      
      return task;
    }));
  };

  const generateNewConversion = () => {
    if (Math.random() < 0.5 && aiTasks.filter(t => t.status === "completed").length < dailyConversions) {
      const randomGame = providerGames[Math.floor(Math.random() * providerGames.length)];
      const newTask: SlotsAITask = {
        id: `task_${Date.now()}`,
        type: "clone",
        gameId: randomGame.id,
        instructions: `Auto-clone ${randomGame.name} with CoinKrazy branding. Daily conversion batch.`,
        status: "processing",
        progress: 0,
        startTime: new Date()
      };
      
      setAITasks(prev => [newTask, ...prev]);
    }
  };

  const initiateClone = async () => {
    if (!selectedProviderGame || !aiInstructions) return;

    const newTask: SlotsAITask = {
      id: `task_${Date.now()}`,
      type: "clone",
      gameId: selectedProviderGame,
      instructions: aiInstructions,
      status: "queued",
      progress: 0,
      startTime: new Date()
    };

    setAITasks(prev => [newTask, ...prev]);
    setShowCloneDialog(false);
    setSelectedProviderGame("");
    setAIInstructions("");

    // Simulate AI processing
    setTimeout(() => {
      setAITasks(prev => prev.map(task => 
        task.id === newTask.id ? { ...task, status: "processing" } : task
      ));
    }, 2000);
  };

  const approveGame = (gameId: string) => {
    setGames(prev => prev.map(game => 
      game.id === gameId 
        ? { 
            ...game, 
            status: "approved",
            adminNotes: [...game.adminNotes, `Approved by ${user?.email} on ${new Date().toLocaleString()}`]
          }
        : game
    ));
  };

  const rejectGame = (gameId: string, reason: string) => {
    setGames(prev => prev.map(game => 
      game.id === gameId 
        ? { 
            ...game, 
            status: "rejected",
            adminNotes: [...game.adminNotes, `Rejected by ${user?.email}: ${reason}`]
          }
        : game
    ));
  };

  const addAdminNote = (gameId: string) => {
    if (!adminNoteText.trim()) return;

    setGames(prev => prev.map(game => 
      game.id === gameId 
        ? { 
            ...game,
            adminNotes: [...game.adminNotes, `${user?.email}: ${adminNoteText}`]
          }
        : game
    ));

    setAdminNoteText("");
  };

  const sendBackToAI = (gameId: string, modifications: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const newTask: SlotsAITask = {
      id: `task_${Date.now()}`,
      type: "modify",
      gameId,
      instructions: modifications,
      status: "queued",
      progress: 0,
      startTime: new Date()
    };

    setAITasks(prev => [newTask, ...prev]);
    
    // Update game status
    setGames(prev => prev.map(g => 
      g.id === gameId 
        ? { 
            ...g, 
            status: "pending",
            adminNotes: [...g.adminNotes, `Sent back to SlotsAI for modifications: ${modifications}`]
          }
        : g
    ));
  };

  const filteredGames = games.filter(game => {
    const matchesStatus = filterStatus === "all" || game.status === filterStatus;
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "in_review": return "bg-yellow-500";
      case "pending": return "bg-blue-500";
      case "live": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500";
      case "processing": return "text-blue-500";
      case "queued": return "text-yellow-500";
      case "failed": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                Game Management Console
                <Badge className="bg-purple-600 text-white">Admin Only</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Manage game cloning, branding, and compliance with SlotsAI integration
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {games.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Games</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {games.filter(g => g.status === "approved").length}
                </div>
                <div className="text-sm text-muted-foreground">Approved</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {aiTasks.filter(t => t.status === "processing").length}
                </div>
                <div className="text-sm text-muted-foreground">AI Processing</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="games">Game Library</TabsTrigger>
          <TabsTrigger value="ai">SlotsAI Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog open={showCloneDialog} onOpenChange={setShowCloneDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-500 to-indigo-600">
                        <Bot className="w-4 h-4 mr-2" />
                        Clone Game
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Clone Provider Game</DialogTitle>
                        <DialogDescription>
                          Use SlotsAI to clone and rebrand a provider game
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Select Provider Game</label>
                          <Select value={selectedProviderGame} onValueChange={setSelectedProviderGame}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a game to clone" />
                            </SelectTrigger>
                            <SelectContent>
                              {providerGames.map(game => (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.name} ({game.provider})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">AI Instructions</label>
                          <Textarea
                            placeholder="Provide detailed instructions for SlotsAI..."
                            value={aiInstructions}
                            onChange={(e) => setAIInstructions(e.target.value)}
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Include branding requirements, button text changes, compliance needs, etc.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={initiateClone} className="flex-1">
                            <Bot className="w-4 h-4 mr-2" />
                            Start Cloning
                          </Button>
                          <Button variant="outline" onClick={() => setShowCloneDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Games Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGames.map(game => (
              <Card key={game.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{game.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Based on: {game.originalName}
                      </p>
                    </div>
                    <Badge className={cn("text-white", getStatusColor(game.status))}>
                      {game.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>RTP:</span>
                      <span className="font-bold text-green-500">{game.rtp}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volatility:</span>
                      <span className={cn("font-bold capitalize",
                        game.volatility === "low" ? "text-green-500" :
                        game.volatility === "medium" ? "text-yellow-500" : "text-red-500"
                      )}>
                        {game.volatility}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lines:</span>
                      <span className="font-bold">{game.paylines}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max Bet:</span>
                      <span className="font-bold">{game.maxBet}</span>
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
                        +{game.features.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {game.brandingApplied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs">Branding</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {game.complianceUpdated ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="text-xs">Compliance</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{game.name}</DialogTitle>
                          <DialogDescription>
                            Game details and customization information
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold mb-3">Game Information</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Original Name:</span>
                                <span className="font-medium">{game.originalName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Provider:</span>
                                <span className="font-medium">{game.provider}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Theme:</span>
                                <span className="font-medium">{game.theme}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Button Text:</span>
                                <span className="font-medium">{game.customizations.buttonText}</span>
                              </div>
                            </div>

                            <h3 className="font-bold mb-3 mt-6">Customizations</h3>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm">Symbol Changes</h4>
                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                  {game.customizations.symbolChanges.map((change, index) => (
                                    <li key={index}>{change}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm">UI Changes</h4>
                                <ul className="text-xs text-muted-foreground list-disc list-inside">
                                  {game.customizations.uiChanges.map((change, index) => (
                                    <li key={index}>{change}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-bold mb-3">Admin Notes</h3>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {game.adminNotes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No notes yet</p>
                              ) : (
                                game.adminNotes.map((note, index) => (
                                  <div key={index} className="p-2 bg-muted rounded text-xs">
                                    {note}
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add admin note..."
                                  value={adminNoteText}
                                  onChange={(e) => setAdminNoteText(e.target.value)}
                                  className="flex-1"
                                />
                                <Button size="sm" onClick={() => addAdminNote(game.id)}>
                                  <Send className="w-3 h-3" />
                                </Button>
                              </div>

                              <div className="flex gap-2">
                                {game.status === "pending" || game.status === "in_review" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      className="flex-1 bg-green-500 hover:bg-green-600"
                                      onClick={() => approveGame(game.id)}
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Approve
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="destructive" className="flex-1">
                                          <X className="w-3 h-3 mr-1" />
                                          Reject
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Reject Game</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to reject this game? Please provide a reason.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => rejectGame(game.id, "Admin rejection")}>
                                            Reject
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => sendBackToAI(game.id, "Update button text for compliance")}
                                  >
                                    <Bot className="w-3 h-3 mr-1" />
                                    Send to AI
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {game.status === "approved" && (
                      <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                        <Play className="w-3 h-3 mr-1" />
                        Deploy
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Tasks Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                SlotsAI Task Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiTasks.map(task => (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge className={cn("capitalize", getTaskStatusColor(task.status))}>
                          {task.status}
                        </Badge>
                        <span className="font-medium">{task.type}</span>
                        <span className="text-sm text-muted-foreground">
                          {providerGames.find(g => g.id === task.gameId)?.name || task.gameId}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {task.startTime.toLocaleTimeString()}
                      </div>
                    </div>

                    <p className="text-sm mb-3">{task.instructions}</p>

                    {task.status === "processing" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(task.progress)}%</span>
                        </div>
                        <Progress value={task.progress} className="h-2" />
                        {task.estimatedCompletion && (
                          <p className="text-xs text-muted-foreground">
                            ETA: {task.estimatedCompletion.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    )}

                    {task.status === "completed" && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Task Completed</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Game has been processed and is ready for admin review.
                        </p>
                      </div>
                    )}

                    {task.error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">Error</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{task.error}</p>
                      </div>
                    )}
                  </Card>
                ))}

                {aiTasks.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Tasks</h3>
                    <p className="text-muted-foreground">
                      SlotsAI is ready to process your game cloning requests.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">{dailyConversions}</div>
                <div className="text-sm text-muted-foreground">Daily Conversions</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Minimum per day
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {aiTasks.filter(t => t.status === "completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Completed Today</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Auto conversions active
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {Math.round((aiTasks.filter(t => t.status === "completed").length / Math.max(dailyConversions, 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Daily Target</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Conversion progress
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {games.filter(g => g.status === "live").length}
                </div>
                <div className="text-sm text-muted-foreground">Live Games</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {Math.round((games.filter(g => g.brandingApplied).length / games.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Branded Games</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {Math.round((games.filter(g => g.complianceUpdated).length / games.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Compliant Games</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {games.filter(g => g.status === "pending" || g.status === "in_review").length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Game Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["pending", "in_review", "approved", "rejected", "live"].map(status => {
                  const count = games.filter(g => g.status === status).length;
                  const percentage = (count / games.length) * 100;
                  
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-20 text-sm capitalize">{status}</div>
                      <Progress value={percentage} className="flex-1" />
                      <div className="w-16 text-sm text-right">{count} games</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
