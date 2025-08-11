import { joseyAIService } from "./joseyAIService";
import { emailService } from "./emailService";
import { balanceService } from "./balanceService";

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  subject: string;
  description: string;
  category:
    | "account"
    | "payment"
    | "technical"
    | "kyc"
    | "general"
    | "complaint"
    | "bonus";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  assignedTo?: string;
  tags: string[];

  // Communication
  messages: TicketMessage[];
  attachments: string[];

  // Tracking
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;

  // Internal
  internalNotes: string[];
  escalated: boolean;
  customerRating?: number;
  resolutionTime?: number; // in minutes

  // AI Analysis
  aiAnalysis?: {
    sentiment: "positive" | "negative" | "neutral" | "frustrated" | "urgent";
    category: string;
    suggestedResponses: string[];
    similarTickets: string[];
    estimatedResolutionTime: number;
    requiresEscalation: boolean;
  };
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: "user" | "staff" | "system";
  content: string;
  isInternal: boolean;
  attachments: string[];
  timestamp: Date;
  readBy: string[];
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  status: "active" | "suspended" | "banned" | "pending_verification";
  role: "user" | "staff" | "admin";

  // KYC Information
  kycStatus: "not_started" | "pending" | "approved" | "rejected" | "expired";
  kycDocuments: {
    photoId?: { url: string; verified: boolean; uploadedAt: Date };
    addressProof?: { url: string; verified: boolean; uploadedAt: Date };
    additionalDocs?: Array<{
      type: string;
      url: string;
      verified: boolean;
      uploadedAt: Date;
    }>;
  };

  // Account Details
  registrationDate: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;

  // Balances
  balances: {
    goldCoins: number;
    sweepsCoins: number;
    usd: number;
  };

  // Activity
  totalDeposits: number;
  totalWithdrawals: number;
  totalWins: number;
  totalLosses: number;
  gamesPlayed: number;

  // Risk & Compliance
  riskScore: number; // 0-100
  riskFactors: string[];
  restrictions: string[];
  notes: string[];

  // Location & Device
  location?: {
    country: string;
    state?: string;
    city?: string;
    ipAddress: string;
  };
  devices: Array<{
    type: "desktop" | "mobile" | "tablet";
    browser: string;
    os: string;
    lastUsed: Date;
  }>;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  period: {
    start: Date;
    end: Date;
  };

  // Ticket Metrics
  ticketsHandled: number;
  ticketsResolved: number;
  avgResolutionTime: number; // minutes
  avgFirstResponseTime: number; // minutes
  customerSatisfactionRating: number;

  // Activity Metrics
  hoursWorked: number;
  activeHours: number;
  responseTimes: number[];
  resolutionTimes: number[];

  // Quality Metrics
  escalationRate: number;
  reopenRate: number;
  positiveRatings: number;
  negativeRatings: number;

  // Goals & Targets
  targets: {
    ticketsPerDay: number;
    avgResponseTime: number;
    customerSatisfaction: number;
  };

  achievements: Array<{
    type: string;
    description: string;
    achievedAt: Date;
  }>;
}

export interface StaffAlert {
  id: string;
  type:
    | "urgent_ticket"
    | "escalation"
    | "system_issue"
    | "performance_alert"
    | "compliance_issue";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  actionRequired: boolean;
  assignedTo?: string;
  relatedTicketId?: string;
  relatedUserId?: string;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  metadata?: any;
}

class StaffService {
  private static instance: StaffService;
  private tickets: Map<string, SupportTicket> = new Map();
  private users: Map<string, UserAccount> = new Map();
  private staff: Map<string, StaffPerformance> = new Map();
  private alerts: StaffAlert[] = [];
  private listeners: Set<(event: string, data: any) => void> = new Set();

  static getInstance(): StaffService {
    if (!StaffService.instance) {
      StaffService.instance = new StaffService();
    }
    return StaffService.instance;
  }

  constructor() {
    this.initializeMockData();
    this.startMonitoring();
  }

