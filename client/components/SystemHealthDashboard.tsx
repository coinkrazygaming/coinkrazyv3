import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Activity,
  Server,
  Database,
  Globe,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  Shield,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  Settings,
  Monitor,
  Cloud,
  Lock,
  Users,
  GamepadIcon,
  DollarSign,
} from "lucide-react";

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  threshold: {
    warning: number;
    critical: number;
  };
  history?: number[];
}

interface ServiceStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  endpoint?: string;
}

interface SecurityAlert {
  id: string;
  type: "intrusion" | "suspicious" | "failed_login" | "fraud";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  source: string;
  resolved: boolean;
}

export default function SystemHealthDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // System metrics state
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: "CPU Usage",
      value: 23.5,
      unit: "%",
      status: "healthy",
      threshold: { warning: 70, critical: 90 },
      history: [20, 22, 25, 23, 24, 23, 21, 23],
    },
    {
      name: "Memory Usage",
      value: 67.2,
      unit: "%",
      status: "healthy",
      threshold: { warning: 80, critical: 95 },
      history: [65, 66, 68, 67, 69, 67, 66, 67],
    },
    {
      name: "Disk Usage",
      value: 45.8,
      unit: "%",
      status: "healthy",
      threshold: { warning: 85, critical: 95 },
      history: [44, 45, 46, 45, 46, 46, 45, 46],
    },
    {
      name: "Network I/O",
      value: 12.3,
      unit: "MB/s",
      status: "healthy",
      threshold: { warning: 100, critical: 150 },
      history: [10, 11, 13, 12, 14, 12, 11, 12],
    },
    {
      name: "Active Users",
      value: 1247,
      unit: "users",
      status: "healthy",
      threshold: { warning: 10000, critical: 15000 },
      history: [1200, 1230, 1260, 1247, 1280, 1247, 1220, 1247],
    },
    {
      name: "API Response Time",
      value: 89,
      unit: "ms",
      status: "healthy",
      threshold: { warning: 500, critical: 1000 },
      history: [85, 87, 92, 89, 94, 89, 86, 89],
    },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Web Application",
      status: "online",
      uptime: 99.98,
      lastCheck: new Date(),
      responseTime: 120,
      endpoint: "https://coinkrazy.com",
    },
    {
      name: "API Gateway",
      status: "online",
      uptime: 99.95,
      lastCheck: new Date(),
      responseTime: 89,
      endpoint: "https://api.coinkrazy.com",
    },
    {
      name: "Database Primary",
      status: "online",
      uptime: 99.99,
      lastCheck: new Date(),
      responseTime: 15,
    },
    {
      name: "Database Replica",
      status: "online",
      uptime: 99.97,
      lastCheck: new Date(),
      responseTime: 18,
    },
    {
      name: "Redis Cache",
      status: "online",
      uptime: 99.96,
      lastCheck: new Date(),
      responseTime: 5,
    },
    {
      name: "Payment Gateway",
      status: "online",
      uptime: 99.92,
      lastCheck: new Date(),
      responseTime: 340,
      endpoint: "https://payments.coinkrazy.com",
    },
    {
      name: "Game Servers",
      status: "degraded",
      uptime: 98.85,
      lastCheck: new Date(),
      responseTime: 560,
    },
    {
      name: "Email Service",
      status: "online",
      uptime: 99.88,
      lastCheck: new Date(),
      responseTime: 450,
    },
  ]);

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: "sec_001",
      type: "failed_login",
      severity: "medium",
      message: "Multiple failed login attempts detected from IP 192.168.1.100",
      timestamp: new Date(Date.now() - 300000),
      source: "Auth System",
      resolved: false,
    },
    {
      id: "sec_002",
      type: "suspicious",
      severity: "high",
      message: "Unusual betting pattern detected for user ID 12847",
      timestamp: new Date(Date.now() - 600000),
      source: "Fraud Detection",
      resolved: false,
    },
    {
      id: "sec_003",
      type: "intrusion",
      severity: "critical",
      message: "Potential SQL injection attempt blocked",
      timestamp: new Date(Date.now() - 900000),
      source: "WAF",
      resolved: true,
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        updateMetrics();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const updateMetrics = () => {
    setSystemMetrics((prev) =>
      prev.map((metric) => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 2,
        history: [...(metric.history?.slice(-7) || []), metric.value],
      })),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "critical":
      case "offline":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return "text-green-500";
      case "warning":
      case "degraded":
        return "text-yellow-500";
      case "critical":
      case "offline":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "cpu usage":
        return <Cpu className="w-5 h-5" />;
      case "memory usage":
        return <MemoryStick className="w-5 h-5" />;
      case "disk usage":
        return <HardDrive className="w-5 h-5" />;
      case "network i/o":
        return <Wifi className="w-5 h-5" />;
      case "active users":
        return <Users className="w-5 h-5" />;
      case "api response time":
        return <Clock className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    updateMetrics();
    setTimeout(() => setLoading(false), 1000);
    toast({
      title: "System Health Refreshed",
      description: "All metrics have been updated",
    });
  };

  const resolveSecurityAlert = (alertId: string) => {
    setSecurityAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, resolved: true } : alert,
      ),
    );
    toast({
      title: "Alert Resolved",
      description: "Security alert has been marked as resolved",
    });
  };

  const unresolvedAlerts = securityAlerts.filter((alert) => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(
    (alert) => alert.severity === "critical",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6" />
            System Health Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of CoinKrazy infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 border-green-200" : ""}
          >
            <Zap className="w-4 h-4 mr-1" />
            Auto: {autoRefresh ? "ON" : "OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>{criticalAlerts.length} critical security alerts</strong>{" "}
            require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMetricIcon(metric.name)}
                      {metric.name}
                    </div>
                    {getStatusIcon(metric.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">
                        {metric.value.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {metric.unit}
                      </span>
                    </div>

                    <Progress
                      value={
                        metric.unit === "%"
                          ? metric.value
                          : (metric.value / metric.threshold.critical) * 100
                      }
                      className="h-2"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Warning: {metric.threshold.warning}
                        {metric.unit}
                      </span>
                      <span>
                        Critical: {metric.threshold.critical}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Infrastructure Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      98.7%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Overall Uptime
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      156ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Response
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {unresolvedAlerts.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Alerts
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      24/7
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Monitoring
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{service.name}</span>
                    <Badge
                      variant={
                        service.status === "online"
                          ? "default"
                          : service.status === "degraded"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {service.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-muted-foreground">Uptime</div>
                      <div className="font-medium">
                        {service.uptime.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Response</div>
                      <div className="font-medium">
                        {service.responseTime}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Last Check</div>
                      <div className="font-medium">
                        {service.lastCheck.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {service.endpoint && (
                    <div className="text-xs text-muted-foreground">
                      {service.endpoint}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="space-y-4">
            {securityAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`${alert.resolved ? "opacity-60" : ""} ${
                  alert.severity === "critical"
                    ? "border-red-200 bg-red-50"
                    : alert.severity === "high"
                      ? "border-orange-200 bg-orange-50"
                      : alert.severity === "medium"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-blue-200 bg-blue-50"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            alert.severity === "critical"
                              ? "destructive"
                              : alert.severity === "high"
                                ? "destructive"
                                : alert.severity === "medium"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {alert.type.replace("_", " ").toUpperCase()}
                        </Badge>
                        {alert.resolved && (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            RESOLVED
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium mb-1">{alert.message}</p>
                      <div className="text-sm text-muted-foreground">
                        Source: {alert.source} •{" "}
                        {alert.timestamp.toLocaleString()}
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resolveSecurityAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.slice(0, 4).map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.name}</span>
                        <span className={getStatusColor(metric.status)}>
                          {metric.value.toFixed(1)}
                          {metric.unit}
                        </span>
                      </div>
                      <Progress
                        value={
                          metric.unit === "%"
                            ? metric.value
                            : Math.min(
                                (metric.value / metric.threshold.critical) *
                                  100,
                                100,
                              )
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        1,247
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Sessions
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">
                        89ms
                      </div>
                      <div className="text-sm text-muted-foreground">
                        API Response
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        156
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Req/min
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        0.02%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Error Rate
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
