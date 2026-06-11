import { getContractInstance, tronWeb } from './tron.service.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../middlewares/error.js';

// Convert raw contract response to bigints/strings safely
const formatUint256 = (val) => {
  return val.toString();
};

/**
 * Get Token Standard Specifications (Name, Symbol, Decimals, Total Supply)
 */
export const getTokenDetails = async () => {
  try {
    const contract = await getContractInstance();
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      contract.name().call(),
      contract.symbol().call(),
      contract.decimals().call(),
      contract.totalSupply().call()
    ]);

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: formatUint256(totalSupply)
    };
  } catch (error) {
    logger.error('Error in getTokenDetails service:', error);
    throw new ApiError('Failed to fetch token details from contract', 500);
  }
};

/**
 * Get Balance of a specific address
 */
export const getBalance = async (address) => {
  try {
    const contract = await getContractInstance();
    const balance = await contract.balanceOf(address).call();
    return {
      address,
      balance: formatUint256(balance)
    };
  } catch (error) {
    logger.error(`Error in getBalance for address ${address}:`, error);
    throw new ApiError('Failed to fetch balance from contract', 500);
  }
};

/**
 * Get remaining allowance of spender for owner
 */
export const getAllowance = async (owner, spender) => {
  try {
    const contract = await getContractInstance();
    const allowance = await contract.allowance(owner, spender).call();
    return {
      owner,
      spender,
      allowance: formatUint256(allowance)
    };
  } catch (error) {
    logger.error(`Error in getAllowance between ${owner} and ${spender}:`, error);
    throw new ApiError('Failed to fetch allowance from contract', 500);
  }
};

/**
 * Execute standard token transfer from custodian account
 */
export const transfer = async (recipient, amount) => {
  try {
    const contract = await getContractInstance();
    // Execute transfer transaction
    const txHash = await contract.transfer(recipient, amount).send({
      feeLimit: 100000000 // 100 TRX buffer limit
    });
    
    logger.info(`Transfer executed successfully. TxHash: ${txHash}`);
    return { txHash, recipient, amount };
  } catch (error) {
    logger.error('Error in transfer service:', error);
    throw new ApiError(`Transfer execution failed: ${error.message || error}`, 400);
  }
};

/**
 * Approve spending allowance for spender from custodian account
 */
export const approve = async (spender, amount) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.approve(spender, amount).send({
      feeLimit: 100000000
    });
    
    logger.info(`Approve executed successfully. TxHash: ${txHash}`);
    return { txHash, spender, amount };
  } catch (error) {
    logger.error('Error in approve service:', error);
    throw new ApiError(`Approve execution failed: ${error.message || error}`, 400);
  }
};

/**
 * Execute transferFrom using allowance
 */
export const transferFrom = async (sender, recipient, amount) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.transferFrom(sender, recipient, amount).send({
      feeLimit: 100000000
    });
    
    logger.info(`transferFrom executed successfully. TxHash: ${txHash}`);
    return { txHash, sender, recipient, amount };
  } catch (error) {
    logger.error('Error in transferFrom service:', error);
    throw new ApiError(`transferFrom execution failed: ${error.message || error}`, 400);
  }
};

/**
 * Mint new tokens (Owner Only)
 */
export const mint = async (to, amount) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.mint(to, amount).send({
      feeLimit: 150000000 // 150 TRX for mint
    });
    
    logger.info(`Mint executed successfully. TxHash: ${txHash}`);
    return { txHash, to, amount };
  } catch (error) {
    logger.error('Error in mint service:', error);
    throw new ApiError(`Mint execution failed: ${error.message || error}`, 400);
  }
};

/**
 * Burn tokens from custodian wallet
 */
export const burn = async (amount) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.burn(amount).send({
      feeLimit: 100000000
    });
    
    logger.info(`Burn executed successfully. TxHash: ${txHash}`);
    return { txHash, amount };
  } catch (error) {
    logger.error('Error in burn service:', error);
    throw new ApiError(`Burn execution failed: ${error.message || error}`, 400);
  }
};
