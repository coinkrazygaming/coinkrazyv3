export interface Lead {
  id: string;
  source: "organic" | "social_media" | "referral" | "paid_ads" | "content" | "email" | "chat";
  platform?: "facebook" | "instagram" | "twitter" | "youtube" | "linkedin" | "tiktok" | "snapchat";
  type: "comment" | "dm" | "mention" | "click" | "signup" | "referral" | "support_inquiry";
  status: "new" | "contacted" | "qualified" | "hot" | "warm" | "cold" | "converted" | "lost";
  priority: "low" | "medium" | "high" | "urgent";
  
  // User Information
  userData: {
    email?: string;
    username?: string;
    displayName?: string;
    followers?: number;
    verified?: boolean;
    location?: string;
    demographics?: {
      ageRange?: string;
      interests?: string[];
      deviceType?: string;
      timezone?: string;
    };
    socialProfiles?: {
      [platform: string]: {
        url: string;
        followers: number;
        engagement: number;
      };
    };
  };

  // Lead Details
  content: string;
  originalMessage?: string;
  sentiment: "positive" | "negative" | "neutral" | "excited" | "confused" | "frustrated";
  aiScore: number; // 0-100 scoring based on conversion likelihood
  aiAnalysis: {
    intent: "gaming" | "bonus_seeking" | "price_shopping" | "competitor_comparison" | "support" | "unknown";
    urgency: "immediate" | "short_term" | "long_term";
    valueIndicators: string[];
    redFlags: string[];
    recommendedApproach: string;
    nextBestAction: string;
  };

  // Interaction History
  interactions: LeadInteraction[];
  tags: string[];
  notes: string;

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  followUpDate?: Date;
  assignedTo?: string;
  conversionValue?: number;
  lifetimeValue?: number;

  // Social Media Specific
  socialMetrics?: {
    originalPostId?: string;
    parentCommentId?: string;
    engagementRate?: number;
    shareCount?: number;
    reachEstimate?: number;
  };
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  type: "ai_message" | "human_message" | "email" | "call" | "social_reply" | "system_note";
  direction: "inbound" | "outbound";
  channel: "email" | "social_media" | "chat" | "phone" | "sms";
  content: string;
  status: "sent" | "delivered" | "read" | "replied" | "failed";
  timestamp: Date;
  performedBy: "joseyai" | "staff" | "admin" | string;
  metadata?: {
    campaignId?: string;
    templateId?: string;
    attachments?: string[];
    socialMediaMetrics?: {
      likes?: number;
      replies?: number;
      shares?: number;
    };
  };
}

export interface ProactiveStrategy {
  id: string;
  name: string;
  type: "social_monitoring" | "content_generation" | "influencer_outreach" | "competitor_analysis" | "trend_analysis";
  isActive: boolean;
  settings: {
    keywords: string[];
    platforms: string[];
    targetAudience: {
      minFollowers?: number;
      maxFollowers?: number;
      locations?: string[];
      interests?: string[];
      demographics?: string[];
    };
    engagementRules: {
      autoReply?: boolean;
      replyTemplates?: { [key: string]: string };
      escalationThreshold?: number;
      maxDailyInteractions?: number;
    };
  };
  metrics: {
    leadsGenerated: number;
    conversions: number;
    engagementRate: number;
    roi: number;
  };
  lastRunAt?: Date;
  nextRunAt?: Date;
}

export interface AIInsight {
  id: string;
  type: "opportunity" | "warning" | "trend" | "performance" | "recommendation";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  data: any;
  actionable: boolean;
  suggestedActions: string[];
  confidence: number; // 0-100
  createdAt: Date;
  acknowledgedAt?: Date;
  implementedAt?: Date;
}

export interface SocialMediaMonitor {
  platform: string;
  queries: string[];
  lastChecked: Date;
  isActive: boolean;
  newMentions: number;
  dailyLimit: number;
  currentDailyCount: number;
}

class JoseyAIService {
  private static instance: JoseyAIService;
  private leads: Map<string, Lead> = new Map();
  private strategies: Map<string, ProactiveStrategy> = new Map();
  private insights: AIInsight[] = [];
  private socialMonitors: Map<string, SocialMediaMonitor> = new Map();
  private listeners: Set<(event: string, data: any) => void> = new Set();

  static getInstance(): JoseyAIService {
    if (!JoseyAIService.instance) {
      JoseyAIService.instance = new JoseyAIService();
    }
    return JoseyAIService.instance;
  }

  constructor() {
    this.initializeStrategies();
    this.initializeSocialMonitoring();
    this.startProactiveProcesses();
  }

