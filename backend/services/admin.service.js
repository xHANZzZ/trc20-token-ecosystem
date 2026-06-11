import { getContractInstance } from './tron.service.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../middlewares/error.js';

/**
 * Check if token transfers require compliance registration checks
 */
export const checkComplianceStatus = async () => {
  try {
    const contract = await getContractInstance();
    const status = await contract.complianceRequired().call();
    return { complianceRequired: status };
  } catch (error) {
    logger.error('Error in checkComplianceStatus service:', error);
    throw new ApiError('Failed to read compliance status from contract', 500);
  }
};

/**
 * Toggle transfer compliance check status
 */
export const toggleComplianceStatus = async (required) => {
  try {
    const contract = await getContractInstance();
    const txHash = await contract.setComplianceRequired(required).send({
      feeLimit: 100000000
    });
    
    logger.info(`Compliance checking status set to: ${required}. TxHash: ${txHash}`);
    return { txHash, complianceRequired: required };
  } catch (error) {
    logger.error('Error in toggleComplianceStatus service:', error);
    throw new ApiError(`Failed to update compliance settings: ${error.message || error}`, 400);
  }
};
