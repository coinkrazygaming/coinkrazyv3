import { AdvancedAnalyticsService } from './advancedAnalyticsService';

export interface SeasonalEvent {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
  type: 'holiday' | 'special' | 'weekly' | 'flash';
  multiplier: number;
  targetAudience?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DynamicPricing {
  packageId: string;
  basePrice: number;
  currentPrice: number;
  demandMultiplier: number;
  timeMultiplier: number;
  seasonalMultiplier: number;
  inventoryMultiplier: number;
  userSegmentMultiplier: number;
  lastUpdated: Date;
  priceHistory: PriceHistoryEntry[];
}

export interface PriceHistoryEntry {
  price: number;
  timestamp: Date;
  reason: string;
  demandLevel: 'low' | 'medium' | 'high' | 'peak';
}

export interface PromotionCampaign {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'bundle';
  value: number;
  startDate: Date;
  endDate: Date;
  targetPackages: string[];
  targetUsers: UserTargeting;
  conditions: PromotionConditions;
  usage: PromotionUsage;
  performance: PromotionPerformance;
  isActive: boolean;
  priority: number;
}

export interface UserTargeting {
  userSegments: string[];
  minPurchaseHistory?: number;
  maxPurchaseHistory?: number;
  geolocation?: string[];
  deviceTypes?: string[];
  acquisitionChannels?: string[];
  excludeUsers?: string[];
}

export interface PromotionConditions {
  minPurchaseAmount?: number;
  maxUsesPerUser?: number;
  maxTotalUses?: number;
  requiredPackages?: string[];
  excludedPackages?: string[];
  firstTimeUsersOnly?: boolean;
  weekdaysOnly?: boolean;
  timeRanges?: { start: string; end: string }[];
}

export interface PromotionUsage {
  totalUses: number;
  uniqueUsers: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  usageByDay: Record<string, number>;
  usageBySegment: Record<string, number>;
}

export interface PromotionPerformance {
  roi: number;
  revenueImpact: number;
  customerAcquisition: number;
  customerRetention: number;
  marketShareGrowth: number;
  competitiveAdvantage: number;
  brandAwareness: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'social' | 'display';
  audienceSegment: string;
  content: CampaignContent;
  schedule: CampaignSchedule;
  targeting: CampaignTargeting;
  performance: CampaignPerformance;
  budget: CampaignBudget;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
}

export interface CampaignContent {
  subject?: string;
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl?: string;
  template: string;
  personalization: Record<string, string>;
}

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  timeOfDay?: string;
  timezone: string;
}

export interface CampaignTargeting {
  segments: string[];
  demographics: Record<string, any>;
  behavioral: Record<string, any>;
  geographic: string[];
  deviceTypes: string[];
  excludeSegments?: string[];
}

export interface CampaignPerformance {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  unsubscribed: number;
  bounced: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  roas: number;
  costPerAcquisition: number;
}

export interface CampaignBudget {
  total: number;
  spent: number;
  costPerSend?: number;
  costPerClick?: number;
  costPerAcquisition?: number;
  dailyLimit?: number;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria;
  userCount: number;
  averageValue: number;
  conversionRate: number;
  churnRate: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface SegmentCriteria {
  demographics?: Record<string, any>;
  behavioral?: {
    totalPurchases?: { min?: number; max?: number };
    totalSpent?: { min?: number; max?: number };
    lastPurchaseDate?: { within?: number; before?: number };
    averageOrderValue?: { min?: number; max?: number };
    favoriteCategories?: string[];
    purchaseFrequency?: 'low' | 'medium' | 'high';
  };
  geographic?: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
    timezones?: string[];
  };
  engagement?: {
    loginFrequency?: 'low' | 'medium' | 'high';
    sessionDuration?: { min?: number; max?: number };
    pageViews?: { min?: number; max?: number };
    lastActiveDate?: { within?: number };
  };
  device?: {
    types?: string[];
    browsers?: string[];
    operatingSystems?: string[];
    screenSizes?: string[];
  };
}

