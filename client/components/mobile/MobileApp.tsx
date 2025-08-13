import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Battery, Signal } from 'lucide-react';
import MobileNavigation from './MobileNavigation';
import MobileDashboard from './MobileDashboard';
import MobileGoldCoinStore from './MobileGoldCoinStore';
import MobileCheckout from './MobileCheckout';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { useMobile } from '../../hooks/use-mobile';

interface Package {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  goldCoins: number;
  bonusCoins?: number;
  imageUrl: string;
  discount?: number;
}

interface MobileAppProps {
  className?: string;
}

const MobileApp: React.FC<MobileAppProps> = ({ className }) => {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [signalStrength, setSignalStrength] = useState(4);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppMode, setIsAppMode] = useState(false);
  const { toast } = useToast();
  const isMobile = useMobile();

  useEffect(() => {
    initializeMobileApp();
    setupEventListeners();
    checkPWACapabilities();
    return () => cleanupEventListeners();
  }, []);

  const initializeMobileApp = () => {
    // Check if running in standalone mode (PWA)
    setIsAppMode(window.matchMedia('(display-mode: standalone)').matches || 
                 (window.navigator as any).standalone === true);

    // Initialize mobile-specific features
    setupBatteryAPI();
    setupNetworkAPI();
    setupOrientationLock();
    setupHapticFeedback();
  };

  const setupEventListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('orientationchange', handleOrientationChange);
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    window.removeEventListener('orientationchange', handleOrientationChange);
  };

  const handleOnline = () => {
    setIsOnline(true);
    toast({
      title: 'Connection Restored',
      description: 'You are back online!'
    });
  };

  const handleOffline = () => {
    setIsOnline(false);
    toast({
      title: 'Connection Lost',
      description: 'You are currently offline',
      variant: 'destructive'
    });
  };

  const handleInstallPrompt = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallPrompt(true);
  };

  const handleOrientationChange = () => {
    // Handle orientation changes
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  const setupBatteryAPI = async () => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }
    } catch (error) {
      console.log('Battery API not supported');
    }
  };

  const setupNetworkAPI = () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateSignal = () => {
        const effectiveType = connection.effectiveType;
        switch (effectiveType) {
          case '4g': setSignalStrength(4); break;
          case '3g': setSignalStrength(3); break;
          case '2g': setSignalStrength(2); break;
          case 'slow-2g': setSignalStrength(1); break;
          default: setSignalStrength(4);
        }
      };
      
      updateSignal();
      connection.addEventListener('change', updateSignal);
    }
  };

  const setupOrientationLock = () => {
    // Lock to portrait on mobile devices
    if (screen.orientation && screen.orientation.lock) {
      try {
        screen.orientation.lock('portrait-primary').catch(() => {
          console.log('Orientation lock not supported');
        });
      } catch (error) {
        console.log('Orientation lock failed');
      }
    }
  };

  const setupHapticFeedback = () => {
    // Enable haptic feedback for mobile interactions
    const enableHaptic = () => {
      if ('vibrate' in navigator) {
        return (pattern: number | number[]) => {
          navigator.vibrate(pattern);
        };
      }
      return () => {};
    };
    
    (window as any).haptic = enableHaptic();
  };

  const checkPWACapabilities = () => {
    // Check if app can be installed
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        console.log('Service worker registration failed');
      });
    }
  };

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast({
          title: 'App Installed',
          description: 'CoinKrazy has been added to your home screen!'
        });
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleNavigation = (path: string) => {
    setCurrentRoute(path);
    setShowCheckout(false);
    
    // Haptic feedback for navigation
    if ((window as any).haptic) {
      (window as any).haptic(50);
    }
  };

  const handlePackagePurchase = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (transactionId: string) => {
    setShowCheckout(false);
    setSelectedPackage(null);
    handleNavigation('/dashboard');
    
    toast({
      title: 'Purchase Successful!',
      description: `Transaction ID: ${transactionId}`,
      duration: 5000
    });
  };

  const handleCheckoutBack = () => {
    setShowCheckout(false);
    setSelectedPackage(null);
  };

  const renderCurrentScreen = () => {
    if (showCheckout && selectedPackage) {
      return (
        <MobileCheckout
          package={selectedPackage}
          onBack={handleCheckoutBack}
          onSuccess={handleCheckoutSuccess}
        />
      );
    }

    switch (currentRoute) {
      case '/dashboard':
        return <MobileDashboard onNavigate={handleNavigation} />;
      case '/gold-store':
        return <MobileGoldCoinStore onPackagePurchase={handlePackagePurchase} />;
      default:
        return <MobileDashboard onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className={`relative min-h-screen bg-gray-900 overflow-hidden ${className}`}>
      {/* Status Bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black text-white text-xs px-4 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Signal Strength */}
            <Signal className={`w-3 h-3 ${signalStrength >= 3 ? 'text-white' : 'text-gray-500'}`} />
            
            {/* Network Status */}
            {isOnline ? (
              <Wifi className="w-3 h-3 text-white" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-500" />
            )}
            
            {/* Battery */}
            <div className="flex items-center gap-1">
              <Battery className={`w-3 h-3 ${batteryLevel <= 20 ? 'text-red-500' : 'text-white'}`} />
              <span className={batteryLevel <= 20 ? 'text-red-500' : 'text-white'}>
                {batteryLevel}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-6 left-4 right-4 z-40"
        >
          <Alert variant="destructive" className="bg-red-500/90 border-red-600">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="text-white">
              You're offline. Some features may be limited.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-40"
          >
            <Alert className="bg-yellow-500/90 border-yellow-600">
              <AlertDescription className="text-black">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Install CoinKrazy</div>
                    <div className="text-sm">Add to home screen for the best experience</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowInstallPrompt(false)}
                      className="border-black text-black hover:bg-black/10"
                    >
                      Later
                    </Button>
                    <Button
                      size="sm"
                      onClick={installApp}
                      className="bg-black text-white hover:bg-black/80"
                    >
                      Install
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute + (showCheckout ? '-checkout' : '')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderCurrentScreen()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {!showCheckout && (
        <MobileNavigation
          currentPath={currentRoute}
          onNavigate={handleNavigation}
        />
      )}

      {/* Loading Overlay for Slow Networks */}
      {!isOnline && signalStrength <= 1 && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-white">Slow connection detected...</p>
            <p className="text-gray-400 text-sm">Optimizing experience</p>
          </div>
        </div>
      )}

      {/* Safe Area Bottom Padding */}
      <div className="h-safe-bottom" />
    </div>
  );
};

export default MobileApp;
