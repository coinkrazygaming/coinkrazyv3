# CoinKrazy.com - Social Casino Platform

![CoinKrazy Logo](https://cdn.builder.io/api/v1/image/assets%2F497c052459974075a12c2be5235ba002%2F6a30c1e315db41ff9762124c4bda0f01?format=webp&width=200)

## 🎰 About CoinKrazy

CoinKrazy.com is America's favorite social casino platform, offering exciting slots, bingo, and sweepstakes games. Players can enjoy free-to-play entertainment with Gold Coins and compete for real prizes with Sweeps Coins.

### 🪙 Virtual Currencies

- **Gold Coins (GC)**: Available for purchase, used for entertainment only
- **Sweeps Coins (SC)**: Cannot be purchased, earned through gameplay and promotions, redeemable for real prizes

## 🚀 Features

- **🎮 Game Library**: Slots, Bingo, Scratch Cards, and more
- **🤖 Josey AI**: AI-powered customer support and lead management
- **📧 Email Automation**: Smart welcome sequences and player engagement
- **👑 VIP Program**: Exclusive rewards for high-value players
- **🏆 Tournaments**: Competitive gameplay with leaderboards
- **📱 Mobile Optimized**: Responsive design for all devices
- **🔒 Secure & Compliant**: Licensed and regulated gaming platform

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Node.js + Express + PostgreSQL
- **Gaming**: Custom slots engine + iframe integration
- **AI**: Josey AI for customer support
- **Deployment**: Netlify + Production infrastructure

## 🏗 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/coinkrazy/social-casino.git
cd social-casino

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Environment Variables

```env
# App Configuration
VITE_APP_NAME=CoinKrazy
VITE_APP_URL=https://coinkrazy.com

# Database
VITE_DB_URL=your_database_url

# External Services
VITE_EMAIL_API_KEY=your_email_service_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
```

## 🎮 Game Development

### Adding New Games

1. Create game iframe in `public/games/iframe/`
2. Add game configuration to `coinKrazySlotsServer.ts`
3. Update admin settings panel
4. Test thoroughly with both GC and SC currencies

### Game Integration

Games communicate with the parent frame via `postMessage` API:

```javascript
// Send message to parent
window.parent.postMessage(
  {
    type: "SPIN_REQUEST",
    data: { betAmount: 10, currency: "GC" },
  },
  "*",
);

// Listen for responses
window.addEventListener("message", (event) => {
  const { type, data } = event.data;
  if (type === "SPIN_RESULT") {
    // Handle spin result
  }
});
```

## 🔧 Deployment

### Production Build

```bash
# Build for production
npm run build:prod

# Deploy to Netlify
npm run deploy:prod
```

### Environment Setup

1. **Staging**: `npm run deploy:staging`
2. **Production**: `npm run deploy:prod`

### Required Services

- PostgreSQL database
- Email service (SMTP/API)
- Payment processor (Stripe)
- CDN for assets
- Analytics (Google Analytics)
- Error monitoring (Sentry)

## 🎯 Game Features

### Slot Games

- **CoinKrazy Spinner**: 5-reel progressive jackpot slot
- **Lucky Scratch Gold**: Instant win scratch cards
- **Josey Duck Adventure**: Themed slot with bonus features

### Bingo

- **Multi-card gameplay**: Up to 4 cards simultaneously
- **Auto-daub feature**: Automatic number marking
- **Progressive jackpots**: Growing prize pools

### Social Features

- **Live chat**: Real-time player interaction
- **Tournaments**: Competitive gameplay
- **Leaderboards**: Daily, weekly, monthly rankings

## 🔐 Security & Compliance

### Player Protection

- **Age verification**: 18+ requirement
- **Responsible gaming tools**: Limits and self-exclusion
- **Secure transactions**: Encrypted payment processing
- **Fair play**: Certified RNG and game testing

### Regulatory Compliance

- **Licensed operation**: Regulated gaming jurisdiction
- **KYC verification**: Identity verification for withdrawals
- **Anti-money laundering**: Transaction monitoring
- **Data protection**: GDPR and CCPA compliance

## 📞 Support

- **Phone**: 1-800-COIN-KRAZY
- **Email**: support@coinkrazy.com
- **Live Chat**: Available 24/7 on platform
- **Help Center**: https://coinkrazy.com/help

## 🎮 Gaming Disclaimer

CoinKrazy.com operates as a social casino. Gold Coins have no cash value and are for entertainment only. Sweeps Coins may be redeemed for prizes where legal. Must be 18+ to play. Void where prohibited.

## 📄 License

© 2024 CoinKrazy LLC. All rights reserved.

---

**Made with ❤️ by the CoinKrazy Team**
