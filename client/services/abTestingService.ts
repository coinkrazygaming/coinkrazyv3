import { authService } from "./authService";

// A/B Test Types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  type: 'package_design' | 'pricing' | 'layout' | 'copy' | 'color_scheme';
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  targetAudience: TargetAudience;
  trafficAllocation: number; // Percentage of users in test
  variants: ABTestVariant[];
  metrics: ABTestMetrics;
  results?: ABTestResults;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficSplit: number; // Percentage within the test
  config: VariantConfig;
  conversions: number;
  revenue: number;
  views: number;
  uniqueUsers: number;
}

export interface VariantConfig {
  // Package design variations
  packageDesign?: {
    layout: 'card' | 'list' | 'minimal' | 'premium';
    colorScheme: 'blue' | 'green' | 'purple' | 'gold' | 'red';
    badgeStyle: 'rounded' | 'sharp' | 'none';
    animationType: 'none' | 'pulse' | 'glow' | 'bounce';
    showDiscount: boolean;
    showBonusCoins: boolean;
    showPopularBadge: boolean;
    buttonStyle: 'solid' | 'gradient' | 'outline';
    buttonText: string;
    iconStyle: 'emoji' | 'icon' | 'image';
    pricePosition: 'top' | 'center' | 'bottom';
    descriptionLength: 'short' | 'medium' | 'long';
  };
  
  // Pricing variations
  pricing?: {
    showOriginalPrice: boolean;
    discountFormat: 'percentage' | 'amount' | 'none';
    priceFormat: 'standard' | 'emphasized' | 'minimal';
    currencyPosition: 'before' | 'after';
    bundleDisplay: 'separate' | 'combined';
  };
  
  // Layout variations
  layout?: {
    gridColumns: number;
    cardSpacing: 'tight' | 'normal' | 'loose';
    sortOrder: 'price_asc' | 'price_desc' | 'popularity' | 'value';
    featuredPlacement: 'top' | 'center' | 'sidebar';
    filterPosition: 'top' | 'sidebar' | 'hidden';
  };
  
  // Copy variations
  copy?: {
    headlines: string[];
    descriptions: string[];
    buttonTexts: string[];
    urgencyMessages: string[];
    valuePropositions: string[];
  };
}

export interface TargetAudience {
  userSegments: string[]; // 'new_users', 'returning_users', 'vip_users', etc.
  geoTargeting: string[]; // Country codes
  deviceTypes: string[]; // 'desktop', 'mobile', 'tablet'
  minPurchases?: number;
  maxPurchases?: number;
  registrationDateRange?: {
    start: string;
    end: string;
  };
}

export interface ABTestMetrics {
  primary: string; // 'conversion_rate', 'revenue', 'aov', etc.
  secondary: string[];
  minimumSampleSize: number;
  confidenceLevel: number; // 90, 95, 99
  minimumDetectableEffect: number; // Percentage
  expectedRuntime: number; // Days
}

export interface ABTestResults {
  isSignificant: boolean;
  confidenceLevel: number;
  winningVariant?: string;
  liftPercentage?: number;
  pValue?: number;
  totalParticipants: number;
  conversionRates: Record<string, number>;
  revenuePerVariant: Record<string, number>;
  statisticalPower: number;
  recommendedAction: 'implement_winner' | 'continue_test' | 'inconclusive' | 'stop_test';
  insights: string[];
}

export interface UserAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: string;
  hasConverted: boolean;
  conversionValue: number;
  events: ABTestEvent[];
}

export interface ABTestEvent {
  eventType: 'view' | 'click' | 'purchase' | 'add_to_cart' | 'checkout_start';
  variantId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ABTestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Partial<ABTest>;
  successMetrics: string[];
  estimatedRuntime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

class ABTestingService {
  private static instance: ABTestingService;
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, UserAssignment[]> = new Map();
  private activeAssignments: Map<string, Record<string, string>> = new Map(); // userId -> testId -> variantId

