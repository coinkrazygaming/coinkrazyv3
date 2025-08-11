import { emailService } from './emailService';
import { balanceService } from './balanceService';
import { joseyAiOnboardingService } from './joseyAiOnboardingService';

export interface WelcomeEmailSequence {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: WelcomeEmailTrigger[];
  emails: WelcomeEmailStep[];
  metrics: {
    totalTriggered: number;
    totalCompleted: number;
    averageOpenRate: number;
    averageClickRate: number;
    conversionRate: number;
  };
}

export interface WelcomeEmailTrigger {
  type: 'user_registered' | 'email_verified' | 'first_deposit' | 'kyc_completed' | 'time_delay' | 'user_inactive';
  condition?: any;
  delayMinutes?: number;
}

export interface WelcomeEmailStep {
  id: string;
  sequenceId: string;
  stepNumber: number;
  name: string;
  templateId: string;
  trigger: WelcomeEmailTrigger;
  isActive: boolean;
  personalizations: {
    bonusAmount?: number;
    gameRecommendations?: string[];
    vipEligible?: boolean;
    customMessage?: string;
  };
  conditions?: {
    userRole?: string[];
    accountAge?: number; // days
    hasDeposited?: boolean;
    kycStatus?: string[];
    lastActivity?: number; // days ago
  };
}

export interface UserWelcomeJourney {
  userId: string;
  email: string;
  username: string;
  sequenceId: string;
  currentStep: number;
  startedAt: Date;
  completedAt?: Date;
  lastEmailSent?: Date;
  emailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  conversions: number;
  status: 'active' | 'completed' | 'paused' | 'failed';
  metadata: {
    userPreferences?: any;
    abTestGroup?: string;
    customData?: any;
  };
}

export interface EmailPersonalization {
  userId: string;
  bonusAmount: string;
  gameRecommendations: string[];
  userName: string;
  accountBalance: string;
  vipStatus: boolean;
  nextSteps: string[];
  supportContact: string;
  unsubscribeUrl: string;
  loginUrl: string;
  specialOffers: string[];
}

class WelcomeEmailAutomationService {
  private static instance: WelcomeEmailAutomationService;
  private sequences: Map<string, WelcomeEmailSequence> = new Map();
  private userJourneys: Map<string, UserWelcomeJourney> = new Map();
  private emailQueue: Array<{ userId: string; stepId: string; scheduledAt: Date }> = [];
  private listeners: Set<(event: string, data: any) => void> = new Set();

  static getInstance(): WelcomeEmailAutomationService {
    if (!WelcomeEmailAutomationService.instance) {
      WelcomeEmailAutomationService.instance = new WelcomeEmailAutomationService();
    }
    return WelcomeEmailAutomationService.instance;
  }

  constructor() {
    this.initializeDefaultSequences();
    this.startEmailProcessor();
    this.startJourneyMonitoring();
  }

