import { Request, Response, NextFunction } from 'express';
import * as ownershipService from '../services/ownership.service.js';

/**
 * Handles proposal of new ownership transfer
 */
export const transferOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { proposedOwner } = req.body;
    const txid = await ownershipService.transfer(proposedOwner);

    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Executes pending ownership claim
 */
export const claimOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const txid = await ownershipService.claim();

    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};