  static getInstance(): ABTestingService {
    if (!ABTestingService.instance) {
      ABTestingService.instance = new ABTestingService();
    }
    return ABTestingService.instance;
  }

  constructor() {
    this.loadActiveTests();
    this.loadUserAssignments();
  }

  // ===============================
  // TEST MANAGEMENT
  // ===============================

  /**
   * Create a new A/B test
   */
  async createTest(testData: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ABTest> {
    const user = authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const test: ABTest = {
      ...testData,
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate test configuration
    this.validateTestConfig(test);

    // Store test
    this.tests.set(test.id, test);
    await this.saveTest(test);

    return test;
  }

  /**
   * Get all tests
   */
  async getTests(filters?: {
    status?: string;
    type?: string;
    createdBy?: string;
  }): Promise<ABTest[]> {
    let tests = Array.from(this.tests.values());

    if (filters) {
      if (filters.status) {
        tests = tests.filter(test => test.status === filters.status);
      }
      if (filters.type) {
        tests = tests.filter(test => test.type === filters.type);
      }
      if (filters.createdBy) {
        tests = tests.filter(test => test.createdBy === filters.createdBy);
      }
    }

    return tests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get specific test
   */
  async getTest(testId: string): Promise<ABTest | null> {
    const test = this.tests.get(testId);
    if (!test) {
      // Try loading from API
      return await this.loadTest(testId);
    }
    return test;
  }

  /**
   * Start a test
   */
  async startTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    if (test.status !== 'draft') {
      throw new Error('Only draft tests can be started');
    }

    test.status = 'running';
    test.startDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();

    this.tests.set(testId, test);
    await this.saveTest(test);

    console.log(`A/B test ${testId} started`);
  }

  /**
   * Pause a test
   */
  async pauseTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    test.status = 'paused';
    test.updatedAt = new Date().toISOString();

    this.tests.set(testId, test);
    await this.saveTest(test);

    console.log(`A/B test ${testId} paused`);
  }

  /**
   * Complete a test
   */
  async completeTest(testId: string): Promise<void> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    // Calculate final results
    const results = await this.calculateTestResults(testId);
    
    test.status = 'completed';
    test.endDate = new Date().toISOString();
    test.updatedAt = new Date().toISOString();
    test.results = results;

    this.tests.set(testId, test);
    await this.saveTest(test);

    console.log(`A/B test ${testId} completed`);
  }

  // ===============================
  // USER ASSIGNMENT & TARGETING
  // ===============================

