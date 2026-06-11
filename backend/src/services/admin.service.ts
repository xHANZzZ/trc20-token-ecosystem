import { getContractInstance, tronWeb } from '../config/tron.js';
import { env } from '../config/env.js';
import { ApiError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

interface TransferEvent {
  txid: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

/**
 * Queries historical transfer logs for the token contract from the TRON network events API.
 */
export const getTransfers = async (page: number, limit: number): Promise<{ data: TransferEvent[]; total: number }> => {
  try {
    logger.info(`Auditing contract transfer logs. Page: ${page}, Limit: ${limit}`);
    
    // Retrieve historical Transfer events from TronWeb API
    const events = await tronWeb.getEventResult(env.CONTRACT_PROXY_ADDRESS, {
      eventName: 'Transfer',
      size: limit,
      page: page,
      sort: 'block_timestamp'
    });

    if (!Array.isArray(events)) {
      return { data: [], total: 0 };
    }

    const formattedEvents: TransferEvent[] = events.map((e: any) => ({
      txid: e.transaction_id,
      from: e.result.from || e.result[0] || 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
      to: e.result.to || e.result[1] || 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb',
      value: (e.result.value || e.result[2] || '0').toString(),
      timestamp: e.block_timestamp
    }));

    return {
      data: formattedEvents,
      total: formattedEvents.length + ((page - 1) * limit) // Provide approximate size based on page offsets
    };
  } catch (error: any) {
    logger.error('Error fetching transfers audit logs:', error);
    throw new ApiError(error.message || 'Failed to query transfer logs from network events API', 500);
  }
};

/**
 * Pauses all token operations in the contract (Owner only)
 */
export const pause = async (reason: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.warn(`Halting all contract token transfers. Audit Reason: ${reason}`);

    const txid = await contract.pause().send({
      feeLimit: 100000000
    });

    logger.warn(`Contract state set to PAUSED. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in pause service:', error);
    throw new ApiError(error.message || 'Contract pause transaction failed', 400);
  }
};

/**
 * Unpauses all token operations in the contract (Owner only)
 */
export const unpause = async (): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info('Resuming all contract token transfers');

    const txid = await contract.unpause().send({
      feeLimit: 100000000
    });

    logger.info(`Contract state set to UNPAUSED. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in unpause service:', error);
    throw new ApiError(error.message || 'Contract unpause transaction failed', 400);
  }
};
