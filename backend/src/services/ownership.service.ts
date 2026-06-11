import { getContractInstance } from '../config/tron.js';
import { ApiError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

/**
 * Proposes a new owner address for the smart contract (Owner only)
 */
export const transfer = async (proposedOwner: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Initiating ownership transfer proposal to address: ${proposedOwner}`);

    const txid = await contract.transferOwnership(proposedOwner).send({
      feeLimit: 100000000
    });

    logger.info(`Ownership transfer proposed successfully. Proposed Owner: ${proposedOwner}, TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in ownership transfer service:', error);
    throw new ApiError(error.message || 'Ownership transfer proposal failed', 400);
  }
};

/**
 * Claims the proposed ownership of the contract.
 * Must be executed by the nominated pending owner (claims signed by custodian key).
 */
export const claim = async (): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info('Claiming contract ownership via pending owner acceptOwnership transaction');

    const txid = await contract.acceptOwnership().send({
      feeLimit: 100000000
    });

    logger.info(`Ownership claimed successfully. New Owner established. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in ownership claim service:', error);
    throw new ApiError(error.message || 'Ownership claim acceptance failed', 400);
  }
};
