import { authService } from "./authService";

// Promotion Types
export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'percentage_discount' | 'fixed_discount' | 'bonus_coins' | 'bundle_deal' | 'flash_sale' | 'seasonal';
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'expired' | 'completed';
  priority: number; // Higher priority promotions override lower ones
  
  // Timing
  startDate: string;
  endDate: string;
  timezone: string;
  
  // Targeting
  targetAudience: PromotionTargeting;
  
  // Discount Configuration
  discount: DiscountConfig;
  
  // Usage Limits
  usageLimits: UsageLimits;
  
  // Conditions
  conditions: PromotionConditions;
  
  // Display
  display: PromotionDisplay;
  
  // Analytics
  analytics: PromotionAnalytics;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionTargeting {
  userSegments: string[]; // 'new_users', 'vip_users', 'returning_users', etc.
  geoTargeting: string[]; // Country codes
  deviceTypes: string[]; // 'desktop', 'mobile', 'tablet'
  packages: string[]; // Specific package IDs, empty array means all packages
  userTags: string[]; // Custom user tags
  minimumAccountAge?: number; // Days
  maximumAccountAge?: number; // Days
  minimumPurchaseHistory?: number; // Minimum previous purchases
  excludeRecentPurchasers?: number; // Exclude users who purchased in last X days
}

export interface DiscountConfig {
  // Percentage discount (e.g., 20 for 20% off)
  percentageOff?: number;
  
  // Fixed amount discount
  fixedAmountOff?: number;
  
  // Bonus coins configuration
  bonusCoins?: {
    type: 'fixed' | 'percentage';
    amount: number; // Fixed number or percentage of purchased coins
  };
  
  // Bundle deal configuration
  bundleDeal?: {
    buyQuantity: number;
    getQuantity: number; // Get X additional items
    discountPercentage?: number; // Or discount on bundle
  };
  
  // Flash sale configuration
  flashSale?: {
    originalPrice: number;
    salePrice: number;
    hourlyReduction?: number; // Price reduces every hour
    minimumPrice?: number;
  };
  
  // Seasonal multipliers
  seasonalMultiplier?: {
    coinMultiplier: number; // Multiply coins by this factor
    bonusMultiplier: number; // Multiply bonus by this factor
  };
}

export interface UsageLimits {
  totalUsageLimit?: number; // Max times promotion can be used globally
  userUsageLimit?: number; // Max times per user
  dailyLimit?: number; // Max uses per day
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  usageCount: number; // Current usage count
  userUsageCount: Record<string, number>; // Per-user usage tracking
}

export interface PromotionConditions {
  minimumCartValue?: number;
  requiredPackageTypes?: string[]; // Must include certain package types
  firstPurchaseOnly?: boolean;
  recurringCustomersOnly?: boolean;
  deviceSpecific?: string[];
  timeOfDayRestrictions?: {
    startHour: number; // 0-23
    endHour: number; // 0-23
  };
  dayOfWeekRestrictions?: number[]; // 0-6 (Sunday-Saturday)
  requiresCouponCode?: string;
  stackableWithOtherPromotions?: boolean;
}

export interface PromotionDisplay {
  bannerText: string;
  shortDescription: string;
  longDescription?: string;
  urgencyMessage?: string; // "Limited time!", "Only 2 hours left!"
  badgeText?: string; // "SALE", "NEW", "LIMITED"
  badgeColor: string;
  ctaText: string; // "Shop Now", "Claim Deal"
  images: {
    banner?: string;
    thumbnail?: string;
    icon?: string;
  };
  showCountdown?: boolean;
  highlightColor: string;
  animation?: 'pulse' | 'glow' | 'bounce' | 'none';
}

export interface PromotionAnalytics {
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  revenuePerView: number;
  uniqueUsers: number;
  averageOrderValue: number;
  totalSavingsProvided: number;
  topPerformingPackages: string[];
}

// Dynamic Pricing Types
export interface DynamicPricing {
  id: string;
  packageId: string;
  packageName: string;
  basePrice: number;
  currentPrice: number;
  priceHistory: PriceHistoryEntry[];
  pricingRules: PricingRule[];
  isActive: boolean;
  lastUpdated: string;
  nextUpdate?: string;
}

