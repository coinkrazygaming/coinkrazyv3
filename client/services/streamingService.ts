import { io, Socket } from "socket.io-client";

// Types and interfaces
export interface StreamQuality {
  id: string;
  label: string;
  resolution: string;
  bitrate: number;
  frameRate: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: number;
  type: "message" | "system" | "tip" | "announcement";
  badges?: string[];
  color?: string;
  reply?: {
    messageId: string;
    username: string;
    message: string;
  };
  emoticons?: Array<{
    name: string;
    url: string;
    position: [number, number];
  }>;
}

export interface StreamSource {
  id: string;
  name: string;
  url: string;
  type: "main" | "table" | "wheel" | "cards" | "dealer";
  quality: StreamQuality[];
  isActive: boolean;
  viewers: number;
}

export interface Moderator {
  id: string;
  username: string;
  level: "moderator" | "admin" | "super_admin";
  permissions: ModeratorPermissions;
}

export interface ModeratorPermissions {
  mute: boolean;
  ban: boolean;
  delete: boolean;
  timeout: boolean;
  announce: boolean;
  moderateEmoticons: boolean;
  viewUserDetails: boolean;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  requirement: string;
  isRare?: boolean;
}

export interface Emoticon {
  id: string;
  name: string;
  url: string;
  category: "basic" | "premium" | "vip" | "seasonal";
  isAnimated: boolean;
  cost?: number; // SC cost for premium emoticons
}

export interface StreamNotification {
  id: string;
  type:
    | "stream_start"
    | "stream_end"
    | "viewer_milestone"
    | "big_win"
    | "dealer_change";
  title: string;
  message: string;
  timestamp: number;
  priority: "low" | "medium" | "high";
  gameId?: string;
  dealerId?: string;
  userId?: string;
}

export interface StreamSettings {
  autoQuality: boolean;
  preferredQuality: string;
  soundEnabled: boolean;
  chatEnabled: boolean;
  notificationsEnabled: boolean;
  fullscreenMode: boolean;
  pictureInPicture: boolean;
  lowLatencyMode: boolean;
}

export interface StreamStats {
  streamId: string;
  viewers: {
    current: number;
    peak: number;
    total: number;
  };
  quality: {
    current: StreamQuality;
    switches: number;
    buffering: number;
    errors: number;
  };
  chat: {
    messages: number;
    activeUsers: number;
    moderationActions: number;
  };
  performance: {
    latency: number;
    bitrate: number;
    fps: number;
    droppedFrames: number;
  };
}

export interface TipAlert {
  id: string;
  fromUser: string;
  toDealer: string;
  amount: number;
  message?: string;
  timestamp: number;
  isVisible: boolean;
  duration: number;
}

// Chat filter and moderation
export interface ChatFilter {
  id: string;
  type: "word" | "regex" | "spam" | "caps" | "links";
  pattern: string;
  action: "warn" | "mute" | "ban" | "delete";
  severity: "low" | "medium" | "high";
  isActive: boolean;
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  userId: string;
  action: "mute" | "unmute" | "ban" | "unban" | "timeout" | "delete" | "warn";
  reason: string;
  duration?: number; // in minutes
  timestamp: number;
  isActive: boolean;
}

export interface UserStatus {
  id: string;
  username: string;
  status: "active" | "muted" | "banned" | "timeout";
  permissions: {
    canChat: boolean;
    canTip: boolean;
    canUseEmoticons: boolean;
  };
  violations: number;
  lastActivity: number;
  timeoutUntil?: number;
}

class StreamingService {
  private socket: Socket | null = null;
  private streams: Map<string, StreamSource> = new Map();
  private chatMessages: Map<string, ChatMessage[]> = new Map();
  private moderators: Map<string, Moderator> = new Map();
  private userBadges: Map<string, UserBadge[]> = new Map();
  private emoticons: Map<string, Emoticon> = new Map();
  private chatFilters: Map<string, ChatFilter> = new Map();
  private userStatuses: Map<string, UserStatus> = new Map();
  private streamSettings: StreamSettings = {
    autoQuality: true,
    preferredQuality: "auto",
    soundEnabled: true,
    chatEnabled: true,
    notificationsEnabled: true,
    fullscreenMode: false,
    pictureInPicture: false,
    lowLatencyMode: false,
  };

