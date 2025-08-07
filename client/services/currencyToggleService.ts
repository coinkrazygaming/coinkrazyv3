import { CurrencyType } from './walletService';

export type GameCurrencyType = "GC" | "SC";

export interface CurrencyPreferences {
  userId: string;
  preferredCurrency: GameCurrencyType;
  lastUpdated: Date;
  autoSwitchEnabled: boolean;
  gameSpecificPreferences: Record<string, GameCurrencyType>;
}

export interface CurrencyToggleState {
  selectedCurrency: GameCurrencyType;
  isToggling: boolean;
  lastToggleTime: Date;
}

class CurrencyToggleService {
  private static instance: CurrencyToggleService;
  private preferences: Map<string, CurrencyPreferences> = new Map();
  private toggleStates: Map<string, CurrencyToggleState> = new Map();
  private listeners: Map<string, Set<(currency: GameCurrencyType) => void>> = new Map();
  private globalListeners: Set<(userId: string, currency: GameCurrencyType) => void> = new Set();

  static getInstance(): CurrencyToggleService {
    if (!CurrencyToggleService.instance) {
      CurrencyToggleService.instance = new CurrencyToggleService();
    }
    return CurrencyToggleService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultPreferences();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('currency_preferences');
      if (stored) {
        const data = JSON.parse(stored);
        Object.entries(data).forEach(([userId, prefs]: [string, any]) => {
          this.preferences.set(userId, {
            ...prefs,
            lastUpdated: new Date(prefs.lastUpdated)
          });
        });
      }

      const toggleStates = localStorage.getItem('currency_toggle_states');
      if (toggleStates) {
        const data = JSON.parse(toggleStates);
        Object.entries(data).forEach(([userId, state]: [string, any]) => {
          this.toggleStates.set(userId, {
            ...state,
            lastToggleTime: new Date(state.lastToggleTime)
          });
        });
      }
    } catch (error) {
      console.error('Failed to load currency preferences from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const prefsObj = Object.fromEntries(this.preferences.entries());
      localStorage.setItem('currency_preferences', JSON.stringify(prefsObj));

      const statesObj = Object.fromEntries(this.toggleStates.entries());
      localStorage.setItem('currency_toggle_states', JSON.stringify(statesObj));
    } catch (error) {
      console.error('Failed to save currency preferences to storage:', error);
    }
  }

  private initializeDefaultPreferences() {
    // Set default preferences for demo users
    const defaultUsers = [
      'user-1', 'user-2', 'user-3'
    ];

    defaultUsers.forEach(userId => {
      if (!this.preferences.has(userId)) {
        this.preferences.set(userId, {
          userId,
          preferredCurrency: 'GC',
          lastUpdated: new Date(),
          autoSwitchEnabled: true,
          gameSpecificPreferences: {}
        });
      }

      if (!this.toggleStates.has(userId)) {
        this.toggleStates.set(userId, {
          selectedCurrency: 'GC',
          isToggling: false,
          lastToggleTime: new Date()
        });
      }
    });
  }

  // Get user's current selected currency
  getUserCurrency(userId: string): GameCurrencyType {
    const state = this.toggleStates.get(userId);
    if (state) {
      return state.selectedCurrency;
    }

    const prefs = this.preferences.get(userId);
    if (prefs) {
      return prefs.preferredCurrency;
    }

    // Default to Gold Coins for new users
    return 'GC';
  }

  // Set user's preferred currency globally
  setUserCurrency(userId: string, currency: GameCurrencyType): void {
    // Update preferences
    const currentPrefs = this.preferences.get(userId) || {
      userId,
      preferredCurrency: 'GC',
      lastUpdated: new Date(),
      autoSwitchEnabled: true,
      gameSpecificPreferences: {}
    };

    const updatedPrefs: CurrencyPreferences = {
      ...currentPrefs,
      preferredCurrency: currency,
      lastUpdated: new Date()
    };

    this.preferences.set(userId, updatedPrefs);

    // Update toggle state
    const currentState = this.toggleStates.get(userId) || {
      selectedCurrency: 'GC',
      isToggling: false,
      lastToggleTime: new Date()
    };

    const updatedState: CurrencyToggleState = {
      ...currentState,
      selectedCurrency: currency,
      isToggling: false,
      lastToggleTime: new Date()
    };

    this.toggleStates.set(userId, updatedState);

    // Save to storage
    this.saveToStorage();

    // Notify listeners
    this.notifyListeners(userId, currency);
  }

  // Toggle between GC and SC
  toggleUserCurrency(userId: string): GameCurrencyType {
    const currentCurrency = this.getUserCurrency(userId);
    const newCurrency: GameCurrencyType = currentCurrency === 'GC' ? 'SC' : 'GC';
    
    // Set toggling state
    const currentState = this.toggleStates.get(userId);
    if (currentState) {
      currentState.isToggling = true;
      this.toggleStates.set(userId, currentState);
    }

    // Short delay for UI feedback
    setTimeout(() => {
      this.setUserCurrency(userId, newCurrency);
    }, 150);

    return newCurrency;
  }

  // Check if user is currently toggling
  isUserToggling(userId: string): boolean {
    const state = this.toggleStates.get(userId);
    return state?.isToggling || false;
  }

