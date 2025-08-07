import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  RefreshCw,
  Settings,
  Shield,
  Eye,
  Activity,
  Database,
  Users,
  Crown,
} from "lucide-react";

interface AdminToolbarProps {
  unreadNotifications: number;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function AdminToolbar({
  unreadNotifications,
  onRefresh,
  refreshing,
}: AdminToolbarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm border-gold-500/20"
        >
          <Shield className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="border-gold-500/20 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-gold-500" />
            <span className="text-sm font-medium">Admin Tools</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="ml-auto h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Quick Stats */}
            <div className="col-span-2 text-xs text-muted-foreground mb-2">
              Quick Access
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              className="relative"
            >
              {refreshing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>

            <Button variant="outline" size="sm" className="relative">
              <Bell className="w-3 h-3" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            <Button variant="outline" size="sm">
              <Users className="w-3 h-3" />
            </Button>

            <Button variant="outline" size="sm">
              <Activity className="w-3 h-3" />
            </Button>

            <Button variant="outline" size="sm">
              <Database className="w-3 h-3" />
            </Button>

            <Button variant="outline" size="sm">
              <Settings className="w-3 h-3" />
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Admin
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
