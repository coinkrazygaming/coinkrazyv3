import { walletService, CurrencyType } from "./walletService";

export interface PlayingCard {
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank:
    | "A"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "J"
    | "Q"
    | "K";
  value: number; // For blackjack calculations
  unicode: string; // For display
  color: "red" | "black";
}

export interface Deck {
  cards: PlayingCard[];
  position: number; // Current dealing position
  shuffled: boolean;
}

export interface BlackjackHand {
  cards: PlayingCard[];
  value: number;
  softAce: boolean; // Has ace counted as 11
  isBlackjack: boolean;
  isBusted: boolean;
  isStood: boolean;
  canSplit: boolean;
  canDouble: boolean;
  canInsure: boolean;
  bet: number;
  sideBets: { [key: string]: number };
}

export interface BlackjackGameState {
  gameId: string;
  userId: string;
  deck: Deck;
  playerHands: BlackjackHand[];
  dealerHand: BlackjackHand;
  currentHandIndex: number;
  gamePhase: "betting" | "dealing" | "playing" | "dealer_play" | "finished";
  currency: CurrencyType;
  minBet: number;
  maxBet: number;
  insurance: number;
  surrender: boolean;
  rules: BlackjackRules;
}

export interface BlackjackRules {
  dealerStandsOnSoft17: boolean;
  blackjackPays: number; // 1.5 for 3:2, 1.2 for 6:5
  doubleAfterSplit: boolean;
  resplitAces: boolean;
  surrenderAllowed: boolean;
  insuranceAllowed: boolean;
  maxSplitHands: number;
  doubleOnAnyTwo: boolean;
}

export interface RouletteGameState {
  gameId: string;
  userId: string;
  wheel: RouletteWheel;
  bets: RouletteBet[];
  result?: RouletteResult;
  gamePhase: "betting" | "spinning" | "finished";
  currency: CurrencyType;
  minBet: number;
  maxBet: number;
  tableLimit: number;
  wheelType: "european" | "american";
}

export interface RouletteWheel {
  type: "european" | "american";
  numbers: RouletteNumber[];
  ballPosition?: number;
  spinning: boolean;
}

export interface RouletteNumber {
  number: number;
  color: "red" | "black" | "green";
  position: number; // Position on wheel
}

export interface RouletteBet {
  id: string;
  type: RouletteBetType;
  numbers: number[];
  amount: number;
  odds: number;
  payout: number;
  description: string;
}

export type RouletteBetType =
  | "straight"
  | "split"
  | "street"
  | "corner"
  | "line"
  | "column"
  | "dozen"
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"
  | "zero"
  | "double_zero";

export interface RouletteResult {
  number: number;
  color: "red" | "black" | "green";
  winningBets: RouletteBet[];
  totalWin: number;
  ballPath: number[]; // Animation path
}

export interface BaccaratGameState {
  gameId: string;
  userId: string;
  shoe: Deck[];
  playerHand: PlayingCard[];
  bankerHand: PlayingCard[];
  bets: BaccaratBet[];
  result?: BaccaratResult;
  gamePhase: "betting" | "dealing" | "drawing" | "finished";
  currency: CurrencyType;
  minBet: number;
  maxBet: number;
  commission: number; // Usually 5% on banker wins
}

export interface BaccaratBet {
  type:
    | "player"
    | "banker"
    | "tie"
    | "player_pair"
    | "banker_pair"
    | "perfect_pair";
  amount: number;
  odds: number;
}

export interface BaccaratResult {
  playerValue: number;
  bankerValue: number;
  winner: "player" | "banker" | "tie";
  naturalWin: boolean;
  totalWin: number;
  commission: number;
}

export interface CasinoWarGameState {
  gameId: string;
  userId: string;
  deck: Deck;
  playerCard?: PlayingCard;
  dealerCard?: PlayingCard;
  bet: number;
  warBet?: number;
  result?: CasinoWarResult;
  gamePhase: "betting" | "dealing" | "war" | "finished";
  currency: CurrencyType;
}

export interface CasinoWarResult {
  winner: "player" | "dealer" | "war";
  totalWin: number;
  warWin?: number;
}

export interface GameSession {
  sessionId: string;
  userId: string;
  gameType: "blackjack" | "roulette" | "baccarat" | "casino_war";
  startTime: Date;
  endTime?: Date;
  currency: CurrencyType;
  totalBets: number;
  totalWins: number;
  netResult: number;
  handsPlayed: number;
  biggestWin: number;
  longestWinStreak: number;
  longestLoseStreak: number;
  currentStreak: number;
  averageBet: number;
  houseEdge: number;
  decisions: GameDecision[];
}

export interface GameDecision {
  hand: number;
  situation: string;
  decision: string;
  result: "win" | "lose" | "push";
  amount: number;
  optimal: boolean; // Was it the mathematically correct decision
}

class TableGameEngine {
  private activeGames: Map<string, any> = new Map();
  private activeSessions: Map<string, GameSession> = new Map();
  private gameHistory: Map<string, any[]> = new Map();