  constructor() {
    this.initializeService();
    this.setupMockData();
  }

  private initializeService(): void {
    // Initialize Socket.IO connection for real-time features
    try {
      this.socket = io("/streaming", {
        transports: ["websocket", "polling"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupSocketListeners();
    } catch (error) {
      console.warn(
        "StreamingService: Socket.IO connection failed, using mock data",
      );
    }
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("StreamingService: Connected to streaming server");
    });

    this.socket.on("disconnect", () => {
      console.log("StreamingService: Disconnected from streaming server");
    });

    this.socket.on("stream_update", (data: Partial<StreamSource>) => {
      this.handleStreamUpdate(data);
    });

    this.socket.on("chat_message", (message: ChatMessage) => {
      this.handleChatMessage(message);
    });

    this.socket.on(
      "user_joined",
      (data: { streamId: string; username: string }) => {
        this.handleUserJoined(data);
      },
    );

    this.socket.on(
      "user_left",
      (data: { streamId: string; username: string }) => {
        this.handleUserLeft(data);
      },
    );

    this.socket.on("moderation_action", (action: ModerationAction) => {
      this.handleModerationAction(action);
    });

    this.socket.on("tip_alert", (alert: TipAlert) => {
      this.handleTipAlert(alert);
    });

    this.socket.on(
      "stream_notification",
      (notification: StreamNotification) => {
        this.handleStreamNotification(notification);
      },
    );
  }

  private setupMockData(): void {
    // Mock stream qualities
    const qualities: StreamQuality[] = [
      {
        id: "auto",
        label: "Auto",
        resolution: "auto",
        bitrate: 0,
        frameRate: 0,
      },
      {
        id: "1080p",
        label: "1080p60",
        resolution: "1920x1080",
        bitrate: 6000,
        frameRate: 60,
      },
      {
        id: "720p",
        label: "720p60",
        resolution: "1280x720",
        bitrate: 3500,
        frameRate: 60,
      },
      {
        id: "480p",
        label: "480p30",
        resolution: "854x480",
        bitrate: 1500,
        frameRate: 30,
      },
      {
        id: "360p",
        label: "360p30",
        resolution: "640x360",
        bitrate: 800,
        frameRate: 30,
      },
    ];

    // Mock stream sources
    const mockStreams: StreamSource[] = [
      {
        id: "blackjack_main",
        name: "Blackjack Table 1",
        url: "https://stream.example.com/blackjack/main",
        type: "main",
        quality: qualities,
        isActive: true,
        viewers: 247,
      },
      {
        id: "roulette_wheel",
        name: "Roulette Wheel",
        url: "https://stream.example.com/roulette/wheel",
        type: "wheel",
        quality: qualities,
        isActive: true,
        viewers: 189,
      },
      {
        id: "baccarat_cards",
        name: "Baccarat Cards View",
        url: "https://stream.example.com/baccarat/cards",
        type: "cards",
        quality: qualities,
        isActive: true,
        viewers: 156,
      },
      {
        id: "dealer_cam",
        name: "Dealer Camera",
        url: "https://stream.example.com/dealer/main",
        type: "dealer",
        quality: qualities,
        isActive: true,
        viewers: 312,
      },
    ];

    mockStreams.forEach((stream) => {
      this.streams.set(stream.id, stream);
      this.chatMessages.set(stream.id, []);
    });

    // Mock emoticons
    const mockEmoticons: Emoticon[] = [
      {
        id: "smile",
        name: ":smile:",
        url: "/emoticons/smile.png",
        category: "basic",
        isAnimated: false,
      },
      {
        id: "laugh",
        name: ":laugh:",
        url: "/emoticons/laugh.png",
        category: "basic",
        isAnimated: true,
      },
      {
        id: "cool",
        name: ":cool:",
        url: "/emoticons/cool.png",
        category: "basic",
        isAnimated: false,
      },
      {
        id: "fire",
        name: ":fire:",
        url: "/emoticons/fire.png",
        category: "premium",
        isAnimated: true,
        cost: 10,
      },
      {
        id: "diamond",
        name: ":diamond:",
        url: "/emoticons/diamond.png",
        category: "vip",
        isAnimated: true,
        cost: 50,
      },
      {
        id: "jackpot",
        name: ":jackpot:",
        url: "/emoticons/jackpot.png",
        category: "premium",
        isAnimated: true,
        cost: 25,
      },
    ];

    mockEmoticons.forEach((emoticon) => {
      this.emoticons.set(emoticon.id, emoticon);
    });

    // Mock user badges
    const mockBadges: UserBadge[] = [
      {
        id: "newbie",
        name: "Newbie",
        icon: "🌟",
        color: "#4CAF50",
        requirement: "Join your first live game",
      },
      {
        id: "regular",
        name: "Regular",
        icon: "🎯",
        color: "#2196F3",
        requirement: "Play 50 live games",
      },
      {
        id: "vip",
        name: "VIP",
        icon: "👑",
        color: "#FF9800",
        requirement: "Reach VIP status",
      },
      {
        id: "high_roller",
        name: "High Roller",
        icon: "💎",
        color: "#E91E63",
        requirement: "Bet over $1000",
        isRare: true,
      },
      {
        id: "lucky",
        name: "Lucky Winner",
        icon: "🍀",
        color: "#4CAF50",
        requirement: "Win 10 games in a row",
        isRare: true,
      },
    ];

    // Mock moderators
    const mockModerators: Moderator[] = [
      {
        id: "mod1",
        username: "LiveGamesMod",
        level: "moderator",
        permissions: {
          mute: true,
          ban: false,
          delete: true,
          timeout: true,
          announce: false,
          moderateEmoticons: true,
          viewUserDetails: true,
        },
      },
      {
        id: "admin1",
        username: "GameAdmin",
        level: "admin",
        permissions: {
          mute: true,
          ban: true,
          delete: true,
          timeout: true,
          announce: true,
          moderateEmoticons: true,
          viewUserDetails: true,
        },
      },
    ];

    mockModerators.forEach((mod) => {
      this.moderators.set(mod.id, mod);
    });

    // Mock chat filters
    const mockFilters: ChatFilter[] = [
      {
        id: "profanity",
        type: "word",
        pattern: "badword|inappropriate",
        action: "delete",
        severity: "high",
        isActive: true,
      },
      {
        id: "spam",
        type: "spam",
        pattern: "repeated_message",
        action: "mute",
        severity: "medium",
        isActive: true,
      },
      {
        id: "caps",
        type: "caps",
        pattern: "ALL_CAPS_MESSAGE",
        action: "warn",
        severity: "low",
        isActive: true,
      },
      {
        id: "links",
        type: "links",
        pattern: "http|www\\.",
        action: "delete",
        severity: "medium",
        isActive: true,
      },
    ];

    mockFilters.forEach((filter) => {
      this.chatFilters.set(filter.id, filter);
    });

    // Generate mock chat messages
    this.generateMockChatMessages();
  }

  private generateMockChatMessages(): void {
    const usernames = [
      "Player123",
      "LuckyGamer",
      "CardShark",
      "BetMaster",
      "VIPPlayer",
      "CasinoFan",
    ];
    const messages = [
      "Good luck everyone!",
      "Nice win!",
      "The dealer is on fire today!",
      "Anyone else betting on red?",
      "Great hand!",
      "This table is lucky tonight",
      "Time for a big bet!",
      "The cards are hot!",
    ];

    this.streams.forEach((stream, streamId) => {
      const streamMessages: ChatMessage[] = [];

      for (let i = 0; i < 50; i++) {
        const username =
          usernames[Math.floor(Math.random() * usernames.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];

        streamMessages.push({
          id: `msg_${streamId}_${i}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          username,
          message,
          timestamp: Date.now() - (50 - i) * 30000, // 30 seconds apart
          type: Math.random() > 0.95 ? "tip" : "message",
          badges: Math.random() > 0.7 ? ["regular"] : undefined,
          color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
        });
      }

      this.chatMessages.set(streamId, streamMessages);
    });
  }

  // Public API methods
  public async getActiveStreams(): Promise<StreamSource[]> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("get_active_streams", {});
        return response.streams || [];
      }
    } catch (error) {
      console.warn(
        "Failed to fetch active streams from server, using mock data",
      );
    }

    return Array.from(this.streams.values()).filter(
      (stream) => stream.isActive,
    );
  }

  public async getStreamById(streamId: string): Promise<StreamSource | null> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("get_stream", {
          streamId,
        });
        return response.stream || null;
      }
    } catch (error) {
      console.warn("Failed to fetch stream from server, using mock data");
    }

    return this.streams.get(streamId) || null;
  }

  public async joinStream(streamId: string): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("join_stream", {
          streamId,
        });
        return response.success || false;
      }
    } catch (error) {
      console.warn("Failed to join stream on server, using mock behavior");
    }

    // Mock successful join
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.viewers += 1;
      return true;
    }
    return false;
  }

  public async leaveStream(streamId: string): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("leave_stream", {
          streamId,
        });
        return response.success || false;
      }
    } catch (error) {
      console.warn("Failed to leave stream on server, using mock behavior");
    }

    // Mock successful leave
    const stream = this.streams.get(streamId);
    if (stream && stream.viewers > 0) {
      stream.viewers -= 1;
      return true;
    }
    return false;
  }

  public async sendChatMessage(
    streamId: string,
    message: string,
    replyTo?: string,
  ): Promise<ChatMessage | null> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("send_message", {
          streamId,
          message,
          replyTo,
        });
        return response.message || null;
      }
    } catch (error) {
      console.warn("Failed to send message to server, using mock behavior");
    }

    // Mock message creation
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: "current_user",
      username: "You",
      message,
      timestamp: Date.now(),
      type: "message",
      color: "#4CAF50",
      reply: replyTo
        ? {
            messageId: replyTo,
            username: "SomeUser",
            message: "Previous message...",
          }
        : undefined,
    };

    const messages = this.chatMessages.get(streamId) || [];
    messages.push(newMessage);
    this.chatMessages.set(streamId, messages);

    return newMessage;
  }

  public async getChatMessages(
    streamId: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("get_chat_messages", {
          streamId,
          limit,
        });
        return response.messages || [];
      }
    } catch (error) {
      console.warn(
        "Failed to fetch chat messages from server, using mock data",
      );
    }

    const messages = this.chatMessages.get(streamId) || [];
    return messages.slice(-limit);
  }

  public async getAvailableEmoticons(category?: string): Promise<Emoticon[]> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("get_emoticons", {
          category,
        });
        return response.emoticons || [];
      }
    } catch (error) {
      console.warn("Failed to fetch emoticons from server, using mock data");
    }

    const emoticons = Array.from(this.emoticons.values());
    return category
      ? emoticons.filter((e) => e.category === category)
      : emoticons;
  }

  public async purchaseEmoticon(emoticonId: string): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("purchase_emoticon", {
          emoticonId,
        });
        return response.success || false;
      }
    } catch (error) {
      console.warn(
        "Failed to purchase emoticon from server, using mock behavior",
      );
    }

    // Mock successful purchase
    return true;
  }

  public async tipDealer(
    streamId: string,
    dealerId: string,
    amount: number,
    message?: string,
  ): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("tip_dealer", {
          streamId,
          dealerId,
          amount,
          message,
        });
        return response.success || false;
      }
    } catch (error) {
      console.warn("Failed to send tip to server, using mock behavior");
    }

    // Mock successful tip
    const tipAlert: TipAlert = {
      id: `tip_${Date.now()}`,
      fromUser: "You",
      toDealer: "Dealer Sarah",
      amount,
      message,
      timestamp: Date.now(),
      isVisible: true,
      duration: 5000,
    };

    this.handleTipAlert(tipAlert);
    return true;
  }

  public async moderateUser(
    userId: string,
    action: string,
    reason: string,
    duration?: number,
  ): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("moderate_user", {
          userId,
          action,
          reason,
          duration,
        });
        return response.success || false;
      }
    } catch (error) {
      console.warn("Failed to moderate user on server, using mock behavior");
    }

    // Mock successful moderation
    return true;
  }

  public async changeStreamQuality(
    streamId: string,
    qualityId: string,
  ): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("change_quality", {
          streamId,
          qualityId,
        });
        return response.success || false;
      }
    } catch (error) {
      console.warn("Failed to change quality on server, using mock behavior");
    }

    // Mock successful quality change
    return true;
  }

  public async getStreamStats(streamId: string): Promise<StreamStats | null> {
    try {
      if (this.socket?.connected) {
        const response = await this.emitWithResponse("get_stream_stats", {
          streamId,
        });
        return response.stats || null;
      }
    } catch (error) {
      console.warn("Failed to fetch stream stats from server, using mock data");
    }

    // Mock stream stats
    const stream = this.streams.get(streamId);
    if (!stream) return null;

    return {
      streamId,
      viewers: {
        current: stream.viewers,
        peak: Math.floor(stream.viewers * 1.5),
        total: Math.floor(stream.viewers * 10),
      },
      quality: {
        current: stream.quality[1], // 1080p
        switches: Math.floor(Math.random() * 10),
        buffering: Math.floor(Math.random() * 5),
        errors: Math.floor(Math.random() * 3),
      },
      chat: {
        messages: this.chatMessages.get(streamId)?.length || 0,
        activeUsers: Math.floor(stream.viewers * 0.3),
        moderationActions: Math.floor(Math.random() * 5),
      },
      performance: {
        latency: 150 + Math.floor(Math.random() * 100),
        bitrate: 6000 + Math.floor(Math.random() * 1000),
        fps: 60,
        droppedFrames: Math.floor(Math.random() * 10),
      },
    };
  }

  public updateSettings(newSettings: Partial<StreamSettings>): void {
    this.streamSettings = { ...this.streamSettings, ...newSettings };

    if (this.socket?.connected) {
      this.socket.emit("update_settings", this.streamSettings);
    }
  }

  public getSettings(): StreamSettings {
    return { ...this.streamSettings };
  }

  public getUserBadges(userId: string): UserBadge[] {
    return this.userBadges.get(userId) || [];
  }

  public getModerators(): Moderator[] {
    return Array.from(this.moderators.values());
  }

  public getChatFilters(): ChatFilter[] {
    return Array.from(this.chatFilters.values());
  }

  public isUserModerator(userId: string): boolean {
    return this.moderators.has(userId);
  }

  public canUserChat(userId: string): boolean {
    const status = this.userStatuses.get(userId);
    return !status || status.permissions.canChat;
  }

  // Event handlers
  private handleStreamUpdate(data: Partial<StreamSource>): void {
    if (data.id) {
      const existing = this.streams.get(data.id);
      if (existing) {
        this.streams.set(data.id, { ...existing, ...data });
      }
    }
  }

  private handleChatMessage(message: ChatMessage): void {
    // Apply chat filters
    if (this.shouldFilterMessage(message)) {
      return;
    }

    // Process emoticons
    message.emoticons = this.processEmoticons(message.message);

    // Add to appropriate stream chat
    const streamIds = Array.from(this.chatMessages.keys());
    streamIds.forEach((streamId) => {
      const messages = this.chatMessages.get(streamId) || [];
      messages.push(message);

      // Keep only recent messages
      if (messages.length > 100) {
        messages.splice(0, messages.length - 100);
      }

      this.chatMessages.set(streamId, messages);
    });
  }

  private handleUserJoined(data: { streamId: string; username: string }): void {
    const stream = this.streams.get(data.streamId);
    if (stream) {
      stream.viewers += 1;
    }
  }

  private handleUserLeft(data: { streamId: string; username: string }): void {
    const stream = this.streams.get(data.streamId);
    if (stream && stream.viewers > 0) {
      stream.viewers -= 1;
    }
  }

  private handleModerationAction(action: ModerationAction): void {
    // Update user status based on moderation action
    const userId = action.userId;
    let status = this.userStatuses.get(userId) || {
      id: userId,
      username: "Unknown",
      status: "active",
      permissions: {
        canChat: true,
        canTip: true,
        canUseEmoticons: true,
      },
      violations: 0,
      lastActivity: Date.now(),
    };

    switch (action.action) {
      case "mute":
        status.status = "muted";
        status.permissions.canChat = false;
        break;
      case "unmute":
        status.status = "active";
        status.permissions.canChat = true;
        break;
      case "ban":
        status.status = "banned";
        status.permissions = {
          canChat: false,
          canTip: false,
          canUseEmoticons: false,
        };
        break;
      case "timeout":
        status.status = "timeout";
        status.permissions.canChat = false;
        status.timeoutUntil = Date.now() + (action.duration || 0) * 60000;
        break;
    }

    this.userStatuses.set(userId, status);
  }

  private handleTipAlert(alert: TipAlert): void {
    // Show tip alert notification
    console.log(
      `Tip Alert: ${alert.fromUser} tipped ${alert.toDealer} ${alert.amount} SC`,
    );

    // In a real implementation, this would trigger UI notifications
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("tipAlert", { detail: alert }));
    }
  }

  private handleStreamNotification(notification: StreamNotification): void {
    console.log(
      `Stream Notification: ${notification.title} - ${notification.message}`,
    );

    // In a real implementation, this would trigger UI notifications
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(
        new CustomEvent("streamNotification", { detail: notification }),
      );
    }
  }

  // Helper methods
  private shouldFilterMessage(message: ChatMessage): boolean {
    const filters = Array.from(this.chatFilters.values()).filter(
      (f) => f.isActive,
    );

    for (const filter of filters) {
      if (this.messageMatchesFilter(message.message, filter)) {
        this.applyFilterAction(message, filter);
        return filter.action === "delete";
      }
    }

    return false;
  }

  private messageMatchesFilter(message: string, filter: ChatFilter): boolean {
    switch (filter.type) {
      case "word":
        return new RegExp(filter.pattern, "i").test(message);
      case "regex":
        return new RegExp(filter.pattern).test(message);
      case "spam":
        // Simple spam detection - same message repeated
        return false; // Would need more complex logic
      case "caps":
        return message === message.toUpperCase() && message.length > 10;
      case "links":
        return new RegExp(filter.pattern, "i").test(message);
      default:
        return false;
    }
  }

  private applyFilterAction(message: ChatMessage, filter: ChatFilter): void {
    const userId = message.userId;

    switch (filter.action) {
      case "warn":
        console.log(`Warning user ${userId} for message: ${message.message}`);
        break;
      case "mute":
        this.moderateUser(
          userId,
          "mute",
          `Automatic action: ${filter.type} filter`,
        );
        break;
      case "ban":
        this.moderateUser(
          userId,
          "ban",
          `Automatic action: ${filter.type} filter`,
        );
        break;
      case "delete":
        console.log(`Deleting message from user ${userId}: ${message.message}`);
        break;
    }
  }

  private processEmoticons(
    message: string,
  ): Array<{ name: string; url: string; position: [number, number] }> {
    const emoticons: Array<{
      name: string;
      url: string;
      position: [number, number];
    }> = [];
    const emoticonArray = Array.from(this.emoticons.values());

    emoticonArray.forEach((emoticon) => {
      const regex = new RegExp(
        emoticon.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "g",
      );
      let match;

      while ((match = regex.exec(message)) !== null) {
        emoticons.push({
          name: emoticon.name,
          url: emoticon.url,
          position: [match.index, match.index + match[0].length],
        });
      }
    });

    return emoticons;
  }

  private async emitWithResponse(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error("Socket not connected"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Request timeout"));
      }, 10000);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  public connect(): void {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
  }

  public destroy(): void {
    this.disconnect();
    this.streams.clear();
    this.chatMessages.clear();
    this.moderators.clear();
    this.userBadges.clear();
    this.emoticons.clear();
    this.chatFilters.clear();
    this.userStatuses.clear();
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
export default streamingService;
