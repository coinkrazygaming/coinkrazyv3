import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  PieChart,
  LineChart,
  Star,
  Bookmark,
  Tag,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Download,
  Upload,
  Copy,
  Share2,
  RefreshCw,
  Play,
  Pause,
  Stop,
  RotateCcw,
  Power,
  PowerOff,
  Monitor,
  Terminal,
  Code,
  Database,
  Server,
  Cloud,
  Network,
  Cpu,
  HardDrive,
  MemoryStick,
  Gauge,
  Thermometer,
  Battery,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Video,
  Image,
  Paperclip,
  Smile,
  Hash,
  AtSign,
  LinkIcon,
  Trash2,
  Archive,
  FolderOpen,
  Folder,
  File,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FilePdf,
  FileSpreadsheet,
  FileType,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Layers,
  Package,
  Puzzle,
  Wrench,
  Hammer,
  Screwdriver,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Radio,
  Checkbox,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Heart,
  Lightbulb,
  Flash,
  Flame,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  Wind,
  Snowflake,
  Droplets,
  Waves,
  Mountain,
  TreePine,
  Flower,
  Leaf,
  Sprout,
  Gem,
  Crystal,
  Sparkles,
  Magic,
  Wand,
  Potion,
} from "lucide-react";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "offline" | "busy" | "maintenance" | "error";
  avatar: string;
  model: "gpt-4" | "claude-3" | "gemini-pro" | "custom";
  version: string;
  specialties: string[];
  capabilities: string[];
  languages: string[];

  // Performance metrics
  performance: {
    tasksCompleted: number;
    tasksInProgress: number;
    successRate: number;
    averageResponseTime: number;
    accuracy: number;
    efficiency: number;
    userSatisfaction: number;
    errorRate: number;
    uptime: number;
    tokensUsed: number;
    costToday: number;
  };

  // Configuration
  config: {
    maxConcurrentTasks: number;
    responseTimeout: number;
    learningEnabled: boolean;
    customInstructions: string;
    personality: "professional" | "friendly" | "casual" | "formal" | "creative";
    tone: "helpful" | "concise" | "detailed" | "empathetic" | "assertive";
    confidenceThreshold: number;
    escalationRules: string[];
    workingHours: {
      start: string;
      end: string;
      timezone: string;
      daysOfWeek: string[];
    };
  };

  // Real-time data
  currentTasks: Array<{
    id: string;
    type: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    startTime: string;
    estimatedCompletion: string;
    progress: number;
    userId?: string;
    department?: string;
  }>;

  // Workflow automation
  workflows: Array<{
    id: string;
    name: string;
    description: string;
    triggers: string[];
    actions: Array<{
      type: string;
      config: Record<string, any>;
      nextAction?: string;
    }>;
    isActive: boolean;
    lastRun?: string;
    successRate: number;
    totalRuns: number;
  }>;

  // Integrations
  integrations: Array<{
    id: string;
    service: string;
    status: "connected" | "disconnected" | "error";
    lastSync: string;
    config: Record<string, any>;
  }>;

  // Learning and training data
  training: {
    lastTrainingDate: string;
    datasetSize: number;
    modelAccuracy: number;
    customDatasets: string[];
    feedbackScore: number;
    improvementAreas: string[];
  };

  // Security and permissions
  security: {
    accessLevel: "basic" | "advanced" | "admin" | "system";
    permissions: string[];
    apiKeys: string[];
    encryptionEnabled: boolean;
    auditLog: Array<{
      action: string;
      timestamp: string;
      user: string;
      result: "success" | "failure";
    }>;
  };

  // Analytics and insights
  analytics: {
    dailyStats: Record<string, number>;
    weeklyTrends: Record<string, number[]>;
    topRequests: Array<{ type: string; count: number }>;
    userFeedback: Array<{
      rating: number;
      comment: string;
      timestamp: string;
      user: string;
    }>;
    costAnalysis: {
      tokenCost: number;
      computeCost: number;
      storageCost: number;
      totalCost: number;
    };
  };

  // Time tracking
  createdAt: string;
  lastActive: string;
  totalUptime: string;
  deploymentVersion: string;
  lastUpdate: string;
  nextScheduledMaintenance?: string;
}

interface TeamStructure {
  id: string;
  name: string;
  description: string;
  lead: string;
  members: string[];
  budget: number;
  performance: {
    efficiency: number;
    satisfaction: number;
    tasksCompleted: number;
    costThisMonth: number;
  };
  goals: Array<{
    title: string;
    target: number;
    current: number;
    deadline: string;
  }>;
}

interface AIChat {
  id: string;
  participants: string[];
  messages: Array<{
    id: string;
    sender: string;
    senderType: "human" | "ai" | "system";
    content: string;
    timestamp: string;
    attachments?: Array<{
      type: string;
      url: string;
      name: string;
    }>;
    reactions?: Record<string, string[]>;
  }>;
  topic: string;
  status: "active" | "archived" | "priority";
  createdAt: string;
  lastActivity: string;
}

