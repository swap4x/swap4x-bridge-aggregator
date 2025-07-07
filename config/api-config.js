// Swap4x Bridge Aggregator - API Configuration
// DO NOT COMMIT TO PUBLIC REPOS - CONTAINS SENSITIVE KEYS

const config = {
  // Alchemy RPC Endpoints
  rpc: {
    ethereum: "https://eth-mainnet.g.alchemy.com/v2/GG12Ngpf1dOhnz2lgwd7YOlEDQsR1WTa",
    polygon: "https://polygon-mainnet.g.alchemy.com/v2/GG12Ngpf1dOhnz2lgwd7YOlEDQsR1WTa",
    optimism: "https://opt-mainnet.g.alchemy.com/v2/GG12Ngpf1dOhnz2lgwd7YOlEDQsR1WTa",
    arbitrum: "https://arb-mainnet.g.alchemy.com/v2/GG12Ngpf1dOhnz2lgwd7YOlEDQsR1WTa"
  },

  // Chain IDs
  chainIds: {
    ethereum: 1,
    polygon: 137,
    optimism: 10,
    arbitrum: 42161
  },

  // CoinGecko Price API
  coingecko: {
    apiKey: "CG-aCwPhUQrCgnkBtKphJfZHgwi",
    baseUrl: "https://api.coingecko.com/api/v3"
  },

  // Railway PostgreSQL Database
  database: {
    // Will be auto-configured by Railway
    // Railway provides DATABASE_URL environment variable
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/swap4x_dev",
    ssl: process.env.NODE_ENV === 'production'
  },

  // Bridge Protocol APIs
  bridges: {
    stargate: {
      apiUrl: "https://api.stargate.finance",
      chainSupport: ["ethereum", "polygon", "arbitrum", "optimism"]
    },
    hop: {
      apiUrl: "https://hop.exchange/api/v1",
      chainSupport: ["ethereum", "polygon", "arbitrum", "optimism"]
    },
    synapse: {
      apiUrl: "https://api.synapseprotocol.com",
      chainSupport: ["ethereum", "polygon", "arbitrum", "optimism"]
    },
    across: {
      apiUrl: "https://api.across.to",
      chainSupport: ["ethereum", "polygon", "arbitrum", "optimism"]
    },
    multichain: {
      apiUrl: "https://bridgeapi.anyswap.exchange",
      chainSupport: ["ethereum", "polygon", "arbitrum", "optimism"]
    }
  },

  // Platform Configuration
  platform: {
    name: "Swap4x",
    domain: "swap4x.com",
    feePercentage: 0.05, // 0.05% platform fee
    supportedTokens: ["USDC", "USDT", "ETH", "WETH", "MATIC", "WMATIC"],
    maxSlippage: 0.5, // 0.5% max slippage
    gasMultiplier: 1.2 // 20% gas buffer
  }
};

module.exports = config;

