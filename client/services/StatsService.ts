// COMPLETELY REPLACED - NO WEBSOCKET CODE
// This file has been replaced to fix getReadyStateText errors

export { safeStatsService as statsService } from './SafeStatsService';
export type { SafeStatsData as StatsData } from './SafeStatsService';

// Original file caused TypeError: this.getReadyStateText is not a function
// Now using safe implementation without WebSocket
