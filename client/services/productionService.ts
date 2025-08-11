export interface ProductionConfig {
  environment: 'production' | 'staging' | 'development';
  apiEndpoints: {
    auth: string;
    payments: string;
    games: string;
    sports: string;
    support: string;
    analytics: string;
  };
  security: {
    encryptionEnabled: boolean;
    rateLimiting: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    requireHTTPS: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cdnEnabled: boolean;
    compressionEnabled: boolean;
    lazyLoadingEnabled: boolean;
  };
  monitoring: {
    errorTrackingEnabled: boolean;
    performanceMonitoringEnabled: boolean;
    userAnalyticsEnabled: boolean;
    realTimeAlertsEnabled: boolean;
  };
  features: {
    maintenanceMode: boolean;
    newUserRegistration: boolean;
    withdrawalsEnabled: boolean;
    depositsEnabled: boolean;
    liveChatEnabled: boolean;
    promotionsEnabled: boolean;
  };
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'rate_limit_exceeded' | 'security_violation';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  handled: boolean;
}

export interface PerformanceMetric {
  id: string;
  metric: 'page_load' | 'api_response' | 'database_query' | 'game_launch' | 'transaction_processing';
  value: number; // in milliseconds
  page?: string;
  userId?: string;
  timestamp: Date;
  metadata?: any;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'maintenance';
  services: {
    [serviceName: string]: {
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      lastChecked: Date;
      errorRate: number;
    };
  };
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeUsers: number;
    requestsPerMinute: number;
    errorRate: number;
  };
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    timestamp: Date;
  }>;
}

class ProductionService {
  private static instance: ProductionService;
  private config: ProductionConfig;
  private securityEvents: SecurityEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private systemHealth: SystemHealth;
  private listeners: Set<(event: string, data: any) => void> = new Set();

  static getInstance(): ProductionService {
    if (!ProductionService.instance) {
      ProductionService.instance = new ProductionService();
    }
    return ProductionService.instance;
  }

  constructor() {
    this.config = this.initializeProductionConfig();
    this.systemHealth = this.initializeSystemHealth();
    this.startMonitoring();
    this.initializeSecurityMeasures();
  }

  private initializeProductionConfig(): ProductionConfig {
    const environment = (import.meta.env.VITE_ENVIRONMENT || 'production') as 'production' | 'staging' | 'development';
    
    return {
      environment,
      apiEndpoints: {
        auth: import.meta.env.VITE_AUTH_API || 'https://api.coinkrazy.com/auth',
        payments: import.meta.env.VITE_PAYMENTS_API || 'https://api.coinkrazy.com/payments',
        games: import.meta.env.VITE_GAMES_API || 'https://api.coinkrazy.com/games',
        sports: import.meta.env.VITE_SPORTS_API || 'https://api.coinkrazy.com/sports',
        support: import.meta.env.VITE_SUPPORT_API || 'https://api.coinkrazy.com/support',
        analytics: import.meta.env.VITE_ANALYTICS_API || 'https://api.coinkrazy.com/analytics'
      },
      security: {
        encryptionEnabled: environment === 'production',
        rateLimiting: true,
        sessionTimeout: environment === 'production' ? 60 : 480, // 1 hour prod, 8 hours dev
        maxLoginAttempts: 5,
        requireHTTPS: environment === 'production'
      },
      performance: {
        cacheEnabled: true,
        cdnEnabled: environment === 'production',
        compressionEnabled: true,
        lazyLoadingEnabled: true
      },
      monitoring: {
        errorTrackingEnabled: true,
        performanceMonitoringEnabled: true,
        userAnalyticsEnabled: environment === 'production',
        realTimeAlertsEnabled: environment === 'production'
      },
      features: {
        maintenanceMode: false,
        newUserRegistration: true,
        withdrawalsEnabled: true,
        depositsEnabled: true,
        liveChatEnabled: true,
        promotionsEnabled: true
      }
    };
  }

  private initializeSystemHealth(): SystemHealth {
    return {
      status: 'healthy',
      services: {
        'auth-service': {
          status: 'online',
          responseTime: 150,
          lastChecked: new Date(),
          errorRate: 0.1
        },
        'payment-service': {
          status: 'online',
          responseTime: 200,
          lastChecked: new Date(),
          errorRate: 0.05
        },
        'game-service': {
          status: 'online',
          responseTime: 100,
          lastChecked: new Date(),
          errorRate: 0.02
        },
        'email-service': {
          status: 'online',
          responseTime: 300,
          lastChecked: new Date(),
          errorRate: 0.03
        },
        'database': {
          status: 'online',
          responseTime: 50,
          lastChecked: new Date(),
          errorRate: 0.01
        }
      },
      metrics: {
        cpuUsage: 35.2,
        memoryUsage: 68.5,
        diskUsage: 45.8,
        activeUsers: 1247,
        requestsPerMinute: 8942,
        errorRate: 0.02
      },
      alerts: []
    };
  }