  private initializeDefaultSequences() {
    const defaultSequences: WelcomeEmailSequence[] = [
      {
        id: 'standard_welcome',
        name: 'Standard Welcome Sequence',
        description: 'Complete onboarding sequence for new users',
        isActive: true,
        triggers: [{ type: 'user_registered' }],
        emails: [
          {
            id: 'welcome_immediate',
            sequenceId: 'standard_welcome',
            stepNumber: 1,
            name: 'Immediate Welcome Email',
            templateId: 'welcome_001',
            trigger: { type: 'user_registered' },
            isActive: true,
            personalizations: {
              bonusAmount: 50000,
              gameRecommendations: ['CoinKrazy Spinner', 'Lucky Scratch Gold', 'Bingo Hall'],
              vipEligible: false,
              customMessage: 'Welcome to the CoinKrazy family!'
            }
          },
          {
            id: 'verification_reminder',
            sequenceId: 'standard_welcome',
            stepNumber: 2,
            name: 'Email Verification Reminder',
            templateId: 'verification_reminder',
            trigger: { type: 'time_delay', delayMinutes: 60 },
            isActive: true,
            personalizations: {},
            conditions: { hasDeposited: false }
          },
          {
            id: 'getting_started',
            sequenceId: 'standard_welcome',
            stepNumber: 3,
            name: 'Getting Started Guide',
            templateId: 'getting_started',
            trigger: { type: 'email_verified' },
            isActive: true,
            personalizations: {
              gameRecommendations: ['CoinKrazy Spinner', 'Lucky Scratch Gold', 'Mary Had A Lil Cucumber']
            }
          },
          {
            id: 'first_week_check',
            sequenceId: 'standard_welcome',
            stepNumber: 4,
            name: 'First Week Check-in',
            templateId: 'first_week_checkin',
            trigger: { type: 'time_delay', delayMinutes: 10080 }, // 7 days
            isActive: true,
            personalizations: {
              bonusAmount: 25000
            },
            conditions: { accountAge: 7 }
          },
          {
            id: 'kyc_completion_bonus',
            sequenceId: 'standard_welcome',
            stepNumber: 5,
            name: 'KYC Completion Celebration',
            templateId: 'kyc_completed',
            trigger: { type: 'kyc_completed' },
            isActive: true,
            personalizations: {
              bonusAmount: 100000,
              vipEligible: true
            }
          }
        ],
        metrics: {
          totalTriggered: 0,
          totalCompleted: 0,
          averageOpenRate: 0,
          averageClickRate: 0,
          conversionRate: 0
        }
      },
      {
        id: 'vip_welcome',
        name: 'VIP Welcome Sequence',
        description: 'Enhanced welcome sequence for VIP users',
        isActive: true,
        triggers: [{ type: 'user_registered' }],
        emails: [
          {
            id: 'vip_welcome_immediate',
            sequenceId: 'vip_welcome',
            stepNumber: 1,
            name: 'VIP Welcome Email',
            templateId: 'vip_welcome',
            trigger: { type: 'user_registered' },
            isActive: true,
            personalizations: {
              bonusAmount: 250000,
              gameRecommendations: ['VIP Exclusive Slots', 'High Roller Poker', 'Diamond Bingo'],
              vipEligible: true,
              customMessage: 'Welcome to our exclusive VIP experience!'
            },
            conditions: { userRole: ['vip'] }
          },
          {
            id: 'vip_benefits_guide',
            sequenceId: 'vip_welcome',
            stepNumber: 2,
            name: 'VIP Benefits Guide',
            templateId: 'vip_benefits',
            trigger: { type: 'time_delay', delayMinutes: 30 },
            isActive: true,
            personalizations: {
              vipEligible: true
            },
            conditions: { userRole: ['vip'] }
          }
        ],
        metrics: {
          totalTriggered: 0,
          totalCompleted: 0,
          averageOpenRate: 0,
          averageClickRate: 0,
          conversionRate: 0
        }
      }
    ];

    defaultSequences.forEach(sequence => {
      this.sequences.set(sequence.id, sequence);
    });

    this.createEmailTemplates();
  }

