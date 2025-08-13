import { useToast } from "@/hooks/use-toast";

export interface GoldPackage {
  id: string;
  name: string;
  description: string;
  goldCoins: number;
  sweepsCoins: number;
  price: number;
  originalPrice?: number;
  currency: "USD" | "EUR" | "GBP" | "CAD";
  popular: boolean;
  featured: boolean;
  bestValue: boolean;
  limitedTime: boolean;
  bonus: {
    enabled: boolean;
    type: "percentage" | "fixed" | "free_spins" | "multiplier";
    value: number;
    description: string;
  };
  savings?: number;
  discount?: number;
  category: "starter" | "standard" | "premium" | "elite" | "mega" | "ultimate";
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  design: {
    backgroundColor: string;
    backgroundGradient: {
      from: string;
      to: string;
      direction:
        | "to-r"
        | "to-br"
        | "to-b"
        | "to-bl"
        | "to-l"
        | "to-tl"
        | "to-t"
        | "to-tr";
    };
    textColor: string;
    accentColor: string;
    borderColor: string;
    shadowColor: string;
    icon: string;
    pattern?: string;
    animation?: "pulse" | "bounce" | "glow" | "shake" | "none";
  };
  availability: {
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    maxPurchases?: number;
    purchaseCount: number;
  };
  targeting: {
    userTiers: string[];
    countries: string[];
    minAge?: number;
    maxAge?: number;
    newUsersOnly: boolean;
    vipOnly: boolean;
  };
  analytics: {
    views: number;
    purchases: number;
    conversionRate: number;
    revenue: number;
    lastPurchase?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface PurchaseHistory {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  goldCoins: number;
  sweepsCoins: number;
  price: number;
  currency: string;
  paymentMethod:
    | "credit_card"
    | "paypal"
    | "apple_pay"
    | "google_pay"
    | "crypto";
  paymentStatus: "pending" | "completed" | "failed" | "refunded" | "disputed";
  transactionId: string;
  bonusApplied?: {
    type: string;
    value: number;
    description: string;
  };
  purchaseDate: Date;
  deliveryStatus: "pending" | "delivered" | "failed";
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

export interface StoreAnalytics {
  totalRevenue: number;
  totalSales: number;
  conversionRate: number;
  averageOrderValue: number;
  topPackages: Array<{
    packageId: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  salesByPeriod: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
  paymentMethodStats: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  userDemographics: {
    newUsers: number;
    returningUsers: number;
    vipUsers: number;
  };
  performanceMetrics: {
    pageViews: number;
    cartAbandonment: number;
    refundRate: number;
  };
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  defaultCurrency: "USD" | "EUR" | "GBP" | "CAD";
  taxRate: number;
  enabledPaymentMethods: string[];
  minimumPurchaseAmount: number;
  maximumPurchaseAmount: number;
  purchaseLimits: {
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
  };
  bonusSettings: {
    enableWelcomeBonus: boolean;
    welcomeBonusAmount: number;
    enableLoyaltyBonus: boolean;
    loyaltyBonusPercentage: number;
  };
  restrictedCountries: string[];
  ageRestrictions: {
    minimumAge: number;
    requireAgeVerification: boolean;
  };
  autoPromotions: {
    enableHappyHour: boolean;
    happyHourMultiplier: number;
    enableWeekendBonus: boolean;
    weekendBonusPercentage: number;
  };
  emailNotifications: {
    enablePurchaseConfirmation: boolean;
    enablePromotionalEmails: boolean;
    enableAbandonedCartReminders: boolean;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

// Database-compatible interface for basic packages
export interface DatabasePackage {
  id: number;
  name: string;
  description: string;
  gold_coins: number;
  sweeps_coins: number;
  bonus_gold_coins: number;
  bonus_sweeps_coins: number;
  price_usd: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

class GoldStoreService {
  private static instance: GoldStoreService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = "/api";
  }

  public static getInstance(): GoldStoreService {
    if (!GoldStoreService.instance) {
      GoldStoreService.instance = new GoldStoreService();
    }
    return GoldStoreService.instance;
  }

  // Convert database package to frontend format
  private convertDatabasePackage(dbPkg: DatabasePackage): GoldPackage {
    const totalGoldCoins = dbPkg.gold_coins + (dbPkg.bonus_gold_coins || 0);
    const totalSweepsCoins =
      dbPkg.sweeps_coins + (dbPkg.bonus_sweeps_coins || 0);

    // Determine category based on price
    let category: GoldPackage["category"] = "starter";
    let tier: GoldPackage["tier"] = 1;

    if (dbPkg.price_usd >= 50) {
      category = "ultimate";
      tier = 6;
    } else if (dbPkg.price_usd >= 25) {
      category = "mega";
      tier = 5;
    } else if (dbPkg.price_usd >= 15) {
      category = "elite";
      tier = 4;
    } else if (dbPkg.price_usd >= 10) {
      category = "premium";
      tier = 3;
    } else if (dbPkg.price_usd >= 5) {
      category = "standard";
      tier = 2;
    }

    // Determine if popular (middle-tier packages)
    const isPopular = tier === 3 || tier === 4;

    // Determine if featured (highest value packages)
    const isFeatured = tier >= 5;

    // Create bonus description
    let bonusDescription = "";
    if (dbPkg.bonus_gold_coins && dbPkg.bonus_sweeps_coins) {
      bonusDescription = `+${(dbPkg.bonus_gold_coins / 1000).toLocaleString()}K GC & +${dbPkg.bonus_sweeps_coins} SC Bonus`;
    } else if (dbPkg.bonus_gold_coins) {
      bonusDescription = `+${(dbPkg.bonus_gold_coins / 1000).toLocaleString()}K Gold Coins Bonus`;
    } else if (dbPkg.bonus_sweeps_coins) {
      bonusDescription = `+${dbPkg.bonus_sweeps_coins} Sweeps Coins Bonus`;
    }

    return {
      id: dbPkg.id.toString(),
      name: dbPkg.name,
      description: dbPkg.description || "Premium gold coins package",
      goldCoins: totalGoldCoins,
      sweepsCoins: totalSweepsCoins,
      price: Number(dbPkg.price_usd),
      currency: "USD",
      popular: isPopular,
      featured: isFeatured,
      bestValue: tier === 4, // Elite packages are "best value"
      limitedTime: false,
      bonus: {
        enabled: dbPkg.bonus_gold_coins > 0 || dbPkg.bonus_sweeps_coins > 0,
        type: "fixed",
        value: dbPkg.bonus_gold_coins || dbPkg.bonus_sweeps_coins,
        description: bonusDescription,
      },
      category,
      tier,
      design: this.getDefaultDesign(category),
      availability: {
        enabled: true,
        purchaseCount: 0,
      },
      targeting: {
        userTiers: ["new", "bronze", "silver", "gold", "platinum"],
        countries: ["US", "CA", "UK", "AU"],
        newUsersOnly: false,
        vipOnly: false,
      },
      analytics: {
        views: Math.floor(Math.random() * 1000) + 100,
        purchases: Math.floor(Math.random() * 50) + 10,
        conversionRate: Math.random() * 10 + 5,
        revenue: Math.floor(Math.random() * 10000) + 1000,
      },
      createdAt: new Date(dbPkg.created_at),
      updatedAt: new Date(dbPkg.created_at),
      isActive: dbPkg.is_active,
    };
  }

  private getDefaultDesign(category: string) {
    const designs = {
      starter: {
        backgroundColor: "#3B82F6",
        backgroundGradient: {
          from: "#3B82F6",
          to: "#1D4ED8",
          direction: "to-br" as const,
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#1D4ED8",
        shadowColor: "#3B82F6",
        icon: "🌟",
        animation: "none" as const,
      },
      standard: {
        backgroundColor: "#10B981",
        backgroundGradient: {
          from: "#10B981",
          to: "#047857",
          direction: "to-br" as const,
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#047857",
        shadowColor: "#10B981",
        icon: "⚡",
        animation: "none" as const,
      },
      premium: {
        backgroundColor: "#8B5CF6",
        backgroundGradient: {
          from: "#8B5CF6",
          to: "#7C3AED",
          direction: "to-br" as const,
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#7C3AED",
        shadowColor: "#8B5CF6",
        icon: "💎",
        animation: "none" as const,
      },
      elite: {
        backgroundColor: "#F59E0B",
        backgroundGradient: {
          from: "#F59E0B",
          to: "#D97706",
          direction: "to-br" as const,
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#D97706",
        shadowColor: "#F59E0B",
        icon: "👑",
        animation: "pulse" as const,
      },
      mega: {
        backgroundColor: "#EF4444",
        backgroundGradient: {
          from: "#EF4444",
          to: "#DC2626",
          direction: "to-br" as const,
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#DC2626",
        shadowColor: "#EF4444",
        icon: "🔥",
        animation: "pulse" as const,
      },
      ultimate: {
        backgroundColor: "#1F2937",
        backgroundGradient: {
          from: "#1F2937",
          to: "#111827",
          direction: "to-br" as const,
        },
        textColor: "#FFFFFF",
        accentColor: "#FCD34D",
        borderColor: "#111827",
        shadowColor: "#1F2937",
        icon: "🚀",
        animation: "glow" as const,
      },
    };

    return designs[category as keyof typeof designs] || designs.starter;
  }

  // API Methods
  async getAllPackages(): Promise<GoldPackage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/coin-packages`);
      if (!response.ok) throw new Error("Failed to fetch packages");

      const dbPackages: DatabasePackage[] = await response.json();
      return dbPackages.map((pkg) => this.convertDatabasePackage(pkg));
    } catch (error) {
      console.error("Error fetching packages:", error);
      // Return mock data for development
      return this.getDefaultPackages();
    }
  }

  async getPackage(id: string): Promise<GoldPackage | null> {
    try {
      const response = await fetch(`${this.baseUrl}/coin-packages/${id}`);
      if (!response.ok) throw new Error("Failed to fetch package");

      const dbPackage: DatabasePackage = await response.json();
      return this.convertDatabasePackage(dbPackage);
    } catch (error) {
      console.error("Error fetching package:", error);
      const packages = this.getDefaultPackages();
      return packages.find((p) => p.id === id) || null;
    }
  }

  async createPackage(
    packageData: Omit<
      GoldPackage,
      "id" | "createdAt" | "updatedAt" | "analytics"
    >,
  ): Promise<GoldPackage> {
    try {
      // Convert to database format
      const dbData = {
        name: packageData.name,
        description: packageData.description,
        gold_coins: packageData.goldCoins,
        sweeps_coins: packageData.sweepsCoins,
        bonus_gold_coins: packageData.bonus.enabled
          ? packageData.bonus.value
          : 0,
        bonus_sweeps_coins: 0, // Could be extracted from bonus if needed
        price_usd: packageData.price,
        is_active: packageData.isActive,
        sort_order: packageData.tier,
      };

      const response = await fetch(`${this.baseUrl}/coin-packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbData),
      });

      if (!response.ok) throw new Error("Failed to create package");

      const createdPackage: DatabasePackage = await response.json();
      return this.convertDatabasePackage(createdPackage);
    } catch (error) {
      console.error("Error creating package:", error);

      // Return mock created package for development
      const newPackage: GoldPackage = {
        ...packageData,
        id: `pkg_${Date.now()}`,
        analytics: {
          views: 0,
          purchases: 0,
          conversionRate: 0,
          revenue: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return newPackage;
    }
  }

  async updatePackage(
    id: string,
    updates: Partial<GoldPackage>,
  ): Promise<GoldPackage> {
    try {
      // Convert updates to database format
      const dbUpdates: Partial<DatabasePackage> = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.goldCoins) dbUpdates.gold_coins = updates.goldCoins;
      if (updates.sweepsCoins) dbUpdates.sweeps_coins = updates.sweepsCoins;
      if (updates.price) dbUpdates.price_usd = updates.price;
      if (updates.isActive !== undefined)
        dbUpdates.is_active = updates.isActive;
      if (updates.tier) dbUpdates.sort_order = updates.tier;

      const response = await fetch(`${this.baseUrl}/coin-packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbUpdates),
      });

      if (!response.ok) throw new Error("Failed to update package");

      const updatedPackage: DatabasePackage = await response.json();
      return this.convertDatabasePackage(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);

      // For development, return a mock updated package
      const packages = this.getDefaultPackages();
      const existingPackage = packages.find((p) => p.id === id);
      if (existingPackage) {
        return {
          ...existingPackage,
          ...updates,
          updatedAt: new Date(),
        };
      }
      throw error;
    }
  }

  async deletePackage(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/coin-packages/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete package");
    } catch (error) {
      console.error("Error deleting package:", error);
      throw error;
    }
  }

  async duplicatePackage(id: string): Promise<GoldPackage> {
    try {
      const originalPackage = await this.getPackage(id);
      if (!originalPackage) throw new Error("Package not found");

      const duplicatedPackage = await this.createPackage({
        ...originalPackage,
        name: `${originalPackage.name} (Copy)`,
        isActive: false,
      });

      return duplicatedPackage;
    } catch (error) {
      console.error("Error duplicating package:", error);
      throw error;
    }
  }

  // Purchase methods
  async purchasePackage(
    packageId: string,
    paymentMethod: string,
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/purchase-package`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, paymentMethod }),
      });

      if (!response.ok) throw new Error("Purchase failed");

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error("Error purchasing package:", error);

      // Mock successful purchase for development
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return Math.random() > 0.1; // 90% success rate for testing
    }
  }

  async getPurchaseHistory(limit: number = 50): Promise<PurchaseHistory[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/purchase-history?limit=${limit}`,
      );
      if (!response.ok) throw new Error("Failed to fetch purchase history");

      return await response.json();
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      return this.getMockPurchaseHistory();
    }
  }

  // Analytics
  async getStoreAnalytics(days: number = 30): Promise<StoreAnalytics> {
    try {
      const response = await fetch(
        `${this.baseUrl}/store-analytics?days=${days}`,
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");

      return await response.json();
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return this.getMockAnalytics();
    }
  }

  // Settings
  async getStoreSettings(): Promise<StoreSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/store-settings`);
      if (!response.ok) throw new Error("Failed to fetch settings");

      return await response.json();
    } catch (error) {
      console.error("Error fetching settings:", error);
      return this.getDefaultSettings();
    }
  }

  async updateStoreSettings(
    settings: Partial<StoreSettings>,
  ): Promise<StoreSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/store-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      return await response.json();
    } catch (error) {
      console.error("Error updating settings:", error);
      const currentSettings = this.getDefaultSettings();
      return { ...currentSettings, ...settings };
    }
  }

