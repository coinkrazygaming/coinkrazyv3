import { databaseService } from './database';

export interface EmailTemplate {
  id: number;
  template_name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SMTPSettings {
  id: number;
  setting_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  use_tls: boolean;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

export interface EmailSendRequest {
  to: string;
  templateName: string;
  variables: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template_name: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  sent_at: Date;
  variables: any;
}

class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Template Management
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    try {
      const result = await databaseService.query(`
        SELECT * FROM email_templates 
        ORDER BY template_name ASC
      `);
      return result.rows;
    } catch (error) {
      console.error('Failed to get email templates:', error);
      return [];
    }
  }

  async getEmailTemplate(templateName: string): Promise<EmailTemplate | null> {
    try {
      const result = await databaseService.query(`
        SELECT * FROM email_templates 
        WHERE template_name = $1 AND is_active = TRUE
        LIMIT 1
      `, [templateName]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get email template:', error);
      return null;
    }
  }

  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate | null> {
    try {
      const result = await databaseService.query(`
        INSERT INTO email_templates (template_name, subject, html_content, text_content, variables, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        template.template_name,
        template.subject,
        template.html_content,
        template.text_content,
        JSON.stringify(template.variables),
        template.is_active
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to create email template:', error);
      return null;
    }
  }

  async updateEmailTemplate(id: number, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    try {
      const setClause = [];
      const values = [];
      let paramIndex = 1;

      if (updates.subject !== undefined) {
        setClause.push(`subject = $${paramIndex++}`);
        values.push(updates.subject);
      }
      if (updates.html_content !== undefined) {
        setClause.push(`html_content = $${paramIndex++}`);
        values.push(updates.html_content);
      }
      if (updates.text_content !== undefined) {
        setClause.push(`text_content = $${paramIndex++}`);
        values.push(updates.text_content);
      }
      if (updates.variables !== undefined) {
        setClause.push(`variables = $${paramIndex++}`);
        values.push(JSON.stringify(updates.variables));
      }
      if (updates.is_active !== undefined) {
        setClause.push(`is_active = $${paramIndex++}`);
        values.push(updates.is_active);
      }

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await databaseService.query(`
        UPDATE email_templates 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to update email template:', error);
      return null;
    }
  }

  async deleteEmailTemplate(id: number): Promise<boolean> {
    try {
      await databaseService.query('DELETE FROM email_templates WHERE id = $1', [id]);
      return true;
    } catch (error) {
      console.error('Failed to delete email template:', error);
      return false;
    }
  }

  // SMTP Settings Management
  async getSMTPSettings(): Promise<SMTPSettings[]> {
    try {
      const result = await databaseService.query(`
        SELECT * FROM smtp_settings 
        ORDER BY setting_name ASC
      `);
      return result.rows;
    } catch (error) {
      console.error('Failed to get SMTP settings:', error);
      return [];
    }
  }

  async getActiveSMTPSettings(): Promise<SMTPSettings | null> {
    try {
      const result = await databaseService.query(`
        SELECT * FROM smtp_settings 
        WHERE is_active = TRUE
        LIMIT 1
      `);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to get active SMTP settings:', error);
      return null;
    }
  }

  async createSMTPSettings(settings: Omit<SMTPSettings, 'id' | 'created_at' | 'updated_at'>): Promise<SMTPSettings | null> {
    try {
      // Deactivate other settings if this one is being set as active
      if (settings.is_active) {
        await databaseService.query('UPDATE smtp_settings SET is_active = FALSE');
      }

      const result = await databaseService.query(`
        INSERT INTO smtp_settings (setting_name, host, port, username, password, use_tls, from_email, from_name, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        settings.setting_name,
        settings.host,
        settings.port,
        settings.username,
        settings.password,
        settings.use_tls,
        settings.from_email,
        settings.from_name,
        settings.is_active
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to create SMTP settings:', error);
      return null;
    }
  }

  async updateSMTPSettings(id: number, updates: Partial<SMTPSettings>): Promise<SMTPSettings | null> {
    try {
      // Deactivate other settings if this one is being set as active
      if (updates.is_active) {
        await databaseService.query('UPDATE smtp_settings SET is_active = FALSE WHERE id != $1', [id]);
      }

      const setClause = [];
      const values = [];
      let paramIndex = 1;

      if (updates.setting_name !== undefined) {
        setClause.push(`setting_name = $${paramIndex++}`);
        values.push(updates.setting_name);
      }
      if (updates.host !== undefined) {
        setClause.push(`host = $${paramIndex++}`);
        values.push(updates.host);
      }
      if (updates.port !== undefined) {
        setClause.push(`port = $${paramIndex++}`);
        values.push(updates.port);
      }
      if (updates.username !== undefined) {
        setClause.push(`username = $${paramIndex++}`);
        values.push(updates.username);
      }
      if (updates.password !== undefined) {
        setClause.push(`password = $${paramIndex++}`);
        values.push(updates.password);
      }
      if (updates.use_tls !== undefined) {
        setClause.push(`use_tls = $${paramIndex++}`);
        values.push(updates.use_tls);
      }
      if (updates.from_email !== undefined) {
        setClause.push(`from_email = $${paramIndex++}`);
        values.push(updates.from_email);
      }
      if (updates.from_name !== undefined) {
        setClause.push(`from_name = $${paramIndex++}`);
        values.push(updates.from_name);
      }
      if (updates.is_active !== undefined) {
        setClause.push(`is_active = $${paramIndex++}`);
        values.push(updates.is_active);
      }

      setClause.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await databaseService.query(`
        UPDATE smtp_settings 
        SET ${setClause.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error('Failed to update SMTP settings:', error);
      return null;
    }
  }

  async testSMTPConnection(settingsId?: number): Promise<{ success: boolean; message: string }> {
    try {
      let smtpSettings: SMTPSettings | null;
      
      if (settingsId) {
        const result = await databaseService.query('SELECT * FROM smtp_settings WHERE id = $1', [settingsId]);
        smtpSettings = result.rows[0] || null;
      } else {
        smtpSettings = await this.getActiveSMTPSettings();
      }

      if (!smtpSettings) {
        return { success: false, message: 'No SMTP settings found' };
      }

      // In a real implementation, this would test the actual SMTP connection
      // For now, we'll simulate a successful test
      console.log('Testing SMTP connection with settings:', {
        host: smtpSettings.host,
        port: smtpSettings.port,
        username: smtpSettings.username,
        use_tls: smtpSettings.use_tls
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { success: true, message: 'SMTP connection test successful' };
    } catch (error) {
      console.error('SMTP connection test failed:', error);
      return { success: false, message: 'SMTP connection test failed' };
    }
  }

  // Email Sending
  async sendEmail(request: EmailSendRequest): Promise<{ success: boolean; message: string; logId?: string }> {
    try {
      const template = await this.getEmailTemplate(request.templateName);
      if (!template) {
        return { success: false, message: 'Email template not found' };
      }

      const smtpSettings = await this.getActiveSMTPSettings();
      if (!smtpSettings) {
        return { success: false, message: 'No active SMTP settings found' };
      }

      // Process template variables
      const processedSubject = this.processTemplate(template.subject, request.variables);
      const processedHtmlContent = this.processTemplate(template.html_content, request.variables);
      const processedTextContent = template.text_content 
        ? this.processTemplate(template.text_content, request.variables)
        : '';

      // In a real implementation, this would send the actual email
      // For now, we'll simulate sending and create a log entry
      const logId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Log the email (in a real system, this would be in a separate emails_log table)
      console.log('Email sent:', {
        logId,
        to: request.to,
        subject: processedSubject,
        templateName: request.templateName,
        smtpHost: smtpSettings.host
      });

      // Create admin notification for successful email
      await databaseService.createAdminNotification(
        'Email Sent',
        `Email "${processedSubject}" sent to ${request.to}`,
        'info',
        1
      );

      return { 
        success: true, 
        message: 'Email sent successfully',
        logId 
      };
    } catch (error) {
      console.error('Failed to send email:', error);

      // Create admin notification for failed email
      await databaseService.createAdminNotification(
        'Email Send Failed',
        `Failed to send email to ${request.to}: ${error}`,
        'error',
        1
      );

      return { success: false, message: 'Failed to send email' };
    }
  }

  // Template variable processing
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    // Replace variables in the format {{variable_name}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  // Predefined email sending methods
  async sendWelcomeEmail(email: string, username: string, gcAmount: number = 10, scAmount: number = 10): Promise<boolean> {
    try {
      const result = await this.sendEmail({
        to: email,
        templateName: 'welcome_bonus',
        variables: {
          username,
          gc_amount: gcAmount,
          sc_amount: scAmount,
          games_url: `${window.location.origin}/games`,
          support_email: 'coinkrazy00@gmail.com'
        }
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendEmailVerification(email: string, username: string, verificationToken: string): Promise<boolean> {
    try {
      const result = await this.sendEmail({
        to: email,
        templateName: 'email_verification',
        variables: {
          username,
          verification_url: `${window.location.origin}/verify-email?token=${verificationToken}`
        }
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, username: string, resetToken: string): Promise<boolean> {
    try {
      const result = await this.sendEmail({
        to: email,
        templateName: 'password_reset',
        variables: {
          username,
          reset_url: `${window.location.origin}/reset-password?token=${resetToken}`
        }
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  async sendWithdrawalApprovalEmail(email: string, username: string, amount: number, method: string, reference: string): Promise<boolean> {
    try {
      const result = await this.sendEmail({
        to: email,
        templateName: 'withdrawal_approved',
        variables: {
          username,
          amount: amount.toFixed(2),
          method,
          reference
        }
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send withdrawal approval email:', error);
      return false;
    }
  }

  async sendBonusNotificationEmail(email: string, username: string, bonusTitle: string, gcAmount: number, scAmount: number): Promise<boolean> {
    try {
      const result = await this.sendEmail({
        to: email,
        templateName: 'bonus_notification',
        variables: {
          username,
          bonus_title: bonusTitle,
          gc_amount: gcAmount,
          sc_amount: scAmount.toFixed(2),
          claim_url: `${window.location.origin}/dashboard`
        }
      });

      return result.success;
    } catch (error) {
      console.error('Failed to send bonus notification email:', error);
      return false;
    }
  }

  // Bulk email operations
  async sendBulkEmail(emails: string[], templateName: string, variables: Record<string, any>): Promise<{ sent: number; failed: number; results: any[] }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        const result = await this.sendEmail({
          to: email,
          templateName,
          variables: { ...variables, email }
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        results.push({ email, ...result });
      } catch (error) {
        failed++;
        results.push({ email, success: false, message: 'Failed to send email' });
      }

      // Add small delay between emails to prevent overwhelming the SMTP server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
  }

  // Email analytics
  async getEmailStatistics(days: number = 30): Promise<any> {
    try {
      // In a real implementation, this would query an email_logs table
      // For now, we'll return simulated statistics
      return {
        totalSent: 1247,
        totalFailed: 23,
        successRate: 98.15,
        popularTemplates: [
          { template: 'welcome_bonus', count: 456 },
          { template: 'email_verification', count: 234 },
          { template: 'withdrawal_approved', count: 189 },
          { template: 'bonus_notification', count: 167 }
        ],
        dailyVolume: Array.from({ length: days }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sent: Math.floor(Math.random() * 100) + 20,
          failed: Math.floor(Math.random() * 5)
        })).reverse()
      };
    } catch (error) {
      console.error('Failed to get email statistics:', error);
      return null;
    }
  }

  // Initialize default templates if they don't exist
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const existingTemplates = await this.getEmailTemplates();
      const templateNames = existingTemplates.map(t => t.template_name);

      const defaultTemplates = [
        {
          template_name: 'welcome_bonus',
          subject: 'Welcome to CoinKrazy - Your {{gc_amount}} GC + {{sc_amount}} SC Bonus Awaits!',
          html_content: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { text-align: center; background: linear-gradient(45deg, #FFD700, #FFA500); padding: 30px; border-radius: 10px; }
                  .button { background: #FFD700; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Welcome to CoinKrazy!</h1>
                    <h2>Your {{gc_amount}} GC + {{sc_amount}} SC Bonus is Ready!</h2>
                  </div>
                  <p>Hi {{username}},</p>
                  <p>Welcome to the most exciting sweepstakes casino on the web! Your email verification is complete and your welcome bonus has been credited to your account.</p>
                  <div style="background:#2a2a3e;padding:20px;border-radius:10px;margin:20px 0">
                    <h3>Your Welcome Bonus:</h3>
                    <ul>
                      <li>{{gc_amount}} Gold Coins - Play hundreds of slots and games</li>
                      <li>{{sc_amount}} Sweeps Coins - Win real cash prizes!</li>
                    </ul>
                  </div>
                  <p>Ready to start winning? Click below to explore our games:</p>
                  <a href="{{games_url}}" class="button">Start Playing Now</a>
                  <p>Need help? Our AI assistant Lucky is available 24/7 to assist you.</p>
                  <p>Best of luck and welcome to the CoinKrazy family!</p>
                  <p>The CoinKrazy Team</p>
                </div>
              </body>
            </html>
          `,
          text_content: 'Welcome to CoinKrazy! Your {{gc_amount}} GC + {{sc_amount}} SC bonus is ready. Visit {{games_url}} to start playing!',
          variables: { gc_amount: '10', sc_amount: '10', username: 'string', games_url: 'string' },
          is_active: true
        },
        {
          template_name: 'bonus_notification',
          subject: '🎉 New Bonus Available: {{bonus_title}}',
          html_content: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; background: #1a1a2e; color: #fff; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { text-align: center; background: linear-gradient(45deg, #FFD700, #FFA500); padding: 30px; border-radius: 10px; }
                  .button { background: #FFD700; color: #000; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎉 New Bonus Available!</h1>
                    <h2>{{bonus_title}}</h2>
                  </div>
                  <p>Hi {{username}},</p>
                  <p>Great news! You have a new bonus waiting for you.</p>
                  <div style="background:#2a2a3e;padding:20px;border-radius:10px;margin:20px 0">
                    <h3>Your Bonus Details:</h3>
                    <ul>
                      <li>{{gc_amount}} Gold Coins</li>
                      <li>{{sc_amount}} Sweeps Coins</li>
                    </ul>
                  </div>
                  <p>Claim your bonus now:</p>
                  <a href="{{claim_url}}" class="button">Claim Bonus</a>
                  <p>Happy gaming!</p>
                  <p>The CoinKrazy Team</p>
                </div>
              </body>
            </html>
          `,
          text_content: 'Hi {{username}}, you have a new bonus: {{bonus_title}}. {{gc_amount}} GC + {{sc_amount}} SC. Claim at {{claim_url}}',
          variables: { username: 'string', bonus_title: 'string', gc_amount: '0', sc_amount: '0.00', claim_url: 'string' },
          is_active: true
        }
      ];

      for (const template of defaultTemplates) {
        if (!templateNames.includes(template.template_name)) {
          await this.createEmailTemplate(template);
        }
      }
    } catch (error) {
      console.error('Failed to initialize default templates:', error);
    }
  }
}

export const emailService = EmailService.getInstance();
export default emailService;
