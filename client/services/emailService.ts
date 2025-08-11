export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  category:
    | "welcome"
    | "verification"
    | "marketing"
    | "support"
    | "transactional"
    | "ai_generated";
  variables: string[];
  isActive: boolean;
  aiOptimized: boolean;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  };
}

export interface Email {
  id: string;
  messageId: string;
  to: string;
  from: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  status:
    | "draft"
    | "queued"
    | "sending"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "failed"
    | "bounced";
  templateId?: string;
  userId?: string;
  priority: "low" | "normal" | "high" | "urgent";
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failureReason?: string;
  metadata: Record<string, any>;
  aiGenerated: boolean;
  aiConfidence?: number;
}

export interface InboxMessage {
  id: string;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  isHtml: boolean;
  receivedAt: Date;
  isRead: boolean;
  isSpam: boolean;
  category:
    | "support"
    | "sales"
    | "complaint"
    | "inquiry"
    | "feedback"
    | "other";
  priority: "low" | "normal" | "high" | "urgent";
  aiAnalysis: {
    sentiment: "positive" | "negative" | "neutral";
    confidence: number;
    intent: string;
    suggestedResponse: string;
    urgency: number;
    tags: string[];
    summary: string;
  };
  assignedTo?: string;
  status: "new" | "in_progress" | "responded" | "closed";
  responseId?: string;
}

export interface AIEmailAssistant {
  id: string;
  name: string;
  role: "customer_support" | "sales" | "marketing" | "general";
  personality: string;
  isActive: boolean;
  autoRespond: boolean;
  responseDelay: number; // minutes
  confidence_threshold: number;
  specializations: string[];
  stats: {
    emailsHandled: number;
    avgResponseTime: number;
    satisfactionScore: number;
    accuracyRate: number;
  };
}

class EmailService {
  private static instance: EmailService;
  private templates: Map<string, EmailTemplate> = new Map();
  private sentEmails: Map<string, Email> = new Map();
  private inboxMessages: Map<string, InboxMessage> = new Map();
  private aiAssistants: Map<string, AIEmailAssistant> = new Map();
  private listeners: Set<(data: any) => void> = new Set();

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  constructor() {
    this.initializeDefaultData();
    this.startInboxMonitoring();
    this.initializeAIAssistants();
  }

  private initializeDefaultData() {
    // Default email templates
    const defaultTemplates: EmailTemplate[] = [
      {
        id: "welcome_001",
        name: "Welcome Email - New User",
        subject:
          "Welcome to CoinKrazy! Your {{bonus_amount}} bonus is ready! 🎰",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #3b82f6); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to CoinKrazy!</h1>
              <p style="color: white; font-size: 18px; margin: 10px 0;">Where Fun Meets Fortune™</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1f2937;">Hello {{username}},</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Welcome to the most exciting sweepstakes casino experience! We're thrilled to have you join our community of winners.
              </p>
              
              <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">🎁 Your Welcome Bonus</h3>
                <p style="font-size: 24px; font-weight: bold; color: #92400e; margin: 0;">{{bonus_amount}}</p>
                <p style="color: #92400e; margin: 5px 0 0 0;">Gold Coins + Sweeps Coins</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🎰 Start Playing Now
                </a>
              </div>
              
              <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
                <h4 style="color: #0c4a6e; margin: 0 0 10px 0;">🏆 What's Next?</h4>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                  <li>Explore 700+ premium slot games</li>
                  <li>Join live poker tables</li>
                  <li>Play bingo with real prizes</li>
                  <li>Complete verification to unlock withdrawals</li>
                </ul>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                <h4 style="color: #166534; margin: 0 0 10px 0;">📞 Need Help?</h4>
                <p style="color: #166534; margin: 0;">Our support team is available 24/7:</p>
                <p style="color: #166534; margin: 5px 0;">
                  📧 Email: support@coinkrazy.com<br>
                  📱 Phone: 319-473-0416
                </p>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
                18+ Only. Please play responsibly. No purchase necessary.<br>
                This email was sent to {{email}}. <a href="{{unsubscribe_url}}">Unsubscribe</a>
              </p>
            </div>
          </div>
        `,
        textContent: `Welcome to CoinKrazy!

Hello {{username}},

Welcome to the most exciting sweepstakes casino experience! Your welcome bonus of {{bonus_amount}} is ready.

🎁 Your Welcome Bonus: {{bonus_amount}} Gold Coins + Sweeps Coins

Start playing now: {{login_url}}

What's Next?
- Explore 700+ premium slot games
- Join live poker tables  
- Play bingo with real prizes
- Complete verification to unlock withdrawals

Need Help?
Email: support@coinkrazy.com
Phone: 319-473-0416

18+ Only. Please play responsibly.
Unsubscribe: {{unsubscribe_url}}`,
        category: "welcome",
        variables: [
          "username",
          "email",
          "bonus_amount",
          "login_url",
          "unsubscribe_url",
        ],
        isActive: true,
        aiOptimized: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          sent: 1247,
          opened: 1089,
          clicked: 623,
          openRate: 87.3,
          clickRate: 49.9,
        },
      },
      {
        id: "verification_001",
        name: "Email Verification",
        subject: "Verify your CoinKrazy account - One click away! ✨",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1f2937;">Hello {{username}},</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                You're just one click away from accessing your CoinKrazy account and claiming your welcome bonus!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{verification_url}}" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ✨ Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                This link will expire in 24 hours.<br>
                If you didn't create this account, please ignore this email.
              </p>
            </div>
          </div>
        `,
        textContent: `Verify Your CoinKrazy Account

Hello {{username}},

Please verify your email address to access your account:
{{verification_url}}

This link expires in 24 hours.`,
        category: "verification",
        variables: ["username", "verification_url"],
        isActive: true,
        aiOptimized: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          sent: 956,
          opened: 834,
          clicked: 721,
          openRate: 87.2,
          clickRate: 75.4,
        },
      },
    ];

