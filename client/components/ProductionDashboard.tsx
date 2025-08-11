import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  productionService, 
  SystemHealth, 
  SecurityEvent, 
  PerformanceMetric,
  ProductionConfig 
} from "@/services/productionService";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  Users,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Server,
  Database,
  Globe,
  Mail,
  CreditCard,
  Gamepad2,
  BarChart3,
  AlertCircle,
  Info,
  FileText,
  Monitor
} from "lucide-react";

export default function ProductionDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [config, setConfig] = useState<ProductionConfig | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();

    // Subscribe to real-time updates
    const unsubscribe = productionService.subscribe((event, data) => {
      switch (event) {
        case 'system_health_updated':
          setSystemHealth(data);
          break;
        case 'security_alert':
          setSecurityEvents(prev => [data, ...prev.slice(0, 99)]);
          break;
        case 'performance_alert':
          setPerformanceMetrics(prev => [data, ...prev.slice(0, 999)]);
          break;
        case 'config_updated':
          setConfig(data);
          break;
      }
    });

    // Auto-refresh data
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadDashboardData();
      }
    }, 30000); // 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDashboardData = () => {
    setSystemHealth(productionService.getSystemHealth());
    setSecurityEvents(productionService.getSecurityEvents().slice(0, 100));
    setPerformanceMetrics(productionService.getPerformanceMetrics().slice(0, 500));
    setConfig(productionService.getConfig());
  };

  const toggleFeature = (feature: keyof ProductionConfig['features']) => {
    if (config) {
      const newValue = !config.features[feature];
      productionService.updateFeatureFlag(feature, newValue);
      setConfig({ ...config, features: { ...config.features, [feature]: newValue } });
    }
  };

  const toggleMaintenanceMode = () => {
    if (config) {
      const newValue = !config.features.maintenanceMode;
      productionService.toggleMaintenanceMode(newValue);
      setConfig({ ...config, features: { ...config.features, maintenanceMode: newValue } });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'unhealthy':
      case 'offline':
        return 'text-red-500';
      case 'maintenance':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy':
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'maintenance':
        return <Settings className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatUptime = (responseTime: number) => {
    if (responseTime < 100) return 'Excellent';
    if (responseTime < 300) return 'Good';
    if (responseTime < 1000) return 'Fair';
    return 'Poor';
  };

  if (!systemHealth || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-casino-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-white" />
                </div>
                Production Dashboard
                <Badge className={`${systemHealth.status === 'healthy' ? 'bg-green-500' : 
                  systemHealth.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'} text-white`}>
                  {systemHealth.status.toUpperCase()}
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Real-time monitoring and system health dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={autoRefresh} 
                  onCheckedChange={setAutoRefresh}
                />
                <span className="text-sm">Auto-refresh</span>
              </div>
              <Button onClick={loadDashboardData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {config.features.maintenanceMode && (
                <Button onClick={toggleMaintenanceMode} variant="destructive">
                  <Settings className="w-4 h-4 mr-2" />
                  Exit Maintenance
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.cpuUsage.toFixed(1)}%</p>
              </div>
              <Cpu className={`w-8 h-8 ${systemHealth.metrics.cpuUsage > 80 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${systemHealth.metrics.cpuUsage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${systemHealth.metrics.cpuUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.memoryUsage.toFixed(1)}%</p>
              </div>
              <HardDrive className={`w-8 h-8 ${systemHealth.metrics.memoryUsage > 90 ? 'text-red-500' : 'text-blue-500'}`} />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${systemHealth.metrics.memoryUsage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${systemHealth.metrics.memoryUsage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests/Min</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.requestsPerMinute.toLocaleString()}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="services">
            <Server className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="features">
            <Settings className="w-4 h-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemHealth.alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <Badge className={getAlertSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium">{alert.type.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">{alert.message}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {systemHealth.alerts.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="font-bold mb-2">All Systems Operational</h3>
                      <p className="text-muted-foreground">No alerts or issues detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      CPU Usage
                    </span>
                    <span className="text-2xl font-bold">{systemHealth.metrics.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      Memory
                    </span>
                    <span className="text-2xl font-bold">{systemHealth.metrics.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Disk Usage
                    </span>
                    <span className="text-2xl font-bold">{systemHealth.metrics.diskUsage.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Error Rate
                    </span>
                    <span className="text-2xl font-bold text-red-500">
                      {(systemHealth.metrics.errorRate * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Environment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Environment</h4>
                    <Badge className={config.environment === 'production' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {config.environment.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Security</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {config.security.encryptionEnabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        Encryption: {config.security.encryptionEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {config.security.rateLimiting ? <Shield className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Rate Limiting: {config.security.rateLimiting ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Performance</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        {config.performance.cacheEnabled ? <Zap className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        Cache: {config.performance.cacheEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {config.performance.cdnEnabled ? <Globe className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        CDN: {config.performance.cdnEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(systemHealth.services).map(([serviceName, service]) => (
              <Card key={serviceName}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {serviceName === 'auth-service' && <Lock className="w-5 h-5" />}
                      {serviceName === 'payment-service' && <CreditCard className="w-5 h-5" />}
                      {serviceName === 'game-service' && <Gamepad2 className="w-5 h-5" />}
                      {serviceName === 'email-service' && <Mail className="w-5 h-5" />}
                      {serviceName === 'database' && <Database className="w-5 h-5" />}
                      <span className="font-medium capitalize">{serviceName.replace('-', ' ')}</span>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={getStatusColor(service.status)}>{service.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Response Time:</span>
                      <span className={service.responseTime > 1000 ? 'text-red-500' : 'text-green-500'}>
                        {service.responseTime}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span>{formatUptime(service.responseTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className={service.errorRate > 0.1 ? 'text-red-500' : 'text-green-500'}>
                        {(service.errorRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Check:</span>
                      <span>{service.lastChecked.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Badge className={
                          event.severity === 'critical' ? 'bg-red-500' :
                          event.severity === 'high' ? 'bg-orange-500' :
                          event.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                        }>
                          {event.severity}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium">{event.type.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            IP: {event.ipAddress} • {event.timestamp.toLocaleString()}
                          </div>
                          {event.details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {JSON.stringify(event.details).slice(0, 100)}...
                            </div>
                          )}
                        </div>
                        <Badge variant={event.handled ? "default" : "destructive"}>
                          {event.handled ? "Handled" : "Open"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Security Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-medium text-green-700 dark:text-green-300">Security Status</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">SECURE</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Events (24h):</span>
                      <span className="font-bold">{securityEvents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Critical Events:</span>
                      <span className="font-bold text-red-500">
                        {securityEvents.filter(e => e.severity === 'critical').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Failed Logins:</span>
                      <span className="font-bold">
                        {securityEvents.filter(e => e.type === 'failed_login').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rate Limited:</span>
                      <span className="font-bold">
                        {securityEvents.filter(e => e.type === 'rate_limit_exceeded').length}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Security Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Encryption:</span>
                        <Badge className={config.security.encryptionEnabled ? 'bg-green-500' : 'bg-red-500'}>
                          {config.security.encryptionEnabled ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rate Limiting:</span>
                        <Badge className={config.security.rateLimiting ? 'bg-green-500' : 'bg-red-500'}>
                          {config.security.rateLimiting ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session Timeout:</span>
                        <span>{config.security.sessionTimeout}min</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['page_load', 'api_response', 'database_query'].map((metric) => {
                    const metricData = performanceMetrics.filter(m => m.metric === metric);
                    const avgTime = metricData.length > 0 
                      ? metricData.reduce((sum, m) => sum + m.value, 0) / metricData.length 
                      : 0;
                    
                    return (
                      <div key={metric} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <div className="font-medium capitalize">{metric.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">
                            {metricData.length} samples
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {avgTime.toFixed(0)}ms
                          </div>
                          <div className={`text-sm ${avgTime < 300 ? 'text-green-500' : avgTime < 1000 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {avgTime < 300 ? 'Excellent' : avgTime < 1000 ? 'Good' : 'Poor'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Performance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceMetrics
                    .filter(m => m.value > 2000) // Slow requests (>2s)
                    .slice(0, 5)
                    .map((metric) => (
                    <div key={metric.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <div className="flex-1">
                        <div className="font-medium capitalize">{metric.metric.replace('_', ' ')}</div>
                        <div className="text-sm text-muted-foreground">
                          {metric.page} • {metric.value.toFixed(0)}ms
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {metric.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  {performanceMetrics.filter(m => m.value > 2000).length === 0 && (
                    <div className="text-center py-8">
                      <TrendingUp className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="font-bold mb-2">Performance is Good</h3>
                      <p className="text-muted-foreground">No slow requests detected recently</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Feature Flags & System Controls
                </CardTitle>
                <p className="text-muted-foreground">
                  Control system features and functionality in real-time
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Core Features</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">New User Registration</span>
                          <p className="text-sm text-muted-foreground">Allow new users to sign up</p>
                        </div>
                        <Switch 
                          checked={config.features.newUserRegistration}
                          onCheckedChange={() => toggleFeature('newUserRegistration')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Withdrawals</span>
                          <p className="text-sm text-muted-foreground">Enable user withdrawals</p>
                        </div>
                        <Switch 
                          checked={config.features.withdrawalsEnabled}
                          onCheckedChange={() => toggleFeature('withdrawalsEnabled')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Deposits</span>
                          <p className="text-sm text-muted-foreground">Enable user deposits</p>
                        </div>
                        <Switch 
                          checked={config.features.depositsEnabled}
                          onCheckedChange={() => toggleFeature('depositsEnabled')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">User Experience</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Live Chat</span>
                          <p className="text-sm text-muted-foreground">Customer support chat</p>
                        </div>
                        <Switch 
                          checked={config.features.liveChatEnabled}
                          onCheckedChange={() => toggleFeature('liveChatEnabled')}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Promotions</span>
                          <p className="text-sm text-muted-foreground">Marketing promotions</p>
                        </div>
                        <Switch 
                          checked={config.features.promotionsEnabled}
                          onCheckedChange={() => toggleFeature('promotionsEnabled')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">System Control</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                        <div>
                          <span className="font-medium text-red-600">Maintenance Mode</span>
                          <p className="text-sm text-muted-foreground">Disable site for maintenance</p>
                        </div>
                        <Switch 
                          checked={config.features.maintenanceMode}
                          onCheckedChange={toggleMaintenanceMode}
                        />
                      </div>

                      {config.features.maintenanceMode && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-600 mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Maintenance Mode Active</span>
                          </div>
                          <p className="text-sm text-red-600">
                            The site is currently in maintenance mode. Users cannot access the platform.
                          </p>
                        </div>
                      )}
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
