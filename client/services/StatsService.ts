// Redirect to new stats service to avoid cache issues
export { newStatsService as statsService } from './StatsServiceNew';
export type { StatsData } from './StatsServiceNew';

// This file now just re-exports the new service to maintain compatibility
