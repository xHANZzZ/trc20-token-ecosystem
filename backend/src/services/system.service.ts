import { tronWeb } from '../config/tron.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

/**
 * Checks system connection health and retrieves current block metadata
 */
export const health = async (): Promise<{ status: string; network: string; blockNumber: number }> => {
  try {
    logger.info('Performing TRON node connectivity and health check');
    
    // Retrieve latest block header from network node
    const latestBlock = await tronWeb.trx.getCurrentBlock();
    const blockNumber = latestBlock.block_header?.raw_data?.number;

    if (typeof blockNumber !== 'number') {
      throw new Error('Block metadata parse error');
    }

    return {
      status: 'UP',
      network: env.TRON_FULL_NODE,
      blockNumber
    };
  } catch (error: any) {
    logger.error('Health check failed:', error);
    throw new ApiError('TRON network node is unreachable', 503);
  }
};

/**
 * Evaluates ecosystem usage stats (Transfer counts & registration volume)
 */
export const metrics = async (): Promise<{ totalTransactions: number; activeWallets: number }> => {
  try {
    logger.info('Computing ecosystem transaction and wallet metrics');

    // Query active transfers and registrations via TronWeb Event APIs
    const [transfers, registrations] = await Promise.all([
      tronWeb.getEventResult(env.CONTRACT_PROXY_ADDRESS, {
        eventName: 'Transfer',
        size: 200
      }),
      tronWeb.getEventResult(env.CONTRACT_PROXY_ADDRESS, {
        eventName: 'WalletRegistered',
        size: 200
      })
    ]);

    const totalTransactions = Array.isArray(transfers) ? transfers.length : 0;
    const activeWallets = Array.isArray(registrations) ? registrations.length : 0;

    return {
      totalTransactions,
      activeWallets
    };
  } catch (error: any) {
    logger.error('Error fetching analytics metrics:', error);
    throw new ApiError('Failed to parse analytics metrics from event loggers', 500);
  }
};

/**
 * Resolves remaining network energy and bandwidth limits on the custodian wallet
 */
export const limits = async (): Promise<{ energyLeft: number; bandwidthLeft: number }> => {
  try {
    const custodianAddress = tronWeb.defaultAddress.base58;
    if (!custodianAddress) {
      throw new Error('Custodian address not configured');
    }

    logger.info(`Querying system energy/bandwidth balances for: ${custodianAddress}`);
    
    // Fetch resource usage logs
    const resources = await tronWeb.trx.getAccountResources(custodianAddress);
    
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    const energyLeft = Math.max(0, energyLimit - energyUsed);

    const netLimit = resources.NetLimit || 0;
    const netUsed = resources.NetUsed || 0;
    const freeNetLimit = resources.FreeNetLimit || 0;
    const freeNetUsed = resources.FreeNetUsed || 0;
    
    const bandwidthLeft = Math.max(0, (netLimit + freeNetLimit) - (netUsed + freeNetUsed));

    return {
      energyLeft,
      bandwidthLeft
    };
  } catch (error: any) {
    logger.error('Error fetching system resource limits:', error);
    throw new ApiError('Failed to fetch resource balances from blockchain node', 500);
  }
};
