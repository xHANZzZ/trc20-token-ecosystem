import { getContractInstance } from '../config/tron.js';
import { ApiError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

/**
 * Initiates an implementation logic upgrade on the proxy contract (Owner only)
 */
export const upgrade = async (newImplementationAddress: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Initiating contract proxy upgrade to logic implementation address: ${newImplementationAddress}`);

    const txid = await contract.upgradeTo(newImplementationAddress).send({
      feeLimit: 150000000 // 150 TRX fee limit buffer for delegatecall upgrades
    });

    logger.info(`Contract implementation upgraded successfully. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in proxy upgrade service:', error);
    throw new ApiError(error.message || 'UUPS proxy upgrade execution failed', 400);
  }
};
