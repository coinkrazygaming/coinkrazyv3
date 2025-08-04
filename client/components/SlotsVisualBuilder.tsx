import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Play,
  Save,
  Eye,
  Settings,
  Palette,
  Coins,
  Trophy,
  Zap,
  Star,
  Crown,
  Diamond,
  Heart,
  Clover,
  Plus,
  Trash2,
  Copy,
  Upload,
  Download,
  Sparkles,
  Wand2,
  BrainCircuit,
  BarChart3,
  Target,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Grid3X3,
  RotateCcw,
  Shuffle,
  Volume2,
  Image,
  Music,
  Gamepad2,
  MousePointer,
  Layers,
  Move,
  Resize,
  PaintBucket,
  FileImage,
  Film,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

interface SlotSymbol {
  id: string;
  name: string;
  icon: string;
  color: string;
  payout: number;
  frequency: number;
  isWild: boolean;
  isScatter: boolean;
  isBonus: boolean;
  image?: string;
  animationType: "static" | "glow" | "bounce" | "sparkle" | "rotate";
}

interface Payline {
  id: string;
  pattern: number[][];
  payout: number;
  name: string;
  color: string;
  active: boolean;
}

interface SlotMachine {
  id: string;
  name: string;
  theme: string;
  reels: number;
  rows: number;
  paylines: Payline[];
  symbols: SlotSymbol[];
  rtpTarget: number;
  rtpActual: number;
  minBet: number;
  maxBet: number;
  jackpotType: "fixed" | "progressive" | "daily";
  jackpotAmount: number;
  bonusFeatures: string[];
  soundTheme: string;
  backgroundImage: string;
  animations: boolean;
  status: "draft" | "testing" | "live" | "paused";
  aiOptimized: boolean;
  performance: {
    totalSpins: number;
    totalWins: number;
    biggestWin: number;
    averageSession: number;
    playerRetention: number;
    revenueDaily: number;
  };
  createdAt: string;
  lastModified: string;
}

interface JoseyAISuggestion {
  type: "rtp" | "symbol" | "payline" | "theme" | "feature";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  implementation: string;
  estimatedRevenue: number;
}