  private initializeMockData() {
    // Mock support tickets
    const mockTickets: SupportTicket[] = [
      {
        id: "ticket_001",
        userId: "user_123",
        userEmail: "player@example.com",
        username: "casino_player_123",
        subject: "Withdrawal Delayed - Need Urgent Help",
        description:
          "I requested a withdrawal 3 days ago but haven't received it yet. This is my first withdrawal and I'm concerned.",
        category: "payment",
        priority: "high",
        status: "open",
        assignedTo: "staff_001",
        tags: ["withdrawal", "first-time", "urgent"],
        messages: [
          {
            id: "msg_001",
            ticketId: "ticket_001",
            senderId: "user_123",
            senderType: "user",
            content:
              "I requested a withdrawal 3 days ago but haven't received it yet. This is my first withdrawal and I'm concerned.",
            isInternal: false,
            attachments: [],
            timestamp: new Date("2024-03-20T10:30:00"),
            readBy: ["staff_001"],
          },
        ],
        attachments: [],
        createdAt: new Date("2024-03-20T10:30:00"),
        updatedAt: new Date("2024-03-20T10:30:00"),
        internalNotes: ["User verified KYC status - all documents approved"],
        escalated: false,
        aiAnalysis: {
          sentiment: "frustrated",
          category: "payment_issue",
          suggestedResponses: [
            "Apologize for the delay and explain our withdrawal process",
            "Check withdrawal status and provide specific timeline",
            "Offer expedited processing if possible",
          ],
          similarTickets: ["ticket_045", "ticket_089"],
          estimatedResolutionTime: 120,
          requiresEscalation: false,
        },
      },
      {
        id: "ticket_002",
        userId: "user_456",
        userEmail: "gamer@example.com",
        username: "slot_master_456",
        subject: "Game Not Loading - CoinKrazy Spinner",
        description:
          "The CoinKrazy Spinner game won't load on my mobile device. It worked fine yesterday.",
        category: "technical",
        priority: "medium",
        status: "in_progress",
        assignedTo: "staff_002",
        tags: ["mobile", "game-loading", "spinner"],
        messages: [
          {
            id: "msg_002",
            ticketId: "ticket_002",
            senderId: "user_456",
            senderType: "user",
            content:
              "The CoinKrazy Spinner game won't load on my mobile device. It worked fine yesterday.",
            isInternal: false,
            attachments: [],
            timestamp: new Date("2024-03-20T14:15:00"),
            readBy: ["staff_002"],
          },
          {
            id: "msg_003",
            ticketId: "ticket_002",
            senderId: "staff_002",
            senderType: "staff",
            content:
              "Hi! I'm sorry to hear you're having trouble with the game. Can you please try clearing your browser cache and cookies, then try again?",
            isInternal: false,
            attachments: [],
            timestamp: new Date("2024-03-20T14:30:00"),
            readBy: ["user_456"],
          },
        ],
        attachments: [],
        createdAt: new Date("2024-03-20T14:15:00"),
        updatedAt: new Date("2024-03-20T14:30:00"),
        firstResponseAt: new Date("2024-03-20T14:30:00"),
        internalNotes: [
          "Common mobile loading issue - standard troubleshooting applied",
        ],
        escalated: false,
        aiAnalysis: {
          sentiment: "neutral",
          category: "technical_support",
          suggestedResponses: [
            "Provide mobile troubleshooting steps",
            "Check for browser compatibility issues",
            "Escalate to technical team if basic steps don't work",
          ],
          similarTickets: ["ticket_078", "ticket_134"],
          estimatedResolutionTime: 60,
          requiresEscalation: false,
        },
      },
      {
        id: "ticket_003",
        userId: "user_789",
        userEmail: "vip@example.com",
        username: "high_roller_789",
        subject: "VIP Status Benefits Question",
        description:
          "I reached VIP level but don't see the promised benefits. Can you explain what I should expect?",
        category: "account",
        priority: "medium",
        status: "waiting_user",
        assignedTo: "staff_001",
        tags: ["vip", "benefits", "account-status"],
        messages: [
          {
            id: "msg_004",
            ticketId: "ticket_003",
            senderId: "user_789",
            senderType: "user",
            content:
              "I reached VIP level but don't see the promised benefits. Can you explain what I should expect?",
            isInternal: false,
            attachments: [],
            timestamp: new Date("2024-03-20T16:45:00"),
            readBy: ["staff_001"],
          },
          {
            id: "msg_005",
            ticketId: "ticket_003",
            senderId: "staff_001",
            senderType: "staff",
            content:
              "Congratulations on reaching VIP status! Your benefits include: faster withdrawals, dedicated support, exclusive bonuses, and higher limits. These should be active now - can you check your account?",
            isInternal: false,
            attachments: [],
            timestamp: new Date("2024-03-20T17:00:00"),
            readBy: [],
          },
        ],
        attachments: [],
        createdAt: new Date("2024-03-20T16:45:00"),
        updatedAt: new Date("2024-03-20T17:00:00"),
        firstResponseAt: new Date("2024-03-20T17:00:00"),
        internalNotes: [
          "VIP user - handle with priority, ensure all benefits are properly applied",
        ],
        escalated: false,
        aiAnalysis: {
          sentiment: "positive",
          category: "vip_support",
          suggestedResponses: [
            "Explain VIP benefits in detail",
            "Verify VIP status is properly applied",
            "Offer additional perks to maintain satisfaction",
          ],
          similarTickets: ["ticket_012", "ticket_067"],
          estimatedResolutionTime: 30,
          requiresEscalation: false,
        },
      },
    ];

    // Mock user accounts
    const mockUsers: UserAccount[] = [
      {
        id: "user_123",
        email: "player@example.com",
        username: "casino_player_123",
        status: "active",
        role: "user",
        kycStatus: "approved",
        kycDocuments: {
          photoId: {
            url: "/docs/id_123.jpg",
            verified: true,
            uploadedAt: new Date("2024-03-15T10:00:00"),
          },
          addressProof: {
            url: "/docs/address_123.pdf",
            verified: true,
            uploadedAt: new Date("2024-03-15T10:30:00"),
          },
        },
        registrationDate: new Date("2024-03-10T09:00:00"),
        lastLoginAt: new Date("2024-03-20T08:30:00"),
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: false,
        balances: {
          goldCoins: 125000,
          sweepsCoins: 45.5,
          usd: 0,
        },
        totalDeposits: 250.0,
        totalWithdrawals: 0,
        totalWins: 1250.5,
        totalLosses: 875.25,
        gamesPlayed: 347,
        riskScore: 15,
        riskFactors: [],
        restrictions: [],
        notes: ["VIP candidate - high engagement"],
        location: {
          country: "United States",
          state: "Nevada",
          city: "Las Vegas",
          ipAddress: "192.168.1.100",
        },
        devices: [
          {
            type: "desktop",
            browser: "Chrome 121",
            os: "Windows 11",
            lastUsed: new Date("2024-03-20T08:30:00"),
          },
          {
            type: "mobile",
            browser: "Safari Mobile",
            os: "iOS 17",
            lastUsed: new Date("2024-03-19T22:15:00"),
          },
        ],
      },
      {
        id: "user_456",
        email: "gamer@example.com",
        username: "slot_master_456",
        status: "active",
        role: "user",
        kycStatus: "pending",
        kycDocuments: {
          photoId: {
            url: "/docs/id_456.jpg",
            verified: false,
            uploadedAt: new Date("2024-03-18T14:00:00"),
          },
        },
        registrationDate: new Date("2024-03-15T16:30:00"),
        lastLoginAt: new Date("2024-03-20T14:00:00"),
        emailVerified: true,
        phoneVerified: false,
        twoFactorEnabled: false,
        balances: {
          goldCoins: 75000,
          sweepsCoins: 12.25,
          usd: 0,
        },
        totalDeposits: 50.0,
        totalWithdrawals: 0,
        totalWins: 245.75,
        totalLosses: 180.5,
        gamesPlayed: 89,
        riskScore: 25,
        riskFactors: ["incomplete_verification"],
        restrictions: ["withdrawal_disabled"],
        notes: ["Needs to complete KYC verification"],
        location: {
          country: "Canada",
          state: "Ontario",
          city: "Toronto",
          ipAddress: "192.168.2.100",
        },
        devices: [
          {
            type: "mobile",
            browser: "Chrome Mobile",
            os: "Android 13",
            lastUsed: new Date("2024-03-20T14:00:00"),
          },
        ],
      },
    ];

    // Mock staff performance
    const mockStaff: StaffPerformance[] = [
      {
        staffId: "staff_001",
        staffName: "Sarah Johnson",
        period: {
          start: new Date("2024-03-01"),
          end: new Date("2024-03-31"),
        },
        ticketsHandled: 156,
        ticketsResolved: 148,
        avgResolutionTime: 120,
        avgFirstResponseTime: 25,
        customerSatisfactionRating: 4.8,
        hoursWorked: 160,
        activeHours: 152,
        responseTimes: [15, 30, 20, 45, 18, 25, 35],
        resolutionTimes: [60, 120, 90, 180, 45, 240, 75],
        escalationRate: 0.05,
        reopenRate: 0.02,
        positiveRatings: 142,
        negativeRatings: 6,
        targets: {
          ticketsPerDay: 8,
          avgResponseTime: 30,
          customerSatisfaction: 4.5,
        },
        achievements: [
          {
            type: "customer_satisfaction",
            description: "Achieved 4.8+ customer satisfaction rating",
            achievedAt: new Date("2024-03-15"),
          },
          {
            type: "efficiency",
            description: "Fastest average response time this month",
            achievedAt: new Date("2024-03-10"),
          },
        ],
      },
      {
        staffId: "staff_002",
        staffName: "Michael Chen",
        period: {
          start: new Date("2024-03-01"),
          end: new Date("2024-03-31"),
        },
        ticketsHandled: 134,
        ticketsResolved: 125,
        avgResolutionTime: 145,
        avgFirstResponseTime: 35,
        customerSatisfactionRating: 4.6,
        hoursWorked: 160,
        activeHours: 145,
        responseTimes: [25, 40, 30, 50, 28, 35, 45],
        resolutionTimes: [90, 150, 120, 200, 80, 180, 135],
        escalationRate: 0.08,
        reopenRate: 0.03,
        positiveRatings: 118,
        negativeRatings: 7,
        targets: {
          ticketsPerDay: 7,
          avgResponseTime: 30,
          customerSatisfaction: 4.5,
        },
        achievements: [
          {
            type: "resolution_rate",
            description: "Maintained 93%+ resolution rate",
            achievedAt: new Date("2024-03-20"),
          },
        ],
      },
    ];

    // Mock alerts
    const mockAlerts: StaffAlert[] = [
      {
        id: "alert_001",
        type: "urgent_ticket",
        priority: "high",
        title: "High Priority Ticket Unassigned",
        description: "Ticket #001 has been open for 2 hours without assignment",
        actionRequired: true,
        relatedTicketId: "ticket_001",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: { ticketPriority: "high", category: "payment" },
      },
      {
        id: "alert_002",
        type: "escalation",
        priority: "medium",
        title: "Ticket Escalation Required",
        description: "Ticket #002 requires technical escalation",
        actionRequired: true,
        assignedTo: "staff_002",
        relatedTicketId: "ticket_002",
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        metadata: {
          escalationType: "technical",
          originalAssignee: "staff_002",
        },
      },
      {
        id: "alert_003",
        type: "performance_alert",
        priority: "low",
        title: "Response Time Target Exceeded",
        description: "Average response time for last hour exceeded 45 minutes",
        actionRequired: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        metadata: { avgResponseTime: 48, target: 30 },
      },
    ];

    // Initialize data
    mockTickets.forEach((ticket) => this.tickets.set(ticket.id, ticket));
    mockUsers.forEach((user) => this.users.set(user.id, user));
    mockStaff.forEach((staff) => this.staff.set(staff.staffId, staff));
    this.alerts = mockAlerts;
  }

