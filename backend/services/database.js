const { Pool } = require('pg');
const config = require('../../config/api-config');
const logger = require('../utils/logger');

class DatabaseService {
  constructor() {
    this.pool = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connection
   */
  async initialize() {
    try {
      // Railway provides DATABASE_URL automatically
      const connectionString = process.env.DATABASE_URL || config.database.url;
      
      this.pool = new Pool({
        connectionString,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      logger.info('Database connection established successfully');
      
      // Create tables if they don't exist
      await this.createTables();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          address VARCHAR(42) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Bridge transactions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS bridge_transactions (
          id SERIAL PRIMARY KEY,
          bridge_id VARCHAR(100) UNIQUE NOT NULL,
          user_address VARCHAR(42) NOT NULL,
          from_chain VARCHAR(20) NOT NULL,
          to_chain VARCHAR(20) NOT NULL,
          token VARCHAR(10) NOT NULL,
          amount DECIMAL(36, 18) NOT NULL,
          protocol VARCHAR(20) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          from_tx_hash VARCHAR(66),
          to_tx_hash VARCHAR(66),
          fee_amount DECIMAL(36, 18),
          gas_used BIGINT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP
        )
      `);

      // Price history table
      await client.query(`
        CREATE TABLE IF NOT EXISTS price_history (
          id SERIAL PRIMARY KEY,
          token VARCHAR(10) NOT NULL,
          price DECIMAL(18, 8) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Analytics table
      await client.query(`
        CREATE TABLE IF NOT EXISTS analytics (
          id SERIAL PRIMARY KEY,
          event_type VARCHAR(50) NOT NULL,
          data JSONB,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_bridge_transactions_user_address 
        ON bridge_transactions(user_address)
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_bridge_transactions_status 
        ON bridge_transactions(status)
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_price_history_token_timestamp 
        ON price_history(token, timestamp)
      `);

      await client.query('COMMIT');
      logger.info('Database tables created successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error creating database tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute query
   */
  async query(text, params) {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug(`Query executed in ${duration}ms: ${text}`);
      return res;
    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Get client for transactions
   */
  async getClient() {
    if (!this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return await this.pool.connect();
  }

  /**
   * Store bridge transaction
   */
  async storeBridgeTransaction(data) {
    const query = `
      INSERT INTO bridge_transactions 
      (bridge_id, user_address, from_chain, to_chain, token, amount, protocol, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.bridgeId,
      data.userAddress,
      data.fromChain,
      data.toChain,
      data.token,
      data.amount,
      data.protocol,
      data.status || 'pending'
    ];

    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * Update bridge transaction status
   */
  async updateBridgeTransaction(bridgeId, updates) {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE bridge_transactions 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE bridge_id = $1
      RETURNING *
    `;
    
    const values = [bridgeId, ...Object.values(updates)];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  /**
   * Get bridge transaction by ID
   */
  async getBridgeTransaction(bridgeId) {
    const query = 'SELECT * FROM bridge_transactions WHERE bridge_id = $1';
    const result = await this.query(query, [bridgeId]);
    return result.rows[0];
  }

  /**
   * Get user bridge history
   */
  async getUserBridgeHistory(userAddress, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM bridge_transactions 
      WHERE user_address = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await this.query(query, [userAddress, limit, offset]);
    return result.rows;
  }

  /**
   * Store price data
   */
  async storePriceData(token, price) {
    const query = `
      INSERT INTO price_history (token, price)
      VALUES ($1, $2)
    `;
    
    await this.query(query, [token, price]);
  }

  /**
   * Get price history
   */
  async getPriceHistory(token, hours = 24) {
    const query = `
      SELECT price, timestamp 
      FROM price_history 
      WHERE token = $1 AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp ASC
    `;
    
    const result = await this.query(query, [token]);
    return result.rows;
  }

  /**
   * Store analytics event
   */
  async storeAnalyticsEvent(eventType, data) {
    const query = `
      INSERT INTO analytics (event_type, data)
      VALUES ($1, $2)
    `;
    
    await this.query(query, [eventType, JSON.stringify(data)]);
  }

  /**
   * Get analytics data
   */
  async getAnalytics(eventType, hours = 24) {
    const query = `
      SELECT data, timestamp 
      FROM analytics 
      WHERE event_type = $1 AND timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
    `;
    
    const result = await this.query(query, [eventType]);
    return result.rows;
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const queries = [
      'SELECT COUNT(*) as total_users FROM users',
      'SELECT COUNT(*) as total_transactions FROM bridge_transactions',
      'SELECT COUNT(*) as pending_transactions FROM bridge_transactions WHERE status = \'pending\'',
      'SELECT COUNT(*) as completed_transactions FROM bridge_transactions WHERE status = \'completed\'',
      'SELECT SUM(amount::numeric) as total_volume FROM bridge_transactions WHERE status = \'completed\''
    ];

    const results = await Promise.all(
      queries.map(query => this.query(query))
    );

    return {
      totalUsers: parseInt(results[0].rows[0].total_users),
      totalTransactions: parseInt(results[1].rows[0].total_transactions),
      pendingTransactions: parseInt(results[2].rows[0].pending_transactions),
      completedTransactions: parseInt(results[3].rows[0].completed_transactions),
      totalVolume: parseFloat(results[4].rows[0].total_volume || 0)
    };
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection closed');
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

// Initialize database function
async function initializeDatabase() {
  return await databaseService.initialize();
}

module.exports = {
  DatabaseService,
  initializeDatabase,
  db: databaseService
};

