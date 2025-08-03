import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Trophy, 
  Coins,
  Star,
  Gift,
  Sparkles,
  Volume2,
  VolumeX,
  Info,
  Zap,
  Crown,
  Diamond,
  Heart
} from 'lucide-react';

interface ScratchCard {
  id: string;
  symbols: string[];
  prizes: number[];
  winCondition: { symbol: string; count: number; prize: number } | null;
  isWin: boolean;
  totalPrize: number;
  isRevealed: boolean;
  scratchedPercent: number;
}

interface GameStats {
  totalCards: number;
  totalSpent: number;
  totalWon: number;
  biggestWin: number;
  winStreak: number;
  balance: number;
}

const SYMBOLS = {
  '🪙': { name: 'CoinKrazy Gold', prize: 1000, rarity: 0.02 },
  '💰': { name: 'Money Bag', prize: 500, rarity: 0.05 },
  '💎': { name: 'Diamond', prize: 250, rarity: 0.08 },
  '👑': { name: 'Crown', prize: 100, rarity: 0.12 },
  '⭐': { name: 'Star', prize: 50, rarity: 0.18 },
  '🍀': { name: 'Lucky Clover', prize: 25, rarity: 0.25 },
  '🎯': { name: 'Target', prize: 15, rarity: 0.30 },
  '🎲': { name: 'Dice', prize: 10, rarity: 0.40 },
  '🔔': { name: 'Bell', prize: 5, rarity: 0.50 },
  '❌': { name: 'No Prize', prize: 0, rarity: 0.80 }
};

const WIN_CONDITIONS = [
  { symbol: '🪙', count: 3, multiplier: 10 },
  { symbol: '💰', count: 3, multiplier: 5 },
  { symbol: '💎', count: 3, multiplier: 3 },
  { symbol: '👑', count: 3, multiplier: 2 },
  { symbol: '⭐', count: 4, multiplier: 3 },
  { symbol: '🍀', count: 4, multiplier: 2 },
  { symbol: '🎯', count: 5, multiplier: 2 },
  { symbol: '🎲', count: 5, multiplier: 1.5 },
  { symbol: '🔔', count: 6, multiplier: 1.5 }
];