  /**
   * Get variant for user (main entry point for A/B testing)
   */
  async getUserVariant(testId: string, userId?: string): Promise<string | null> {
    const user = userId ? { id: userId } : authService.getCurrentUser();
    if (!user) return null;

    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const existingAssignment = this.getUserAssignment(user.id, testId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user meets targeting criteria
    if (!this.userMeetsTargeting(user.id, test.targetAudience)) {
      return null;
    }

    // Check traffic allocation
    if (Math.random() > test.trafficAllocation / 100) {
      return null;
    }

    // Assign user to variant
    const variantId = this.assignUserToVariant(test);
    
    // Create assignment record
    const assignment: UserAssignment = {
      userId: user.id,
      testId: testId,
      variantId: variantId,
      assignedAt: new Date().toISOString(),
      hasConverted: false,
      conversionValue: 0,
      events: [],
    };

    this.storeUserAssignment(assignment);

    return variantId;
  }

  /**
   * Get variant configuration for rendering
   */
  async getVariantConfig(testId: string, variantId: string): Promise<VariantConfig | null> {
    const test = this.tests.get(testId);
    if (!test) return null;

    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  /**
   * Check if user should see A/B test variation for package design
   */
  async getPackageDesignVariant(packageId: string, userId?: string): Promise<VariantConfig | null> {
    // Find active package design tests
    const activeTests = Array.from(this.tests.values()).filter(
      test => test.status === 'running' && test.type === 'package_design'
    );

    for (const test of activeTests) {
      const variantId = await this.getUserVariant(test.id, userId);
      if (variantId) {
        const config = await this.getVariantConfig(test.id, variantId);
        if (config) {
          return config;
        }
      }
    }

    return null;
  }

  private assignUserToVariant(test: ABTest): string {
    // Use deterministic assignment based on user ID hash
    const random = Math.random();
    let cumulative = 0;

    for (const variant of test.variants) {
      cumulative += variant.trafficSplit / 100;
      if (random <= cumulative) {
        return variant.id;
      }
    }

    // Fallback to control
    return test.variants.find(v => v.isControl)?.id || test.variants[0].id;
  }

  private userMeetsTargeting(userId: string, targeting: TargetAudience): boolean {
    // In production, this would check user properties against targeting criteria
    // For now, return true for all users
    return true;
  }

  // ===============================
  // EVENT TRACKING
  // ===============================

  /**
   * Track event for A/B test
   */
  async trackEvent(testId: string, eventType: ABTestEvent['eventType'], metadata?: Record<string, any>): Promise<void> {
    const user = authService.getCurrentUser();
    if (!user) return;

    const assignment = this.getUserAssignment(user.id, testId);
    if (!assignment) return;

    const event: ABTestEvent = {
      eventType,
      variantId: assignment.variantId,
      timestamp: new Date().toISOString(),
      metadata,
    };

    assignment.events.push(event);

    // Update variant metrics
    const test = this.tests.get(testId);
    if (test) {
      const variant = test.variants.find(v => v.id === assignment.variantId);
      if (variant) {
        switch (eventType) {
          case 'view':
            variant.views++;
            break;
          case 'purchase':
            variant.conversions++;
            if (metadata?.amount) {
              variant.revenue += metadata.amount;
              assignment.conversionValue += metadata.amount;
              assignment.hasConverted = true;
            }
            break;
        }
      }
    }

    this.saveUserAssignments();
  }

  /**
   * Track package view
   */
  async trackPackageView(packageId: string): Promise<void> {
    const activeTests = Array.from(this.tests.values()).filter(
      test => test.status === 'running' && test.type === 'package_design'
    );

    for (const test of activeTests) {
      await this.trackEvent(test.id, 'view', { packageId });
    }
  }

  /**
   * Track package purchase
   */
  async trackPackagePurchase(packageId: string, amount: number): Promise<void> {
    const activeTests = Array.from(this.tests.values()).filter(
      test => test.status === 'running' && test.type === 'package_design'
    );

    for (const test of activeTests) {
      await this.trackEvent(test.id, 'purchase', { packageId, amount });
    }
  }

  // ===============================
  // RESULTS & ANALYTICS
  // ===============================

  /**
   * Calculate test results
   */
  async calculateTestResults(testId: string): Promise<ABTestResults> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error('Test not found');
    }

    const assignments = this.getUserAssignments(testId);
    const totalParticipants = assignments.length;

    if (totalParticipants < test.metrics.minimumSampleSize) {
      return {
        isSignificant: false,
        confidenceLevel: test.metrics.confidenceLevel,
        totalParticipants,
        conversionRates: {},
        revenuePerVariant: {},
        statisticalPower: 0,
        recommendedAction: 'continue_test',
        insights: ['Insufficient sample size. Continue test to reach minimum sample size.'],
      };
    }

    // Calculate conversion rates for each variant
    const conversionRates: Record<string, number> = {};
    const revenuePerVariant: Record<string, number> = {};

    for (const variant of test.variants) {
      const variantAssignments = assignments.filter(a => a.variantId === variant.id);
      const conversions = variantAssignments.filter(a => a.hasConverted).length;
      const revenue = variantAssignments.reduce((sum, a) => sum + a.conversionValue, 0);
      
      conversionRates[variant.id] = variantAssignments.length > 0 ? conversions / variantAssignments.length : 0;
      revenuePerVariant[variant.id] = revenue;
    }

    // Find control and best performing variant
    const controlVariant = test.variants.find(v => v.isControl);
    const controlConversionRate = controlVariant ? conversionRates[controlVariant.id] : 0;
    
    let bestVariant = controlVariant;
    let bestConversionRate = controlConversionRate;
    
    for (const variant of test.variants) {
      if (conversionRates[variant.id] > bestConversionRate) {
        bestVariant = variant;
        bestConversionRate = conversionRates[variant.id];
      }
    }

    // Calculate statistical significance (simplified)
    const liftPercentage = controlConversionRate > 0 
      ? ((bestConversionRate - controlConversionRate) / controlConversionRate) * 100 
      : 0;

    // Simplified p-value calculation (in production, use proper statistical tests)
    const pValue = this.calculatePValue(test, assignments);
    const isSignificant = pValue < (1 - test.metrics.confidenceLevel / 100);

    // Generate insights
    const insights = this.generateInsights(test, conversionRates, revenuePerVariant, liftPercentage);

    return {
      isSignificant,
      confidenceLevel: test.metrics.confidenceLevel,
      winningVariant: bestVariant?.id,
      liftPercentage,
      pValue,
      totalParticipants,
      conversionRates,
      revenuePerVariant,
      statisticalPower: this.calculateStatisticalPower(test, assignments),
      recommendedAction: this.getRecommendedAction(isSignificant, liftPercentage, totalParticipants, test),
      insights,
    };
  }

