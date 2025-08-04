import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Activity,
  Play,
  Eye,
  TrendingUp,
  Clock,
} from "lucide-react";
import { playerCountService, PlayerStats } from "@/services/playerCountService";

interface RealTimePlayerCountProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const RealTimePlayerCount: React.FC<RealTimePlayerCountProps> = ({
  className = "",
  showDetails = false,
  compact = false,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    totalOnline: 0,
    playingGames: 0,
    browsing: 0,
    peakToday: 0,
    averageSessionTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Subscribe to real-time player count updates
    const unsubscribe = playerCountService.subscribeToPlayerCount((count, stats) => {
      setPlayerCount(count);
      setPlayerStats(stats);
      setIsLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <div className={`${className} animate-pulse`}>
        {compact ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded-full"></div>
            <div className="w-16 h-4 bg-muted rounded"></div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <Users className="w-4 h-4 text-green-500" />
        </div>
        <span className="font-semibold">{playerCount}</span>
        <span className="text-sm text-muted-foreground">online</span>
        <Badge variant="outline" className="text-xs px-1">
          LIVE
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`${className} transition-all duration-200`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold">Players Online</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              LIVE
            </Badge>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-green-500">{playerCount}</span>
            <span className="text-muted-foreground">players</span>
          </div>

          {showDetails && (
            <>
              {/* Activity Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-casino-blue" />
                    <span className="text-sm text-muted-foreground">Playing</span>
                  </div>
                  <div className="text-lg font-bold text-casino-blue">
                    {playerStats.playingGames}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3 text-orange-500" />
                    <span className="text-sm text-muted-foreground">Browsing</span>
                  </div>
                  <div className="text-lg font-bold text-orange-500">
                    {playerStats.browsing}
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-gold-500" />
                    <span className="text-sm text-muted-foreground">Peak Today</span>
                  </div>
                  <div className="text-lg font-bold text-gold-500">
                    {playerStats.peakToday}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Avg Session</span>
                  </div>
                  <div className="text-lg font-bold text-purple-500">
                    {playerStats.averageSessionTime}m
                  </div>
                </div>
              </div>

              {/* Real-time Indicator */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Real-time player tracking</span>
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Live updates</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimePlayerCount;
