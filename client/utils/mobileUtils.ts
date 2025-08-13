// Mobile utility functions for enhanced mobile experience

export interface TouchGesture {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | 'up' | 'down' | 'none';
  distance: number;
  duration: number;
}

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  platform: string;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  hasTouch: boolean;
  isStandalone: boolean;
  supportsPWA: boolean;
}

/**
 * Detect device capabilities and characteristics
 */
export const getDeviceInfo = (): DeviceInfo => {
  const userAgent = navigator.userAgent.toLowerCase();
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                   (hasTouch && screenWidth < 768);
  const isTablet = hasTouch && screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = !isMobile && !isTablet;
  
  let platform = 'unknown';
  if (/android/i.test(userAgent)) platform = 'android';
  else if (/iphone|ipad|ipod/i.test(userAgent)) platform = 'ios';
  else if (/windows phone/i.test(userAgent)) platform = 'windows';
  else if (/mac/i.test(userAgent)) platform = 'macos';
  else if (/windows/i.test(userAgent)) platform = 'windows';
  else if (/linux/i.test(userAgent)) platform = 'linux';
  
  const screenSize = screenWidth < 576 ? 'small' : 
                    screenWidth < 768 ? 'medium' : 'large';
  
  const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
  
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
  
  const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    platform,
    screenSize,
    orientation,
    hasTouch,
    isStandalone,
    supportsPWA
  };
};

/**
 * Handle touch gestures
 */
export class TouchGestureHandler {
  private startTouch: Touch | null = null;
  private startTime: number = 0;
  private threshold: number = 50;
  private timeThreshold: number = 500;
  
  constructor(threshold: number = 50, timeThreshold: number = 500) {
    this.threshold = threshold;
    this.timeThreshold = timeThreshold;
  }
  
  handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length === 1) {
      this.startTouch = event.touches[0];
      this.startTime = Date.now();
    }
  };
  
  handleTouchEnd = (event: TouchEvent, callback?: (gesture: TouchGesture) => void): TouchGesture | null => {
    if (!this.startTouch || event.changedTouches.length !== 1) {
      return null;
    }
    
    const endTouch = event.changedTouches[0];
    const endTime = Date.now();
    
    const deltaX = endTouch.clientX - this.startTouch.clientX;
    const deltaY = endTouch.clientY - this.startTouch.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = endTime - this.startTime;
    
    let direction: TouchGesture['direction'] = 'none';
    
    if (distance > this.threshold && duration < this.timeThreshold) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }
    }
    
    const gesture: TouchGesture = {
      startX: this.startTouch.clientX,
      startY: this.startTouch.clientY,
      endX: endTouch.clientX,
      endY: endTouch.clientY,
      deltaX,
      deltaY,
      direction,
      distance,
      duration
    };
    
    if (callback) {
      callback(gesture);
    }
    
    this.startTouch = null;
    this.startTime = 0;
    
    return gesture;
  };
}

/**
 * Haptic feedback utilities
 */
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  },
  
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }
};

/**
 * Screen orientation utilities
 */
export const orientationUtils = {
  lock: async (orientation: OrientationLockType) => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock(orientation);
        return true;
      }
    } catch (error) {
      console.warn('Orientation lock failed:', error);
    }
    return false;
  },
  
  unlock: () => {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
        return true;
      }
    } catch (error) {
      console.warn('Orientation unlock failed:', error);
    }
    return false;
  },
  
  getCurrent: (): OrientationType | null => {
    if (screen.orientation) {
      return screen.orientation.type;
    }
    return null;
  },
  
  onChange: (callback: (orientation: OrientationType) => void) => {
    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => {
        callback(screen.orientation.type);
      });
    }
  }
};

/**
 * Network status utilities
 */
export const networkUtils = {
  isOnline: () => navigator.onLine,
  
  getConnection: () => {
    return (navigator as any).connection || 
           (navigator as any).mozConnection || 
           (navigator as any).webkitConnection;
  },
  
  getConnectionType: (): string => {
    const connection = networkUtils.getConnection();
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  },
  
  getDownlinkSpeed: (): number => {
    const connection = networkUtils.getConnection();
    return connection ? connection.downlink || 0 : 0;
  },
  
  isSlowConnection: (): boolean => {
    const connectionType = networkUtils.getConnectionType();
    return connectionType === 'slow-2g' || connectionType === '2g';
  },
  
  onNetworkChange: (callback: (isOnline: boolean) => void) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
    
    const connection = networkUtils.getConnection();
    if (connection) {
      connection.addEventListener('change', () => {
        callback(navigator.onLine);
      });
    }
  }
};

