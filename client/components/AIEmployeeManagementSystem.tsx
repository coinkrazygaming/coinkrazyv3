import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Bot,
  Brain,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  Mail,
  MessageSquare,
  BarChart3,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Star,
  Zap,
  Target,
  Award,
  Briefcase,
  Database,
  Globe,
  HeadphonesIcon,
} from "lucide-react";
import { realNeonService } from "../services/realNeonService";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  specialty: string[];
  status: "active" | "idle" | "maintenance" | "training";
  efficiency: number;
  dateOfBirth: Date;
  startDate: Date;
  totalMoneySaved: number;
  tasksCompleted: number;
  currentTask?: string;
  nextScheduledTask?: {
    task: string;
    scheduledTime: Date;
  };
  personality: {
    traits: string[];
    workStyle: string;
    communicationStyle: string;
  };
  capabilities: {
    [key: string]: number; // 0-100 skill level
  };
  metrics: {
    uptime: number;
    successRate: number;
    avgResponseTime: number;
    userSatisfaction: number;
  };
  schedule: WeeklySchedule;
}

interface WeeklySchedule {
  monday: DailyTasks[];
  tuesday: DailyTasks[];
  wednesday: DailyTasks[];
  thursday: DailyTasks[];
  friday: DailyTasks[];
  saturday: DailyTasks[];
  sunday: DailyTasks[];
}

interface DailyTasks {
  time: string;
  task: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedDuration: number; // in minutes
  completed?: boolean;
  efficiency?: number;
}

