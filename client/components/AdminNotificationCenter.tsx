import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Filter,
  Search,
  Clock,
  User,
  Shield,
  TrendingUp,
  Activity,
  Coins,
  UserCheck,
  Ban,
  MessageSquare,
  RefreshCw,
  MarkAsRead,
  Trash2,
  Eye,
  Settings,
  Zap,
} from "lucide-react";

export interface AdminNotification {
  id: string;
  type: "security" | "system" | "user" | "financial" | "game" | "general";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable: boolean;
  action_url?: string;
  user_id?: number;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function AdminNotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onRefresh,
  isRefreshing = false,
}: NotificationCenterProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-4 h-4 ${
      priority === "critical"
        ? "text-red-500"
        : priority === "high"
          ? "text-orange-500"
          : priority === "medium"
            ? "text-yellow-500"
            : "text-blue-500"
    }`;

    switch (type) {
      case "security":
        return <Shield className={iconClass} />;
      case "system":
        return <Settings className={iconClass} />;
      case "user":
        return <User className={iconClass} />;
      case "financial":
        return <Coins className={iconClass} />;
      case "game":
        return <Activity className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variant = {
      critical: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "outline",
    }[priority] as any;

    return (
      <Badge variant={variant} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || notification.type === filterType;
    const matchesPriority =
      filterPriority === "all" || notification.priority === filterPriority;
    const matchesReadStatus = !showUnreadOnly || !notification.read;

    return matchesSearch && matchesType && matchesPriority && matchesReadStatus;
  });

  // Group notifications by type for summary
  const notificationSummary = notifications.reduce(
    (acc, notification) => {
      if (!notification.read) {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <Zap className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-6 gap-2 mt-4">
          {Object.entries(notificationSummary).map(([type, count]) => (
            <Badge
              key={type}
              variant="outline"
              className="text-center justify-center"
            >
              {type}: {count}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="financial">Financial</SelectItem>
              <SelectItem value="game">Game</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="flex-1"
            >
              Unread Only
            </Button>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllAsRead}>
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No notifications found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${
                    !notification.read
                      ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                      : "border-l-4 border-l-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(
                          notification.type,
                          notification.priority,
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm leading-tight">
                              {notification.title}
                            </h4>
                            {getPriorityBadge(notification.priority)}
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(notification.timestamp)}
                            <Separator orientation="vertical" className="h-3" />
                            <span className="capitalize">
                              {notification.type}
                            </span>
                            {notification.user_id && (
                              <>
                                <Separator
                                  orientation="vertical"
                                  className="h-3"
                                />
                                <span>User #{notification.user_id}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNotification(notification.id)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {notification.actionable && notification.action_url && (
                      <div className="mt-3 pt-3 border-t">
                        <Button variant="outline" size="sm">
                          Take Action
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
          <span>
            Showing {filteredNotifications.length} of {notifications.length}{" "}
            notifications
          </span>
          <span>Auto-refresh: {autoRefresh ? "ON" : "OFF"}</span>
        </div>
      </CardContent>
    </Card>
  );
}