  private initializeStrategies() {
    const defaultStrategies: ProactiveStrategy[] = [
      {
        id: "social_mentions",
        name: "Social Media Mention Monitoring",
        type: "social_monitoring",
        isActive: true,
        settings: {
          keywords: ["coinkrazy", "sweepstakes casino", "online casino", "social casino", "crypto casino", "bitcoin casino"],
          platforms: ["twitter", "facebook", "instagram", "reddit", "youtube"],
          targetAudience: {
            minFollowers: 100,
            locations: ["United States", "Canada"],
            interests: ["gambling", "casino", "slots", "bitcoin", "crypto"]
          },
          engagementRules: {
            autoReply: true,
            replyTemplates: {
              positive: "Thanks for mentioning CoinKrazy! 🎰 Have you tried our instant withdrawals yet? Unlike other platforms, we actually pay out immediately!",
              question: "Great question! CoinKrazy offers something unique - real instant withdrawals and better odds than our competitors. Want to see for yourself?",
              complaint: "I'm sorry to hear about your experience with other platforms. CoinKrazy was built specifically to solve those problems. We'd love to show you the difference!"
            },
            escalationThreshold: 80,
            maxDailyInteractions: 50
          }
        },
        metrics: {
          leadsGenerated: 0,
          conversions: 0,
          engagementRate: 0,
          roi: 0
        }
      },
      {
        id: "competitor_analysis",
        name: "Competitor Mention Analysis",
        type: "competitor_analysis",
        isActive: true,
        settings: {
          keywords: ["stake", "chumba", "luckyland", "pulsz", "sweepstakes casino complaints", "casino withdrawal problems"],
          platforms: ["twitter", "reddit", "facebook", "instagram"],
          targetAudience: {
            interests: ["online gambling", "sweepstakes", "casino games"]
          },
          engagementRules: {
            autoReply: false,
            escalationThreshold: 70,
            maxDailyInteractions: 20
          }
        },
        metrics: {
          leadsGenerated: 0,
          conversions: 0,
          engagementRate: 0,
          roi: 0
        }
      },
      {
        id: "influencer_outreach",
        name: "Micro-Influencer Outreach",
        type: "influencer_outreach",
        isActive: true,
        settings: {
          keywords: ["casino streamer", "slots content", "gambling content"],
          platforms: ["youtube", "twitch", "tiktok", "instagram"],
          targetAudience: {
            minFollowers: 1000,
            maxFollowers: 100000,
            interests: ["casino", "slots", "gambling", "streaming"]
          },
          engagementRules: {
            autoReply: false,
            escalationThreshold: 85,
            maxDailyInteractions: 10
          }
        },
        metrics: {
          leadsGenerated: 0,
          conversions: 0,
          engagementRate: 0,
          roi: 0
        }
      },
      {
        id: "content_opportunities",
        name: "Content Generation Opportunities",
        type: "content_generation",
        isActive: true,
        settings: {
          keywords: ["casino tips", "how to win slots", "best sweepstakes casino", "casino strategy"],
          platforms: ["youtube", "reddit", "quora", "medium"],
          targetAudience: {
            interests: ["casino strategy", "gambling tips", "online gaming"]
          },
          engagementRules: {
            autoReply: false,
            maxDailyInteractions: 15
          }
        },
        metrics: {
          leadsGenerated: 0,
          conversions: 0,
          engagementRate: 0,
          roi: 0
        }
      }
    ];

    defaultStrategies.forEach(strategy => {
      this.strategies.set(strategy.id, strategy);
    });
  }

  private initializeSocialMonitoring() {
    const monitors: SocialMediaMonitor[] = [
      {
        platform: "twitter",
        queries: ["coinkrazy", "#sweepstakescasino", "instant casino withdrawal", "casino complaints"],
        lastChecked: new Date(),
        isActive: true,
        newMentions: 0,
        dailyLimit: 100,
        currentDailyCount: 0
      },
      {
        platform: "reddit",
        queries: ["sweepstakes casino", "social casino", "coinkrazy", "casino withdrawal problems"],
        lastChecked: new Date(),
        isActive: true,
        newMentions: 0,
        dailyLimit: 50,
        currentDailyCount: 0
      },
      {
        platform: "facebook",
        queries: ["coinkrazy", "sweepstakes casino", "online casino"],
        lastChecked: new Date(),
        isActive: true,
        newMentions: 0,
        dailyLimit: 75,
        currentDailyCount: 0
      },
      {
        platform: "instagram",
        queries: ["#coinkrazy", "#casinowins", "#sweepstakescasino"],
        lastChecked: new Date(),
        isActive: true,
        newMentions: 0,
        dailyLimit: 60,
        currentDailyCount: 0
      }
    ];

    monitors.forEach(monitor => {
      this.socialMonitors.set(monitor.platform, monitor);
    });
  }