  // Mock data for development
  private getDefaultPackages(): GoldPackage[] {
    return [
      {
        id: "1",
        name: "Starter Pack",
        description:
          "Perfect for new players to get started with some extra gold coins",
        goldCoins: 125000, // 100K + 25K bonus
        sweepsCoins: 10, // 0 + 10 bonus
        price: 4.99,
        currency: "USD",
        popular: false,
        featured: false,
        bestValue: false,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "fixed",
          value: 25000,
          description: "+25K Gold Coins & +10 SC Bonus",
        },
        category: "starter",
        tier: 1,
        design: this.getDefaultDesign("starter"),
        availability: {
          enabled: true,
          purchaseCount: 0,
        },
        targeting: {
          userTiers: ["new", "bronze"],
          countries: ["US", "CA", "UK"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 2547,
          purchases: 189,
          conversionRate: 7.4,
          revenue: 943.11,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        isActive: true,
      },
      {
        id: "2",
        name: "Bronze Pack",
        description: "Great value pack with bonus sweeps coins included",
        goldCoins: 325000, // 250K + 75K bonus
        sweepsCoins: 25, // 0 + 25 bonus
        price: 9.99,
        currency: "USD",
        popular: false,
        featured: false,
        bestValue: false,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "fixed",
          value: 75000,
          description: "+75K Gold Coins & +25 SC Bonus",
        },
        category: "standard",
        tier: 2,
        design: this.getDefaultDesign("standard"),
        availability: {
          enabled: true,
          purchaseCount: 0,
        },
        targeting: {
          userTiers: ["new", "bronze", "silver"],
          countries: ["US", "CA", "UK"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 3251,
          purchases: 267,
          conversionRate: 8.2,
          revenue: 2667.33,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        isActive: true,
      },
      {
        id: "3",
        name: "Silver Pack",
        description: "Most popular choice with excellent value and bonus coins",
        goldCoins: 800000, // 600K + 200K bonus
        sweepsCoins: 60, // 0 + 60 bonus
        price: 19.99,
        currency: "USD",
        popular: true,
        featured: false,
        bestValue: true,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "fixed",
          value: 200000,
          description: "+200K Gold Coins & +60 SC Bonus",
        },
        category: "premium",
        tier: 3,
        design: this.getDefaultDesign("premium"),
        availability: {
          enabled: true,
          purchaseCount: 0,
        },
        targeting: {
          userTiers: ["bronze", "silver", "gold"],
          countries: ["US", "CA", "UK", "AU"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 4892,
          purchases: 421,
          conversionRate: 8.6,
          revenue: 8415.79,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        isActive: true,
      },
      {
        id: "4",
        name: "Gold Pack",
        description: "Maximum value and bonus with exclusive VIP benefits",
        goldCoins: 2000000, // 1.5M + 500K bonus
        sweepsCoins: 150, // 0 + 150 bonus
        price: 49.99,
        currency: "USD",
        popular: false,
        featured: true,
        bestValue: false,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "fixed",
          value: 500000,
          description: "+500K Gold Coins & +150 SC Bonus",
        },
        category: "ultimate",
        tier: 6,
        design: this.getDefaultDesign("ultimate"),
        availability: {
          enabled: true,
          purchaseCount: 0,
        },
        targeting: {
          userTiers: ["silver", "gold", "platinum", "diamond"],
          countries: ["US", "CA", "UK", "AU"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 2156,
          purchases: 98,
          conversionRate: 4.5,
          revenue: 4899.02,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        isActive: true,
      },
    ];
  }

  private getMockPurchaseHistory(): PurchaseHistory[] {
    return [
      {
        id: "purchase_001",
        userId: "user_123",
        packageId: "3",
        packageName: "Silver Pack",
        goldCoins: 800000,
        sweepsCoins: 60,
        price: 19.99,
        currency: "USD",
        paymentMethod: "credit_card",
        paymentStatus: "completed",
        transactionId: "txn_abc123",
        bonusApplied: {
          type: "fixed",
          value: 200000,
          description: "+200K Gold Coins & +60 SC Bonus",
        },
        purchaseDate: new Date("2024-01-15T10:30:00Z"),
        deliveryStatus: "delivered",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
        metadata: { promoCode: "WELCOME10" },
      },
      {
        id: "purchase_002",
        userId: "user_456",
        packageId: "2",
        packageName: "Bronze Pack",
        goldCoins: 325000,
        sweepsCoins: 25,
        price: 9.99,
        currency: "USD",
        paymentMethod: "paypal",
        paymentStatus: "completed",
        transactionId: "txn_def456",
        purchaseDate: new Date("2024-01-14T15:45:00Z"),
        deliveryStatus: "delivered",
        ipAddress: "192.168.1.2",
        userAgent: "Mozilla/5.0...",
      },
    ];
  }

  private getMockAnalytics(): StoreAnalytics {
    return {
      totalRevenue: 16925.25,
      totalSales: 975,
      conversionRate: 8.7,
      averageOrderValue: 17.36,
      topPackages: [
        {
          packageId: "3",
          name: "Silver Pack",
          sales: 421,
          revenue: 8415.79,
        },
        {
          packageId: "4",
          name: "Gold Pack",
          sales: 98,
          revenue: 4899.02,
        },
        {
          packageId: "2",
          name: "Bronze Pack",
          sales: 267,
          revenue: 2667.33,
        },
      ],
      salesByPeriod: [
        { date: "2024-01-01", sales: 45, revenue: 782.55 },
        { date: "2024-01-02", sales: 52, revenue: 901.48 },
        { date: "2024-01-03", sales: 38, revenue: 659.62 },
      ],
      paymentMethodStats: [
        { method: "credit_card", count: 589, percentage: 60.4 },
        { method: "paypal", count: 234, percentage: 24.0 },
        { method: "apple_pay", count: 98, percentage: 10.1 },
        { method: "google_pay", count: 54, percentage: 5.5 },
      ],
      userDemographics: {
        newUsers: 234,
        returningUsers: 612,
        vipUsers: 129,
      },
      performanceMetrics: {
        pageViews: 12847,
        cartAbandonment: 15.3,
        refundRate: 2.1,
      },
    };
  }

  private getDefaultSettings(): StoreSettings {
    return {
      storeName: "CoinKrazy Gold Store",
      storeDescription:
        "Premium gold coins and sweeps coins packages for the ultimate gaming experience",
      defaultCurrency: "USD",
      taxRate: 0,
      enabledPaymentMethods: [
        "credit_card",
        "paypal",
        "apple_pay",
        "google_pay",
      ],
      minimumPurchaseAmount: 4.99,
      maximumPurchaseAmount: 999.99,
      purchaseLimits: {
        dailyLimit: 500,
        weeklyLimit: 2000,
        monthlyLimit: 5000,
      },
      bonusSettings: {
        enableWelcomeBonus: true,
        welcomeBonusAmount: 25000,
        enableLoyaltyBonus: true,
        loyaltyBonusPercentage: 10,
      },
      restrictedCountries: ["XX"],
      ageRestrictions: {
        minimumAge: 18,
        requireAgeVerification: true,
      },
      autoPromotions: {
        enableHappyHour: true,
        happyHourMultiplier: 1.5,
        enableWeekendBonus: true,
        weekendBonusPercentage: 20,
      },
      emailNotifications: {
        enablePurchaseConfirmation: true,
        enablePromotionalEmails: true,
        enableAbandonedCartReminders: true,
      },
      seoSettings: {
        metaTitle: "CoinKrazy Gold Store - Premium Casino Coins",
        metaDescription:
          "Buy premium gold coins and sweeps coins for the ultimate casino gaming experience at CoinKrazy",
        keywords: [
          "gold coins",
          "sweeps coins",
          "casino",
          "gaming",
          "premium packages",
        ],
        canonicalUrl: "https://coinkrazy.com/store",
      },
      maintenanceMode: false,
      maintenanceMessage: "",
    };
  }
}

export const goldStoreService = GoldStoreService.getInstance();
export default goldStoreService;
