// CoinKrazy.com Production Configuration
export const coinKrazyConfig = {
  // Brand Information
  brand: {
    name: "CoinKrazy",
    domain: "coinkrazy.com",
    tagline: "America's Favorite Social Casino",
    description:
      "Play free social casino games, slots, bingo, and sweepstakes. Win Gold Coins and Sweeps Coins.",
    logo: "/images/coinkrazy-logo.png",
    favicon: "/favicon.ico",
  },

  // Gaming Configuration
  gaming: {
    currencies: {
      goldCoins: {
        code: "GC",
        name: "Gold Coins",
        symbol: "🪙",
        canPurchase: true,
        hasRealValue: false,
        description: "For entertainment only",
      },
      sweepsCoins: {
        code: "SC",
        name: "Sweeps Coins",
        symbol: "👑",
        canPurchase: false,
        hasRealValue: true,
        description: "Can be redeemed for prizes",
      },
    },

    games: {
      slots: {
        enabled: true,
        minBet: 1,
        maxBet: 1000,
        rtp: 96.5,
      },
      bingo: {
        enabled: true,
        minCardCost: 1,
        maxCardCost: 50,
        rtp: 95.5,
      },
      scratchCards: {
        enabled: true,
        minBet: 1,
        maxBet: 100,
        rtp: 97.2,
      },
    },
  },

  // Legal & Compliance
  legal: {
    jurisdiction: "United States",
    ageRequirement: 18,
    geoRestrictions: ["WA", "ID", "MT", "NV"],
    responsibleGaming: true,
    kycRequired: true,
    privacyPolicyUrl: "/privacy-policy",
    termsOfServiceUrl: "/terms-of-service",
  },

  // Contact Information
  contact: {
    supportPhone: "1-800-COIN-KRAZY",
    supportEmail: "support@coinkrazy.com",
    businessHours: "24/7",
    socialMedia: {
      facebook: "https://facebook.com/CoinKrazyOfficial",
      twitter: "https://twitter.com/CoinKrazy",
      instagram: "https://instagram.com/coinkrazy",
    },
  },

  // Features
  features: {
    liveChat: true,
    tournaments: true,
    progressiveJackpots: true,
    vipProgram: true,
    mobileApp: true,
    joseyAI: true,
    emailAutomation: true,
    socialLogin: true,
    multiLanguage: false,
  },

  // Production Settings
  production: {
    environment: "production",
    debug: false,
    analytics: {
      googleAnalytics: "G-COINKRAZY123",
      hotjar: true,
      sentry: true,
    },
    security: {
      ssl: true,
      csrfProtection: true,
      rateLimit: true,
      geoBlocking: true,
    },
    performance: {
      cdn: "https://cdn.coinkrazy.com",
      caching: true,
      compression: true,
      lazyLoading: true,
    },
  },
};

export default coinKrazyConfig;
