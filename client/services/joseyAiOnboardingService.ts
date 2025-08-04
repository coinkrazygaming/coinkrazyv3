export interface UserAccount {
  id: string;
  email: string;
  username?: string;
  accountType: "user" | "staff" | "admin";
  onboardingRequired: boolean;
  onboardingStage:
    | "welcome"
    | "education"
    | "kyc_required"
    | "kyc_pending"
    | "kyc_approved"
    | "completed";
  kycStatus:
    | "not_started"
    | "documents_required"
    | "under_review"
    | "approved"
    | "rejected";
  flags: {
    newUser: boolean;
    kycRequired: boolean;
    educationCompleted: boolean;
    firstTimeLogin: boolean;
    remindersSent: number;
    lastReminderDate?: Date;
  };
  onboardingData: {
    startDate: Date;
    completedSteps: string[];
    competitorEducationCompleted: boolean;
    documentsUploaded: {
      photoId?: string;
      utilityBill?: string;
    };
    reminderPreferences: {
      email: boolean;
      phone: boolean;
      sms: boolean;
    };
  };
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  type: "welcome" | "education" | "kyc" | "verification" | "completion";
  required: boolean;
  completed: boolean;
  dependsOn?: string[];
  joseyAiScript: string;
  incentives?: {
    gcReward?: number;
    scReward?: number;
    promotion?: string;
  };
}

export interface JoseyAiResponse {
  id: string;
  userId: string;
  message: string;
  type: "welcome" | "education" | "reminder" | "encouragement" | "next_step";
  timestamp: Date;
  actionRequired?: {
    type:
      | "upload_document"
      | "verify_info"
      | "complete_education"
      | "contact_support";
    description: string;
    url?: string;
  };
  contextAware: {
    userLocation: string;
    deviceType: string;
    timeOfDay: string;
    currentPage: string;
    accountStatus: string;
  };
}

class JoseyAiOnboardingService {
  private static instance: JoseyAiOnboardingService;
  private userAccounts: Map<string, UserAccount> = new Map();
  private onboardingSteps: Map<string, OnboardingStep[]> = new Map();
  private aiResponses: Map<string, JoseyAiResponse[]> = new Map();
  private listeners: Set<(userId: string, response: JoseyAiResponse) => void> =
    new Set();

  static getInstance(): JoseyAiOnboardingService {
    if (!JoseyAiOnboardingService.instance) {
      JoseyAiOnboardingService.instance = new JoseyAiOnboardingService();
    }
    return JoseyAiOnboardingService.instance;
  }

  constructor() {
    this.initializeOnboardingSteps();
    this.startReminderSystem();
  }