export default function SlotsVisualBuilder() {
  const [currentMachine, setCurrentMachine] = useState<SlotMachine | null>(null);
  const [machines, setMachines] = useState<SlotMachine[]>([]);
  const [activeTab, setActiveTab] = useState("design");
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedSymbol, setSelectedSymbol] = useState<SlotSymbol | null>(null);
  const [selectedPayline, setSelectedPayline] = useState<Payline | null>(null);
  const [joseyAISuggestions, setJoseyAISuggestions] = useState<JoseyAISuggestion[]>([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [showJoseyAI, setShowJoseyAI] = useState(true);

  useEffect(() => {
    loadSlotMachines();
    loadJoseyAISuggestions();
  }, []);

  const loadSlotMachines = async () => {
    // In production: const response = await fetch('/api/admin/slots');
    const mockMachines: SlotMachine[] = [
      {
        id: "slot_001",
        name: "CoinKrazy Spinner",
        theme: "Classic Gold",
        reels: 5,
        rows: 3,
        paylines: generateDefaultPaylines(),
        symbols: generateDefaultSymbols(),
        rtpTarget: 96.8,
        rtpActual: 96.75,
        minBet: 0.01,
        maxBet: 100.0,
        jackpotType: "progressive",
        jackpotAmount: 125847.92,
        bonusFeatures: ["Free Spins", "Wild Multiplier", "Scatter Bonus"],
        soundTheme: "casino-classic",
        backgroundImage: "/images/slots/gold-theme.jpg",
        animations: true,
        status: "live",
        aiOptimized: true,
        performance: {
          totalSpins: 156789,
          totalWins: 47823,
          biggestWin: 12500.0,
          averageSession: 45.3,
          playerRetention: 78.5,
          revenueDaily: 3456.78,
        },
        createdAt: "2024-01-15T10:00:00Z",
        lastModified: "2024-03-20T16:30:00Z",
      },
      {
        id: "slot_002",
        name: "Lucky Josey Duck",
        theme: "Duck Adventure",
        reels: 5,
        rows: 4,
        paylines: [],
        symbols: [],
        rtpTarget: 97.2,
        rtpActual: 0,
        minBet: 0.05,
        maxBet: 200.0,
        jackpotType: "daily",
        jackpotAmount: 5000.0,
        bonusFeatures: ["Duck Hunt Bonus", "Pond Multiplier"],
        soundTheme: "nature-adventure",
        backgroundImage: "/images/slots/duck-theme.jpg",
        animations: true,
        status: "draft",
        aiOptimized: false,
        performance: {
          totalSpins: 0,
          totalWins: 0,
          biggestWin: 0,
          averageSession: 0,
          playerRetention: 0,
          revenueDaily: 0,
        },
        createdAt: "2024-03-20T14:00:00Z",
        lastModified: "2024-03-20T14:00:00Z",
      },
    ];

    setMachines(mockMachines);
    if (mockMachines.length > 0) {
      setCurrentMachine(mockMachines[0]);
    }
  };

  const loadJoseyAISuggestions = async () => {
    setIsAIAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockSuggestions: JoseyAISuggestion[] = [
      {
        type: "rtp",
        priority: "high",
        title: "RTP Optimization Opportunity",
        description: "Current RTP of 96.75% is slightly below target. Adjusting symbol frequencies could improve player retention.",
        impact: "+2.3% player retention, +15% session length",
        confidence: 92,
        implementation: "Increase wild symbol frequency by 8% and adjust low-value symbol frequencies",
        estimatedRevenue: 456.78,
      },
      {
        type: "symbol",
        priority: "medium",
        title: "Add Trending Symbol",
        description: "Players are responding well to gem-themed symbols across the platform. Consider adding diamond symbols.",
        impact: "+5% player engagement",
        confidence: 78,
        implementation: "Replace club symbol with animated diamond symbol",
        estimatedRevenue: 234.50,
      },
      {
        type: "feature",
        priority: "high",
        title: "Free Spins Enhancement",
        description: "Data shows players prefer cascading wins during free spins. This feature could increase engagement significantly.",
        impact: "+12% free spins trigger rate, +8% overall engagement",
        confidence: 89,
        implementation: "Add cascading reels feature to free spins bonus",
        estimatedRevenue: 789.12,
      },
      {
        type: "theme",
        priority: "low",
        title: "Seasonal Theme Variant",
        description: "Holiday-themed variants typically see 20% higher engagement during seasonal periods.",
        impact: "+20% seasonal engagement",
        confidence: 65,
        implementation: "Create Christmas variant with holiday symbols and music",
        estimatedRevenue: 1200.00,
      },
    ];

    setJoseyAISuggestions(mockSuggestions);
    setIsAIAnalyzing(false);
  };

  const generateDefaultPaylines = (): Payline[] => {
    return [
      {
        id: "payline_1",
        pattern: [[1, 1, 1, 1, 1]],
        payout: 1,
        name: "Line 1 (Center)",
        color: "#ff0000",
        active: true,
      },
      {
        id: "payline_2", 
        pattern: [[0, 0, 0, 0, 0]],
        payout: 1,
        name: "Line 2 (Top)",
        color: "#00ff00",
        active: true,
      },
      {
        id: "payline_3",
        pattern: [[2, 2, 2, 2, 2]],
        payout: 1,
        name: "Line 3 (Bottom)",
        color: "#0000ff",
        active: true,
      },
      // Add more complex paylines...
    ];
  };

  const generateDefaultSymbols = (): SlotSymbol[] => {
    return [
      {
        id: "wild",
        name: "Wild Gold Coin",
        icon: "🪙",
        color: "#FFD700",
        payout: 1000,
        frequency: 3,
        isWild: true,
        isScatter: false,
        isBonus: false,
        animationType: "sparkle",
      },
      {
        id: "scatter",
        name: "Scatter Star",
        icon: "⭐",
        color: "#FF6B6B",
        payout: 500,
        frequency: 5,
        isWild: false,
        isScatter: true,
        isBonus: false,
        animationType: "glow",
      },
      {
        id: "diamond",
        name: "Diamond",
        icon: "💎",
        color: "#4ECDC4",
        payout: 200,
        frequency: 10,
        isWild: false,
        isScatter: false,
        isBonus: false,
        animationType: "sparkle",
      },
      {
        id: "crown",
        name: "Crown",
        icon: "👑",
        color: "#FFE66D",
        payout: 150,
        frequency: 15,
        isWild: false,
        isScatter: false,
        isBonus: false,
        animationType: "bounce",
      },
      {
        id: "heart",
        name: "Heart",
        icon: "❤️",
        color: "#FF6B9D",
        payout: 100,
        frequency: 20,
        isWild: false,
        isScatter: false,
        isBonus: false,
        animationType: "glow",
      },
      {
        id: "clover",
        name: "Four Leaf Clover",
        icon: "🍀",
        color: "#95E1D3",
        payout: 75,
        frequency: 25,
        isWild: false,
        isScatter: false,
        isBonus: false,
        animationType: "static",
      },
    ];
  };

  const createNewMachine = () => {
    const newMachine: SlotMachine = {
      id: `slot_${Date.now()}`,
      name: "New Slot Machine",
      theme: "Classic",
      reels: 5,
      rows: 3,
      paylines: generateDefaultPaylines(),
      symbols: generateDefaultSymbols(),
      rtpTarget: 96.5,
      rtpActual: 0,
      minBet: 0.01,
      maxBet: 100.0,
      jackpotType: "fixed",
      jackpotAmount: 10000,
      bonusFeatures: [],
      soundTheme: "casino-classic",
      backgroundImage: "",
      animations: true,
      status: "draft",
      aiOptimized: false,
      performance: {
        totalSpins: 0,
        totalWins: 0,
        biggestWin: 0,
        averageSession: 0,
        playerRetention: 0,
        revenueDaily: 0,
      },
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    setMachines(prev => [newMachine, ...prev]);
    setCurrentMachine(newMachine);
  };

  const saveMachine = async () => {
    if (!currentMachine) return;

    try {
      // In production: await fetch('/api/admin/slots', { method: 'POST', ... });
      const updatedMachine = {
        ...currentMachine,
        lastModified: new Date().toISOString(),
      };

      setMachines(prev => 
        prev.map(m => m.id === updatedMachine.id ? updatedMachine : m)
      );
      
      setCurrentMachine(updatedMachine);
      
      // Show success notification
      console.log("Slot machine saved successfully");
    } catch (error) {
      console.error("Error saving slot machine:", error);
    }
  };

  const testMachine = async () => {
    if (!currentMachine) return;

    // Simulate slot spin for testing
    const results = [];
    for (let i = 0; i < 1000; i++) {
      // Simulate spin logic
      results.push({
        spin: i + 1,
        result: Math.random() > 0.7 ? "win" : "loss",
        payout: Math.random() > 0.7 ? Math.random() * 100 : 0,
      });
    }

    const wins = results.filter(r => r.result === "win");
    const totalPayout = results.reduce((sum, r) => sum + r.payout, 0);
    const actualRTP = (totalPayout / (1000 * currentMachine.minBet)) * 100;

    setCurrentMachine(prev => prev ? {
      ...prev,
      rtpActual: parseFloat(actualRTP.toFixed(2)),
      performance: {
        ...prev.performance,
        totalSpins: prev.performance.totalSpins + 1000,
        totalWins: prev.performance.totalWins + wins.length,
      }
    } : null);

    console.log(`Test completed: ${wins.length} wins out of 1000 spins, RTP: ${actualRTP.toFixed(2)}%`);
  };

  const addSymbol = () => {
    if (!currentMachine) return;

    const newSymbol: SlotSymbol = {
      id: `symbol_${Date.now()}`,
      name: "New Symbol",
      icon: "⚡",
      color: "#9B59B6",
      payout: 50,
      frequency: 20,
      isWild: false,
      isScatter: false,
      isBonus: false,
      animationType: "static",
    };

    setCurrentMachine(prev => prev ? {
      ...prev,
      symbols: [...prev.symbols, newSymbol],
    } : null);
  };

  const updateSymbol = (symbolId: string, updates: Partial<SlotSymbol>) => {
    if (!currentMachine) return;

    setCurrentMachine(prev => prev ? {
      ...prev,
      symbols: prev.symbols.map(s => 
        s.id === symbolId ? { ...s, ...updates } : s
      ),
    } : null);
  };

  const deleteSymbol = (symbolId: string) => {
    if (!currentMachine) return;

    setCurrentMachine(prev => prev ? {
      ...prev,
      symbols: prev.symbols.filter(s => s.id !== symbolId),
    } : null);
  };

  const applySuggestion = async (suggestion: JoseyAISuggestion) => {
    if (!currentMachine) return;

    // Simulate applying AI suggestion
    switch (suggestion.type) {
      case "rtp":
        setCurrentMachine(prev => prev ? {
          ...prev,
          rtpTarget: prev.rtpTarget + 0.05,
          aiOptimized: true,
        } : null);
        break;
      case "symbol":
        addSymbol();
        break;
      case "feature":
        setCurrentMachine(prev => prev ? {
          ...prev,
          bonusFeatures: [...prev.bonusFeatures, "Cascading Reels"],
        } : null);
        break;
    }

    // Remove applied suggestion
    setJoseyAISuggestions(prev => prev.filter(s => s !== suggestion));
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile": return "375px";
      case "tablet": return "768px";
      default: return "100%";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!currentMachine) {
    return (
      <div className="text-center py-12">
        <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Slot Machine Selected</h3>
        <p className="text-muted-foreground mb-6">
          Create a new slot machine or select an existing one to get started.
        </p>
        <Button onClick={createNewMachine} className="bg-gold-500 hover:bg-gold-600 text-black">
          <Plus className="w-4 h-4 mr-2" />
          Create New Slot Machine
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                Slots Visual Builder
                <Badge className="bg-purple-500 text-white">with JoseyAI</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Design and optimize slot machines with AI-powered suggestions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={currentMachine.id} onValueChange={(value) => {
                const machine = machines.find(m => m.id === value);
                if (machine) setCurrentMachine(machine);
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {machines.map(machine => (
                    <SelectItem key={machine.id} value={machine.id}>
                      {machine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={createNewMachine}>
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* JoseyAI Suggestions Panel */}
        {showJoseyAI && (
          <Card className="lg:col-span-1 bg-gradient-to-br from-pink-500/5 to-purple-500/5 border-pink-500/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="w-5 h-5 text-pink-500" />
                  JoseyAI Suggestions
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowJoseyAI(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAIAnalyzing ? (
                <div className="text-center py-6">
                  <BrainCircuit className="w-8 h-8 text-pink-500 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-muted-foreground">Analyzing performance...</p>
                </div>
              ) : (
                joseyAISuggestions.map((suggestion, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(suggestion.priority)}`} />
                        <span className="font-medium text-sm">{suggestion.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {suggestion.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {suggestion.description}
                    </p>
                    <div className="text-xs space-y-1 mb-3">
                      <div className="text-green-600 font-medium">
                        Impact: {suggestion.impact}
                      </div>
                      <div className="text-purple-600 font-medium">
                        Revenue: +{formatCurrency(suggestion.estimatedRevenue)}/day
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-xs"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        <Wand2 className="w-3 h-3 mr-1" />
                        Apply
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <Info className="w-3 h-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
              
              <Button 
                onClick={loadJoseyAISuggestions}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh AI Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Builder Area */}
        <div className={showJoseyAI ? "lg:col-span-3" : "lg:col-span-4"}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="design">
                <Palette className="w-4 h-4 mr-2" />
                Design
              </TabsTrigger>
              <TabsTrigger value="symbols">
                <Coins className="w-4 h-4 mr-2" />
                Symbols
              </TabsTrigger>
              <TabsTrigger value="paylines">
                <Grid3X3 className="w-4 h-4 mr-2" />
                Paylines
              </TabsTrigger>
              <TabsTrigger value="features">
                <Zap className="w-4 h-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Design Tab */}
            <TabsContent value="design" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Machine Name</label>
                      <Input 
                        value={currentMachine.name}
                        onChange={(e) => setCurrentMachine(prev => prev ? {
                          ...prev,
                          name: e.target.value
                        } : null)}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Theme</label>
                      <Select value={currentMachine.theme} onValueChange={(value) => 
                        setCurrentMachine(prev => prev ? { ...prev, theme: value } : null)
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Classic Gold">Classic Gold</SelectItem>
                          <SelectItem value="Duck Adventure">Duck Adventure</SelectItem>
                          <SelectItem value="Space Quest">Space Quest</SelectItem>
                          <SelectItem value="Ancient Egypt">Ancient Egypt</SelectItem>
                          <SelectItem value="Wild West">Wild West</SelectItem>
                          <SelectItem value="Ocean Depths">Ocean Depths</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Reels</label>
                        <Input 
                          type="number" 
                          min="3" 
                          max="7" 
                          value={currentMachine.reels}
                          onChange={(e) => setCurrentMachine(prev => prev ? {
                            ...prev,
                            reels: parseInt(e.target.value) || 5
                          } : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rows</label>
                        <Input 
                          type="number" 
                          min="3" 
                          max="6" 
                          value={currentMachine.rows}
                          onChange={(e) => setCurrentMachine(prev => prev ? {
                            ...prev,
                            rows: parseInt(e.target.value) || 3
                          } : null)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Background Image URL</label>
                      <div className="flex gap-2">
                        <Input 
                          value={currentMachine.backgroundImage}
                          onChange={(e) => setCurrentMachine(prev => prev ? {
                            ...prev,
                            backgroundImage: e.target.value
                          } : null)}
                          placeholder="https://..."
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Game Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Target RTP (%)</label>
                      <div className="flex items-center gap-4">
                        <Slider
                          value={[currentMachine.rtpTarget]}
                          onValueChange={([value]) => setCurrentMachine(prev => prev ? {
                            ...prev,
                            rtpTarget: value
                          } : null)}
                          min={85}
                          max={98}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="w-16 text-sm font-mono">
                          {currentMachine.rtpTarget.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Min Bet</label>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01"
                          value={currentMachine.minBet}
                          onChange={(e) => setCurrentMachine(prev => prev ? {
                            ...prev,
                            minBet: parseFloat(e.target.value) || 0.01
                          } : null)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Max Bet</label>
                        <Input 
                          type="number" 
                          step="1" 
                          min="1"
                          value={currentMachine.maxBet}
                          onChange={(e) => setCurrentMachine(prev => prev ? {
                            ...prev,
                            maxBet: parseFloat(e.target.value) || 100
                          } : null)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Jackpot Type</label>
                      <Select value={currentMachine.jackpotType} onValueChange={(value: any) => 
                        setCurrentMachine(prev => prev ? { ...prev, jackpotType: value } : null)
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Jackpot</SelectItem>
                          <SelectItem value="progressive">Progressive Jackpot</SelectItem>
                          <SelectItem value="daily">Daily Jackpot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Jackpot Amount</label>
                      <Input 
                        type="number" 
                        step="100" 
                        min="1000"
                        value={currentMachine.jackpotAmount}
                        onChange={(e) => setCurrentMachine(prev => prev ? {
                          ...prev,
                          jackpotAmount: parseFloat(e.target.value) || 10000
                        } : null)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Symbols Tab */}
            <TabsContent value="symbols" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Symbol Library</CardTitle>
                      <Button onClick={addSymbol} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Symbol
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentMachine.symbols.map((symbol) => (
                          <Card 
                            key={symbol.id} 
                            className={`cursor-pointer transition-all ${
                              selectedSymbol?.id === symbol.id 
                                ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950' 
                                : 'hover:shadow-md'
                            }`}
                            onClick={() => setSelectedSymbol(symbol)}
                          >
                            <CardContent className="p-4 text-center">
                              <div 
                                className="text-4xl mb-2"
                                style={{ color: symbol.color }}
                              >
                                {symbol.icon}
                              </div>
                              <div className="text-sm font-medium">{symbol.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {symbol.payout}x • {symbol.frequency}%
                              </div>
                              <div className="flex justify-center gap-1 mt-2">
                                {symbol.isWild && <Badge className="text-xs bg-yellow-500">Wild</Badge>}
                                {symbol.isScatter && <Badge className="text-xs bg-blue-500">Scatter</Badge>}
                                {symbol.isBonus && <Badge className="text-xs bg-green-500">Bonus</Badge>}
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1 text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSymbol(symbol.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Symbol Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedSymbol ? 'Edit Symbol' : 'Select a Symbol'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSymbol ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input 
                            value={selectedSymbol.name}
                            onChange={(e) => updateSymbol(selectedSymbol.id, { name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Icon/Emoji</label>
                          <Input 
                            value={selectedSymbol.icon}
                            onChange={(e) => updateSymbol(selectedSymbol.id, { icon: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Color</label>
                          <Input 
                            type="color"
                            value={selectedSymbol.color}
                            onChange={(e) => updateSymbol(selectedSymbol.id, { color: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Payout Multiplier</label>
                          <Input 
                            type="number"
                            value={selectedSymbol.payout}
                            onChange={(e) => updateSymbol(selectedSymbol.id, { 
                              payout: parseInt(e.target.value) || 1 
                            })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Frequency (%)</label>
                          <Slider
                            value={[selectedSymbol.frequency]}
                            onValueChange={([value]) => updateSymbol(selectedSymbol.id, { frequency: value })}
                            min={1}
                            max={50}
                            step={1}
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {selectedSymbol.frequency}% appearance rate
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Animation Type</label>
                          <Select 
                            value={selectedSymbol.animationType} 
                            onValueChange={(value: any) => updateSymbol(selectedSymbol.id, { animationType: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="static">Static</SelectItem>
                              <SelectItem value="glow">Glow Effect</SelectItem>
                              <SelectItem value="bounce">Bounce</SelectItem>
                              <SelectItem value="sparkle">Sparkle</SelectItem>
                              <SelectItem value="rotate">Rotate</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={selectedSymbol.isWild}
                              onChange={(e) => updateSymbol(selectedSymbol.id, { isWild: e.target.checked })}
                            />
                            <label className="text-sm">Wild Symbol</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={selectedSymbol.isScatter}
                              onChange={(e) => updateSymbol(selectedSymbol.id, { isScatter: e.target.checked })}
                            />
                            <label className="text-sm">Scatter Symbol</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={selectedSymbol.isBonus}
                              onChange={(e) => updateSymbol(selectedSymbol.id, { isBonus: e.target.checked })}
                            />
                            <label className="text-sm">Bonus Symbol</label>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Symbol Image (Optional)</label>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="Image URL or upload..."
                              value={selectedSymbol.image || ""}
                              onChange={(e) => updateSymbol(selectedSymbol.id, { image: e.target.value })}
                            />
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Select a symbol from the library to edit its properties
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Live Preview</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                        <Button 
                          size="sm" 
                          variant={previewMode === "desktop" ? "default" : "ghost"}
                          onClick={() => setPreviewMode("desktop")}
                        >
                          <Monitor className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={previewMode === "tablet" ? "default" : "ghost"}
                          onClick={() => setPreviewMode("tablet")}
                        >
                          <Tablet className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={previewMode === "mobile" ? "default" : "ghost"}
                          onClick={() => setPreviewMode("mobile")}
                        >
                          <Smartphone className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button onClick={testMachine} className="bg-green-500 hover:bg-green-600">
                        <Play className="w-4 h-4 mr-2" />
                        Test Spin
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div 
                      className="border rounded-lg p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white transition-all duration-300"
                      style={{ width: getPreviewWidth(), maxWidth: "100%" }}
                    >
                      {/* Slot Machine Preview */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gold-400">{currentMachine.name}</h3>
                        <p className="text-sm text-gray-300">{currentMachine.theme}</p>
                      </div>

                      {/* Reels Grid */}
                      <div 
                        className="grid gap-1 mx-auto mb-4 p-4 bg-black/30 rounded-lg"
                        style={{ 
                          gridTemplateColumns: `repeat(${currentMachine.reels}, 1fr)`,
                          maxWidth: previewMode === "mobile" ? "280px" : "400px"
                        }}
                      >
                        {Array.from({ length: currentMachine.reels * currentMachine.rows }).map((_, index) => {
                          const symbolIndex = Math.floor(Math.random() * currentMachine.symbols.length);
                          const symbol = currentMachine.symbols[symbolIndex];
                          return (
                            <div 
                              key={index}
                              className="aspect-square bg-gradient-to-br from-gray-700 to-gray-600 rounded flex items-center justify-center text-2xl border border-gold-500/30"
                              style={{ color: symbol?.color }}
                            >
                              {symbol?.icon || "?"}
                            </div>
                          );
                        })}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mb-4 text-sm">
                        <div>
                          <span className="text-gray-300">Bet: </span>
                          <span className="text-gold-400 font-bold">
                            {formatCurrency(currentMachine.minBet)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-300">Jackpot: </span>
                          <span className="text-red-400 font-bold">
                            {formatCurrency(currentMachine.jackpotAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <Button className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-8">
                          <Play className="w-4 h-4 mr-2" />
                          SPIN
                        </Button>
                      </div>

                      {/* Bottom Info */}
                      <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
                        <div className="text-center">
                          <div className="text-gray-300">RTP</div>
                          <div className="text-green-400 font-bold">{currentMachine.rtpTarget}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-300">Paylines</div>
                          <div className="text-blue-400 font-bold">{currentMachine.paylines.length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Spins</p>
                        <p className="text-2xl font-bold">{currentMachine.performance.totalSpins.toLocaleString()}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Wins</p>
                        <p className="text-2xl font-bold">{currentMachine.performance.totalWins.toLocaleString()}</p>
                      </div>
                      <Trophy className="w-8 h-8 text-gold-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Biggest Win</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentMachine.performance.biggestWin)}</p>
                      </div>
                      <Crown className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Daily Revenue</p>
                        <p className="text-2xl font-bold">{formatCurrency(currentMachine.performance.revenueDaily)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>RTP Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Target RTP:</span>
                        <span className="font-bold text-blue-500">{currentMachine.rtpTarget}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Actual RTP:</span>
                        <span className={`font-bold ${
                          currentMachine.rtpActual >= currentMachine.rtpTarget - 0.5 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {currentMachine.rtpActual}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${(currentMachine.rtpActual / 100) * 100}%` }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {currentMachine.rtpActual >= currentMachine.rtpTarget - 0.5 
                          ? "✅ RTP within acceptable range" 
                          : "⚠️ RTP below target - optimization needed"
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Player Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Player Retention:</span>
                        <span className="font-bold text-green-500">{currentMachine.performance.playerRetention}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Avg Session:</span>
                        <span className="font-bold">{currentMachine.performance.averageSession} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Win Rate:</span>
                        <span className="font-bold">
                          {currentMachine.performance.totalSpins > 0 
                            ? ((currentMachine.performance.totalWins / currentMachine.performance.totalSpins) * 100).toFixed(1)
                            : 0
                          }%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        <Badge className={
                          currentMachine.status === "live" ? "bg-green-500" :
                          currentMachine.status === "testing" ? "bg-yellow-500" :
                          currentMachine.status === "paused" ? "bg-red-500" :
                          "bg-gray-500"
                        }>
                          {currentMachine.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Badge className={
                currentMachine.status === "live" ? "bg-green-500" :
                currentMachine.status === "testing" ? "bg-yellow-500" :
                "bg-gray-500"
              }>
                {currentMachine.status}
              </Badge>
              {currentMachine.aiOptimized && (
                <Badge className="bg-pink-500">
                  <Bot className="w-3 h-3 mr-1" />
                  AI Optimized
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={testMachine}>
                <Play className="w-4 h-4 mr-2" />
                Test 1000 Spins
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={saveMachine} className="bg-purple-500 hover:bg-purple-600">
                <Save className="w-4 h-4 mr-2" />
                Save Machine
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                disabled={currentMachine.status === "live"}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {currentMachine.status === "live" ? "Live" : "Go Live"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
