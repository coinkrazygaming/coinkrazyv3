export interface TickerMessage {
  id: string;
  type: 'win' | 'new_user' | 'leaderboard' | 'offer' | 'social' | 'ai_status';
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'LuckyAI' | 'JoseyAI' | 'SecurityAI' | 'GameMakerAI' | 'system';
  isActive: boolean;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface TickerConfig {
  tickerId: number; // 1-6
  type: TickerMessage['type'];
  isActive: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  lastUpdated: Date;
}

class TickerService {
  private static instance: TickerService;
  private messages: Map<string, TickerMessage> = new Map();
  private tickerConfigs: Map<number, TickerConfig> = new Map();
  private listeners: Set<(messages: TickerMessage[]) => void> = new Set();
  private currentMessageIndex = 0;

  static getInstance(): TickerService {
    if (!TickerService.instance) {
      TickerService.instance = new TickerService();
    }
    return TickerService.instance;
  }

  constructor() {
    this.initializeTickerConfigs();
    this.startTickerUpdates();
    this.generateInitialMessages();
  }

  private initializeTickerConfigs() {
    // Configure 6 different ticker types
    const configs: TickerConfig[] = [
      { tickerId: 1, type: 'win', isActive: true, autoRefresh: true, refreshInterval: 10, lastUpdated: new Date() },
      { tickerId: 2, type: 'new_user', isActive: true, autoRefresh: true, refreshInterval: 15, lastUpdated: new Date() },
      { tickerId: 3, type: 'leaderboard', isActive: true, autoRefresh: true, refreshInterval: 30, lastUpdated: new Date() },
      { tickerId: 4, type: 'offer', isActive: true, autoRefresh: true, refreshInterval: 60, lastUpdated: new Date() },
      { tickerId: 5, type: 'social', isActive: true, autoRefresh: true, refreshInterval: 20, lastUpdated: new Date() },
      { tickerId: 6, type: 'ai_status', isActive: true, autoRefresh: true, refreshInterval: 5, lastUpdated: new Date() }
    ];

    configs.forEach(config => {
      this.tickerConfigs.set(config.tickerId, config);
    });
  }

  private startTickerUpdates() {
    // Update ticker messages every 5 seconds
    setInterval(() => {
      this.updateTickerMessages();
      this.cleanupExpiredMessages();
      this.notifyListeners();
    }, 5000);
  }

  private generateInitialMessages() {
    // Generate initial messages for each ticker type
    this.addMessage({
      type: 'win',
      content: '🎉 Player **LuckySpinner** just won **25.50 SC** on Sweet Bonanza!',
      priority: 'high',
      source: 'LuckyAI'
    });

    this.addMessage({
      type: 'new_user',
      content: '👋 Welcome **CasinoFan2024** to CoinKrazy! Enjoy your welcome bonus!',
      priority: 'medium',
      source: 'JoseyAI'
    });

    this.addMessage({
      type: 'leaderboard',
      content: '🏆 **GoldRush23** climbs to #1 on the Weekly Leaderboard with 1,247 SC won!',
      priority: 'medium',
      source: 'LuckyAI'
    });

    this.addMessage({
      type: 'offer',
      content: '💰 **Flash Sale**: 50% extra Gold Coins on all packages! Limited time offer!',
      priority: 'high',
      source: 'LuckyAI'
    });

    this.addMessage({
      type: 'social',
      content: '📱 Follow us on Twitter @CoinKrazy for exclusive bonus codes and updates!',
      priority: 'low',
      source: 'JoseyAI'
    });

    this.addMessage({
      type: 'ai_status',
      content: '🤖 **JoseyAI**: All systems operational. Monitoring 247 active players.',
      priority: 'low',
      source: 'JoseyAI'
    });
  }

  private updateTickerMessages() {
    // Generate new messages based on ticker configs
    this.tickerConfigs.forEach((config, tickerId) => {
      if (!config.isActive || !config.autoRefresh) return;

      const timeSinceUpdate = Date.now() - config.lastUpdated.getTime();
      const shouldUpdate = timeSinceUpdate >= config.refreshInterval * 1000;

      if (shouldUpdate) {
        this.generateMessageForType(config.type);
        config.lastUpdated = new Date();
      }
    });
  }

  private generateMessageForType(type: TickerMessage['type']) {
    switch (type) {
      case 'win':
        this.generateWinMessage();
        break;
      case 'new_user':
        this.generateNewUserMessage();
        break;
      case 'leaderboard':
        this.generateLeaderboardMessage();
        break;
      case 'offer':
        this.generateOfferMessage();
        break;
      case 'social':
        this.generateSocialMessage();
        break;
      case 'ai_status':
        this.generateAIStatusMessage();
        break;
    }
  }

  private generateWinMessage() {
    const players = ['LuckyStrike', 'GoldSeeker', 'SpinMaster', 'JackpotHunter', 'DiamondPlayer', 'FortuneSeeker'];
    const games = ['Sweet Bonanza', 'Gates of Olympus', 'Book of Dead', 'CoinKrazy Spinner', 'Lucky Scratch'];
    const amounts = [5.25, 12.50, 18.75, 25.00, 33.50, 47.25, 55.80, 72.40, 89.90];
    
    const player = players[Math.floor(Math.random() * players.length)];
    const game = games[Math.floor(Math.random() * games.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];

    this.addMessage({
      type: 'win',
      content: `🎉 **${player}** just won **${amount} SC** on ${game}!`,
      priority: 'high',
      source: 'LuckyAI',
      expiresAt: new Date(Date.now() + 60000) // Expire in 1 minute
    });
  }

  private generateNewUserMessage() {
    const usernames = ['CasinoFan', 'SlotMaster', 'LuckyPlayer', 'GoldRush', 'WinBig', 'FortuneHunter'];
    const numbers = Math.floor(Math.random() * 9999) + 1000;
    const username = `${usernames[Math.floor(Math.random() * usernames.length)]}${numbers}`;

    this.addMessage({
      type: 'new_user',
      content: `👋 Welcome **${username}** to CoinKrazy! Enjoy your welcome bonus!`,
      priority: 'medium',
      source: 'JoseyAI',
      expiresAt: new Date(Date.now() + 120000) // Expire in 2 minutes
    });
  }

  private generateLeaderboardMessage() {
    const leaders = ['GoldRush23', 'SpinKing', 'LuckyAce', 'DiamondQueen', 'JackpotJoe', 'FortuneSeeker'];
    const positions = ['#1', '#2', '#3'];
    const amounts = [1247, 987, 756, 543, 432, 321];

    const leader = leaders[Math.floor(Math.random() * leaders.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];

    this.addMessage({
      type: 'leaderboard',
      content: `🏆 **${leader}** reaches ${position} on Weekly Leaderboard with ${amount} SC won!`,
      priority: 'medium',
      source: 'LuckyAI',
      expiresAt: new Date(Date.now() + 180000) // Expire in 3 minutes
    });
  }

  private generateOfferMessage() {
    const offers = [
      '💰 **Flash Sale**: 50% extra Gold Coins on all packages!',
      '🎁 **Weekend Special**: Double your first deposit bonus!',
      '⚡ **Limited Time**: Free 10 SC with any Gold Coin purchase!',
      '🌟 **VIP Offer**: Exclusive 100% match bonus for VIP members!',
      '🔥 **Hot Deal**: Buy 2 packages, get 1 FREE!'
    ];

    const offer = offers[Math.floor(Math.random() * offers.length)];

    this.addMessage({
      type: 'offer',
      content: offer,
      priority: 'high',
      source: 'LuckyAI',
      expiresAt: new Date(Date.now() + 300000) // Expire in 5 minutes
    });
  }

  private generateSocialMessage() {
    const socialMessages = [
      '📱 Follow @CoinKrazy on Twitter for exclusive bonus codes!',
      '💬 Join our Discord community for daily free spins!',
      '📸 Share your wins on Instagram with #CoinKrazyWins!',
      '🎥 Subscribe to our YouTube for game tutorials!',
      '👥 Refer friends and earn bonus SC for each signup!'
    ];

    const message = socialMessages[Math.floor(Math.random() * socialMessages.length)];

    this.addMessage({
      type: 'social',
      content: message,
      priority: 'low',
      source: 'JoseyAI',
      expiresAt: new Date(Date.now() + 240000) // Expire in 4 minutes
    });
  }

  private generateAIStatusMessage() {
    const statusMessages = [
      '🤖 **JoseyAI**: Monitoring social media engagement. 847 new followers today!',
      '🔍 **SecurityAI**: All security systems green. Zero threats detected.',
      '🎰 **GameMakerAI**: 3 new slot games in development. Release date: Next week!',
      '📊 **LuckyAI**: Processing 1,247 player bonuses. All systems optimal.',
      '⚡ **JoseyAI**: Live chat response time: 0.3 seconds. Customer satisfaction: 98%',
      '🛡️ **SecurityAI**: KYC verification system updated. Processing time reduced by 40%'
    ];

    const message = statusMessages[Math.floor(Math.random() * statusMessages.length)];

    this.addMessage({
      type: 'ai_status',
      content: message,
      priority: 'low',
      source: 'JoseyAI',
      expiresAt: new Date(Date.now() + 90000) // Expire in 1.5 minutes
    });
  }

  private cleanupExpiredMessages() {
    const now = new Date();
    const expiredIds: string[] = [];

    this.messages.forEach((message, id) => {
      if (message.expiresAt && message.expiresAt <= now) {
        expiredIds.push(id);
      }
    });

    expiredIds.forEach(id => this.messages.delete(id));
  }

  private notifyListeners() {
    const activeMessages = Array.from(this.messages.values())
      .filter(msg => msg.isActive)
      .sort((a, b) => {
        // Sort by priority, then by timestamp
        const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.priority];
        const bPriority = priorityWeight[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

    this.listeners.forEach(callback => callback(activeMessages));
  }

  // Public methods
  addMessage(messageData: Omit<TickerMessage, 'id' | 'timestamp' | 'isActive'>): string {
    const id = `ticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: TickerMessage = {
      ...messageData,
      id,
      timestamp: new Date(),
      isActive: true
    };

    this.messages.set(id, message);
    this.notifyListeners();
    return id;
  }

  removeMessage(messageId: string): boolean {
    const removed = this.messages.delete(messageId);
    if (removed) {
      this.notifyListeners();
    }
    return removed;
  }

  updateTickerConfig(tickerId: number, config: Partial<TickerConfig>): boolean {
    const existingConfig = this.tickerConfigs.get(tickerId);
    if (!existingConfig) return false;

    this.tickerConfigs.set(tickerId, { ...existingConfig, ...config });
    return true;
  }

  getTickerConfig(tickerId: number): TickerConfig | undefined {
    return this.tickerConfigs.get(tickerId);
  }

  getAllTickerConfigs(): TickerConfig[] {
    return Array.from(this.tickerConfigs.values());
  }

  getMessagesByType(type: TickerMessage['type']): TickerMessage[] {
    return Array.from(this.messages.values())
      .filter(msg => msg.type === type && msg.isActive)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  subscribeToTickers(callback: (messages: TickerMessage[]) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current messages
    const activeMessages = Array.from(this.messages.values())
      .filter(msg => msg.isActive)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    callback(activeMessages);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // AI Assistant methods
  postAIMessage(source: TickerMessage['source'], content: string, priority: TickerMessage['priority'] = 'medium'): string {
    return this.addMessage({
      type: 'ai_status',
      content,
      priority,
      source,
      expiresAt: new Date(Date.now() + 120000) // Expire in 2 minutes
    });
  }

  postSecurityAlert(message: string): string {
    return this.addMessage({
      type: 'ai_status',
      content: `🛡️ **SecurityAI**: ${message}`,
      priority: 'urgent',
      source: 'SecurityAI',
      expiresAt: new Date(Date.now() + 300000) // Expire in 5 minutes
    });
  }

  // Admin methods
  getTickerStats(): {
    totalMessages: number;
    messagesByType: Record<string, number>;
    messagesBySource: Record<string, number>;
    averageMessageLifetime: number;
  } {
    const messages = Array.from(this.messages.values());
    const messagesByType: Record<string, number> = {};
    const messagesBySource: Record<string, number> = {};
    
    messages.forEach(msg => {
      messagesByType[msg.type] = (messagesByType[msg.type] || 0) + 1;
      messagesBySource[msg.source] = (messagesBySource[msg.source] || 0) + 1;
    });

    const totalLifetime = messages.reduce((sum, msg) => {
      const lifetime = msg.expiresAt ? 
        msg.expiresAt.getTime() - msg.timestamp.getTime() : 
        120000; // Default 2 minutes
      return sum + lifetime;
    }, 0);

    const averageMessageLifetime = messages.length > 0 ? totalLifetime / messages.length / 1000 : 0;

    return {
      totalMessages: messages.length,
      messagesByType,
      messagesBySource,
      averageMessageLifetime
    };
  }
}

export const tickerService = TickerService.getInstance();