  private initializeOnboardingSteps() {
    // Standard user onboarding steps
    const userSteps: OnboardingStep[] = [
      {
        id: "welcome",
        title: "Welcome to CoinKrazy!",
        description: "Get familiar with our platform",
        type: "welcome",
        required: true,
        completed: false,
        joseyAiScript:
          "🎉 Welcome to CoinKrazy! I'm JoseyAI, your personal assistant! I'm here to help you navigate our amazing sweepstakes casino platform. Let's start by showing you what makes us special!",
        incentives: { gcReward: 5000, scReward: 5 },
      },
      {
        id: "education",
        title: "Learn About CoinKrazy vs Competitors",
        description: "Understand what sets us apart",
        type: "education",
        required: true,
        completed: false,
        dependsOn: ["welcome"],
        joseyAiScript:
          "Let me explain what makes CoinKrazy different from other sweepstakes platforms. We offer REAL instant withdrawals, better odds, more games, and genuine customer support - not chatbots!",
        incentives: { gcReward: 2500 },
      },
      {
        id: "kyc_introduction",
        title: "KYC Verification Introduction",
        description: "Learn about identity verification",
        type: "education",
        required: true,
        completed: false,
        dependsOn: ["education"],
        joseyAiScript:
          "To ensure security and enable withdrawals, we need to verify your identity. This is standard for all legitimate sweepstakes platforms and protects both you and us!",
      },
      {
        id: "kyc_documents",
        title: "Upload Verification Documents",
        description: "Upload photo ID and utility bill",
        type: "kyc",
        required: true,
        completed: false,
        dependsOn: ["kyc_introduction"],
        joseyAiScript:
          "Please upload a clear photo of your government-issued ID and a recent utility bill. Make sure the names and addresses match exactly. I'm here to help if you have questions!",
        incentives: { scReward: 10 },
      },
      {
        id: "completion",
        title: "Onboarding Complete!",
        description: "Welcome to the CoinKrazy family",
        type: "completion",
        required: true,
        completed: false,
        dependsOn: ["kyc_documents"],
        joseyAiScript:
          "🎊 Congratulations! You're now fully verified and ready to enjoy everything CoinKrazy has to offer. Welcome to the family!",
        incentives: { gcReward: 10000, scReward: 25 },
      },
    ];

    // Staff onboarding steps
    const staffSteps: OnboardingStep[] = [
      {
        id: "staff_welcome",
        title: "Staff Welcome",
        description: "Welcome to the CoinKrazy team",
        type: "welcome",
        required: true,
        completed: false,
        joseyAiScript:
          "Welcome to the CoinKrazy team! I'm JoseyAI and I'll help you get familiar with our systems, policies, and tools. Let's make sure you're ready to provide excellent customer service!",
      },
      {
        id: "system_training",
        title: "System Training",
        description: "Learn our internal systems",
        type: "education",
        required: true,
        completed: false,
        dependsOn: ["staff_welcome"],
        joseyAiScript:
          "Let me walk you through our admin systems, customer support tools, and escalation procedures. You'll also learn about our unique competitive advantages.",
      },
      {
        id: "compliance_training",
        title: "Compliance Training",
        description: "Legal and compliance requirements",
        type: "education",
        required: true,
        completed: false,
        dependsOn: ["system_training"],
        joseyAiScript:
          "Important: Here's our compliance training covering sweepstakes laws, responsible gaming, and data protection. This is mandatory for all staff members.",
      },
    ];

    // Admin onboarding steps
    const adminSteps: OnboardingStep[] = [
      {
        id: "admin_welcome",
        title: "Admin Access Granted",
        description: "Full platform access",
        type: "welcome",
        required: true,
        completed: false,
        joseyAiScript:
          "Welcome to full admin access! I'll brief you on all systems, security protocols, and advanced features. You now have complete control over the platform.",
      },
      {
        id: "security_briefing",
        title: "Security Briefing",
        description: "Security protocols and access",
        type: "education",
        required: true,
        completed: false,
        dependsOn: ["admin_welcome"],
        joseyAiScript:
          "Critical: Here are the security protocols, API keys, database access, and emergency procedures. Please review all security measures carefully.",
      },
    ];

    this.onboardingSteps.set("user", userSteps);
    this.onboardingSteps.set("staff", staffSteps);
    this.onboardingSteps.set("admin", adminSteps);
  }

  private startReminderSystem() {
    // Send reminders every hour for incomplete onboarding
    setInterval(() => {
      this.sendOnboardingReminders();
    }, 60000 * 60); // 1 hour
  }

  private sendOnboardingReminders() {
    const now = new Date();

    this.userAccounts.forEach((account, userId) => {
      if (
        !account.onboardingRequired ||
        account.onboardingStage === "completed"
      )
        return;

      const lastReminder = account.flags.lastReminderDate;
      const hoursSinceLastReminder = lastReminder
        ? (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60)
        : 24;

      // Send reminder if it's been more than 4 hours
      if (hoursSinceLastReminder >= 4) {
        this.sendContextualReminder(userId, account);
        account.flags.remindersSent += 1;
        account.flags.lastReminderDate = now;
      }
    });
  }