  private calculatePValue(test: ABTest, assignments: UserAssignment[]): number {
    // Simplified p-value calculation
    // In production, implement proper statistical tests (Chi-square, t-test, etc.)
    return Math.random() * 0.1; // Mock value
  }

  private calculateStatisticalPower(test: ABTest, assignments: UserAssignment[]): number {
    // Simplified statistical power calculation
    const sampleSize = assignments.length;
    const targetSize = test.metrics.minimumSampleSize;
    return Math.min(sampleSize / targetSize, 1) * 0.8; // Mock calculation
  }

  private generateInsights(
    test: ABTest, 
    conversionRates: Record<string, number>, 
    revenuePerVariant: Record<string, number>,
    liftPercentage: number
  ): string[] {
    const insights: string[] = [];

    if (liftPercentage > test.metrics.minimumDetectableEffect) {
      insights.push(`Winning variant shows ${liftPercentage.toFixed(1)}% improvement over control.`);
    }

    // Find best performing design elements
    const variants = test.variants.map(v => ({
      ...v,
      conversionRate: conversionRates[v.id] || 0,
      revenue: revenuePerVariant[v.id] || 0,
    }));

    const bestVariant = variants.reduce((best, current) => 
      current.conversionRate > best.conversionRate ? current : best
    );

    if (bestVariant.config.packageDesign) {
      const design = bestVariant.config.packageDesign;
      insights.push(`${design.colorScheme} color scheme performed best.`);
      
      if (design.showDiscount) {
        insights.push('Showing discount badges improved conversion.');
      }
      
      if (design.animationType !== 'none') {
        insights.push(`${design.animationType} animation increased engagement.`);
      }
    }

    return insights;
  }

  private getRecommendedAction(
    isSignificant: boolean, 
    liftPercentage: number, 
    totalParticipants: number,
    test: ABTest
  ): ABTestResults['recommendedAction'] {
    if (!isSignificant && totalParticipants < test.metrics.minimumSampleSize) {
      return 'continue_test';
    }
    
    if (isSignificant && liftPercentage > test.metrics.minimumDetectableEffect) {
      return 'implement_winner';
    }
    
    if (!isSignificant) {
      return 'inconclusive';
    }
    
    return 'stop_test';
  }

