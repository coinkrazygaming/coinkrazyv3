export interface CurrencyData {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  exchangeRate: number; // Rate to USD
  icon: string;
  color: string;
}

export interface WalletBalance {
  userId: string;
  currencies: {
    [key: string]: {
      balance: number;
      locked: number;
      available: number;
      lastUpdated: Date;
    };
  };
  totalUSDValue: number;
  lastActivity: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'game_win' | 'game_loss' | 'bonus' | 'exchange';
  currency: string;
  amount: number;
  balanceAfter: number;
  description: string;
  gameId?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  metadata?: Record<string, any>;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  spread: number;
}

class WalletService {
  private static instance: WalletService;
  private balances: Map<string, WalletBalance> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private exchangeRates: Map<string, ExchangeRate[]> = new Map();
  private listeners: Map<string, Set<(balance: WalletBalance) => void>> = new Map();
  private currencyListeners: Set<(currency: string) => void> = new Set();
  private selectedCurrency: string = 'USD';

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  constructor() {
    this.initializeDefaultData();
    this.startRealTimeUpdates();
    this.startExchangeRateUpdates();
  }

  private supportedCurrencies: CurrencyData[] = [
    {
      code: 'USD',
      name: 'US Dollar',
      symbol: '$',
      decimals: 2,
      exchangeRate: 1.0,
      icon: '💵',
      color: '#22c55e'
    },
    {
      code: 'GC',
      name: 'Gold Coins',
      symbol: 'GC',
      decimals: 0,
      exchangeRate: 0.0001, // 10,000 GC = $1
      icon: '🪙',
      color: '#f59e0b'
    },
    {
      code: 'SC',
      name: 'Sweeps Coins',
      symbol: 'SC',
      decimals: 2,
      exchangeRate: 1.0, // 1 SC = $1
      icon: '👑',
      color: '#3b82f6'
    },
    {
      code: 'BTC',
      name: 'Bitcoin',
      symbol: '₿',
      decimals: 8,
      exchangeRate: 45000.0,
      icon: '₿',
      color: '#f7931a'
    },
    {
      code: 'ETH',
      name: 'Ethereum',
      symbol: 'Ξ',
      decimals: 6,
      exchangeRate: 2800.0,
      icon: '⟠',
      color: '#627eea'
    },
    {
      code: 'USDT',
      name: 'Tether USD',
      symbol: '₮',
      decimals: 2,
      exchangeRate: 1.0,
      icon: '₮',
      color: '#26a17b'
    }
  ];

  private initializeDefaultData() {
    // Initialize user balances
    const defaultUsers = [
      { 
        userId: 'coinkrazy00@gmail.com', 
        balances: { USD: 10000, GC: 1000000, SC: 5000, BTC: 0.5, ETH: 5, USDT: 2500 }
      },
      { 
        userId: 'test@example.com', 
        balances: { USD: 2500, GC: 75000, SC: 250, BTC: 0.1, ETH: 1.5, USDT: 1000 }
      },
      { 
        userId: 'staff@example.com', 
        balances: { USD: 1000, GC: 50000, SC: 100, BTC: 0.05, ETH: 0.8, USDT: 500 }
      }
    ];

    defaultUsers.forEach(user => {
      const walletBalance: WalletBalance = {
        userId: user.userId,
        currencies: {},
        totalUSDValue: 0,
        lastActivity: new Date()
      };

      Object.entries(user.balances).forEach(([currency, balance]) => {
        walletBalance.currencies[currency] = {
          balance,
          locked: 0,
          available: balance,
          lastUpdated: new Date()
        };
      });

      walletBalance.totalUSDValue = this.calculateUSDValue(walletBalance);
      this.balances.set(user.userId, walletBalance);
    });
  }

  private calculateUSDValue(wallet: WalletBalance): number {
    let total = 0;
    Object.entries(wallet.currencies).forEach(([currency, data]) => {
      const currencyInfo = this.supportedCurrencies.find(c => c.code === currency);
      if (currencyInfo) {
        total += data.available * currencyInfo.exchangeRate;
      }
    });
    return total;
  }

