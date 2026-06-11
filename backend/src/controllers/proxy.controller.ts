import { Request, Response, NextFunction } from 'express';
import * as proxyService from '../services/proxy.service.js';

/**
 * Initiates implementation upgrade for the UUPS proxy contract
 */
export const upgrade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { newImplementationAddress } = req.body;
    const txid = await proxyService.upgrade(newImplementationAddress);

    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};