  private createEmailTemplates() {
    // Create additional email templates for the welcome sequence
    const additionalTemplates = [
      {
        id: 'verification_reminder',
        name: 'Email Verification Reminder',
        subject: '⏰ Don\'t forget to verify your CoinKrazy account!',
        category: 'verification' as const,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Almost There!</h1>
              <p style="color: white; font-size: 16px; margin: 10px 0;">Your bonus is waiting!</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1f2937;">Hi {{username}},</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                You're just one click away from activating your account and claiming your welcome bonus!
              </p>
              
              <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">🎁 Still Waiting For You</h3>
                <p style="font-size: 20px; font-weight: bold; color: #92400e; margin: 0;">50,000 Gold Coins + 25 Sweeps Coins</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{verification_url}}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  ✨ Verify My Account
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                This verification link expires in 24 hours.
              </p>
            </div>
          </div>
        `,
        textContent: `Hi {{username}}, don't forget to verify your CoinKrazy account! Your 50,000 GC + 25 SC bonus is waiting. Verify now: {{verification_url}}`,
        variables: ['username', 'verification_url']
      },
      {
        id: 'getting_started',
        name: 'Getting Started Guide',
        subject: '�� Your CoinKrazy adventure begins now! Here\'s your roadmap',
        category: 'welcome' as const,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎰 Ready to Play!</h1>
              <p style="color: white; font-size: 18px; margin: 10px 0;">Your adventure starts here</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1f2937;">Great job verifying your email, {{username}}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Now that your account is verified, let's get you started with the best CoinKrazy has to offer:
              </p>
              
              <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0;">
                <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">🎯 Your Next Steps:</h3>
                <ol style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;"><strong>Try our signature games:</strong> CoinKrazy Spinner, Lucky Scratch Gold</li>
                  <li style="margin-bottom: 8px;"><strong>Join the Bingo Hall:</strong> Win real prizes every hour</li>
                  <li style="margin-bottom: 8px;"><strong>Complete your profile:</strong> Unlock exclusive bonuses</li>
                  <li style="margin-bottom: 8px;"><strong>Verify your identity:</strong> Enable instant withdrawals</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{login_url}}" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🚀 Start Playing Now
                </a>
              </div>
              
              <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="color: #92400e; margin: 0; font-weight: bold;">💡 Pro Tip: Complete KYC verification to unlock instant withdrawals!</p>
              </div>
            </div>
          </div>
        `,
        textContent: `Hi {{username}}! Ready to play? Try our signature games: CoinKrazy Spinner, Lucky Scratch Gold. Join Bingo Hall for hourly prizes. Complete KYC for instant withdrawals. Start now: {{login_url}}`,
        variables: ['username', 'login_url']
      },
      {
        id: 'first_week_checkin',
        name: 'First Week Check-in',
        subject: '🎉 One week strong! Here\'s a bonus for your loyalty',
        category: 'marketing' as const,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 One Week Anniversary!</h1>
              <p style="color: white; font-size: 18px; margin: 10px 0;">You're crushing it!</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1f2937;">Hi {{username}},</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                It's been a week since you joined CoinKrazy, and we wanted to celebrate with you! Here's what you've accomplished:
              </p>
              
              <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #166534; margin: 0 0 15px 0;">📊 Your Week in Numbers:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #166534;">
                  <div>🎰 Games Played: <strong>{{games_played}}</strong></div>
                  <div>⏰ Time Played: <strong>{{time_played}}</strong></div>
                  <div>🏆 Biggest Win: <strong>{{biggest_win}}</strong></div>
                  <div>🎯 Favorite Game: <strong>{{favorite_game}}</strong></div>
                </div>
              </div>
              
              <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #92400e; margin: 0 0 10px 0;">🎁 Week 1 Loyalty Bonus</h3>
                <p style="font-size: 24px; font-weight: bold; color: #92400e; margin: 0;">25,000 Gold Coins</p>
                <p style="color: #92400e; margin: 5px 0 0 0;">For being an awesome player!</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{claim_bonus_url}}" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  🎁 Claim Your Bonus
                </a>
              </div>
            </div>
          </div>
        `,
        textContent: `Hi {{username}}! One week with CoinKrazy! Here's your loyalty bonus: 25,000 Gold Coins. Games played: {{games_played}}, Biggest win: {{biggest_win}}. Claim now: {{claim_bonus_url}}`,
        variables: ['username', 'games_played', 'time_played', 'biggest_win', 'favorite_game', 'claim_bonus_url']
      },
      {
        id: 'kyc_completed',
        name: 'KYC Completion Celebration',
        subject: '🎊 Congratulations! Full access unlocked + Mega Bonus!',
        category: 'transactional' as const,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎊 Congratulations!</h1>
              <p style="color: white; font-size: 18px; margin: 10px 0;">You're now fully verified!</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1f2937;">Amazing news, {{username}}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Your identity verification is complete! You now have full access to all CoinKrazy features, including instant withdrawals.
              </p>
              
              <div style="background: #f3e8ff; border: 2px solid #8b5cf6; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
                <h3 style="color: #6b46c1; margin: 0 0 10px 0;">🎁 KYC Completion Mega Bonus</h3>
                <p style="font-size: 32px; font-weight: bold; color: #6b46c1; margin: 0;">100,000 GC</p>
                <p style="color: #6b46c1; margin: 5px 0 0 0;">+ VIP Benefits Unlocked!</p>
              </div>
              
              <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin: 20px 0;">
                <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">🔓 Now Unlocked:</h3>
                <ul style="color: #0c4a6e; margin: 0; padding-left: 20px;">
                  <li>⚡ Instant withdrawals (no waiting!)</li>
                  <li>🎰 Premium exclusive games</li>
                  <li>💎 VIP customer support</li>
                  <li>🎁 Enhanced daily bonuses</li>
                  <li>🏆 Tournament access</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{dashboard_url}}" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  💎 Access VIP Dashboard
                </a>
              </div>
            </div>
          </div>
        `,
        textContent: `Congratulations {{username}}! KYC verification complete. You now have instant withdrawals, VIP support, and premium games. Mega bonus: 100,000 GC + VIP benefits! Access now: {{dashboard_url}}`,
        variables: ['username', 'dashboard_url']
      }
    ];

    // Register these templates with the email service
    // Note: In a real implementation, these would be stored in the email service
    console.log('Additional email templates created:', additionalTemplates.length);
  }

  private startEmailProcessor() {
    // Process email queue every minute
    setInterval(() => {
      this.processEmailQueue();
    }, 60 * 1000);
  }

  private startJourneyMonitoring() {
    // Monitor user journeys and trigger next steps
    setInterval(() => {
      this.monitorUserJourneys();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private processEmailQueue() {
    const now = new Date();
    const readyEmails = this.emailQueue.filter(item => item.scheduledAt <= now);

    readyEmails.forEach(async (emailItem) => {
      const journey = this.userJourneys.get(emailItem.userId);
      if (!journey) return;

      const sequence = this.sequences.get(journey.sequenceId);
      if (!sequence) return;

      const step = sequence.emails.find(email => email.id === emailItem.stepId);
      if (!step) return;

      const success = await this.sendWelcomeEmail(journey, step);
      
      if (success) {
        // Remove from queue
        this.emailQueue = this.emailQueue.filter(item => 
          item.userId !== emailItem.userId || item.stepId !== emailItem.stepId
        );

        // Update journey
        journey.lastEmailSent = now;
        journey.emailsSent++;
        journey.currentStep = Math.max(journey.currentStep, step.stepNumber);

        // Schedule next email if conditions are met
        this.scheduleNextEmail(journey);

        this.notifyListeners('email_sent', { journey, step });
      }
    });
  }

  private monitorUserJourneys() {
    this.userJourneys.forEach(journey => {
      if (journey.status !== 'active') return;

      const sequence = this.sequences.get(journey.sequenceId);
      if (!sequence) return;

      // Check for time-based triggers
      const nextSteps = sequence.emails.filter(email => 
        email.stepNumber > journey.currentStep &&
        email.trigger.type === 'time_delay' &&
        this.checkStepConditions(journey, email)
      );

      nextSteps.forEach(step => {
        if (step.trigger.delayMinutes) {
          const triggerTime = new Date(
            (journey.lastEmailSent || journey.startedAt).getTime() + 
            step.trigger.delayMinutes * 60 * 1000
          );

          if (new Date() >= triggerTime) {
            this.scheduleEmail(journey.userId, step.id, new Date());
          }
        }
      });

      // Check for inactivity
      const daysSinceLastActivity = Math.floor(
        (Date.now() - (journey.lastEmailSent || journey.startedAt).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastActivity > 7 && journey.emailsSent > 0) {
        // Trigger re-engagement email
        this.triggerReEngagementEmail(journey);
      }
    });
  }

  private async sendWelcomeEmail(journey: UserWelcomeJourney, step: WelcomeEmailStep): Promise<boolean> {
    try {
      const personalization = await this.generatePersonalization(journey, step);
      
      // Use the email service to send the email
      const success = await emailService.sendWelcomeEmail(
        journey.userId,
        journey.email,
        journey.username
      );

      if (success) {
        // Update metrics
        const sequence = this.sequences.get(journey.sequenceId);
        if (sequence) {
          sequence.metrics.totalTriggered++;
        }
      }

      return success;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  private async generatePersonalization(journey: UserWelcomeJourney, step: WelcomeEmailStep): Promise<EmailPersonalization> {
    // Get user's current balance and activity
    const userBalance = balanceService.getUserBalance(journey.email);
    
    return {
      userId: journey.userId,
      bonusAmount: step.personalizations.bonusAmount?.toLocaleString() || '50,000',
      gameRecommendations: step.personalizations.gameRecommendations || ['CoinKrazy Spinner', 'Lucky Scratch Gold'],
      userName: journey.username,
      accountBalance: `${userBalance.goldCoins.toLocaleString()} GC, ${userBalance.sweepsCoins.toFixed(2)} SC`,
      vipStatus: step.personalizations.vipEligible || false,
      nextSteps: this.generateNextSteps(journey, step),
      supportContact: 'support@coinkrazy.com',
      unsubscribeUrl: `https://coinkrazy.com/unsubscribe?user=${journey.userId}`,
      loginUrl: 'https://coinkrazy.com/dashboard',
      specialOffers: this.generateSpecialOffers(journey, step)
    };
  }

  private generateNextSteps(journey: UserWelcomeJourney, step: WelcomeEmailStep): string[] {
    const steps = [
      'Explore our 700+ premium slot games',
      'Join live poker tables with real players',
      'Play bingo for hourly prize draws'
    ];

    // Add personalized steps based on user progress
    const onboardingAccount = joseyAiOnboardingService.getUserAccount(journey.userId);
    if (onboardingAccount) {
      if (!onboardingAccount.flags.educationCompleted) {
        steps.unshift('Complete your platform education for bonus rewards');
      }
      if (onboardingAccount.kycStatus === 'not_started') {
        steps.push('Complete KYC verification to unlock instant withdrawals');
      }
    }

    return steps;
  }

  private generateSpecialOffers(journey: UserWelcomeJourney, step: WelcomeEmailStep): string[] {
    const offers = [];
    
    if (step.personalizations.bonusAmount) {
      offers.push(`${step.personalizations.bonusAmount.toLocaleString()} Gold Coins Welcome Bonus`);
    }

    if (step.personalizations.vipEligible) {
      offers.push('VIP Access with Enhanced Benefits');
      offers.push('Priority Customer Support');
    }

    offers.push('Daily Login Bonuses');
    offers.push('Refer Friends for Massive Rewards');

    return offers;
  }

  private checkStepConditions(journey: UserWelcomeJourney, step: WelcomeEmailStep): boolean {
    if (!step.conditions) return true;

    const conditions = step.conditions;
    
    // Check account age
    if (conditions.accountAge) {
      const accountAgedays = Math.floor(
        (Date.now() - journey.startedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (accountAgedays < conditions.accountAge) return false;
    }

    // Check KYC status
    if (conditions.kycStatus) {
      const onboardingAccount = joseyAiOnboardingService.getUserAccount(journey.userId);
      if (onboardingAccount && !conditions.kycStatus.includes(onboardingAccount.kycStatus)) {
        return false;
      }
    }

    // Check deposit status
    if (conditions.hasDeposited !== undefined) {
      const userBalance = balanceService.getUserBalance(journey.email);
      const hasDeposited = userBalance.totalDeposited > 0;
      if (hasDeposited !== conditions.hasDeposited) return false;
    }

    return true;
  }

  private scheduleEmail(userId: string, stepId: string, scheduledAt: Date) {
    // Avoid duplicate scheduling
    const exists = this.emailQueue.some(item => 
      item.userId === userId && item.stepId === stepId
    );

    if (!exists) {
      this.emailQueue.push({ userId, stepId, scheduledAt });
      this.notifyListeners('email_scheduled', { userId, stepId, scheduledAt });
    }
  }

  private scheduleNextEmail(journey: UserWelcomeJourney) {
    const sequence = this.sequences.get(journey.sequenceId);
    if (!sequence) return;

    const nextSteps = sequence.emails.filter(email => 
      email.stepNumber > journey.currentStep &&
      email.isActive &&
      this.checkStepConditions(journey, email)
    );

    const immediateSteps = nextSteps.filter(step => 
      step.trigger.type !== 'time_delay' || !step.trigger.delayMinutes
    );

    // Schedule immediate steps
    immediateSteps.forEach(step => {
      this.scheduleEmail(journey.userId, step.id, new Date());
    });
  }

  private triggerReEngagementEmail(journey: UserWelcomeJourney) {
    // Create a special re-engagement email
    const reEngagementStep: WelcomeEmailStep = {
      id: 'reengagement_' + Date.now(),
      sequenceId: journey.sequenceId,
      stepNumber: 999, // High number to indicate special step
      name: 'Re-engagement Email',
      templateId: 'reengagement_001',
      trigger: { type: 'user_inactive' },
      isActive: true,
      personalizations: {
        bonusAmount: 75000,
        gameRecommendations: ['Featured Game of the Week'],
        customMessage: "We miss you! Come back for an exclusive bonus."
      }
    };

    this.scheduleEmail(journey.userId, reEngagementStep.id, new Date());
  }

  // Public API Methods

  startWelcomeSequence(userId: string, email: string, username: string, sequenceId: string = 'standard_welcome'): boolean {
    // Don't restart if already active
    if (this.userJourneys.has(userId) && this.userJourneys.get(userId)?.status === 'active') {
      return false;
    }

    const sequence = this.sequences.get(sequenceId);
    if (!sequence || !sequence.isActive) return false;

    const journey: UserWelcomeJourney = {
      userId,
      email,
      username,
      sequenceId,
      currentStep: 0,
      startedAt: new Date(),
      emailsSent: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      conversions: 0,
      status: 'active',
      metadata: {}
    };

    this.userJourneys.set(userId, journey);

    // Trigger immediate emails
    const immediateSteps = sequence.emails.filter(email => 
      email.trigger.type === 'user_registered' && 
      email.isActive &&
      this.checkStepConditions(journey, email)
    );

    immediateSteps.forEach(step => {
      this.scheduleEmail(userId, step.id, new Date());
    });

    this.notifyListeners('journey_started', journey);
    return true;
  }

  triggerEmailByEvent(userId: string, eventType: WelcomeEmailTrigger['type'], eventData?: any): boolean {
    const journey = this.userJourneys.get(userId);
    if (!journey || journey.status !== 'active') return false;

    const sequence = this.sequences.get(journey.sequenceId);
    if (!sequence) return false;

    const triggeredSteps = sequence.emails.filter(email => 
      email.trigger.type === eventType &&
      email.stepNumber > journey.currentStep &&
      email.isActive &&
      this.checkStepConditions(journey, email)
    );

    triggeredSteps.forEach(step => {
      if (step.trigger.delayMinutes) {
        const scheduledAt = new Date(Date.now() + step.trigger.delayMinutes * 60 * 1000);
        this.scheduleEmail(userId, step.id, scheduledAt);
      } else {
        this.scheduleEmail(userId, step.id, new Date());
      }
    });

    this.notifyListeners('event_triggered', { userId, eventType, eventData, triggeredSteps });
    return triggeredSteps.length > 0;
  }

  pauseUserJourney(userId: string): boolean {
    const journey = this.userJourneys.get(userId);
    if (!journey) return false;

    journey.status = 'paused';
    this.notifyListeners('journey_paused', journey);
    return true;
  }

  resumeUserJourney(userId: string): boolean {
    const journey = this.userJourneys.get(userId);
    if (!journey) return false;

    journey.status = 'active';
    this.scheduleNextEmail(journey);
    this.notifyListeners('journey_resumed', journey);
    return true;
  }

  completeUserJourney(userId: string): boolean {
    const journey = this.userJourneys.get(userId);
    if (!journey) return false;

    journey.status = 'completed';
    journey.completedAt = new Date();

    const sequence = this.sequences.get(journey.sequenceId);
    if (sequence) {
      sequence.metrics.totalCompleted++;
      sequence.metrics.conversionRate = sequence.metrics.totalCompleted / Math.max(sequence.metrics.totalTriggered, 1);
    }

    this.notifyListeners('journey_completed', journey);
    return true;
  }

  getUserJourney(userId: string): UserWelcomeJourney | undefined {
    return this.userJourneys.get(userId);
  }

  getAllSequences(): WelcomeEmailSequence[] {
    return Array.from(this.sequences.values());
  }

  getSequenceMetrics(sequenceId: string) {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return null;

    const journeys = Array.from(this.userJourneys.values()).filter(j => j.sequenceId === sequenceId);
    
    return {
      ...sequence.metrics,
      activeJourneys: journeys.filter(j => j.status === 'active').length,
      totalJourneys: journeys.length,
      averageCompletionTime: this.calculateAverageCompletionTime(journeys),
      stepAnalysis: this.analyzeStepPerformance(sequence, journeys)
    };
  }

  private calculateAverageCompletionTime(journeys: UserWelcomeJourney[]): number {
    const completedJourneys = journeys.filter(j => j.completedAt);
    if (completedJourneys.length === 0) return 0;

    const totalTime = completedJourneys.reduce((sum, journey) => {
      return sum + (journey.completedAt!.getTime() - journey.startedAt.getTime());
    }, 0);

    return totalTime / completedJourneys.length / (1000 * 60 * 60 * 24); // Convert to days
  }

  private analyzeStepPerformance(sequence: WelcomeEmailSequence, journeys: UserWelcomeJourney[]) {
    return sequence.emails.map(step => {
      const stepJourneys = journeys.filter(j => j.currentStep >= step.stepNumber);
      return {
        stepId: step.id,
        stepName: step.name,
        reached: stepJourneys.length,
        completed: stepJourneys.filter(j => j.currentStep > step.stepNumber).length,
        completionRate: stepJourneys.length > 0 ? 
          stepJourneys.filter(j => j.currentStep > step.stepNumber).length / stepJourneys.length : 0
      };
    });
  }

  // Admin methods
  createSequence(sequence: Omit<WelcomeEmailSequence, 'metrics'>): boolean {
    const fullSequence: WelcomeEmailSequence = {
      ...sequence,
      metrics: {
        totalTriggered: 0,
        totalCompleted: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        conversionRate: 0
      }
    };

    this.sequences.set(sequence.id, fullSequence);
    this.notifyListeners('sequence_created', fullSequence);
    return true;
  }

  updateSequence(sequenceId: string, updates: Partial<WelcomeEmailSequence>): boolean {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return false;

    Object.assign(sequence, updates);
    this.notifyListeners('sequence_updated', sequence);
    return true;
  }

  deleteSequence(sequenceId: string): boolean {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) return false;

    // Pause all active journeys for this sequence
    Array.from(this.userJourneys.values())
      .filter(j => j.sequenceId === sequenceId && j.status === 'active')
      .forEach(j => j.status = 'paused');

    this.sequences.delete(sequenceId);
    this.notifyListeners('sequence_deleted', { sequenceId });
    return true;
  }

  // Event system
  subscribe(callback: (event: string, data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.forEach(callback => callback(event, data));
  }

  // Testing and debugging methods
  simulateEmailOpen(userId: string, emailId: string): void {
    const journey = this.userJourneys.get(userId);
    if (journey) {
      journey.emailsOpened++;
      this.notifyListeners('email_opened', { userId, emailId });
    }
  }

  simulateEmailClick(userId: string, emailId: string): void {
    const journey = this.userJourneys.get(userId);
    if (journey) {
      journey.emailsClicked++;
      this.notifyListeners('email_clicked', { userId, emailId });
    }
  }

  getEmailQueue(): Array<{ userId: string; stepId: string; scheduledAt: Date }> {
    return [...this.emailQueue];
  }

  clearEmailQueue(): void {
    this.emailQueue = [];
    this.notifyListeners('queue_cleared', {});
  }
}

export const welcomeEmailAutomationService = WelcomeEmailAutomationService.getInstance();
