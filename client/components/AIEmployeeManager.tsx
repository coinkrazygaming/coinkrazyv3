import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "offline" | "busy";
  avatar: string;
  specialties: string[];
  performance: {
    tasksCompleted: number;
    accuracy: number;
    efficiency: number;
    userSatisfaction: number;
  };
  lastActive: string;
  currentTasks: string[];
  workflows: Workflow[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: string[];
  isActive: boolean;
  lastRun: string;
  successRate: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  conditions: string[];
  nextStep?: string;
}

export interface DepartmentReport {
  id: string;
  department: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  metrics: {
    tasksCompleted: number;
    issuesResolved: number;
    revenue: number;
    errors: number;
  };
  summary: string;
  details: string;
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole: "admin" | "ai" | "system";
  content: string;
  timestamp: string;
  type: "text" | "report" | "alert" | "action";
}

export default function AIEmployeeManager() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(
    null,
  );
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [aiEmployees] = useState<AIEmployee[]>([
    {
      id: "lucky-ai",
      name: "Lucky",
      role: "AI Casino Manager",
      department: "Management",
      status: "active",
      avatar: "🍀",
      specialties: [
        "Operations Management",
        "Fraud Detection",
        "Staff Coordination",
        "Strategic Planning",
      ],
      performance: {
        tasksCompleted: 15847,
        accuracy: 99.7,
        efficiency: 97.2,
        userSatisfaction: 98.5,
      },
      lastActive: new Date().toISOString(),
      currentTasks: [
        "Monitoring casino operations",
        "Reviewing department reports",
        "Coordinating AI staff",
      ],
      workflows: [
        {
          id: "fraud-detection",
          name: "Fraud Detection Protocol",
          description:
            "Monitor player patterns and detect suspicious activities",
          steps: [],
          triggers: [
            "unusual_betting_pattern",
            "multiple_account_access",
            "rapid_large_wins",
          ],
          isActive: true,
          lastRun: new Date().toISOString(),
          successRate: 99.2,
        },
      ],
    },
    {
      id: "security-ai",
      name: "Guardian",
      role: "Security Specialist",
      department: "Security",
      status: "active",
      avatar: "🛡️",
      specialties: [
        "Fraud Prevention",
        "Account Security",
        "Risk Assessment",
        "Compliance Monitoring",
      ],
      performance: {
        tasksCompleted: 8934,
        accuracy: 99.1,
        efficiency: 96.8,
        userSatisfaction: 97.3,
      },
      lastActive: new Date(Date.now() - 300000).toISOString(),
      currentTasks: [
        "KYC verification reviews",
        "Transaction monitoring",
        "Security alerts",
      ],
      workflows: [],
    },
    {
      id: "support-ai",
      name: "Helper",
      role: "Customer Support Lead",
      department: "Support",
      status: "active",
      avatar: "🤝",
      specialties: [
        "Customer Service",
        "Technical Support",
        "Ticket Resolution",
        "User Guidance",
      ],
      performance: {
        tasksCompleted: 12456,
        accuracy: 97.8,
        efficiency: 94.5,
        userSatisfaction: 96.7,
      },
      lastActive: new Date(Date.now() - 60000).toISOString(),
      currentTasks: [
        "Handling support tickets",
        "Chat assistance",
        "FAQ updates",
      ],
      workflows: [],
    },
    {
      id: "analytics-ai",
      name: "Insight",
      role: "Data Analyst",
      department: "Analytics",
      status: "active",
      avatar: "📊",
      specialties: [
        "Data Analysis",
        "Performance Metrics",
        "Trend Identification",
        "Report Generation",
      ],
      performance: {
        tasksCompleted: 6789,
        accuracy: 98.9,
        efficiency: 95.7,
        userSatisfaction: 97.8,
      },
      lastActive: new Date(Date.now() - 120000).toISOString(),
      currentTasks: [
        "Generating daily reports",
        "Analyzing player behavior",
        "Revenue optimization",
      ],
      workflows: [],
    },
    {
      id: "game-ai",
      name: "Curator",
      role: "Game Operations Specialist",
      department: "Gaming",
      status: "active",
      avatar: "🎮",
      specialties: [
        "Game Monitoring",
        "RTP Management",
        "Player Experience",
        "Game Performance",
      ],
      performance: {
        tasksCompleted: 9876,
        accuracy: 98.2,
        efficiency: 96.1,
        userSatisfaction: 98.0,
      },
      lastActive: new Date(Date.now() - 180000).toISOString(),
      currentTasks: [
        "Monitoring game performance",
        "RTP adjustments",
        "Player engagement analysis",
      ],
      workflows: [],
    },
    {
      id: "payment-ai",
      name: "Treasurer",
      role: "Payment Processor",
      department: "Finance",
      status: "active",
      avatar: "💰",
      specialties: [
        "Payment Processing",
        "Transaction Verification",
        "Financial Compliance",
        "Revenue Tracking",
      ],
      performance: {
        tasksCompleted: 11234,
        accuracy: 99.8,
        efficiency: 98.3,
        userSatisfaction: 98.9,
      },
      lastActive: new Date(Date.now() - 90000).toISOString(),
      currentTasks: [
        "Processing withdrawals",
        "Verifying deposits",
        "Financial reporting",
      ],
      workflows: [],
    },
  ]);

  const [departmentReports] = useState<DepartmentReport[]>([
    {
      id: "report-1",
      department: "Security",
      employeeId: "security-ai",
      employeeName: "Guardian",
      date: new Date().toISOString(),
      status: "pending",
      metrics: {
        tasksCompleted: 234,
        issuesResolved: 23,
        revenue: 0,
        errors: 2,
      },
      summary:
        "Successfully prevented 15 potential fraud attempts. KYC verification backlog cleared.",
      details:
        "Detailed security analysis shows a 12% increase in attempted fraudulent activities, all successfully blocked by our detection systems.",
      recommendations: [
        "Increase monitoring on new user registrations",
        "Implement additional verification steps for high-value transactions",
      ],
    },
    {
      id: "report-2",
      department: "Support",
      employeeId: "support-ai",
      employeeName: "Helper",
      date: new Date().toISOString(),
      status: "approved",
      metrics: {
        tasksCompleted: 567,
        issuesResolved: 543,
        revenue: 0,
        errors: 5,
      },
      summary:
        "Maintained 98% customer satisfaction rating. Auto-resolved 85% of tickets.",
      details:
        "Support volume increased 23% this week, primarily due to new user questions about sweepstakes mechanics.",
      recommendations: [
        "Create additional FAQ content for sweepstakes rules",
        "Expand auto-response templates",
      ],
    },
    {
      id: "report-3",
      department: "Gaming",
      employeeId: "game-ai",
      employeeName: "Curator",
      date: new Date().toISOString(),
      status: "pending",
      metrics: {
        tasksCompleted: 189,
        issuesResolved: 12,
        revenue: 45000,
        errors: 1,
      },
      summary:
        'All games operating within target RTP ranges. New slot "Josey Duck Game" performing exceptionally.',
      details:
        "Weekly gaming analysis shows strong player engagement across all categories. Sports betting integration successful.",
      recommendations: [
        "Consider expanding custom game offerings",
        "Monitor new parlay betting feature performance",
      ],
    },
  ]);

  useEffect(() => {
    // Initialize chat with welcome message from Lucky
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      sender: "Lucky",
      senderRole: "ai",
      content:
        "Good day! I'm Lucky, your AI Casino Manager. I oversee all AI employees and daily operations at CoinKrazy.com. All department reports are ready for your review. How can I assist you today?",
      timestamp: new Date().toISOString(),
      type: "text",
    };
    setChatMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
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
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "Lucky",
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

    if (lowerInput.includes("report") || lowerInput.includes("status")) {
      return "I have 3 department reports pending your review. Security and Gaming departments need approval. All AI employees are performing exceptionally with 98%+ efficiency ratings. Would you like me to provide detailed metrics for any specific department?";
    }

    if (lowerInput.includes("fraud") || lowerInput.includes("security")) {
      return "Guardian reports all security systems operating normally. We prevented 15 fraud attempts today with zero false positives. Current threat level is LOW. KYC verification queue is clear with average processing time of 2.3 minutes.";
    }

    if (lowerInput.includes("revenue") || lowerInput.includes("profit")) {
      return "Daily revenue is tracking 12% above target. Treasurer reports $45,230 processed today with 99.8% transaction accuracy. The new parlay betting system is generating strong engagement. Sports betting revenue up 34% week-over-week.";
    }

    if (lowerInput.includes("employee") || lowerInput.includes("staff")) {
      return "All 6 AI employees are currently active and performing optimally. Helper resolved 543 support tickets today, Curator optimized 12 game RTPs, and Insight generated comprehensive analytics reports. Team efficiency is at an all-time high of 97.2%.";
    }

    return "I understand. As your AI Casino Manager, I coordinate all operations and can provide detailed insights on any aspect of CoinKrazy.com. What specific area would you like me to focus on? I can discuss security, revenue, player satisfaction, game performance, or staff coordination.";
  };

  const approveReport = (reportId: string) => {
    // In production, this would make an API call
    console.log("Approving report:", reportId);
  };

  const rejectReport = (reportId: string) => {
    // In production, this would make an API call
    console.log("Rejecting report:", reportId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "busy":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "offline":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "pending":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "rejected":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Bot className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="w-4 h-4 mr-2" />
            AI Employees
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-2" />
            Department Reports
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Meeting Chat
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold-500/20">
              <CardContent className="p-4 text-center">
                <Bot className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{aiEmployees.length}</div>
                <div className="text-sm text-muted-foreground">
                  AI Employees
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4 text-center">
                <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {aiEmployees.filter((emp) => emp.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">Active Now</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5 border-casino-blue/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-casino-blue mx-auto mb-2" />
                <div className="text-2xl font-bold">97.2%</div>
                <div className="text-sm text-muted-foreground">
                  Avg Efficiency
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {
                    departmentReports.filter((r) => r.status === "pending")
                      .length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Pending Reports
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lucky AI Manager Card */}
          <Card className="mb-6 bg-gradient-to-br from-gold/5 to-casino-blue/5 border-gold-500/20">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center text-2xl">
                  🍀
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Lucky - AI Casino Manager
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Managing all AI employees and daily operations
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
                      Manager
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gold-400">
                    {aiEmployees
                      .find((emp) => emp.id === "lucky-ai")
                      ?.performance.tasksCompleted.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Managed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {
                      aiEmployees.find((emp) => emp.id === "lucky-ai")
                        ?.performance.accuracy
                    }
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-casino-blue">
                    {
                      aiEmployees.find((emp) => emp.id === "lucky-ai")
                        ?.performance.efficiency
                    }
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Efficiency
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {
                      aiEmployees.find((emp) => emp.id === "lucky-ai")
                        ?.performance.userSatisfaction
                    }
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Satisfaction
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Security", "Support", "Gaming", "Analytics", "Finance"].map(
                  (dept) => {
                    const employee = aiEmployees.find(
                      (emp) => emp.department === dept,
                    );
                    const report = departmentReports.find(
                      (r) => r.department === dept,
                    );

                    return (
                      <div
                        key={dept}
                        className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{employee?.avatar}</div>
                          <div>
                            <div className="font-bold">{dept}</div>
                            <div className="text-sm text-muted-foreground">
                              {employee?.name} - {employee?.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-500">
                              {employee?.performance.efficiency}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Efficiency
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold">
                              {report?.metrics.tasksCompleted || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Tasks Today
                            </div>
                          </div>
                          <Badge
                            className={`${employee?.status === "active" ? "bg-green-500" : "bg-orange-500"} text-white`}
                          >
                            {employee?.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Employees Tab */}
        <TabsContent value="employees" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiEmployees.map((employee) => (
              <Card
                key={employee.id}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-full flex items-center justify-center text-2xl">
                      {employee.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
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
                    <h4 className="font-bold text-sm mb-2">Performance</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Tasks:</span>
                        <span className="font-bold ml-1">
                          {employee.performance.tasksCompleted.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span>
                        <span className="font-bold ml-1 text-green-500">
                          {employee.performance.accuracy}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Efficiency:
                        </span>
                        <span className="font-bold ml-1 text-casino-blue">
                          {employee.performance.efficiency}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Satisfaction:
                        </span>
                        <span className="font-bold ml-1 text-purple-500">
                          {employee.performance.userSatisfaction}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-2">Current Tasks</h4>
                    <div className="space-y-1">
                      {employee.currentTasks.slice(0, 2).map((task, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {task}
                        </div>
                      ))}
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
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3 mr-1" />
                      Config
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Department Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <div className="space-y-4">
            {departmentReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {report.department} Department Report
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        By {report.employeeName} •{" "}
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={`${getReportStatusColor(report.status)}`}>
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {report.metrics.tasksCompleted}
                      </div>
                      <div className="text-xs text-muted-foreground">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-500">
                        {report.metrics.issuesResolved}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Resolved
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gold-500">
                        {report.metrics.revenue > 0
                          ? `$${report.metrics.revenue.toLocaleString()}`
                          : "N/A"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Revenue
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold ${report.metrics.errors > 0 ? "text-red-500" : "text-green-500"}`}
                      >
                        {report.metrics.errors}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Errors
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.summary}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <Target className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveReport(report.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectReport(report.id)}
                        className="text-red-500 border-red-500"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Request Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Meeting Chat Tab */}
        <TabsContent value="chat" className="mt-6">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold-500" />
                AI Employee Meeting - Admin Chat
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect with all AI employees in one unified chat session
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {/* Active Employees */}
              <div className="flex gap-2 mb-4 p-2 bg-muted/20 rounded-lg">
                <span className="text-sm text-muted-foreground mr-2">
                  Active:
                </span>
                {aiEmployees
                  .filter((emp) => emp.status === "active")
                  .map((emp) => (
                    <Badge key={emp.id} variant="outline" className="text-xs">
                      {emp.avatar} {emp.name}
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
                      className={`max-w-[80%] p-3 rounded-lg ${
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
                      <div className="text-sm">{message.content}</div>
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
                  placeholder="Type your message to AI employees..."
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
                <div className="w-12 h-12 bg-gradient-to-br from-casino-blue/20 to-gold/20 rounded-full flex items-center justify-center text-2xl">
                  {selectedEmployee.avatar}
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
                <h3 className="font-bold mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Current Tasks</h3>
                <div className="space-y-2">
                  {selectedEmployee.currentTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/20 rounded"
                    >
                      <Clock className="w-4 h-4 text-casino-blue" />
                      <span className="text-sm">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Workflows</h3>
                <div className="space-y-2">
                  {selectedEmployee.workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="p-3 bg-muted/20 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge
                          className={
                            workflow.isActive ? "bg-green-500" : "bg-gray-500"
                          }
                        >
                          {workflow.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {workflow.description}
                      </p>
                      <div className="text-xs">
                        Success Rate:{" "}
                        <span className="font-bold text-green-500">
                          {workflow.successRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