  private startMonitoring() {
    // Monitor ticket response times
    setInterval(
      () => {
        this.checkResponseTimes();
      },
      5 * 60 * 1000,
    ); // Every 5 minutes

    // Generate performance alerts
    setInterval(
      () => {
        this.generatePerformanceAlerts();
      },
      15 * 60 * 1000,
    ); // Every 15 minutes

    // Update AI analysis for tickets
    setInterval(
      () => {
        this.updateTicketAnalysis();
      },
      30 * 60 * 1000,
    ); // Every 30 minutes

    // Clean up old alerts
    setInterval(
      () => {
        this.cleanupOldAlerts();
      },
      60 * 60 * 1000,
    ); // Every hour
  }

  private checkResponseTimes() {
    const now = new Date();
    const urgentThreshold = 30 * 60 * 1000; // 30 minutes
    const highThreshold = 60 * 60 * 1000; // 1 hour
    const mediumThreshold = 4 * 60 * 60 * 1000; // 4 hours

    this.tickets.forEach((ticket) => {
      if (ticket.status === "open" && !ticket.firstResponseAt) {
        const timeSinceCreated = now.getTime() - ticket.createdAt.getTime();
        let shouldAlert = false;
        let alertPriority: "low" | "medium" | "high" | "critical" = "low";

        if (
          ticket.priority === "urgent" &&
          timeSinceCreated > urgentThreshold
        ) {
          shouldAlert = true;
          alertPriority = "critical";
        } else if (
          ticket.priority === "high" &&
          timeSinceCreated > highThreshold
        ) {
          shouldAlert = true;
          alertPriority = "high";
        } else if (
          ticket.priority === "medium" &&
          timeSinceCreated > mediumThreshold
        ) {
          shouldAlert = true;
          alertPriority = "medium";
        }

        if (shouldAlert) {
          const alert: StaffAlert = {
            id: `alert_${Date.now()}_${ticket.id}`,
            type: "urgent_ticket",
            priority: alertPriority,
            title: `${ticket.priority.toUpperCase()} Priority Ticket Needs Response`,
            description: `Ticket #${ticket.id.slice(-6)} (${ticket.subject}) has been waiting for ${Math.round(timeSinceCreated / (60 * 1000))} minutes`,
            actionRequired: true,
            relatedTicketId: ticket.id,
            assignedTo: ticket.assignedTo,
            createdAt: now,
            metadata: {
              ticketPriority: ticket.priority,
              waitTime: timeSinceCreated,
              category: ticket.category,
            },
          };

          this.alerts.push(alert);
          this.notifyListeners("alert_created", alert);
        }
      }
    });
  }

