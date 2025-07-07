const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const config = require('../../config/api-config');
const BridgeService = require('../services/bridgeService');
const PriceService = require('../services/priceService');
const logger = require('../utils/logger');

// Initialize services
const bridgeService = new BridgeService();
const priceService = new PriceService();

/**
 * GET /api/bridge/routes
 * Get optimal bridge routes for given parameters
 */
router.get('/routes', async (req, res) => {
  try {
    const { from, to, amount, token, preference = 'balanced' } = req.query;

    // Validation
    if (!from || !to || !amount || !token) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['from', 'to', 'amount', 'token']
      });
    }

    if (!config.chainIds[from] || !config.chainIds[to]) {
      return res.status(400).json({
        error: 'Unsupported chain',
        supportedChains: Object.keys(config.chainIds)
      });
    }

    const amountWei = ethers.parseUnits(amount.toString(), 6); // Assuming USDC (6 decimals)

    // Get all available routes
    const routes = await bridgeService.getAllRoutes(from, to, token, amountWei);

    // Get token price for fee calculations
    const tokenPrice = await priceService.getTokenPrice(token);

    // Calculate fees and sort routes
    const routesWithFees = routes.map(route => {
      const platformFee = (amountWei * BigInt(config.platform.feePercentage * 100)) / BigInt(10000);
      const protocolFee = (amountWei * BigInt(route.fee)) / BigInt(10000);
      const totalFee = platformFee + protocolFee;
      const totalFeeUsd = Number(ethers.formatUnits(totalFee, 6)) * tokenPrice;

      return {
        ...route,
        platformFee: ethers.formatUnits(platformFee, 6),
        protocolFee: ethers.formatUnits(protocolFee, 6),
        totalFee: ethers.formatUnits(totalFee, 6),
        totalFeeUsd: totalFeeUsd.toFixed(2),
        amountOut: ethers.formatUnits(amountWei - totalFee, 6),
        score: bridgeService.calculateRouteScore(route, preference)
      };
    });

    // Sort by score (highest first)
    routesWithFees.sort((a, b) => b.score - a.score);

    res.json({
      success: true,
      routes: routesWithFees,
      metadata: {
        fromChain: from,
        toChain: to,
        token: token,
        amount: amount,
        preference: preference,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting bridge routes:', error);
    res.status(500).json({
      error: 'Failed to get bridge routes',
      message: error.message
    });
  }
});

/**
 * POST /api/bridge/quote
 * Get detailed quote for specific bridge route
 */
router.post('/quote', async (req, res) => {
  try {
    const { from, to, amount, token, protocol } = req.body;

    // Validation
    if (!from || !to || !amount || !token || !protocol) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['from', 'to', 'amount', 'token', 'protocol']
      });
    }

    const amountWei = ethers.parseUnits(amount.toString(), 6);

    // Get detailed quote from specific bridge
    const quote = await bridgeService.getDetailedQuote(from, to, token, amountWei, protocol);

    // Get current gas prices
    const gasPrice = await bridgeService.getGasPrice(from);
    const estimatedGasCost = quote.gasEstimate * gasPrice;

    res.json({
      success: true,
      quote: {
        ...quote,
        gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
        estimatedGasCostEth: ethers.formatEther(estimatedGasCost),
        estimatedGasCostUsd: await priceService.convertToUsd(estimatedGasCost, 'ethereum'),
        validUntil: new Date(Date.now() + 30000).toISOString() // 30 seconds
      }
    });

  } catch (error) {
    logger.error('Error getting bridge quote:', error);
    res.status(500).json({
      error: 'Failed to get bridge quote',
      message: error.message
    });
  }
});

/**
 * POST /api/bridge/execute
 * Execute bridge transaction
 */
router.post('/execute', async (req, res) => {
  try {
    const { 
      from, 
      to, 
      amount, 
      token, 
      protocol, 
      userAddress, 
      slippage = 0.5 
    } = req.body;

    // Validation
    if (!from || !to || !amount || !token || !protocol || !userAddress) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['from', 'to', 'amount', 'token', 'protocol', 'userAddress']
      });
    }

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({
        error: 'Invalid user address'
      });
    }

    const amountWei = ethers.parseUnits(amount.toString(), 6);

    // Generate bridge transaction data
    const bridgeData = await bridgeService.prepareBridgeTransaction(
      from,
      to,
      token,
      amountWei,
      protocol,
      userAddress,
      slippage
    );

    // Store bridge request in database
    const bridgeId = await bridgeService.storeBridgeRequest({
      userAddress,
      fromChain: from,
      toChain: to,
      token,
      amount: amount.toString(),
      protocol,
      status: 'pending'
    });

    res.json({
      success: true,
      bridgeId,
      transaction: bridgeData,
      estimatedCompletion: new Date(Date.now() + bridgeData.estimatedTime * 1000).toISOString()
    });

  } catch (error) {
    logger.error('Error executing bridge:', error);
    res.status(500).json({
      error: 'Failed to execute bridge',
      message: error.message
    });
  }
});

/**
 * GET /api/bridge/status/:bridgeId
 * Get bridge transaction status
 */
router.get('/status/:bridgeId', async (req, res) => {
  try {
    const { bridgeId } = req.params;

    const status = await bridgeService.getBridgeStatus(bridgeId);

    if (!status) {
      return res.status(404).json({
        error: 'Bridge transaction not found'
      });
    }

    res.json({
      success: true,
      status
    });

  } catch (error) {
    logger.error('Error getting bridge status:', error);
    res.status(500).json({
      error: 'Failed to get bridge status',
      message: error.message
    });
  }
});

/**
 * GET /api/bridge/history/:userAddress
 * Get user's bridge transaction history
 */
router.get('/history/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({
        error: 'Invalid user address'
      });
    }

    const history = await bridgeService.getUserHistory(userAddress, limit, offset);

    res.json({
      success: true,
      history,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: history.length
      }
    });

  } catch (error) {
    logger.error('Error getting bridge history:', error);
    res.status(500).json({
      error: 'Failed to get bridge history',
      message: error.message
    });
  }
});

/**
 * GET /api/bridge/protocols
 * Get supported bridge protocols
 */
router.get('/protocols', async (req, res) => {
  try {
    const protocols = await bridgeService.getSupportedProtocols();

    res.json({
      success: true,
      protocols
    });

  } catch (error) {
    logger.error('Error getting protocols:', error);
    res.status(500).json({
      error: 'Failed to get protocols',
      message: error.message
    });
  }
});

/**
 * GET /api/bridge/chains
 * Get supported chains
 */
router.get('/chains', (req, res) => {
  try {
    const chains = Object.keys(config.chainIds).map(chain => ({
      name: chain,
      chainId: config.chainIds[chain],
      rpcUrl: config.rpc[chain]
    }));

    res.json({
      success: true,
      chains
    });

  } catch (error) {
    logger.error('Error getting chains:', error);
    res.status(500).json({
      error: 'Failed to get chains',
      message: error.message
    });
  }
});

module.exports = router;

