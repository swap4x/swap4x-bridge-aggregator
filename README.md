# Swap4x Bridge Aggregator

A comprehensive multi-chain bridge aggregation platform that finds the best routes across all major bridges, optimizing for cost, speed, and security.

## 🌟 Features

- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism
- **Bridge Aggregation**: Stargate, Hop Protocol, Synapse, Across, Multichain
- **Route Optimization**: Compare fees, speed, and security across all bridges
- **Real-time Monitoring**: Live bridge performance and rate tracking
- **Professional Interface**: Clean, responsive design with mobile support
- **Transaction History**: Complete bridge transaction tracking
- **Analytics Dashboard**: Platform insights and performance metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL database (Railway provides this)
- API keys for Alchemy and CoinGecko

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/swap4x/swap4x-bridge-aggregator.git
   cd swap4x-bridge-aggregator
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

### Backend (Node.js/Express)
- **API Routes**: Bridge comparison, transaction tracking, analytics
- **Services**: Bridge integration, price monitoring, database management
- **Database**: PostgreSQL with transaction history and analytics
- **Security**: Rate limiting, CORS, input validation

### Frontend (React/Vite)
- **Components**: Bridge interface, route comparison, transaction history
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Routing**: React Router for navigation

### Smart Contracts (Solidity)
- **Bridge Aggregator**: Multi-chain route optimization
- **Fee Collection**: Platform fee management
- **Security**: ReentrancyGuard, access controls

## 🌐 Deployment

### Railway Deployment (Recommended)

1. **Create Railway account** at [railway.app](https://railway.app)

2. **Connect GitHub repository**
   - Link your GitHub account
   - Select the swap4x-bridge-aggregator repository

3. **Configure environment variables**
   ```
   DATABASE_URL=postgresql://... (auto-provided by Railway)
   ALCHEMY_API_KEY=your_alchemy_key
   COINGECKO_API_KEY=your_coingecko_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway automatically detects and deploys both frontend and backend
   - Database is provisioned automatically
   - SSL certificates are handled automatically

### Custom Domain Setup

1. **Add custom domain** in Railway dashboard
2. **Point DNS** to Railway's provided CNAME
3. **SSL certificate** is automatically provisioned

## 🔧 Configuration

### API Keys Required

1. **Alchemy** (Blockchain RPC)
   - Sign up at [alchemy.com](https://alchemy.com)
   - Create apps for Ethereum, Polygon, Arbitrum, Optimism
   - Copy API key and endpoints

2. **CoinGecko** (Price Data)
   - Sign up at [coingecko.com/api](https://coingecko.com/api)
   - Get free API key from dashboard

### Environment Variables

```bash
# Database (Railway auto-provides)
DATABASE_URL=postgresql://...

# API Keys
ALCHEMY_API_KEY=your_key_here
COINGECKO_API_KEY=your_key_here

# RPC Endpoints
ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
ARBITRUM_RPC=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
OPTIMISM_RPC=https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY

# Application
NODE_ENV=production
PORT=3001
```

## 📊 API Endpoints

### Bridge Routes
- `GET /api/bridge/routes` - Get optimal bridge routes
- `POST /api/bridge/quote` - Get detailed quote
- `POST /api/bridge/execute` - Execute bridge transaction
- `GET /api/bridge/status/:id` - Get transaction status
- `GET /api/bridge/history/:address` - Get user history

### Analytics
- `GET /api/analytics/volume` - Platform volume data
- `GET /api/analytics/protocols` - Protocol performance
- `GET /api/analytics/chains` - Chain activity

### Prices
- `GET /api/prices/:token` - Get token price
- `GET /api/prices/history/:token` - Get price history

## 🔒 Security

- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **Input Validation**: All inputs validated and sanitized
- **CORS Protection**: Configured for production domains
- **SQL Injection Prevention**: Parameterized queries
- **Environment Variables**: Sensitive data in environment variables

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Run all tests
npm test
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Database Stats**: Built-in analytics
- **Error Logging**: Winston logging with file rotation
- **Performance Metrics**: Request timing and success rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.swap4x.com](https://docs.swap4x.com)
- **Issues**: [GitHub Issues](https://github.com/swap4x/swap4x-bridge-aggregator/issues)
- **Discord**: [Swap4x Community](https://discord.gg/swap4x)

## 🎯 Roadmap

- [ ] Additional bridge protocol integrations
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Governance token implementation
- [ ] Cross-chain yield farming integration
- [ ] NFT bridge support

---

Built with ❤️ by the Swap4x Team

