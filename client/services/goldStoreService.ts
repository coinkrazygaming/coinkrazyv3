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
  refundReason?: string;
  refundDate?: Date;
}

export interface StoreAnalytics {
  totalRevenue: number;
  totalPurchases: number;
  averageOrderValue: number;
  conversionRate: number;
  topPackages: {
    packageId: string;
    name: string;
    purchases: number;
    revenue: number;
  }[];
  revenueByDay: {
    date: Date;
    revenue: number;
    purchases: number;
  }[];
  userDemographics: {
    newUsers: number;
    returningUsers: number;
    vipUsers: number;
  };
  paymentMethods: {
    method: string;
    count: number;
    percentage: number;
  }[];
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  defaultCurrency: "USD" | "EUR" | "GBP" | "CAD";
  allowedPaymentMethods: string[];
  taxSettings: {
    enabled: boolean;
    rate: number;
    includedInPrice: boolean;
  };
  discountSettings: {
    maxDiscountPercentage: number;
    allowStackingDiscounts: boolean;
    minimumPurchaseForDiscount: number;
  };
  purchaseLimits: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
    perPackageLimit?: number;
  };
  notifications: {
    emailReceipts: boolean;
    purchaseAlerts: boolean;
    lowStockAlerts: boolean;
  };
  uiSettings: {
    theme: "casino" | "modern" | "classic" | "dark";
    layout: "grid" | "list" | "carousel";
    showPrices: boolean;
    showSavings: boolean;
    showPopularBadges: boolean;
    animationsEnabled: boolean;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };
}

class GoldStoreService {
  private static instance: GoldStoreService;
  private baseUrl = "/api/store";

  public static getInstance(): GoldStoreService {
    if (!GoldStoreService.instance) {
      GoldStoreService.instance = new GoldStoreService();
    }
    return GoldStoreService.instance;
  }