export interface PriceHistoryEntry {
  price: number;
  timestamp: string;
  reason: string; // Reason for price change
  triggeredBy?: string; // Rule ID or manual change
}

export interface PricingRule {
  id: string;
  name: string;
  type: 'demand_based' | 'time_based' | 'inventory_based' | 'competitor_based' | 'seasonal';
  priority: number;
  isActive: boolean;
  
  // Rule conditions
  conditions: PricingConditions;
  
  // Price adjustments
  adjustment: PriceAdjustment;
  
  // Timing
  schedule?: PricingSchedule;
  
  // Limits
  limits: PricingLimits;
}

export interface PricingConditions {
  // Demand-based conditions
  demandThresholds?: {
    lowDemand: { threshold: number; adjustment: number }; // Sales per hour
    mediumDemand: { threshold: number; adjustment: number };
    highDemand: { threshold: number; adjustment: number };
  };
  
  // Time-based conditions
  timeRanges?: {
    startHour: number;
    endHour: number;
    daysOfWeek: number[];
    adjustment: number;
  }[];
  
  // Inventory-based conditions
  inventoryLevels?: {
    lowStock: { threshold: number; adjustment: number };
    mediumStock: { threshold: number; adjustment: number };
    highStock: { threshold: number; adjustment: number };
  };
  
  // Competitor-based conditions
  competitorPricing?: {
    targetCompetitors: string[];
    priceMatchStrategy: 'match' | 'undercut' | 'premium';
    maxAdjustment: number;
  };
  
  // Seasonal conditions
  seasonalEvents?: {
    eventName: string;
    startDate: string;
    endDate: string;
    adjustment: number;
  }[];
}

export interface PriceAdjustment {
  type: 'percentage' | 'fixed_amount' | 'set_price';
  value: number;
  rampUp?: {
    duration: number; // Hours to reach full adjustment
    steps: number; // Number of incremental changes
  };
}

export interface PricingSchedule {
  frequency: 'hourly' | 'daily' | 'weekly' | 'on_demand';
  specificTimes?: string[]; // Specific times to run (e.g., "09:00", "18:00")
  excludeDates?: string[]; // Dates to skip (holidays, maintenance)
}

export interface PricingLimits {
  minimumPrice: number;
  maximumPrice: number;
  maxDailyChanges?: number;
  minTimeBetweenChanges?: number; // Minutes
  maxChangePercentage?: number; // Maximum change per adjustment
}

// Seasonal Events
export interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  category: 'holiday' | 'gaming_event' | 'company_milestone' | 'cultural' | 'sports';
  intensity: 'low' | 'medium' | 'high' | 'critical'; // Marketing intensity
  globalEvent: boolean; // Worldwide vs regional
  regions: string[]; // Applicable regions if not global
  
  // Event-specific configurations
  promotionTemplates: PromotionTemplate[];
  pricingStrategy: EventPricingStrategy;
  marketingAssets: EventMarketingAssets;
  
  // Analytics
  expectedLift: number; // Expected revenue increase %
  actualLift?: number; // Actual performance
  participationRate?: number; // % of users who engaged
}

export interface PromotionTemplate {
  name: string;
  description: string;
  discountPercentage: number;
  bonusCoinsMultiplier: number;
  durationHours: number;
  targetPackages: string[];
  priority: number;
}

export interface EventPricingStrategy {
  strategy: 'discount' | 'premium' | 'dynamic' | 'flash_sales';
  baseAdjustment: number; // Base price adjustment percentage
  peakHours?: { start: number; end: number; multiplier: number }[];
  flashSaleSchedule?: { hour: number; discount: number }[];
}

export interface EventMarketingAssets {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontStyle: string;
    iconSet: string;
  };
  banners: {
    header: string;
    store: string;
    popup: string;
  };
  animations: {
    type: 'confetti' | 'snow' | 'fireworks' | 'sparkles' | 'none';
    intensity: 'low' | 'medium' | 'high';
  };
}

