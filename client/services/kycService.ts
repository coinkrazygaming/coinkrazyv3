// KYC (Know Your Customer) Service for CoinKrazy.com
// Production-ready identity verification system
import { realDataService } from './realDataService';

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'drivers_license' | 'passport' | 'state_id' | 'utility_bill' | 'bank_statement';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  documentUrl: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  expiresAt?: string;
}

export interface KYCVerification {
  id: string;
  userId: string;
  level: 'basic' | 'enhanced' | 'premium';
  status: 'unverified' | 'pending' | 'verified' | 'suspended';
  documentsRequired: string[];
  documentsProvided: KYCDocument[];
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn?: string; // Last 4 digits only
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
    addressVerified: boolean;
  };
  limits: {
    dailyWithdrawal: number;
    monthlyWithdrawal: number;
    maximumWithdrawal: number;
    minimumWithdrawal: number; // 100 SC minimum
  };
  createdAt: string;
  updatedAt: string;
  lastReviewAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  currency: 'SC' | 'USD';
  method: 'bank_transfer' | 'paypal' | 'crypto' | 'check';
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  transactionId?: string;
  rejectionReason?: string;
  fees: number;
  netAmount: number;
  kycRequired: boolean;
  kycVerificationId?: string;
}

class KYCService {
  private static instance: KYCService;
  private readonly API_BASE = '/api/kyc';

  static getInstance(): KYCService {
    if (!KYCService.instance) {
      KYCService.instance = new KYCService();
    }
    return KYCService.instance;
  }