  // Package Management
  async getAllPackages(): Promise<GoldPackage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/packages`);
      if (!response.ok) throw new Error("Failed to fetch packages");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching packages:", error);
      return this.getDefaultPackages();
    }
  }

  async getPackage(id: string): Promise<GoldPackage | null> {
    try {
      const response = await fetch(`${this.baseUrl}/packages/${id}`);
      if (!response.ok) throw new Error("Failed to fetch package");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
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
      const response = await fetch(`${this.baseUrl}/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });

      if (!response.ok) throw new Error("Failed to create package");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating package:", error);

      // Return mock created package
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
      const response = await fetch(`${this.baseUrl}/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updates, updatedAt: new Date() }),
      });

      if (!response.ok) throw new Error("Failed to update package");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating package:", error);

      // For development, return a mock updated package instead of throwing
      const packages = this.getDefaultPackages();
      const existingPackage = packages.find(p => p.id === id);
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
      const response = await fetch(`${this.baseUrl}/packages/${id}`, {
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
        analytics: undefined,
      });

      return duplicatedPackage;
    } catch (error) {
      console.error("Error duplicating package:", error);
      throw error;
    }
  }

  // Purchase Management
  async getPurchaseHistory(
    userId?: string,
    limit: number = 100,
  ): Promise<PurchaseHistory[]> {
    try {
      const url = userId
        ? `${this.baseUrl}/purchases?userId=${userId}&limit=${limit}`
        : `${this.baseUrl}/purchases?limit=${limit}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch purchase history");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      return this.getMockPurchaseHistory();
    }
  }

  async purchasePackage(
    packageId: string,
    paymentMethod: string,
  ): Promise<{ success: boolean; transactionId: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, paymentMethod }),
      });

      if (!response.ok) throw new Error("Failed to process purchase");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing purchase:", error);

      // Mock successful purchase for development
      return {
        success: true,
        transactionId: `txn_${Date.now()}`,
      };
    }
  }

  async refundPurchase(
    purchaseId: string,
    reason: string,
  ): Promise<{ success: boolean; refundId: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId, reason }),
      });

      if (!response.ok) throw new Error("Failed to process refund");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error processing refund:", error);
      throw error;
    }
  }

  // Analytics
  async getStoreAnalytics(days: number = 30): Promise<StoreAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics?days=${days}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return this.getMockAnalytics();
    }
  }

  // Settings
  async getStoreSettings(): Promise<StoreSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      if (!response.ok) throw new Error("Failed to fetch settings");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

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
      const response = await fetch(`${this.baseUrl}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  }

  // Mock data for development
  private getDefaultPackages(): GoldPackage[] {
    return [
      {
        id: "starter_pack",
        name: "Starter Pack",
        description:
          "Perfect for new players to get started with some extra gold coins",
        goldCoins: 10000,
        sweepsCoins: 0,
        price: 4.99,
        currency: "USD",
        popular: false,
        featured: false,
        bestValue: false,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "percentage",
          value: 10,
          description: "10% Bonus Gold Coins",
        },
        category: "starter",
        tier: 1,
        design: {
          backgroundColor: "#3B82F6",
          backgroundGradient: {
            from: "#3B82F6",
            to: "#1D4ED8",
            direction: "to-br",
          },
          textColor: "#FFFFFF",
          accentColor: "#FCD34D",
          borderColor: "#1D4ED8",
          shadowColor: "#3B82F6",
          icon: "🌟",
          animation: "none",
        },
        availability: {
          enabled: true,
          purchaseCount: 1247,
        },
        targeting: {
          userTiers: ["new", "bronze"],
          countries: ["US", "CA", "UK", "AU"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 15420,
          purchases: 1247,
          conversionRate: 8.1,
          revenue: 6224.53,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
      },
      {
        id: "standard_pack",
        name: "Standard Pack",
        description: "Great value pack with bonus sweeps coins included",
        goldCoins: 25000,
        sweepsCoins: 5,
        price: 9.99,
        originalPrice: 12.99,
        currency: "USD",
        popular: true,
        featured: false,
        bestValue: false,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "fixed",
          value: 5000,
          description: "+5,000 Bonus Gold Coins",
        },
        savings: 3.0,
        discount: 23,
        category: "standard",
        tier: 2,
        design: {
          backgroundColor: "#10B981",
          backgroundGradient: {
            from: "#10B981",
            to: "#047857",
            direction: "to-br",
          },
          textColor: "#FFFFFF",
          accentColor: "#FCD34D",
          borderColor: "#047857",
          shadowColor: "#10B981",
          icon: "💎",
          animation: "glow",
        },
        availability: {
          enabled: true,
          purchaseCount: 2841,
        },
        targeting: {
          userTiers: ["bronze", "silver"],
          countries: ["US", "CA", "UK", "AU", "DE", "FR"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 23180,
          purchases: 2841,
          conversionRate: 12.3,
          revenue: 28385.59,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
      },
      {
        id: "premium_pack",
        name: "Premium Pack",
        description: "Premium package with maximum value and exclusive bonuses",
        goldCoins: 75000,
        sweepsCoins: 25,
        price: 24.99,
        originalPrice: 34.99,
        currency: "USD",
        popular: false,
        featured: true,
        bestValue: true,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "multiplier",
          value: 1.5,
          description: "50% More Gold Coins",
        },
        savings: 10.0,
        discount: 29,
        category: "premium",
        tier: 3,
        design: {
          backgroundColor: "#8B5CF6",
          backgroundGradient: {
            from: "#8B5CF6",
            to: "#5B21B6",
            direction: "to-br",
          },
          textColor: "#FFFFFF",
          accentColor: "#FCD34D",
          borderColor: "#5B21B6",
          shadowColor: "#8B5CF6",
          icon: "👑",
          animation: "pulse",
        },
        availability: {
          enabled: true,
          purchaseCount: 1683,
        },
        targeting: {
          userTiers: ["silver", "gold", "platinum"],
          countries: ["US", "CA", "UK", "AU", "DE", "FR", "ES", "IT"],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 18920,
          purchases: 1683,
          conversionRate: 8.9,
          revenue: 42033.17,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
      },
      {
        id: "elite_pack",
        name: "Elite Pack",
        description:
          "Elite tier package for serious players with massive coin bonuses",
        goldCoins: 150000,
        sweepsCoins: 75,
        price: 49.99,
        originalPrice: 69.99,
        currency: "USD",
        popular: false,
        featured: true,
        bestValue: false,
        limitedTime: true,
        bonus: {
          enabled: true,
          type: "percentage",
          value: 100,
          description: "Double Gold Coins Bonus",
        },
        savings: 20.0,
        discount: 29,
        category: "elite",
        tier: 4,
        design: {
          backgroundColor: "#F59E0B",
          backgroundGradient: {
            from: "#F59E0B",
            to: "#D97706",
            direction: "to-br",
          },
          textColor: "#FFFFFF",
          accentColor: "#FEF3C7",
          borderColor: "#D97706",
          shadowColor: "#F59E0B",
          icon: "⚡",
          animation: "bounce",
        },
        availability: {
          enabled: true,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          purchaseCount: 847,
        },
        targeting: {
          userTiers: ["gold", "platinum", "diamond"],
          countries: [
            "US",
            "CA",
            "UK",
            "AU",
            "DE",
            "FR",
            "ES",
            "IT",
            "NL",
            "SE",
          ],
          newUsersOnly: false,
          vipOnly: false,
        },
        analytics: {
          views: 12450,
          purchases: 847,
          conversionRate: 6.8,
          revenue: 42341.53,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
      },
      {
        id: "mega_pack",
        name: "Mega Pack",
        description:
          "The ultimate package for high rollers with exclusive VIP benefits",
        goldCoins: 500000,
        sweepsCoins: 250,
        price: 99.99,
        originalPrice: 149.99,
        currency: "USD",
        popular: false,
        featured: true,
        bestValue: false,
        limitedTime: false,
        bonus: {
          enabled: true,
          type: "free_spins",
          value: 100,
          description: "100 Free Spins + VIP Treatment",
        },
        savings: 50.0,
        discount: 33,
        category: "mega",
        tier: 5,
        design: {
          backgroundColor: "#EF4444",
          backgroundGradient: {
            from: "#EF4444",
            to: "#B91C1C",
            direction: "to-br",
          },
          textColor: "#FFFFFF",
          accentColor: "#FEF3C7",
          borderColor: "#B91C1C",
          shadowColor: "#EF4444",
          icon: "🔥",
          animation: "glow",
        },
        availability: {
          enabled: true,
          maxPurchases: 1000,
          purchaseCount: 234,
        },
        targeting: {
          userTiers: ["platinum", "diamond", "vip"],
          countries: [
            "US",
            "CA",
            "UK",
            "AU",
            "DE",
            "FR",
            "ES",
            "IT",
            "NL",
            "SE",
            "NO",
            "DK",
          ],
          vipOnly: false,
          newUsersOnly: false,
        },
        analytics: {
          views: 8230,
          purchases: 234,
          conversionRate: 2.8,
          revenue: 23397.66,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
      },
      {
        id: "ultimate_pack",
        name: "Ultimate VIP Pack",
        description:
          "The most exclusive package for VIP members only with unprecedented rewards",
        goldCoins: 1000000,
        sweepsCoins: 500,
        price: 199.99,
        originalPrice: 299.99,
        currency: "USD",
        popular: false,
        featured: true,
        bestValue: true,
        limitedTime: true,
        bonus: {
          enabled: true,
          type: "multiplier",
          value: 2,
          description: "Triple Rewards + Personal Account Manager",
        },
        savings: 100.0,
        discount: 33,
        category: "ultimate",
        tier: 6,
        design: {
          backgroundColor: "#1F2937",
          backgroundGradient: {
            from: "#1F2937",
            to: "#111827",
            direction: "to-br",
          },
          textColor: "#F9FAFB",
          accentColor: "#FCD34D",
          borderColor: "#F59E0B",
          shadowColor: "#F59E0B",
          icon: "💎",
          pattern: "diamond",
          animation: "shake",
        },
        availability: {
          enabled: true,
          maxPurchases: 100,
          purchaseCount: 47,
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
        targeting: {
          userTiers: ["diamond", "vip"],
          countries: ["US", "CA", "UK", "AU"],
          vipOnly: true,
          newUsersOnly: false,
          minAge: 21,
        },
        analytics: {
          views: 1820,
          purchases: 47,
          conversionRate: 2.6,
          revenue: 9399.53,
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
        isActive: true,
      },
    ];
  }

  private getMockPurchaseHistory(): PurchaseHistory[] {
    return [
      {
        id: "purchase_001",
        userId: "user_123",
        packageId: "premium_pack",
        packageName: "Premium Pack",
        goldCoins: 75000,
        sweepsCoins: 25,
        price: 24.99,
        currency: "USD",
        paymentMethod: "credit_card",
        paymentStatus: "completed",
        transactionId: "txn_abc123",
        bonusApplied: {
          type: "multiplier",
          value: 1.5,
          description: "50% More Gold Coins",
        },
        purchaseDate: new Date("2024-01-15T10:30:00Z"),
        deliveryStatus: "delivered",
        ipAddress: "192.168.1.100",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        id: "purchase_002",
        userId: "user_456",
        packageId: "standard_pack",
        packageName: "Standard Pack",
        goldCoins: 25000,
        sweepsCoins: 5,
        price: 9.99,
        currency: "USD",
        paymentMethod: "paypal",
        paymentStatus: "completed",
        transactionId: "txn_def456",
        purchaseDate: new Date("2024-01-14T14:20:00Z"),
        deliveryStatus: "delivered",
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)",
      },
    ];
  }

  private getMockAnalytics(): StoreAnalytics {
    return {
      totalRevenue: 151782.97,
      totalPurchases: 5852,
      averageOrderValue: 25.93,
      conversionRate: 8.7,
      topPackages: [
        {
          packageId: "premium_pack",
          name: "Premium Pack",
          purchases: 1683,
          revenue: 42033.17,
        },
        {
          packageId: "standard_pack",
          name: "Standard Pack",
          purchases: 2841,
          revenue: 28385.59,
        },
        {
          packageId: "elite_pack",
          name: "Elite Pack",
          purchases: 847,
          revenue: 42341.53,
        },
      ],
      revenueByDay: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        revenue: Math.random() * 5000 + 1000,
        purchases: Math.floor(Math.random() * 50) + 10,
      })),
      userDemographics: {
        newUsers: 2341,
        returningUsers: 3511,
        vipUsers: 47,
      },
      paymentMethods: [
        { method: "Credit Card", count: 3456, percentage: 59.1 },
        { method: "PayPal", count: 1789, percentage: 30.6 },
        { method: "Apple Pay", count: 423, percentage: 7.2 },
        { method: "Google Pay", count: 184, percentage: 3.1 },
      ],
    };
  }

  private getDefaultSettings(): StoreSettings {
    return {
      storeName: "CoinKrazy Gold Store",
      storeDescription:
        "Premium gold coins and sweeps coins packages for the ultimate gaming experience",
      defaultCurrency: "USD",
      allowedPaymentMethods: [
        "credit_card",
        "paypal",
        "apple_pay",
        "google_pay",
      ],
      taxSettings: {
        enabled: true,
        rate: 8.5,
        includedInPrice: false,
      },
      discountSettings: {
        maxDiscountPercentage: 50,
        allowStackingDiscounts: false,
        minimumPurchaseForDiscount: 10,
      },
      purchaseLimits: {
        dailyLimit: 500,
        weeklyLimit: 2000,
        monthlyLimit: 5000,
      },
      notifications: {
        emailReceipts: true,
        purchaseAlerts: true,
        lowStockAlerts: true,
      },
      uiSettings: {
        theme: "casino",
        layout: "grid",
        showPrices: true,
        showSavings: true,
        showPopularBadges: true,
        animationsEnabled: true,
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
    };
  }
}

export const goldStoreService = GoldStoreService.getInstance();