  private sendContextualReminder(userId: string, account: UserAccount) {
    const timeOfDay = this.getTimeOfDay();
    const deviceType = "desktop"; // Would be detected in real implementation
    const currentPage = "dashboard"; // Would be tracked in real implementation

    let reminderMessage = "";
    let incentive = "";

    switch (account.onboardingStage) {
      case "welcome":
        reminderMessage = `${timeOfDay === "morning" ? "Good morning!" : timeOfDay === "afternoon" ? "Good afternoon!" : "Good evening!"} It's JoseyAI here. I noticed you haven't completed your welcome tour yet. I'd love to show you around CoinKrazy!`;
        incentive =
          "Complete your welcome tour now and get 5,000 Gold Coins + 5 Sweeps Coins!";
        break;
      case "education":
        reminderMessage = `Hey there! JoseyAI again. Learning about what makes CoinKrazy special will only take 2 minutes and you'll understand why we're better than the competition!`;
        incentive = "Finish learning about us and earn 2,500 bonus Gold Coins!";
        break;
      case "kyc_required":
      case "kyc_pending":
        reminderMessage = `Hi! Your KYC verification is still pending. This is the final step to unlock withdrawals and get full access to our platform. I'm here to help if you have questions!`;
        incentive =
          "Complete KYC verification and receive 10 Sweeps Coins bonus!";
        break;
    }

    const response: JoseyAiResponse = {
      id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message: `${reminderMessage} ${incentive}`,
      type: "reminder",
      timestamp: new Date(),
      actionRequired: {
        type: "complete_education",
        description: "Continue your onboarding process",
        url: "/dashboard?tab=onboarding",
      },
      contextAware: {
        userLocation: "dashboard",
        deviceType,
        timeOfDay,
        currentPage,
        accountStatus: account.onboardingStage,
      },
    };

    this.addAiResponse(userId, response);
    this.notifyListeners(userId, response);
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  }

  // Public methods
  createUserAccount(userData: {
    id: string;
    email: string;
    username?: string;
    accountType: "user" | "staff" | "admin";
  }): UserAccount {
    const account: UserAccount = {
      ...userData,
      onboardingRequired: true,
      onboardingStage: "welcome",
      kycStatus: "not_started",
      flags: {
        newUser: true,
        kycRequired: userData.accountType === "user",
        educationCompleted: false,
        firstTimeLogin: true,
        remindersSent: 0,
      },
      onboardingData: {
        startDate: new Date(),
        completedSteps: [],
        competitorEducationCompleted: false,
        documentsUploaded: {},
        reminderPreferences: {
          email: true,
          phone: true,
          sms: true,
        },
      },
    };

    this.userAccounts.set(userData.id, account);

    // Send welcome message
    this.sendWelcomeMessage(userData.id, account);

    return account;
  }

  private sendWelcomeMessage(userId: string, account: UserAccount) {
    const welcomeStep = this.getOnboardingSteps(account.accountType)[0];

    const response: JoseyAiResponse = {
      id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message: welcomeStep.joseyAiScript,
      type: "welcome",
      timestamp: new Date(),
      actionRequired: {
        type: "complete_education",
        description: "Start your onboarding journey",
        url: "/dashboard?tab=onboarding",
      },
      contextAware: {
        userLocation: "registration",
        deviceType: "desktop",
        timeOfDay: this.getTimeOfDay(),
        currentPage: "welcome",
        accountStatus: "new",
      },
    };

    this.addAiResponse(userId, response);
    this.notifyListeners(userId, response);
  }

  getUserAccount(userId: string): UserAccount | undefined {
    return this.userAccounts.get(userId);
  }

  getOnboardingSteps(
    accountType: "user" | "staff" | "admin",
  ): OnboardingStep[] {
    return this.onboardingSteps.get(accountType) || [];
  }

