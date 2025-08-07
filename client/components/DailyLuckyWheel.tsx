import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import {
  RotateCcw,
  Crown,
  Sparkles,
  Star,
  Gift,
  Timer,
  Trophy,
  Zap,
  Coins,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { walletService } from '../services/walletService';
import { useToast } from '@/hooks/use-toast';

interface WheelSegment {
  id: string;
  label: string;
  value: number; // SC amount
  probability: number; // Percentage chance
  color: string;
  icon: string;
}

interface SpinResult {
  segment: WheelSegment;
  degrees: number;
  timestamp: Date;
}

interface WheelStats {
  totalSpins: number;
  totalAwarded: number;
  averageWin: number;
  lastSpin?: Date;
  nextSpinAvailable?: Date;
}

export default function DailyLuckyWheel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const wheelRef = useRef<HTMLDivElement>(null);

  // Wheel configuration with 45% RTP
  const [wheelSegments] = useState<WheelSegment[]>([
    { id: '1', label: '0.01 SC', value: 0.01, probability: 30, color: '#ef4444', icon: '💰' },
    { id: '2', label: '0.02 SC', value: 0.02, probability: 25, color: '#f97316', icon: '💎' },
    { id: '3', label: '0.03 SC', value: 0.03, probability: 20, color: '#eab308', icon: '⭐' },
    { id: '4', label: '0.05 SC', value: 0.05, probability: 15, color: '#22c55e', icon: '🍀' },
    { id: '5', label: '0.08 SC', value: 0.08, probability: 6, color: '#3b82f6', icon: '🎯' },
    { id: '6', label: '0.12 SC', value: 0.12, probability: 3, color: '#8b5cf6', icon: '🌟' },
    { id: '7', label: '0.20 SC', value: 0.20, probability: 0.8, color: '#ec4899', icon: '💫' },
    { id: '8', label: '0.25 SC', value: 0.25, probability: 0.2, color: '#fbbf24', icon: '👑' }
  ]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [canSpin, setCanSpin] = useState(true);
  const [lastSpinResult, setLastSpinResult] = useState<SpinResult | null>(null);
  const [wheelStats, setWheelStats] = useState<WheelStats>({
    totalSpins: 0,
    totalAwarded: 0,
    averageWin: 0
  });
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>('');
  const [wheelRotation, setWheelRotation] = useState(0);

  // Calculate theoretical RTP
  const theoreticalRTP = wheelSegments.reduce((total, segment) => {
    return total + (segment.value * segment.probability / 100);
  }, 0);

  useEffect(() => {
    // Check if user can spin (once per day)
    checkSpinAvailability();
    
    // Update countdown timer
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSpinAvailability = () => {
    const lastSpinKey = `lastSpin_${user?.id}`;
    const lastSpinTime = localStorage.getItem(lastSpinKey);
    
    if (lastSpinTime) {
      const lastSpin = new Date(lastSpinTime);
      const now = new Date();
      const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSpin < 24) {
        setCanSpin(false);
        const nextSpinTime = new Date(lastSpin.getTime() + 24 * 60 * 60 * 1000);
        setWheelStats(prev => ({ ...prev, lastSpin, nextSpinAvailable: nextSpinTime }));
      }
    }
  };

  const updateCountdown = () => {
    if (wheelStats.nextSpinAvailable) {
      const now = new Date();
      const timeLeft = wheelStats.nextSpinAvailable.getTime() - now.getTime();
      
      if (timeLeft <= 0) {
        setCanSpin(true);
        setTimeUntilNextSpin('');
        setWheelStats(prev => ({ ...prev, nextSpinAvailable: undefined }));
      } else {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        setTimeUntilNextSpin(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }
  };

  const getRandomSegment = (): WheelSegment => {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    
    for (const segment of wheelSegments) {
      cumulativeProbability += segment.probability;
      if (random <= cumulativeProbability) {
        return segment;
      }
    }
    
    // Fallback to lowest value
    return wheelSegments[0];
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning || !user) {
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to spin the wheel",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSpinning(true);

    try {
      // Determine winning segment
      const winningSegment = getRandomSegment();
      
      // Calculate wheel rotation
      const segmentAngle = 360 / wheelSegments.length;
      const segmentIndex = wheelSegments.findIndex(s => s.id === winningSegment.id);
      const targetAngle = segmentIndex * segmentAngle;
      
      // Add multiple full rotations for effect
      const spins = 3 + Math.random() * 2; // 3-5 full rotations
      const finalRotation = wheelRotation + (spins * 360) + (360 - targetAngle);
      
      setWheelRotation(finalRotation);

      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Award the prize
      await walletService.addBalance(user.id || 'guest', winningSegment.value, 'SC');

      // Record the spin
      const spinResult: SpinResult = {
        segment: winningSegment,
        degrees: finalRotation,
        timestamp: new Date()
      };

      setLastSpinResult(spinResult);

      // Update stats
      const newStats = {
        totalSpins: wheelStats.totalSpins + 1,
        totalAwarded: wheelStats.totalAwarded + winningSegment.value,
        averageWin: (wheelStats.totalAwarded + winningSegment.value) / (wheelStats.totalSpins + 1),
        lastSpin: new Date(),
        nextSpinAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };
      setWheelStats(newStats);

      // Mark as unable to spin for 24 hours
      setCanSpin(false);
      localStorage.setItem(`lastSpin_${user.id}`, new Date().toISOString());

      // Store spin result
      const spinHistory = JSON.parse(localStorage.getItem(`spinHistory_${user.id}`) || '[]');
      spinHistory.push(spinResult);
      if (spinHistory.length > 10) spinHistory.shift(); // Keep last 10 spins
      localStorage.setItem(`spinHistory_${user.id}`, JSON.stringify(spinHistory));

      toast({
        title: "🎉 Congratulations!",
        description: `You won ${winningSegment.value} SC! Come back in 24 hours for your next spin.`,
        duration: 5000,
      });

    } catch (error) {
      toast({
        title: "Spin Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  const segmentAngle = 360 / wheelSegments.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-gold-400 bg-clip-text text-transparent">
          Daily Lucky Wheel
        </h1>
        <p className="text-lg text-muted-foreground">
          Spin once every 24 hours for a chance to win Sweep Coins!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wheel Section */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Lucky Wheel
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            {/* Wheel Container */}
            <div className="relative">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-6 h-8 bg-white border-2 border-gray-800 rounded-sm shadow-lg flex items-center justify-center">
                  <div className="w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>

              {/* Wheel */}
              <div 
                ref={wheelRef}
                className="relative w-80 h-80 rounded-full border-8 border-gray-800 shadow-2xl overflow-hidden"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                }}
              >
                {wheelSegments.map((segment, index) => {
                  const startAngle = index * segmentAngle;
                  const endAngle = (index + 1) * segmentAngle;
                  const midAngle = (startAngle + endAngle) / 2;
                  
                  return (
                    <div
                      key={segment.id}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        transform: `rotate(${startAngle}deg)`,
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 - 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
                      }}
                    >
                      <div 
                        className="w-full h-full flex items-start justify-center pt-8"
                        style={{ 
                          backgroundColor: segment.color,
                          transform: `rotate(${segmentAngle / 2}deg)`
                        }}
                      >
                        <div className="text-center text-white">
                          <div className="text-2xl mb-1">{segment.icon}</div>
                          <div className="text-xs font-bold">{segment.label}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white border-4 border-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-gold-500" />
                </div>
              </div>
            </div>

            {/* Spin Button */}
            <Button
              onClick={spinWheel}
              disabled={!canSpin || isSpinning}
              size="lg"
              className={`w-full max-w-xs ${
                canSpin && !isSpinning
                  ? 'bg-gradient-to-r from-purple-500 to-gold-500 hover:from-purple-600 hover:to-gold-600'
                  : 'bg-gray-400'
              }`}
            >
              {isSpinning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Spinning...
                </>
              ) : canSpin ? (
                <>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Spin the Wheel!
                </>
              ) : (
                <>
                  <Timer className="w-5 h-5 mr-2" />
                  Next spin in {timeUntilNextSpin}
                </>
              )}
            </Button>

            {!canSpin && timeUntilNextSpin && (
              <Alert className="w-full max-w-xs">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Your next free spin will be available in {timeUntilNextSpin}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info & Stats Section */}
        <div className="space-y-6">
          {/* Last Spin Result */}
          {lastSpinResult && (
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-5 h-5" />
                  Last Spin Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-4xl">{lastSpinResult.segment.icon}</div>
                  <div className="text-2xl font-bold text-green-400">
                    {lastSpinResult.segment.value} SC
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Spun on {lastSpinResult.timestamp.toLocaleDateString()} at{' '}
                    {lastSpinResult.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prize Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Prize Table
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {wheelSegments.map((segment) => (
                  <div 
                    key={segment.id} 
                    className="flex items-center justify-between p-2 rounded"
                    style={{ backgroundColor: `${segment.color}20` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{segment.icon}</span>
                      <span className="font-medium">{segment.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {segment.probability}% chance
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Wheel Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Wheel Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {wheelStats.totalSpins}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Spins</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {wheelStats.totalAwarded.toFixed(2)} SC
                  </div>
                  <p className="text-sm text-muted-foreground">Total Awarded</p>
                </div>
              </div>
              
              {wheelStats.totalSpins > 0 && (
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {wheelStats.averageWin.toFixed(3)} SC
                  </div>
                  <p className="text-sm text-muted-foreground">Average Win</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Theoretical RTP</span>
                  <span className="text-sm text-gold-400 font-bold">45%</span>
                </div>
                <Progress value={45} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Expected return: {theoreticalRTP.toFixed(3)} SC per spin
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>One free spin every 24 hours</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Win between 0.01 SC and 0.25 SC</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>45% RTP (Return to Player)</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>Sweep Coins are automatically credited</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span>No purchase necessary to participate</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
