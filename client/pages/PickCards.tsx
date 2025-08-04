import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GamePickCard, { PickCard, GamePick } from "@/components/GamePickCard";
import {
  Trophy,
  Plus,
  Target,
  Clock,
  TrendingUp,
  Star,
  ShoppingCart,
  DollarSign,
  Coins,
  Crown,
  CheckCircle,
  X,
  RotateCcw,
  Filter,
  Search,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function PickCards() {
  const navigate = useNavigate();
  const [pickCards, setPickCards] = useState<PickCard[]>([]);
  const [userBalance] = useState({ gc: 125000, sc: 450 });
  const [activeTab, setActiveTab] = useState<string>("building");
  const [stats, setStats] = useState({
    totalCards: 0,
    activeBets: 0,
    totalWagered: 0,
    totalWon: 0,
    winRate: 0,
  });

  useEffect(() => {
    // Load sample pick cards
    const sampleCards: PickCard[] = [
      {
        id: "card-1",
        picks: [
          {
            id: "pick-1",
            gameId: "nfl-1",
            homeTeam: "Kansas City Chiefs",
            awayTeam: "Buffalo Bills",
            sport: "NFL",
            betType: "spread",
            selection: "Kansas City Chiefs -3.5",
            odds: -110,
            line: -3.5,
            gameTime: new Date(Date.now() + 86400000).toISOString(),
            confidence: "high",
          },
          {
            id: "pick-2",
            gameId: "nfl-2",
            homeTeam: "Los Angeles Rams",
            awayTeam: "San Francisco 49ers",
            sport: "NFL",
            betType: "total",
            selection: "Over 47.5",
            odds: -105,
            line: 47.5,
            gameTime: new Date(Date.now() + 90000000).toISOString(),
            confidence: "medium",
          },
        ],
        wagerAmount: 10,
        potentialPayout: 30,
        multiplier: 3,
        status: "building",
        createdAt: new Date().toISOString(),
      },
      {
        id: "card-2",
        picks: [
          {
            id: "pick-3",
            gameId: "nba-1",
            homeTeam: "Los Angeles Lakers",
            awayTeam: "Boston Celtics",
            sport: "NBA",
            betType: "moneyline",
            selection: "Los Angeles Lakers",
            odds: -140,
            gameTime: new Date(Date.now() - 3600000).toISOString(),
            confidence: "high",
          },
        ],
        wagerAmount: 500,
        potentialPayout: 857,
        multiplier: 1,
        status: "placed",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        placedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "card-3",
        picks: [
          {
            id: "pick-4",
            gameId: "nfl-3",
            homeTeam: "Dallas Cowboys",
            awayTeam: "Philadelphia Eagles",
            sport: "NFL",
            betType: "spread",
            selection: "Dallas Cowboys +7",
            odds: -110,
            line: 7,
            gameTime: new Date(Date.now() - 86400000).toISOString(),
            confidence: "medium",
          },
          {
            id: "pick-5",
            gameId: "nfl-4",
            homeTeam: "Green Bay Packers",
            awayTeam: "Chicago Bears",
            sport: "NFL",
            betType: "total",
            selection: "Under 42.5",
            odds: -115,
            line: 42.5,
            gameTime: new Date(Date.now() - 82800000).toISOString(),
            confidence: "low",
          },
          {
            id: "pick-6",
            gameId: "nfl-5",
            homeTeam: "Miami Dolphins",
            awayTeam: "New York Jets",
            sport: "NFL",
            betType: "moneyline",
            selection: "Miami Dolphins",
            odds: -160,
            gameTime: new Date(Date.now() - 79200000).toISOString(),
            confidence: "high",
          },
        ],
        wagerAmount: 2000,
        potentialPayout: 10000,
        multiplier: 5,
        status: "won",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        placedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    setPickCards(sampleCards);
    calculateStats(sampleCards);
  }, []);

  const calculateStats = (cards: PickCard[]) => {
    const totalCards = cards.length;
    const activeBets = cards.filter((card) => card.status === "placed").length;
    const completedBets = cards.filter(
      (card) => card.status === "won" || card.status === "lost",
    );
    const wonBets = cards.filter((card) => card.status === "won");
    const totalWagered = cards
      .filter((card) => card.status !== "building")
      .reduce((sum, card) => sum + card.wagerAmount, 0);
    const totalWon = wonBets.reduce(
      (sum, card) => sum + card.potentialPayout,
      0,
    );
    const winRate =
      completedBets.length > 0
        ? (wonBets.length / completedBets.length) * 100
        : 0;

    setStats({
      totalCards,
      activeBets,
      totalWagered,
      totalWon,
      winRate,
    });
  };

  const handleUpdateCard = (updatedCard: PickCard) => {
    setPickCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
    );
  };

  const handleRemoveCard = (cardId: string) => {
    setPickCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const handlePlaceBet = (card: PickCard) => {
    // For sports betting, check SC balance; otherwise check GC balance
    const isSportsBetting = card.picks.some(pick =>
      ['NFL', 'NBA', 'MLB', 'NHL'].includes(pick.sport)
    );
    const availableBalance = isSportsBetting ? userBalance.sc : userBalance.gc;

    if (card.wagerAmount > availableBalance) {
      // Insufficient funds - redirect to store
      navigate("/store");
      return;
    }

    // Place the bet
    const placedCard: PickCard = {
      ...card,
      status: "placed",
      placedAt: new Date().toISOString(),
    };

    setPickCards((prev) =>
      prev.map((c) => (c.id === card.id ? placedCard : c)),
    );

    // In production, this would make an API call to place the bet
    console.log("Bet placed:", placedCard);
  };

  const handleSaveToCart = (card: PickCard) => {
    const savedCard: PickCard = {
      ...card,
      status: "saved",
    };

    setPickCards((prev) => prev.map((c) => (c.id === card.id ? savedCard : c)));

    // Redirect to store with cart info
    navigate("/store?cart=" + card.id);
  };

  const createNewCard = () => {
    const newCard: PickCard = {
      id: `card-${Date.now()}`,
      picks: [],
      wagerAmount: 0,
      potentialPayout: 0,
      multiplier: 1,
      status: "building",
      createdAt: new Date().toISOString(),
    };

    setPickCards((prev) => [newCard, ...prev]);
    return newCard.id;
  };

  const filteredCards = pickCards.filter((card) => {
    switch (activeTab) {
      case "building":
        return card.status === "building";
      case "active":
        return card.status === "placed";
      case "completed":
        return card.status === "won" || card.status === "lost";
      case "saved":
        return card.status === "saved";
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/10 via-casino-blue/5 to-gold/10 py-8 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Game Pick Cards</h1>
              <p className="text-muted-foreground">
                Build your parlay picks and track your betting performance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-gold-400">
                  {userBalance.gc.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Gold Coins</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-casino-blue">
                  {userBalance.sc.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Sweeps Coins</div>
              </div>
              <Button
                onClick={createNewCard}
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Pick Card
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalCards}</div>
              <div className="text-sm text-muted-foreground">Total Cards</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-casino-blue mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.activeBets}</div>
              <div className="text-sm text-muted-foreground">Active Bets</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {stats.totalWagered.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Wagered</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {stats.totalWon.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Won</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </CardContent>
          </Card>
        </div>

        {/* Parlay Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-casino-blue/10 to-casino-blue/5 border-casino-blue/20">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-casino-blue mx-auto mb-2" />
              <h3 className="font-bold mb-2">2-Pick Parlay</h3>
              <div className="text-2xl font-bold text-casino-blue mb-1">3x</div>
              <p className="text-sm text-muted-foreground">
                Both picks must win
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold-500/20">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-gold-500 mx-auto mb-2" />
              <h3 className="font-bold mb-2">3-Pick Parlay</h3>
              <div className="text-2xl font-bold text-gold-500 mb-1">5x</div>
              <p className="text-sm text-muted-foreground">
                All 3 picks must win
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-bold mb-2">4-Pick Parlay</h3>
              <div className="text-2xl font-bold text-purple-500 mb-1">10x</div>
              <p className="text-sm text-muted-foreground">
                All 4 picks must win
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pick Cards Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="building">
              <Plus className="w-4 h-4 mr-2" />
              Building (
              {pickCards.filter((c) => c.status === "building").length})
            </TabsTrigger>
            <TabsTrigger value="active">
              <Clock className="w-4 h-4 mr-2" />
              Active ({pickCards.filter((c) => c.status === "placed").length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed (
              {
                pickCards.filter(
                  (c) => c.status === "won" || c.status === "lost",
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value="saved">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Saved ({pickCards.filter((c) => c.status === "saved").length})
            </TabsTrigger>
            <TabsTrigger value="all">
              <Target className="w-4 h-4 mr-2" />
              All ({pickCards.length})
            </TabsTrigger>
          </TabsList>

          {/* Cards Content */}
          <TabsContent value={activeTab} className="mt-6">
            {filteredCards.length === 0 ? (
              <Card className="text-center p-12">
                <CardContent>
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">
                    {activeTab === "building"
                      ? "No Pick Cards in Progress"
                      : activeTab === "active"
                        ? "No Active Bets"
                        : activeTab === "completed"
                          ? "No Completed Bets"
                          : activeTab === "saved"
                            ? "No Saved Cards"
                            : "No Pick Cards Yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === "building"
                      ? "Create a new pick card to start building your parlay bets."
                      : activeTab === "active"
                        ? "Place some bets to see them here!"
                        : activeTab === "completed"
                          ? "Complete some bets to see your results here."
                          : activeTab === "saved"
                            ? "Save pick cards to your cart when you need more coins."
                            : "Create your first pick card to get started with parlay betting."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={createNewCard}
                      className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-bold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Pick Card
                    </Button>
                    <Link to="/sportsbook">
                      <Button variant="outline">
                        <Trophy className="w-4 h-4 mr-2" />
                        Browse Games
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCards.map((card) => (
                  <GamePickCard
                    key={card.id}
                    pickCard={card}
                    userBalance={userBalance}
                    onUpdateCard={handleUpdateCard}
                    onRemoveCard={handleRemoveCard}
                    onPlaceBet={handlePlaceBet}
                    onSaveToCart={handleSaveToCart}
                    isSportsBetting={card.picks.some(pick =>
                      ['NFL', 'NBA', 'MLB', 'NHL'].includes(pick.sport)
                    )}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
