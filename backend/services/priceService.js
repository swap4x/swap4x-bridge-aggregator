const axios = require('axios');
const config = require('../../config/api-config');
const logger = require('../utils/logger');

class PriceService {
  constructor() {
    this.priceCache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
    this.initializePriceMonitoring();
  }

  /**
   * Initialize price monitoring
   */
  initializePriceMonitoring() {
    // Update prices every minute
    setInterval(() => {
      this.updateAllPrices();
    }, this.cacheTimeout);

    // Initial price fetch
    this.updateAllPrices();
  }

  /**
   * Get token price in USD
   */
  async getTokenPrice(token) {
    try {
      const cacheKey = `price_${token.toLowerCase()}`;
      const cached = this.priceCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.price;
      }

      const price = await this.fetchTokenPrice(token);
      
      this.priceCache.set(cacheKey, {
        price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      logger.error(`Error getting price for ${token}:`, error);
      
      // Return cached price if available, otherwise fallback
      const cached = this.priceCache.get(`price_${token.toLowerCase()}`);
      if (cached) {
        return cached.price;
      }

      return this.getFallbackPrice(token);
    }
  }

  /**
   * Fetch token price from CoinGecko
   */
  async fetchTokenPrice(token) {
    const tokenMap = {
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'ETH': 'ethereum',
      'WETH': 'ethereum',
      'MATIC': 'matic-network',
      'WMATIC': 'matic-network',
      'BTC': 'bitcoin',
      'WBTC': 'wrapped-bitcoin'
    };

    const coinId = tokenMap[token.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported token: ${token}`);
    }

    const response = await axios.get(
      `${config.coingecko.baseUrl}/simple/price`,
      {
        params: {
          ids: coinId,
          vs_currencies: 'usd'
        },
        headers: {
          'X-CG-Demo-API-Key': config.coingecko.apiKey
        },
        timeout: 5000
      }
    );

    return response.data[coinId]?.usd || 0;
  }

  /**
   * Get fallback price for token
   */
  getFallbackPrice(token) {
    const fallbackPrices = {
      'USDC': 1.00,
      'USDT': 1.00,
      'ETH': 3500,
      'WETH': 3500,
      'MATIC': 0.80,
      'WMATIC': 0.80,
      'BTC': 65000,
      'WBTC': 65000
    };

    return fallbackPrices[token.toUpperCase()] || 1;
  }

  /**
   * Convert amount to USD
   */
  async convertToUsd(amount, token) {
    const price = await this.getTokenPrice(token);
    return Number(amount) * price;
  }

  /**
   * Get multiple token prices
   */
  async getMultiplePrices(tokens) {
    const prices = {};
    
    const pricePromises = tokens.map(async (token) => {
      try {
        const price = await this.getTokenPrice(token);
        prices[token] = price;
      } catch (error) {
        logger.warn(`Failed to get price for ${token}:`, error.message);
        prices[token] = this.getFallbackPrice(token);
      }
    });

    await Promise.allSettled(pricePromises);
    return prices;
  }

  /**
   * Update all supported token prices
   */
  async updateAllPrices() {
    try {
      const supportedTokens = config.platform.supportedTokens;
      await this.getMultiplePrices(supportedTokens);
      logger.debug('Updated all token prices');
    } catch (error) {
      logger.error('Error updating all prices:', error);
    }
  }

  /**
   * Get price history for token
   */
  async getPriceHistory(token, days = 7) {
    try {
      const tokenMap = {
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'ETH': 'ethereum',
        'WETH': 'ethereum',
        'MATIC': 'matic-network',
        'WMATIC': 'matic-network'
      };

      const coinId = tokenMap[token.toUpperCase()];
      if (!coinId) {
        throw new Error(`Unsupported token: ${token}`);
      }

      const response = await axios.get(
        `${config.coingecko.baseUrl}/coins/${coinId}/market_chart`,
        {
          params: {
            vs_currency: 'usd',
            days: days
          },
          headers: {
            'X-CG-Demo-API-Key': config.coingecko.apiKey
          },
          timeout: 10000
        }
      );

      return response.data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp).toISOString(),
        price
      }));
    } catch (error) {
      logger.error(`Error getting price history for ${token}:`, error);
      return [];
    }
  }

  /**
   * Get gas price in USD
   */
  async getGasPriceUsd(chain, gasAmount) {
    try {
      let nativeToken;
      switch (chain) {
        case 'ethereum':
          nativeToken = 'ETH';
          break;
        case 'polygon':
          nativeToken = 'MATIC';
          break;
        case 'arbitrum':
        case 'optimism':
          nativeToken = 'ETH';
          break;
        default:
          nativeToken = 'ETH';
      }

      const tokenPrice = await this.getTokenPrice(nativeToken);
      return gasAmount * tokenPrice;
    } catch (error) {
      logger.error(`Error calculating gas price USD for ${chain}:`, error);
      return 0;
    }
  }

  /**
   * Get market data for token
   */
  async getMarketData(token) {
    try {
      const tokenMap = {
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'ETH': 'ethereum',
        'WETH': 'ethereum',
        'MATIC': 'matic-network',
        'WMATIC': 'matic-network'
      };

      const coinId = tokenMap[token.toUpperCase()];
      if (!coinId) {
        throw new Error(`Unsupported token: ${token}`);
      }

      const response = await axios.get(
        `${config.coingecko.baseUrl}/coins/${coinId}`,
        {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
          },
          headers: {
            'X-CG-Demo-API-Key': config.coingecko.apiKey
          },
          timeout: 10000
        }
      );

      const marketData = response.data.market_data;
      
      return {
        price: marketData.current_price.usd,
        marketCap: marketData.market_cap.usd,
        volume24h: marketData.total_volume.usd,
        priceChange24h: marketData.price_change_percentage_24h,
        priceChange7d: marketData.price_change_percentage_7d,
        high24h: marketData.high_24h.usd,
        low24h: marketData.low_24h.usd,
        lastUpdated: marketData.last_updated
      };
    } catch (error) {
      logger.error(`Error getting market data for ${token}:`, error);
      return null;
    }
  }

  /**
   * Clear price cache
   */
  clearCache() {
    this.priceCache.clear();
    logger.info('Price cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.priceCache.size,
      entries: Array.from(this.priceCache.keys())
    };
  }
}

module.exports = PriceService;