  private startMonitoring() {
    // Monitor system health every 30 seconds
    setInterval(() => {
      this.updateSystemHealth();
    }, 30000);

    // Clean up old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);

    // Generate system reports every 6 hours
    setInterval(() => {
      this.generateSystemReport();
    }, 21600000);
  }

  private initializeSecurityMeasures() {
    // Initialize rate limiting
    this.initializeRateLimiting();
    
    // Monitor for suspicious activity
    this.initializeSuspiciousActivityDetection();
    
    // Setup session management
    this.initializeSessionManagement();
  }

  private initializeRateLimiting() {
    const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
    
    // Rate limiting middleware
    window.addEventListener('beforeunload', () => {
      // Clean up rate limiting on page unload
      rateLimitMap.clear();
    });

    // Rate limit API calls
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (this.config.security.rateLimiting) {
        const ip = this.getUserIP();
        const now = Date.now();
        const key = `${ip}_${this.getEndpointKey(input)}`;
        
        const limit = rateLimitMap.get(key);
        if (limit && limit.count >= 100 && now < limit.resetTime) {
          this.recordSecurityEvent({
            type: 'rate_limit_exceeded',
            ipAddress: ip,
            userAgent: navigator.userAgent,
            details: { endpoint: input.toString() },
            severity: 'medium'
          });
          throw new Error('Rate limit exceeded');
        }

        // Update rate limit counter
        if (!limit || now >= limit.resetTime) {
          rateLimitMap.set(key, { count: 1, resetTime: now + 60000 }); // 1 minute window
        } else {
          limit.count++;
        }
      }

      return originalFetch(input, init);
    };
  }

  private initializeSuspiciousActivityDetection() {
    // Monitor for suspicious patterns
    let rapidClicks = 0;
    let lastClickTime = 0;

    document.addEventListener('click', () => {
      const now = Date.now();
      if (now - lastClickTime < 100) { // Less than 100ms between clicks
        rapidClicks++;
        if (rapidClicks > 10) {
          this.recordSecurityEvent({
            type: 'suspicious_activity',
            ipAddress: this.getUserIP(),
            userAgent: navigator.userAgent,
            details: { type: 'rapid_clicking', count: rapidClicks },
            severity: 'low'
          });
          rapidClicks = 0;
        }
      } else {
        rapidClicks = 0;
      }
      lastClickTime = now;
    });

    // Monitor for console usage (potential tampering)
    let originalConsole = console.log;
    console.log = (...args) => {
      if (this.config.environment === 'production') {
        this.recordSecurityEvent({
          type: 'suspicious_activity',
          ipAddress: this.getUserIP(),
          userAgent: navigator.userAgent,
          details: { type: 'console_usage', args: args.slice(0, 2) },
          severity: 'low'
        });
      }
      originalConsole.apply(console, args);
    };
  }

  private initializeSessionManagement() {
    // Auto-logout on inactivity
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (this.isUserLoggedIn()) {
          this.performAutoLogout();
        }
      }, this.config.security.sessionTimeout * 60 * 1000);
    };

    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();
  }

  private updateSystemHealth() {
    // Simulate service health checks
    Object.keys(this.systemHealth.services).forEach(serviceName => {
      const service = this.systemHealth.services[serviceName];
      
      // Simulate occasional service issues
      const random = Math.random();
      if (random < 0.02) { // 2% chance of degraded performance
        service.status = 'degraded';
        service.responseTime *= 2;
        service.errorRate = Math.min(service.errorRate + 0.05, 0.5);
      } else if (random < 0.001) { // 0.1% chance of service offline
        service.status = 'offline';
        service.errorRate = 1.0;
      } else {
        service.status = 'online';
        service.responseTime = Math.max(service.responseTime * 0.95, 50); // Gradual improvement
        service.errorRate = Math.max(service.errorRate * 0.9, 0.01); // Gradual improvement
      }
      
      service.lastChecked = new Date();
    });

    // Update overall system status
    const offlineServices = Object.values(this.systemHealth.services).filter(s => s.status === 'offline').length;
    const degradedServices = Object.values(this.systemHealth.services).filter(s => s.status === 'degraded').length;

    if (offlineServices > 0) {
      this.systemHealth.status = 'unhealthy';
    } else if (degradedServices > 1) {
      this.systemHealth.status = 'degraded';
    } else {
      this.systemHealth.status = 'healthy';
    }

    // Update metrics
    this.systemHealth.metrics = {
      cpuUsage: Math.max(20, Math.min(90, this.systemHealth.metrics.cpuUsage + (Math.random() - 0.5) * 5)),
      memoryUsage: Math.max(30, Math.min(95, this.systemHealth.metrics.memoryUsage + (Math.random() - 0.5) * 3)),
      diskUsage: Math.max(20, Math.min(85, this.systemHealth.metrics.diskUsage + (Math.random() - 0.5) * 1)),
      activeUsers: Math.max(100, this.systemHealth.metrics.activeUsers + Math.floor((Math.random() - 0.5) * 20)),
      requestsPerMinute: Math.max(1000, this.systemHealth.metrics.requestsPerMinute + Math.floor((Math.random() - 0.5) * 200)),
      errorRate: Math.max(0, Math.min(0.1, this.systemHealth.metrics.errorRate + (Math.random() - 0.5) * 0.01))
    };

    // Generate alerts if needed
    this.checkForAlerts();

    this.notifyListeners('system_health_updated', this.systemHealth);
  }

  private checkForAlerts() {
    const alerts = [];

    // Check for high resource usage
    if (this.systemHealth.metrics.cpuUsage > 80) {
      alerts.push({
        id: `alert_cpu_${Date.now()}`,
        type: 'resource_usage',
        message: `High CPU usage: ${this.systemHealth.metrics.cpuUsage.toFixed(1)}%`,
        severity: 'warning' as const,
        timestamp: new Date()
      });
    }

    if (this.systemHealth.metrics.memoryUsage > 90) {
      alerts.push({
        id: `alert_memory_${Date.now()}`,
        type: 'resource_usage',
        message: `Critical memory usage: ${this.systemHealth.metrics.memoryUsage.toFixed(1)}%`,
        severity: 'critical' as const,
        timestamp: new Date()
      });
    }

    if (this.systemHealth.metrics.errorRate > 0.05) {
      alerts.push({
        id: `alert_error_rate_${Date.now()}`,
        type: 'error_rate',
        message: `High error rate: ${(this.systemHealth.metrics.errorRate * 100).toFixed(2)}%`,
        severity: 'error' as const,
        timestamp: new Date()
      });
    }

    // Check for offline services
    Object.entries(this.systemHealth.services).forEach(([name, service]) => {
      if (service.status === 'offline') {
        alerts.push({
          id: `alert_service_${name}_${Date.now()}`,
          type: 'service_down',
          message: `Service offline: ${name}`,
          severity: 'critical' as const,
          timestamp: new Date()
        });
      }
    });

    // Add new alerts to system health
    this.systemHealth.alerts.push(...alerts);

    // Keep only recent alerts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.systemHealth.alerts = this.systemHealth.alerts.filter(alert => alert.timestamp > oneDayAgo);
  }

  private cleanupOldMetrics() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.performanceMetrics = this.performanceMetrics.filter(metric => metric.timestamp > oneHourAgo);
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > oneDayAgo);
  }

  private generateSystemReport() {
    const report = {
      timestamp: new Date(),
      systemHealth: this.systemHealth,
      securitySummary: {
        totalEvents: this.securityEvents.length,
        criticalEvents: this.securityEvents.filter(e => e.severity === 'critical').length,
        suspiciousActivity: this.securityEvents.filter(e => e.type === 'suspicious_activity').length
      },
      performanceSummary: {
        averagePageLoad: this.calculateAverageMetric('page_load'),
        averageApiResponse: this.calculateAverageMetric('api_response'),
        slowestPages: this.getSlowPages()
      }
    };

    if (this.config.monitoring.realTimeAlertsEnabled) {
      this.notifyListeners('system_report_generated', report);
    }
  }

  private calculateAverageMetric(metric: string): number {
    const metrics = this.performanceMetrics.filter(m => m.metric === metric);
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
  }

  private getSlowPages(): Array<{page: string; averageTime: number}> {
    const pageMetrics = this.performanceMetrics
      .filter(m => m.metric === 'page_load' && m.page)
      .reduce((acc, m) => {
        if (!acc[m.page!]) acc[m.page!] = [];
        acc[m.page!].push(m.value);
        return acc;
      }, {} as Record<string, number[]>);

    return Object.entries(pageMetrics)
      .map(([page, times]) => ({
        page,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);
  }

  // Security Methods
  recordSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'handled'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      handled: false
    };

    this.securityEvents.push(securityEvent);

    if (event.severity === 'critical' || event.severity === 'high') {
      this.notifyListeners('security_alert', securityEvent);
    }
  }

  getSecurityEvents(): SecurityEvent[] {
    return this.securityEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Performance Methods
  recordPerformanceMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const perfMetric: PerformanceMetric = {
      ...metric,
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.performanceMetrics.push(perfMetric);

    // Alert on slow performance
    if (metric.value > 5000) { // More than 5 seconds
      this.notifyListeners('performance_alert', perfMetric);
    }
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return this.performanceMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // System Health Methods
  getSystemHealth(): SystemHealth {
    return this.systemHealth;
  }

  toggleMaintenanceMode(enabled: boolean): void {
    this.config.features.maintenanceMode = enabled;
    this.notifyListeners('maintenance_mode_changed', enabled);
  }

  updateFeatureFlag(feature: keyof ProductionConfig['features'], enabled: boolean): void {
    this.config.features[feature] = enabled;
    this.notifyListeners('feature_flag_updated', { feature, enabled });
  }

  // Utility Methods
  private getUserIP(): string {
    // In production, this would be provided by the server
    return '127.0.0.1';
  }

  private getEndpointKey(input: RequestInfo | URL): string {
    const url = typeof input === 'string' ? input : input.toString();
    return url.split('/').slice(0, 4).join('/'); // Group by base endpoint
  }

  private isUserLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private performAutoLogout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.notifyListeners('auto_logout', { reason: 'inactivity' });
    window.location.href = '/login?reason=timeout';
  }

  // Configuration Methods
  getConfig(): ProductionConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ProductionConfig>): void {
    this.config = { ...this.config, ...updates };
    this.notifyListeners('config_updated', this.config);
  }

  // Error Handling
  handleError(error: Error, context?: any): void {
    const errorEvent = {
      id: `error_${Date.now()}`,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
      severity: 'error' as const
    };

    if (this.config.monitoring.errorTrackingEnabled) {
      // In production, this would send to error tracking service
      console.error('Production Error:', errorEvent);
      this.notifyListeners('error_tracked', errorEvent);
    }

    // Record as security event if it seems suspicious
    if (error.message.includes('unauthorized') || error.message.includes('forbidden')) {
      this.recordSecurityEvent({
        type: 'security_violation',
        ipAddress: this.getUserIP(),
        userAgent: navigator.userAgent,
        details: { error: error.message, context },
        severity: 'high'
      });
    }
  }

  // Analytics
  trackUserAction(action: string, details?: any): void {
    if (this.config.monitoring.userAnalyticsEnabled) {
      const event = {
        action,
        details,
        timestamp: new Date(),
        userId: this.getCurrentUserId(),
        sessionId: this.getSessionId()
      };

      // In production, this would send to analytics service
      this.notifyListeners('user_action_tracked', event);
    }
  }

  private getCurrentUserId(): string | null {
    const user = localStorage.getItem('auth_user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  // Event System
  subscribe(callback: (event: string, data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.forEach(callback => callback(event, data));
  }

  // Health Check Methods
  async performHealthCheck(): Promise<boolean> {
    try {
      // Check critical services
      const criticalServices = ['auth-service', 'payment-service', 'database'];
      const healthyServices = criticalServices.filter(
        service => this.systemHealth.services[service]?.status === 'online'
      );

      const isHealthy = healthyServices.length === criticalServices.length;
      
      if (!isHealthy) {
        this.recordSecurityEvent({
          type: 'suspicious_activity',
          ipAddress: this.getUserIP(),
          userAgent: navigator.userAgent,
          details: { type: 'health_check_failed', unhealthyServices: criticalServices.filter(s => !healthyServices.includes(s)) },
          severity: 'high'
        });
      }

      return isHealthy;
    } catch (error) {
      this.handleError(error as Error, { context: 'health_check' });
      return false;
    }
  }

  // Backup and Recovery
  createSystemBackup(): any {
    return {
      timestamp: new Date(),
      config: this.config,
      securityEvents: this.securityEvents.slice(-100), // Last 100 events
      performanceMetrics: this.performanceMetrics.slice(-1000), // Last 1000 metrics
      systemHealth: this.systemHealth
    };
  }

  restoreFromBackup(backup: any): boolean {
    try {
      if (backup.config) this.config = backup.config;
      if (backup.securityEvents) this.securityEvents = backup.securityEvents;
      if (backup.performanceMetrics) this.performanceMetrics = backup.performanceMetrics;
      if (backup.systemHealth) this.systemHealth = backup.systemHealth;
      
      this.notifyListeners('system_restored', backup);
      return true;
    } catch (error) {
      this.handleError(error as Error, { context: 'backup_restore' });
      return false;
    }
  }
}

export const productionService = ProductionService.getInstance();