  private startRealTimeUpdates() {
    // Simulate real-time balance changes
    setInterval(() => {
      this.simulateMarketActivity();
    }, 2000);

    // Update portfolio values
    setInterval(() => {
      this.updatePortfolioValues();
    }, 5000);
  }

  private startExchangeRateUpdates() {
    // Simulate real-time exchange rate updates
    setInterval(() => {
      this.updateExchangeRates();
    }, 10000);
  }

  private simulateMarketActivity() {
    // Randomly update some user balances to simulate activity
    const userIds = Array.from(this.balances.keys());
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
    
    if (randomUser) {
      const wallet = this.balances.get(randomUser);
      if (wallet) {
        // Small random changes to simulate gameplay/trading
        const currencies = ['GC', 'SC'];
        const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
        
        if (wallet.currencies[randomCurrency]) {
          const change = Math.floor(Math.random() * 1000) - 500; // -500 to +500
          this.updateBalance(randomUser, randomCurrency, change, 'Market Activity');
        }
      }
    }
  }

  private updateExchangeRates() {
    // Simulate crypto price movements
    this.supportedCurrencies.forEach(currency => {
      if (currency.code === 'BTC' || currency.code === 'ETH') {
        const volatility = 0.01; // 1% max change
        const change = (Math.random() - 0.5) * 2 * volatility;
        currency.exchangeRate *= (1 + change);
      }
    });

    // Update all portfolio values
    this.updatePortfolioValues();
  }

  private updatePortfolioValues() {
    this.balances.forEach((wallet, userId) => {
      const oldTotal = wallet.totalUSDValue;
      wallet.totalUSDValue = this.calculateUSDValue(wallet);
      
      if (Math.abs(oldTotal - wallet.totalUSDValue) > 0.01) {
        this.notifyBalanceChange(userId, wallet);
      }
    });
  }

  // Public methods
  getUserBalance(userId: string): WalletBalance {
    let balance = this.balances.get(userId);
    if (!balance) {
      // Create new user with welcome balances
      balance = {
        userId,
        currencies: {
          USD: { balance: 100, locked: 0, available: 100, lastUpdated: new Date() },
          GC: { balance: 50000, locked: 0, available: 50000, lastUpdated: new Date() },
          SC: { balance: 25, locked: 0, available: 25, lastUpdated: new Date() }
        },
        totalUSDValue: 0,
        lastActivity: new Date()
      };
      balance.totalUSDValue = this.calculateUSDValue(balance);
      this.balances.set(userId, balance);

      // Add welcome transactions
      this.addTransaction(userId, 'bonus', 'GC', 50000, 'Welcome Bonus - Gold Coins');
      this.addTransaction(userId, 'bonus', 'SC', 25, 'Welcome Bonus - Sweeps Coins');
      this.addTransaction(userId, 'bonus', 'USD', 100, 'Welcome Bonus - Starting Credits');
    }
    return balance;
  }

  updateBalance(userId: string, currency: string, amount: number, description: string): WalletBalance {
    const wallet = this.getUserBalance(userId);
    
    if (!wallet.currencies[currency]) {
      wallet.currencies[currency] = {
        balance: 0,
        locked: 0,
        available: 0,
        lastUpdated: new Date()
      };
    }

    const currencyData = wallet.currencies[currency];
    const newBalance = Math.max(0, currencyData.balance + amount);
    const newAvailable = Math.max(0, currencyData.available + amount);

    currencyData.balance = newBalance;
    currencyData.available = newAvailable;
    currencyData.lastUpdated = new Date();

    wallet.totalUSDValue = this.calculateUSDValue(wallet);
    wallet.lastActivity = new Date();

    // Add transaction record
    this.addTransaction(
      userId, 
      amount > 0 ? 'deposit' : 'withdrawal', 
      currency, 
      Math.abs(amount), 
      description
    );

    this.notifyBalanceChange(userId, wallet);
    return wallet;
  }

