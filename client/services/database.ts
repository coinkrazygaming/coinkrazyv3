// Client-side API service for database operations
class DatabaseAPIService {
  private static instance: DatabaseAPIService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = "/api";
  }

  static getInstance(): DatabaseAPIService {
    if (!DatabaseAPIService.instance) {
      DatabaseAPIService.instance = new DatabaseAPIService();
    }
    return DatabaseAPIService.instance;
  }

  private async fetch(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  // User management
  async createUser(userData: {
    email: string;
    password_hash: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }) {
    return this.fetch("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getUserByEmail(email: string) {
    return this.fetch(`/users/email/${encodeURIComponent(email)}`);
  }

  async getUserByUsername(username: string) {
    return this.fetch(`/users/username/${encodeURIComponent(username)}`);
  }

  async verifyEmail(token: string) {
    return this.fetch("/users/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // Balance management
  async getUserBalance(userId: number) {
    return this.fetch(`/balances/${userId}`);
  }

  async updateUserBalance(
    userId: number,
    gcChange: number,
    scChange: number,
    description: string,
    gameId?: string,
  ) {
    return this.fetch(`/balances/${userId}/update`, {
      method: "POST",
      body: JSON.stringify({ gcChange, scChange, description, gameId }),
    });
  }

  // Game management
  async getAllGames() {
    return this.fetch("/games");
  }

  async getActiveGames() {
    return this.fetch("/games/active");
  }

  async updateGameStats(gameId: string, profitGC: number, profitSC: number) {
    return this.fetch(`/games/${gameId}/stats`, {
      method: "POST",
      body: JSON.stringify({ profitGC, profitSC }),
    });
  }

  // Admin methods
  async getAllUsers(limit: number = 50, offset: number = 0) {
    return this.fetch(`/admin/users?limit=${limit}&offset=${offset}`);
  }

  async getRecentTransactions(limit: number = 50) {
    return this.fetch(`/admin/transactions?limit=${limit}`);
  }

  async getLiveStats() {
    return this.fetch("/admin/stats");
  }

  async updateLiveStat(statName: string, value: number, metadata?: any) {
    return this.fetch(`/admin/stats/${encodeURIComponent(statName)}`, {
      method: "POST",
      body: JSON.stringify({ value, metadata }),
    });
  }

  // AI Employees
  async getAIEmployees() {
    return this.fetch("/ai-employees");
  }

  async updateAIEmployeeMetrics(
    id: number,
    tasksCompleted: number,
    moneySaved: number,
  ) {
    return this.fetch(`/ai-employees/${id}/metrics`, {
      method: "POST",
      body: JSON.stringify({ tasksCompleted, moneySaved }),
    });
  }

  // Notifications
  async createAdminNotification(
    title: string,
    message: string,
    type: string,
    fromAI?: number,
    actionRequired: boolean = false,
    actionUrl?: string,
  ) {
    return this.fetch("/notifications", {
      method: "POST",
      body: JSON.stringify({
        title,
        message,
        type,
        fromAI,
        actionRequired,
        actionUrl,
      }),
    });
  }

  async getUnreadNotifications() {
    return this.fetch("/notifications/unread");
  }

  async markNotificationRead(id: number) {
    return this.fetch(`/notifications/${id}/read`, {
      method: "POST",
    });
  }

  // Coin packages
  async getCoinPackages() {
    return this.fetch("/coin-packages");
  }

  // Daily wheel spins
  async getDailyWheelSpin(
    userId: number,
    date: string = new Date().toISOString().split("T")[0],
  ) {
    return this.fetch(
      `/wheel-spins/${userId}?date=${encodeURIComponent(date)}`,
    );
  }

  async createWheelSpin(userId: number, scWon: number) {
    return this.fetch(`/wheel-spins/${userId}`, {
      method: "POST",
      body: JSON.stringify({ scWon }),
    });
  }

  // Helper methods for backwards compatibility
  async createUserBalance(userId: number, gc: number = 0, sc: number = 0) {
    return this.updateUserBalance(userId, gc, sc, "Initial balance");
  }

  async query(text: string, params?: any[]): Promise<any> {
    throw new Error(
      "Direct SQL queries not supported in client-side API service",
    );
  }

  async close() {
    // No-op for client-side service
  }
}

export const databaseService = DatabaseAPIService.getInstance();
export default databaseService;