  // Get currency display information
  getCurrencyDisplay(currency: GameCurrencyType): {
    name: string;
    shortName: string;
    symbol: string;
    color: string;
    description: string;
  } {
    switch (currency) {
      case 'GC':
        return {
          name: 'Gold Coins',
          shortName: 'GC',
          symbol: '🪙',
          color: '#FFD700',
          description: 'Play coins for entertainment gaming'
        };
      case 'SC':
        return {
          name: 'Sweeps Coins',
          shortName: 'SC', 
          symbol: '💎',
          color: '#6366F1',
          description: 'Premium coins for sweepstakes entries'
        };
      default:
        return {
          name: 'Gold Coins',
          shortName: 'GC',
          symbol: '🪙',
          color: '#FFD700',
          description: 'Play coins for entertainment gaming'
        };
    }
  }

  // Set game-specific currency preference
  setGameCurrency(userId: string, gameType: string, currency: GameCurrencyType): void {
    const prefs = this.preferences.get(userId) || {
      userId,
      preferredCurrency: 'GC',
      lastUpdated: new Date(),
      autoSwitchEnabled: true,
      gameSpecificPreferences: {}
    };

    prefs.gameSpecificPreferences[gameType] = currency;
    prefs.lastUpdated = new Date();
    
    this.preferences.set(userId, prefs);
    this.saveToStorage();

    // If auto-switch is enabled, update global preference
    if (prefs.autoSwitchEnabled) {
      this.setUserCurrency(userId, currency);
    }
  }

  // Get game-specific currency preference
  getGameCurrency(userId: string, gameType: string): GameCurrencyType {
    const prefs = this.preferences.get(userId);
    if (prefs && prefs.gameSpecificPreferences[gameType]) {
      return prefs.gameSpecificPreferences[gameType];
    }
    
    return this.getUserCurrency(userId);
  }

  // Enable/disable auto-switch for currency
  setAutoSwitch(userId: string, enabled: boolean): void {
    const prefs = this.preferences.get(userId);
    if (prefs) {
      prefs.autoSwitchEnabled = enabled;
      prefs.lastUpdated = new Date();
      this.preferences.set(userId, prefs);
      this.saveToStorage();
    }
  }

  // Subscribe to currency changes for specific user
  subscribeToUserCurrency(
    userId: string, 
    callback: (currency: GameCurrencyType) => void
  ): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }

    this.listeners.get(userId)!.add(callback);

    // Call immediately with current currency
    callback(this.getUserCurrency(userId));

    return () => {
      this.listeners.get(userId)?.delete(callback);
    };
  }

  // Subscribe to all currency changes globally
  subscribeToGlobalCurrency(
    callback: (userId: string, currency: GameCurrencyType) => void
  ): () => void {
    this.globalListeners.add(callback);

    return () => {
      this.globalListeners.delete(callback);
    };
  }

  private notifyListeners(userId: string, currency: GameCurrencyType): void {
    // Notify user-specific listeners
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(callback => callback(currency));
    }

    // Notify global listeners
    this.globalListeners.forEach(callback => callback(userId, currency));
  }

  // Get all user preferences (admin function)
  getAllPreferences(): CurrencyPreferences[] {
    return Array.from(this.preferences.values()).sort((a, b) => 
      b.lastUpdated.getTime() - a.lastUpdated.getTime()
    );
  }

  // Get currency statistics
  getCurrencyStats(): {
    totalUsers: number;
    gcUsers: number;
    scUsers: number;
    gcPercentage: number;
    scPercentage: number;
    autoSwitchEnabled: number;
  } {
    const allPrefs = this.getAllPreferences();
    const totalUsers = allPrefs.length;
    const gcUsers = allPrefs.filter(p => p.preferredCurrency === 'GC').length;
    const scUsers = allPrefs.filter(p => p.preferredCurrency === 'SC').length;
    const autoSwitchEnabled = allPrefs.filter(p => p.autoSwitchEnabled).length;

    return {
      totalUsers,
      gcUsers,
      scUsers,
      gcPercentage: totalUsers > 0 ? (gcUsers / totalUsers) * 100 : 0,
      scPercentage: totalUsers > 0 ? (scUsers / totalUsers) * 100 : 0,
      autoSwitchEnabled
    };
  }

  // Convert currency type to wallet service format
  toWalletCurrency(gameCurrency: GameCurrencyType): CurrencyType {
    return gameCurrency as CurrencyType;
  }

  // Convert wallet service currency to game currency
  fromWalletCurrency(walletCurrency: CurrencyType): GameCurrencyType | null {
    if (walletCurrency === 'GC' || walletCurrency === 'SC') {
      return walletCurrency;
    }
    return null;
  }

  // Reset user preferences (admin function)
  resetUserPreferences(userId: string): void {
    this.preferences.delete(userId);
    this.toggleStates.delete(userId);
    this.listeners.delete(userId);
    this.saveToStorage();
  }

  // Bulk update preferences (admin function)
  bulkUpdatePreferences(updates: Array<{
    userId: string;
    preferredCurrency: GameCurrencyType;
    autoSwitchEnabled?: boolean;
  }>): void {
    updates.forEach(update => {
      const currentPrefs = this.preferences.get(update.userId);
      if (currentPrefs) {
        currentPrefs.preferredCurrency = update.preferredCurrency;
        if (update.autoSwitchEnabled !== undefined) {
          currentPrefs.autoSwitchEnabled = update.autoSwitchEnabled;
        }
        currentPrefs.lastUpdated = new Date();
        this.preferences.set(update.userId, currentPrefs);
        
        // Update toggle state
        this.setUserCurrency(update.userId, update.preferredCurrency);
      }
    });

    this.saveToStorage();
  }
}

export const currencyToggleService = CurrencyToggleService.getInstance();