  private startProactiveProcesses() {
    // Social media monitoring - every 5 minutes
    setInterval(() => {
      this.runSocialMediaMonitoring();
    }, 5 * 60 * 1000);

    // Generate insights - every 15 minutes
    setInterval(() => {
      this.generateAIInsights();
    }, 15 * 60 * 1000);

    // Competitor analysis - every 30 minutes
    setInterval(() => {
      this.runCompetitorAnalysis();
    }, 30 * 60 * 1000);

    // Lead scoring updates - every hour
    setInterval(() => {
      this.updateLeadScoring();
    }, 60 * 60 * 1000);

    // Daily strategy optimization
    setInterval(() => {
      this.optimizeStrategies();
    }, 24 * 60 * 60 * 1000);

    // Reset daily counters at midnight
    this.scheduleDailyReset();
  }

  private async runSocialMediaMonitoring() {
    const activeMonitors = Array.from(this.socialMonitors.values()).filter(m => m.isActive);

    for (const monitor of activeMonitors) {
      if (monitor.currentDailyCount >= monitor.dailyLimit) continue;

      try {
        // Simulate social media API calls
        const newMentions = await this.fetchSocialMentions(monitor.platform, monitor.queries);
        
        for (const mention of newMentions) {
          if (monitor.currentDailyCount >= monitor.dailyLimit) break;

          const lead = await this.processSocialMention(mention, monitor.platform);
          if (lead) {
            this.addLead(lead);
            monitor.currentDailyCount++;
          }
        }

        monitor.lastChecked = new Date();
        monitor.newMentions = newMentions.length;
      } catch (error) {
        console.error(`Error monitoring ${monitor.platform}:`, error);
      }
    }
  }

  private async fetchSocialMentions(platform: string, queries: string[]): Promise<any[]> {
    // In a real implementation, this would call actual social media APIs
    // For now, we'll simulate finding mentions
    const mockMentions = [
      {
        id: `${platform}_${Date.now()}_1`,
        content: "Looking for a casino with instant withdrawals, tired of waiting weeks!",
        user: {
          username: "casino_fan_2024",
          followers: 1250,
          verified: false,
          location: "Las Vegas, NV"
        },
        engagement: { likes: 5, comments: 2, shares: 1 },
        timestamp: new Date(),
        sentiment: "frustrated"
      },
      {
        id: `${platform}_${Date.now()}_2`,
        content: "Has anyone tried CoinKrazy? Seeing ads everywhere but want real reviews",
        user: {
          username: "slots_lover",
          followers: 890,
          verified: false,
          location: "California, USA"
        },
        engagement: { likes: 8, comments: 4, shares: 0 },
        timestamp: new Date(),
        sentiment: "curious"
      },
      {
        id: `${platform}_${Date.now()}_3`,
        content: "Just hit a big win on slots! Love when casinos actually pay out fast 🎰💰",
        user: {
          username: "lucky_winner",
          followers: 2340,
          verified: true,
          location: "Florida, USA"
        },
        engagement: { likes: 45, comments: 12, shares: 8 },
        timestamp: new Date(),
        sentiment: "excited"
      }
    ];

    // Randomly return 0-3 mentions to simulate real-world variance
    const count = Math.floor(Math.random() * 4);
    return mockMentions.slice(0, count);
  }

  private async processSocialMention(mention: any, platform: string): Promise<Lead | null> {
    const aiScore = this.calculateLeadScore(mention);
    
    // Only process high-potential leads
    if (aiScore < 60) return null;

    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: "social_media",
      platform: platform as any,
      type: "mention",
      status: "new",
      priority: aiScore > 80 ? "high" : aiScore > 70 ? "medium" : "low",
      userData: {
        username: mention.user.username,
        displayName: mention.user.displayName || mention.user.username,
        followers: mention.user.followers,
        verified: mention.user.verified,
        location: mention.user.location,
        demographics: {
          deviceType: "mobile", // Would be detected in real implementation
          timezone: "EST" // Would be detected based on location
        }
      },
      content: mention.content,
      originalMessage: mention.content,
      sentiment: mention.sentiment,
      aiScore,
      aiAnalysis: this.analyzeLeadIntent(mention.content, mention),
      interactions: [],
      tags: this.generateLeadTags(mention.content, mention),
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      socialMetrics: {
        originalPostId: mention.id,
        engagementRate: this.calculateEngagementRate(mention.engagement, mention.user.followers),
        shareCount: mention.engagement.shares,
        reachEstimate: mention.user.followers * 0.1 // Estimated reach
      }
    };

