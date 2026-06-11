import { getContractInstance } from '../config/tron.js';
import { ApiError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

/**
 * Registers a wallet address with an identity hash in the smart contract registry
 */
export const register = async (walletAddress: string, identityHash: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Registering wallet address ${walletAddress} with identity hash: ${identityHash}`);

    const txid = await contract.registerWallet(walletAddress, identityHash).send({
      feeLimit: 150000000 // 150 TRX fee limit buffer
    });

    logger.info(`Wallet registered successfully. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in registry register service:', error);
    throw new ApiError(error.message || 'Wallet registration transaction failed', 400);
  }
};

/**
 * Revokes registry status of a wallet address
 */
export const revoke = async (walletAddress: string): Promise<string> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Revoking registry status for wallet address: ${walletAddress}`);

    const txid = await contract.revoke(walletAddress).send({
      feeLimit: 100000000
    });

    logger.info(`Wallet status revoked. TxID: ${txid}`);
    return txid;
  } catch (error: any) {
    logger.error('Error in registry revoke service:', error);
    throw new ApiError(error.message || 'Wallet revocation transaction failed', 400);
  }
};

/**
 * Queries the active status and identity hash metadata of a wallet address
 */
export const getStatus = async (address: string): Promise<{ isRegistered: boolean; identityHash: string }> => {
  try {
    const contract = await getContractInstance();
    logger.info(`Querying registry status for wallet address: ${address}`);

    const status = await contract.getWalletStatus(address).call();
    
    return {
      isRegistered: status.isRegistered,
      identityHash: status.identityHash
    };
  } catch (error: any) {
    logger.error(`Error in registry status service for address ${address}:`, error);
    throw new ApiError(error.message || 'Failed to query registry status details', 500);
  }
};