  completeOnboardingStep(userId: string, stepId: string): boolean {
    const account = this.userAccounts.get(userId);
    if (!account) return false;

    const steps = this.getOnboardingSteps(account.accountType);
    const step = steps.find((s) => s.id === stepId);
    if (!step) return false;

    step.completed = true;
    account.onboardingData.completedSteps.push(stepId);

    // Award incentives
    if (step.incentives) {
      // This would integrate with balance service
      console.log(
        `Awarding ${step.incentives.gcReward || 0} GC and ${step.incentives.scReward || 0} SC to ${userId}`,
      );
    }

    // Update onboarding stage
    this.updateOnboardingStage(userId, account);

    // Send congratulations and next step
    this.sendNextStepMessage(userId, account, stepId);

    return true;
  }

  private updateOnboardingStage(userId: string, account: UserAccount) {
    const steps = this.getOnboardingSteps(account.accountType);
    const completedSteps = account.onboardingData.completedSteps;

    if (
      completedSteps.includes("welcome") &&
      !completedSteps.includes("education")
    ) {
      account.onboardingStage = "education";
    } else if (
      completedSteps.includes("education") &&
      !completedSteps.includes("kyc_documents")
    ) {
      account.onboardingStage = "kyc_required";
    } else if (
      completedSteps.includes("kyc_documents") &&
      account.kycStatus !== "approved"
    ) {
      account.onboardingStage = "kyc_pending";
    } else if (account.kycStatus === "approved") {
      account.onboardingStage = "kyc_approved";
    }

    const allRequired = steps
      .filter((s) => s.required)
      .every((s) => s.completed);
    if (allRequired) {
      account.onboardingStage = "completed";
      account.onboardingRequired = false;
    }
  }