  /**
   * Get user's KYC verification status
   */
  async getKYCStatus(userId: string): Promise<KYCVerification> {
    try {
      const response = await fetch(`${this.API_BASE}/status/${userId}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch KYC status');
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      // Return real KYC status from local data
      return this.getRealKYCStatus(userId);
    }
  }

  /**
   * Check if user can withdraw given amount
   */
  async canWithdraw(userId: string, amount: number): Promise<{
    canWithdraw: boolean;
    reason?: string;
    kycRequired: boolean;
    minimumAmount: number;
  }> {
    try {
      const kycStatus = await this.getKYCStatus(userId);
      
      // Check minimum withdrawal amount (100 SC)
      if (amount < kycStatus.limits.minimumWithdrawal) {
        return {
          canWithdraw: false,
          reason: `Minimum withdrawal amount is ${kycStatus.limits.minimumWithdrawal} SC`,
          kycRequired: false,
          minimumAmount: kycStatus.limits.minimumWithdrawal
        };
      }

      // Check KYC verification requirement
      if (kycStatus.status !== 'verified') {
        return {
          canWithdraw: false,
          reason: 'KYC verification required for withdrawals',
          kycRequired: true,
          minimumAmount: kycStatus.limits.minimumWithdrawal
        };
      }

      // Check daily limits
      const dailyWithdrawn = await this.getDailyWithdrawnAmount(userId);
      if (dailyWithdrawn + amount > kycStatus.limits.dailyWithdrawal) {
        return {
          canWithdraw: false,
          reason: `Daily withdrawal limit exceeded. Remaining: ${kycStatus.limits.dailyWithdrawal - dailyWithdrawn} SC`,
          kycRequired: false,
          minimumAmount: kycStatus.limits.minimumWithdrawal
        };
      }

      return {
        canWithdraw: true,
        kycRequired: false,
        minimumAmount: kycStatus.limits.minimumWithdrawal
      };
    } catch (error) {
      console.error('Error checking withdrawal eligibility:', error);
      return {
        canWithdraw: false,
        reason: 'Unable to verify withdrawal eligibility',
        kycRequired: true,
        minimumAmount: 100
      };
    }
  }

  /**
   * Start KYC verification process
   */
  async startKYCVerification(userId: string, personalInfo: any): Promise<KYCVerification> {
    try {
      const response = await fetch(`${this.API_BASE}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userId, personalInfo })
      });

      if (!response.ok) {
        throw new Error('Failed to start KYC verification');
      }

      return response.json();
    } catch (error) {
      console.error('Error starting KYC verification:', error);
      throw error;
    }
  }

  /**
   * Upload KYC document
   */
  async uploadDocument(
    userId: string, 
    documentType: KYCDocument['type'], 
    file: File
  ): Promise<KYCDocument> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('documentType', documentType);

      const response = await fetch(`${this.API_BASE}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return response.json();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Submit withdrawal request
   */
  async requestWithdrawal(
    userId: string,
    amount: number,
    method: WithdrawalRequest['method']
  ): Promise<WithdrawalRequest> {
    try {
      // First check if withdrawal is allowed
      const eligibility = await this.canWithdraw(userId, amount);
      if (!eligibility.canWithdraw) {
        throw new Error(eligibility.reason);
      }

      const response = await fetch(`${this.API_BASE}/request-withdrawal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userId, amount, method })
      });

      if (!response.ok) {
        throw new Error('Failed to submit withdrawal request');
      }

      return response.json();
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get user's withdrawal history
   */
  async getWithdrawalHistory(userId: string): Promise<WithdrawalRequest[]> {
    try {
      const response = await fetch(`${this.API_BASE}/withdrawals/${userId}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal history');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      return this.getRealWithdrawals(userId);
    }
  }

  /**
   * Get daily withdrawn amount for user
   */
  private async getDailyWithdrawnAmount(userId: string): Promise<number> {
    try {
      const response = await fetch(`${this.API_BASE}/daily-withdrawn/${userId}`, {
        headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.amount || 0;
    } catch (error) {
      console.error('Error fetching daily withdrawn amount:', error);
      return 0;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(userId: string, verificationCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userId, verificationCode })
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  }

  /**
   * Verify phone number
   */
  async verifyPhone(userId: string, verificationCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ userId, verificationCode })
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying phone:', error);
      return false;
    }
  }

  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Get real KYC status from user data
   */
  private getRealKYCStatus(userId: string): KYCVerification {
    const user = realDataService.getUser(userId);

    if (!user) {
      // Return default status for unknown users
      return {
        id: `kyc_${userId}`,
        userId,
        level: 'basic',
        status: 'unverified',
        documentsRequired: ['drivers_license', 'utility_bill'],
        documentsProvided: [],
        personalInfo: {
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'US'
          }
        },
        verification: {
          emailVerified: false,
          phoneVerified: false,
          identityVerified: false,
          addressVerified: false
        },
        limits: {
          dailyWithdrawal: 5000,
          monthlyWithdrawal: 50000,
          maximumWithdrawal: 10000,
          minimumWithdrawal: 100
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    // Map user data to KYC status
    const kycStatus: 'unverified' | 'pending' | 'verified' | 'suspended' =
      user.kycStatus === 'approved' ? 'verified' :
      user.kycStatus === 'pending' ? 'pending' :
      user.kycStatus === 'rejected' ? 'suspended' : 'unverified';

    return {
      id: `kyc_${userId}`,
      userId,
      level: user.role === 'vip' ? 'premium' : 'basic',
      status: kycStatus,
      documentsRequired: user.kycStatus === 'not_started' ? ['drivers_license', 'utility_bill'] : [],
      documentsProvided: [],
      personalInfo: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dateOfBirth: '',
        address: {
          street: user.location?.city || '',
          city: user.location?.city || '',
          state: user.location?.state || '',
          zipCode: '',
          country: user.location?.country || 'US'
        }
      },
      verification: {
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        identityVerified: user.kycStatus === 'approved',
        addressVerified: user.kycStatus === 'approved'
      },
      limits: {
        dailyWithdrawal: user.role === 'vip' ? 25000 : 5000,
        monthlyWithdrawal: user.role === 'vip' ? 250000 : 50000,
        maximumWithdrawal: user.role === 'vip' ? 50000 : 10000,
        minimumWithdrawal: 100
      },
      createdAt: user.registrationDate.toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Get real withdrawal history from transaction data
   */
  private getRealWithdrawals(userId: string): WithdrawalRequest[] {
    const transactions = realDataService.getUserTransactions(userId);

    return transactions
      .filter(tx => tx.type === 'withdrawal')
      .map(tx => ({
        id: tx.id,
        userId: tx.userId,
        amount: tx.amount,
        currency: tx.currency as 'SC' | 'USD',
        method: 'bank_transfer' as const,
        status: tx.status === 'completed' ? 'completed' :
                tx.status === 'failed' ? 'rejected' : 'pending',
        requestedAt: tx.timestamp.toISOString(),
        processedAt: tx.status !== 'pending' ? tx.timestamp.toISOString() : undefined,
        completedAt: tx.status === 'completed' ? tx.timestamp.toISOString() : undefined,
        transactionId: tx.id,
        rejectionReason: tx.status === 'failed' ? 'Processing error' : undefined,
        fees: tx.metadata.feeAmount || Math.floor(tx.amount * 0.02), // 2% fee
        netAmount: tx.amount - (tx.metadata.feeAmount || Math.floor(tx.amount * 0.02)),
        kycRequired: true,
        kycVerificationId: `kyc_${userId}`
      }))
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }
}

export const kycService = KYCService.getInstance();
export default kycService;
