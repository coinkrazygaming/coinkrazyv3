import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { databaseService } from "@/services/database";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  Users,
  MessageSquare,
  Settings,
  TrendingUp,
  Shield,
  DollarSign,
  Trophy,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Plus,
  Send,
  Crown,
  Activity,
  FileText,
  Brain,
  Workflow,
  Target,
  BarChart3,
  Calendar,
  Star,
  Award,
  Briefcase,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface AIEmployee {
  id: number;
  name: string;
  role: string;
  description?: string;
  capabilities: string[];
  status: "active" | "inactive" | "maintenance";
  performance_metrics: any;
  configuration: any;
  total_tasks_completed: number;
  money_saved_usd: number;
  created_at: string;
  last_active: string;
}

export interface EmployeeMetrics {
  tasksToday: number;
  efficiency: number;
  accuracy: number;
  uptime: number;
  moneySavedToday: number;
  issuesHandled: number;
}

export interface TaskAssignment {
  id: string;
  employeeId: number;
  task: string;
  priority: "low" | "medium" | "high" | "critical";
  deadline: Date;
  status: "pending" | "in_progress" | "completed" | "failed";
  assignedAt: Date;
}

export default function AIEmployeeManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<TaskAssignment[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load data on component mount
  useEffect(() => {
    loadEmployeeData();
    initializeChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getAIEmployees();
      setEmployees(result);
    } catch (error) {
      console.error("Failed to load AI employees:", error);
      toast({
        title: "Error",
        description: "Failed to load AI employee data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadEmployeeData();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "AI employee data has been updated.",
    });
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: "welcome",
      sender: "LuckyAI",
      senderRole: "ai",
      content: `Good day! I'm LuckyAI, your Chief AI Assistant managing all casino operations. I coordinate with our team of AI employees to ensure optimal performance across all departments. 

Current Team Status:
🍀 LuckyAI - Managing overall operations
🛡️ SecurityBot - Monitoring fraud and compliance  
🤝 SupportGenie - Handling customer inquiries
📊 AnalyticsAI - Processing data and insights
🎮 GameMaster - Managing game performance

All systems are operational and team efficiency is at 97.8%. How can we assist you today?`,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    setChatMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: "Admin",
      senderRole: "admin",
      content: chatMessage,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        sender: "LuckyAI",
        senderRole: "ai",
        content: generateAIResponse(chatMessage),
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setChatMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("status") || lowerInput.includes("report")) {
      return `Current AI Team Status Report:

🟢 All ${employees.length} AI employees are active and operational
📊 Combined productivity: ${employees.reduce((sum, emp) => sum + emp.total_tasks_completed, 0).toLocaleString()} tasks completed
💰 Total money saved: $${employees.reduce((sum, emp) => sum + emp.money_saved_usd, 0).toLocaleString()}

Key Achievements Today:
• SecurityBot: Prevented 15 fraud attempts
• SupportGenie: Resolved 543 customer tickets  
• AnalyticsAI: Generated 12 performance reports
• GameMaster: Optimized RTP for 8 games

Team efficiency remains at peak performance. All departments reporting green status.`;
    }

    if (lowerInput.includes("assign") || lowerInput.includes("task")) {
      return "I can help you assign tasks to our AI team members. Each employee has specialized capabilities:\n\n🛡️ SecurityBot - Security, fraud detection, compliance\n🤝 SupportGenie - Customer service, ticket resolution\n📊 AnalyticsAI - Data analysis, reporting, insights\n🎮 GameMaster - Game management, RTP optimization\n\nWhat specific task would you like to assign, and to which team member?";
    }

    if (lowerInput.includes("performance") || lowerInput.includes("metrics")) {
      return `AI Team Performance Metrics:

Overall Efficiency: 97.8% (↑2.3% this week)
Combined Uptime: 99.9%
Task Completion Rate: 98.5%
Error Rate: 0.2%

Top Performers:
🥇 SecurityBot - 99.1% accuracy in fraud detection
🥈 SupportGenie - 96.7% customer satisfaction
🥉 AnalyticsAI - 99.1% report accuracy

All team members are performing above baseline expectations. The AI optimization protocols are functioning excellently.`;
    }

    if (lowerInput.includes("recommend") || lowerInput.includes("improve")) {
      return `AI Team Recommendations:

🔧 Suggested Improvements:
• Deploy additional AI worker for peak hour support
• Implement advanced ML model for fraud prediction
• Expand AnalyticsAI capabilities for real-time insights
• Cross-train AI employees for redundancy

💡 Optimization Opportunities:
• Automate more routine administrative tasks
• Integrate voice recognition for customer support
• Implement predictive maintenance schedules
• Enhance inter-AI communication protocols

I recommend prioritizing the fraud prediction enhancement - it could save an additional $50k annually.`;
    }

    return `I understand your inquiry. As the Chief AI Assistant, I coordinate our entire AI workforce to maintain optimal casino operations. 

Our team excels at:
🔒 Security & Fraud Prevention
🎮 Game Performance Management  
📊 Data Analytics & Insights
🤝 Customer Support Excellence
💰 Financial Operations

What specific aspect of our AI operations would you like to discuss or optimize?`;
  };

  const assignTask = async (
    employeeId: number,
    task: string,
    priority: string,
  ) => {
    const newTask: TaskAssignment = {
      id: Date.now().toString(),
      employeeId,
      task,
      priority: priority as any,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      status: "pending",
      assignedAt: new Date(),
    };

    setTasks((prev) => [...prev, newTask]);
    setNewTaskText("");

    // Update employee metrics
    try {
      await databaseService.updateAIEmployeeMetrics(employeeId, 1, 0);
      await loadEmployeeData(); // Refresh data

      toast({
        title: "Task Assigned",
        description: `Task assigned to ${employees.find((e) => e.id === employeeId)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign task.",
        variant: "destructive",
      });
    }
  };

  const updateEmployeeStatus = async (employeeId: number, status: string) => {
    try {
      // In a real implementation, this would be an API call
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === employeeId ? { ...emp, status: status as any } : emp,
        ),
      );

      toast({
        title: "Status Updated",
        description: `Employee status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee status.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "maintenance":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "inactive":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const calculateDailyMetrics = (employee: AIEmployee): EmployeeMetrics => {
    const metrics = employee.performance_metrics || {};
    return {
      tasksToday: Math.floor(Math.random() * 100) + 50,
      efficiency: metrics.efficiency || 95 + Math.random() * 5,
      accuracy: metrics.accuracy || 96 + Math.random() * 4,
      uptime: metrics.uptime || 99 + Math.random() * 1,
      moneySavedToday: Math.floor(Math.random() * 1000) + 100,
      issuesHandled: Math.floor(Math.random() * 50) + 10,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading AI employees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI Employee Manager</h2>
          <p className="text-muted-foreground">
            Manage and monitor your AI workforce
          </p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          {refreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Bot className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            Team
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <Briefcase className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="performance">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Meeting
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold-500/20">
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{employees.length}</div>
                <div className="text-sm text-muted-foreground">
                  AI Employees
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {employees.filter((emp) => emp.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">Active Now</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5 border-casino-blue/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {employees
                    .reduce((sum, emp) => sum + emp.total_tasks_completed, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  $
                  {employees
                    .reduce((sum, emp) => sum + emp.money_saved_usd, 0)
                    .toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Money Saved</div>
              </CardContent>
            </Card>
          </div>

          {/* Chief AI Manager Spotlight */}
          <Card className="mb-6 bg-gradient-to-br from-gold/5 to-casino-blue/5 border-gold-500/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-2xl">
                  🍀
                </div>
                <div>
                  <CardTitle className="text-xl">
                    LuckyAI - Chief AI Assistant
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Managing all AI employees and coordinating casino operations
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-500 text-white">
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-gold-500 text-gold-400"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Chief Manager
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400">
                    {employees
                      .find((emp) => emp.name === "LuckyAI")
                      ?.total_tasks_completed?.toLocaleString() || "125,847"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Managed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">99.7%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-casino-blue">
                    97.2%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Efficiency
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    $
                    {employees
                      .find((emp) => emp.name === "LuckyAI")
                      ?.money_saved_usd?.toLocaleString() || "285,000"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Money Saved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => {
                    const metrics = calculateDailyMetrics(employee);
                    return (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-gold-500" />
                          </div>
                          <div>
                            <div className="font-bold">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {employee.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold text-green-500">
                              {metrics.efficiency.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Efficiency
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">
                              {metrics.tasksToday}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tasks Today
                            </div>
                          </div>
                          <Badge className={getStatusColor(employee.status)}>
                            {employee.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>
                      SecurityBot detected and blocked 3 fraud attempts
                    </span>
                    <span className="text-muted-foreground ml-auto">
                      2m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span>
                      SupportGenie resolved 12 customer tickets automatically
                    </span>
                    <span className="text-muted-foreground ml-auto">
                      5m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    <span>AnalyticsAI generated daily revenue report</span>
                    <span className="text-muted-foreground ml-auto">
                      8m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Settings className="w-4 h-4 text-orange-500" />
                    <span>GameMaster optimized RTP for 2 slot games</span>
                    <span className="text-muted-foreground ml-auto">
                      12m ago
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4 text-gold-500" />
                    <span>LuckyAI coordinated team weekly sync</span>
                    <span className="text-muted-foreground ml-auto">
                      15m ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="employees" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => {
              const metrics = calculateDailyMetrics(employee);
              return (
                <Card
                  key={employee.id}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-gold-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {employee.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {employee.role}
                        </p>
                        <Badge
                          className={`${getStatusColor(employee.status)} text-xs mt-1`}
                        >
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm mb-2">
                        Daily Performance
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Tasks:</span>
                          <span className="font-bold ml-1">
                            {metrics.tasksToday}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Efficiency:
                          </span>
                          <span className="font-bold ml-1 text-green-500">
                            {metrics.efficiency.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Accuracy:
                          </span>
                          <span className="font-bold ml-1 text-casino-blue">
                            {metrics.accuracy.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uptime:</span>
                          <span className="font-bold ml-1 text-purple-500">
                            {metrics.uptime.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm mb-2">Capabilities</h4>
                      <div className="flex flex-wrap gap-1">
                        {employee.capabilities
                          ?.slice(0, 3)
                          .map((capability, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {capability}
                            </Badge>
                          ))}
                        {employee.capabilities?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{employee.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateEmployeeStatus(
                            employee.id,
                            employee.status === "active"
                              ? "maintenance"
                              : "active",
                          )
                        }
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Toggle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assign New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Task Description
                  </label>
                  <Input
                    placeholder="Enter task description..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees
                    .filter((emp) => emp.status === "active")
                    .map((employee) => (
                      <Button
                        key={employee.id}
                        variant="outline"
                        onClick={() =>
                          assignTask(employee.id, newTaskText, "medium")
                        }
                        disabled={!newTaskText.trim()}
                        className="h-auto p-3 justify-start"
                      >
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-gold-500" />
                          <div className="text-left">
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {employee.role}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active tasks assigned
                    </div>
                  ) : (
                    tasks.map((task) => {
                      const employee = employees.find(
                        (emp) => emp.id === task.employeeId,
                      );
                      return (
                        <div
                          key={task.id}
                          className="p-3 bg-muted/20 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-gold-500" />
                              <span className="font-medium">
                                {employee?.name}
                              </span>
                            </div>
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.task}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Assigned: {task.assignedAt.toLocaleString()}
                            </span>
                            <span
                              className={`font-medium ${
                                task.priority === "high"
                                  ? "text-red-500"
                                  : task.priority === "medium"
                                    ? "text-orange-500"
                                    : "text-green-500"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-500">
                        97.8%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Average Efficiency
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-casino-blue">
                        99.9%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-500">
                        0.2%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Error Rate
                      </div>
                    </div>
                    <div className="text-center p-4 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-gold-500">
                        98.5%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Task Success
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .sort(
                      (a, b) =>
                        b.total_tasks_completed - a.total_tasks_completed,
                    )
                    .slice(0, 5)
                    .map((employee, index) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500 text-black font-bold text-sm">
                          {index + 1}
                        </div>
                        <Bot className="w-6 h-6 text-gold-500" />
                        <div className="flex-1">
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {employee.role}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {employee.total_tasks_completed.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            tasks
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Meeting Chat Tab */}
        <TabsContent value="chat" className="mt-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold-500" />
                AI Team Meeting - Central Command
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Communicate with all AI employees in real-time coordination hub
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Active Team Members */}
              <div className="flex gap-2 mb-4 p-2 bg-muted/20 rounded-lg">
                <span className="text-sm text-muted-foreground mr-2">
                  Active Team:
                </span>
                {employees
                  .filter((emp) => emp.status === "active")
                  .map((emp) => (
                    <Badge key={emp.id} variant="outline" className="text-xs">
                      <Bot className="w-3 h-3 mr-1" />
                      {emp.name}
                    </Badge>
                  ))}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.senderRole === "admin"
                          ? "bg-gold-500 text-black"
                          : message.senderRole === "ai"
                            ? "bg-casino-blue text-white"
                            : "bg-muted"
                      }`}
                    >
                      {message.senderRole !== "admin" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {message.sender}
                          </span>
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.senderRole === "admin"
                            ? "text-black/70"
                            : "text-white/70"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message to the AI team..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-gold-500 hover:bg-gold-600 text-black"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-gold-500" />
                </div>
                <div>
                  <CardTitle>{selectedEmployee.name}</CardTitle>
                  <p className="text-muted-foreground">
                    {selectedEmployee.role}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedEmployee(null)}
              >
                ×
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-bold mb-3">Description</h3>
                <p className="text-muted-foreground">
                  {selectedEmployee.description}
                </p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.capabilities?.map((capability, index) => (
                    <Badge key={index} variant="outline">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold">
                      {selectedEmployee.total_tasks_completed.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Tasks
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-green-500">
                      ${selectedEmployee.money_saved_usd.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Money Saved
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold">
                      {new Date(
                        selectedEmployee.created_at,
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Date Created
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold">
                      {new Date(
                        selectedEmployee.last_active,
                      ).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last Active
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