  private generatePerformanceAlerts() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Check average response times
    const recentTickets = Array.from(this.tickets.values()).filter(
      (ticket) => ticket.createdAt >= oneHourAgo && ticket.firstResponseAt,
    );

    if (recentTickets.length > 0) {
      const avgResponseTime =
        recentTickets.reduce((sum, ticket) => {
          const responseTime =
            ticket.firstResponseAt!.getTime() - ticket.createdAt.getTime();
          return sum + responseTime;
        }, 0) / recentTickets.length;

      const avgResponseMinutes = avgResponseTime / (60 * 1000);
      const target = 30; // 30 minutes target

      if (avgResponseMinutes > target) {
        const alert: StaffAlert = {
          id: `perf_alert_${Date.now()}`,
          type: "performance_alert",
          priority: avgResponseMinutes > target * 2 ? "high" : "medium",
          title: "Response Time Target Exceeded",
          description: `Average response time for the last hour: ${avgResponseMinutes.toFixed(1)} minutes (target: ${target} minutes)`,
          actionRequired: true,
          createdAt: now,
          metadata: {
            avgResponseTime: avgResponseMinutes,
            target,
            ticketsAnalyzed: recentTickets.length,
          },
        };

        this.alerts.push(alert);
        this.notifyListeners("performance_alert", alert);
      }
    }
  }

  private updateTicketAnalysis() {
    // Simulate AI analysis updates
    this.tickets.forEach((ticket) => {
      if (!ticket.aiAnalysis) return;

      // Update sentiment based on message content
      const latestMessages = ticket.messages.slice(-3);
      const hasNegativeKeywords = latestMessages.some(
        (msg) =>
          msg.content.toLowerCase().includes("frustrated") ||
          msg.content.toLowerCase().includes("angry") ||
          msg.content.toLowerCase().includes("terrible"),
      );

      if (hasNegativeKeywords && ticket.aiAnalysis.sentiment !== "frustrated") {
        ticket.aiAnalysis.sentiment = "frustrated";
        ticket.updatedAt = new Date();
      }

      // Check if escalation is needed
      const messageCount = ticket.messages.length;
      const timeSinceCreated = Date.now() - ticket.createdAt.getTime();
      const hoursOpen = timeSinceCreated / (1000 * 60 * 60);

      if (
        (messageCount > 5 || hoursOpen > 24) &&
        !ticket.escalated &&
        ticket.priority !== "low"
      ) {
        ticket.aiAnalysis.requiresEscalation = true;

        const alert: StaffAlert = {
          id: `esc_alert_${Date.now()}_${ticket.id}`,
          type: "escalation",
          priority: "medium",
          title: "Ticket Requires Escalation",
          description: `Ticket #${ticket.id.slice(-6)} has ${messageCount} messages and has been open for ${hoursOpen.toFixed(1)} hours`,
          actionRequired: true,
          relatedTicketId: ticket.id,
          assignedTo: ticket.assignedTo,
          createdAt: new Date(),
          metadata: {
            messageCount,
            hoursOpen,
            reason: messageCount > 5 ? "high_message_count" : "long_duration",
          },
        };

        this.alerts.push(alert);
        this.notifyListeners("escalation_required", { ticket, alert });
      }
    });
  }

  private cleanupOldAlerts() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const initialCount = this.alerts.length;

    this.alerts = this.alerts.filter(
      (alert) => alert.createdAt > oneDayAgo || !alert.resolvedAt,
    );

    if (this.alerts.length < initialCount) {
      this.notifyListeners("alerts_cleaned", {
        removed: initialCount - this.alerts.length,
      });
    }
  }

  // Public API Methods

  // Ticket Management
  getAllTickets(): SupportTicket[] {
    return Array.from(this.tickets.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  getTicketsByStatus(status: SupportTicket["status"]): SupportTicket[] {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.status === status,
    );
  }

  getTicketsByPriority(priority: SupportTicket["priority"]): SupportTicket[] {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.priority === priority,
    );
  }

  getTicketsByAssignee(staffId: string): SupportTicket[] {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.assignedTo === staffId,
    );
  }

  getTicket(ticketId: string): SupportTicket | undefined {
    return this.tickets.get(ticketId);
  }

  updateTicketStatus(
    ticketId: string,
    status: SupportTicket["status"],
    staffId: string,
  ): boolean {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    ticket.status = status;
    ticket.updatedAt = new Date();

    if (status === "resolved") {
      ticket.resolvedAt = new Date();
      ticket.resolutionTime = Math.round(
        (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) /
          (60 * 1000),
      );
    }

    // Add system message
    const systemMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      senderId: staffId,
      senderType: "system",
      content: `Ticket status updated to: ${status}`,
      isInternal: true,
      attachments: [],
      timestamp: new Date(),
      readBy: [staffId],
    };

    ticket.messages.push(systemMessage);
    this.notifyListeners("ticket_updated", { ticket, staffId });
    return true;
  }

  assignTicket(ticketId: string, staffId: string, assignedBy: string): boolean {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    ticket.assignedTo = staffId;
    ticket.updatedAt = new Date();

    // Add system message
    const systemMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      senderId: assignedBy,
      senderType: "system",
      content: `Ticket assigned to staff member: ${staffId}`,
      isInternal: true,
      attachments: [],
      timestamp: new Date(),
      readBy: [assignedBy, staffId],
    };

    ticket.messages.push(systemMessage);
    this.notifyListeners("ticket_assigned", { ticket, staffId, assignedBy });
    return true;
  }

  addTicketMessage(
    ticketId: string,
    senderId: string,
    content: string,
    isInternal: boolean = false,
    attachments: string[] = [],
  ): boolean {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    const message: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      senderId,
      senderType: "staff",
      content,
      isInternal,
      attachments,
      timestamp: new Date(),
      readBy: [senderId],
    };

    ticket.messages.push(message);
    ticket.updatedAt = new Date();

    if (!ticket.firstResponseAt && !isInternal) {
      ticket.firstResponseAt = new Date();
    }

    this.notifyListeners("message_added", { ticket, message });
    return true;
  }

  escalateTicket(ticketId: string, reason: string, staffId: string): boolean {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    ticket.escalated = true;
    ticket.priority =
      ticket.priority === "low"
        ? "medium"
        : ticket.priority === "medium"
          ? "high"
          : "urgent";
    ticket.updatedAt = new Date();

    // Add internal note
    ticket.internalNotes.push(`Escalated by ${staffId}: ${reason}`);

    // Add system message
    const systemMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      ticketId,
      senderId: staffId,
      senderType: "system",
      content: `Ticket escalated. Priority updated to: ${ticket.priority}. Reason: ${reason}`,
      isInternal: true,
      attachments: [],
      timestamp: new Date(),
      readBy: [staffId],
    };

    ticket.messages.push(systemMessage);

    // Create escalation alert
    const alert: StaffAlert = {
      id: `esc_${Date.now()}`,
      type: "escalation",
      priority: "high",
      title: "Ticket Escalated",
      description: `Ticket #${ticketId.slice(-6)} escalated: ${reason}`,
      actionRequired: true,
      relatedTicketId: ticketId,
      createdAt: new Date(),
      metadata: { reason, escalatedBy: staffId },
    };

    this.alerts.push(alert);
    this.notifyListeners("ticket_escalated", {
      ticket,
      reason,
      staffId,
      alert,
    });
    return true;
  }

  // User Management
  getAllUsers(): UserAccount[] {
    return Array.from(this.users.values()).sort(
      (a, b) => b.registrationDate.getTime() - a.registrationDate.getTime(),
    );
  }

  getUser(userId: string): UserAccount | undefined {
    return this.users.get(userId);
  }

  getUsersByKycStatus(status: UserAccount["kycStatus"]): UserAccount[] {
    return Array.from(this.users.values()).filter(
      (user) => user.kycStatus === status,
    );
  }

  updateUserStatus(
    userId: string,
    status: UserAccount["status"],
    reason: string,
    staffId: string,
  ): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const previousStatus = user.status;
    user.status = status;
    user.notes.push(
      `Status changed from ${previousStatus} to ${status} by ${staffId}: ${reason}`,
    );

    this.notifyListeners("user_status_updated", {
      user,
      previousStatus,
      reason,
      staffId,
    });
    return true;
  }

  updateKycStatus(
    userId: string,
    status: UserAccount["kycStatus"],
    notes: string,
    staffId: string,
  ): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const previousStatus = user.kycStatus;
    user.kycStatus = status;
    user.notes.push(
      `KYC status changed from ${previousStatus} to ${status} by ${staffId}: ${notes}`,
    );

    // If approved, remove withdrawal restrictions
    if (
      status === "approved" &&
      user.restrictions.includes("withdrawal_disabled")
    ) {
      user.restrictions = user.restrictions.filter(
        (r) => r !== "withdrawal_disabled",
      );
    }

    // Send notification email
    emailService.sendKycStatusUpdate(user.email, status, notes);

    this.notifyListeners("kyc_status_updated", {
      user,
      previousStatus,
      notes,
      staffId,
    });
    return true;
  }

  addUserNote(userId: string, note: string, staffId: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    user.notes.push(`${new Date().toISOString()} - ${staffId}: ${note}`);
    this.notifyListeners("user_note_added", { user, note, staffId });
    return true;
  }

  // Staff Performance
  getStaffPerformance(staffId: string): StaffPerformance | undefined {
    return this.staff.get(staffId);
  }

  getAllStaffPerformance(): StaffPerformance[] {
    return Array.from(this.staff.values());
  }

  updateStaffPerformance(
    staffId: string,
    metrics: Partial<StaffPerformance>,
  ): boolean {
    const performance = this.staff.get(staffId);
    if (!performance) return false;

    Object.assign(performance, metrics);
    this.notifyListeners("staff_performance_updated", { staffId, metrics });
    return true;
  }

  // Alerts Management
  getAlerts(): StaffAlert[] {
    return this.alerts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  getAlertsByPriority(priority: StaffAlert["priority"]): StaffAlert[] {
    return this.alerts.filter((alert) => alert.priority === priority);
  }

  getActiveAlerts(): StaffAlert[] {
    return this.alerts.filter((alert) => !alert.resolvedAt);
  }

  acknowledgeAlert(alertId: string, staffId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.acknowledgedAt = new Date();
    this.notifyListeners("alert_acknowledged", { alert, staffId });
    return true;
  }

  resolveAlert(alertId: string, staffId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.resolvedAt = new Date();
    this.notifyListeners("alert_resolved", { alert, staffId });
    return true;
  }

  // Analytics and Reports
  getTicketAnalytics(period: { start: Date; end: Date }) {
    const tickets = Array.from(this.tickets.values()).filter(
      (ticket) =>
        ticket.createdAt >= period.start && ticket.createdAt <= period.end,
    );

    const total = tickets.length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const avgResolutionTime =
      tickets
        .filter((t) => t.resolutionTime)
        .reduce((sum, t) => sum + (t.resolutionTime || 0), 0) /
      (tickets.filter((t) => t.resolutionTime).length || 1);

    const byCategory = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.category] = (acc[ticket.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const byPriority = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      resolved,
      resolutionRate: total > 0 ? resolved / total : 0,
      avgResolutionTime,
      byCategory,
      byPriority,
      dailyVolume: this.generateDailyVolume(tickets, period),
    };
  }

  private generateDailyVolume(
    tickets: SupportTicket[],
    period: { start: Date; end: Date },
  ) {
    const days = Math.ceil(
      (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = new Date(period.start.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const dayTickets = tickets.filter(
        (t) => t.createdAt.toISOString().split("T")[0] === dateStr,
      ).length;
      return { date: dateStr, tickets: dayTickets };
    });

    return dailyData;
  }

  // Event System
  subscribe(callback: (event: string, data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.forEach((callback) => callback(event, data));
  }

  // Integration with other services
  async sendTicketUpdateEmail(
    ticketId: string,
    updateType: string,
  ): Promise<boolean> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return false;

    try {
      await emailService.sendTicketUpdate(ticket.userEmail, ticket, updateType);
      return true;
    } catch (error) {
      console.error("Failed to send ticket update email:", error);
      return false;
    }
  }

  async exportUserData(userId: string): Promise<any> {
    const user = this.users.get(userId);
    if (!user) return null;

    const userTickets = Array.from(this.tickets.values()).filter(
      (t) => t.userId === userId,
    );
    const userTransactions = await balanceService.getTransactionHistory(userId);

    return {
      account: user,
      tickets: userTickets,
      transactions: userTransactions,
      exportedAt: new Date(),
      exportedBy: "system",
    };
  }

  async generateComplianceReport(userId: string): Promise<any> {
    const user = this.users.get(userId);
    if (!user) return null;

    return {
      userId,
      riskAssessment: {
        score: user.riskScore,
        factors: user.riskFactors,
        lastUpdated: new Date(),
      },
      kycCompliance: {
        status: user.kycStatus,
        documentsVerified: Object.keys(user.kycDocuments).length,
        lastVerification: user.kycDocuments.photoId?.uploadedAt,
      },
      activitySummary: {
        registrationDate: user.registrationDate,
        lastActivity: user.lastLoginAt,
        totalDeposits: user.totalDeposits,
        totalWithdrawals: user.totalWithdrawals,
        gamesPlayed: user.gamesPlayed,
      },
      restrictions: user.restrictions,
      generatedAt: new Date(),
    };
  }
}

export const staffService = StaffService.getInstance();
