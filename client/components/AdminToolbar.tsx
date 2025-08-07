import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { 
  Settings, 
  Bell, 
  Users, 
  Database, 
  Monitor,
  Shield,
  BarChart3,
  Edit3,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Zap,
  Crown,
  Bot
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { authService } from '../services/authService';
import { realNeonService } from '../services/realNeonService';

interface AdminNotification {
  id: string;
  type: 'ai_report' | 'system_alert' | 'user_action' | 'security' | 'performance';
  title: string;
  message: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  data?: Record<string, any>;
}

interface SystemStatus {
  database: 'online' | 'offline' | 'maintenance';
  aiEmployees: number;
  activeUsers: number;
  systemLoad: number;
  uptime: string;
}

const AdminToolbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'online',
    aiEmployees: 5,
    activeUsers: 1247,
    systemLoad: 23,
    uptime: '99.9%'
  });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem('auth_token');
    if (token) {
      const user = authService.getUserByToken(token);
      if (user && user.email === 'coinkrazy00@gmail.com') {
        setCurrentUser(user);
        loadAdminNotifications();
        startRealTimeUpdates();
      }
    }
  }, []);

  const loadAdminNotifications = () => {
    // Simulate AI employee notifications
    const mockNotifications: AdminNotification[] = [
      {
        id: 'ai_luna_001',
        type: 'ai_report',
        title: 'Revenue Optimization Opportunity',
        message: 'Luna Analytics detected 15% increase potential in VIP conversion rates by adjusting bonus multipliers during peak hours.',
        source: 'Luna Analytics',
        priority: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        data: {
          currentConversion: 12.3,
          projectedConversion: 14.1,
          revenue_impact: 8750
        }
      },
      {
        id: 'ai_alex_001',
        type: 'ai_report',
        title: 'Support Ticket Trend Alert',
        message: 'Alex Support identified unusual spike in payment-related inquiries. Suggesting proactive email campaign to address common issues.',
        source: 'Alex Support',
        priority: 'medium',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false,
        data: {
          ticket_increase: 34,
          common_issues: ['payment delays', 'verification questions'],
          suggested_action: 'send_faq_email'
        }
      },
      {
        id: 'ai_zara_001',
        type: 'security',
        title: 'Security Scan Complete',
        message: 'Zara Security completed daily security scan. 0 threats detected, all systems secure. 3 minor configuration updates recommended.',
        source: 'Zara Security',
        priority: 'low',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
        data: {
          threats_detected: 0,
          scanned_endpoints: 47,
          recommendations: 3
        }
      },
      {
        id: 'ai_maya_001',
        type: 'ai_report',
        title: 'Marketing Campaign Performance',
        message: 'Maya Marketing reports 23% above-target performance for holiday campaign. Recommending budget increase for maximum ROI.',
        source: 'Maya Marketing',
        priority: 'high',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        read: false,
        data: {
          campaign_performance: 123,
          roi_current: 4.2,
          roi_projected: 5.8,
          budget_recommendation: 5000
        }
      },
      {
        id: 'ai_kai_001',
        type: 'performance',
        title: 'Database Performance Optimization',
        message: 'Kai Operations optimized 12 database queries, reducing average response time by 340ms. System performance improved.',
        source: 'Kai Operations',
        priority: 'medium',
        timestamp: new Date(Date.now() - 120 * 60 * 1000),
        read: true,
        data: {
          queries_optimized: 12,
          response_time_improvement: 340,
          performance_gain: 15.2
        }
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const startRealTimeUpdates = () => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        systemLoad: Math.max(10, Math.min(90, prev.systemLoad + Math.floor(Math.random() * 10 - 5)))
      }));
    }, 30000);

    // Simulate new notifications
    const notificationInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every minute
        addNewNotification();
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(notificationInterval);
    };
  };

  const addNewNotification = () => {
    const newNotification: AdminNotification = {
      id: `ai_${Date.now()}`,
      type: 'ai_report',
      title: 'Real-time AI Update',
      message: 'AI employee reported new optimization opportunity detected.',
      source: ['Luna Analytics', 'Alex Support', 'Maya Marketing', 'Zara Security', 'Kai Operations'][Math.floor(Math.random() * 5)],
      priority: 'medium',
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 border-red-200 bg-red-50';
      case 'high': return 'text-orange-600 border-orange-200 bg-orange-50';
      case 'medium': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'low': return 'text-green-600 border-green-200 bg-green-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_report': return <Bot className="h-4 w-4" />;
      case 'system_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  // Don't render if user is not admin
  if (!currentUser || currentUser.email !== 'coinkrazy00@gmail.com') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          size="sm"
          className="bg-red-600 hover:bg-red-700"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-900 text-white shadow-lg border-b-2 border-red-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Left Side - Admin Tools */}
          <div className="flex items-center gap-4">
            <Badge className="bg-red-700 hover:bg-red-600">
              <Crown className="h-3 w-3 mr-1" />
              ADMIN MODE
            </Badge>

            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${systemStatus.database === 'online' ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>DB: {systemStatus.database}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Bot className="h-3 w-3" />
              <span>{systemStatus.aiEmployees}/5 AI</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3" />
              <span>{systemStatus.activeUsers} users</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Monitor className="h-3 w-3" />
              <span>{systemStatus.systemLoad}% load</span>
            </div>
          </div>

          {/* Center - Quick Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-red-800"
              onClick={() => window.open('/admin', '_blank')}
            >
              <Settings className="h-4 w-4 mr-1" />
              Admin Panel
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-xs">Maintenance:</span>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
                className="scale-75"
              />
            </div>

            <Button size="sm" variant="ghost" className="text-white hover:bg-red-800">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Right Side - Notifications and Controls */}
          <div className="flex items-center gap-2">
            {/* Admin Notifications */}
            <Popover open={showNotifications} onOpenChange={setShowNotifications}>
              <PopoverTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="relative text-white hover:bg-red-800"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-yellow-500 text-black">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-96 overflow-y-auto" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Admin Notifications</h4>
                    {unreadCount > 0 && (
                      <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                        Mark all read
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {notifications.slice(0, 10).map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                        } ${getPriorityColor(notification.priority)}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm truncate">
                                {notification.title}
                              </h5>
                              <Badge variant="outline" className="text-xs ml-2">
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {notification.source}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {notification.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {notifications.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Hide Toolbar */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-white hover:bg-red-800"
              onClick={() => setIsVisible(false)}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Banner */}
      {maintenanceMode && (
        <div className="bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
          🚧 MAINTENANCE MODE ACTIVE - Site is in maintenance mode
        </div>
      )}
    </div>
  );
};

export default AdminToolbar;