    defaultTemplates.forEach((template) => {
      this.templates.set(template.id, template);
    });

    // Sample inbox messages for demonstration
    this.generateSampleInboxMessages();
  }

  private generateSampleInboxMessages() {
    const sampleMessages: InboxMessage[] = [
      {
        id: "msg_001",
        messageId: "<msg001@user.com>",
        from: "john.player@gmail.com",
        to: "support@coinkrazy.com",
        subject: "Unable to withdraw my winnings",
        content:
          "Hi, I won 500 SC yesterday but I cannot withdraw them. The system says my account needs verification but I already uploaded my documents. Can you please help?",
        isHtml: false,
        receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
        isSpam: false,
        category: "support",
        priority: "high",
        aiAnalysis: {
          sentiment: "negative",
          confidence: 0.85,
          intent: "withdrawal_issue",
          suggestedResponse:
            "I understand your frustration with the withdrawal process. Let me check your verification status and help resolve this issue immediately.",
          urgency: 8,
          tags: ["withdrawal", "verification", "KYC", "frustrated_customer"],
          summary:
            "Customer unable to withdraw 500 SC due to verification issue despite uploading documents",
        },
        status: "new",
      },
      {
        id: "msg_002",
        messageId: "<msg002@user.com>",
        from: "sarah.winner@yahoo.com",
        to: "support@coinkrazy.com",
        subject: "Thank you for the amazing experience!",
        content:
          "I just wanted to say thank you for such an amazing platform! I won $1,200 last week and the withdrawal was super smooth. The games are fantastic and customer service is excellent. Keep up the great work!",
        isHtml: false,
        receivedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        isSpam: false,
        category: "feedback",
        priority: "normal",
        aiAnalysis: {
          sentiment: "positive",
          confidence: 0.95,
          intent: "positive_feedback",
          suggestedResponse:
            "Thank you so much for your wonderful feedback! We're thrilled to hear about your positive experience and big win. We truly appreciate loyal players like you!",
          urgency: 3,
          tags: [
            "positive_feedback",
            "satisfied_customer",
            "testimonial",
            "big_win",
          ],
          summary:
            "Very positive feedback from customer who won $1,200 and had smooth withdrawal experience",
        },
        status: "responded",
      },
      {
        id: "msg_003",
        messageId: "<msg003@user.com>",
        from: "potential.partner@businessemail.com",
        to: "sales@coinkrazy.com",
        subject: "Partnership Opportunity - Game Provider",
        content:
          "Hello, we are a leading slot game provider with 200+ premium titles. We would like to discuss a partnership opportunity with CoinKrazy. Our games have proven RTP rates and engaging features. Can we schedule a call this week?",
        isHtml: false,
        receivedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isRead: false,
        isSpam: false,
        category: "sales",
        priority: "high",
        aiAnalysis: {
          sentiment: "neutral",
          confidence: 0.78,
          intent: "business_partnership",
          suggestedResponse:
            "Thank you for your interest in partnering with CoinKrazy. We're always looking for quality game providers. I'll forward this to our business development team who will contact you within 24 hours.",
          urgency: 7,
          tags: [
            "partnership",
            "game_provider",
            "business_opportunity",
            "potential_revenue",
          ],
          summary:
            "Game provider seeking partnership opportunity with 200+ premium slot titles",
        },
        status: "new",
      },
    ];

    sampleMessages.forEach((message) => {
      this.inboxMessages.set(message.id, message);
    });
  }

  private initializeAIAssistants() {
    const assistants: AIEmailAssistant[] = [
      {
        id: "ai_support_001",
        name: "SupportBot Pro",
        role: "customer_support",
        personality:
          "Helpful, empathetic, and solution-oriented. Always prioritizes customer satisfaction.",
        isActive: true,
        autoRespond: true,
        responseDelay: 2,
        confidence_threshold: 0.8,
        specializations: [
          "account_issues",
          "technical_support",
          "withdrawals",
          "verification",
        ],
        stats: {
          emailsHandled: 2847,
          avgResponseTime: 1.3,
          satisfactionScore: 4.7,
          accuracyRate: 94.2,
        },
      },
      {
        id: "ai_sales_001",
        name: "SalesAI Elite",
        role: "sales",
        personality:
          "Professional, persuasive, and relationship-focused. Builds trust and drives conversions.",
        isActive: true,
        autoRespond: false,
        responseDelay: 5,
        confidence_threshold: 0.85,
        specializations: [
          "lead_qualification",
          "partnership_inquiries",
          "business_development",
        ],
        stats: {
          emailsHandled: 1234,
          avgResponseTime: 4.2,
          satisfactionScore: 4.5,
          accuracyRate: 91.8,
        },
      },
    ];

    assistants.forEach((assistant) => {
      this.aiAssistants.set(assistant.id, assistant);
    });
  }

  private startInboxMonitoring() {
    // Simulate incoming emails
    setInterval(() => {
      this.simulateIncomingEmail();
    }, 30000); // Every 30 seconds

    // Process AI responses
    setInterval(() => {
      this.processAIResponses();
    }, 60000); // Every minute
  }

  private simulateIncomingEmail() {
    // Simulate random incoming emails
    if (Math.random() > 0.7) {
      // 30% chance every 30 seconds
      const subjects = [
        "Question about VIP program",
        "Game not loading properly",
        "Congratulations on the platform!",
        "Business inquiry",
        "Technical issue with mobile app",
      ];

      const senders = [
        "player@email.com",
        "customer@gmail.com",
        "user@yahoo.com",
        "business@company.com",
      ];

      const newMessage: InboxMessage = {
        id: `msg_${Date.now()}`,
        messageId: `<${Date.now()}@email.com>`,
        from: senders[Math.floor(Math.random() * senders.length)],
        to: "support@coinkrazy.com",
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        content: "AI-generated email content based on subject...",
        isHtml: false,
        receivedAt: new Date(),
        isRead: false,
        isSpam: false,
        category: "inquiry",
        priority: "normal",
        aiAnalysis: {
          sentiment: "neutral",
          confidence: 0.75,
          intent: "general_inquiry",
          suggestedResponse:
            "Thank you for contacting us. We'll review your message and respond shortly.",
          urgency: 5,
          tags: ["new_inquiry"],
          summary: "New customer inquiry requiring review",
        },
        status: "new",
      };

      this.inboxMessages.set(newMessage.id, newMessage);
      this.notifyListeners({ type: "new_email", data: newMessage });
    }
  }

  private processAIResponses() {
    // Find messages that need AI responses
    const unprocessedMessages = Array.from(this.inboxMessages.values()).filter(
      (msg) => msg.status === "new" && msg.aiAnalysis.confidence > 0.8,
    );

    unprocessedMessages.forEach((message) => {
      const aiAssistant = this.getAppropriateAI(message);
      if (aiAssistant && aiAssistant.autoRespond) {
        this.generateAIResponse(message, aiAssistant);
      }
    });
  }

  private getAppropriateAI(message: InboxMessage): AIEmailAssistant | null {
    // Find the best AI assistant for this message
    const assistants = Array.from(this.aiAssistants.values()).filter(
      (ai) => ai.isActive,
    );

    for (const assistant of assistants) {
      if (
        assistant.role === "customer_support" &&
        message.category === "support"
      ) {
        return assistant;
      }
      if (assistant.role === "sales" && message.category === "sales") {
        return assistant;
      }
    }

    return assistants.find((ai) => ai.role === "customer_support") || null;
  }

  private generateAIResponse(
    message: InboxMessage,
    aiAssistant: AIEmailAssistant,
  ) {
    // Simulate AI response generation
    setTimeout(
      () => {
        const response: Email = {
          id: `email_${Date.now()}`,
          messageId: `<response_${Date.now()}@coinkrazy.com>`,
          to: message.from,
          from: "support@coinkrazy.com",
          subject: `Re: ${message.subject}`,
          htmlContent: this.generateResponseHTML(
            message.aiAnalysis.suggestedResponse,
          ),
          textContent: message.aiAnalysis.suggestedResponse,
          status: "sent",
          priority: "normal",
          sentAt: new Date(),
          deliveredAt: new Date(),
          metadata: {
            originalMessageId: message.id,
            aiAssistantId: aiAssistant.id,
            aiGenerated: true,
          },
          aiGenerated: true,
          aiConfidence: message.aiAnalysis.confidence,
        };

        this.sentEmails.set(response.id, response);

        // Update original message status
        message.status = "responded";
        message.responseId = response.id;

        this.notifyListeners({
          type: "ai_response_sent",
          data: { message, response, aiAssistant },
        });
      },
      aiAssistant.responseDelay * 60 * 1000,
    );
  }

  private generateResponseHTML(textContent: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">CoinKrazy Support</h2>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            ${textContent}
          </p>
          <div style="margin-top: 20px; padding: 15px; background: #e0f2fe; border-radius: 8px;">
            <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
              📞 Need immediate assistance? Call us at 319-473-0416<br>
              📧 Reply to this email for further questions
            </p>
          </div>
          <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
            This response was generated by our AI support system and reviewed by our team.
          </p>
        </div>
      </div>
    `;
  }

  // Public API methods
  async sendWelcomeEmail(
    userId: string,
    email: string,
    username: string,
  ): Promise<boolean> {
    try {
      const template = this.templates.get("welcome_001");
      if (!template) return false;

      const emailData: Email = {
        id: `email_${Date.now()}`,
        messageId: `<welcome_${userId}_${Date.now()}@coinkrazy.com>`,
        to: email,
        from: "welcome@coinkrazy.com",
        subject: template.subject
          .replace("{{username}}", username)
          .replace("{{bonus_amount}}", "50,000 GC + 25 SC"),
        htmlContent: template.htmlContent
          .replace(/{{username}}/g, username)
          .replace(/{{email}}/g, email)
          .replace(/{{bonus_amount}}/g, "50,000 GC + 25 SC")
          .replace(/{{login_url}}/g, "https://coinkrazy.com/dashboard")
          .replace(
            /{{unsubscribe_url}}/g,
            `https://coinkrazy.com/unsubscribe?user=${userId}`,
          ),
        textContent: template.textContent
          .replace(/{{username}}/g, username)
          .replace(/{{email}}/g, email)
          .replace(/{{bonus_amount}}/g, "50,000 GC + 25 SC")
          .replace(/{{login_url}}/g, "https://coinkrazy.com/dashboard")
          .replace(
            /{{unsubscribe_url}}/g,
            `https://coinkrazy.com/unsubscribe?user=${userId}`,
          ),
        status: "sent",
        templateId: template.id,
        userId,
        priority: "high",
        sentAt: new Date(),
        deliveredAt: new Date(),
        metadata: { type: "welcome", automated: true },
        aiGenerated: false,
      };

      this.sentEmails.set(emailData.id, emailData);

      // Update template stats
      template.stats.sent++;
      template.stats.opened++; // Simulate high open rate
      if (Math.random() > 0.5) {
        template.stats.clicked++;
      }
      this.updateTemplateStats(template);

      this.notifyListeners({ type: "email_sent", data: emailData });
      return true;
    } catch (error) {
      console.error("Failed to send welcome email:", error);
      return false;
    }
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    username: string,
    verificationToken: string,
  ): Promise<boolean> {
    try {
      const template = this.templates.get("verification_001");
      if (!template) return false;

      const verificationUrl = `https://coinkrazy.com/verify-email?token=${verificationToken}`;

      const emailData: Email = {
        id: `email_${Date.now()}`,
        messageId: `<verify_${userId}_${Date.now()}@coinkrazy.com>`,
        to: email,
        from: "noreply@coinkrazy.com",
        subject: template.subject.replace("{{username}}", username),
        htmlContent: template.htmlContent
          .replace(/{{username}}/g, username)
          .replace(/{{verification_url}}/g, verificationUrl),
        textContent: template.textContent
          .replace(/{{username}}/g, username)
          .replace(/{{verification_url}}/g, verificationUrl),
        status: "sent",
        templateId: template.id,
        userId,
        priority: "high",
        sentAt: new Date(),
        deliveredAt: new Date(),
        metadata: { type: "verification", token: verificationToken },
        aiGenerated: false,
      };

      this.sentEmails.set(emailData.id, emailData);

      // Update template stats
      template.stats.sent++;
      this.updateTemplateStats(template);

      this.notifyListeners({ type: "email_sent", data: emailData });
      return true;
    } catch (error) {
      console.error("Failed to send verification email:", error);
      return false;
    }
  }

  getInboxMessages(): InboxMessage[] {
    return Array.from(this.inboxMessages.values()).sort(
      (a, b) => b.receivedAt.getTime() - a.receivedAt.getTime(),
    );
  }

  getSentEmails(): Email[] {
    return Array.from(this.sentEmails.values()).sort(
      (a, b) => (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0),
    );
  }

  getEmailTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getAIAssistants(): AIEmailAssistant[] {
    return Array.from(this.aiAssistants.values());
  }

  private updateTemplateStats(template: EmailTemplate) {
    template.stats.openRate =
      (template.stats.opened / template.stats.sent) * 100;
    template.stats.clickRate =
      (template.stats.clicked / template.stats.sent) * 100;
    template.updatedAt = new Date();
  }

  markMessageAsRead(messageId: string): void {
    const message = this.inboxMessages.get(messageId);
    if (message) {
      message.isRead = true;
      this.notifyListeners({ type: "message_read", data: message });
    }
  }

  updateMessageStatus(messageId: string, status: InboxMessage["status"]): void {
    const message = this.inboxMessages.get(messageId);
    if (message) {
      message.status = status;
      this.notifyListeners({ type: "message_status_updated", data: message });
    }
  }

  assignMessage(messageId: string, assignedTo: string): void {
    const message = this.inboxMessages.get(messageId);
    if (message) {
      message.assignedTo = assignedTo;
      this.notifyListeners({ type: "message_assigned", data: message });
    }
  }

  subscribe(callback: (data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(data: any) {
    this.listeners.forEach((callback) => callback(data));
  }

  // Analytics and reporting
  getEmailAnalytics() {
    const templates = this.getEmailTemplates();
    const sentEmails = this.getSentEmails();
    const inboxMessages = this.getInboxMessages();

    return {
      totalSent: sentEmails.length,
      totalReceived: inboxMessages.length,
      avgOpenRate:
        templates.reduce((sum, t) => sum + t.stats.openRate, 0) /
        templates.length,
      avgClickRate:
        templates.reduce((sum, t) => sum + t.stats.clickRate, 0) /
        templates.length,
      unreadMessages: inboxMessages.filter((m) => !m.isRead).length,
      highPriorityMessages: inboxMessages.filter(
        (m) => m.priority === "high" || m.priority === "urgent",
      ).length,
      aiResponseRate:
        (inboxMessages.filter((m) => m.status === "responded").length /
          inboxMessages.length) *
        100,
    };
  }
}

export const emailService = EmailService.getInstance();
export default emailService;