  constructor() {
    this.initializeRouletteWheels();
  }

  // Card and Deck Management
  createStandardDeck(): PlayingCard[] {
    const suits: PlayingCard["suit"][] = [
      "hearts",
      "diamonds",
      "clubs",
      "spades",
    ];
    const ranks: PlayingCard["rank"][] = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];
    const deck: PlayingCard[] = [];

    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        let value = 0;
        if (rank === "A")
          value = 11; // Ace high initially
        else if (["J", "Q", "K"].includes(rank)) value = 10;
        else value = parseInt(rank);

        const unicode = this.getCardUnicode(suit, rank);
        const color =
          suit === "hearts" || suit === "diamonds" ? "red" : "black";

        deck.push({
          suit,
          rank,
          value,
          unicode,
          color,
        });
      });
    });

    return deck;
  }

  private getCardUnicode(
    suit: PlayingCard["suit"],
    rank: PlayingCard["rank"],
  ): string {
    const suitSymbols = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    };
    return `${rank}${suitSymbols[suit]}`;
  }

  shuffleDeck(deck: PlayingCard[]): PlayingCard[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  createShoe(deckCount: number = 6): Deck {
    let cards: PlayingCard[] = [];
    for (let i = 0; i < deckCount; i++) {
      cards = cards.concat(this.createStandardDeck());
    }

    return {
      cards: this.shuffleDeck(cards),
      position: 0,
      shuffled: true,
    };
  }

  dealCard(deck: Deck): PlayingCard {
    if (deck.position >= deck.cards.length) {
      throw new Error("Deck is empty");
    }

    const card = deck.cards[deck.position];
    deck.position++;
    return card;
  }

  // BLACKJACK ENGINE
  async startBlackjackGame(
    userId: string,
    currency: CurrencyType,
    tableRules?: Partial<BlackjackRules>,
  ): Promise<BlackjackGameState> {
    const gameId = `blackjack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const defaultRules: BlackjackRules = {
      dealerStandsOnSoft17: true,
      blackjackPays: 1.5, // 3:2
      doubleAfterSplit: true,
      resplitAces: false,
      surrenderAllowed: true,
      insuranceAllowed: true,
      maxSplitHands: 4,
      doubleOnAnyTwo: true,
    };

    const gameState: BlackjackGameState = {
      gameId,
      userId,
      deck: this.createShoe(6),
      playerHands: [],
      dealerHand: {
        cards: [],
        value: 0,
        softAce: false,
        isBlackjack: false,
        isBusted: false,
        isStood: false,
        canSplit: false,
        canDouble: false,
        canInsure: false,
        bet: 0,
        sideBets: {},
      },
      currentHandIndex: 0,
      gamePhase: "betting",
      currency,
      minBet: currency === "GC" ? 25 : 0.25,
      maxBet: currency === "GC" ? 10000 : 100,
      insurance: 0,
      surrender: false,
      rules: { ...defaultRules, ...tableRules },
    };

    this.activeGames.set(gameId, gameState);
    return gameState;
  }

  async placeBet(
    gameId: string,
    betAmount: number,
    sideBets?: { [key: string]: number },
  ): Promise<boolean> {
    const game = this.activeGames.get(gameId) as BlackjackGameState;
    if (!game || game.gamePhase !== "betting") return false;

    if (betAmount < game.minBet || betAmount > game.maxBet) {
      throw new Error(
        `Bet must be between ${game.minBet} and ${game.maxBet} ${game.currency}`,
      );
    }

    // Deduct bet from wallet
    await walletService.placeBet(
      game.userId,
      betAmount,
      game.currency,
      gameId,
      "table",
    );

    // Create initial player hand
    const playerHand: BlackjackHand = {
      cards: [],
      value: 0,
      softAce: false,
      isBlackjack: false,
      isBusted: false,
      isStood: false,
      canSplit: false,
      canDouble: true,
      canInsure: false,
      bet: betAmount,
      sideBets: sideBets || {},
    };

    game.playerHands = [playerHand];
    game.gamePhase = "dealing";

    // Deal initial cards
    await this.dealInitialCards(game);

    return true;
  }

  private async dealInitialCards(game: BlackjackGameState): Promise<void> {
    const playerHand = game.playerHands[0];

    // Deal two cards to player
    playerHand.cards.push(this.dealCard(game.deck));
    playerHand.cards.push(this.dealCard(game.deck));

    // Deal two cards to dealer (one face down)
    game.dealerHand.cards.push(this.dealCard(game.deck));
    game.dealerHand.cards.push(this.dealCard(game.deck)); // Face down card

    // Calculate hand values
    this.calculateHandValue(playerHand);
    this.calculateHandValue(game.dealerHand, true); // Only count first card for dealer display

    // Check for blackjacks
    if (playerHand.value === 21) {
      playerHand.isBlackjack = true;
      if (
        game.dealerHand.cards[0].value === 10 ||
        game.dealerHand.cards[0].rank === "A"
      ) {
        // Check dealer for blackjack
        const dealerFullValue = this.calculateHandValue({
          ...game.dealerHand,
          cards: game.dealerHand.cards,
        });
        if (dealerFullValue === 21) {
          game.dealerHand.isBlackjack = true;
          await this.finishHand(game);
          return;
        }
      }
      // Player blackjack, dealer doesn't have blackjack
      await this.finishHand(game);
      return;
    }

    // Check for insurance
    if (game.dealerHand.cards[0].rank === "A" && game.rules.insuranceAllowed) {
      playerHand.canInsure = true;
    }

    // Set up player options
    this.setupPlayerOptions(playerHand);
    game.gamePhase = "playing";
  }

  private calculateHandValue(
    hand: BlackjackHand,
    dealerFirstCardOnly = false,
  ): number {
    let value = 0;
    let aces = 0;

    const cardsToCount = dealerFirstCardOnly ? [hand.cards[0]] : hand.cards;

    cardsToCount.forEach((card) => {
      if (card.rank === "A") {
        aces++;
        value += 11;
      } else {
        value += card.value;
      }
    });

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    hand.value = value;
    hand.softAce = aces > 0 && value <= 21;
    hand.isBusted = value > 21;

    return value;
  }

  private setupPlayerOptions(hand: BlackjackHand): void {
    // Can double on any two cards (unless already doubled)
    hand.canDouble = hand.cards.length === 2;

    // Can split if two cards of same rank
    hand.canSplit =
      hand.cards.length === 2 && hand.cards[0].rank === hand.cards[1].rank;
  }

  async playerAction(
    gameId: string,
    action: "hit" | "stand" | "double" | "split" | "surrender" | "insurance",
    insuranceAmount?: number,
  ): Promise<BlackjackGameState> {
    const game = this.activeGames.get(gameId) as BlackjackGameState;
    if (!game || game.gamePhase !== "playing") {
      throw new Error("Invalid game state for player action");
    }

    const currentHand = game.playerHands[game.currentHandIndex];

    switch (action) {
      case "hit":
        await this.playerHit(game, currentHand);
        break;

      case "stand":
        await this.playerStand(game, currentHand);
        break;

      case "double":
        await this.playerDouble(game, currentHand);
        break;

      case "split":
        await this.playerSplit(game, currentHand);
        break;

      case "surrender":
        await this.playerSurrender(game, currentHand);
        break;

      case "insurance":
        if (insuranceAmount) {
          await this.playerInsurance(game, insuranceAmount);
        }
        break;
    }

    // Record decision for analysis
    this.recordDecision(game, action, currentHand);

    return game;
  }

  private async playerHit(
    game: BlackjackGameState,
    hand: BlackjackHand,
  ): Promise<void> {
    hand.cards.push(this.dealCard(game.deck));
    this.calculateHandValue(hand);

    if (hand.isBusted) {
      hand.isStood = true;
      await this.moveToNextHand(game);
    } else {
      // Update options
      hand.canDouble = false; // Can't double after hitting
      hand.canSplit = false;
    }
  }

  private async playerStand(
    game: BlackjackGameState,
    hand: BlackjackHand,
  ): Promise<void> {
    hand.isStood = true;
    await this.moveToNextHand(game);
  }

  private async playerDouble(
    game: BlackjackGameState,
    hand: BlackjackHand,
  ): Promise<void> {
    if (!hand.canDouble) {
      throw new Error("Cannot double this hand");
    }

    // Place additional bet
    await walletService.placeBet(
      game.userId,
      hand.bet,
      game.currency,
      game.gameId,
      "table",
    );
    hand.bet *= 2;

    // Deal one card and stand
    hand.cards.push(this.dealCard(game.deck));
    this.calculateHandValue(hand);
    hand.isStood = true;

    await this.moveToNextHand(game);
  }

  private async playerSplit(
    game: BlackjackGameState,
    hand: BlackjackHand,
  ): Promise<void> {
    if (!hand.canSplit || game.playerHands.length >= game.rules.maxSplitHands) {
      throw new Error("Cannot split this hand");
    }

    // Place additional bet for split hand
    await walletService.placeBet(
      game.userId,
      hand.bet,
      game.currency,
      game.gameId,
      "table",
    );

    // Create new hand with second card
    const newHand: BlackjackHand = {
      cards: [hand.cards[1]],
      value: 0,
      softAce: false,
      isBlackjack: false,
      isBusted: false,
      isStood: false,
      canSplit: false,
      canDouble: true,
      canInsure: false,
      bet: hand.bet,
      sideBets: {},
    };

    // Keep first card in original hand
    hand.cards = [hand.cards[0]];

    // Deal new cards to both hands
    hand.cards.push(this.dealCard(game.deck));
    newHand.cards.push(this.dealCard(game.deck));

    // Calculate values
    this.calculateHandValue(hand);
    this.calculateHandValue(newHand);

    // Insert new hand after current
    game.playerHands.splice(game.currentHandIndex + 1, 0, newHand);

    // Set up options for current hand
    this.setupPlayerOptions(hand);

    // Special rules for split aces
    if (hand.cards[0].rank === "A" && !game.rules.resplitAces) {
      hand.isStood = true;
      newHand.isStood = true;
      await this.moveToNextHand(game);
    }
  }

  private async playerSurrender(
    game: BlackjackGameState,
    hand: BlackjackHand,
  ): Promise<void> {
    if (!game.rules.surrenderAllowed || hand.cards.length !== 2) {
      throw new Error("Cannot surrender this hand");
    }

    // Return half the bet
    await walletService.recordWin(
      game.userId,
      hand.bet / 2,
      game.currency,
      game.gameId,
      "table",
    );

    hand.isStood = true;
    game.surrender = true;

    await this.moveToNextHand(game);
  }

  private async playerInsurance(
    game: BlackjackGameState,
    amount: number,
  ): Promise<void> {
    if (amount > game.playerHands[0].bet / 2) {
      throw new Error("Insurance cannot exceed half the original bet");
    }

    await walletService.placeBet(
      game.userId,
      amount,
      game.currency,
      game.gameId,
      "table",
    );
    game.insurance = amount;

    // Check dealer blackjack immediately
    const dealerValue = this.calculateHandValue({
      ...game.dealerHand,
      cards: game.dealerHand.cards,
    });

    if (dealerValue === 21) {
      // Insurance pays 2:1
      await walletService.recordWin(
        game.userId,
        amount * 3,
        game.currency,
        game.gameId,
        "table",
      );
    }
  }

  private async moveToNextHand(game: BlackjackGameState): Promise<void> {
    game.currentHandIndex++;

    if (game.currentHandIndex >= game.playerHands.length) {
      // All player hands complete, play dealer
      await this.playDealerHand(game);
    } else {
      // Set up next hand
      const nextHand = game.playerHands[game.currentHandIndex];
      this.setupPlayerOptions(nextHand);
    }
  }

  private async playDealerHand(game: BlackjackGameState): Promise<void> {
    game.gamePhase = "dealer_play";

    // Reveal dealer's full hand
    this.calculateHandValue(game.dealerHand);

    // Check if dealer needs to play (any player hands not busted)
    const playableHands = game.playerHands.filter(
      (h) => !h.isBusted && !game.surrender,
    );

    if (playableHands.length === 0) {
      await this.finishHand(game);
      return;
    }

    // Dealer hits until 17 or stands on soft 17 based on rules
    while (this.shouldDealerHit(game.dealerHand, game.rules)) {
      game.dealerHand.cards.push(this.dealCard(game.deck));
      this.calculateHandValue(game.dealerHand);
    }

    await this.finishHand(game);
  }

  private shouldDealerHit(
    dealerHand: BlackjackHand,
    rules: BlackjackRules,
  ): boolean {
    if (dealerHand.value < 17) return true;
    if (dealerHand.value > 17) return false;

    // Exactly 17
    if (
      dealerHand.value === 17 &&
      dealerHand.softAce &&
      !rules.dealerStandsOnSoft17
    ) {
      return true; // Hit soft 17
    }

    return false;
  }

  private async finishHand(game: BlackjackGameState): Promise<void> {
    game.gamePhase = "finished";

    // Calculate results for each hand
    let totalWin = 0;

    for (const playerHand of game.playerHands) {
      const result = this.calculateBlackjackResult(
        playerHand,
        game.dealerHand,
        game.rules,
      );
      totalWin += result.payout;

      if (result.payout > 0) {
        await walletService.recordWin(
          game.userId,
          result.payout,
          game.currency,
          game.gameId,
          "table",
        );
      }
    }

    // Update session
    this.updateGameSession(game.gameId, game.userId, "blackjack", totalWin);
  }

  private calculateBlackjackResult(
    playerHand: BlackjackHand,
    dealerHand: BlackjackHand,
    rules: BlackjackRules,
  ): { result: "win" | "lose" | "push"; payout: number; description: string } {
    // Player busted
    if (playerHand.isBusted) {
      return { result: "lose", payout: 0, description: "Player busted" };
    }

    // Player blackjack
    if (playerHand.isBlackjack) {
      if (dealerHand.isBlackjack) {
        return {
          result: "push",
          payout: playerHand.bet,
          description: "Both blackjack - push",
        };
      }
      return {
        result: "win",
        payout: playerHand.bet + playerHand.bet * rules.blackjackPays,
        description: "Player blackjack",
      };
    }

    // Dealer blackjack (player doesn't have blackjack)
    if (dealerHand.isBlackjack) {
      return { result: "lose", payout: 0, description: "Dealer blackjack" };
    }

    // Dealer busted
    if (dealerHand.isBusted) {
      return {
        result: "win",
        payout: playerHand.bet * 2,
        description: "Dealer busted",
      };
    }

    // Compare values
    if (playerHand.value > dealerHand.value) {
      return {
        result: "win",
        payout: playerHand.bet * 2,
        description: "Player wins",
      };
    } else if (playerHand.value < dealerHand.value) {
      return { result: "lose", payout: 0, description: "Dealer wins" };
    } else {
      return { result: "push", payout: playerHand.bet, description: "Push" };
    }
  }

  // ROULETTE ENGINE
  private initializeRouletteWheels(): void {
    // European wheel (0-36)
    const europeanNumbers: RouletteNumber[] = [];
    const europeanOrder = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
      24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
    ];

    europeanOrder.forEach((number, position) => {
      let color: "red" | "black" | "green" = "green";
      if (number !== 0) {
        const redNumbers = [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ];
        color = redNumbers.includes(number) ? "red" : "black";
      }

      europeanNumbers.push({ number, color, position });
    });

    // American wheel (0, 00, 1-36) - implemented but not used in our casino
  }

  async startRouletteGame(
    userId: string,
    currency: CurrencyType,
  ): Promise<RouletteGameState> {
    const gameId = `roulette-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const gameState: RouletteGameState = {
      gameId,
      userId,
      wheel: {
        type: "european",
        numbers: this.getEuropeanWheel(),
        spinning: false,
      },
      bets: [],
      gamePhase: "betting",
      currency,
      minBet: currency === "GC" ? 5 : 0.05,
      maxBet: currency === "GC" ? 5000 : 50,
      tableLimit: currency === "GC" ? 25000 : 250,
      wheelType: "european",
    };

    this.activeGames.set(gameId, gameState);
    return gameState;
  }

  private getEuropeanWheel(): RouletteNumber[] {
    const numbers: RouletteNumber[] = [];
    const order = [
      0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
      24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
    ];

    order.forEach((number, position) => {
      let color: "red" | "black" | "green" = "green";
      if (number !== 0) {
        const redNumbers = [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ];
        color = redNumbers.includes(number) ? "red" : "black";
      }
      numbers.push({ number, color, position });
    });

    return numbers;
  }

  async placeRouletteBet(
    gameId: string,
    betType: RouletteBetType,
    numbers: number[],
    amount: number,
  ): Promise<boolean> {
    const game = this.activeGames.get(gameId) as RouletteGameState;
    if (!game || game.gamePhase !== "betting") return false;

    if (amount < game.minBet || amount > game.maxBet) {
      throw new Error(
        `Bet must be between ${game.minBet} and ${game.maxBet} ${game.currency}`,
      );
    }

    // Validate total table limit
    const totalBets = game.bets.reduce((sum, bet) => sum + bet.amount, 0);
    if (totalBets + amount > game.tableLimit) {
      throw new Error("Table limit exceeded");
    }

    // Deduct bet from wallet
    await walletService.placeBet(
      game.userId,
      amount,
      game.currency,
      gameId,
      "table",
    );

    const bet: RouletteBet = {
      id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: betType,
      numbers,
      amount,
      odds: this.getRouletteOdds(betType),
      payout: 0,
      description: this.getBetDescription(betType, numbers),
    };

    game.bets.push(bet);
    return true;
  }

  private getRouletteOdds(betType: RouletteBetType): number {
    const odds: { [key in RouletteBetType]: number } = {
      straight: 35, // Single number
      split: 17, // Two adjacent numbers
      street: 11, // Three numbers in a row
      corner: 8, // Four numbers in a square
      line: 5, // Six numbers (two rows)
      column: 2, // Column of 12 numbers
      dozen: 2, // First, second, or third dozen
      red: 1, // Red numbers
      black: 1, // Black numbers
      odd: 1, // Odd numbers
      even: 1, // Even numbers
      low: 1, // 1-18
      high: 1, // 19-36
      zero: 35, // Zero
      double_zero: 35, // Double zero (American only)
    };

    return odds[betType];
  }

  private getBetDescription(
    betType: RouletteBetType,
    numbers: number[],
  ): string {
    switch (betType) {
      case "straight":
        return `Straight ${numbers[0]}`;
      case "split":
        return `Split ${numbers.join("/")}`;
      case "street":
        return `Street ${numbers.join(",")}`;
      case "corner":
        return `Corner ${numbers.join(",")}`;
      case "line":
        return `Line ${numbers.join(",")}`;
      case "column":
        return `Column ${Math.ceil(numbers[0] / 12)}`;
      case "dozen":
        if (numbers[0] <= 12) return "First Dozen";
        if (numbers[0] <= 24) return "Second Dozen";
        return "Third Dozen";
      case "red":
        return "Red";
      case "black":
        return "Black";
      case "odd":
        return "Odd";
      case "even":
        return "Even";
      case "low":
        return "1-18";
      case "high":
        return "19-36";
      case "zero":
        return "Zero";
      default:
        return "Unknown bet";
    }
  }

  async spinRoulette(gameId: string): Promise<RouletteResult> {
    const game = this.activeGames.get(gameId) as RouletteGameState;
    if (!game || game.gamePhase !== "betting") {
      throw new Error("Cannot spin - game not in betting phase");
    }

    if (game.bets.length === 0) {
      throw new Error("No bets placed");
    }

    game.gamePhase = "spinning";
    game.wheel.spinning = true;

    // Generate random winning number
    const winningNumber = Math.floor(Math.random() * 37); // 0-36 for European
    const winningColor = this.getNumberColor(winningNumber);

    // Calculate winning bets
    const winningBets: RouletteBet[] = [];
    let totalWin = 0;

    for (const bet of game.bets) {
      if (this.isBetWinning(bet, winningNumber)) {
        const payout = bet.amount + bet.amount * bet.odds;
        bet.payout = payout;
        winningBets.push(bet);
        totalWin += payout;

        // Credit winnings to wallet
        await walletService.recordWin(
          game.userId,
          payout,
          game.currency,
          gameId,
          "table",
        );
      }
    }

    const result: RouletteResult = {
      number: winningNumber,
      color: winningColor,
      winningBets,
      totalWin,
      ballPath: this.generateBallPath(winningNumber),
    };

    game.result = result;
    game.wheel.ballPosition = winningNumber;
    game.wheel.spinning = false;
    game.gamePhase = "finished";

    // Update session
    this.updateGameSession(gameId, game.userId, "roulette", totalWin);

    return result;
  }

  private getNumberColor(number: number): "red" | "black" | "green" {
    if (number === 0) return "green";
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    return redNumbers.includes(number) ? "red" : "black";
  }

  private isBetWinning(bet: RouletteBet, winningNumber: number): boolean {
    switch (bet.type) {
      case "straight":
      case "zero":
        return bet.numbers.includes(winningNumber);

      case "split":
      case "street":
      case "corner":
      case "line":
        return bet.numbers.includes(winningNumber);

      case "column":
        const column = bet.numbers[0];
        return winningNumber % 3 === (column - 1) % 3 && winningNumber !== 0;

      case "dozen":
        if (winningNumber === 0) return false;
        const dozen = Math.ceil(bet.numbers[0] / 12);
        const winningDozen = Math.ceil(winningNumber / 12);
        return dozen === winningDozen;

      case "red":
        return this.getNumberColor(winningNumber) === "red";

      case "black":
        return this.getNumberColor(winningNumber) === "black";

      case "odd":
        return winningNumber % 2 === 1 && winningNumber !== 0;

      case "even":
        return winningNumber % 2 === 0 && winningNumber !== 0;

      case "low":
        return winningNumber >= 1 && winningNumber <= 18;

      case "high":
        return winningNumber >= 19 && winningNumber <= 36;

      default:
        return false;
    }
  }

  private generateBallPath(finalNumber: number): number[] {
    // Generate realistic ball path for animation
    const path: number[] = [];
    const wheel = this.getEuropeanWheel();
    const finalPosition =
      wheel.find((n) => n.number === finalNumber)?.position || 0;

    // Start from random position and spiral toward final
    let currentPosition = Math.floor(Math.random() * 37);
    const totalSpins = 15 + Math.floor(Math.random() * 10); // 15-25 numbers

    for (let i = 0; i < totalSpins; i++) {
      path.push(wheel[currentPosition].number);
      currentPosition = (currentPosition + 1) % 37;
    }

    // Final few positions leading to winner
    for (let i = 0; i < 5; i++) {
      const pos = (finalPosition - 4 + i + 37) % 37;
      path.push(wheel[pos].number);
    }

    return path;
  }

  // BACCARAT ENGINE
  async startBaccaratGame(
    userId: string,
    currency: CurrencyType,
  ): Promise<BaccaratGameState> {
    const gameId = `baccarat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const gameState: BaccaratGameState = {
      gameId,
      userId,
      shoe: [this.createShoe(8)], // 8-deck shoe for baccarat
      playerHand: [],
      bankerHand: [],
      bets: [],
      gamePhase: "betting",
      currency,
      minBet: currency === "GC" ? 50 : 0.5,
      maxBet: currency === "GC" ? 25000 : 250,
      commission: 0.05, // 5% commission on banker wins
    };

    this.activeGames.set(gameId, gameState);
    return gameState;
  }

  async placeBaccaratBet(
    gameId: string,
    betType: BaccaratBet["type"],
    amount: number,
  ): Promise<boolean> {
    const game = this.activeGames.get(gameId) as BaccaratGameState;
    if (!game || game.gamePhase !== "betting") return false;

    if (amount < game.minBet || amount > game.maxBet) {
      throw new Error(
        `Bet must be between ${game.minBet} and ${game.maxBet} ${game.currency}`,
      );
    }

    // Deduct bet from wallet
    await walletService.placeBet(
      game.userId,
      amount,
      game.currency,
      gameId,
      "table",
    );

    const odds = this.getBaccaratOdds(betType);

    const bet: BaccaratBet = {
      type: betType,
      amount,
      odds,
    };

    game.bets.push(bet);
    return true;
  }

  private getBaccaratOdds(betType: BaccaratBet["type"]): number {
    const odds: { [key in BaccaratBet["type"]]: number } = {
      player: 1,
      banker: 0.95, // After 5% commission
      tie: 8,
      player_pair: 11,
      banker_pair: 11,
      perfect_pair: 25,
    };

    return odds[betType];
  }

  async dealBaccarat(gameId: string): Promise<BaccaratResult> {
    const game = this.activeGames.get(gameId) as BaccaratGameState;
    if (!game || game.gamePhase !== "betting" || game.bets.length === 0) {
      throw new Error("Cannot deal - invalid game state");
    }

    game.gamePhase = "dealing";
    const deck = game.shoe[0];

    // Deal initial two cards each
    game.playerHand.push(this.dealCard(deck));
    game.bankerHand.push(this.dealCard(deck));
    game.playerHand.push(this.dealCard(deck));
    game.bankerHand.push(this.dealCard(deck));

    let playerValue = this.calculateBaccaratValue(game.playerHand);
    let bankerValue = this.calculateBaccaratValue(game.bankerHand);

    // Check for natural wins (8 or 9)
    const playerNatural = playerValue === 8 || playerValue === 9;
    const bankerNatural = bankerValue === 8 || bankerValue === 9;

    if (!playerNatural && !bankerNatural) {
      game.gamePhase = "drawing";

      // Player drawing rules
      if (playerValue <= 5) {
        game.playerHand.push(this.dealCard(deck));
        playerValue = this.calculateBaccaratValue(game.playerHand);
      }

      // Banker drawing rules (complex based on player's third card)
      const playerThirdCard =
        game.playerHand.length === 3 ? game.playerHand[2] : null;
      if (this.shouldBankerDraw(bankerValue, playerThirdCard)) {
        game.bankerHand.push(this.dealCard(deck));
        bankerValue = this.calculateBaccaratValue(game.bankerHand);
      }
    }

    // Determine winner
    let winner: "player" | "banker" | "tie";
    if (playerValue > bankerValue) {
      winner = "player";
    } else if (bankerValue > playerValue) {
      winner = "banker";
    } else {
      winner = "tie";
    }

    // Calculate payouts
    let totalWin = 0;
    let commission = 0;

    for (const bet of game.bets) {
      let payout = 0;

      if (bet.type === winner) {
        payout = bet.amount + bet.amount * bet.odds;
        if (bet.type === "banker") {
          commission += bet.amount * game.commission;
          payout -= commission;
        }
      } else if (bet.type === "player_pair" && this.isPair(game.playerHand)) {
        payout = bet.amount + bet.amount * bet.odds;
      } else if (bet.type === "banker_pair" && this.isPair(game.bankerHand)) {
        payout = bet.amount + bet.amount * bet.odds;
      } else if (
        bet.type === "perfect_pair" &&
        this.isPerfectPair(game.playerHand, game.bankerHand)
      ) {
        payout = bet.amount + bet.amount * bet.odds;
      }

      if (payout > 0) {
        totalWin += payout;
        await walletService.recordWin(
          game.userId,
          payout,
          game.currency,
          gameId,
          "table",
        );
      }
    }

    const result: BaccaratResult = {
      playerValue,
      bankerValue,
      winner,
      naturalWin: playerNatural || bankerNatural,
      totalWin,
      commission,
    };

    game.result = result;
    game.gamePhase = "finished";

    // Update session
    this.updateGameSession(gameId, game.userId, "baccarat", totalWin);

    return result;
  }

  private calculateBaccaratValue(hand: PlayingCard[]): number {
    let value = 0;
    hand.forEach((card) => {
      if (card.rank === "A") {
        value += 1;
      } else if (["J", "Q", "K"].includes(card.rank)) {
        value += 0;
      } else {
        value += parseInt(card.rank);
      }
    });
    return value % 10;
  }

  private shouldBankerDraw(
    bankerValue: number,
    playerThirdCard: PlayingCard | null,
  ): boolean {
    if (bankerValue >= 7) return false;
    if (bankerValue <= 2) return true;

    if (!playerThirdCard) {
      // Player stood
      return bankerValue <= 5;
    }

    const thirdCardValue = this.calculateBaccaratValue([playerThirdCard]);

    switch (bankerValue) {
      case 3:
        return thirdCardValue !== 8;
      case 4:
        return [2, 3, 4, 5, 6, 7].includes(thirdCardValue);
      case 5:
        return [4, 5, 6, 7].includes(thirdCardValue);
      case 6:
        return [6, 7].includes(thirdCardValue);
      default:
        return false;
    }
  }

  private isPair(hand: PlayingCard[]): boolean {
    return hand.length >= 2 && hand[0].rank === hand[1].rank;
  }

  private isPerfectPair(
    playerHand: PlayingCard[],
    bankerHand: PlayingCard[],
  ): boolean {
    return this.isPair(playerHand) && this.isPair(bankerHand);
  }

  // SESSION MANAGEMENT
  private updateGameSession(
    gameId: string,
    userId: string,
    gameType: GameSession["gameType"],
    winAmount: number,
  ): void {
    // Update or create session
    let session = Array.from(this.activeSessions.values()).find(
      (s) => s.userId === userId && s.gameType === gameType && !s.endTime,
    );

    if (!session) {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      session = {
        sessionId,
        userId,
        gameType,
        startTime: new Date(),
        currency: "GC", // Will be updated based on actual game
        totalBets: 0,
        totalWins: 0,
        netResult: 0,
        handsPlayed: 0,
        biggestWin: 0,
        longestWinStreak: 0,
        longestLoseStreak: 0,
        currentStreak: 0,
        averageBet: 0,
        houseEdge: 0,
        decisions: [],
      };
      this.activeSessions.set(sessionId, session);
    }

    // Update session stats
    session.handsPlayed++;
    session.totalWins += winAmount;
    session.biggestWin = Math.max(session.biggestWin, winAmount);
    session.netResult = session.totalWins - session.totalBets;

    // Update streaks
    if (winAmount > 0) {
      session.currentStreak =
        session.currentStreak > 0 ? session.currentStreak + 1 : 1;
      session.longestWinStreak = Math.max(
        session.longestWinStreak,
        session.currentStreak,
      );
    } else {
      session.currentStreak =
        session.currentStreak < 0 ? session.currentStreak - 1 : -1;
      session.longestLoseStreak = Math.max(
        session.longestLoseStreak,
        Math.abs(session.currentStreak),
      );
    }

    session.averageBet = session.totalBets / session.handsPlayed;
    session.houseEdge =
      session.totalBets > 0
        ? ((session.totalBets - session.totalWins) / session.totalBets) * 100
        : 0;
  }

  private recordDecision(game: any, action: string, hand: any): void {
    // Record for basic strategy analysis
    const decision: GameDecision = {
      hand: game.currentHandIndex,
      situation: this.describeSituation(hand, game.dealerHand),
      decision: action,
      result: "win", // Will be updated after hand completion
      amount: hand.bet,
      optimal: this.isOptimalDecision(hand, game.dealerHand, action),
    };

    // Add to session if exists
    const session = Array.from(this.activeSessions.values()).find(
      (s) =>
        s.userId === game.userId && s.gameType === "blackjack" && !s.endTime,
    );

    if (session) {
      session.decisions.push(decision);
    }
  }

  private describeSituation(
    playerHand: BlackjackHand,
    dealerHand: BlackjackHand,
  ): string {
    const dealerUpCard = dealerHand.cards[0].rank;
    if (playerHand.softAce) {
      return `Soft ${playerHand.value} vs ${dealerUpCard}`;
    } else if (playerHand.canSplit) {
      return `Pair of ${playerHand.cards[0].rank}s vs ${dealerUpCard}`;
    } else {
      return `Hard ${playerHand.value} vs ${dealerUpCard}`;
    }
  }

  private isOptimalDecision(
    playerHand: BlackjackHand,
    dealerHand: BlackjackHand,
    action: string,
  ): boolean {
    // Simplified basic strategy check
    const dealerUpValue = dealerHand.cards[0].value;
    const playerValue = playerHand.value;

    // This is a simplified version - full basic strategy would be much more complex
    if (action === "hit") {
      return playerValue <= 16 && dealerUpValue >= 7;
    } else if (action === "stand") {
      return playerValue >= 17 || (playerValue >= 12 && dealerUpValue <= 6);
    } else if (action === "double") {
      return (
        playerHand.cards.length === 2 &&
        (playerValue === 11 ||
          (playerValue === 10 && dealerUpValue <= 9) ||
          (playerValue === 9 && dealerUpValue >= 3 && dealerUpValue <= 6))
      );
    }

    return false; // Conservative assumption for other actions
  }

  // PUBLIC API METHODS
  getGameState(gameId: string): any {
    return this.activeGames.get(gameId);
  }

  getAllActiveSessions(): GameSession[] {
    return Array.from(this.activeSessions.values());
  }

  endSession(sessionId: string): GameSession | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();
    this.activeSessions.set(sessionId, session);
    return session;
  }

  getGameHistory(userId: string, gameType?: string): any[] {
    const userHistory = this.gameHistory.get(userId) || [];
    return gameType
      ? userHistory.filter((game) => game.gameType === gameType)
      : userHistory;
  }

  getGameStatistics(gameType: "blackjack" | "roulette" | "baccarat"): any {
    const sessions = Array.from(this.activeSessions.values()).filter(
      (s) => s.gameType === gameType,
    );

    if (sessions.length === 0) return null;

    const totalHands = sessions.reduce((sum, s) => sum + s.handsPlayed, 0);
    const totalBets = sessions.reduce((sum, s) => sum + s.totalBets, 0);
    const totalWins = sessions.reduce((sum, s) => sum + s.totalWins, 0);

    return {
      totalSessions: sessions.length,
      totalHands,
      totalBets,
      totalWins,
      houseEdge:
        totalBets > 0 ? ((totalBets - totalWins) / totalBets) * 100 : 0,
      averageHandsPerSession: totalHands / sessions.length,
      biggestWin: Math.max(...sessions.map((s) => s.biggestWin)),
      averageBet: totalBets / totalHands,
    };
  }
}

export const tableGameEngine = new TableGameEngine();