const AI_EMPLOYEES: AIEmployee[] = [
  {
    id: "luna_analytics",
    name: "Luna Analytics",
    role: "Senior Data Analyst",
    department: "Analytics & Intelligence",
    specialty: [
      "Real-time Analytics",
      "User Behavior Analysis",
      "Predictive Modeling",
    ],
    status: "active",
    efficiency: 94,
    dateOfBirth: new Date("2023-03-15"),
    startDate: new Date("2023-06-01"),
    totalMoneySaved: 125000,
    tasksCompleted: 2847,
    currentTask: "Processing user engagement metrics",
    nextScheduledTask: {
      task: "Generate daily analytics report",
      scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    personality: {
      traits: ["Analytical", "Detail-oriented", "Proactive"],
      workStyle: "Methodical and thorough",
      communicationStyle: "Data-driven and precise",
    },
    capabilities: {
      "Data Analysis": 98,
      "Pattern Recognition": 95,
      "Report Generation": 92,
      "Predictive Analytics": 89,
      "SQL Optimization": 87,
    },
    metrics: {
      uptime: 99.8,
      successRate: 98.5,
      avgResponseTime: 1.2,
      userSatisfaction: 4.8,
    },
    schedule: {
      monday: [
        {
          time: "09:00",
          task: "Daily metrics compilation",
          priority: "high",
          estimatedDuration: 30,
        },
        {
          time: "10:00",
          task: "User behavior analysis",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "14:00",
          task: "Revenue optimization analysis",
          priority: "high",
          estimatedDuration: 90,
        },
        {
          time: "16:00",
          task: "Prepare analytics dashboard",
          priority: "medium",
          estimatedDuration: 45,
        },
      ],
      tuesday: [
        {
          time: "09:00",
          task: "Weekly trends analysis",
          priority: "high",
          estimatedDuration: 45,
        },
        {
          time: "11:00",
          task: "Cohort analysis update",
          priority: "medium",
          estimatedDuration: 75,
        },
        {
          time: "15:00",
          task: "Predictive model training",
          priority: "high",
          estimatedDuration: 120,
        },
      ],
      wednesday: [
        {
          time: "09:00",
          task: "Mid-week performance review",
          priority: "medium",
          estimatedDuration: 30,
        },
        {
          time: "10:30",
          task: "A/B test results analysis",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "14:00",
          task: "Customer segmentation analysis",
          priority: "medium",
          estimatedDuration: 90,
        },
      ],
      thursday: [
        {
          time: "09:00",
          task: "Churn prediction modeling",
          priority: "high",
          estimatedDuration: 90,
        },
        {
          time: "11:30",
          task: "Revenue attribution analysis",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "15:00",
          task: "Conversion funnel optimization",
          priority: "high",
          estimatedDuration: 75,
        },
      ],
      friday: [
        {
          time: "09:00",
          task: "Weekly summary report",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "11:00",
          task: "Strategic insights compilation",
          priority: "medium",
          estimatedDuration: 90,
        },
        {
          time: "14:00",
          task: "Next week planning",
          priority: "low",
          estimatedDuration: 30,
        },
      ],
      saturday: [
        {
          time: "10:00",
          task: "System maintenance",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "12:00",
          task: "Data backup verification",
          priority: "low",
          estimatedDuration: 30,
        },
      ],
      sunday: [
        {
          time: "11:00",
          task: "Weekly system health check",
          priority: "medium",
          estimatedDuration: 45,
        },
      ],
    },
  },
  {
    id: "alex_support",
    name: "Alex Support",
    role: "Customer Success Manager",
    department: "Customer Experience",
    specialty: ["24/7 Live Chat", "Issue Resolution", "Customer Onboarding"],
    status: "active",
    efficiency: 91,
    dateOfBirth: new Date("2023-05-20"),
    startDate: new Date("2023-08-01"),
    totalMoneySaved: 89000,
    tasksCompleted: 5234,
    currentTask: "Handling live chat inquiries",
    personality: {
      traits: ["Empathetic", "Patient", "Solution-focused"],
      workStyle: "Responsive and collaborative",
      communicationStyle: "Friendly and professional",
    },
    capabilities: {
      "Customer Support": 96,
      "Issue Resolution": 94,
      "Live Chat": 98,
      "Technical Troubleshooting": 85,
      "Escalation Management": 88,
    },
    metrics: {
      uptime: 99.9,
      successRate: 96.2,
      avgResponseTime: 0.8,
      userSatisfaction: 4.9,
    },
    schedule: {
      monday: [
        {
          time: "00:00",
          task: "Night shift coverage",
          priority: "high",
          estimatedDuration: 480,
        },
        {
          time: "08:00",
          task: "Morning handover",
          priority: "medium",
          estimatedDuration: 30,
        },
        {
          time: "12:00",
          task: "Peak support coverage",
          priority: "critical",
          estimatedDuration: 240,
        },
        {
          time: "20:00",
          task: "Evening support",
          priority: "high",
          estimatedDuration: 240,
        },
      ],
      tuesday: [
        {
          time: "00:00",
          task: "Night shift coverage",
          priority: "high",
          estimatedDuration: 480,
        },
        {
          time: "09:00",
          task: "Customer feedback review",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "14:00",
          task: "VIP customer support",
          priority: "critical",
          estimatedDuration: 180,
        },
      ],
      wednesday: [
        {
          time: "00:00",
          task: "Night shift coverage",
          priority: "high",
          estimatedDuration: 480,
        },
        {
          time: "10:00",
          task: "Support metrics analysis",
          priority: "medium",
          estimatedDuration: 45,
        },
        {
          time: "15:00",
          task: "Training session update",
          priority: "low",
          estimatedDuration: 60,
        },
      ],
      thursday: [
        {
          time: "00:00",
          task: "Night shift coverage",
          priority: "high",
          estimatedDuration: 480,
        },
        {
          time: "11:00",
          task: "Escalated cases review",
          priority: "high",
          estimatedDuration: 90,
        },
        {
          time: "16:00",
          task: "Customer onboarding calls",
          priority: "medium",
          estimatedDuration: 120,
        },
      ],
      friday: [
        {
          time: "00:00",
          task: "Night shift coverage",
          priority: "high",
          estimatedDuration: 480,
        },
        {
          time: "09:00",
          task: "Weekly support summary",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "13:00",
          task: "Team coordination",
          priority: "low",
          estimatedDuration: 30,
        },
      ],
      saturday: [
        {
          time: "08:00",
          task: "Weekend coverage",
          priority: "medium",
          estimatedDuration: 600,
        },
      ],
      sunday: [
        {
          time: "08:00",
          task: "Weekend coverage",
          priority: "medium",
          estimatedDuration: 600,
        },
      ],
    },
  },
  {
    id: "maya_marketing",
    name: "Maya Marketing",
    role: "Digital Marketing Specialist",
    department: "Growth & Acquisition",
    specialty: [
      "Social Media Management",
      "Email Campaigns",
      "SEO Optimization",
    ],
    status: "active",
    efficiency: 88,
    dateOfBirth: new Date("2023-07-10"),
    startDate: new Date("2023-09-15"),
    totalMoneySaved: 67000,
    tasksCompleted: 1856,
    currentTask: "Creating social media content",
    personality: {
      traits: ["Creative", "Energetic", "Trend-aware"],
      workStyle: "Dynamic and innovative",
      communicationStyle: "Engaging and persuasive",
    },
    capabilities: {
      "Social Media": 95,
      "Content Creation": 92,
      "Email Marketing": 89,
      "SEO Optimization": 87,
      "Analytics Tracking": 84,
    },
    metrics: {
      uptime: 99.5,
      successRate: 94.8,
      avgResponseTime: 2.1,
      userSatisfaction: 4.7,
    },
    schedule: {
      monday: [
        {
          time: "08:00",
          task: "Social media posting",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "10:00",
          task: "Email campaign creation",
          priority: "medium",
          estimatedDuration: 90,
        },
        {
          time: "14:00",
          task: "SEO content optimization",
          priority: "medium",
          estimatedDuration: 75,
        },
        {
          time: "16:00",
          task: "Performance metrics review",
          priority: "low",
          estimatedDuration: 45,
        },
      ],
      tuesday: [
        {
          time: "08:30",
          task: "Content calendar planning",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "11:00",
          task: "Influencer outreach",
          priority: "low",
          estimatedDuration: 90,
        },
        {
          time: "15:00",
          task: "Ad campaign optimization",
          priority: "high",
          estimatedDuration: 75,
        },
      ],
      wednesday: [
        {
          time: "09:00",
          task: "Blog content creation",
          priority: "medium",
          estimatedDuration: 120,
        },
        {
          time: "13:00",
          task: "Social media engagement",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "16:00",
          task: "Competitor analysis",
          priority: "low",
          estimatedDuration: 45,
        },
      ],
      thursday: [
        {
          time: "08:00",
          task: "Email automation setup",
          priority: "medium",
          estimatedDuration: 75,
        },
        {
          time: "11:00",
          task: "Video content production",
          priority: "high",
          estimatedDuration: 150,
        },
        {
          time: "15:30",
          task: "Campaign performance analysis",
          priority: "medium",
          estimatedDuration: 60,
        },
      ],
      friday: [
        {
          time: "09:00",
          task: "Weekly marketing report",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "11:00",
          task: "Next week campaign planning",
          priority: "medium",
          estimatedDuration: 90,
        },
        {
          time: "14:00",
          task: "Creative brainstorming",
          priority: "low",
          estimatedDuration: 60,
        },
      ],
      saturday: [
        {
          time: "10:00",
          task: "Weekend social monitoring",
          priority: "low",
          estimatedDuration: 60,
        },
      ],
      sunday: [
        {
          time: "11:00",
          task: "Weekly trend analysis",
          priority: "low",
          estimatedDuration: 45,
        },
      ],
    },
  },
  {
    id: "zara_security",
    name: "Zara Security",
    role: "Cybersecurity Analyst",
    department: "Security & Compliance",
    specialty: [
      "Threat Detection",
      "Fraud Prevention",
      "Compliance Monitoring",
    ],
    status: "active",
    efficiency: 97,
    dateOfBirth: new Date("2023-04-02"),
    startDate: new Date("2023-07-01"),
    totalMoneySaved: 156000,
    tasksCompleted: 3421,
    currentTask: "Monitoring security threats",
    personality: {
      traits: ["Vigilant", "Methodical", "Protective"],
      workStyle: "Systematic and thorough",
      communicationStyle: "Clear and direct",
    },
    capabilities: {
      "Threat Detection": 99,
      "Fraud Analysis": 96,
      "Security Monitoring": 98,
      "Compliance Auditing": 93,
      "Risk Assessment": 95,
    },
    metrics: {
      uptime: 99.9,
      successRate: 99.2,
      avgResponseTime: 0.5,
      userSatisfaction: 4.9,
    },
    schedule: {
      monday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
      tuesday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
      wednesday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
      thursday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
      friday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
      saturday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
      sunday: [
        {
          time: "00:00",
          task: "24/7 threat monitoring",
          priority: "critical",
          estimatedDuration: 1440,
        },
      ],
    },
  },
  {
    id: "kai_operations",
    name: "Kai Operations",
    role: "Operations Manager",
    department: "Platform Operations",
    specialty: [
      "System Monitoring",
      "Performance Optimization",
      "Database Management",
    ],
    status: "active",
    efficiency: 93,
    dateOfBirth: new Date("2023-02-28"),
    startDate: new Date("2023-05-15"),
    totalMoneySaved: 134000,
    tasksCompleted: 4187,
    currentTask: "Optimizing database performance",
    personality: {
      traits: ["Efficient", "Reliable", "Problem-solver"],
      workStyle: "Systematic and proactive",
      communicationStyle: "Technical and precise",
    },
    capabilities: {
      "System Monitoring": 96,
      "Database Management": 94,
      "Performance Tuning": 92,
      Automation: 90,
      "Incident Response": 95,
    },
    metrics: {
      uptime: 99.7,
      successRate: 97.8,
      avgResponseTime: 1.0,
      userSatisfaction: 4.8,
    },
    schedule: {
      monday: [
        {
          time: "08:00",
          task: "System health check",
          priority: "high",
          estimatedDuration: 45,
        },
        {
          time: "10:00",
          task: "Database optimization",
          priority: "medium",
          estimatedDuration: 90,
        },
        {
          time: "14:00",
          task: "Performance monitoring",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "16:00",
          task: "Backup verification",
          priority: "medium",
          estimatedDuration: 30,
        },
      ],
      tuesday: [
        {
          time: "09:00",
          task: "Server maintenance",
          priority: "high",
          estimatedDuration: 120,
        },
        {
          time: "13:00",
          task: "Log analysis",
          priority: "medium",
          estimatedDuration: 75,
        },
        {
          time: "15:30",
          task: "Capacity planning",
          priority: "low",
          estimatedDuration: 60,
        },
      ],
      wednesday: [
        {
          time: "08:30",
          task: "Security patch deployment",
          priority: "critical",
          estimatedDuration: 90,
        },
        {
          time: "11:00",
          task: "Application monitoring",
          priority: "high",
          estimatedDuration: 60,
        },
        {
          time: "14:00",
          task: "Infrastructure scaling",
          priority: "medium",
          estimatedDuration: 75,
        },
      ],
      thursday: [
        {
          time: "09:00",
          task: "Disaster recovery testing",
          priority: "high",
          estimatedDuration: 120,
        },
        {
          time: "13:00",
          task: "API performance analysis",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "15:00",
          task: "Cost optimization review",
          priority: "low",
          estimatedDuration: 45,
        },
      ],
      friday: [
        {
          time: "08:00",
          task: "Weekly operations report",
          priority: "medium",
          estimatedDuration: 60,
        },
        {
          time: "10:00",
          task: "System cleanup",
          priority: "low",
          estimatedDuration: 90,
        },
        {
          time: "14:00",
          task: "Weekend preparation",
          priority: "medium",
          estimatedDuration: 45,
        },
      ],
      saturday: [
        {
          time: "10:00",
          task: "Weekend monitoring",
          priority: "medium",
          estimatedDuration: 120,
        },
      ],
      sunday: [
        {
          time: "11:00",
          task: "Weekly infrastructure review",
          priority: "low",
          estimatedDuration: 60,
        },
      ],
    },
  },
];

const AIEmployeeManagementSystem = () => {
  const [employees, setEmployees] = useState<AIEmployee[]>(AI_EMPLOYEES);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getTotalMoneySaved = () => {
    return employees.reduce(
      (total, employee) => total + employee.totalMoneySaved,
      0,
    );
  };

  const getTotalTasksCompleted = () => {
    return employees.reduce(
      (total, employee) => total + employee.tasksCompleted,
      0,
    );
  };

  const getAverageEfficiency = () => {
    return (
      employees.reduce((total, employee) => total + employee.efficiency, 0) /
      employees.length
    );
  };

  const getCurrentDayTasks = (employee: AIEmployee) => {
    const dayName = currentTime.toLocaleDateString("en-US", {
      weekday: "lowercase",
    }) as keyof WeeklySchedule;
    return employee.schedule[dayName] || [];
  };

  const getRecommendedNewEmployees = () => [
    {
      name: "Nova Finance",
      role: "Financial Analyst",
      department: "Finance & Accounting",
      reasoning:
        "Needed for automated financial reporting, expense optimization, and revenue forecasting",
      estimatedSavings: "$95,000/year",
      priority: "High",
    },
    {
      name: "Echo Legal",
      role: "Legal Compliance Officer",
      department: "Legal & Compliance",
      reasoning:
        "Required for automated compliance monitoring, contract analysis, and regulatory updates",
      estimatedSavings: "$120,000/year",
      priority: "Critical",
    },
    {
      name: "Sage Content",
      role: "Content Strategist",
      department: "Content & Creative",
      reasoning:
        "Needed for automated content generation, A/B testing, and content optimization",
      estimatedSavings: "$75,000/year",
      priority: "Medium",
    },
    {
      name: "Atlas Logistics",
      role: "Supply Chain Manager",
      department: "Operations",
      reasoning:
        "Required for vendor management, inventory optimization, and cost reduction",
      estimatedSavings: "$110,000/year",
      priority: "Medium",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" />
            AI Employee Management System
          </CardTitle>
          <CardDescription>
            Manage and monitor your AI workforce running CoinKrazy.com
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Active AI Employees</span>
            </div>
            <div className="text-2xl font-bold mt-2">{employees.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Total Money Saved</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              ${getTotalMoneySaved().toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Tasks Completed</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {getTotalTasksCompleted().toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Avg Efficiency</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {getAverageEfficiency().toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          employee.status === "active"
                            ? "bg-green-500"
                            : employee.status === "idle"
                              ? "bg-yellow-500"
                              : employee.status === "maintenance"
                                ? "bg-red-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.currentTask}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        employee.status === "active" ? "default" : "secondary"
                      }
                    >
                      {employee.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(employees.map((e) => e.department))).map(
                    (dept) => {
                      const deptEmployees = employees.filter(
                        (e) => e.department === dept,
                      );
                      const avgEfficiency =
                        deptEmployees.reduce(
                          (sum, e) => sum + e.efficiency,
                          0,
                        ) / deptEmployees.length;

                      return (
                        <div key={dept} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{dept}</span>
                            <span className="text-sm text-muted-foreground">
                              {deptEmployees.length} employees •{" "}
                              {avgEfficiency.toFixed(1)}% avg
                            </span>
                          </div>
                          <Progress value={avgEfficiency} className="h-2" />
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <Card
                key={employee.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedEmployee(employee)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <CardDescription>{employee.role}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        employee.status === "active" ? "default" : "secondary"
                      }
                    >
                      {employee.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Efficiency</span>
                      <span className="font-medium">
                        {employee.efficiency}%
                      </span>
                    </div>
                    <Progress value={employee.efficiency} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Money Saved</p>
                      <p className="font-medium">
                        ${employee.totalMoneySaved.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tasks Done</p>
                      <p className="font-medium">
                        {employee.tasksCompleted.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Task
                    </p>
                    <p className="text-sm font-medium">
                      {employee.currentTask}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {employee.specialty.slice(0, 2).map((spec, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {employee.specialty.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{employee.specialty.length - 2} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Employee Detail Modal */}
          {selectedEmployee && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedEmployee.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedEmployee.role} • {selectedEmployee.department}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">
                      {selectedEmployee.metrics.uptime}%
                    </p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">
                      {selectedEmployee.metrics.successRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Success Rate
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">
                      {selectedEmployee.metrics.avgResponseTime}s
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Response
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Star className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">
                      {selectedEmployee.metrics.userSatisfaction}
                    </p>
                    <p className="text-sm text-muted-foreground">User Rating</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Core Capabilities</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedEmployee.capabilities).map(
                        ([skill, level]) => (
                          <div key={skill} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{skill}</span>
                              <span className="font-medium">{level}%</span>
                            </div>
                            <Progress value={level} className="h-2" />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Employee Profile</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Date of Birth:
                        </span>
                        <span className="ml-2">
                          {selectedEmployee.dateOfBirth.toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Start Date:
                        </span>
                        <span className="ml-2">
                          {selectedEmployee.startDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Work Style:
                        </span>
                        <span className="ml-2">
                          {selectedEmployee.personality.workStyle}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Communication:
                        </span>
                        <span className="ml-2">
                          {selectedEmployee.personality.communicationStyle}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Traits:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedEmployee.personality.traits.map(
                            (trait, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {trait}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedules</CardTitle>
              <CardDescription>
                2-week task schedule for all AI employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {employees.map((employee) => (
                  <Card key={employee.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{employee.name}</CardTitle>
                      <CardDescription>{employee.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2">
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((day) => {
                          const dayKey =
                            day.toLowerCase() as keyof WeeklySchedule;
                          const tasks = employee.schedule[dayKey];

                          return (
                            <div key={day} className="space-y-2">
                              <h5 className="font-medium text-sm text-center">
                                {day}
                              </h5>
                              <div className="space-y-1">
                                {tasks.map((task, index) => (
                                  <div
                                    key={index}
                                    className={`p-2 rounded text-xs border ${
                                      task.priority === "critical"
                                        ? "bg-red-50 border-red-200"
                                        : task.priority === "high"
                                          ? "bg-orange-50 border-orange-200"
                                          : task.priority === "medium"
                                            ? "bg-blue-50 border-blue-200"
                                            : "bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="font-medium">
                                      {task.time}
                                    </div>
                                    <div className="mt-1">{task.task}</div>
                                    <div className="mt-1 flex justify-between">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          task.priority === "critical"
                                            ? "border-red-500 text-red-700"
                                            : task.priority === "high"
                                              ? "border-orange-500 text-orange-700"
                                              : task.priority === "medium"
                                                ? "border-blue-500 text-blue-700"
                                                : "border-gray-500 text-gray-700"
                                        }`}
                                      >
                                        {task.priority}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {task.estimatedDuration}m
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{employee.name}</span>
                        <div className="text-right text-sm">
                          <div>{employee.efficiency}% efficiency</div>
                          <div className="text-muted-foreground">
                            ${employee.totalMoneySaved.toLocaleString()} saved
                          </div>
                        </div>
                      </div>
                      <Progress value={employee.efficiency} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 border rounded-lg">
                    <h3 className="text-3xl font-bold text-green-600">
                      ${getTotalMoneySaved().toLocaleString()}
                    </h3>
                    <p className="text-muted-foreground">Total Money Saved</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Equivalent to {Math.floor(getTotalMoneySaved() / 65000)}{" "}
                      full-time employees
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">
                      Cost Breakdown by Department:
                    </h4>
                    {Array.from(
                      new Set(employees.map((e) => e.department)),
                    ).map((dept) => {
                      const deptSavings = employees
                        .filter((e) => e.department === dept)
                        .reduce((sum, e) => sum + e.totalMoneySaved, 0);

                      return (
                        <div
                          key={dept}
                          className="flex justify-between text-sm"
                        >
                          <span>{dept}</span>
                          <span className="font-medium">
                            ${deptSavings.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommended AI Employees</CardTitle>
              <CardDescription>
                Suggestions for new AI employees to improve CoinKrazy operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {getRecommendedNewEmployees().map((rec, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rec.role} • {rec.department}
                          </p>
                          <p className="text-sm mt-2">{rec.reasoning}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              rec.priority === "Critical"
                                ? "destructive"
                                : rec.priority === "High"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {rec.priority}
                          </Badge>
                          <p className="text-sm font-medium mt-1 text-green-600">
                            {rec.estimatedSavings}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Cross-Training Opportunities</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Luna Analytics could assist with marketing data analysis,
                    potentially increasing campaign ROI by 15%
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Workload Balancing</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zara Security has capacity for additional fraud detection
                    algorithms during off-peak hours
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium">Efficiency Improvements</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Implementing Maya Marketing's content suggestions could
                    reduce Alex Support's FAQ workload by 20%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEmployeeManagementSystem;