  // ===============================
  // TEMPLATES & PRESETS
  // ===============================

  /**
   * Get A/B test templates
   */
  getTestTemplates(): ABTestTemplate[] {
    return [
      {
        id: 'package_design_colors',
        name: 'Package Color Scheme Test',
        description: 'Test different color schemes for package cards',
        category: 'Design',
        template: {
          name: 'Package Color Scheme Test',
          type: 'package_design',
          trafficAllocation: 50,
          variants: [
            {
              id: 'control',
              name: 'Blue Theme (Control)',
              isControl: true,
              trafficSplit: 50,
              config: {
                packageDesign: {
                  colorScheme: 'blue',
                  layout: 'card',
                  badgeStyle: 'rounded',
                  animationType: 'none',
                  showDiscount: true,
                  showBonusCoins: true,
                  showPopularBadge: true,
                  buttonStyle: 'solid',
                  buttonText: 'Purchase Now',
                  iconStyle: 'emoji',
                  pricePosition: 'center',
                  descriptionLength: 'medium',
                }
              }
            },
            {
              id: 'variant_gold',
              name: 'Gold Theme',
              isControl: false,
              trafficSplit: 50,
              config: {
                packageDesign: {
                  colorScheme: 'gold',
                  layout: 'card',
                  badgeStyle: 'rounded',
                  animationType: 'glow',
                  showDiscount: true,
                  showBonusCoins: true,
                  showPopularBadge: true,
                  buttonStyle: 'gradient',
                  buttonText: 'Purchase Now',
                  iconStyle: 'emoji',
                  pricePosition: 'center',
                  descriptionLength: 'medium',
                }
              }
            }
          ],
          metrics: {
            primary: 'conversion_rate',
            secondary: ['revenue', 'aov'],
            minimumSampleSize: 1000,
            confidenceLevel: 95,
            minimumDetectableEffect: 10,
            expectedRuntime: 14,
          }
        },
        successMetrics: ['Conversion Rate', 'Revenue per Visitor'],
        estimatedRuntime: 14,
        difficulty: 'beginner',
      },
      {
        id: 'package_button_styles',
        name: 'Button Style Optimization',
        description: 'Test different button styles and text for purchase buttons',
        category: 'CTA',
        template: {
          name: 'Button Style Test',
          type: 'package_design',
          trafficAllocation: 30,
          variants: [
            {
              id: 'control',
              name: 'Solid Button (Control)',
              isControl: true,
              trafficSplit: 33.33,
              config: {
                packageDesign: {
                  buttonStyle: 'solid',
                  buttonText: 'Purchase Now',
                  colorScheme: 'blue',
                  layout: 'card',
                  badgeStyle: 'rounded',
                  animationType: 'none',
                  showDiscount: true,
                  showBonusCoins: true,
                  showPopularBadge: true,
                  iconStyle: 'emoji',
                  pricePosition: 'center',
                  descriptionLength: 'medium',
                }
              }
            },
            {
              id: 'variant_gradient',
              name: 'Gradient Button',
              isControl: false,
              trafficSplit: 33.33,
              config: {
                packageDesign: {
                  buttonStyle: 'gradient',
                  buttonText: 'Buy Coins Now',
                  colorScheme: 'blue',
                  layout: 'card',
                  badgeStyle: 'rounded',
                  animationType: 'none',
                  showDiscount: true,
                  showBonusCoins: true,
                  showPopularBadge: true,
                  iconStyle: 'emoji',
                  pricePosition: 'center',
                  descriptionLength: 'medium',
                }
              }
            },
            {
              id: 'variant_outline',
              name: 'Outline Button',
              isControl: false,
              trafficSplit: 33.33,
              config: {
                packageDesign: {
                  buttonStyle: 'outline',
                  buttonText: 'Get Coins',
                  colorScheme: 'blue',
                  layout: 'card',
                  badgeStyle: 'rounded',
                  animationType: 'none',
                  showDiscount: true,
                  showBonusCoins: true,
                  showPopularBadge: true,
                  iconStyle: 'emoji',
                  pricePosition: 'center',
                  descriptionLength: 'medium',
                }
              }
            }
          ],
          metrics: {
            primary: 'conversion_rate',
            secondary: ['click_through_rate'],
            minimumSampleSize: 1500,
            confidenceLevel: 95,
            minimumDetectableEffect: 15,
            expectedRuntime: 21,
          }
        },
        successMetrics: ['Click-through Rate', 'Conversion Rate'],
        estimatedRuntime: 21,
        difficulty: 'intermediate',
      }
    ];
  }