    // Auto-engage if strategy allows it
    const strategy = this.strategies.get("social_mentions");
    if (strategy?.settings.engagementRules.autoReply && aiScore > 70) {
      await this.autoEngageLead(lead);
    }

    return lead;
  }

  private calculateLeadScore(mention: any): number {
    let score = 50; // Base score

    // Sentiment analysis
    if (mention.sentiment === "excited") score += 20;
    else if (mention.sentiment === "positive") score += 10;
    else if (mention.sentiment === "frustrated") score += 15; // Frustrated users might switch
    else if (mention.sentiment === "negative") score -= 10;

    // Follower count (social proof)
    if (mention.user.followers > 10000) score += 20;
    else if (mention.user.followers > 1000) score += 10;
    else if (mention.user.followers < 100) score -= 5;

    // Verified accounts have higher value
    if (mention.user.verified) score += 15;

    // Engagement rate
    const engagementRate = this.calculateEngagementRate(mention.engagement, mention.user.followers);
    if (engagementRate > 5) score += 15;
    else if (engagementRate > 2) score += 10;

    // Content analysis
    const keywords = mention.content.toLowerCase();
    if (keywords.includes("instant") || keywords.includes("fast")) score += 10;
    if (keywords.includes("withdrawal") || keywords.includes("payout")) score += 15;
    if (keywords.includes("complaint") || keywords.includes("problem")) score += 10;
    if (keywords.includes("recommend") || keywords.includes("review")) score += 8;
    if (keywords.includes("coinkrazy")) score += 25;

    // Location bonus (US/Canada)
    if (mention.user.location?.includes("USA") || mention.user.location?.includes("Canada")) {
      score += 10;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private calculateEngagementRate(engagement: any, followers: number): number {
    if (!followers || followers === 0) return 0;
    const totalEngagement = (engagement.likes || 0) + (engagement.comments || 0) + (engagement.shares || 0);
    return (totalEngagement / followers) * 100;
  }

  private analyzeLeadIntent(content: string, mention: any): Lead["aiAnalysis"] {
    const lowerContent = content.toLowerCase();
    let intent: Lead["aiAnalysis"]["intent"] = "unknown";
    let urgency: Lead["aiAnalysis"]["urgency"] = "long_term";
    const valueIndicators: string[] = [];
    const redFlags: string[] = [];

    // Intent analysis
    if (lowerContent.includes("withdraw") || lowerContent.includes("payout") || lowerContent.includes("cash out")) {
      intent = "gaming";
      valueIndicators.push("Interested in withdrawals");
    }
    if (lowerContent.includes("bonus") || lowerContent.includes("free") || lowerContent.includes("promo")) {
      intent = "bonus_seeking";
      valueIndicators.push("Bonus motivated");
    }
    if (lowerContent.includes("vs") || lowerContent.includes("compare") || lowerContent.includes("better than")) {
      intent = "competitor_comparison";
      valueIndicators.push("Comparing options");
    }
    if (lowerContent.includes("problem") || lowerContent.includes("help") || lowerContent.includes("support")) {
      intent = "support";
      redFlags.push("May have had bad experience");
    }

    // Urgency analysis
    if (lowerContent.includes("now") || lowerContent.includes("today") || lowerContent.includes("asap")) {
      urgency = "immediate";
    } else if (lowerContent.includes("soon") || lowerContent.includes("this week")) {
      urgency = "short_term";
    }

    // Value indicators
    if (mention.user.followers > 1000) valueIndicators.push("Social influencer potential");
    if (mention.user.verified) valueIndicators.push("Verified account");
    if (lowerContent.includes("big win") || lowerContent.includes("jackpot")) valueIndicators.push("Gaming enthusiast");

    // Red flags
    if (lowerContent.includes("scam") || lowerContent.includes("fake")) redFlags.push("Negative sentiment");
    if (mention.user.followers < 10) redFlags.push("Very low following");

    const recommendedApproach = this.getRecommendedApproach(intent, urgency, valueIndicators, redFlags);
    const nextBestAction = this.getNextBestAction(intent, urgency);

    return {
      intent,
      urgency,
      valueIndicators,
      redFlags,
      recommendedApproach,
      nextBestAction
    };
  }

  private getRecommendedApproach(intent: string, urgency: string, valueIndicators: string[], redFlags: string[]): string {
    if (redFlags.some(flag => flag.includes("Negative"))) {
      return "Address concerns first, then highlight CoinKrazy advantages";
    }
    
    if (intent === "bonus_seeking") {
      return "Lead with welcome bonus, emphasize value proposition";
    }
    
    if (intent === "competitor_comparison") {
      return "Highlight instant withdrawals and better odds vs competitors";
    }
    
    if (urgency === "immediate") {
      return "Direct approach with immediate call-to-action";
    }
    
    if (valueIndicators.some(vi => vi.includes("influencer"))) {
      return "Influencer partnership approach, offer exclusive access";
    }
    
    return "Educational approach focusing on unique value proposition";
  }

  private getNextBestAction(intent: string, urgency: string): string {
    if (urgency === "immediate") {
      return "Send direct message with signup link and bonus offer";
    }
    
    if (intent === "support") {
      return "Offer helpful support and then introduce CoinKrazy";
    }
    
    if (intent === "competitor_comparison") {
      return "Share comparison content highlighting CoinKrazy advantages";
    }
    
    return "Engage with helpful comment, then follow up with DM";
  }

  private generateLeadTags(content: string, mention: any): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();

    // Content-based tags
    if (lowerContent.includes("withdrawal") || lowerContent.includes("payout")) tags.push("withdrawal-focused");
    if (lowerContent.includes("bonus") || lowerContent.includes("free")) tags.push("bonus-seeker");
    if (lowerContent.includes("instant") || lowerContent.includes("fast")) tags.push("speed-conscious");
    if (lowerContent.includes("review") || lowerContent.includes("opinion")) tags.push("researcher");
    if (lowerContent.includes("win") || lowerContent.includes("jackpot")) tags.push("winner");

    // User-based tags
    if (mention.user.verified) tags.push("verified-account");
    if (mention.user.followers > 10000) tags.push("macro-influencer");
    else if (mention.user.followers > 1000) tags.push("micro-influencer");
    
    // Platform-specific tags
    tags.push(`${mention.platform || 'social'}-lead`);

    // Engagement-based tags
    const engagementRate = this.calculateEngagementRate(mention.engagement, mention.user.followers);
    if (engagementRate > 5) tags.push("high-engagement");
    else if (engagementRate > 2) tags.push("medium-engagement");

    return tags;
  }

  private async autoEngageLead(lead: Lead) {
    const strategy = this.strategies.get("social_mentions");
    if (!strategy?.settings.engagementRules.autoReply) return;

    let template = strategy.settings.engagementRules.replyTemplates?.positive || "";

    // Choose appropriate template based on sentiment and content
    if (lead.sentiment === "frustrated" || lead.content.toLowerCase().includes("problem")) {
      template = strategy.settings.engagementRules.replyTemplates?.complaint || template;
    } else if (lead.content.includes("?") || lead.aiAnalysis.intent === "competitor_comparison") {
      template = strategy.settings.engagementRules.replyTemplates?.question || template;
    }

    const interaction: LeadInteraction = {
      id: `interaction_${Date.now()}`,
      leadId: lead.id,
      type: "ai_message",
      direction: "outbound",
      channel: "social_media",
      content: template,
      status: "sent",
      timestamp: new Date(),
      performedBy: "joseyai",
      metadata: {
        templateId: "auto_reply"
      }
    };

    lead.interactions.push(interaction);
    lead.lastContactedAt = new Date();
    lead.status = "contacted";

    this.notifyListeners("lead_auto_engaged", { lead, interaction });
  }

  private async runCompetitorAnalysis() {
    // Simulate competitor monitoring
    const competitorInsights = [
      {
        competitor: "Chumba Casino",
        issue: "Withdrawal delays reported on Reddit",
        opportunity: "Highlight instant withdrawals",
        affectedUsers: 15,
        sentiment: "negative"
      },
      {
        competitor: "Stake Casino",
        issue: "Customer service complaints",
        opportunity: "Emphasize human support",
        affectedUsers: 8,
        sentiment: "frustrated"
      },
      {
        competitor: "LuckyLand Slots",
        issue: "Limited game selection mentioned",
        opportunity: "Showcase game variety",
        affectedUsers: 12,
        sentiment: "disappointed"
      }
    ];

    for (const insight of competitorInsights) {
      const aiInsight: AIInsight = {
        id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: "opportunity",
        priority: insight.affectedUsers > 10 ? "high" : "medium",
        title: `Competitor Opportunity: ${insight.competitor}`,
        description: `${insight.issue}. ${insight.affectedUsers} users affected. Opportunity: ${insight.opportunity}`,
        data: insight,
        actionable: true,
        suggestedActions: [
          `Create targeted content addressing ${insight.issue}`,
          `Reach out to affected users highlighting our advantage`,
          `Develop social media campaign emphasizing ${insight.opportunity.toLowerCase()}`
        ],
        confidence: 85,
        createdAt: new Date()
      };

      this.insights.push(aiInsight);
    }

    this.notifyListeners("competitor_analysis_complete", { insights: competitorInsights });
  }

  private updateLeadScoring() {
    this.leads.forEach(lead => {
      // Decay score over time for inactive leads
      const daysSinceCreated = (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const daysSinceLastContact = lead.lastContactedAt 
        ? (Date.now() - lead.lastContactedAt.getTime()) / (1000 * 60 * 60 * 24)
        : daysSinceCreated;

      let scoreAdjustment = 0;

      // Boost score for recent interactions
      if (daysSinceLastContact < 1) scoreAdjustment += 5;
      else if (daysSinceLastContact > 7) scoreAdjustment -= 10;
      else if (daysSinceLastContact > 14) scoreAdjustment -= 20;

      // Boost score for engaged leads
      if (lead.interactions.length > 0) {
        const recentInteractions = lead.interactions.filter(
          i => (Date.now() - i.timestamp.getTime()) < (7 * 24 * 60 * 60 * 1000)
        );
        scoreAdjustment += recentInteractions.length * 2;
      }

      // Apply adjustment
      lead.aiScore = Math.min(Math.max(lead.aiScore + scoreAdjustment, 0), 100);
      lead.updatedAt = new Date();

      // Update priority based on new score
      if (lead.aiScore > 80) lead.priority = "high";
      else if (lead.aiScore > 60) lead.priority = "medium";
      else lead.priority = "low";

      // Update status for cold leads
      if (lead.aiScore < 30 && lead.status !== "lost") {
        lead.status = "cold";
      }
    });
  }

  private generateAIInsights() {
    const currentHour = new Date().getHours();
    
    // Generate different insights based on time of day
    if (currentHour >= 9 && currentHour <= 17) {
      // Business hours - focus on business insights
      this.generateBusinessInsights();
    } else {
      // Evening/night - focus on social media and engagement insights
      this.generateSocialInsights();
    }
  }

  private generateBusinessInsights() {
    const totalLeads = this.leads.size;
    const todayLeads = Array.from(this.leads.values()).filter(
      lead => lead.createdAt.toDateString() === new Date().toDateString()
    ).length;

    const highValueLeads = Array.from(this.leads.values()).filter(
      lead => lead.aiScore > 80
    ).length;

    if (todayLeads > 20) {
      const insight: AIInsight = {
        id: `insight_${Date.now()}`,
        type: "opportunity",
        priority: "high",
        title: "High Lead Volume Day",
        description: `Exceptional lead generation today: ${todayLeads} new leads. ${highValueLeads} are high-value. Consider scaling outreach efforts.`,
        data: { todayLeads, highValueLeads, totalLeads },
        actionable: true,
        suggestedActions: [
          "Increase staff allocation for lead follow-up",
          "Launch targeted re-engagement campaign",
          "Analyze successful content for replication"
        ],
        confidence: 90,
        createdAt: new Date()
      };

      this.insights.push(insight);
    }

    // Clean up old insights (keep only last 50)
    if (this.insights.length > 50) {
      this.insights = this.insights.slice(-50);
    }
  }

  private generateSocialInsights() {
    const socialLeads = Array.from(this.leads.values()).filter(
      lead => lead.source === "social_media"
    );

    const platformDistribution = socialLeads.reduce((acc, lead) => {
      acc[lead.platform || "unknown"] = (acc[lead.platform || "unknown"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPlatform = Object.entries(platformDistribution)
      .sort(([,a], [,b]) => b - a)[0];

    if (topPlatform && topPlatform[1] > 5) {
      const insight: AIInsight = {
        id: `insight_${Date.now()}`,
        type: "trend",
        priority: "medium",
        title: `${topPlatform[0]} Leading Lead Generation`,
        description: `${topPlatform[0]} is generating ${topPlatform[1]} leads, outperforming other platforms. Consider increasing investment.`,
        data: { platformDistribution, topPlatform },
        actionable: true,
        suggestedActions: [
          `Increase content frequency on ${topPlatform[0]}`,
          `Analyze successful ${topPlatform[0]} content patterns`,
          `Allocate more budget to ${topPlatform[0]} advertising`
        ],
        confidence: 80,
        createdAt: new Date()
      };

      this.insights.push(insight);
    }
  }

  private optimizeStrategies() {
    this.strategies.forEach(strategy => {
      // Calculate ROI and adjust settings
      const strategyLeads = Array.from(this.leads.values()).filter(
        lead => this.isLeadFromStrategy(lead, strategy)
      );

      const conversions = strategyLeads.filter(lead => lead.status === "converted").length;
      const conversionRate = strategyLeads.length > 0 ? conversions / strategyLeads.length : 0;

      strategy.metrics.leadsGenerated = strategyLeads.length;
      strategy.metrics.conversions = conversions;
      strategy.metrics.engagementRate = conversionRate;

      // Auto-adjust engagement rules based on performance
      if (conversionRate > 0.1 && strategy.settings.engagementRules.maxDailyInteractions) {
        strategy.settings.engagementRules.maxDailyInteractions = Math.min(
          strategy.settings.engagementRules.maxDailyInteractions + 10,
          100
        );
      } else if (conversionRate < 0.05 && strategy.settings.engagementRules.maxDailyInteractions) {
        strategy.settings.engagementRules.maxDailyInteractions = Math.max(
          strategy.settings.engagementRules.maxDailyInteractions - 5,
          10
        );
      }
    });
  }

  private isLeadFromStrategy(lead: Lead, strategy: ProactiveStrategy): boolean {
    // Simple heuristic to match leads to strategies
    switch (strategy.type) {
      case "social_monitoring":
        return lead.source === "social_media" && lead.type === "mention";
      case "competitor_analysis":
        return lead.content.toLowerCase().includes("vs") || 
               lead.content.toLowerCase().includes("compare") ||
               lead.tags.includes("competitor-comparison");
      case "influencer_outreach":
        return lead.tags.includes("micro-influencer") || lead.tags.includes("macro-influencer");
      case "content_generation":
        return lead.source === "content" || lead.type === "click";
      default:
        return false;
    }
  }

  private scheduleDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyCounters();
      // Schedule for next day
      setInterval(() => {
        this.resetDailyCounters();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
  }

  private resetDailyCounters() {
    this.socialMonitors.forEach(monitor => {
      monitor.currentDailyCount = 0;
    });
  }

  // Public API Methods
  addLead(lead: Lead): void {
    this.leads.set(lead.id, lead);
    this.notifyListeners("lead_added", lead);
  }

  getLead(id: string): Lead | undefined {
    return this.leads.get(id);
  }

  getAllLeads(): Lead[] {
    return Array.from(this.leads.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getLeadsByStatus(status: Lead["status"]): Lead[] {
    return Array.from(this.leads.values()).filter(lead => lead.status === status);
  }

  getLeadsByPriority(priority: Lead["priority"]): Lead[] {
    return Array.from(this.leads.values()).filter(lead => lead.priority === priority);
  }

  updateLeadStatus(leadId: string, status: Lead["status"], notes?: string): boolean {
    const lead = this.leads.get(leadId);
    if (!lead) return false;

    lead.status = status;
    lead.updatedAt = new Date();
    
    if (notes) {
      lead.notes = notes;
    }

    // Add system note
    const interaction: LeadInteraction = {
      id: `interaction_${Date.now()}`,
      leadId,
      type: "system_note",
      direction: "outbound",
      channel: "chat",
      content: `Status updated to ${status}${notes ? `: ${notes}` : ''}`,
      status: "sent",
      timestamp: new Date(),
      performedBy: "joseyai"
    };

    lead.interactions.push(interaction);
    this.notifyListeners("lead_updated", lead);
    return true;
  }

  addLeadInteraction(leadId: string, interaction: Omit<LeadInteraction, "id" | "leadId" | "timestamp">): boolean {
    const lead = this.leads.get(leadId);
    if (!lead) return false;

    const fullInteraction: LeadInteraction = {
      ...interaction,
      id: `interaction_${Date.now()}`,
      leadId,
      timestamp: new Date()
    };

    lead.interactions.push(fullInteraction);
    lead.updatedAt = new Date();
    
    if (interaction.direction === "outbound") {
      lead.lastContactedAt = new Date();
    }

    this.notifyListeners("interaction_added", { lead, interaction: fullInteraction });
    return true;
  }

  getInsights(): AIInsight[] {
    return this.insights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  acknowledgeInsight(insightId: string): boolean {
    const insight = this.insights.find(i => i.id === insightId);
    if (!insight) return false;

    insight.acknowledgedAt = new Date();
    this.notifyListeners("insight_acknowledged", insight);
    return true;
  }

  getStrategies(): ProactiveStrategy[] {
    return Array.from(this.strategies.values());
  }

  updateStrategy(strategyId: string, updates: Partial<ProactiveStrategy>): boolean {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return false;

    Object.assign(strategy, updates);
    this.notifyListeners("strategy_updated", strategy);
    return true;
  }

  getAnalytics(): {
    totalLeads: number;
    newLeads: number;
    hotLeads: number;
    conversionRate: number;
    averageScore: number;
    topSources: Array<{ source: string; count: number }>;
    dailyTrend: Array<{ date: string; leads: number }>;
  } {
    const allLeads = Array.from(this.leads.values());
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const recentLeads = allLeads.filter(lead => lead.createdAt >= last7Days);
    const newLeads = allLeads.filter(lead => lead.status === "new").length;
    const hotLeads = allLeads.filter(lead => lead.priority === "high").length;
    const conversions = allLeads.filter(lead => lead.status === "converted").length;
    
    const conversionRate = allLeads.length > 0 ? conversions / allLeads.length : 0;
    const averageScore = allLeads.length > 0 
      ? allLeads.reduce((sum, lead) => sum + lead.aiScore, 0) / allLeads.length 
      : 0;

    const sourceCounts = allLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Generate daily trend for last 7 days
    const dailyTrend = Array.from({length: 7}, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayLeads = allLeads.filter(
        lead => lead.createdAt.toISOString().split('T')[0] === dateStr
      ).length;
      return { date: dateStr, leads: dayLeads };
    }).reverse();

    return {
      totalLeads: allLeads.length,
      newLeads,
      hotLeads,
      conversionRate,
      averageScore,
      topSources,
      dailyTrend
    };
  }

  // Event system
  subscribe(callback: (event: string, data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.forEach(callback => callback(event, data));
  }

  // AI-powered lead generation methods
  async generateContentOpportunities(): Promise<string[]> {
    // Analyze trending topics and generate content ideas
    return [
      "How CoinKrazy's Instant Withdrawals Beat the Competition",
      "The Real Truth About Sweepstakes Casino Odds",
      "Why Most Online Casinos Make You Wait (And We Don't)",
      "Social Casino vs Traditional Casino: What's Better?",
      "The Ultimate Guide to Maximizing Your Sweepstakes Wins"
    ];
  }

  async identifyInfluencerOpportunities(): Promise<Array<{username: string; platform: string; followers: number; engagement: number; fit: number}>> {
    // Mock influencer identification - in real implementation would use social media APIs
    return [
      {
        username: "slot_master_88",
        platform: "instagram",
        followers: 15600,
        engagement: 4.2,
        fit: 92
      },
      {
        username: "casino_critic",
        platform: "youtube",
        followers: 45000,
        engagement: 3.8,
        fit: 88
      },
      {
        username: "lucky_gaming",
        platform: "tiktok",
        followers: 8900,
        engagement: 6.1,
        fit: 85
      }
    ];
  }

  async predictLeadConversion(leadId: string): Promise<{probability: number; factors: string[]; recommendations: string[]}> {
    const lead = this.leads.get(leadId);
    if (!lead) throw new Error("Lead not found");

    let probability = lead.aiScore / 100;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Adjust probability based on various factors
    if (lead.interactions.length > 0) {
      probability += 0.1;
      factors.push("Has prior interactions");
    }

    if (lead.sentiment === "excited" || lead.sentiment === "positive") {
      probability += 0.15;
      factors.push("Positive sentiment");
    }

    if (lead.userData.followers && lead.userData.followers > 1000) {
      probability += 0.1;
      factors.push("Social influence potential");
    }

    if (lead.priority === "high") {
      probability += 0.2;
      factors.push("High priority lead");
    }

    // Generate recommendations
    if (probability < 0.3) {
      recommendations.push("Consider nurture campaign before direct outreach");
      recommendations.push("Provide educational content first");
    } else if (probability < 0.7) {
      recommendations.push("Engage with personalized approach");
      recommendations.push("Offer limited-time incentive");
    } else {
      recommendations.push("High conversion probability - prioritize for immediate contact");
      recommendations.push("Use direct call-to-action");
    }

    return {
      probability: Math.min(probability, 0.95),
      factors,
      recommendations
    };
  }
}

export const joseyAIService = JoseyAIService.getInstance();