class PromotionsService {
  private static instance: PromotionsService;
  private promotions: Map<string, Promotion> = new Map();
  private dynamicPricing: Map<string, DynamicPricing> = new Map();
  private seasonalEvents: Map<string, SeasonalEvent> = new Map();
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  static getInstance(): PromotionsService {
    if (!PromotionsService.instance) {
      PromotionsService.instance = new PromotionsService();
    }
    return PromotionsService.instance;
  }

  constructor() {
    this.loadPromotions();
    this.loadDynamicPricing();
    this.loadSeasonalEvents();
    this.startPriceUpdateLoop();
  }

  // ===============================
  // PROMOTION MANAGEMENT
  // ===============================

  /**
   * Create a new promotion
   */
  async createPromotion(promotionData: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'analytics'>): Promise<Promotion> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const promotion: Promotion = {
      ...promotionData,
      id: `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analytics: {
        views: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        revenuePerView: 0,
        uniqueUsers: 0,
        averageOrderValue: 0,
        totalSavingsProvided: 0,
        topPerformingPackages: [],
      },
    };

    this.promotions.set(promotion.id, promotion);
    await this.savePromotion(promotion);

    // Schedule activation if needed
    if (promotion.status === 'scheduled') {
      this.schedulePromotionActivation(promotion);
    }

    return promotion;
  }

  /**
   * Get active promotions for a user and package
   */
  async getActivePromotions(packageId?: string, userId?: string): Promise<Promotion[]> {
    const now = new Date();
    const activePromotions: Promotion[] = [];

    for (const promotion of this.promotions.values()) {
      // Check if promotion is active
      if (promotion.status !== 'active') continue;
      
      // Check timing
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      if (now < startDate || now > endDate) continue;
      
      // Check package targeting
      if (packageId && promotion.targetAudience.packages.length > 0) {
        if (!promotion.targetAudience.packages.includes(packageId)) continue;
      }
      
      // Check user targeting
      if (userId && !this.userMatchesTargeting(userId, promotion.targetAudience)) {
        continue;
      }
      
      // Check usage limits
      if (!this.checkUsageLimits(promotion, userId)) continue;
      
      activePromotions.push(promotion);
    }

    // Sort by priority (highest first)
    return activePromotions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Apply promotion to a purchase
   */
  async applyPromotion(promotionId: string, originalAmount: number, packageData: any, userId?: string): Promise<{
    success: boolean;
    discountAmount: number;
    finalAmount: number;
    bonusCoins: number;
    appliedPromotion: Promotion;
    error?: string;
  }> {
    const promotion = this.promotions.get(promotionId);
    if (!promotion) {
      return { success: false, discountAmount: 0, finalAmount: originalAmount, bonusCoins: 0, appliedPromotion: promotion!, error: 'Promotion not found' };
    }

    // Validate promotion can be applied
    const validationResult = await this.validatePromotionApplication(promotion, originalAmount, packageData, userId);
    if (!validationResult.valid) {
      return { success: false, discountAmount: 0, finalAmount: originalAmount, bonusCoins: 0, appliedPromotion: promotion, error: validationResult.reason };
    }

    // Calculate discount
    const result = this.calculateDiscount(promotion, originalAmount, packageData);
    
    // Update usage tracking
    if (userId) {
      this.trackPromotionUsage(promotionId, userId, result.discountAmount);
    }

    return {
      success: true,
      ...result,
      appliedPromotion: promotion,
    };
  }

  /**
   * Track promotion engagement
   */
  async trackPromotionEvent(promotionId: string, eventType: 'view' | 'click' | 'conversion', data?: any): Promise<void> {
    const promotion = this.promotions.get(promotionId);
    if (!promotion) return;

    switch (eventType) {
      case 'view':
        promotion.analytics.views++;
        promotion.analytics.uniqueUsers++;
        break;
      case 'click':
        promotion.analytics.clicks++;
        break;
      case 'conversion':
        promotion.analytics.conversions++;
        if (data?.revenue) {
          promotion.analytics.revenue += data.revenue;
        }
        if (data?.packageId && !promotion.analytics.topPerformingPackages.includes(data.packageId)) {
          promotion.analytics.topPerformingPackages.push(data.packageId);
        }
        break;
    }

    // Recalculate derived metrics
    promotion.analytics.conversionRate = promotion.analytics.views > 0 
      ? promotion.analytics.conversions / promotion.analytics.views 
      : 0;
    promotion.analytics.revenuePerView = promotion.analytics.views > 0 
      ? promotion.analytics.revenue / promotion.analytics.views 
      : 0;
    promotion.analytics.averageOrderValue = promotion.analytics.conversions > 0 
      ? promotion.analytics.revenue / promotion.analytics.conversions 
      : 0;

    promotion.updatedAt = new Date().toISOString();
    await this.savePromotion(promotion);
  }

  private calculateDiscount(promotion: Promotion, originalAmount: number, packageData: any): {
    discountAmount: number;
    finalAmount: number;
    bonusCoins: number;
  } {
    let discountAmount = 0;
    let bonusCoins = 0;

    const { discount } = promotion;

    // Percentage discount
    if (discount.percentageOff) {
      discountAmount = originalAmount * (discount.percentageOff / 100);
    }

    // Fixed amount discount
    if (discount.fixedAmountOff) {
      discountAmount = Math.min(discount.fixedAmountOff, originalAmount);
    }

    // Bonus coins
    if (discount.bonusCoins) {
      if (discount.bonusCoins.type === 'fixed') {
        bonusCoins = discount.bonusCoins.amount;
      } else if (discount.bonusCoins.type === 'percentage') {
        bonusCoins = Math.floor(packageData.goldCoins * (discount.bonusCoins.amount / 100));
      }
    }

    // Seasonal multiplier
    if (discount.seasonalMultiplier) {
      bonusCoins = Math.floor(bonusCoins * discount.seasonalMultiplier.bonusMultiplier);
    }

    // Apply usage limits
    if (promotion.usageLimits.maximumDiscountAmount) {
      discountAmount = Math.min(discountAmount, promotion.usageLimits.maximumDiscountAmount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return { discountAmount, finalAmount, bonusCoins };
  }

  // ===============================
  // DYNAMIC PRICING
  // ===============================

  /**
   * Get current dynamic price for a package
   */
  async getDynamicPrice(packageId: string): Promise<number | null> {
    const pricing = this.dynamicPricing.get(packageId);
    if (!pricing || !pricing.isActive) {
      return null;
    }

    return pricing.currentPrice;
  }

  /**
   * Update dynamic pricing based on rules
   */
  async updateDynamicPricing(packageId: string): Promise<void> {
    const pricing = this.dynamicPricing.get(packageId);
    if (!pricing || !pricing.isActive) return;

    let newPrice = pricing.basePrice;
    let appliedRuleId: string | undefined;
    let reason = 'Scheduled update';

    // Process pricing rules in priority order
    const activeRules = pricing.pricingRules
      .filter(rule => rule.isActive)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      const adjustment = await this.evaluatePricingRule(rule, pricing);
      if (adjustment !== null) {
        newPrice = this.applyPriceAdjustment(pricing.basePrice, rule.adjustment, adjustment);
        appliedRuleId = rule.id;
        reason = `Applied rule: ${rule.name}`;
        break; // Apply highest priority rule only
      }
    }

    // Apply pricing limits
    newPrice = Math.max(pricing.pricingRules[0]?.limits.minimumPrice || 0, newPrice);
    newPrice = Math.min(pricing.pricingRules[0]?.limits.maximumPrice || Infinity, newPrice);

    // Update price if changed significantly
    const priceChangeThreshold = 0.01; // $0.01
    if (Math.abs(newPrice - pricing.currentPrice) >= priceChangeThreshold) {
      const historyEntry: PriceHistoryEntry = {
        price: newPrice,
        timestamp: new Date().toISOString(),
        reason,
        triggeredBy: appliedRuleId,
      };

      pricing.currentPrice = newPrice;
      pricing.priceHistory.push(historyEntry);
      pricing.lastUpdated = new Date().toISOString();

      // Keep only last 100 history entries
      if (pricing.priceHistory.length > 100) {
        pricing.priceHistory = pricing.priceHistory.slice(-100);
      }

      await this.saveDynamicPricing(pricing);
    }
  }

  private async evaluatePricingRule(rule: PricingRule, pricing: DynamicPricing): Promise<number | null> {
    const { conditions } = rule;

    // Demand-based pricing
    if (rule.type === 'demand_based' && conditions.demandThresholds) {
      const currentDemand = await this.getCurrentDemand(pricing.packageId);
      const thresholds = conditions.demandThresholds;
      
      if (currentDemand >= thresholds.highDemand.threshold) {
        return thresholds.highDemand.adjustment;
      } else if (currentDemand >= thresholds.mediumDemand.threshold) {
        return thresholds.mediumDemand.adjustment;
      } else {
        return thresholds.lowDemand.adjustment;
      }
    }

    // Time-based pricing
    if (rule.type === 'time_based' && conditions.timeRanges) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentDay = now.getDay();

      for (const timeRange of conditions.timeRanges) {
        if (timeRange.daysOfWeek.includes(currentDay) &&
            currentHour >= timeRange.startHour &&
            currentHour <= timeRange.endHour) {
          return timeRange.adjustment;
        }
      }
    }

    // Seasonal pricing
    if (rule.type === 'seasonal' && conditions.seasonalEvents) {
      const now = new Date();
      
      for (const event of conditions.seasonalEvents) {
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        
        if (now >= startDate && now <= endDate) {
          return event.adjustment;
        }
      }
    }

    return null;
  }

  private applyPriceAdjustment(basePrice: number, adjustment: PriceAdjustment, value: number): number {
    switch (adjustment.type) {
      case 'percentage':
        return basePrice * (1 + value / 100);
      case 'fixed_amount':
        return basePrice + value;
      case 'set_price':
        return value;
      default:
        return basePrice;
    }
  }

  // ===============================
  // SEASONAL EVENTS
  // ===============================

  /**
   * Get active seasonal events
   */
  async getActiveSeasonalEvents(): Promise<SeasonalEvent[]> {
    const now = new Date();
    const activeEvents: SeasonalEvent[] = [];

    for (const event of this.seasonalEvents.values()) {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      if (now >= startDate && now <= endDate) {
        activeEvents.push(event);
      }
    }

    return activeEvents.sort((a, b) => {
      const intensityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return intensityOrder[b.intensity] - intensityOrder[a.intensity];
    });
  }

  /**
   * Create seasonal promotions automatically
   */
  async createSeasonalPromotions(eventId: string): Promise<Promotion[]> {
    const event = this.seasonalEvents.get(eventId);
    if (!event) {
      throw new Error('Seasonal event not found');
    }

    const createdPromotions: Promotion[] = [];

    for (const template of event.promotionTemplates) {
      const promotion = await this.createPromotion({
        name: `${event.name} - ${template.name}`,
        description: template.description,
        type: 'seasonal',
        status: 'scheduled',
        priority: template.priority,
        startDate: event.startDate,
        endDate: event.endDate,
        timezone: 'UTC',
        targetAudience: {
          userSegments: ['all_users'],
          geoTargeting: event.globalEvent ? [] : event.regions,
          deviceTypes: ['desktop', 'mobile', 'tablet'],
          packages: template.targetPackages,
          userTags: [],
        },
        discount: {
          percentageOff: template.discountPercentage,
          bonusCoins: {
            type: 'percentage',
            amount: (template.bonusCoinsMultiplier - 1) * 100,
          },
        },
        usageLimits: {
          usageCount: 0,
          userUsageCount: {},
        },
        conditions: {
          stackableWithOtherPromotions: false,
        },
        display: {
          bannerText: `${event.name} Special!`,
          shortDescription: template.description,
          urgencyMessage: 'Limited time offer!',
          badgeText: event.name.toUpperCase(),
          badgeColor: event.marketingAssets.theme.primaryColor,
          ctaText: 'Get Deal Now',
          images: event.marketingAssets.banners,
          showCountdown: true,
          highlightColor: event.marketingAssets.theme.primaryColor,
          animation: event.marketingAssets.animations.type === 'none' ? 'none' : 'glow',
        },
      });

      createdPromotions.push(promotion);
    }

    return createdPromotions;
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private userMatchesTargeting(userId: string, targeting: PromotionTargeting): boolean {
    // In production, this would check user properties against targeting criteria
    // For now, return true for all users
    return true;
  }

  private checkUsageLimits(promotion: Promotion, userId?: string): boolean {
    const { usageLimits } = promotion;

    // Check total usage limit
    if (usageLimits.totalUsageLimit && usageLimits.usageCount >= usageLimits.totalUsageLimit) {
      return false;
    }

    // Check user usage limit
    if (userId && usageLimits.userUsageLimit) {
      const userUsage = usageLimits.userUsageCount[userId] || 0;
      if (userUsage >= usageLimits.userUsageLimit) {
        return false;
      }
    }

    return true;
  }

  private async validatePromotionApplication(
    promotion: Promotion, 
    amount: number, 
    packageData: any, 
    userId?: string
  ): Promise<{ valid: boolean; reason?: string }> {
    const { conditions } = promotion;

    // Check minimum cart value
    if (conditions.minimumCartValue && amount < conditions.minimumCartValue) {
      return { valid: false, reason: `Minimum purchase amount is $${conditions.minimumCartValue}` };
    }

    // Check first purchase only
    if (conditions.firstPurchaseOnly && userId) {
      // In production, check if user has made previous purchases
      // For now, assume it's valid
    }

    // Check time of day restrictions
    if (conditions.timeOfDayRestrictions) {
      const now = new Date();
      const currentHour = now.getHours();
      const { startHour, endHour } = conditions.timeOfDayRestrictions;
      
      if (currentHour < startHour || currentHour > endHour) {
        return { valid: false, reason: 'Promotion not available at this time' };
      }
    }

    return { valid: true };
  }

  private trackPromotionUsage(promotionId: string, userId: string, discountAmount: number): void {
    const promotion = this.promotions.get(promotionId);
    if (!promotion) return;

    promotion.usageLimits.usageCount++;
    promotion.usageLimits.userUsageCount[userId] = (promotion.usageLimits.userUsageCount[userId] || 0) + 1;
    promotion.analytics.totalSavingsProvided += discountAmount;
    
    this.savePromotion(promotion);
  }

  private async getCurrentDemand(packageId: string): Promise<number> {
    // Mock demand calculation - in production, calculate from recent sales data
    return Math.random() * 10; // 0-10 sales per hour
  }

  private schedulePromotionActivation(promotion: Promotion): void {
    const startTime = new Date(promotion.startDate).getTime();
    const now = Date.now();
    
    if (startTime > now) {
      setTimeout(() => {
        promotion.status = 'active';
        this.savePromotion(promotion);
      }, startTime - now);
    }
  }

  private startPriceUpdateLoop(): void {
    // Update prices every 5 minutes
    this.priceUpdateInterval = setInterval(() => {
      for (const packageId of this.dynamicPricing.keys()) {
        this.updateDynamicPricing(packageId);
      }
    }, 5 * 60 * 1000);
  }

  // ===============================
  // PERSISTENCE (Mock Implementation)
  // ===============================

  private async loadPromotions(): Promise<void> {
    // Load some default seasonal events and promotions
    this.createDefaultSeasonalEvents();
    this.createDefaultPromotions();
  }

  private async loadDynamicPricing(): Promise<void> {
    // Initialize with some sample dynamic pricing
    const samplePricing: DynamicPricing = {
      id: 'dp_starter_pack',
      packageId: 'starter-pack',
      packageName: 'Starter Pack',
      basePrice: 9.99,
      currentPrice: 9.99,
      priceHistory: [],
      pricingRules: [
        {
          id: 'weekend_discount',
          name: 'Weekend Discount',
          type: 'time_based',
          priority: 1,
          isActive: true,
          conditions: {
            timeRanges: [{
              startHour: 0,
              endHour: 23,
              daysOfWeek: [5, 6], // Friday, Saturday
              adjustment: -10, // 10% discount
            }],
          },
          adjustment: {
            type: 'percentage',
            value: -10,
          },
          limits: {
            minimumPrice: 7.99,
            maximumPrice: 12.99,
          },
        },
      ],
      isActive: true,
      lastUpdated: new Date().toISOString(),
    };

    this.dynamicPricing.set(samplePricing.packageId, samplePricing);
  }

  private async loadSeasonalEvents(): Promise<void> {
    // Events are created in createDefaultSeasonalEvents
  }

  private createDefaultSeasonalEvents(): void {
    const events: SeasonalEvent[] = [
      {
        id: 'winter_holidays_2024',
        name: 'Winter Holidays',
        description: 'Christmas and New Year celebration',
        startDate: '2024-12-20T00:00:00Z',
        endDate: '2025-01-02T23:59:59Z',
        category: 'holiday',
        intensity: 'high',
        globalEvent: true,
        regions: [],
        promotionTemplates: [
          {
            name: 'Holiday Bonus',
            description: 'Extra coins for the holidays!',
            discountPercentage: 25,
            bonusCoinsMultiplier: 2.0,
            durationHours: 336, // 14 days
            targetPackages: [],
            priority: 10,
          },
        ],
        pricingStrategy: {
          strategy: 'discount',
          baseAdjustment: -15,
        },
        marketingAssets: {
          theme: {
            primaryColor: '#DC2626',
            secondaryColor: '#059669',
            fontStyle: 'festive',
            iconSet: 'holiday',
          },
          banners: {
            header: '/assets/banners/winter-header.jpg',
            store: '/assets/banners/winter-store.jpg',
            popup: '/assets/banners/winter-popup.jpg',
          },
          animations: {
            type: 'snow',
            intensity: 'medium',
          },
        },
        expectedLift: 40,
      },
    ];

    for (const event of events) {
      this.seasonalEvents.set(event.id, event);
    }
  }

  private createDefaultPromotions(): void {
    // Create some sample promotions
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const flashSale: Promotion = {
      id: 'flash_sale_weekend',
      name: 'Weekend Flash Sale',
      description: '30% off all packages this weekend!',
      type: 'flash_sale',
      status: 'active',
      priority: 5,
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      timezone: 'UTC',
      targetAudience: {
        userSegments: ['all_users'],
        geoTargeting: [],
        deviceTypes: ['desktop', 'mobile', 'tablet'],
        packages: [],
        userTags: [],
      },
      discount: {
        percentageOff: 30,
      },
      usageLimits: {
        usageCount: 0,
        userUsageCount: {},
      },
      conditions: {
        stackableWithOtherPromotions: false,
      },
      display: {
        bannerText: 'Flash Sale - 30% Off!',
        shortDescription: 'Limited time weekend sale',
        urgencyMessage: 'Ends tomorrow!',
        badgeText: 'FLASH SALE',
        badgeColor: '#EF4444',
        ctaText: 'Shop Now',
        images: {},
        showCountdown: true,
        highlightColor: '#EF4444',
        animation: 'pulse',
      },
      analytics: {
        views: 1250,
        clicks: 180,
        conversions: 45,
        revenue: 1800.55,
        conversionRate: 0.036,
        revenuePerView: 1.44,
        uniqueUsers: 1100,
        averageOrderValue: 40.01,
        totalSavingsProvided: 771.67,
        topPerformingPackages: ['starter-pack', 'value-pack'],
      },
      createdBy: 'system',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.promotions.set(flashSale.id, flashSale);
  }

  private async savePromotion(promotion: Promotion): Promise<void> {
    // In production, save to database
    console.log(`Saved promotion: ${promotion.name}`);
  }

  private async saveDynamicPricing(pricing: DynamicPricing): Promise<void> {
    // In production, save to database
    console.log(`Updated dynamic pricing for ${pricing.packageName}: $${pricing.currentPrice}`);
  }

  // ===============================
  // PUBLIC API METHODS
  // ===============================

  /**
   * Get all promotions (admin)
   */
  async getAllPromotions(): Promise<Promotion[]> {
    return Array.from(this.promotions.values());
  }

  /**
   * Get all dynamic pricing rules (admin)
   */
  async getAllDynamicPricing(): Promise<DynamicPricing[]> {
    return Array.from(this.dynamicPricing.values());
  }

  /**
   * Get all seasonal events (admin)
   */
  async getAllSeasonalEvents(): Promise<SeasonalEvent[]> {
    return Array.from(this.seasonalEvents.values());
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
  }
}

export const promotionsService = PromotionsService.getInstance();
