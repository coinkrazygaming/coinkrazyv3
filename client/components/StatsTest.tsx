import { useEffect, useState } from 'react';
import { statsService, StatsData } from '../services/StatsService';

export function StatsTest() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Unknown');

  useEffect(() => {
    // Subscribe to stats updates
    const unsubscribe = statsService.subscribe((data) => {
      setStats(data);
    });

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      setConnectionStatus(statsService.getConnectionStatus());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
    };
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Stats Service Test</h3>
      <div className="text-sm text-muted-foreground mb-2">
        Connection Status: <span className="font-mono">{connectionStatus}</span>
      </div>
      {stats ? (
        <div className="space-y-1 text-sm">
          <div>Players Online: {stats.playersOnline}</div>
          <div>Total Wins: {stats.totalWins}</div>
          <div>Active Games: {stats.activeGames}</div>
          <div>Server Status: {stats.serverStatus}</div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Loading stats...</div>
      )}
    </div>
  );
}
