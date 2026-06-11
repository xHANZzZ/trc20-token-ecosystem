import { getContractInstance } from './tron.service.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../middlewares/error.js';

/**
 * Fetch registration status of a wallet address
 */
export const checkRegistration = async (wallet) => {
  try {
    const contract = await getContractInstance();
    const isRegistered = await contract.isWalletRegistered(wallet).call();
    return { wallet, isRegistered };
  } catch (error) {
    logger.error(`Error in checkRegistration for wallet ${wallet}:`, error);
    throw new ApiError('Failed to query wallet registration status', 500);
  }
};

/**
 * Get detailed profile of a wallet address
 */
export const getProfile = async (wallet) => {
  try {
    const contract = await getContractInstance();
    const profile = await contract.getWalletProfile(wallet).call();
    
    // TronWeb returns tuple parameters as values
    return {
      wallet,
      isRegistered: profile.isRegistered,
      kycLevel: Number(profile.kycLevel),
      registrationTime: Number(profile.registrationTime),
      metadataURI: profile.metadataURI
    };
  } catch (error) {
    logger.error(`Error in getProfile for wallet ${wallet}:`, error);
    throw new ApiError('Failed to query wallet profile details', 500);
  }
};

/**
 * Register a new wallet profile in the smart contract registry
 */
export const registerWallet = async (wallet, kycLevel, metadataURI) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.registerWallet(wallet, kycLevel, metadataURI).send({
      feeLimit: 150000000 // 150 TRX fee limit for writing structs to mapping
    });
    
    logger.info(`Wallet ${wallet} registered successfully. TxHash: ${txHash}`);
    return { txHash, wallet, kycLevel, metadataURI };
  } catch (error) {
    logger.error(`Error in registerWallet for wallet ${wallet}:`, error);
    throw new ApiError(`Wallet registration failed: ${error.message || error}`, 400);
  }
};

/**
 * Batch register multiple wallet profiles in one transaction
 */
export const batchRegisterWallets = async (wallets, kycLevels, metadataURIs) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.batchRegisterWallets(wallets, kycLevels, metadataURIs).send({
      feeLimit: 300000000 // 300 TRX fee limit buffer for loops
    });
    
    logger.info(`Batch registration executed successfully. TxHash: ${txHash}`);
    return { txHash, count: wallets.length };
  } catch (error) {
    logger.error('Error in batchRegisterWallets service:', error);
    throw new ApiError(`Batch registration failed: ${error.message || error}`, 400);
  }
};

/**
 * Update the KYC level of a registered wallet address
 */
export const updateWalletKYC = async (wallet, newKycLevel) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.updateWalletKYC(wallet, newKycLevel).send({
      feeLimit: 100000000
    });
    
    logger.info(`KYC updated for wallet ${wallet} to tier ${newKycLevel}. TxHash: ${txHash}`);
    return { txHash, wallet, newKycLevel };
  } catch (error) {
    logger.error(`Error in updateWalletKYC for wallet ${wallet}:`, error);
    throw new ApiError(`KYC update failed: ${error.message || error}`, 400);
  }
};

/**
 * Update the metadata URI of a registered wallet address
 */
export const updateWalletMetadata = async (wallet, newMetadataURI) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.updateWalletMetadata(wallet, newMetadataURI).send({
      feeLimit: 100000000
    });
    
    logger.info(`Metadata URI updated for wallet ${wallet}. TxHash: ${txHash}`);
    return { txHash, wallet, newMetadataURI };
  } catch (error) {
    logger.error(`Error in updateWalletMetadata for wallet ${wallet}:`, error);
    throw new ApiError(`Metadata update failed: ${error.message || error}`, 400);
  }
};

/**
 * Deregister a wallet address from the registry mapping
 */
export const deregisterWallet = async (wallet) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.deregisterWallet(wallet).send({
      feeLimit: 100000000
    });
    
    logger.info(`Wallet ${wallet} deregistered from contract. TxHash: ${txHash}`);
    return { txHash, wallet };
  } catch (error) {
    logger.error(`Error in deregisterWallet for wallet ${wallet}:`, error);
    throw new ApiError(`Deregistration failed: ${error.message || error}`, 400);
  }
};
