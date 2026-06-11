import { getContractInstance } from '../config/tron.js';
import { ApiError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

/**
 * Executes token transfer from custodian account
 */
export const transfer = async (recipient: string, amount: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Initiating transfer of ${amount} tokens to ${recipient}`);
    
    // Execute state transfer transaction on the proxy
    const txid = await contract.transfer(recipient, amount).send({
      feeLimit: 100000000 // 100 TRX fee limit
    });

    logger.info(`Transfer transaction broadcasted. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in transfer service:', error);
    throw new ApiError(error.message || 'Token transfer transaction failed', 400);
  }
};

/**
 * Grants spending approvals to a spender address
 */
export const approve = async (spender: string, amount: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Initiating allowance approval of ${amount} tokens for spender ${spender}`);
    
    const txid = await contract.approve(spender, amount).send({
      feeLimit: 100000000
    });

    logger.info(`Approval transaction broadcasted. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in approve service:', error);
    throw new ApiError(error.message || 'Token approval transaction failed', 400);
  }
};

/**
 * Queries the active balance of an address
 */
export const getBalanceOf = async (address: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Querying token balance of address: ${address}`);
    
    const balance = await contract.balanceOf(address).call();
    return balance.toString();
  } catch (error: any) {
    logger.error(`Error in getBalanceOf for address ${address}:`, error);
    throw new ApiError(error.message || 'Failed to fetch token balance', 500);
  }
};
