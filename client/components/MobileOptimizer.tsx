import React, { useEffect, useState } from 'react';
import { capacitorService } from '../services/capacitorService';
import type { DeviceInfo, NetworkStatus } from '../services/capacitorService';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

/**
 * Mobile Optimizer Component
 * Enhances the app experience when running on mobile devices
 */
export default function MobileOptimizer({ children }: MobileOptimizerProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    // Initialize mobile optimizations
    const initMobile = async () => {
      setIsNative(capacitorService.isRunningNatively());
      setDeviceInfo(capacitorService.getDeviceInfo());
      setNetworkStatus(capacitorService.getNetworkStatus());

      // Setup notifications for native app
      if (capacitorService.isRunningNatively()) {
        await capacitorService.setupNotifications();
      }
    };

    initMobile();
  }, []);

  // Add mobile-specific CSS classes
  useEffect(() => {
    if (isNative) {
      document.body.classList.add('capacitor-app');
      document.body.classList.add(`platform-${deviceInfo?.platform || 'unknown'}`);
    }

    return () => {
      document.body.classList.remove('capacitor-app');
      if (deviceInfo?.platform) {
        document.body.classList.remove(`platform-${deviceInfo.platform}`);
      }
    };
  }, [isNative, deviceInfo]);

  // Add mobile-specific event handlers
  useEffect(() => {
    if (!isNative) return;

    // Handle game wins with haptic feedback
    const handleGameWin = (event: CustomEvent) => {
      const { amount } = event.detail;
      capacitorService.celebrateWin(amount);
    };

    // Handle button clicks with haptic feedback
    const handleButtonClick = () => {
      capacitorService.hapticFeedback('light');
    };

    // Add event listeners
    window.addEventListener('gameWin', handleGameWin as EventListener);
    
    // Add haptic feedback to all buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', handleButtonClick);
    });

    return () => {
      window.removeEventListener('gameWin', handleGameWin as EventListener);
      buttons.forEach(button => {
        button.removeEventListener('click', handleButtonClick);
      });
    };
  }, [isNative]);

  return (
    <>
      {children}
      
      {/* Mobile-specific status indicators */}
      {isNative && networkStatus && !networkStatus.connected && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          <span className="text-sm">You are offline. Some features may not work.</span>
        </div>
      )}
      
      {/* Development info panel (only in dev mode) */}
      {process.env.NODE_ENV === 'development' && isNative && (
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 text-white p-2 text-xs">
          <div>Platform: {deviceInfo?.platform} {deviceInfo?.osVersion}</div>
          <div>Network: {networkStatus?.connectionType} ({networkStatus?.connected ? 'Connected' : 'Offline'})</div>
          <div>Native: {isNative ? 'Yes' : 'No'}</div>
        </div>
      )}
    </>
  );
}

// Helper function to trigger game win celebration
export const triggerGameWin = (amount: number) => {
  const event = new CustomEvent('gameWin', { detail: { amount } });
  window.dispatchEvent(event);
};
