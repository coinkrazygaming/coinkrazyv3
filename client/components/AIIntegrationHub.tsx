import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bot,
  Brain,
  Sparkles,
  Monitor,
  Users,
  Gift,
  Crown,
  Shield,
  Activity,
  TrendingUp,
  BarChart3,
  Settings,
  Zap,
  Star,
  Target,
  Workflow,
  MessageSquare,
  Eye,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  RefreshCw,
  ExternalLink,
  Maximize2,
  ChevronRight,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Database,
  Terminal,
  Code,
  Network,
  Cpu,
  HardDrive,
  Coins,
  Trophy,
  Gamepad2,
  Mail,
  Phone,
  Globe,
  Lock,
  Unlock,
  Key,
  Search,
  Filter,
  Download,
  Upload,
  Share2,
  Copy,
} from "lucide-react";

// Import all our advanced components
import LuckyAI from "./LuckyAI";
import VMManager from "./VMManager";
import AdvancedAIEmployeeManager from "./AdvancedAIEmployeeManager";

interface SystemOverview {
  totalAIs: number;
  activeAIs: number;
  totalVMs: number;
  runningVMs: number;
  todaysCost: number;
  monthlyProjected: number;
  systemHealth: number;
  totalTasks: number;
  completedTasks: number;
  averageEfficiency: number;
  userSatisfaction: number;
  uptime: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  badge?: string;
  color: string;
}

