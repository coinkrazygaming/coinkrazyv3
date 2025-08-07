import { User } from '../types/auth';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'welcome' | 'verification' | 'bonus' | 'password_reset' | 'notification' | 'promotional';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailJob {
  id: string;
  templateId: string;
  to: string;
  variables: Record<string, any>;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  attempts: number;
  scheduledAt?: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export interface BonusInfo {
  goldCoins: number;
  sweepsCoins: number;
  description: string;
  expiresAt?: Date;
}

class EmailService {
  private smtpConfig: SMTPConfig | null = null;
  private templates: Map<string, EmailTemplate> = new Map();
  private emailQueue: EmailJob[] = [];

  constructor() {
    this.loadSMTPConfig();
    this.loadTemplates();
    this.initializeDefaultTemplates();
  }

  // SMTP Configuration Methods
  async loadSMTPConfig(): Promise<void> {
    try {
      const config = localStorage.getItem('smtp_config');
      if (config) {
        this.smtpConfig = JSON.parse(config);
      }
    } catch (error) {
      console.error('Failed to load SMTP config:', error);
    }
  }

  async saveSMTPConfig(config: SMTPConfig): Promise<void> {
    try {
      this.smtpConfig = config;
      localStorage.setItem('smtp_config', JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save SMTP config:', error);
      throw new Error('Failed to save SMTP configuration');
    }
  }

  getSMTPConfig(): SMTPConfig | null {
    return this.smtpConfig;
  }

  async testSMTPConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.smtpConfig) {
      return { success: false, message: 'No SMTP configuration found' };
    }

    try {
      // Simulate SMTP connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, message: `SMTP connection failed: ${error}` };
    }
  }

  // Template Management Methods
  private loadTemplates(): void {
    try {
      const templatesData = localStorage.getItem('email_templates');
      if (templatesData) {
        const templates = JSON.parse(templatesData);
        templates.forEach((template: EmailTemplate) => {
          this.templates.set(template.id, template);
        });
      }
    } catch (error) {
      console.error('Failed to load email templates:', error);
    }
  }

  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem('email_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save email templates:', error);
    }
  }

  private initializeDefaultTemplates(): void {
    if (this.templates.size === 0) {
      const defaultTemplates: EmailTemplate[] = [
        {
          id: 'welcome-bonus',
          name: 'Welcome Bonus Email',
          subject: 'Welcome to CoinKrazy! Your 10 GC + 10 SC Bonus Awaits! 🎉',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Welcome to CoinKrazy!</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
                .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
                .content { padding: 30px; }
                .bonus-box { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
                .bonus-amount { font-size: 24px; font-weight: bold; margin: 10px 0; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .social-links { margin: 15px 0; }
                .social-links a { margin: 0 10px; color: #6366f1; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">🎰 CoinKrazy</div>
                  <h1>Welcome to the Ultimate Gaming Experience!</h1>
                  <p>Where Fun Meets Fortune™</p>
                </div>
                
                <div class="content">
                  <h2>Hello {{firstName}}!</h2>
                  
                  <p>🎉 <strong>Congratulations!</strong> Your email has been verified and you're now officially part of the CoinKrazy family!</p>
                  
                  <div class="bonus-box">
                    <h3>🎁 Your Welcome Bonus is Ready!</h3>
                    <div class="bonus-amount">
                      10 Gold Coins + 10 Sweeps Coins
                    </div>
                    <p>{{bonusDescription}}</p>
                    <p><small>Bonus expires: {{bonusExpiry}}</small></p>
                  </div>
                  
                  <p>Your bonus has been automatically added to your account and is ready to use! Here's what you can do with your welcome bonus:</p>
                  
                  <ul>
                    <li><strong>🪙 Gold Coins:</strong> Play any of our 700+ slot games, table games, and more!</li>
                    <li><strong>⭐ Sweeps Coins:</strong> Win real cash prizes that can be redeemed for amazing rewards!</li>
                    <li><strong>🎯 Exclusive Access:</strong> Enjoy our premium games and tournaments!</li>
                  </ul>
                  
                  <div style="text-align: center;">
                    <a href="{{playNowLink}}" class="cta-button">Start Playing Now! 🚀</a>
                  </div>
                  
                  <h3>🌟 What Makes CoinKrazy Special?</h3>
                  <ul>
                    <li>✅ <strong>700+ Premium Games:</strong> Slots, Table Games, Live Poker, Bingo & More</li>
                    <li>✅ <strong>Daily Bonuses:</strong> Log in daily for free coins and exclusive offers</li>
                    <li>✅ <strong>Real Cash Prizes:</strong> Win actual money with Sweeps Coins</li>
                    <li>✅ <strong>24/7 Support:</strong> Our team is always here to help</li>
                    <li>✅ <strong>Secure & Legal:</strong> Licensed sweepstakes platform</li>
                  </ul>
                  
                  <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h4>📱 Quick Start Guide:</h4>
                    <ol>
                      <li>Click "Start Playing Now" to access your account</li>
                      <li>Your 10 GC + 10 SC bonus is already waiting for you</li>
                      <li>Choose from our featured games or explore categories</li>
                      <li>Start winning and have fun!</li>
                    </ol>
                  </div>
                  
                  <p>Need help getting started? Our AI assistant LuckyAI is available 24/7 on the website to guide you through everything!</p>
                  
                  <p>Welcome aboard, {{firstName}}! We're excited to have you as part of our gaming community.</p>
                  
                  <p>Happy Gaming!<br>
                  <strong>The CoinKrazy Team</strong></p>
                </div>
                
                <div class="footer">
                  <div class="social-links">
                    <a href="{{facebookLink}}">Facebook</a> |
                    <a href="{{twitterLink}}">Twitter</a> |
                    <a href="{{instagramLink}}">Instagram</a>
                  </div>
                  
                  <p>CoinKrazy - Where Fun Meets Fortune™</p>
                  <p>This email was sent to {{email}}. You're receiving this because you signed up for CoinKrazy.</p>
                  <p>
                    <a href="{{unsubscribeLink}}">Unsubscribe</a> |
                    <a href="{{privacyLink}}">Privacy Policy</a> |
                    <a href="{{termsLink}}">Terms of Service</a>
                  </p>
                  <p><small>© 2024 CoinKrazy. All rights reserved. 18+ Only. Play Responsibly.</small></p>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `Welcome to CoinKrazy, {{firstName}}!

🎉 Congratulations! Your email has been verified and you're now officially part of the CoinKrazy family!

🎁 YOUR WELCOME BONUS IS READY!
10 Gold Coins + 10 Sweeps Coins

{{bonusDescription}}
Bonus expires: {{bonusExpiry}}

Your bonus has been automatically added to your account and is ready to use!

What you can do with your welcome bonus:
• 🪙 Gold Coins: Play any of our 700+ slot games, table games, and more!
• ⭐ Sweeps Coins: Win real cash prizes that can be redeemed for amazing rewards!
• 🎯 Exclusive Access: Enjoy our premium games and tournaments!

Start playing now: {{playNowLink}}

🌟 What Makes CoinKrazy Special?
✅ 700+ Premium Games: Slots, Table Games, Live Poker, Bingo & More
✅ Daily Bonuses: Log in daily for free coins and exclusive offers
✅ Real Cash Prizes: Win actual money with Sweeps Coins
✅ 24/7 Support: Our team is always here to help
✅ Secure & Legal: Licensed sweepstakes platform

📱 Quick Start Guide:
1. Visit CoinKrazy website and log in
2. Your 10 GC + 10 SC bonus is already waiting for you
3. Choose from our featured games or explore categories
4. Start winning and have fun!

Need help? Our AI assistant LuckyAI is available 24/7 on the website!

Welcome aboard, {{firstName}}! We're excited to have you as part of our gaming community.

Happy Gaming!
The CoinKrazy Team

---
CoinKrazy - Where Fun Meets Fortune™
This email was sent to {{email}}.
© 2024 CoinKrazy. All rights reserved. 18+ Only. Play Responsibly.`,
          variables: ['firstName', 'email', 'bonusDescription', 'bonusExpiry', 'playNowLink', 'facebookLink', 'twitterLink', 'instagramLink', 'unsubscribeLink', 'privacyLink', 'termsLink'],
          category: 'welcome',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'email-verification',
          name: 'Email Verification',
          subject: 'Verify Your CoinKrazy Account - Almost Ready to Play! 🎰',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Verify Your Email</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .verify-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; font-size: 18px; }
                .code-box { background: #f8f9fa; border: 2px dashed #6366f1; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
                .verification-code { font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 5px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎰 CoinKrazy</h1>
                  <p>Almost there! Just one more step...</p>
                </div>
                
                <div class="content">
                  <h2>Hello {{firstName}}!</h2>
                  
                  <p>Welcome to CoinKrazy! We're excited to have you join our gaming community.</p>
                  
                  <p>To complete your registration and unlock your <strong>10 Gold Coins + 10 Sweeps Coins welcome bonus</strong>, please verify your email address by clicking the button below:</p>
                  
                  <div style="text-align: center;">
                    <a href="{{verificationLink}}" class="verify-button">Verify My Email 🚀</a>
                  </div>
                  
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;"><small>{{verificationLink}}</small></p>
                  
                  <div class="code-box">
                    <p><strong>Verification Code:</strong></p>
                    <div class="verification-code">{{verificationCode}}</div>
                    <p><small>Enter this code on the verification page if the link doesn't work</small></p>
                  </div>
                  
                  <p><strong>⏰ This verification link expires in 24 hours.</strong></p>
                  
                  <p>Once verified, you'll receive:</p>
                  <ul>
                    <li>🎁 <strong>10 Gold Coins</strong> - Play any of our 700+ games</li>
                    <li>⭐ <strong>10 Sweeps Coins</strong> - Win real cash prizes</li>
                    <li>🎯 Access to exclusive games and tournaments</li>
                    <li>📧 Daily bonus notifications and special offers</li>
                  </ul>
                  
                  <p>If you didn't create this account, please ignore this email.</p>
                  
                  <p>Questions? Contact our support team at support@coinfrazy.com</p>
                </div>
                
                <div class="footer">
                  <p>© 2024 CoinKrazy. All rights reserved. 18+ Only. Play Responsibly.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `Hello {{firstName}}!

Welcome to CoinKrazy! We're excited to have you join our gaming community.

To complete your registration and unlock your 10 Gold Coins + 10 Sweeps Coins welcome bonus, please verify your email address.

Verification Code: {{verificationCode}}

Or visit this link: {{verificationLink}}

⏰ This verification link expires in 24 hours.

Once verified, you'll receive:
• 🎁 10 Gold Coins - Play any of our 700+ games
• ⭐ 10 Sweeps Coins - Win real cash prizes
• 🎯 Access to exclusive games and tournaments
• 📧 Daily bonus notifications and special offers

If you didn't create this account, please ignore this email.

Questions? Contact our support team at support@coinfrazy.com

© 2024 CoinKrazy. All rights reserved. 18+ Only. Play Responsibly.`,
          variables: ['firstName', 'verificationLink', 'verificationCode'],
          category: 'verification',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'password-reset',
          name: 'Password Reset',
          subject: 'Reset Your CoinKrazy Password 🔐',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Reset Your Password</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .reset-button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎰 CoinKrazy</h1>
                  <p>Password Reset Request</p>
                </div>
                
                <div class="content">
                  <h2>Hello {{firstName}}!</h2>
                  
                  <p>We received a request to reset your password for your CoinKrazy account.</p>
                  
                  <div style="text-align: center;">
                    <a href="{{resetLink}}" class="reset-button">Reset My Password</a>
                  </div>
                  
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;"><small>{{resetLink}}</small></p>
                  
                  <p><strong>⏰ This reset link expires in 1 hour for security.</strong></p>
                  
                  <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
                  
                  <p>For security, this link can only be used once.</p>
                </div>
                
                <div class="footer">
                  <p>© 2024 CoinKrazy. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `Hello {{firstName}}!

We received a request to reset your password for your CoinKrazy account.

Reset your password: {{resetLink}}

⏰ This reset link expires in 1 hour for security.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

© 2024 CoinKrazy. All rights reserved.`,
          variables: ['firstName', 'resetLink'],
          category: 'password_reset',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'bonus-notification',
          name: 'Bonus Notification',
          subject: '🎁 New Bonus Available - {{bonusTitle}}',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>New Bonus Available</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: white; }
                .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .bonus-box { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
                .claim-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎰 CoinKrazy</h1>
                  <p>A new bonus is waiting for you!</p>
                </div>
                
                <div class="content">
                  <h2>Hello {{firstName}}!</h2>
                  
                  <div class="bonus-box">
                    <h3>🎁 {{bonusTitle}}</h3>
                    <p>{{bonusDescription}}</p>
                    <p><strong>Value: {{bonusValue}}</strong></p>
                    <p><small>Expires: {{bonusExpiry}}</small></p>
                  </div>
                  
                  <div style="text-align: center;">
                    <a href="{{claimLink}}" class="claim-button">Claim Bonus Now!</a>
                  </div>
                  
                  <p>Don't miss out on this amazing offer! Log in to your account to claim your bonus before it expires.</p>
                  
                  <p>Happy Gaming!<br>The CoinKrazy Team</p>
                </div>
                
                <div class="footer">
                  <p>© 2024 CoinKrazy. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          textContent: `Hello {{firstName}}!

🎁 {{bonusTitle}}

{{bonusDescription}}

Value: {{bonusValue}}
Expires: {{bonusExpiry}}

Claim your bonus: {{claimLink}}

Don't miss out on this amazing offer! Log in to your account to claim your bonus before it expires.

Happy Gaming!
The CoinKrazy Team

© 2024 CoinKrazy. All rights reserved.`,
          variables: ['firstName', 'bonusTitle', 'bonusDescription', 'bonusValue', 'bonusExpiry', 'claimLink'],
          category: 'bonus',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      defaultTemplates.forEach(template => {
        this.templates.set(template.id, template);
      });
      this.saveTemplates();
    }
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  async saveTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      ...template,
      id: template.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    this.saveTemplates();
    return newTemplate;
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const template = this.templates.get(id);
    if (!template) return null;

    const updatedTemplate: EmailTemplate = {
      ...template,
      ...updates,
      id: template.id,
      createdAt: template.createdAt,
      updatedAt: new Date(),
    };

    this.templates.set(id, updatedTemplate);
    this.saveTemplates();
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveTemplates();
    }
    return deleted;
  }

  // Email Sending Methods
  async sendWelcomeEmail(user: User, bonus: BonusInfo): Promise<boolean> {
    const template = this.getTemplate('welcome-bonus');
    if (!template) {
      throw new Error('Welcome email template not found');
    }

    const variables = {
      firstName: user.firstName || user.email.split('@')[0],
      email: user.email,
      bonusDescription: bonus.description,
      bonusExpiry: bonus.expiresAt ? bonus.expiresAt.toLocaleDateString() : 'Never',
      playNowLink: `${window.location.origin}/games`,
      facebookLink: 'https://facebook.com/coinfrazy',
      twitterLink: 'https://twitter.com/coinfrazy',
      instagramLink: 'https://instagram.com/coinfrazy',
      unsubscribeLink: `${window.location.origin}/unsubscribe?email=${encodeURIComponent(user.email)}`,
      privacyLink: `${window.location.origin}/privacy`,
      termsLink: `${window.location.origin}/terms`,
    };

    return this.sendEmail(template.id, user.email, variables);
  }

  async sendVerificationEmail(user: User, verificationCode: string, verificationLink: string): Promise<boolean> {
    const template = this.getTemplate('email-verification');
    if (!template) {
      throw new Error('Verification email template not found');
    }

    const variables = {
      firstName: user.firstName || user.email.split('@')[0],
      verificationCode,
      verificationLink,
    };

    return this.sendEmail(template.id, user.email, variables);
  }

  async sendPasswordResetEmail(user: User, resetLink: string): Promise<boolean> {
    const template = this.getTemplate('password-reset');
    if (!template) {
      throw new Error('Password reset email template not found');
    }

    const variables = {
      firstName: user.firstName || user.email.split('@')[0],
      resetLink,
    };

    return this.sendEmail(template.id, user.email, variables);
  }

  async sendBonusNotification(user: User, bonus: BonusInfo, bonusTitle: string, claimLink: string): Promise<boolean> {
    const template = this.getTemplate('bonus-notification');
    if (!template) {
      throw new Error('Bonus notification template not found');
    }

    const variables = {
      firstName: user.firstName || user.email.split('@')[0],
      bonusTitle,
      bonusDescription: bonus.description,
      bonusValue: `${bonus.goldCoins} GC + ${bonus.sweepsCoins} SC`,
      bonusExpiry: bonus.expiresAt ? bonus.expiresAt.toLocaleDateString() : 'Never',
      claimLink,
    };

    return this.sendEmail(template.id, user.email, variables);
  }

  async sendEmail(templateId: string, to: string, variables: Record<string, any>): Promise<boolean> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    if (!this.smtpConfig) {
      throw new Error('SMTP configuration not set');
    }

    const emailJob: EmailJob = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      to,
      variables,
      status: 'pending',
      attempts: 0,
    };

    this.emailQueue.push(emailJob);
    return this.processEmailJob(emailJob);
  }

  private async processEmailJob(job: EmailJob): Promise<boolean> {
    try {
      job.status = 'sending';
      job.attempts++;

      const template = this.getTemplate(job.templateId);
      if (!template) {
        throw new Error(`Template ${job.templateId} not found`);
      }

      // Replace variables in email content
      const htmlContent = this.replaceVariables(template.htmlContent, job.variables);
      const textContent = this.replaceVariables(template.textContent, job.variables);
      const subject = this.replaceVariables(template.subject, job.variables);

      // Simulate email sending (in production, this would use nodemailer or similar)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log email for debugging
      console.log('Email sent:', {
        to: job.to,
        subject,
        template: template.name,
        variables: job.variables,
      });

      job.status = 'sent';
      job.sentAt = new Date();
      return true;
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to send email:', error);
      return false;
    }
  }

  private replaceVariables(content: string, variables: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  // Email Queue Management
  getEmailQueue(): EmailJob[] {
    return [...this.emailQueue];
  }

  getEmailStats(): {
    total: number;
    sent: number;
    failed: number;
    pending: number;
  } {
    return {
      total: this.emailQueue.length,
      sent: this.emailQueue.filter(job => job.status === 'sent').length,
      failed: this.emailQueue.filter(job => job.status === 'failed').length,
      pending: this.emailQueue.filter(job => job.status === 'pending').length,
    };
  }

  async retryFailedEmails(): Promise<number> {
    const failedJobs = this.emailQueue.filter(job => job.status === 'failed' && job.attempts < 3);
    let retried = 0;

    for (const job of failedJobs) {
      job.status = 'pending';
      if (await this.processEmailJob(job)) {
        retried++;
      }
    }

    return retried;
  }
}

export const emailService = new EmailService();