export default function AdvancedAIEmployeeManager() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [teams, setTeams] = useState<TeamStructure[]>([]);
  const [chats, setChats] = useState<AIChat[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(
    null,
  );
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("performance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadEmployeeData();
    loadTeamData();
    loadChatData();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        loadEmployeeData();
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  const loadEmployeeData = async () => {
    // Simulate API call
    const mockEmployees: AIEmployee[] = [
      {
        id: "lucky-ai",
        name: "Lucky",
        role: "AI Casino Manager",
        department: "Management",
        status: "active",
        avatar: "🍀",
        model: "gpt-4",
        version: "2.1.5",
        specialties: [
          "Operations Management",
          "Fraud Detection",
          "Staff Coordination",
          "Strategic Planning",
        ],
        capabilities: [
          "Natural Language Processing",
          "Decision Making",
          "Risk Assessment",
          "Performance Analysis",
        ],
        languages: ["English", "Spanish", "French", "German"],
        performance: {
          tasksCompleted: 15847,
          tasksInProgress: 12,
          successRate: 99.7,
          averageResponseTime: 1.2,
          accuracy: 99.7,
          efficiency: 97.2,
          userSatisfaction: 98.5,
          errorRate: 0.3,
          uptime: 99.9,
          tokensUsed: 2847293,
          costToday: 234.67,
        },
        config: {
          maxConcurrentTasks: 50,
          responseTimeout: 30,
          learningEnabled: true,
          customInstructions:
            "Focus on casino operations, fraud prevention, and strategic decision making. Maintain professional tone.",
          personality: "professional",
          tone: "helpful",
          confidenceThreshold: 0.85,
          escalationRules: [
            "Critical security issues",
            "Financial discrepancies > $10k",
            "System failures",
          ],
          workingHours: {
            start: "00:00",
            end: "23:59",
            timezone: "UTC",
            daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          },
        },
        currentTasks: [
          {
            id: "task-001",
            type: "Fraud Analysis",
            description:
              "Analyzing suspicious betting patterns from user 'casinofan'",
            priority: "high",
            startTime: new Date().toISOString(),
            estimatedCompletion: new Date(
              Date.now() + 15 * 60 * 1000,
            ).toISOString(),
            progress: 75,
            userId: "casinofan",
            department: "Security",
          },
          {
            id: "task-002",
            type: "Performance Review",
            description:
              "Generating weekly performance report for all departments",
            priority: "medium",
            startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(
              Date.now() + 45 * 60 * 1000,
            ).toISOString(),
            progress: 45,
            department: "Analytics",
          },
        ],
        workflows: [
          {
            id: "workflow-001",
            name: "Fraud Detection Pipeline",
            description: "Automated fraud detection and alert system",
            triggers: [
              "unusual_betting_pattern",
              "multiple_account_access",
              "large_win_sequence",
            ],
            actions: [
              { type: "analyze_patterns", config: { threshold: 0.8 } },
              { type: "generate_alert", config: { severity: "high" } },
              { type: "notify_security", config: { channel: "slack" } },
            ],
            isActive: true,
            lastRun: new Date().toISOString(),
            successRate: 99.2,
            totalRuns: 1456,
          },
        ],
        integrations: [
          {
            id: "int-001",
            service: "Slack",
            status: "connected",
            lastSync: new Date().toISOString(),
            config: { webhook_url: "***", channel: "#casino-alerts" },
          },
          {
            id: "int-002",
            service: "PostgreSQL",
            status: "connected",
            lastSync: new Date().toISOString(),
            config: { host: "db.coinkrazy.com", database: "casino_main" },
          },
        ],
        training: {
          lastTrainingDate: "2024-03-15T10:00:00Z",
          datasetSize: 2847293,
          modelAccuracy: 97.8,
          customDatasets: [
            "casino_transactions",
            "user_behavior",
            "fraud_patterns",
          ],
          feedbackScore: 4.8,
          improvementAreas: [
            "Multi-language support",
            "Emotional intelligence",
          ],
        },
        security: {
          accessLevel: "admin",
          permissions: [
            "read_all_data",
            "write_reports",
            "manage_alerts",
            "access_financial_data",
          ],
          apiKeys: ["openai_key", "claude_key", "internal_api"],
          encryptionEnabled: true,
          auditLog: [
            {
              action: "fraud_analysis_completed",
              timestamp: new Date().toISOString(),
              user: "system",
              result: "success",
            },
          ],
        },
        analytics: {
          dailyStats: {
            tasks_completed: 234,
            fraud_detected: 5,
            reports_generated: 12,
            uptime: 99.9,
          },
          weeklyTrends: {
            efficiency: [95, 96, 97, 98, 97, 96, 97],
            satisfaction: [98, 97, 98, 99, 98, 98, 99],
          },
          topRequests: [
            { type: "fraud_analysis", count: 145 },
            { type: "performance_report", count: 89 },
            { type: "user_inquiry", count: 67 },
          ],
          userFeedback: [
            {
              rating: 5,
              comment: "Excellent fraud detection capabilities",
              timestamp: new Date().toISOString(),
              user: "admin",
            },
          ],
          costAnalysis: {
            tokenCost: 123.45,
            computeCost: 89.12,
            storageCost: 22.1,
            totalCost: 234.67,
          },
        },
        createdAt: "2024-01-15T10:30:00Z",
        lastActive: new Date().toISOString(),
        totalUptime: "99.9%",
        deploymentVersion: "v2.1.5",
        lastUpdate: "2024-03-15T14:30:00Z",
        nextScheduledMaintenance: "2024-03-22T02:00:00Z",
      },
      {
        id: "guardian-ai",
        name: "Guardian",
        role: "Security Specialist",
        department: "Security",
        status: "active",
        avatar: "🛡️",
        model: "claude-3",
        version: "1.8.2",
        specialties: [
          "Fraud Prevention",
          "Account Security",
          "Risk Assessment",
          "Compliance Monitoring",
        ],
        capabilities: [
          "Pattern Recognition",
          "Anomaly Detection",
          "Real-time Monitoring",
          "Threat Analysis",
        ],
        languages: ["English", "Spanish"],
        performance: {
          tasksCompleted: 8934,
          tasksInProgress: 8,
          successRate: 99.1,
          averageResponseTime: 0.8,
          accuracy: 99.1,
          efficiency: 96.8,
          userSatisfaction: 97.3,
          errorRate: 0.9,
          uptime: 99.7,
          tokensUsed: 1567892,
          costToday: 156.23,
        },
        config: {
          maxConcurrentTasks: 30,
          responseTimeout: 20,
          learningEnabled: true,
          customInstructions:
            "Focus on security threats, fraud prevention, and compliance. Escalate critical issues immediately.",
          personality: "professional",
          tone: "assertive",
          confidenceThreshold: 0.9,
          escalationRules: [
            "Security breach detected",
            "Fraud confidence > 95%",
            "Compliance violation",
          ],
          workingHours: {
            start: "00:00",
            end: "23:59",
            timezone: "UTC",
            daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          },
        },
        currentTasks: [
          {
            id: "task-003",
            type: "KYC Review",
            description: "Reviewing KYC documents for new user registrations",
            priority: "medium",
            startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(
              Date.now() + 30 * 60 * 1000,
            ).toISOString(),
            progress: 60,
            department: "Security",
          },
        ],
        workflows: [
          {
            id: "workflow-002",
            name: "KYC Verification Process",
            description: "Automated KYC document verification",
            triggers: ["new_kyc_submission", "document_uploaded"],
            actions: [
              { type: "verify_documents", config: { ai_verification: true } },
              {
                type: "check_sanctions",
                config: { databases: ["OFAC", "EU"] },
              },
              { type: "update_status", config: { approved_threshold: 0.95 } },
            ],
            isActive: true,
            lastRun: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            successRate: 98.7,
            totalRuns: 892,
          },
        ],
        integrations: [
          {
            id: "int-003",
            service: "Jumio",
            status: "connected",
            lastSync: new Date().toISOString(),
            config: {
              api_endpoint: "api.jumio.com",
              verification_level: "strict",
            },
          },
        ],
        training: {
          lastTrainingDate: "2024-03-10T09:00:00Z",
          datasetSize: 1567892,
          modelAccuracy: 96.2,
          customDatasets: ["kyc_documents", "fraud_cases", "compliance_rules"],
          feedbackScore: 4.6,
          improvementAreas: [
            "Document recognition",
            "False positive reduction",
          ],
        },
        security: {
          accessLevel: "advanced",
          permissions: [
            "access_security_data",
            "manage_kyc",
            "fraud_investigation",
          ],
          apiKeys: ["jumio_key", "sanctions_api"],
          encryptionEnabled: true,
          auditLog: [
            {
              action: "kyc_verification_completed",
              timestamp: new Date().toISOString(),
              user: "system",
              result: "success",
            },
          ],
        },
        analytics: {
          dailyStats: {
            kyc_reviews: 45,
            fraud_flags: 3,
            compliance_checks: 156,
            uptime: 99.7,
          },
          weeklyTrends: {
            efficiency: [96, 97, 96, 97, 98, 96, 97],
            satisfaction: [97, 96, 97, 98, 97, 97, 98],
          },
          topRequests: [
            { type: "kyc_verification", count: 156 },
            { type: "fraud_check", count: 89 },
            { type: "compliance_audit", count: 45 },
          ],
          userFeedback: [
            {
              rating: 4,
              comment: "Good security coverage, occasionally cautious",
              timestamp: new Date().toISOString(),
              user: "compliance_officer",
            },
          ],
          costAnalysis: {
            tokenCost: 89.12,
            computeCost: 45.67,
            storageCost: 21.44,
            totalCost: 156.23,
          },
        },
        createdAt: "2024-01-20T11:15:00Z",
        lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        totalUptime: "99.7%",
        deploymentVersion: "v1.8.2",
        lastUpdate: "2024-03-10T16:20:00Z",
        nextScheduledMaintenance: "2024-03-25T03:00:00Z",
      },
      {
        id: "helper-ai",
        name: "Helper",
        role: "Customer Support Lead",
        department: "Support",
        status: "active",
        avatar: "🤝",
        model: "gemini-pro",
        version: "1.5.1",
        specialties: [
          "Customer Service",
          "Technical Support",
          "Ticket Resolution",
          "User Guidance",
        ],
        capabilities: [
          "Multi-language Support",
          "Sentiment Analysis",
          "Issue Categorization",
          "Solution Recommendation",
        ],
        languages: ["English", "Spanish", "French", "German", "Italian"],
        performance: {
          tasksCompleted: 12456,
          tasksInProgress: 23,
          successRate: 97.8,
          averageResponseTime: 2.1,
          accuracy: 97.8,
          efficiency: 94.5,
          userSatisfaction: 96.7,
          errorRate: 2.2,
          uptime: 99.5,
          tokensUsed: 3456789,
          costToday: 345.89,
        },
        config: {
          maxConcurrentTasks: 100,
          responseTimeout: 60,
          learningEnabled: true,
          customInstructions:
            "Provide helpful, empathetic customer support. Always try to resolve issues on first contact.",
          personality: "friendly",
          tone: "empathetic",
          confidenceThreshold: 0.75,
          escalationRules: [
            "Customer extremely dissatisfied",
            "Technical issue beyond scope",
            "Refund request > $500",
          ],
          workingHours: {
            start: "06:00",
            end: "22:00",
            timezone: "UTC",
            daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          },
        },
        currentTasks: [
          {
            id: "task-004",
            type: "Live Chat Support",
            description: "Assisting customer with bonus claim issue",
            priority: "medium",
            startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(
              Date.now() + 10 * 60 * 1000,
            ).toISOString(),
            progress: 30,
            userId: "customer_123",
            department: "Support",
          },
          {
            id: "task-005",
            type: "Email Response",
            description: "Responding to withdrawal inquiry",
            priority: "low",
            startTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            estimatedCompletion: new Date(
              Date.now() + 5 * 60 * 1000,
            ).toISOString(),
            progress: 80,
            userId: "customer_456",
            department: "Support",
          },
        ],
        workflows: [
          {
            id: "workflow-003",
            name: "Ticket Auto-Resolution",
            description: "Automatically resolve common support tickets",
            triggers: [
              "new_support_ticket",
              "password_reset_request",
              "bonus_inquiry",
            ],
            actions: [
              {
                type: "categorize_ticket",
                config: { confidence_threshold: 0.8 },
              },
              { type: "search_knowledge_base", config: { max_results: 5 } },
              { type: "generate_response", config: { personalized: true } },
              { type: "send_response", config: { auto_send: true } },
            ],
            isActive: true,
            lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            successRate: 89.3,
            totalRuns: 5678,
          },
        ],
        integrations: [
          {
            id: "int-004",
            service: "Zendesk",
            status: "connected",
            lastSync: new Date().toISOString(),
            config: { subdomain: "coinkrazy", api_token: "***" },
          },
          {
            id: "int-005",
            service: "Intercom",
            status: "connected",
            lastSync: new Date().toISOString(),
            config: { app_id: "***", access_token: "***" },
          },
        ],
        training: {
          lastTrainingDate: "2024-03-12T14:00:00Z",
          datasetSize: 3456789,
          modelAccuracy: 94.1,
          customDatasets: [
            "support_tickets",
            "faq_data",
            "customer_interactions",
          ],
          feedbackScore: 4.3,
          improvementAreas: [
            "Technical issue resolution",
            "Complex refund cases",
          ],
        },
        security: {
          accessLevel: "basic",
          permissions: [
            "access_support_data",
            "respond_to_tickets",
            "update_user_profiles",
          ],
          apiKeys: ["zendesk_key", "intercom_key"],
          encryptionEnabled: true,
          auditLog: [
            {
              action: "ticket_resolved",
              timestamp: new Date().toISOString(),
              user: "system",
              result: "success",
            },
          ],
        },
        analytics: {
          dailyStats: {
            tickets_handled: 234,
            auto_resolved: 189,
            escalations: 12,
            satisfaction: 96.7,
          },
          weeklyTrends: {
            efficiency: [94, 95, 94, 95, 96, 94, 95],
            satisfaction: [96, 97, 96, 97, 98, 96, 97],
          },
          topRequests: [
            { type: "bonus_inquiry", count: 89 },
            { type: "password_reset", count: 67 },
            { type: "withdrawal_question", count: 45 },
          ],
          userFeedback: [
            {
              rating: 4,
              comment: "Quick responses but sometimes needs human intervention",
              timestamp: new Date().toISOString(),
              user: "customer_789",
            },
          ],
          costAnalysis: {
            tokenCost: 234.56,
            computeCost: 78.9,
            storageCost: 32.43,
            totalCost: 345.89,
          },
        },
        createdAt: "2024-01-25T13:45:00Z",
        lastActive: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        totalUptime: "99.5%",
        deploymentVersion: "v1.5.1",
        lastUpdate: "2024-03-12T18:15:00Z",
        nextScheduledMaintenance: "2024-03-28T01:30:00Z",
      },
    ];

    setEmployees(mockEmployees);
  };

  const loadTeamData = async () => {
    const mockTeams: TeamStructure[] = [
      {
        id: "team-management",
        name: "Management Team",
        description: "Executive and strategic management",
        lead: "lucky-ai",
        members: ["lucky-ai"],
        budget: 10000,
        performance: {
          efficiency: 97.2,
          satisfaction: 98.5,
          tasksCompleted: 456,
          costThisMonth: 2345.67,
        },
        goals: [
          {
            title: "System Uptime",
            target: 99.9,
            current: 99.7,
            deadline: "2024-03-31",
          },
          {
            title: "User Satisfaction",
            target: 98.0,
            current: 98.5,
            deadline: "2024-03-31",
          },
        ],
      },
      {
        id: "team-security",
        name: "Security Team",
        description: "Fraud prevention and security monitoring",
        lead: "guardian-ai",
        members: ["guardian-ai"],
        budget: 8000,
        performance: {
          efficiency: 96.8,
          satisfaction: 97.3,
          tasksCompleted: 234,
          costThisMonth: 1567.89,
        },
        goals: [
          {
            title: "Fraud Detection Rate",
            target: 99.0,
            current: 99.1,
            deadline: "2024-03-31",
          },
          {
            title: "False Positives",
            target: 2.0,
            current: 1.8,
            deadline: "2024-03-31",
          },
        ],
      },
      {
        id: "team-support",
        name: "Support Team",
        description: "Customer service and technical support",
        lead: "helper-ai",
        members: ["helper-ai"],
        budget: 12000,
        performance: {
          efficiency: 94.5,
          satisfaction: 96.7,
          tasksCompleted: 789,
          costThisMonth: 3456.78,
        },
        goals: [
          {
            title: "First Contact Resolution",
            target: 85.0,
            current: 89.3,
            deadline: "2024-03-31",
          },
          {
            title: "Response Time",
            target: 30.0,
            current: 2.1,
            deadline: "2024-03-31",
          },
        ],
      },
    ];

    setTeams(mockTeams);
  };

  const loadChatData = async () => {
    const mockChats: AIChat[] = [
      {
        id: "chat-001",
        participants: ["admin", "lucky-ai", "guardian-ai"],
        messages: [
          {
            id: "msg-001",
            sender: "admin",
            senderType: "human",
            content:
              "Lucky, can you provide a summary of today's fraud detection activities?",
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          },
          {
            id: "msg-002",
            sender: "lucky-ai",
            senderType: "ai",
            content:
              "Certainly! Guardian and I detected 5 potential fraud cases today. All have been flagged for review. The system blocked $12,450 in suspicious transactions. Guardian, would you like to add details about the KYC reviews?",
            timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          },
          {
            id: "msg-003",
            sender: "guardian-ai",
            senderType: "ai",
            content:
              "Yes, I completed 45 KYC reviews today with a 98.7% automated approval rate. 3 cases were escalated for manual review due to document quality issues.",
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
        ],
        topic: "Daily Security Review",
        status: "active",
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ];

    setChats(mockChats);
  };

  const controlEmployee = (
    employeeId: string,
    action: "start" | "stop" | "restart" | "maintenance",
  ) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          let newStatus: AIEmployee["status"];
          switch (action) {
            case "start":
              newStatus = "active";
              break;
            case "stop":
              newStatus = "offline";
              break;
            case "restart":
              newStatus = "maintenance";
              setTimeout(() => {
                setEmployees((prev) =>
                  prev.map((e) =>
                    e.id === employeeId
                      ? { ...e, status: "active" as const }
                      : e,
                  ),
                );
              }, 5000);
              break;
            case "maintenance":
              newStatus = "maintenance";
              break;
            default:
              newStatus = emp.status;
          }
          return {
            ...emp,
            status: newStatus,
            lastActive: new Date().toISOString(),
          };
        }
        return emp;
      }),
    );
  };

  const sendMessage = () => {
    if (!currentMessage.trim() || !selectedChat) return;

    const chat = chats.find((c) => c.id === selectedChat);
    if (!chat) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      sender: "admin",
      senderType: "human" as const,
      content: currentMessage,
      timestamp: new Date().toISOString(),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat
          ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastActivity: new Date().toISOString(),
            }
          : c,
      ),
    );

    setCurrentMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiEmployee = employees.find(
        (emp) => chat.participants.includes(emp.id) && emp.status === "active",
      );

      if (aiEmployee) {
        const aiResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: aiEmployee.id,
          senderType: "ai" as const,
          content: generateAIResponse(currentMessage, aiEmployee),
          timestamp: new Date().toISOString(),
        };

        setChats((prev) =>
          prev.map((c) =>
            c.id === selectedChat
              ? { ...c, messages: [...c.messages, aiResponse] }
              : c,
          ),
        );
      }
    }, 1500);
  };

  const generateAIResponse = (input: string, employee: AIEmployee): string => {
    const responses = {
      "lucky-ai": [
        "I'll analyze that data and provide insights within the next few minutes.",
        "Based on current patterns, I recommend implementing additional security measures.",
        "The fraud detection system is operating at 99.7% efficiency. All alerts have been addressed.",
        "I've coordinated with the security team to investigate this further.",
      ],
      "guardian-ai": [
        "Security protocols are in place and monitoring systems are active.",
        "I've flagged this for immediate review and enhanced monitoring.",
        "All KYC verifications are current and compliant with regulations.",
        "The suspicious activity has been contained and is under investigation.",
      ],
      "helper-ai": [
        "I'm currently assisting customers with similar inquiries and can provide guidance.",
        "The support ticket volume is manageable and response times are optimal.",
        "I've updated the knowledge base with new information to improve future responses.",
        "Customer satisfaction remains high at 96.7% across all support channels.",
      ],
    };

    const employeeResponses =
      responses[employee.id as keyof typeof responses] || responses["lucky-ai"];
    return employeeResponses[
      Math.floor(Math.random() * employeeResponses.length)
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "offline":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "busy":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "maintenance":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "error":
        return "text-red-600 bg-red-600/10 border-red-600/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getDepartmentColor = (dept: string) => {
    switch (dept.toLowerCase()) {
      case "management":
        return "text-purple-500 bg-purple-500/10";
      case "security":
        return "text-red-500 bg-red-500/10";
      case "support":
        return "text-blue-500 bg-blue-500/10";
      case "analytics":
        return "text-green-500 bg-green-500/10";
      case "gaming":
        return "text-orange-500 bg-orange-500/10";
      case "finance":
        return "text-yellow-500 bg-yellow-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.specialties.some((s) =>
        s.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesDepartment =
      filterDepartment === "all" || emp.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalCost = employees.reduce(
    (sum, emp) => sum + emp.performance.costToday,
    0,
  );
  const activeEmployees = employees.filter(
    (emp) => emp.status === "active",
  ).length;
  const totalTasks = employees.reduce(
    (sum, emp) => sum + emp.performance.tasksCompleted,
    0,
  );
  const averageEfficiency =
    employees.reduce((sum, emp) => sum + emp.performance.efficiency, 0) /
    employees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                Advanced AI Employee Manager
                <Badge className="bg-purple-600 text-white">Enterprise</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Comprehensive AI workforce management with advanced analytics
                and automation
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {activeEmployees}/{employees.length}
                </div>
                <div className="text-sm text-muted-foreground">Active AIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalCost)}
                </div>
                <div className="text-sm text-muted-foreground">Daily Cost</div>
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setIsCreatingEmployee(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Deploy AI
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Bot className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{employees.length}</div>
            <div className="text-sm text-muted-foreground">AI Employees</div>
            <div className="text-xs text-green-500">+2 this month</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <div className="text-sm text-muted-foreground">Active Now</div>
            <div className="text-xs text-green-500">
              {averageEfficiency.toFixed(1)}% efficiency
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {totalTasks.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Today</div>
            <div className="text-xs text-blue-500">+15% from yesterday</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {formatCurrency(totalCost)}
            </div>
            <div className="text-sm text-muted-foreground">Daily Cost</div>
            <div className="text-xs text-green-500">-8% from target</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {(
                employees.reduce(
                  (sum, emp) => sum + emp.performance.userSatisfaction,
                  0,
                ) / employees.length
              ).toFixed(1)}
              %
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
            <div className="text-xs text-green-500">Above target</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">
              {employees.reduce(
                (sum, emp) =>
                  sum +
                  emp.currentTasks.filter(
                    (t) => t.priority === "urgent" || t.priority === "high",
                  ).length,
                0,
              )}
            </div>
            <div className="text-sm text-muted-foreground">Priority Tasks</div>
            <div className="text-xs text-orange-500">Needs attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-2xl grid-cols-6">
            <TabsTrigger value="dashboard">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Users className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="teams">
              <Crown className="w-4 h-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Workflow className="w-4 h-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <PieChart className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
              />
              Auto Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Average Efficiency</span>
                      <span className="font-mono">
                        {averageEfficiency.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={averageEfficiency} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Satisfaction</span>
                      <span className="font-mono">
                        {(
                          employees.reduce(
                            (sum, emp) =>
                              sum + emp.performance.userSatisfaction,
                            0,
                          ) / employees.length
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        employees.reduce(
                          (sum, emp) => sum + emp.performance.userSatisfaction,
                          0,
                        ) / employees.length
                      }
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uptime</span>
                      <span className="font-mono">
                        {(
                          employees.reduce(
                            (sum, emp) => sum + emp.performance.uptime,
                            0,
                          ) / employees.length
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        employees.reduce(
                          (sum, emp) => sum + emp.performance.uptime,
                          0,
                        ) / employees.length
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.flatMap((emp) =>
                    emp.currentTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 bg-muted/20 rounded"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {task.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {emp.name} • {task.type}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              task.priority === "urgent"
                                ? "bg-red-500"
                                : task.priority === "high"
                                  ? "bg-orange-500"
                                  : task.priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }
                          >
                            {task.priority}
                          </Badge>
                          <div className="text-xs font-mono">
                            {task.progress}%
                          </div>
                        </div>
                      </div>
                    )),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Today's Cost</span>
                    <span className="font-mono font-bold">
                      {formatCurrency(totalCost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Projected Monthly</span>
                    <span className="font-mono">
                      {formatCurrency(totalCost * 30)}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    {employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{emp.name}</span>
                        <span className="font-mono">
                          {formatCurrency(emp.performance.costToday)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold">{team.name}</h3>
                      <Badge className={getDepartmentColor(team.name)}>
                        {team.members.length} members
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-bold text-green-500">
                          {team.performance.efficiency}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Satisfaction:</span>
                        <span className="font-bold text-blue-500">
                          {team.performance.satisfaction}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tasks:</span>
                        <span className="font-mono">
                          {team.performance.tasksCompleted}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-mono">
                          {formatCurrency(team.performance.costThisMonth)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-muted-foreground mb-1">
                        Goals Progress
                      </div>
                      {team.goals.map((goal, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between text-xs">
                            <span>{goal.title}</span>
                            <span>
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                          <Progress
                            value={(goal.current / goal.target) * 100}
                            className="h-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>

                  <Select
                    value={filterDepartment}
                    onValueChange={setFilterDepartment}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                  >
                    {viewMode === "grid" ? (
                      <BarChart3 className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy AI
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <Card
                  key={employee.id}
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center text-2xl">
                          {employee.avatar}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-purple-600 transition-colors">
                            {employee.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {employee.role}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                            <Badge
                              className={getDepartmentColor(
                                employee.department,
                              )}
                            >
                              {employee.department}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            controlEmployee(
                              employee.id,
                              employee.status === "active" ? "stop" : "start",
                            )
                          }
                        >
                          {employee.status === "active" ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Efficiency</span>
                          <span className="font-mono">
                            {employee.performance.efficiency}%
                          </span>
                        </div>
                        <Progress
                          value={employee.performance.efficiency}
                          className="h-1.5"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Satisfaction</span>
                          <span className="font-mono">
                            {employee.performance.userSatisfaction}%
                          </span>
                        </div>
                        <Progress
                          value={employee.performance.userSatisfaction}
                          className="h-1.5"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Uptime</span>
                          <span className="font-mono">
                            {employee.performance.uptime}%
                          </span>
                        </div>
                        <Progress
                          value={employee.performance.uptime}
                          className="h-1.5"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                      <div>
                        <span className="text-muted-foreground">Tasks:</span>
                        <span className="ml-1 font-mono">
                          {employee.performance.tasksCompleted}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <span className="ml-1 font-mono">{employee.model}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <span className="ml-1 font-mono">
                          {employee.performance.averageResponseTime}s
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="ml-1 font-mono">
                          {formatCurrency(employee.performance.costToday)}
                        </span>
                      </div>
                    </div>

                    {/* Current Tasks */}
                    {employee.currentTasks.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-medium mb-2">
                          Current Tasks:
                        </div>
                        <div className="space-y-1">
                          {employee.currentTasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className="text-xs p-2 bg-muted/20 rounded"
                            >
                              <div className="font-medium">{task.type}</div>
                              <div className="text-muted-foreground line-clamp-1">
                                {task.description}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <Badge
                                  className={
                                    task.priority === "urgent"
                                      ? "bg-red-500 text-xs"
                                      : task.priority === "high"
                                        ? "bg-orange-500 text-xs"
                                        : task.priority === "medium"
                                          ? "bg-yellow-500 text-xs"
                                          : "bg-green-500 text-xs"
                                  }
                                >
                                  {task.priority}
                                </Badge>
                                <span className="font-mono text-xs">
                                  {task.progress}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Terminal className="w-3 h-3 mr-1" />
                        Console
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Employee</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Performance</th>
                        <th className="p-4 font-medium">Tasks</th>
                        <th className="p-4 font-medium">Cost</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b hover:bg-muted/20"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{employee.avatar}</div>
                              <div>
                                <div className="font-medium">
                                  {employee.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {employee.role}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {employee.department}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(employee.status)}>
                              {employee.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="text-sm space-y-1">
                              <div>
                                Efficiency: {employee.performance.efficiency}%
                              </div>
                              <div>
                                Satisfaction:{" "}
                                {employee.performance.userSatisfaction}%
                              </div>
                              <div>Uptime: {employee.performance.uptime}%</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div>
                                Completed: {employee.performance.tasksCompleted}
                              </div>
                              <div>
                                In Progress:{" "}
                                {employee.performance.tasksInProgress}
                              </div>
                              <div>
                                Success Rate: {employee.performance.successRate}
                                %
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div>
                                {formatCurrency(employee.performance.costToday)}
                              </div>
                              <div className="text-muted-foreground">today</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  controlEmployee(
                                    employee.id,
                                    employee.status === "active"
                                      ? "stop"
                                      : "start",
                                  )
                                }
                              >
                                {employee.status === "active" ? (
                                  <Pause className="w-3 h-3" />
                                ) : (
                                  <Play className="w-3 h-3" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedEmployee(employee)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5" />
                        {team.name}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {team.description}
                      </p>
                    </div>
                    <Badge className={getDepartmentColor(team.name)}>
                      {team.members.length} members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Lead:</span>
                      <span className="ml-1 font-medium">
                        {employees.find((emp) => emp.id === team.lead)?.name ||
                          "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="ml-1 font-mono">
                        {formatCurrency(team.budget)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="ml-1 font-bold text-green-500">
                        {team.performance.efficiency}%
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Satisfaction:
                      </span>
                      <span className="ml-1 font-bold text-blue-500">
                        {team.performance.satisfaction}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm mb-2">
                      Team Members:
                    </div>
                    <div className="space-y-2">
                      {team.members.map((memberId) => {
                        const member = employees.find(
                          (emp) => emp.id === memberId,
                        );
                        return member ? (
                          <div
                            key={memberId}
                            className="flex items-center justify-between p-2 bg-muted/20 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{member.avatar}</span>
                              <div>
                                <div className="font-medium text-sm">
                                  {member.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {member.role}
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-sm mb-2">
                      Goals Progress:
                    </div>
                    <div className="space-y-2">
                      {team.goals.map((goal, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-xs mb-1">
                            <span>{goal.title}</span>
                            <span>
                              {goal.current}/{goal.target}
                            </span>
                          </div>
                          <Progress
                            value={(goal.current / goal.target) * 100}
                            className="h-1.5"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create Team Card */}
            <Card className="border-dashed border-2 hover:border-purple-500 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="py-8">
                  <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Create New Team</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Organize AI employees into specialized teams for better
                    coordination
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">AI Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id)}
                      className={`p-3 cursor-pointer hover:bg-muted/20 transition-colors ${
                        selectedChat === chat.id
                          ? "bg-purple-500/10 border-r-2 border-purple-500"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{chat.topic}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.participants
                          .filter((p) => p !== "admin")
                          .map(
                            (p) =>
                              employees.find((emp) => emp.id === p)?.name || p,
                          )
                          .join(", ")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(chat.lastActivity).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Messages */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedChat
                      ? chats.find((c) => c.id === selectedChat)?.topic
                      : "Select a conversation"}
                  </CardTitle>
                  {selectedChat && (
                    <div className="flex items-center gap-2">
                      {chats
                        .find((c) => c.id === selectedChat)
                        ?.participants.filter((p) => p !== "admin")
                        .map((p) => employees.find((emp) => emp.id === p))
                        .filter(Boolean)
                        .map((emp) => (
                          <Badge
                            key={emp!.id}
                            className={getStatusColor(emp!.status)}
                          >
                            {emp!.avatar} {emp!.name}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-96">
                {selectedChat ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {chats
                        .find((c) => c.id === selectedChat)
                        ?.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderType === "human" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.senderType === "human"
                                  ? "bg-purple-500 text-white"
                                  : message.senderType === "ai"
                                    ? "bg-blue-500 text-white"
                                    : "bg-muted"
                              }`}
                            >
                              {message.senderType !== "human" && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Bot className="w-3 h-3" />
                                  <span className="text-xs font-medium">
                                    {employees.find(
                                      (emp) => emp.id === message.sender,
                                    )?.name || message.sender}
                                  </span>
                                </div>
                              )}
                              <div className="text-sm">{message.content}</div>
                              <div className="text-xs opacity-70 mt-1">
                                {new Date(
                                  message.timestamp,
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message to AI employees..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!currentMessage.trim()}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a conversation to start chatting with AI
                        employees
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees
              .flatMap((emp) => emp.workflows)
              .map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <Badge
                        className={
                          workflow.isActive ? "bg-green-500" : "bg-gray-500"
                        }
                      >
                        {workflow.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Success Rate:
                        </span>
                        <span className="ml-1 font-bold text-green-500">
                          {workflow.successRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Total Runs:
                        </span>
                        <span className="ml-1 font-mono">
                          {workflow.totalRuns}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Last Run:</span>
                        <span className="ml-1 text-xs">
                          {workflow.lastRun
                            ? new Date(workflow.lastRun).toLocaleString()
                            : "Never"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Triggers:</div>
                      <div className="flex flex-wrap gap-1">
                        {workflow.triggers.map((trigger, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {trigger.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2">Actions:</div>
                      <div className="space-y-1">
                        {workflow.actions.slice(0, 3).map((action, index) => (
                          <div
                            key={index}
                            className="text-xs p-2 bg-muted/20 rounded"
                          >
                            {action.type.replace(/_/g, " ")}
                          </div>
                        ))}
                        {workflow.actions.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{workflow.actions.length - 3} more actions
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {/* Create Workflow Card */}
            <Card className="border-dashed border-2 hover:border-purple-500 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="py-8">
                  <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Create Workflow</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automate AI employee tasks with custom workflows
                  </p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Performance trends chart
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Efficiency, satisfaction, uptime over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Cost breakdown chart
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Token, compute, storage costs by employee
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{employee.avatar}</span>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {employee.department}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tasks Today:</span>
                      <span className="font-mono">
                        {employee.analytics.dailyStats.tasks_completed ||
                          employee.performance.tasksCompleted}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Cost:</span>
                      <span className="font-mono">
                        {formatCurrency(
                          employee.analytics.costAnalysis.tokenCost,
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Feedback Score:</span>
                      <span className="font-mono">
                        {employee.training.feedbackScore}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Model Accuracy:</span>
                      <span className="font-mono">
                        {employee.training.modelAccuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs font-medium mb-1">
                      Top Requests:
                    </div>
                    {employee.analytics.topRequests
                      .slice(0, 2)
                      .map((req, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs"
                        >
                          <span className="capitalize">
                            {req.type.replace(/_/g, " ")}
                          </span>
                          <span className="font-mono">{req.count}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Overview */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {employees.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total AI Employees
                  </div>
                  <div className="text-xs text-green-500">
                    +
                    {
                      employees.filter(
                        (emp) =>
                          new Date(emp.createdAt) >
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      ).length
                    }{" "}
                    this month
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {totalTasks.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Tasks Completed
                  </div>
                  <div className="text-xs text-blue-500">
                    {employees.reduce(
                      (sum, emp) => sum + emp.performance.tasksInProgress,
                      0,
                    )}{" "}
                    in progress
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {(
                      employees.reduce(
                        (sum, emp) => sum + emp.performance.successRate,
                        0,
                      ) / employees.length
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Success Rate
                  </div>
                  <div className="text-xs text-green-500">
                    Above industry average
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(totalCost * 30)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Projected Monthly Cost
                  </div>
                  <div className="text-xs text-green-500">
                    -12% from last month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <Dialog
          open={!!selectedEmployee}
          onOpenChange={() => setSelectedEmployee(null)}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{selectedEmployee.avatar}</span>
                {selectedEmployee.name}
                <Badge className={getStatusColor(selectedEmployee.status)}>
                  {selectedEmployee.status}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {selectedEmployee.role} • {selectedEmployee.department} •{" "}
                {selectedEmployee.model} {selectedEmployee.version}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Model:</span>
                          <span className="ml-1 font-mono">
                            {selectedEmployee.model}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Version:
                          </span>
                          <span className="ml-1 font-mono">
                            {selectedEmployee.version}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Department:
                          </span>
                          <span className="ml-1">
                            {selectedEmployee.department}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Access Level:
                          </span>
                          <span className="ml-1 capitalize">
                            {selectedEmployee.security.accessLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Deployed:
                          </span>
                          <span className="ml-1">
                            {new Date(
                              selectedEmployee.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Last Active:
                          </span>
                          <span className="ml-1">
                            {new Date(
                              selectedEmployee.lastActive,
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Capabilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium text-sm mb-2">
                            Specialties:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedEmployee.specialties.map(
                              (specialty, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-sm mb-2">
                            Capabilities:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedEmployee.capabilities.map(
                              (capability, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {capability}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium text-sm mb-2">
                            Languages:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedEmployee.languages.map(
                              (language, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {language}
                                </Badge>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cost Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Token Cost:</span>
                          <span className="font-mono">
                            {formatCurrency(
                              selectedEmployee.analytics.costAnalysis.tokenCost,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compute Cost:</span>
                          <span className="font-mono">
                            {formatCurrency(
                              selectedEmployee.analytics.costAnalysis
                                .computeCost,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Cost:</span>
                          <span className="font-mono">
                            {formatCurrency(
                              selectedEmployee.analytics.costAnalysis
                                .storageCost,
                            )}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total Today:</span>
                          <span className="font-mono">
                            {formatCurrency(
                              selectedEmployee.analytics.costAnalysis.totalCost,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Projected Monthly:</span>
                          <span className="font-mono">
                            {formatCurrency(
                              selectedEmployee.analytics.costAnalysis
                                .totalCost * 30,
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedEmployee.integrations.map((integration) => (
                        <div
                          key={integration.id}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded"
                        >
                          <div>
                            <div className="font-medium">
                              {integration.service}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Last sync:{" "}
                              {new Date(
                                integration.lastSync,
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge
                            className={
                              integration.status === "connected"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }
                          >
                            {integration.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {selectedEmployee.performance.tasksCompleted}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tasks Completed
                      </div>
                      <div className="text-xs text-green-500">
                        +{selectedEmployee.performance.tasksInProgress} in
                        progress
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {selectedEmployee.performance.successRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Success Rate
                      </div>
                      <div className="text-xs text-blue-500">Above average</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {selectedEmployee.performance.averageResponseTime}s
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg Response
                      </div>
                      <div className="text-xs text-green-500">
                        Fast response
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">
                        {selectedEmployee.performance.userSatisfaction}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        User Satisfaction
                      </div>
                      <div className="text-xs text-green-500">
                        Excellent rating
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Efficiency</span>
                            <span className="font-mono">
                              {selectedEmployee.performance.efficiency}%
                            </span>
                          </div>
                          <Progress
                            value={selectedEmployee.performance.efficiency}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Accuracy</span>
                            <span className="font-mono">
                              {selectedEmployee.performance.accuracy}%
                            </span>
                          </div>
                          <Progress
                            value={selectedEmployee.performance.accuracy}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Uptime</span>
                            <span className="font-mono">
                              {selectedEmployee.performance.uptime}%
                            </span>
                          </div>
                          <Progress
                            value={selectedEmployee.performance.uptime}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Error Rate</span>
                            <span className="font-mono">
                              {selectedEmployee.performance.errorRate}%
                            </span>
                          </div>
                          <Progress
                            value={selectedEmployee.performance.errorRate}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <LineChart className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Weekly performance trends
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="space-y-4">
                  {selectedEmployee.currentTasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{task.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                task.priority === "urgent"
                                  ? "bg-red-500"
                                  : task.priority === "high"
                                    ? "bg-orange-500"
                                    : task.priority === "medium"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                              }
                            >
                              {task.priority}
                            </Badge>
                            <span className="font-mono text-sm">
                              {task.progress}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Started:
                              </span>
                              <span className="ml-1">
                                {new Date(task.startTime).toLocaleTimeString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                ETA:
                              </span>
                              <span className="ml-1">
                                {new Date(
                                  task.estimatedCompletion,
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                            {task.userId && (
                              <div>
                                <span className="text-muted-foreground">
                                  User:
                                </span>
                                <span className="ml-1">{task.userId}</span>
                              </div>
                            )}
                            {task.department && (
                              <div>
                                <span className="text-muted-foreground">
                                  Department:
                                </span>
                                <span className="ml-1">{task.department}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {selectedEmployee.currentTasks.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No active tasks. Employee is ready for new
                          assignments.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="workflows" className="space-y-4">
                {selectedEmployee.workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {workflow.name}
                        </CardTitle>
                        <Badge
                          className={
                            workflow.isActive ? "bg-green-500" : "bg-gray-500"
                          }
                        >
                          {workflow.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {workflow.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Success Rate:
                          </span>
                          <span className="ml-1 font-bold text-green-500">
                            {workflow.successRate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Total Runs:
                          </span>
                          <span className="ml-1 font-mono">
                            {workflow.totalRuns}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Last Run:
                          </span>
                          <span className="ml-1 text-xs">
                            {workflow.lastRun
                              ? new Date(workflow.lastRun).toLocaleString()
                              : "Never"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm mb-2">
                          Triggers:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.triggers.map((trigger, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {trigger.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm mb-2">Actions:</div>
                        <div className="space-y-2">
                          {workflow.actions.map((action, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted/20 rounded"
                            >
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {action.type.replace(/_/g, " ")}
                                </div>
                                {Object.keys(action.config).length > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    Config:{" "}
                                    {Object.entries(action.config)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit Workflow
                        </Button>
                        <Button size="sm" variant="outline">
                          <Play className="w-3 h-3 mr-1" />
                          Test Run
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="training" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Training Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Last Training:
                          </span>
                          <span className="ml-1">
                            {new Date(
                              selectedEmployee.training.lastTrainingDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Dataset Size:
                          </span>
                          <span className="ml-1 font-mono">
                            {selectedEmployee.training.datasetSize.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Model Accuracy:
                          </span>
                          <span className="ml-1 font-bold text-green-500">
                            {selectedEmployee.training.modelAccuracy}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Feedback Score:
                          </span>
                          <span className="ml-1 font-bold text-yellow-500">
                            {selectedEmployee.training.feedbackScore}/5
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm mb-2">
                          Custom Datasets:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedEmployee.training.customDatasets.map(
                            (dataset, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {dataset.replace(/_/g, " ")}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-sm mb-2">
                          Improvement Areas:
                        </div>
                        <ul className="text-sm space-y-1">
                          {selectedEmployee.training.improvementAreas.map(
                            (area, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Target className="w-3 h-3 text-orange-500" />
                                {area}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>User Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedEmployee.analytics.userFeedback.map(
                          (feedback, index) => (
                            <div
                              key={index}
                              className="p-3 bg-muted/20 rounded"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < feedback.rating
                                          ? "text-yellow-500 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {feedback.user}
                                </span>
                              </div>
                              <p className="text-sm">{feedback.comment}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(feedback.timestamp).toLocaleString()}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <Label>Max Concurrent Tasks</Label>
                          <Input
                            type="number"
                            value={selectedEmployee.config.maxConcurrentTasks}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Response Timeout (s)</Label>
                          <Input
                            type="number"
                            value={selectedEmployee.config.responseTimeout}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Personality</Label>
                          <Select value={selectedEmployee.config.personality}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="professional">
                                Professional
                              </SelectItem>
                              <SelectItem value="friendly">Friendly</SelectItem>
                              <SelectItem value="casual">Casual</SelectItem>
                              <SelectItem value="formal">Formal</SelectItem>
                              <SelectItem value="creative">Creative</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tone</Label>
                          <Select value={selectedEmployee.config.tone}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="helpful">Helpful</SelectItem>
                              <SelectItem value="concise">Concise</SelectItem>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="empathetic">
                                Empathetic
                              </SelectItem>
                              <SelectItem value="assertive">
                                Assertive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={selectedEmployee.config.learningEnabled}
                        />
                        <Label>Enable Learning Mode</Label>
                      </div>

                      <div>
                        <Label>Custom Instructions</Label>
                        <Textarea
                          value={selectedEmployee.config.customInstructions}
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Access Level</Label>
                        <Select value={selectedEmployee.security.accessLevel}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={selectedEmployee.security.encryptionEnabled}
                        />
                        <Label>Enable Encryption</Label>
                      </div>

                      <div>
                        <Label>Permissions</Label>
                        <div className="mt-2 space-y-2">
                          {selectedEmployee.security.permissions.map(
                            (permission, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Switch checked={true} />
                                <Label className="capitalize">
                                  {permission.replace(/_/g, " ")}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Working Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={selectedEmployee.config.workingHours.start}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={selectedEmployee.config.workingHours.end}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Timezone</Label>
                        <Select
                          value={selectedEmployee.config.workingHours.timezone}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="EST">Eastern</SelectItem>
                            <SelectItem value="PST">Pacific</SelectItem>
                            <SelectItem value="CST">Central</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>Working Days</Label>
                      <div className="mt-2 flex gap-2">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <div
                              key={day}
                              className="flex items-center space-x-1"
                            >
                              <Switch
                                checked={selectedEmployee.config.workingHours.daysOfWeek.includes(
                                  day,
                                )}
                              />
                              <Label className="text-xs">{day}</Label>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Save Changes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