/**
 * Battery status utilities
 */
export const batteryUtils = {
  getBattery: async () => {
    try {
      if ('getBattery' in navigator) {
        return await (navigator as any).getBattery();
      }
    } catch (error) {
      console.warn('Battery API not supported');
    }
    return null;
  },
  
  getBatteryLevel: async (): Promise<number> => {
    const battery = await batteryUtils.getBattery();
    return battery ? Math.round(battery.level * 100) : 100;
  },
  
  isCharging: async (): Promise<boolean> => {
    const battery = await batteryUtils.getBattery();
    return battery ? battery.charging : false;
  },
  
  getChargingTime: async (): Promise<number> => {
    const battery = await batteryUtils.getBattery();
    return battery ? battery.chargingTime : Infinity;
  },
  
  getDischargingTime: async (): Promise<number> => {
    const battery = await batteryUtils.getBattery();
    return battery ? battery.dischargingTime : Infinity;
  },
  
  onBatteryChange: async (callback: (battery: any) => void) => {
    const battery = await batteryUtils.getBattery();
    if (battery) {
      battery.addEventListener('levelchange', () => callback(battery));
      battery.addEventListener('chargingchange', () => callback(battery));
      battery.addEventListener('chargingtimechange', () => callback(battery));
      battery.addEventListener('dischargingtimechange', () => callback(battery));
    }
  }
};

/**
 * Safe area utilities for notched devices
 */
export const safeAreaUtils = {
  getSafeAreaInsets: () => {
    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    };
  },
  
  applySafeAreaPadding: (element: HTMLElement) => {
    const insets = safeAreaUtils.getSafeAreaInsets();
    element.style.paddingTop = `${insets.top}px`;
    element.style.paddingRight = `${insets.right}px`;
    element.style.paddingBottom = `${insets.bottom}px`;
    element.style.paddingLeft = `${insets.left}px`;
  }
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  requestIdleCallback: (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(callback, options);
    } else {
      return setTimeout(callback, 1);
    }
  },
  
  cancelIdleCallback: (handle: number) => {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(handle);
    } else {
      clearTimeout(handle);
    }
  },
  
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },
  
  preloadImages: async (urls: string[]): Promise<void> => {
    await Promise.allSettled(urls.map(url => performanceUtils.preloadImage(url)));
  },
  
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout | null = null;
    
    return (...args: Parameters<T>) => {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  },
  
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

/**
 * Local storage utilities with compression
 */
export const storageUtils = {
  set: (key: string, value: any, compress: boolean = false): boolean => {
    try {
      let dataToStore = JSON.stringify(value);
      
      if (compress && 'CompressionStream' in window) {
        // Use compression for large data
        // This is a simplified approach - in real implementation you'd use proper compression
        dataToStore = btoa(dataToStore);
      }
      
      localStorage.setItem(key, dataToStore);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },
  
  get: <T = any>(key: string, defaultValue?: T, compressed: boolean = false): T | null => {
    try {
      let data = localStorage.getItem(key);
      
      if (!data) {
        return defaultValue || null;
      }
      
      if (compressed) {
        data = atob(data);
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue || null;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },
  
  getSize: (): number => {
    let size = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  }
};

/**
 * PWA utilities
 */
export const pwaUtils = {
  isInstalled: (): boolean => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  },
  
  canInstall: (): boolean => {
    return 'serviceWorker' in navigator && !pwaUtils.isInstalled();
  },
  
  install: async (deferredPrompt: any): Promise<boolean> => {
    if (!deferredPrompt) return false;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA installation failed:', error);
      return false;
    }
  },
  
  registerServiceWorker: async (swPath: string = '/sw.js'): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register(swPath);
        return true;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    return false;
  },
  
  unregisterServiceWorker: async (): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        return true;
      } catch (error) {
        console.error('Service Worker unregistration failed:', error);
      }
    }
    return false;
  }
};

export default {
  getDeviceInfo,
  TouchGestureHandler,
  hapticFeedback,
  orientationUtils,
  networkUtils,
  batteryUtils,
  safeAreaUtils,
  performanceUtils,
  storageUtils,
  pwaUtils
};