  exchangeCurrency(userId: string, fromCurrency: string, toCurrency: string, amount: number): boolean {
    const wallet = this.getUserBalance(userId);
    
    if (!wallet.currencies[fromCurrency] || wallet.currencies[fromCurrency].available < amount) {
      return false;
    }

    const fromRate = this.supportedCurrencies.find(c => c.code === fromCurrency)?.exchangeRate || 1;
    const toRate = this.supportedCurrencies.find(c => c.code === toCurrency)?.exchangeRate || 1;
    
    const usdValue = amount * fromRate;
    const exchangedAmount = usdValue / toRate;
    const fee = usdValue * 0.001; // 0.1% exchange fee
    const finalAmount = exchangedAmount * (1 - 0.001);

    // Deduct from source currency
    this.updateBalance(userId, fromCurrency, -amount, `Exchange to ${toCurrency}`);
    
    // Add to target currency
    this.updateBalance(userId, toCurrency, finalAmount, `Exchange from ${fromCurrency}`);

    return true;
  }

  private addTransaction(userId: string, type: Transaction['type'], currency: string, amount: number, description: string) {
    const wallet = this.getUserBalance(userId);
    const transaction: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      currency,
      amount,
      balanceAfter: wallet.currencies[currency]?.balance || 0,
      description,
      timestamp: new Date(),
      status: 'completed',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`
    };

    if (!this.transactions.has(userId)) {
      this.transactions.set(userId, []);
    }

    const userTransactions = this.transactions.get(userId)!;
    userTransactions.unshift(transaction);

    // Keep only last 1000 transactions per user
    if (userTransactions.length > 1000) {
      this.transactions.set(userId, userTransactions.slice(0, 1000));
    }
  }

  getUserTransactions(userId: string, limit: number = 50): Transaction[] {
    return this.transactions.get(userId)?.slice(0, limit) || [];
  }

  getSupportedCurrencies(): CurrencyData[] {
    return [...this.supportedCurrencies];
  }

  getCurrencyInfo(code: string): CurrencyData | undefined {
    return this.supportedCurrencies.find(c => c.code === code);
  }

  setSelectedCurrency(currency: string) {
    this.selectedCurrency = currency;
    this.currencyListeners.forEach(callback => callback(currency));
  }

  getSelectedCurrency(): string {
    return this.selectedCurrency;
  }

  subscribeToBalanceUpdates(userId: string, callback: (balance: WalletBalance) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(callback);

    return () => {
      this.listeners.get(userId)?.delete(callback);
    };
  }

  subscribeToCurrencyChanges(callback: (currency: string) => void): () => void {
    this.currencyListeners.add(callback);
    return () => {
      this.currencyListeners.delete(callback);
    };
  }

  private notifyBalanceChange(userId: string, balance: WalletBalance) {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(callback => callback(balance));
    }
  }

  // Portfolio analytics
  getPortfolioBreakdown(userId: string): Array<{currency: string, value: number, percentage: number}> {
    const wallet = this.getUserBalance(userId);
    const breakdown: Array<{currency: string, value: number, percentage: number}> = [];

    Object.entries(wallet.currencies).forEach(([currency, data]) => {
      const currencyInfo = this.getCurrencyInfo(currency);
      if (currencyInfo && data.available > 0) {
        const usdValue = data.available * currencyInfo.exchangeRate;
        const percentage = (usdValue / wallet.totalUSDValue) * 100;
        breakdown.push({
          currency,
          value: usdValue,
          percentage
        });
      }
    });

    return breakdown.sort((a, b) => b.value - a.value);
  }

  // Real-time price data
  getPriceData(currency: string): {price: number, change24h: number} {
    const currencyInfo = this.getCurrencyInfo(currency);
    if (!currencyInfo) return {price: 0, change24h: 0};

    // Simulate 24h price change
    const change24h = (Math.random() - 0.5) * 10; // -5% to +5%
    
    return {
      price: currencyInfo.exchangeRate,
      change24h
    };
  }
}

export const walletService = WalletService.getInstance();
export default walletService;
