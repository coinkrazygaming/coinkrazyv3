export interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  value: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  color: string;
  multipliers: {
    three: number;
    four: number;
    five: number;
  };
}

export interface SlotGameConfig {
  id: string;
  name: string;
  theme: string;
  description: string;
  provider: string;
  rtp: number; // Return to Player percentage
  volatility: "low" | "medium" | "high";
  reels: number;
  rows: number;
  paylines: number;
  minBet: {
    GC: number;
    SC: number;
  };
  maxBet: {
    GC: number;
    SC: number;
  };
  symbols: SlotSymbol[];
  features: string[];
  bonusRounds: boolean;
  freeSpins: boolean;
  wildSymbol: boolean;
  scatterSymbol: boolean;
  jackpot: {
    progressive: boolean;
    fixed: number;
  };
  thumbnail: string;
  backgroundImage: string;
  soundTheme: string;
  category: string[];
  releaseDate: string;
  popularity: number;
}

export const SLOT_GAMES_CONFIG: SlotGameConfig[] = [
  {
    id: "coin-krazy-classic",
    name: "Coin Krazy Classic",
    theme: "Classic Casino",
    description: "Traditional 3-reel slot with authentic casino vibes",
    provider: "CoinKrazy Studios",
    rtp: 96.5,
    volatility: "medium",
    reels: 3,
    rows: 3,
    paylines: 5,
    minBet: { GC: 10, SC: 0.1 },
    maxBet: { GC: 1000, SC: 10 },
    symbols: [
      { id: "cherry", name: "Cherry", emoji: "🍒", value: 2, rarity: "common", color: "#ef4444", multipliers: { three: 2, four: 5, five: 10 } },
      { id: "lemon", name: "Lemon", emoji: "🍋", value: 3, rarity: "common", color: "#eab308", multipliers: { three: 3, four: 8, five: 15 } },
      { id: "orange", name: "Orange", emoji: "🍊", value: 4, rarity: "common", color: "#f97316", multipliers: { three: 4, four: 10, five: 20 } },
      { id: "bell", name: "Bell", emoji: "🔔", value: 8, rarity: "rare", color: "#fbbf24", multipliers: { three: 8, four: 20, five: 50 } },
      { id: "bar", name: "BAR", emoji: "💫", value: 15, rarity: "rare", color: "#8b5cf6", multipliers: { three: 15, four: 40, five: 100 } },
      { id: "seven", name: "Lucky 7", emoji: "🎰", value: 50, rarity: "epic", color: "#dc2626", multipliers: { three: 50, four: 200, five: 777 } },
      { id: "diamond", name: "Diamond", emoji: "💎", value: 100, rarity: "legendary", color: "#3b82f6", multipliers: { three: 100, four: 500, five: 2500 } }
    ],
    features: ["Wild Symbols", "Scatter Pays", "Auto Play"],
    bonusRounds: false,
    freeSpins: false,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 5000 },
    thumbnail: "/games/coin-krazy-classic.jpg",
    backgroundImage: "/games/backgrounds/classic-casino.jpg",
    soundTheme: "classic",
    category: ["classic", "featured"],
    releaseDate: "2024-01-15",
    popularity: 95
  },
  {
    id: "golden-fortune",
    name: "Golden Fortune",
    theme: "Ancient Gold",
    description: "Discover treasures of ancient civilizations with golden rewards",
    provider: "CoinKrazy Studios",
    rtp: 97.2,
    volatility: "high",
    reels: 5,
    rows: 3,
    paylines: 25,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "scroll", name: "Ancient Scroll", emoji: "📜", value: 2, rarity: "common", color: "#a16207", multipliers: { three: 2, four: 6, five: 12 } },
      { id: "vase", name: "Golden Vase", emoji: "🏺", value: 3, rarity: "common", color: "#ca8a04", multipliers: { three: 3, four: 8, five: 16 } },
      { id: "coin", name: "Gold Coin", emoji: "🪙", value: 5, rarity: "rare", color: "#eab308", multipliers: { three: 5, four: 12, five: 25 } },
      { id: "crown", name: "Pharaoh Crown", emoji: "👑", value: 10, rarity: "rare", color: "#f59e0b", multipliers: { three: 10, four: 25, five: 75 } },
      { id: "pyramid", name: "Pyramid", emoji: "🔺", value: 20, rarity: "epic", color: "#d97706", multipliers: { three: 20, four: 60, five: 200 } },
      { id: "scarab", name: "Golden Scarab", emoji: "🪲", value: 50, rarity: "epic", color: "#92400e", multipliers: { three: 50, four: 150, five: 500 } },
      { id: "anubis", name: "Anubis", emoji: "🐺", value: 150, rarity: "legendary", color: "#451a03", multipliers: { three: 150, four: 750, five: 5000 } }
    ],
    features: ["Free Spins", "Multipliers", "Bonus Round", "Expanding Wilds"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: true, fixed: 15000 },
    thumbnail: "/games/golden-fortune.jpg",
    backgroundImage: "/games/backgrounds/ancient-egypt.jpg",
    soundTheme: "mystical",
    category: ["adventure", "high-rtp", "featured"],
    releaseDate: "2024-02-01",
    popularity: 92
  },
  {
    id: "neon-nights",
    name: "Neon Nights",
    theme: "Cyberpunk",
    description: "Futuristic cityscape with electrifying wins",
    provider: "CoinKrazy Studios",
    rtp: 96.8,
    volatility: "medium",
    reels: 5,
    rows: 4,
    paylines: 40,
    minBet: { GC: 40, SC: 0.4 },
    maxBet: { GC: 4000, SC: 40 },
    symbols: [
      { id: "chip", name: "Circuit", emoji: "🔌", value: 2, rarity: "common", color: "#06b6d4", multipliers: { three: 2, four: 5, five: 10 } },
      { id: "neon", name: "Neon Sign", emoji: "🌃", value: 4, rarity: "common", color: "#8b5cf6", multipliers: { three: 4, four: 10, five: 20 } },
      { id: "car", name: "Cyber Car", emoji: "🚗", value: 6, rarity: "rare", color: "#ec4899", multipliers: { three: 6, four: 15, five: 40 } },
      { id: "robot", name: "Android", emoji: "🤖", value: 12, rarity: "rare", color: "#10b981", multipliers: { three: 12, four: 30, five: 80 } },
      { id: "matrix", name: "Data Stream", emoji: "🔢", value: 25, rarity: "epic", color: "#84cc16", multipliers: { three: 25, four: 75, five: 200 } },
      { id: "cyber", name: "Cyber Core", emoji: "⚡", value: 60, rarity: "epic", color: "#3b82f6", multipliers: { three: 60, four: 180, five: 600 } },
      { id: "nexus", name: "Neural Nexus", emoji: "🧠", value: 200, rarity: "legendary", color: "#a855f7", multipliers: { three: 200, four: 1000, five: 8000 } }
    ],
    features: ["Cascading Reels", "Electric Wilds", "Neon Boost", "Cyber Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 25000 },
    thumbnail: "/games/neon-nights.jpg",
    backgroundImage: "/games/backgrounds/cyberpunk-city.jpg",
    soundTheme: "electronic",
    category: ["modern", "bonus"],
    releaseDate: "2024-02-15",
    popularity: 88
  },
  {
    id: "pirate-treasure",
    name: "Pirate's Treasure",
    theme: "Pirates & Adventure",
    description: "Sail the seven seas in search of legendary treasure",
    provider: "CoinKrazy Studios",
    rtp: 96.3,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 20,
    minBet: { GC: 20, SC: 0.2 },
    maxBet: { GC: 2000, SC: 20 },
    symbols: [
      { id: "parrot", name: "Parrot", emoji: "🦜", value: 2, rarity: "common", color: "#22c55e", multipliers: { three: 2, four: 6, five: 12 } },
      { id: "rum", name: "Rum Bottle", emoji: "🍾", value: 3, rarity: "common", color: "#92400e", multipliers: { three: 3, four: 8, five: 16 } },
      { id: "compass", name: "Compass", emoji: "🧭", value: 5, rarity: "common", color: "#eab308", multipliers: { three: 5, four: 12, five: 25 } },
      { id: "sword", name: "Cutlass", emoji: "⚔️", value: 8, rarity: "rare", color: "#6b7280", multipliers: { three: 8, four: 20, five: 50 } },
      { id: "ship", name: "Pirate Ship", emoji: "🏴‍☠️", value: 15, rarity: "rare", color: "#1f2937", multipliers: { three: 15, four: 40, five: 120 } },
      { id: "chest", name: "Treasure Chest", emoji: "💰", value: 40, rarity: "epic", color: "#f59e0b", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "captain", name: "Pirate Captain", emoji: "🏴‍☠️", value: 100, rarity: "legendary", color: "#dc2626", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Treasure Hunt Bonus", "Ship Battle", "Free Spins", "Walking Wilds"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 12000 },
    thumbnail: "/games/pirate-treasure.jpg",
    backgroundImage: "/games/backgrounds/pirate-ship.jpg",
    soundTheme: "adventure",
    category: ["adventure", "bonus"],
    releaseDate: "2024-01-28",
    popularity: 85
  },
  {
    id: "diamond-deluxe",
    name: "Diamond Deluxe",
    theme: "Luxury Gems",
    description: "Sparkling diamonds and precious gems await",
    provider: "CoinKrazy Studios",
    rtp: 97.5,
    volatility: "high",
    reels: 5,
    rows: 3,
    paylines: 15,
    minBet: { GC: 15, SC: 0.15 },
    maxBet: { GC: 1500, SC: 15 },
    symbols: [
      { id: "ruby", name: "Ruby", emoji: "🔴", value: 3, rarity: "common", color: "#dc2626", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "emerald", name: "Emerald", emoji: "🟢", value: 4, rarity: "common", color: "#16a34a", multipliers: { three: 4, four: 10, five: 24 } },
      { id: "sapphire", name: "Sapphire", emoji: "🔵", value: 5, rarity: "rare", color: "#2563eb", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "topaz", name: "Topaz", emoji: "🟡", value: 8, rarity: "rare", color: "#eab308", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "amethyst", name: "Amethyst", emoji: "🟣", value: 12, rarity: "epic", color: "#8b5cf6", multipliers: { three: 12, four: 35, five: 100 } },
      { id: "platinum", name: "Platinum Ring", emoji: "💍", value: 30, rarity: "epic", color: "#64748b", multipliers: { three: 30, four: 90, five: 300 } },
      { id: "diamond", name: "Perfect Diamond", emoji: "💎", value: 150, rarity: "legendary", color: "#e2e8f0", multipliers: { three: 150, four: 600, five: 3000 } }
    ],
    features: ["Diamond Pick Bonus", "Gem Multipliers", "Sparkling Wilds", "Luxury Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: true, fixed: 50000 },
    thumbnail: "/games/diamond-deluxe.jpg",
    backgroundImage: "/games/backgrounds/luxury-gems.jpg",
    soundTheme: "elegant",
    category: ["luxury", "high-rtp", "jackpot"],
    releaseDate: "2024-03-01",
    popularity: 90
  },
  {
    id: "aztec-gold",
    name: "Aztec Gold",
    theme: "Ancient Aztec",
    description: "Uncover the lost riches of the Aztec empire",
    provider: "CoinKrazy Studios",
    rtp: 96.7,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 30,
    minBet: { GC: 30, SC: 0.3 },
    maxBet: { GC: 3000, SC: 30 },
    symbols: [
      { id: "feather", name: "Feather", emoji: "🪶", value: 2, rarity: "common", color: "#84cc16", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "mask", name: "Ritual Mask", emoji: "🎭", value: 4, rarity: "common", color: "#f97316", multipliers: { three: 4, four: 10, five: 22 } },
      { id: "jaguar", name: "Jaguar", emoji: "🐆", value: 6, rarity: "rare", color: "#92400e", multipliers: { three: 6, four: 15, five: 35 } },
      { id: "temple", name: "Temple", emoji: "🏛️", value: 10, rarity: "rare", color: "#a8a29e", multipliers: { three: 10, four: 25, five: 70 } },
      { id: "calendar", name: "Sun Calendar", emoji: "☀️", value: 20, rarity: "epic", color: "#eab308", multipliers: { three: 20, four: 60, five: 180 } },
      { id: "golden-idol", name: "Golden Idol", emoji: "🗿", value: 50, rarity: "epic", color: "#f59e0b", multipliers: { three: 50, four: 150, five: 500 } },
      { id: "quetzal", name: "Quetzalcoatl", emoji: "🐉", value: 120, rarity: "legendary", color: "#059669", multipliers: { three: 120, four: 480, five: 2400 } }
    ],
    features: ["Temple Bonus", "Aztec Spins", "Golden Avalanche", "Serpent Wilds"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 18000 },
    thumbnail: "/games/aztec-gold.jpg",
    backgroundImage: "/games/backgrounds/aztec-temple.jpg",
    soundTheme: "tribal",
    category: ["adventure", "ancient"],
    releaseDate: "2024-02-20",
    popularity: 87
  },
  {
    id: "lucky-sevens",
    name: "Lucky Sevens",
    theme: "Classic Lucky",
    description: "Simple and rewarding with lucky number 7",
    provider: "CoinKrazy Studios",
    rtp: 95.8,
    volatility: "low",
    reels: 3,
    rows: 3,
    paylines: 1,
    minBet: { GC: 5, SC: 0.05 },
    maxBet: { GC: 500, SC: 5 },
    symbols: [
      { id: "single-bar", name: "Single BAR", emoji: "➖", value: 2, rarity: "common", color: "#fbbf24", multipliers: { three: 2, four: 0, five: 0 } },
      { id: "double-bar", name: "Double BAR", emoji: "🟰", value: 4, rarity: "common", color: "#f59e0b", multipliers: { three: 4, four: 0, five: 0 } },
      { id: "triple-bar", name: "Triple BAR", emoji: "☰", value: 8, rarity: "rare", color: "#d97706", multipliers: { three: 8, four: 0, five: 0 } },
      { id: "red-seven", name: "Red Seven", emoji: "7️⃣", value: 25, rarity: "rare", color: "#dc2626", multipliers: { three: 25, four: 0, five: 0 } },
      { id: "blue-seven", name: "Blue Seven", emoji: "🔵", value: 50, rarity: "epic", color: "#2563eb", multipliers: { three: 50, four: 0, five: 0 } },
      { id: "gold-seven", name: "Gold Seven", emoji: "🟡", value: 100, rarity: "epic", color: "#eab308", multipliers: { three: 100, four: 0, five: 0 } },
      { id: "rainbow-seven", name: "Rainbow Seven", emoji: "🌈", value: 777, rarity: "legendary", color: "#a855f7", multipliers: { three: 777, four: 0, five: 0 } }
    ],
    features: ["Simple Gameplay", "High Payouts", "Auto Play"],
    bonusRounds: false,
    freeSpins: false,
    wildSymbol: false,
    scatterSymbol: false,
    jackpot: { progressive: false, fixed: 7777 },
    thumbnail: "/games/lucky-sevens.jpg",
    backgroundImage: "/games/backgrounds/classic-red.jpg",
    soundTheme: "retro",
    category: ["classic", "simple"],
    releaseDate: "2024-01-10",
    popularity: 78
  },
  {
    id: "wild-west-gold",
    name: "Wild West Gold",
    theme: "Western Frontier",
    description: "Saddle up for an adventure in the Wild West",
    provider: "CoinKrazy Studios",
    rtp: 96.4,
    volatility: "medium",
    reels: 5,
    rows: 4,
    paylines: 50,
    minBet: { GC: 50, SC: 0.5 },
    maxBet: { GC: 5000, SC: 50 },
    symbols: [
      { id: "horseshoe", name: "Horseshoe", emoji: "🔄", value: 2, rarity: "common", color: "#6b7280", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "cactus", name: "Cactus", emoji: "🌵", value: 3, rarity: "common", color: "#16a34a", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "revolver", name: "Revolver", emoji: "🔫", value: 5, rarity: "rare", color: "#4b5563", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "cowboy", name: "Cowboy", emoji: "🤠", value: 8, rarity: "rare", color: "#92400e", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "saloon", name: "Saloon", emoji: "🏘️", value: 15, rarity: "epic", color: "#a16207", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "sheriff", name: "Sheriff", emoji: "⭐", value: 40, rarity: "epic", color: "#eab308", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "outlaw", name: "Wanted Outlaw", emoji: "💀", value: 100, rarity: "legendary", color: "#dc2626", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Showdown Bonus", "Outlaw Spins", "Money Train", "Sticky Wilds"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 20000 },
    thumbnail: "/games/wild-west-gold.jpg",
    backgroundImage: "/games/backgrounds/western-town.jpg",
    soundTheme: "western",
    category: ["adventure", "western"],
    releaseDate: "2024-02-10",
    popularity: 83
  },
  {
    id: "cosmic-crystals",
    name: "Cosmic Crystals",
    theme: "Space & Crystals",
    description: "Journey through space to collect mystical crystals",
    provider: "CoinKrazy Studios",
    rtp: 97.1,
    volatility: "high",
    reels: 6,
    rows: 4,
    paylines: 4096,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "asteroid", name: "Asteroid", emoji: "☄️", value: 1, rarity: "common", color: "#6b7280", multipliers: { three: 1, four: 3, five: 8 } },
      { id: "planet", name: "Planet", emoji: "🪐", value: 2, rarity: "common", color: "#f97316", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "star", name: "Star", emoji: "⭐", value: 3, rarity: "common", color: "#eab308", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "comet", name: "Comet", emoji: "☄️", value: 5, rarity: "rare", color: "#06b6d4", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "nebula", name: "Nebula", emoji: "🌌", value: 8, rarity: "rare", color: "#8b5cf6", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "crystal", name: "Power Crystal", emoji: "💎", value: 20, rarity: "epic", color: "#3b82f6", multipliers: { three: 20, four: 60, five: 200 } },
      { id: "galaxy", name: "Galaxy Core", emoji: "🌀", value: 80, rarity: "legendary", color: "#a855f7", multipliers: { three: 80, four: 320, five: 1600 } }
    ],
    features: ["Cluster Pays", "Cosmic Cascades", "Crystal Power", "Stellar Wilds"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: true, fixed: 100000 },
    thumbnail: "/games/cosmic-crystals.jpg",
    backgroundImage: "/games/backgrounds/space-nebula.jpg",
    soundTheme: "cosmic",
    category: ["space", "high-rtp", "cluster"],
    releaseDate: "2024-03-10",
    popularity: 91
  },
  {
    id: "fruit-fiesta",
    name: "Fruit Fiesta",
    theme: "Classic Fruits",
    description: "Colorful fruit slot with juicy wins",
    provider: "CoinKrazy Studios",
    rtp: 95.9,
    volatility: "low",
    reels: 5,
    rows: 3,
    paylines: 10,
    minBet: { GC: 10, SC: 0.1 },
    maxBet: { GC: 1000, SC: 10 },
    symbols: [
      { id: "grape", name: "Grapes", emoji: "🍇", value: 2, rarity: "common", color: "#8b5cf6", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "watermelon", name: "Watermelon", emoji: "🍉", value: 3, rarity: "common", color: "#16a34a", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "banana", name: "Banana", emoji: "🍌", value: 4, rarity: "common", color: "#eab308", multipliers: { three: 4, four: 10, five: 24 } },
      { id: "apple", name: "Apple", emoji: "🍎", value: 5, rarity: "rare", color: "#dc2626", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "pineapple", name: "Pineapple", emoji: "🍍", value: 8, rarity: "rare", color: "#f59e0b", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "strawberry", name: "Strawberry", emoji: "🍓", value: 12, rarity: "epic", color: "#ef4444", multipliers: { three: 12, four: 30, five: 90 } },
      { id: "golden-fruit", name: "Golden Fruit", emoji: "🥇", value: 50, rarity: "legendary", color: "#fbbf24", multipliers: { three: 50, four: 200, five: 1000 } }
    ],
    features: ["Fruit Combos", "Juicy Wilds", "Vitamin Boost", "Harvest Bonus"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 8000 },
    thumbnail: "/games/fruit-fiesta.jpg",
    backgroundImage: "/games/backgrounds/fruit-garden.jpg",
    soundTheme: "cheerful",
    category: ["classic", "fruit"],
    releaseDate: "2024-01-20",
    popularity: 76
  },
  {
    id: "ocean-depths",
    name: "Ocean Depths",
    theme: "Underwater Adventure",
    description: "Dive deep into the ocean for hidden treasures",
    provider: "CoinKrazy Studios",
    rtp: 96.6,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 25,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "seahorse", name: "Seahorse", emoji: "🦄", value: 2, rarity: "common", color: "#06b6d4", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "starfish", name: "Starfish", emoji: "⭐", value: 3, rarity: "common", color: "#f97316", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "jellyfish", name: "Jellyfish", emoji: "🪼", value: 5, rarity: "rare", color: "#8b5cf6", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "dolphin", name: "Dolphin", emoji: "🐬", value: 8, rarity: "rare", color: "#3b82f6", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "shark", name: "Shark", emoji: "🦈", value: 15, rarity: "epic", color: "#6b7280", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "whale", name: "Whale", emoji: "🐋", value: 40, rarity: "epic", color: "#1e40af", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "kraken", name: "Kraken", emoji: "🐙", value: 100, rarity: "legendary", color: "#7c2d12", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Deep Sea Bonus", "Ocean Currents", "Tidal Waves", "Submarine Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 15000 },
    thumbnail: "/games/ocean-depths.jpg",
    backgroundImage: "/games/backgrounds/underwater.jpg",
    soundTheme: "aquatic",
    category: ["adventure", "nature"],
    releaseDate: "2024-02-25",
    popularity: 84
  },
  {
    id: "mystic-forest",
    name: "Mystic Forest",
    theme: "Magical Forest",
    description: "Enchanted forest filled with magical creatures and treasures",
    provider: "CoinKrazy Studios",
    rtp: 96.9,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 30,
    minBet: { GC: 30, SC: 0.3 },
    maxBet: { GC: 3000, SC: 30 },
    symbols: [
      { id: "mushroom", name: "Magic Mushroom", emoji: "🍄", value: 2, rarity: "common", color: "#ef4444", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "butterfly", name: "Fairy Butterfly", emoji: "��", value: 3, rarity: "common", color: "#8b5cf6", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "owl", name: "Wise Owl", emoji: "🦉", value: 5, rarity: "rare", color: "#92400e", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "unicorn", name: "Unicorn", emoji: "🦄", value: 10, rarity: "rare", color: "#e2e8f0", multipliers: { three: 10, four: 25, five: 75 } },
      { id: "fairy", name: "Forest Fairy", emoji: "🧚", value: 20, rarity: "epic", color: "#22d3ee", multipliers: { three: 20, four: 60, five: 180 } },
      { id: "wizard", name: "Forest Wizard", emoji: "🧙", value: 50, rarity: "epic", color: "#6366f1", multipliers: { three: 50, four: 150, five: 500 } },
      { id: "dragon", name: "Ancient Dragon", emoji: "🐉", value: 120, rarity: "legendary", color: "#059669", multipliers: { three: 120, four: 480, five: 2400 } }
    ],
    features: ["Magic Spells", "Enchanted Wilds", "Fairy Dust", "Dragon's Hoard"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 22000 },
    thumbnail: "/games/mystic-forest.jpg",
    backgroundImage: "/games/backgrounds/enchanted-forest.jpg",
    soundTheme: "magical",
    category: ["fantasy", "magic"],
    releaseDate: "2024-03-05",
    popularity: 89
  },
  {
    id: "racing-thunder",
    name: "Racing Thunder",
    theme: "Formula Racing",
    description: "High-speed racing action with turbocharged wins",
    provider: "CoinKrazy Studios",
    rtp: 96.2,
    volatility: "high",
    reels: 5,
    rows: 4,
    paylines: 40,
    minBet: { GC: 40, SC: 0.4 },
    maxBet: { GC: 4000, SC: 40 },
    symbols: [
      { id: "tire", name: "Racing Tire", emoji: "🏁", value: 2, rarity: "common", color: "#1f2937", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "helmet", name: "Racing Helmet", emoji: "🏎️", value: 3, rarity: "common", color: "#dc2626", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "engine", name: "Turbo Engine", emoji: "⚡", value: 5, rarity: "rare", color: "#f97316", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "car", name: "Race Car", emoji: "🏎️", value: 8, rarity: "rare", color: "#2563eb", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "trophy", name: "Winner Trophy", emoji: "🏆", value: 15, rarity: "epic", color: "#eab308", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "champion", name: "Champion", emoji: "👑", value: 40, rarity: "epic", color: "#f59e0b", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "grand-prix", name: "Grand Prix", emoji: "🥇", value: 100, rarity: "legendary", color: "#fbbf24", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Pit Stop Bonus", "Turbo Spins", "Racing Wilds", "Championship Round"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 30000 },
    thumbnail: "/games/racing-thunder.jpg",
    backgroundImage: "/games/backgrounds/race-track.jpg",
    soundTheme: "racing",
    category: ["sports", "high-speed"],
    releaseDate: "2024-03-15",
    popularity: 86
  },
  {
    id: "ancient-rome",
    name: "Ancient Rome",
    theme: "Roman Empire",
    description: "March with the legions and claim the empire's riches",
    provider: "CoinKrazy Studios",
    rtp: 96.5,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 25,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "laurel", name: "Laurel Wreath", emoji: "🌿", value: 2, rarity: "common", color: "#16a34a", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "coin", name: "Roman Coin", emoji: "🪙", value: 3, rarity: "common", color: "#eab308", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "shield", name: "Gladiator Shield", emoji: "🛡️", value: 5, rarity: "rare", color: "#92400e", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "sword", name: "Roman Sword", emoji: "⚔️", value: 8, rarity: "rare", color: "#6b7280", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "colosseum", name: "Colosseum", emoji: "🏛️", value: 15, rarity: "epic", color: "#a8a29e", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "emperor", name: "Emperor", emoji: "👑", value: 40, rarity: "epic", color: "#7c2d12", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "caesar", name: "Julius Caesar", emoji: "🏺", value: 100, rarity: "legendary", color: "#451a03", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Gladiator Arena", "Caesar's Bonus", "Legion March", "Imperial Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 17000 },
    thumbnail: "/games/ancient-rome.jpg",
    backgroundImage: "/games/backgrounds/roman-colosseum.jpg",
    soundTheme: "epic",
    category: ["historical", "ancient"],
    releaseDate: "2024-02-28",
    popularity: 82
  },
  {
    id: "viking-voyage",
    name: "Viking Voyage",
    theme: "Nordic Vikings",
    description: "Sail with fierce Vikings to raid and conquer",
    provider: "CoinKrazy Studios",
    rtp: 96.8,
    volatility: "high",
    reels: 5,
    rows: 4,
    paylines: 50,
    minBet: { GC: 50, SC: 0.5 },
    maxBet: { GC: 5000, SC: 50 },
    symbols: [
      { id: "rune", name: "Viking Rune", emoji: "ᚱ", value: 2, rarity: "common", color: "#6b7280", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "axe", name: "Battle Axe", emoji: "🪓", value: 3, rarity: "common", color: "#92400e", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "helmet", name: "Viking Helmet", emoji: "⚔️", value: 5, rarity: "rare", color: "#6b7280", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "longship", name: "Longship", emoji: "🛥️", value: 8, rarity: "rare", color: "#92400e", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "thor", name: "Thor's Hammer", emoji: "⚡", value: 20, rarity: "epic", color: "#3b82f6", multipliers: { three: 20, four: 60, five: 180 } },
      { id: "valkyrie", name: "Valkyrie", emoji: "👸", value: 50, rarity: "epic", color: "#8b5cf6", multipliers: { three: 50, four: 150, five: 500 } },
      { id: "odin", name: "Odin", emoji: "🧙", value: 120, rarity: "legendary", color: "#1e40af", multipliers: { three: 120, four: 480, five: 2400 } }
    ],
    features: ["Valhalla Bonus", "Berserker Rage", "Raid Spins", "Mjolnir Wilds"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: true, fixed: 40000 },
    thumbnail: "/games/viking-voyage.jpg",
    backgroundImage: "/games/backgrounds/viking-ship.jpg",
    soundTheme: "nordic",
    category: ["adventure", "mythology", "jackpot"],
    releaseDate: "2024-03-20",
    popularity: 88
  },
  {
    id: "hot-peppers",
    name: "Hot Peppers",
    theme: "Spicy Mexican",
    description: "Sizzling hot peppers bring fiery wins",
    provider: "CoinKrazy Studios",
    rtp: 95.7,
    volatility: "medium",
    reels: 3,
    rows: 3,
    paylines: 9,
    minBet: { GC: 9, SC: 0.09 },
    maxBet: { GC: 900, SC: 9 },
    symbols: [
      { id: "bell-pepper", name: "Bell Pepper", emoji: "🫑", value: 2, rarity: "common", color: "#16a34a", multipliers: { three: 2, four: 0, five: 0 } },
      { id: "jalapeno", name: "Jalapeño", emoji: "🌶️", value: 3, rarity: "common", color: "#16a34a", multipliers: { three: 3, four: 0, five: 0 } },
      { id: "chili", name: "Red Chili", emoji: "🌶️", value: 5, rarity: "rare", color: "#dc2626", multipliers: { three: 5, four: 0, five: 0 } },
      { id: "habanero", name: "Habanero", emoji: "🔥", value: 8, rarity: "rare", color: "#f97316", multipliers: { three: 8, four: 0, five: 0 } },
      { id: "ghost", name: "Ghost Pepper", emoji: "👻", value: 15, rarity: "epic", color: "#e2e8f0", multipliers: { three: 15, four: 0, five: 0 } },
      { id: "reaper", name: "Carolina Reaper", emoji: "💀", value: 30, rarity: "epic", color: "#7f1d1d", multipliers: { three: 30, four: 0, five: 0 } },
      { id: "dragon", name: "Dragon's Breath", emoji: "🐲", value: 100, rarity: "legendary", color: "#dc2626", multipliers: { three: 100, four: 0, five: 0 } }
    ],
    features: ["Heat Wave", "Pepper Power", "Scoville Scale", "Fire Multipliers"],
    bonusRounds: true,
    freeSpins: false,
    wildSymbol: true,
    scatterSymbol: false,
    jackpot: { progressive: false, fixed: 5000 },
    thumbnail: "/games/hot-peppers.jpg",
    backgroundImage: "/games/backgrounds/mexican-kitchen.jpg",
    soundTheme: "spicy",
    category: ["food", "spicy"],
    releaseDate: "2024-01-25",
    popularity: 74
  },
  {
    id: "candy-crush-slots",
    name: "Candy Crush Slots",
    theme: "Sweet Candy",
    description: "Sweet candy combinations for delicious wins",
    provider: "CoinKrazy Studios",
    rtp: 95.5,
    volatility: "low",
    reels: 5,
    rows: 3,
    paylines: 20,
    minBet: { GC: 20, SC: 0.2 },
    maxBet: { GC: 2000, SC: 20 },
    symbols: [
      { id: "gummy", name: "Gummy Bear", emoji: "🐻", value: 2, rarity: "common", color: "#ef4444", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "lollipop", name: "Lollipop", emoji: "🍭", value: 3, rarity: "common", color: "#ec4899", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "chocolate", name: "Chocolate", emoji: "🍫", value: 4, rarity: "common", color: "#92400e", multipliers: { three: 4, four: 10, five: 24 } },
      { id: "cupcake", name: "Cupcake", emoji: "🧁", value: 6, rarity: "rare", color: "#f97316", multipliers: { three: 6, four: 15, five: 36 } },
      { id: "donut", name: "Donut", emoji: "🍩", value: 10, rarity: "rare", color: "#f59e0b", multipliers: { three: 10, four: 25, five: 75 } },
      { id: "cake", name: "Birthday Cake", emoji: "🎂", value: 20, rarity: "epic", color: "#8b5cf6", multipliers: { three: 20, four: 60, five: 180 } },
      { id: "rainbow", name: "Rainbow Candy", emoji: "🌈", value: 80, rarity: "legendary", color: "#a855f7", multipliers: { three: 80, four: 320, five: 1600 } }
    ],
    features: ["Sugar Rush", "Candy Cascades", "Sweet Bonus", "Sugar Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 10000 },
    thumbnail: "/games/candy-crush-slots.jpg",
    backgroundImage: "/games/backgrounds/candy-land.jpg",
    soundTheme: "playful",
    category: ["sweet", "colorful"],
    releaseDate: "2024-02-05",
    popularity: 79
  },
  {
    id: "winter-wonderland",
    name: "Winter Wonderland",
    theme: "Christmas & Winter",
    description: "Magical winter landscape with holiday cheer",
    provider: "CoinKrazy Studios",
    rtp: 96.1,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 25,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "snowflake", name: "Snowflake", emoji: "❄️", value: 2, rarity: "common", color: "#3b82f6", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "present", name: "Gift Box", emoji: "🎁", value: 3, rarity: "common", color: "#dc2626", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "bell", name: "Christmas Bell", emoji: "🔔", value: 5, rarity: "rare", color: "#eab308", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "tree", name: "Christmas Tree", emoji: "🎄", value: 8, rarity: "rare", color: "#16a34a", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "reindeer", name: "Reindeer", emoji: "🦌", value: 15, rarity: "epic", color: "#92400e", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "sleigh", name: "Santa's Sleigh", emoji: "🛷", value: 40, rarity: "epic", color: "#ef4444", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "santa", name: "Santa Claus", emoji: "🎅", value: 100, rarity: "legendary", color: "#dc2626", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Christmas Bonus", "Holiday Spins", "Snow Storm", "Santa's Workshop"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 14000 },
    thumbnail: "/games/winter-wonderland.jpg",
    backgroundImage: "/games/backgrounds/winter-scene.jpg",
    soundTheme: "festive",
    category: ["holiday", "seasonal"],
    releaseDate: "2023-12-15",
    popularity: 81
  },
  {
    id: "royal-gems",
    name: "Royal Gems",
    theme: "Royal Crown Jewels",
    description: "Crown jewels fit for royalty with majestic payouts",
    provider: "CoinKrazy Studios",
    rtp: 97.3,
    volatility: "high",
    reels: 5,
    rows: 3,
    paylines: 20,
    minBet: { GC: 20, SC: 0.2 },
    maxBet: { GC: 2000, SC: 20 },
    symbols: [
      { id: "pearl", name: "Pearl", emoji: "🤍", value: 3, rarity: "common", color: "#e2e8f0", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "garnet", name: "Garnet", emoji: "🔴", value: 4, rarity: "common", color: "#dc2626", multipliers: { three: 4, four: 10, five: 24 } },
      { id: "opal", name: "Opal", emoji: "🌈", value: 6, rarity: "rare", color: "#a855f7", multipliers: { three: 6, four: 15, five: 36 } },
      { id: "scepter", name: "Royal Scepter", emoji: "🪄", value: 10, rarity: "rare", color: "#eab308", multipliers: { three: 10, four: 25, five: 75 } },
      { id: "tiara", name: "Royal Tiara", emoji: "👑", value: 20, rarity: "epic", color: "#f59e0b", multipliers: { three: 20, four: 60, five: 180 } },
      { id: "throne", name: "Golden Throne", emoji: "🪑", value: 50, rarity: "epic", color: "#fbbf24", multipliers: { three: 50, four: 150, five: 500 } },
      { id: "crown", name: "Imperial Crown", emoji: "👑", value: 150, rarity: "legendary", color: "#d97706", multipliers: { three: 150, four: 600, five: 3000 } }
    ],
    features: ["Royal Bonus", "Crown Jewels", "Regal Spins", "Coronation"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: true, fixed: 75000 },
    thumbnail: "/games/royal-gems.jpg",
    backgroundImage: "/games/backgrounds/royal-palace.jpg",
    soundTheme: "regal",
    category: ["luxury", "royal", "high-rtp", "jackpot"],
    releaseDate: "2024-03-25",
    popularity: 93
  },
  {
    id: "safari-adventure",
    name: "Safari Adventure",
    theme: "African Safari",
    description: "Wild African safari with majestic animals and big wins",
    provider: "CoinKrazy Studios",
    rtp: 96.4,
    volatility: "medium",
    reels: 5,
    rows: 4,
    paylines: 40,
    minBet: { GC: 40, SC: 0.4 },
    maxBet: { GC: 4000, SC: 40 },
    symbols: [
      { id: "meerkat", name: "Meerkat", emoji: "🦫", value: 2, rarity: "common", color: "#92400e", multipliers: { three: 2, four: 5, five: 12 } },
      { id: "zebra", name: "Zebra", emoji: "🦓", value: 3, rarity: "common", color: "#1f2937", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "giraffe", name: "Giraffe", emoji: "🦒", value: 5, rarity: "rare", color: "#f59e0b", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "rhino", name: "Rhinoceros", emoji: "🦏", value: 8, rarity: "rare", color: "#6b7280", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "elephant", name: "Elephant", emoji: "🐘", value: 15, rarity: "epic", color: "#374151", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "lion", name: "Lion King", emoji: "🦁", value: 40, rarity: "epic", color: "#f59e0b", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "leopard", name: "Leopard", emoji: "🐆", value: 100, rarity: "legendary", color: "#92400e", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Safari Hunt", "Big Five Bonus", "Wild Stampede", "Pride Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 20000 },
    thumbnail: "/games/safari-adventure.jpg",
    backgroundImage: "/games/backgrounds/african-savanna.jpg",
    soundTheme: "nature",
    category: ["adventure", "animals", "nature"],
    releaseDate: "2024-03-12",
    popularity: 85
  },
  {
    id: "mega-multiplier",
    name: "Mega Multiplier",
    theme: "High Tech Multipliers",
    description: "Advanced slot with massive multiplier potential",
    provider: "CoinKrazy Studios",
    rtp: 97.8,
    volatility: "high",
    reels: 5,
    rows: 3,
    paylines: 243,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "x2", name: "2x Multiplier", emoji: "2️⃣", value: 2, rarity: "common", color: "#16a34a", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "x3", name: "3x Multiplier", emoji: "3️⃣", value: 3, rarity: "common", color: "#eab308", multipliers: { three: 3, four: 9, five: 21 } },
      { id: "x5", name: "5x Multiplier", emoji: "5️⃣", value: 5, rarity: "rare", color: "#f97316", multipliers: { three: 5, four: 15, five: 35 } },
      { id: "x10", name: "10x Multiplier", emoji: "🔟", value: 10, rarity: "rare", color: "#dc2626", multipliers: { three: 10, four: 30, five: 70 } },
      { id: "x25", name: "25x Multiplier", emoji: "💥", value: 25, rarity: "epic", color: "#8b5cf6", multipliers: { three: 25, four: 75, five: 175 } },
      { id: "x100", name: "100x Multiplier", emoji: "💯", value: 100, rarity: "epic", color: "#3b82f6", multipliers: { three: 100, four: 300, five: 700 } },
      { id: "x1000", name: "1000x Multiplier", emoji: "🚀", value: 1000, rarity: "legendary", color: "#a855f7", multipliers: { three: 1000, four: 3000, five: 10000 } }
    ],
    features: ["Mega Multipliers", "Cascade Wins", "Multiplier Madness", "Infinite Spins"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: true, fixed: 500000 },
    thumbnail: "/games/mega-multiplier.jpg",
    backgroundImage: "/games/backgrounds/digital-matrix.jpg",
    soundTheme: "futuristic",
    category: ["high-tech", "multiplier", "high-rtp", "jackpot"],
    releaseDate: "2024-04-01",
    popularity: 96
  },
  {
    id: "lucky-charms",
    name: "Lucky Charms",
    theme: "Irish Luck",
    description: "Find your pot of gold with Irish luck and charms",
    provider: "CoinKrazy Studios",
    rtp: 96.6,
    volatility: "medium",
    reels: 5,
    rows: 3,
    paylines: 25,
    minBet: { GC: 25, SC: 0.25 },
    maxBet: { GC: 2500, SC: 25 },
    symbols: [
      { id: "shamrock", name: "Four-Leaf Clover", emoji: "🍀", value: 2, rarity: "common", color: "#16a34a", multipliers: { three: 2, four: 6, five: 14 } },
      { id: "horseshoe", name: "Lucky Horseshoe", emoji: "🔄", value: 3, rarity: "common", color: "#6b7280", multipliers: { three: 3, four: 8, five: 18 } },
      { id: "pipe", name: "Irish Pipe", emoji: "🪈", value: 5, rarity: "rare", color: "#92400e", multipliers: { three: 5, four: 12, five: 30 } },
      { id: "hat", name: "Leprechaun Hat", emoji: "🎩", value: 8, rarity: "rare", color: "#16a34a", multipliers: { three: 8, four: 20, five: 60 } },
      { id: "rainbow", name: "Rainbow", emoji: "🌈", value: 15, rarity: "epic", color: "#a855f7", multipliers: { three: 15, four: 45, five: 135 } },
      { id: "leprechaun", name: "Leprechaun", emoji: "🧙‍♂️", value: 40, rarity: "epic", color: "#16a34a", multipliers: { three: 40, four: 120, five: 400 } },
      { id: "pot-of-gold", name: "Pot of Gold", emoji: "🏆", value: 100, rarity: "legendary", color: "#fbbf24", multipliers: { three: 100, four: 400, five: 2000 } }
    ],
    features: ["Pot of Gold Bonus", "Rainbow Bridge", "Lucky Spins", "Irish Blessing"],
    bonusRounds: true,
    freeSpins: true,
    wildSymbol: true,
    scatterSymbol: true,
    jackpot: { progressive: false, fixed: 16000 },
    thumbnail: "/games/lucky-charms.jpg",
    backgroundImage: "/games/backgrounds/irish-countryside.jpg",
    soundTheme: "celtic",
    category: ["irish", "luck"],
    releaseDate: "2024-03-17",
    popularity: 83
  }
];

export const getGameById = (id: string): SlotGameConfig | undefined => {
  return SLOT_GAMES_CONFIG.find(game => game.id === id);
};

export const getGamesByCategory = (category: string): SlotGameConfig[] => {
  if (category === "all") return SLOT_GAMES_CONFIG;
  return SLOT_GAMES_CONFIG.filter(game => game.category.includes(category));
};

export const getGamesByProvider = (provider: string): SlotGameConfig[] => {
  return SLOT_GAMES_CONFIG.filter(game => game.provider === provider);
};

export const getGamesByVolatility = (volatility: "low" | "medium" | "high"): SlotGameConfig[] => {
  return SLOT_GAMES_CONFIG.filter(game => game.volatility === volatility);
};

export const getFeaturedGames = (): SlotGameConfig[] => {
  return SLOT_GAMES_CONFIG.filter(game => game.category.includes("featured"));
};

export const getHighRTPGames = (): SlotGameConfig[] => {
  return SLOT_GAMES_CONFIG.filter(game => game.rtp >= 97);
};

export const getJackpotGames = (): SlotGameConfig[] => {
  return SLOT_GAMES_CONFIG.filter(game => game.category.includes("jackpot") || game.jackpot.progressive);
};

export const getPopularGames = (): SlotGameConfig[] => {
  return [...SLOT_GAMES_CONFIG].sort((a, b) => b.popularity - a.popularity).slice(0, 10);
};

export const getNewGames = (): SlotGameConfig[] => {
  return [...SLOT_GAMES_CONFIG]
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 8);
};

export default SLOT_GAMES_CONFIG;