  private sendNextStepMessage(
    userId: string,
    account: UserAccount,
    completedStepId: string,
  ) {
    const steps = this.getOnboardingSteps(account.accountType);
    const nextStep = steps.find(
      (s) =>
        !s.completed &&
        (!s.dependsOn ||
          s.dependsOn.every((dep) =>
            account.onboardingData.completedSteps.includes(dep),
          )),
    );

    if (nextStep) {
      const response: JoseyAiResponse = {
        id: `next-step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        message: `Great job completing that step! ${nextStep.joseyAiScript}`,
        type: "next_step",
        timestamp: new Date(),
        actionRequired: {
          type:
            nextStep.type === "kyc" ? "upload_document" : "complete_education",
          description: nextStep.description,
          url: "/dashboard?tab=onboarding",
        },
        contextAware: {
          userLocation: "onboarding",
          deviceType: "desktop",
          timeOfDay: this.getTimeOfDay(),
          currentPage: "progress",
          accountStatus: account.onboardingStage,
        },
      };

      this.addAiResponse(userId, response);
      this.notifyListeners(userId, response);
    } else {
      // All steps completed
      this.sendCompletionMessage(userId, account);
    }
  }

  private sendCompletionMessage(userId: string, account: UserAccount) {
    const response: JoseyAiResponse = {
      id: `completion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message:
        "🎊 Congratulations! You've completed your onboarding! Welcome to the CoinKrazy family. You now have full access to all features, including withdrawals. I'm always here if you need help!",
      type: "welcome",
      timestamp: new Date(),
      contextAware: {
        userLocation: "onboarding",
        deviceType: "desktop",
        timeOfDay: this.getTimeOfDay(),
        currentPage: "completed",
        accountStatus: "completed",
      },
    };

    this.addAiResponse(userId, response);
    this.notifyListeners(userId, response);
  }

  updateKycStatus(userId: string, status: UserAccount["kycStatus"]): boolean {
    const account = this.userAccounts.get(userId);
    if (!account) return false;

    account.kycStatus = status;
    this.updateOnboardingStage(userId, account);

    if (status === "approved") {
      const response: JoseyAiResponse = {
        id: `kyc-approved-${Date.now()}`,
        userId,
        message:
          "🎉 Great news! Your KYC verification has been approved! You can now make withdrawals and access all premium features. Welcome to full CoinKrazy membership!",
        type: "welcome",
        timestamp: new Date(),
        contextAware: {
          userLocation: "dashboard",
          deviceType: "desktop",
          timeOfDay: this.getTimeOfDay(),
          currentPage: "kyc_status",
          accountStatus: "approved",
        },
      };

      this.addAiResponse(userId, response);
      this.notifyListeners(userId, response);
    }

    return true;
  }

  private addAiResponse(userId: string, response: JoseyAiResponse) {
    if (!this.aiResponses.has(userId)) {
      this.aiResponses.set(userId, []);
    }
    this.aiResponses.get(userId)!.unshift(response);
  }

  private notifyListeners(userId: string, response: JoseyAiResponse) {
    this.listeners.forEach((callback) => callback(userId, response));
  }

  getUserResponses(userId: string, limit: number = 10): JoseyAiResponse[] {
    return this.aiResponses.get(userId)?.slice(0, limit) || [];
  }

  subscribeToResponses(
    callback: (userId: string, response: JoseyAiResponse) => void,
  ): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Context awareness methods
  updateUserContext(
    userId: string,
    context: Partial<JoseyAiResponse["contextAware"]>,
  ) {
    // This would be called when user navigates or interacts with the site
    const account = this.userAccounts.get(userId);
    if (!account || !account.onboardingRequired) return;

    // Send contextual help based on current page
    if (
      context.currentPage === "games" &&
      account.onboardingStage !== "completed"
    ) {
      this.sendContextualHelp(userId, "games");
    }
  }

  private sendContextualHelp(userId: string, pageType: string) {
    const account = this.userAccounts.get(userId);
    if (!account) return;

    let message = "";

    switch (pageType) {
      case "games":
        if (account.kycStatus !== "approved") {
          message =
            "I see you're checking out our games! Just a friendly reminder that completing your KYC verification will unlock withdrawal capabilities for any SC you win. Want me to help you finish that process?";
        }
        break;
    }

    if (message) {
      const response: JoseyAiResponse = {
        id: `contextual-${Date.now()}`,
        userId,
        message,
        type: "encouragement",
        timestamp: new Date(),
        actionRequired: {
          type: "complete_education",
          description: "Complete your verification",
          url: "/dashboard?tab=onboarding",
        },
        contextAware: {
          userLocation: pageType,
          deviceType: "desktop",
          timeOfDay: this.getTimeOfDay(),
          currentPage: pageType,
          accountStatus: account.onboardingStage,
        },
      };

      this.addAiResponse(userId, response);
      this.notifyListeners(userId, response);
    }
  }

  // Admin methods
  getAllPendingUsers(): UserAccount[] {
    return Array.from(this.userAccounts.values())
      .filter((account) => account.onboardingRequired)
      .sort(
        (a, b) =>
          b.onboardingData.startDate.getTime() -
          a.onboardingData.startDate.getTime(),
      );
  }

  getOnboardingStats(): {
    totalUsers: number;
    pendingOnboarding: number;
    kycPending: number;
    completed: number;
    averageCompletionTime: number;
  } {
    const accounts = Array.from(this.userAccounts.values());
    const completed = accounts.filter((a) => !a.onboardingRequired);
    const pending = accounts.filter((a) => a.onboardingRequired);
    const kycPending = accounts.filter((a) => a.kycStatus === "under_review");

    const completionTimes = completed.map((a) => {
      // Calculate completion time (would be more accurate with actual completion timestamps)
      return 24 * 60 * 60 * 1000; // Default 24 hours
    });

    const averageCompletionTime =
      completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) /
          completionTimes.length /
          (1000 * 60 * 60)
        : 0;

    return {
      totalUsers: accounts.length,
      pendingOnboarding: pending.length,
      kycPending: kycPending.length,
      completed: completed.length,
      averageCompletionTime,
    };
  }
}

export const joseyAiOnboardingService = JoseyAiOnboardingService.getInstance();