  // ===============================
  // UTILITY METHODS
  // ===============================

  private validateTestConfig(test: ABTest): void {
    // Validate traffic splits add up to 100%
    const totalSplit = test.variants.reduce((sum, variant) => sum + variant.trafficSplit, 0);
    if (Math.abs(totalSplit - 100) > 0.01) {
      throw new Error('Variant traffic splits must add up to 100%');
    }

    // Ensure there's exactly one control
    const controlCount = test.variants.filter(v => v.isControl).length;
    if (controlCount !== 1) {
      throw new Error('Test must have exactly one control variant');
    }

    // Validate minimum sample size
    if (test.metrics.minimumSampleSize < 100) {
      throw new Error('Minimum sample size must be at least 100');
    }
  }

  private getUserAssignment(userId: string, testId: string): UserAssignment | undefined {
    const userAssignments = this.userAssignments.get(userId) || [];
    return userAssignments.find(assignment => assignment.testId === testId);
  }

  private getUserAssignments(testId: string): UserAssignment[] {
    const allAssignments: UserAssignment[] = [];
    
    for (const userAssignments of this.userAssignments.values()) {
      const testAssignments = userAssignments.filter(assignment => assignment.testId === testId);
      allAssignments.push(...testAssignments);
    }
    
    return allAssignments;
  }

  private storeUserAssignment(assignment: UserAssignment): void {
    const userId = assignment.userId;
    const userAssignments = this.userAssignments.get(userId) || [];
    userAssignments.push(assignment);
    this.userAssignments.set(userId, userAssignments);
    
    // Update active assignments cache
    const activeTests = this.activeAssignments.get(userId) || {};
    activeTests[assignment.testId] = assignment.variantId;
    this.activeAssignments.set(userId, activeTests);
    
    this.saveUserAssignments();
  }

  // ===============================
  // PERSISTENCE (Mock Implementation)
  // ===============================

  private async loadActiveTests(): Promise<void> {
    // In production, load from API/database
    const savedTests = localStorage.getItem('ab_tests');
    if (savedTests) {
      const tests = JSON.parse(savedTests);
      for (const test of tests) {
        this.tests.set(test.id, test);
      }
    }
  }

  private async loadUserAssignments(): Promise<void> {
    // In production, load from API/database
    const savedAssignments = localStorage.getItem('ab_assignments');
    if (savedAssignments) {
      const assignments = JSON.parse(savedAssignments);
      for (const [userId, userAssignments] of Object.entries(assignments)) {
        this.userAssignments.set(userId, userAssignments as UserAssignment[]);
      }
    }
  }

  private async saveTest(test: ABTest): Promise<void> {
    // In production, save to API/database
    const allTests = Array.from(this.tests.values());
    localStorage.setItem('ab_tests', JSON.stringify(allTests));
  }

  private async saveUserAssignments(): Promise<void> {
    // In production, save to API/database
    const assignments = Object.fromEntries(this.userAssignments);
    localStorage.setItem('ab_assignments', JSON.stringify(assignments));
  }

  private async loadTest(testId: string): Promise<ABTest | null> {
    // In production, load from API
    return null;
  }
}

export const abTestingService = ABTestingService.getInstance();
