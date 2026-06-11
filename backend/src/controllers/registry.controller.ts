import { Request, Response, NextFunction } from 'express';
import * as registryService from '../services/registry.service.js';

/**
 * Handles wallet identity registration
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress, identityHash } = req.body;
    const txid = await registryService.register(walletAddress, identityHash);

    res.status(201).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles wallet identity revocation
 */
export const revoke = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { walletAddress } = req.body;
    const txid = await registryService.revoke(walletAddress);

    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Queries registry status and identity hash metadata
 */
export const getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address } = req.params;
    const statusData = await registryService.getStatus(address);

    res.status(200).json({
      success: true,
      isRegistered: statusData.isRegistered,
      identityHash: statusData.identityHash
    });
  } catch (error) {
    next(error);
  }
};
