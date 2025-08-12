import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import ScratchCard from './ScratchCard';
import { 
  ShoppingCart, 
  Gift, 
  Coins, 
  Trophy, 
  Star, 
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  Plus,
  Eye,
  Play
} from 'lucide-react';

interface CardType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  card_image?: string;
  game_type: string;
  min_symbols_to_match: number;
  total_scratch_areas: number;
  cost_gc: number;
  cost_sc: number;
  currency_type: string;
  max_prize_gc: number;
  max_prize_sc: number;
  overall_odds: number;
  rtp_percentage: number;
  is_featured: boolean;
  total_sold: number;
  theme_name: string;
  theme_display_name: string;
  background_image?: string;
  prizes?: Prize[];
}

interface Prize {
  id: number;
  prize_tier: string;
  prize_name: string;
  prize_gc: number;
  prize_sc: number;
  win_probability: number;
}

interface CardInstance {
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
  purchased_at: string;
  card_name?: string;
  theme_name?: string;
}

export default function ScratchCardsLobby() {
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [myCards, setMyCards] = useState<CardInstance[]>([]);
  const [activeTab, setActiveTab] = useState('lobby');
  const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCardTypes();
    loadMyCards();
  }, []);

  const loadCardTypes = async () => {
    try {
      const response = await fetch('/api/scratch-cards/types');
      if (response.ok) {
        const result = await response.json();
        setCardTypes(result.data || []);
      }
    } catch (error) {
      console.error('Error loading card types:', error);
      toast({
        title: "Error",
        description: "Failed to load scratch cards",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMyCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scratch-cards/my-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setMyCards(result.data || []);
      }
    } catch (error) {
      console.error('Error loading my cards:', error);
    }
  };

  const purchaseCard = async (cardTypeId: number) => {
    setPurchasing(cardTypeId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/scratch-cards/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardTypeId })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success!",
          description: "Scratch card purchased successfully!"
        });
        await loadMyCards();
        setActiveTab('my-cards');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing card:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to purchase card",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handleScratch = async (instanceId: string, areaIndex: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/scratch-cards/scratch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ instanceId, areaIndex })
    });

    if (response.ok) {
      const result = await response.json();
      
      // Update the card in myCards
      setMyCards(prev => prev.map(card => 
        card.instance_id === instanceId 
          ? { ...card, ...result.data.cardInstance }
          : card
      ));

      // Update selected card if it's the one being played
      if (selectedCard?.instance_id === instanceId) {
        setSelectedCard(prev => prev ? { ...prev, ...result.data.cardInstance } : null);
      }

      return result.data;
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Scratch failed');
    }
  };

  const handleClaimPrize = async (instanceId: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/scratch-cards/claim-prize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ instanceId })
    });

    if (response.ok) {
      // Refresh cards to update claimed status
      await loadMyCards();
      
      if (selectedCard?.instance_id === instanceId) {
        const updatedCard = myCards.find(card => card.instance_id === instanceId);
        if (updatedCard) {
          setSelectedCard(updatedCard);
        }
      }
    } else {
      const error = await response.json();
      throw new Error(error.error || 'Claim failed');
    }
  };

  const openCardGame = (card: CardInstance) => {
    setSelectedCard(card);
    setPlayingCard(card.instance_id);
  };

  const getThemeCards = () => {
    const themes: { [key: string]: CardType[] } = {};
    cardTypes.forEach(card => {
      const themeName = card.theme_display_name || 'Other';
      if (!themes[themeName]) {
        themes[themeName] = [];
      }
      themes[themeName].push(card);
    });
    return themes;
  };

  const unscratched = myCards.filter(card => card.status === 'unscratched');
  const completed = myCards.filter(card => card.status === 'completed');
  const winners = myCards.filter(card => card.is_winner);
  const unclaimedPrizes = winners.filter(card => !card.prize_claimed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 bg-clip-text text-transparent">
          Scratch Cards
        </h1>
        <p className="text-lg text-muted-foreground">
          Scratch your way to instant prizes and big wins!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-700">{myCards.length}</div>
            <div className="text-sm text-blue-600">Total Cards</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-700">{winners.length}</div>
            <div className="text-sm text-green-600">Winning Cards</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gold-50 to-gold-100">
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 mx-auto mb-2 text-gold-600" />
            <div className="text-2xl font-bold text-gold-700">
              {winners.reduce((sum, card) => sum + card.winnings_gc, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gold-600">GC Won</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-700">{unscratched.length}</div>
            <div className="text-sm text-purple-600">Unscratched</div>
          </CardContent>
        </Card>
      </div>

      {/* Unclaimed Prizes Alert */}
      {unclaimedPrizes.length > 0 && (
        <Card className="bg-gradient-to-r from-gold-50 to-gold-100 border-gold-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="w-6 h-6 text-gold-500 mr-3" />
                <div>
                  <h3 className="font-semibold text-gold-800">Unclaimed Prizes!</h3>
                  <p className="text-sm text-gold-600">
                    You have {unclaimedPrizes.length} winning cards with unclaimed prizes
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('my-cards')}
                className="bg-gold-600 hover:bg-gold-700"
              >
                Claim Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lobby">Card Shop</TabsTrigger>
          <TabsTrigger value="my-cards">My Cards ({myCards.length})</TabsTrigger>
        </TabsList>

        {/* Card Shop */}
        <TabsContent value="lobby" className="space-y-6">
          {Object.entries(getThemeCards()).map(([themeName, themeCards]) => (
            <div key={themeName} className="space-y-4">
              <h2 className="text-2xl font-bold text-gold-700">{themeName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {themeCards.map(cardType => (
                  <Card key={cardType.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gradient-to-br from-gold-100 to-gold-200 relative"
                         style={{ 
                           backgroundImage: cardType.background_image ? `url(${cardType.background_image})` : undefined,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center'
                         }}>
                      {cardType.is_featured && (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                        RTP: {cardType.rtp_percentage}%
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{cardType.display_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{cardType.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-lg font-bold text-gold-600">
                            {cardType.cost_gc.toLocaleString()} GC
                            {cardType.cost_sc > 0 && ` + ${cardType.cost_sc} SC`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Max Prize: {cardType.max_prize_gc.toLocaleString()} GC
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-600 font-medium">
                            {(cardType.overall_odds * 100).toFixed(1)}% Win Rate
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {cardType.total_sold} sold
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => purchaseCard(cardType.id)}
                          disabled={purchasing === cardType.id}
                          className="flex-1 bg-gold-600 hover:bg-gold-700"
                        >
                          {purchasing === cardType.id ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 mr-2" />
                          )}
                          Buy Card
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>{cardType.display_name}</DialogTitle>
                              <DialogDescription>{cardType.description}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Cost:</span> {cardType.cost_gc.toLocaleString()} GC
                                </div>
                                <div>
                                  <span className="font-medium">Max Prize:</span> {cardType.max_prize_gc.toLocaleString()} GC
                                </div>
                                <div>
                                  <span className="font-medium">Win Rate:</span> {(cardType.overall_odds * 100).toFixed(1)}%
                                </div>
                                <div>
                                  <span className="font-medium">RTP:</span> {cardType.rtp_percentage}%
                                </div>
                                <div>
                                  <span className="font-medium">Game Type:</span> {cardType.game_type.replace('_', ' ')}
                                </div>
                                <div>
                                  <span className="font-medium">Scratch Areas:</span> {cardType.total_scratch_areas}
                                </div>
                              </div>
                              
                              {cardType.prizes && cardType.prizes.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Prize Structure:</h4>
                                  <div className="space-y-2">
                                    {cardType.prizes.map(prize => (
                                      <div key={prize.id} className="flex justify-between text-sm">
                                        <span>{prize.prize_name}</span>
                                        <span className="font-medium">
                                          {prize.prize_gc > 0 && `${prize.prize_gc.toLocaleString()} GC`}
                                          {prize.prize_sc > 0 && ` ${prize.prize_sc} SC`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* My Cards */}
        <TabsContent value="my-cards" className="space-y-6">
          {myCards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No scratch cards yet</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase your first scratch card to get started!
                </p>
                <Button onClick={() => setActiveTab('lobby')} className="bg-gold-600 hover:bg-gold-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Browse Cards
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCards.map(card => (
                <Card key={card.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{card.card_name}</CardTitle>
                      <Badge variant={
                        card.status === 'completed' ? 'default' :
                        card.status === 'partially_scratched' ? 'secondary' : 'outline'
                      }>
                        {card.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{card.theme_name}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Purchased: {new Date(card.purchased_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {card.is_winner && (
                      <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center mb-2">
                          <Trophy className="w-5 h-5 text-green-600 mr-2" />
                          <span className="font-semibold text-green-700">Winner!</span>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-700">
                            {card.winnings_gc.toLocaleString()} GC
                            {card.winnings_sc > 0 && ` + ${card.winnings_sc} SC`}
                          </div>
                          {!card.prize_claimed && (
                            <Badge variant="secondary" className="mt-2">
                              Prize Unclaimed
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => openCardGame(card)}
                        variant={card.status === 'unscratched' ? 'default' : 'outline'}
                        className="flex-1"
                        disabled={card.status === 'expired'}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {card.status === 'unscratched' ? 'Play' : 'View'}
                      </Button>
                      
                      {card.is_winner && !card.prize_claimed && (
                        <Button 
                          onClick={() => handleClaimPrize(card.instance_id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Gift className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Game Dialog */}
      <Dialog open={!!playingCard} onOpenChange={() => setPlayingCard(null)}>
        <DialogContent className="max-w-lg">
          {selectedCard && (
            <ScratchCard
              instance={selectedCard}
              cardType={cardTypes.find(ct => ct.id === selectedCard.card_type_id)!}
              onScratch={(areaIndex) => handleScratch(selectedCard.instance_id, areaIndex)}
              onClaimPrize={() => handleClaimPrize(selectedCard.instance_id)}
              disabled={selectedCard.status === 'completed' || selectedCard.status === 'expired'}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