export default function AIIntegrationHub() {
  const [activeModule, setActiveModule] = useState("overview");
  const [systemOverview, setSystemOverview] = useState<SystemOverview>({
    totalAIs: 6,
    activeAIs: 5,
    totalVMs: 8,
    runningVMs: 6,
    todaysCost: 1247.89,
    monthlyProjected: 37436.7,
    systemHealth: 98.7,
    totalTasks: 15847,
    completedTasks: 15234,
    averageEfficiency: 97.2,
    userSatisfaction: 98.5,
    uptime: 99.9,
  });

  const [isLuckyAIExpanded, setIsLuckyAIExpanded] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: "deploy-ai",
      title: "Deploy New AI",
      description: "Launch a new AI employee with custom capabilities",
      icon: Bot,
      action: () => console.log("Deploy AI"),
      badge: "Quick Setup",
      color: "purple",
    },
    {
      id: "create-vm",
      title: "Create VM",
      description: "Spin up a new virtual machine for AI workloads",
      icon: Monitor,
      action: () => console.log("Create VM"),
      badge: "5 min setup",
      color: "blue",
    },
    {
      id: "manage-bonuses",
      title: "Bonus Manager",
      description: "Create and manage promotional bonuses",
      icon: Gift,
      action: () => console.log("Manage Bonuses"),
      badge: "AI Powered",
      color: "gold",
    },
    {
      id: "system-health",
      title: "System Health",
      description: "View comprehensive system diagnostics",
      icon: Activity,
      action: () => console.log("System Health"),
      badge: `${systemOverview.systemHealth}%`,
      color: "green",
    },
    {
      id: "ai-chat",
      title: "AI Team Chat",
      description: "Communicate with your AI workforce",
      icon: MessageSquare,
      action: () => console.log("AI Chat"),
      badge: "5 active",
      color: "cyan",
    },
    {
      id: "analytics",
      title: "AI Analytics",
      description: "Performance metrics and insights",
      icon: BarChart3,
      action: () => console.log("Analytics"),
      badge: "Real-time",
      color: "orange",
    },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "ai_deployment",
      message: "Lucky AI completed fraud analysis for 15 transactions",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: "success",
    },
    {
      id: "2",
      type: "vm_scaling",
      message: "VM Analytics Engine auto-scaled due to high load",
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      status: "info",
    },
    {
      id: "3",
      type: "bonus_created",
      message: "AI generated weekend special bonus campaign",
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
      status: "success",
    },
    {
      id: "4",
      type: "security_alert",
      message: "Guardian AI flagged suspicious account activity",
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      status: "warning",
    },
    {
      id: "5",
      type: "system_update",
      message: "AI employee training models updated successfully",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: "success",
    },
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemOverview((prev) => ({
        ...prev,
        systemHealth: Math.max(
          95,
          Math.min(100, prev.systemHealth + (Math.random() - 0.5) * 2),
        ),
        completedTasks: prev.completedTasks + Math.floor(Math.random() * 3),
        todaysCost: prev.todaysCost + Math.random() * 10,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500 bg-green-500/10";
      case "warning":
        return "text-yellow-500 bg-yellow-500/10";
      case "error":
        return "text-red-500 bg-red-500/10";
      case "info":
        return "text-blue-500 bg-blue-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getActionColor = (color: string) => {
    const colors = {
      purple:
        "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      gold: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
      green:
        "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
      cyan: "from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700",
      orange:
        "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-gold/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-3xl">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 via-blue-600 to-gold rounded-full flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                AI Integration Hub
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  Enterprise
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground text-lg mt-2">
                Unified control center for AI employees, virtual machines, and
                automation systems
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {systemOverview.activeAIs}/{systemOverview.totalAIs}
                </div>
                <div className="text-sm text-muted-foreground">Active AIs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {systemOverview.runningVMs}/{systemOverview.totalVMs}
                </div>
                <div className="text-sm text-muted-foreground">Running VMs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {systemOverview.systemHealth.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  System Health
                </div>
              </div>
              <Button
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => setIsLuckyAIExpanded(!isLuckyAIExpanded)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Launch Lucky AI
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4 text-center">
            <Bot className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{systemOverview.totalAIs}</div>
            <div className="text-sm text-muted-foreground">AI Employees</div>
            <div className="text-xs text-green-500">+2 this month</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4 text-center">
            <Monitor className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{systemOverview.totalVMs}</div>
            <div className="text-sm text-muted-foreground">
              Virtual Machines
            </div>
            <div className="text-xs text-blue-500">Auto-scaling enabled</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {systemOverview.completedTasks.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Today</div>
            <div className="text-xs text-green-500">
              {systemOverview.totalTasks - systemOverview.completedTasks} in
              progress
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {formatCurrency(systemOverview.todaysCost)}
            </div>
            <div className="text-sm text-muted-foreground">Today's Cost</div>
            <div className="text-xs text-green-500">-8% from yesterday</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {systemOverview.averageEfficiency.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Efficiency</div>
            <div className="text-xs text-cyan-500">Above target</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {systemOverview.userSatisfaction.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
            <div className="text-xs text-orange-500">Excellent rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeModule}
        onValueChange={setActiveModule}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="lucky-ai">
            <Sparkles className="w-4 h-4 mr-2" />
            Lucky AI
          </TabsTrigger>
          <TabsTrigger value="ai-employees">
            <Users className="w-4 h-4 mr-2" />
            AI Employees
          </TabsTrigger>
          <TabsTrigger value="vm-manager">
            <Monitor className="w-4 h-4 mr-2" />
            VM Manager
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Workflow className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Card
                    key={action.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-purple-500/50"
                    onClick={action.action}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`p-2 rounded-lg bg-gradient-to-r ${getActionColor(action.color)}`}
                        >
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        {action.badge && (
                          <Badge variant="outline" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold mb-1 group-hover:text-purple-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <div className="flex items-center text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Launch</span>
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall System Health</span>
                      <span className="font-mono">
                        {systemOverview.systemHealth.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={systemOverview.systemHealth}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI Employee Efficiency</span>
                      <span className="font-mono">
                        {systemOverview.averageEfficiency.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={systemOverview.averageEfficiency}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Satisfaction</span>
                      <span className="font-mono">
                        {systemOverview.userSatisfaction.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={systemOverview.userSatisfaction}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>System Uptime</span>
                      <span className="font-mono">
                        {systemOverview.uptime.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={systemOverview.uptime} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2 hover:bg-muted/20 rounded transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <FileText className="w-3 h-3 mr-2" />
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(systemOverview.todaysCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Today's Cost
                  </div>
                  <div className="text-xs text-green-500">
                    -8% from yesterday
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(systemOverview.todaysCost * 7)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Weekly Projection
                  </div>
                  <div className="text-xs text-blue-500">On budget</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(systemOverview.monthlyProjected)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly Projection
                  </div>
                  <div className="text-xs text-purple-500">Within limits</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(
                      systemOverview.todaysCost / systemOverview.completedTasks,
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Cost per Task
                  </div>
                  <div className="text-xs text-orange-500">Efficient</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lucky AI Tab */}
        <TabsContent value="lucky-ai" className="space-y-6">
          <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950">
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Lucky AI</strong> is your advanced AI assistant with VM
              management, bonus features, and comprehensive system oversight.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                Lucky AI Assistant - Full Featured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-12 h-12 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Launch Lucky AI</h3>
                <p className="text-muted-foreground mb-6">
                  Access the full-featured Lucky AI assistant with VM
                  management, bonus systems, analytics, and comprehensive casino
                  operations support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black"
                    onClick={() => setIsLuckyAIExpanded(true)}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Launch Lucky AI
                  </Button>
                  <Button size="lg" variant="outline">
                    <Settings className="w-5 h-5 mr-2" />
                    Configure Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Employees Tab */}
        <TabsContent value="ai-employees" className="space-y-6">
          <AdvancedAIEmployeeManager />
        </TabsContent>

        {/* VM Manager Tab */}
        <TabsContent value="vm-manager" className="space-y-6">
          <VMManager />
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-500" />
                Automation Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Advanced Automation</h3>
                <p className="text-muted-foreground mb-6">
                  Configure workflows, triggers, and automated processes for
                  your AI systems
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Conditional LuckyAI Full Screen */}
      {isLuckyAIExpanded && (
        <div className="fixed inset-0 z-50">
          <LuckyAI />
        </div>
      )}
    </div>
  );
}
