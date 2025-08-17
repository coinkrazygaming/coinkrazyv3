// Capacitor Service for CoinKrazy Android App
// Handles native device features and APIs

import { Capacitor } from '@capacitor/core';
import { App, AppInfo } from '@capacitor/app';
import { Device, DeviceInfo } from '@capacitor/device';
import { Network, NetworkStatus } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { LocalNotifications } from '@capacitor/local-notifications';

class CapacitorService {
  private isNative: boolean = false;
  private deviceInfo: DeviceInfo | null = null;
  private networkStatus: NetworkStatus | null = null;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.initializeApp();
  }

  /**
   * Initialize the app with native configurations
   */
  private async initializeApp(): Promise<void> {
    if (!this.isNative) {
      console.log('Running in web mode - native features disabled');
      return;
    }

    try {
      // Get device info
      this.deviceInfo = await Device.getInfo();
      console.log('Device Info:', this.deviceInfo);

      // Get network status
      this.networkStatus = await Network.getStatus();
      console.log('Network Status:', this.networkStatus);

      // Configure status bar
      await this.configureStatusBar();

      // Hide splash screen after app loads
      await this.hideSplashScreen();

      // Set up event listeners
      this.setupEventListeners();

      console.log('✅ CoinKrazy Android app initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Capacitor:', error);
    }
  }

  /**
   * Configure the status bar appearance
   */
  private async configureStatusBar(): Promise<void> {
    if (!this.isNative) return;

    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
      console.log('Status bar configured');
    } catch (error) {
      console.error('Failed to configure status bar:', error);
    }
  }

  /**
   * Hide splash screen
   */
  private async hideSplashScreen(): Promise<void> {
    if (!this.isNative) return;

    try {
      await SplashScreen.hide();
      console.log('Splash screen hidden');
    } catch (error) {
      console.error('Failed to hide splash screen:', error);
    }
  }

  /**
   * Set up event listeners for app lifecycle and network changes
   */
  private setupEventListeners(): void {
    if (!this.isNative) return;

    // Listen for app state changes
    App.addListener('appStateChange', (state) => {
      console.log('App state changed:', state);
      if (state.isActive) {
        this.onAppResume();
      } else {
        this.onAppPause();
      }
    });

    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
      this.onNetworkChange(status);
    });

    // Listen for URL open events (deep links)
    App.addListener('appUrlOpen', (event) => {
      console.log('App opened with URL:', event.url);
      // Handle deep links here
    });
  }

  /**
   * Handle app resume
   */
  private onAppResume(): void {
    console.log('App resumed');
    // Refresh data, check for updates, etc.
  }

  /**
   * Handle app pause
   */
  private onAppPause(): void {
    console.log('App paused');
    // Save state, pause timers, etc.
  }

  /**
   * Handle network status changes
   */
  private onNetworkChange(status: NetworkStatus): void {
    console.log('Network changed:', status);
    
    if (!status.connected) {
      this.showToast('You are offline. Some features may not work.');
    } else if (status.connectionType === 'cellular') {
      this.showToast('Using cellular data. Data charges may apply.');
    }
  }

  /**
   * Show native toast message
   */
  public async showToast(message: string): Promise<void> {
    if (!this.isNative) {
      console.log('Toast (web):', message);
      return;
    }

    try {
      await Toast.show({
        text: message,
        duration: 'short',
        position: 'bottom'
      });
    } catch (error) {
      console.error('Failed to show toast:', error);
    }
  }

  /**
   * Trigger haptic feedback
   */
  public async hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    if (!this.isNative) return;

    try {
      const impactStyle = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy
      }[style];

      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.error('Failed to trigger haptic feedback:', error);
    }
  }

  /**
   * Request notification permissions and schedule local notifications
   */
  public async setupNotifications(): Promise<void> {
    if (!this.isNative) return;

    try {
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display === 'granted') {
        console.log('Notification permissions granted');
        
        // Schedule daily bonus notification
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'CoinKrazy Daily Bonus!',
              body: 'Your daily bonus is ready to collect!',
              id: 1,
              schedule: { 
                every: 'day',
                at: new Date(new Date().setHours(9, 0, 0, 0)) // 9 AM daily
              },
              sound: 'beep.wav',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#ffd700'
            }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  }

  /**
   * Get device information
   */
  public getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  /**
   * Get network status
   */
  public getNetworkStatus(): NetworkStatus | null {
    return this.networkStatus;
  }

  /**
   * Check if running on native platform
   */
  public isRunningNatively(): boolean {
    return this.isNative;
  }

  /**
   * Get app information
   */
  public async getAppInfo(): Promise<AppInfo | null> {
    if (!this.isNative) return null;

    try {
      return await App.getInfo();
    } catch (error) {
      console.error('Failed to get app info:', error);
      return null;
    }
  }

  /**
   * Handle game win with celebration effects
   */
  public async celebrateWin(amount: number): Promise<void> {
    // Trigger haptic feedback for big wins
    if (amount > 1000) {
      await this.hapticFeedback('heavy');
    } else if (amount > 100) {
      await this.hapticFeedback('medium');
    } else {
      await this.hapticFeedback('light');
    }

    // Show win notification
    await this.showToast(`🎉 You won ${amount} coins!`);
  }

  /**
   * Handle app exit
   */
  public async exitApp(): Promise<void> {
    if (!this.isNative) return;

    try {
      await App.exitApp();
    } catch (error) {
      console.error('Failed to exit app:', error);
    }
  }
}

// Create singleton instance
export const capacitorService = new CapacitorService();

// Export types for use in other components
export type { DeviceInfo, NetworkStatus, AppInfo };