export default function LuckyScratchGold() {
  const [currentCard, setCurrentCard] = useState<ScratchCard | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [cardPrice, setCardPrice] = useState(5.00);
  const [balance, setBalance] = useState(1000.00);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalCards: 0,
    totalSpent: 0,
    totalWon: 0,
    biggestWin: 0,
    winStreak: 0,
    balance: 1000.00
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [autoReveal, setAutoReveal] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null);
  const isMouseDown = useRef(false);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);

  const generateRandomSymbol = useCallback(() => {
    const rand = Math.random();
    let cumulativeRarity = 0;
    
    for (const [symbol, data] of Object.entries(SYMBOLS)) {
      cumulativeRarity += data.rarity;
      if (rand <= cumulativeRarity) {
        return symbol;
      }
    }
    
    return '❌'; // Default fallback
  }, []);

  const generateCard = useCallback((): ScratchCard => {
    const symbols: string[] = [];
    const prizes: number[] = [];
    
    // Generate 9 symbols (3x3 grid)
    for (let i = 0; i < 9; i++) {
      const symbol = generateRandomSymbol();
      symbols.push(symbol);
      prizes.push(SYMBOLS[symbol as keyof typeof SYMBOLS].prize);
    }

    // Check for winning conditions
    const symbolCounts: { [key: string]: number } = {};
    symbols.forEach(symbol => {
      symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
    });

    let winCondition: { symbol: string; count: number; prize: number } | null = null;
    let isWin = false;
    let totalPrize = 0;

    // Check each win condition
    for (const condition of WIN_CONDITIONS) {
      if (symbolCounts[condition.symbol] >= condition.count) {
        const basePrize = SYMBOLS[condition.symbol as keyof typeof SYMBOLS].prize;
        const prize = basePrize * condition.multiplier * cardPrice;
        
        if (prize > totalPrize) {
          winCondition = { symbol: condition.symbol, count: condition.count, prize };
          totalPrize = prize;
          isWin = true;
        }
      }
    }

    return {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbols,
      prizes,
      winCondition,
      isWin,
      totalPrize,
      isRevealed: false,
      scratchedPercent: 0
    };
  }, [generateRandomSymbol, cardPrice]);

  const buyCard = useCallback(() => {
    if (balance < cardPrice) return;
    
    const newCard = generateCard();
    setCurrentCard(newCard);
    setBalance(prev => prev - cardPrice);
    setIsScratching(false);
    
    setGameStats(prev => ({
      ...prev,
      totalCards: prev.totalCards + 1,
      totalSpent: prev.totalSpent + cardPrice,
      balance: prev.balance - cardPrice
    }));

    // Reset canvas
    if (scratchCanvasRef.current) {
      const canvas = scratchCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#C4B5A0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add scratch-off texture
        ctx.fillStyle = '#B8A082';
        for (let i = 0; i < 1000; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          ctx.fillRect(x, y, 2, 2);
        }
        
        // Add "SCRATCH HERE" text
        ctx.fillStyle = '#8B7355';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = 'bold 16px Arial';
        ctx.fillText('TO REVEAL PRIZES', canvas.width / 2, canvas.height / 2 + 10);
      }
    }

    drawCard(newCard);
  }, [balance, cardPrice, generateCard]);

  const drawCard = useCallback((card: ScratchCard) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FFA500');
    gradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Draw grid and symbols
    const cellWidth = canvas.width / 3;
    const cellHeight = (canvas.height - 60) / 3; // Leave space for header
    
    // Draw title
    ctx.fillStyle = '#8B4513';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🪙 CoinKrazy Lucky Scratch 🪙', canvas.width / 2, 30);
    
    // Draw prize information if winning
    if (card.isWin && card.winCondition) {
      ctx.fillStyle = '#228B22';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(`WIN ${card.winCondition.count}x ${card.winCondition.symbol}`, canvas.width / 2, 50);
    }
    
    // Draw symbols
    card.symbols.forEach((symbol, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = col * cellWidth + cellWidth / 2;
      const y = 60 + row * cellHeight + cellHeight / 2;
      
      // Draw cell background
      const isWinningSymbol = card.winCondition && symbol === card.winCondition.symbol;
      ctx.fillStyle = isWinningSymbol ? '#90EE90' : '#FFFFE0';
      ctx.fillRect(col * cellWidth + 5, 60 + row * cellHeight + 5, cellWidth - 10, cellHeight - 10);
      
      // Draw cell border
      ctx.strokeStyle = isWinningSymbol ? '#32CD32' : '#DAA520';
      ctx.lineWidth = 2;
      ctx.strokeRect(col * cellWidth + 5, 60 + row * cellHeight + 5, cellWidth - 10, cellHeight - 10);
      
      // Draw symbol
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#2F4F4F';
      ctx.fillText(symbol, x, y + 15);
      
      // Draw prize amount
      const prize = SYMBOLS[symbol as keyof typeof SYMBOLS].prize;
      if (prize > 0) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#B8860B';
        ctx.fillText(`$${prize}`, x, y + 35);
      }
    });
  }, []);

  const scratchAt = useCallback((x: number, y: number) => {
    if (!scratchCanvasRef.current || !currentCard) return;
    
    const canvas = scratchCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Calculate scratched percentage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let scratchedPixels = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) { // Alpha channel is 0 (transparent)
        scratchedPixels++;
      }
    }
    
    const scratchedPercent = (scratchedPixels / (canvas.width * canvas.height)) * 100;
    
    setCurrentCard(prev => prev ? { ...prev, scratchedPercent } : null);
    
    // Auto-reveal if 70% is scratched
    if (scratchedPercent > 70 && !currentCard.isRevealed) {
      revealCard();
    }
  }, [currentCard]);

  const revealCard = useCallback(() => {
    if (!currentCard || currentCard.isRevealed) return;
    
    setCurrentCard(prev => prev ? { ...prev, isRevealed: true } : null);
    
    // Clear scratch overlay
    if (scratchCanvasRef.current) {
      const ctx = scratchCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, scratchCanvasRef.current.width, scratchCanvasRef.current.height);
      }
    }
    
    if (currentCard.isWin) {
      setShowWinAnimation(true);
      setTimeout(() => setShowWinAnimation(false), 3000);
      
      // Update balance and stats
      setBalance(prev => prev + currentCard.totalPrize);
      setGameStats(prev => ({
        ...prev,
        totalWon: prev.totalWon + currentCard.totalPrize,
        biggestWin: Math.max(prev.biggestWin, currentCard.totalPrize),
        winStreak: prev.winStreak + 1,
        balance: prev.balance + currentCard.totalPrize
      }));
      
      if (soundEnabled) {
        // Play win sound
      }
    } else {
      setGameStats(prev => ({
        ...prev,
        winStreak: 0
      }));
    }
  }, [currentCard, soundEnabled]);

  // Mouse/touch event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentCard || currentCard.isRevealed) return;
    
    isMouseDown.current = true;
    setIsScratching(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastPosition.current = { x, y };
    scratchAt(x, y);
  }, [currentCard, scratchAt]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown.current || !currentCard || currentCard.isRevealed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Draw line from last position to current position
    if (lastPosition.current) {
      const dx = x - lastPosition.current.x;
      const dy = y - lastPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(distance / 5);
      
      for (let i = 0; i <= steps; i++) {
        const stepX = lastPosition.current.x + (dx * i) / steps;
        const stepY = lastPosition.current.y + (dy * i) / steps;
        scratchAt(stepX, stepY);
      }
    }
    
    lastPosition.current = { x, y };
  }, [currentCard, scratchAt]);

  const handleMouseUp = useCallback(() => {
    isMouseDown.current = false;
    lastPosition.current = null;
    setIsScratching(false);
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!currentCard || currentCard.isRevealed) return;
    
    isMouseDown.current = true;
    setIsScratching(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    lastPosition.current = { x, y };
    scratchAt(x, y);
  }, [currentCard, scratchAt]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isMouseDown.current || !currentCard || currentCard.isRevealed) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    if (lastPosition.current) {
      const dx = x - lastPosition.current.x;
      const dy = y - lastPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.ceil(distance / 5);
      
      for (let i = 0; i <= steps; i++) {
        const stepX = lastPosition.current.x + (dx * i) / steps;
        const stepY = lastPosition.current.y + (dy * i) / steps;
        scratchAt(stepX, stepY);
      }
    }
    
    lastPosition.current = { x, y };
  }, [currentCard, scratchAt]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    if (autoReveal && currentCard && !currentCard.isRevealed) {
      setTimeout(() => {
        revealCard();
      }, 1000);
    }
  }, [autoReveal, currentCard, revealCard]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gold-500/10 to-casino-blue/10 border-gold-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            Lucky Scratch Gold
            <Badge className="bg-gold-500 text-black">RTP: 97.2%</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Win Animation */}
      {showWinAnimation && currentCard?.isWin && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-gold-500/20 border-yellow-500 animate-pulse">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">🎊 WINNER! 🎊</div>
            <div className="text-xl text-gold-400">
              You won {formatCurrency(currentCard.totalPrize)}!
            </div>
            {currentCard.winCondition && (
              <div className="text-lg text-green-400 mt-2">
                {currentCard.winCondition.count}x {currentCard.winCondition.symbol} matched!
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {/* Scratch Card */}
              <div className="relative bg-gradient-to-b from-gold-100 to-gold-200 rounded-xl p-4 mb-6">
                <div className="relative">
                  {/* Background card */}
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={360}
                    className="w-full max-w-lg mx-auto rounded-lg shadow-lg"
                  />
                  
                  {/* Scratch overlay */}
                  <canvas
                    ref={scratchCanvasRef}
                    width={480}
                    height={360}
                    className="absolute top-0 left-0 w-full max-w-lg mx-auto rounded-lg cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'none' }}
                  />
                </div>

                {/* Scratch progress */}
                {currentCard && !currentCard.isRevealed && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      Scratched: {currentCard.scratchedPercent.toFixed(1)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gold-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(currentCard.scratchedPercent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Card Price</label>
                    <select 
                      value={cardPrice}
                      onChange={(e) => setCardPrice(parseFloat(e.target.value))}
                      disabled={currentCard && !currentCard.isRevealed}
                      className="w-24 p-2 rounded border bg-background"
                    >
                      <option value={1.00}>$1.00</option>
                      <option value={2.00}>$2.00</option>
                      <option value={5.00}>$5.00</option>
                      <option value={10.00}>$10.00</option>
                      <option value={20.00}>$20.00</option>
                      <option value={50.00}>$50.00</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="outline"
                    size="sm"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>

                  <Button
                    onClick={() => setAutoReveal(!autoReveal)}
                    variant={autoReveal ? "default" : "outline"}
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto Reveal
                  </Button>

                  {currentCard && !currentCard.isRevealed && (
                    <Button
                      onClick={revealCard}
                      variant="outline"
                      size="sm"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Reveal All
                    </Button>
                  )}
                </div>

                <Button
                  onClick={buyCard}
                  disabled={balance < cardPrice}
                  size="lg"
                  className={`
                    px-8 py-4 text-lg font-bold min-w-[140px]
                    ${balance < cardPrice 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black'
                    }
                  `}
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Buy Card
                </Button>
              </div>

              {/* Instructions */}
              {!currentCard && (
                <Card className="mt-6 bg-blue-50/50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="font-bold mb-2">How to Play</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>1. Choose your card price and buy a scratch card</p>
                        <p>2. Scratch the silver area to reveal symbols</p>
                        <p>3. Match 3 or more identical symbols to win prizes</p>
                        <p>4. Higher value symbols require fewer matches</p>
                        <p>5. The more you match, the bigger your win!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(balance)}
              </div>
              {balance < cardPrice && (
                <div className="text-sm text-red-400 mt-1">
                  Insufficient funds for current card price
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Card Info */}
          {currentCard && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Card</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Card ID:</span>
                  <span className="font-mono text-sm">{currentCard.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">{formatCurrency(cardPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={currentCard.isRevealed ? (currentCard.isWin ? "default" : "secondary") : "outline"}>
                    {currentCard.isRevealed ? (currentCard.isWin ? "Winner" : "Try Again") : "Scratching"}
                  </Badge>
                </div>
                {currentCard.isWin && currentCard.isRevealed && (
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">Prize:</span>
                    <span className="font-bold text-gold-400">{formatCurrency(currentCard.totalPrize)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Game Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cards Played:</span>
                <span className="font-medium">{gameStats.totalCards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Spent:</span>
                <span className="font-medium">{formatCurrency(gameStats.totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Won:</span>
                <span className="font-medium text-green-400">{formatCurrency(gameStats.totalWon)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biggest Win:</span>
                <span className="font-medium text-gold-400">{formatCurrency(gameStats.biggestWin)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Win Streak:</span>
                <span className="font-medium">{gameStats.winStreak}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Net:</span>
                <span className={`font-bold ${gameStats.totalWon - gameStats.totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(gameStats.totalWon - gameStats.totalSpent)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Prize Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prize Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {WIN_CONDITIONS.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{condition.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        {condition.count}x
                      </span>
                    </div>
                    <span className="font-medium">{condition.multiplier}x bet</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                <div>Prize = Base value × Multiplier × Card price</div>
                <div>Match more symbols for bigger wins!</div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Instant Win</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold-400" />
                  <span>Progressive Prizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-400" />
                  <span>Multiple Win Conditions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <span>Touch/Mouse Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>CoinKrazy Branding</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
