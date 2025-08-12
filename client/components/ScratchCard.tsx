import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Coins, 
  Trophy, 
  Sparkles, 
  Star, 
  Diamond, 
  Crown,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ScratchArea {
  area: number;
  scratched: boolean;
  symbol: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ScratchCardProps {
  instance: {
    id: number;
    instance_id: string;
    card_type_id: number;
    status: string;
    scratch_progress: any;
    revealed_symbols: any;
    is_winner: boolean;
    winnings_gc: number;
    winnings_sc: number;
    prize_claimed: boolean;
  };
  cardType: {
    id: number;
    display_name: string;
    description: string;
    card_image?: string;
    game_type: string;
    min_symbols_to_match: number;
    total_scratch_areas: number;
    cost_gc: number;
    cost_sc: number;
    currency_type: string;
    theme_name?: string;
    background_image?: string;
  };
  onScratch: (areaIndex: number) => Promise<{symbol: string; cardComplete: boolean; winningsRevealed: boolean}>;
  onClaimPrize: () => Promise<void>;
  disabled?: boolean;
}

const SYMBOL_ICONS: { [key: string]: React.ReactNode } = {
  'symbol1': <Star className="w-6 h-6 text-yellow-400" />,
  'symbol2': <Diamond className="w-6 h-6 text-blue-400" />,
  'symbol3': <Crown className="w-6 h-6 text-purple-400" />,
  'bell': <Gift className="w-6 h-6 text-green-400" />,
  'star': <Sparkles className="w-6 h-6 text-pink-400" />,
  'diamond': <Diamond className="w-6 h-6 text-cyan-400" />,
  'seven': <Zap className="w-6 h-6 text-red-400" />,
  'cherry': <Coins className="w-6 h-6 text-red-500" />,
  'instant': <Trophy className="w-6 h-6 text-gold-400" />,
  'jackpot': <Crown className="w-6 h-6 text-gold-500" />,
  'blank1': <div className="w-6 h-6 bg-gray-300 rounded-full" />,
  'blank2': <div className="w-6 h-6 bg-gray-400 rounded-full" />,
  'blank3': <div className="w-6 h-6 bg-gray-500 rounded-full" />,
};

export default function ScratchCard({ instance, cardType, onScratch, onClaimPrize, disabled = false }: ScratchCardProps) {
  const [scratchAreas, setScratchAreas] = useState<ScratchArea[]>([]);
  const [isScratching, setIsScratching] = useState(false);
  const [revealedSymbols, setRevealedSymbols] = useState<any[]>([]);
  const [winningsRevealed, setWinningsRevealed] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scratchEffect, setScratchEffect] = useState<{x: number; y: number} | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Initialize scratch areas from instance data
  useEffect(() => {
    if (instance.scratch_progress) {
      const progress = JSON.parse(instance.scratch_progress);
      const areas = progress.map((area: any, index: number) => ({
        ...area,
        x: (index % 3) * 120 + 20,
        y: Math.floor(index / 3) * 120 + 20,
        width: 100,
        height: 100,
      }));
      setScratchAreas(areas);
    } else {
      // Initialize default scratch areas
      const defaultAreas = Array(cardType.total_scratch_areas).fill(null).map((_, index) => ({
        area: index,
        scratched: false,
        symbol: '',
        x: (index % 3) * 120 + 20,
        y: Math.floor(index / 3) * 120 + 20,
        width: 100,
        height: 100,
      }));
      setScratchAreas(defaultAreas);
    }

    if (instance.revealed_symbols) {
      setRevealedSymbols(JSON.parse(instance.revealed_symbols));
    }
  }, [instance, cardType]);

  // Initialize canvas for scratch effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 380;
    canvas.height = 380;

    // Draw scratch overlay
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture pattern
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#E8E8E8');
    gradient.addColorStop(0.5, '#C0C0C0');
    gradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add shine effect
    ctx.globalCompositeOperation = 'overlay';
    const shineGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    shineGradient.addColorStop(0, 'rgba(255,255,255,0)');
    shineGradient.addColorStop(0.3, 'rgba(255,255,255,0.3)');
    shineGradient.addColorStop(0.7, 'rgba(255,255,255,0.3)');
    shineGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shineGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const playSound = useCallback((type: 'scratch' | 'win' | 'reveal') => {
    if (!soundEnabled) return;
    
    // In a real implementation, you would play audio files
    // For now, we'll just use a visual feedback
    console.log(`Playing ${type} sound`);
  }, [soundEnabled]);

  const handleScratchArea = async (areaIndex: number, event: React.MouseEvent | React.TouchEvent) => {
    if (disabled || isScratching || scratchAreas[areaIndex]?.scratched) {
      return;
    }

    setIsScratching(true);
    
    // Get coordinates for scratch effect
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
      setScratchEffect({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }

    try {
      const result = await onScratch(areaIndex);
      
      // Update scratch areas
      setScratchAreas(prev => prev.map((area, index) => 
        index === areaIndex 
          ? { ...area, scratched: true, symbol: result.symbol }
          : area
      ));

      // Add to revealed symbols
      setRevealedSymbols(prev => [...prev, {
        areaIndex,
        symbol: result.symbol,
        timestamp: new Date(),
      }]);

      playSound('scratch');

      // Check if winnings are revealed
      if (result.winningsRevealed && !winningsRevealed) {
        setWinningsRevealed(true);
        playSound('win');
        setTimeout(() => setShowWinDialog(true), 500);
      }

      // Check if card is complete
      if (result.cardComplete) {
        playSound('reveal');
        if (instance.is_winner && !winningsRevealed) {
          setTimeout(() => setShowWinDialog(true), 1000);
        }
      }

      // Animate scratch effect on canvas
      animateScratchReveal(areaIndex);

    } catch (error) {
      console.error('Error scratching area:', error);
      toast({
        title: "Error",
        description: "Failed to scratch area. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScratching(false);
      setTimeout(() => setScratchEffect(null), 200);
    }
  };

  const animateScratchReveal = (areaIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const area = scratchAreas[areaIndex];
    if (!area) return;

    // Create scratch reveal animation
    ctx.globalCompositeOperation = 'destination-out';
    const gradient = ctx.createRadialGradient(
      area.x + area.width / 2, area.y + area.height / 2, 0,
      area.x + area.width / 2, area.y + area.height / 2, area.width / 2
    );
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.globalCompositeOperation = 'source-over';
  };

  const handleClaimPrize = async () => {
    try {
      await onClaimPrize();
      setShowWinDialog(false);
      toast({
        title: "Prize Claimed!",
        description: `You've claimed ${instance.winnings_gc} GC and ${instance.winnings_sc} SC!`,
      });
    } catch (error) {
      console.error('Error claiming prize:', error);
      toast({
        title: "Error",
        description: "Failed to claim prize. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSymbolCounts = () => {
    const counts: { [key: string]: number } = {};
    revealedSymbols.forEach(rs => {
      counts[rs.symbol] = (counts[rs.symbol] || 0) + 1;
    });
    return counts;
  };

  const renderScratchArea = (area: ScratchArea, index: number) => {
    const isRevealed = area.scratched;
    const symbol = area.symbol;

    return (
      <motion.div
        key={index}
        className={`absolute border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-all duration-200 ${
          isRevealed ? 'border-gold-400' : 'border-gray-400'
        } ${disabled ? 'cursor-not-allowed' : 'hover:border-gold-300'}`}
        style={{
          left: area.x,
          top: area.y,
          width: area.width,
          height: area.height,
        }}
        onClick={(e) => handleScratchArea(index, e)}
        onTouchStart={(e) => handleScratchArea(index, e)}
        whileHover={!disabled && !isRevealed ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isRevealed ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
          {isRevealed ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="flex flex-col items-center justify-center"
            >
              {SYMBOL_ICONS[symbol] || <div className="w-6 h-6 bg-gray-400 rounded" />}
              <span className="text-xs mt-1 font-semibold text-gray-700">{symbol}</span>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center text-gray-500">
              <span className="text-sm">?</span>
            </div>
          )}
        </div>
        
        {/* Scratch effect animation */}
        {scratchEffect && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2 h-2 bg-gold-400 rounded-full absolute"
                 style={{ 
                   left: scratchEffect.x - area.x, 
                   top: scratchEffect.y - area.y 
                 }} />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const symbolCounts = getSymbolCounts();
  const hasWinningCombination = Object.values(symbolCounts).some(count => count >= cardType.min_symbols_to_match);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="relative overflow-hidden bg-gradient-to-br from-gold-50 to-gold-100 border-gold-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-gold-800">
              {cardType.display_name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 h-8 w-8"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Badge variant={instance.status === 'completed' ? 'default' : 'secondary'}>
                {instance.status}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gold-600">{cardType.description}</p>
        </CardHeader>

        <CardContent className="pb-4">
          {/* Game Instructions */}
          <div className="mb-4 p-3 bg-gold-50 rounded-lg border border-gold-200">
            <p className="text-sm text-gold-700 text-center">
              {cardType.game_type === 'match_three' 
                ? `Match ${cardType.min_symbols_to_match} symbols to win!`
                : 'Scratch to reveal your prize!'
              }
            </p>
          </div>

          {/* Scratch Card Game Area */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-4 border-gold-300 p-4">
            <div 
              ref={cardRef}
              className="relative w-full h-80 bg-gradient-to-br from-gold-100 to-gold-200 rounded-lg overflow-hidden"
              style={{ backgroundImage: cardType.background_image ? `url(${cardType.background_image})` : undefined }}
            >
              {/* Canvas overlay for scratch effect */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ opacity: instance.status === 'unscratched' ? 0.8 : 0 }}
              />

              {/* Scratch Areas */}
              {scratchAreas.map((area, index) => renderScratchArea(area, index))}

              {/* Loading overlay */}
              {isScratching && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-8 h-8 border-4 border-gold-400 border-t-transparent rounded-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Symbol Count Display */}
          {revealedSymbols.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Symbol Count:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(symbolCounts).map(([symbol, count]) => (
                  <div key={symbol} className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border">
                    {SYMBOL_ICONS[symbol]}
                    <span className="text-sm font-medium">×{count}</span>
                    {count >= cardType.min_symbols_to_match && (
                      <Sparkles className="w-3 h-3 text-gold-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Win Status */}
          {instance.status === 'completed' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              {instance.is_winner ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex items-center justify-center mb-2"
                  >
                    <Trophy className="w-6 h-6 text-gold-500 mr-2" />
                    <span className="text-lg font-bold text-green-700">Winner!</span>
                  </motion.div>
                  <p className="text-sm text-green-600 mb-2">
                    You won {instance.winnings_gc} GC + {instance.winnings_sc} SC
                  </p>
                  {!instance.prize_claimed && (
                    <Button onClick={handleClaimPrize} className="bg-green-600 hover:bg-green-700">
                      <Gift className="w-4 h-4 mr-2" />
                      Claim Prize
                    </Button>
                  )}
                  {instance.prize_claimed && (
                    <Badge variant="default" className="bg-green-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Prize Claimed
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600">Better luck next time!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Win Dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-gold-600">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center justify-center mb-2"
              >
                <Trophy className="w-8 h-8 text-gold-500 mr-2" />
                Congratulations!
              </motion.div>
            </DialogTitle>
            <DialogDescription className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-lg mb-4">You're a winner!</p>
                <div className="text-2xl font-bold text-gold-600 mb-4">
                  {instance.winnings_gc > 0 && <span>{instance.winnings_gc.toLocaleString()} GC</span>}
                  {instance.winnings_gc > 0 && instance.winnings_sc > 0 && <span> + </span>}
                  {instance.winnings_sc > 0 && <span>{instance.winnings_sc} SC</span>}
                </div>
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    repeatType: "reverse"
                  }}
                  className="text-4xl mb-4"
                >
                  🎉
                </motion.div>
                {!instance.prize_claimed && (
                  <Button onClick={handleClaimPrize} className="bg-gold-600 hover:bg-gold-700">
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Your Prize
                  </Button>
                )}
              </motion.div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