class PromotionsService {
  private baseUrl: string;
  private analyticsService: AdvancedAnalyticsService;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    this.analyticsService = new AdvancedAnalyticsService();
  }

  // Seasonal Events Management
  async getSeasonalEvents(): Promise<SeasonalEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/seasonal-events`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch seasonal events');
      const events = await response.json();
      
      return events.map((event: any) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching seasonal events:', error);
      return this.getDefaultSeasonalEvents();
    }
  }

  async createSeasonalEvent(event: Omit<SeasonalEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<SeasonalEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/seasonal-events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) throw new Error('Failed to create seasonal event');
      const newEvent = await response.json();
      
      return {
        ...newEvent,
        startDate: new Date(newEvent.startDate),
        endDate: new Date(newEvent.endDate),
        createdAt: new Date(newEvent.createdAt),
        updatedAt: new Date(newEvent.updatedAt)
      };
    } catch (error) {
      console.error('Error creating seasonal event:', error);
      throw error;
    }
  }

  async updateSeasonalEvent(id: string, updates: Partial<SeasonalEvent>): Promise<SeasonalEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/seasonal-events/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update seasonal event');
      const updatedEvent = await response.json();
      
      return {
        ...updatedEvent,
        startDate: new Date(updatedEvent.startDate),
        endDate: new Date(updatedEvent.endDate),
        createdAt: new Date(updatedEvent.createdAt),
        updatedAt: new Date(updatedEvent.updatedAt)
      };
    } catch (error) {
      console.error('Error updating seasonal event:', error);
      throw error;
    }
  }

  async deleteSeasonalEvent(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/seasonal-events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete seasonal event');
    } catch (error) {
      console.error('Error deleting seasonal event:', error);
      throw error;
    }
  }

  // Dynamic Pricing Management
  async getDynamicPricing(packageId?: string): Promise<DynamicPricing[]> {
    try {
      const url = packageId 
        ? `${this.baseUrl}/api/promotions/dynamic-pricing/${packageId}`
        : `${this.baseUrl}/api/promotions/dynamic-pricing`;
        
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch dynamic pricing');
      const pricing = await response.json();
      
      return Array.isArray(pricing) ? pricing : [pricing];
    } catch (error) {
      console.error('Error fetching dynamic pricing:', error);
      return [];
    }
  }

  async updateDynamicPricing(packageId: string, pricing: Partial<DynamicPricing>): Promise<DynamicPricing> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/dynamic-pricing/${packageId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pricing)
      });
      
      if (!response.ok) throw new Error('Failed to update dynamic pricing');
      return await response.json();
    } catch (error) {
      console.error('Error updating dynamic pricing:', error);
      throw error;
    }
  }

  async calculateOptimalPrice(packageId: string, factors: {
    demand?: number;
    inventory?: number;
    competition?: number;
    userSegment?: string;
    timeOfDay?: number;
    dayOfWeek?: number;
    seasonalEvent?: string;
  }): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/calculate-price/${packageId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(factors)
      });
      
      if (!response.ok) throw new Error('Failed to calculate optimal price');
      const result = await response.json();
      return result.optimalPrice;
    } catch (error) {
      console.error('Error calculating optimal price:', error);
      
      // Fallback calculation
      return this.calculateFallbackPrice(packageId, factors);
    }
  }

  // Promotion Campaigns Management
  async getPromotionCampaigns(): Promise<PromotionCampaign[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/campaigns`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch promotion campaigns');
      const campaigns = await response.json();
      
      return campaigns.map((campaign: any) => ({
        ...campaign,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate)
      }));
    } catch (error) {
      console.error('Error fetching promotion campaigns:', error);
      return [];
    }
  }

  async createPromotionCampaign(campaign: Omit<PromotionCampaign, 'id'>): Promise<PromotionCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaign)
      });
      
      if (!response.ok) throw new Error('Failed to create promotion campaign');
      const newCampaign = await response.json();
      
      return {
        ...newCampaign,
        startDate: new Date(newCampaign.startDate),
        endDate: new Date(newCampaign.endDate)
      };
    } catch (error) {
      console.error('Error creating promotion campaign:', error);
      throw error;
    }
  }

  async updatePromotionCampaign(id: string, updates: Partial<PromotionCampaign>): Promise<PromotionCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/campaigns/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update promotion campaign');
      const updatedCampaign = await response.json();
      
      return {
        ...updatedCampaign,
        startDate: new Date(updatedCampaign.startDate),
        endDate: new Date(updatedCampaign.endDate)
      };
    } catch (error) {
      console.error('Error updating promotion campaign:', error);
      throw error;
    }
  }

  // Marketing Campaigns Management
  async getMarketingCampaigns(): Promise<MarketingCampaign[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/marketing-campaigns`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch marketing campaigns');
      const campaigns = await response.json();
      
      return campaigns.map((campaign: any) => ({
        ...campaign,
        schedule: {
          ...campaign.schedule,
          startDate: new Date(campaign.schedule.startDate),
          endDate: campaign.schedule.endDate ? new Date(campaign.schedule.endDate) : undefined
        }
      }));
    } catch (error) {
      console.error('Error fetching marketing campaigns:', error);
      return [];
    }
  }

  async createMarketingCampaign(campaign: Omit<MarketingCampaign, 'id'>): Promise<MarketingCampaign> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/marketing-campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaign)
      });
      
      if (!response.ok) throw new Error('Failed to create marketing campaign');
      const newCampaign = await response.json();
      
      return {
        ...newCampaign,
        schedule: {
          ...newCampaign.schedule,
          startDate: new Date(newCampaign.schedule.startDate),
          endDate: newCampaign.schedule.endDate ? new Date(newCampaign.schedule.endDate) : undefined
        }
      };
    } catch (error) {
      console.error('Error creating marketing campaign:', error);
      throw error;
    }
  }

  // User Segments Management
  async getUserSegments(): Promise<UserSegment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/user-segments`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user segments');
      const segments = await response.json();
      
      return segments.map((segment: any) => ({
        ...segment,
        lastUpdated: new Date(segment.lastUpdated)
      }));
    } catch (error) {
      console.error('Error fetching user segments:', error);
      return this.getDefaultUserSegments();
    }
  }

  async createUserSegment(segment: Omit<UserSegment, 'id' | 'userCount' | 'averageValue' | 'conversionRate' | 'churnRate' | 'lastUpdated'>): Promise<UserSegment> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/user-segments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(segment)
      });
      
      if (!response.ok) throw new Error('Failed to create user segment');
      const newSegment = await response.json();
      
      return {
        ...newSegment,
        lastUpdated: new Date(newSegment.lastUpdated)
      };
    } catch (error) {
      console.error('Error creating user segment:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getPromotionAnalytics(campaignId?: string, dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (campaignId) params.append('campaignId', campaignId);
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }
      
      const response = await fetch(`${this.baseUrl}/api/promotions/analytics?${params}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch promotion analytics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching promotion analytics:', error);
      return this.getDefaultAnalytics();
    }
  }

  async getROIAnalysis(campaignId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/roi-analysis/${campaignId}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch ROI analysis');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ROI analysis:', error);
      return { roi: 0, revenueImpact: 0, costEfficiency: 0 };
    }
  }

  // Recommendation Engine
  async getPromotionRecommendations(userId?: string, packageId?: string): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (packageId) params.append('packageId', packageId);
      
      const response = await fetch(`${this.baseUrl}/api/promotions/recommendations?${params}`, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch promotion recommendations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching promotion recommendations:', error);
      return [];
    }
  }

  async optimizeCampaign(campaignId: string, optimizationGoals: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/optimize/${campaignId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goals: optimizationGoals })
      });
      
      if (!response.ok) throw new Error('Failed to optimize campaign');
      return await response.json();
    } catch (error) {
      console.error('Error optimizing campaign:', error);
      throw error;
    }
  }

  // Real-time Price Updates
  async startPriceOptimization(packageIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/start-price-optimization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageIds })
      });
      
      if (!response.ok) throw new Error('Failed to start price optimization');
    } catch (error) {
      console.error('Error starting price optimization:', error);
      throw error;
    }
  }

  async stopPriceOptimization(packageIds: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/promotions/stop-price-optimization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ packageIds })
      });
      
      if (!response.ok) throw new Error('Failed to stop price optimization');
    } catch (error) {
      console.error('Error stopping price optimization:', error);
      throw error;
    }
  }

  // Helper Methods
  private calculateFallbackPrice(packageId: string, factors: any): number {
    // Basic fallback pricing algorithm
    let basePrice = 100; // Default base price
    let multiplier = 1;

    // Demand factor (0.5 - 2.0)
    if (factors.demand !== undefined) {
      multiplier *= 0.8 + (factors.demand * 0.4);
    }

    // Time-based factor
    if (factors.timeOfDay !== undefined) {
      const hour = factors.timeOfDay;
      if (hour >= 18 && hour <= 22) { // Peak hours
        multiplier *= 1.2;
      } else if (hour >= 2 && hour <= 6) { // Low hours
        multiplier *= 0.8;
      }
    }

    // Day of week factor
    if (factors.dayOfWeek !== undefined) {
      const day = factors.dayOfWeek;
      if (day === 5 || day === 6) { // Friday/Saturday
        multiplier *= 1.15;
      } else if (day === 1) { // Monday
        multiplier *= 0.9;
      }
    }

    // Inventory factor
    if (factors.inventory !== undefined) {
      if (factors.inventory < 10) {
        multiplier *= 1.3; // Low inventory, higher price
      } else if (factors.inventory > 100) {
        multiplier *= 0.9; // High inventory, lower price
      }
    }

    return Math.round(basePrice * multiplier * 100) / 100;
  }

  private getDefaultSeasonalEvents(): SeasonalEvent[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return [
      {
        id: 'new-year-2024',
        name: 'New Year Celebration',
        startDate: new Date(currentYear, 0, 1),
        endDate: new Date(currentYear, 0, 7),
        description: 'Ring in the new year with special promotions!',
        type: 'holiday',
        multiplier: 1.5,
        targetAudience: ['all'],
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'valentines-2024',
        name: 'Valentine\'s Day Special',
        startDate: new Date(currentYear, 1, 10),
        endDate: new Date(currentYear, 1, 14),
        description: 'Love is in the air! Special packages for couples.',
        type: 'holiday',
        multiplier: 1.3,
        targetAudience: ['couples', 'romantic'],
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'weekend-flash',
        name: 'Weekend Flash Sale',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
        description: 'Limited time weekend deals!',
        type: 'flash',
        multiplier: 0.8,
        targetAudience: ['impulse-buyers'],
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];
  }

  private getDefaultUserSegments(): UserSegment[] {
    const now = new Date();
    
    return [
      {
        id: 'high-value',
        name: 'High Value Customers',
        description: 'Customers with high lifetime value',
        criteria: {
          behavioral: {
            totalSpent: { min: 1000 },
            purchaseFrequency: 'high'
          }
        },
        userCount: 1250,
        averageValue: 2500,
        conversionRate: 0.85,
        churnRate: 0.05,
        lastUpdated: now,
        isActive: true
      },
      {
        id: 'new-users',
        name: 'New Users',
        description: 'Recently registered users',
        criteria: {
          behavioral: {
            totalPurchases: { max: 1 },
            lastPurchaseDate: { within: 30 }
          }
        },
        userCount: 3200,
        averageValue: 150,
        conversionRate: 0.15,
        churnRate: 0.45,
        lastUpdated: now,
        isActive: true
      },
      {
        id: 'mobile-users',
        name: 'Mobile Users',
        description: 'Users primarily accessing via mobile',
        criteria: {
          device: {
            types: ['mobile', 'tablet']
          }
        },
        userCount: 8500,
        averageValue: 420,
        conversionRate: 0.28,
        churnRate: 0.22,
        lastUpdated: now,
        isActive: true
      }
    ];
  }

  private getDefaultAnalytics(): any {
    return {
      totalRevenue: 125000,
      totalConversions: 850,
      averageOrderValue: 147,
      conversionRate: 0.24,
      customerAcquisitionCost: 25,
      returnOnAdSpend: 4.2,
      topPerformingCampaigns: [
        { id: 'weekend-flash', name: 'Weekend Flash Sale', revenue: 45000, conversions: 320 },
        { id: 'new-year-2024', name: 'New Year Celebration', revenue: 38000, conversions: 280 },
        { id: 'valentines-2024', name: 'Valentine\'s Day Special', revenue: 22000, conversions: 150 }
      ],
      revenueBySegment: {
        'high-value': 65000,
        'new-users': 25000,
        'mobile-users': 35000
      },
      campaignPerformance: {
        email: { openRate: 0.32, clickRate: 0.08, conversionRate: 0.22 },
        push: { openRate: 0.45, clickRate: 0.12, conversionRate: 0.18 },
        sms: { openRate: 0.78, clickRate: 0.25, conversionRate: 0.35 }
      }
    };
  }
}

export const promotionsService = new PromotionsService();
export default promotionsService;
