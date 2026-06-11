import { Request, Response, NextFunction } from 'express';
import * as tokenService from '../services/token.service.js';

/**
 * Handles custodian token transfer
 */
export const transfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipient, amount } = req.body;
    const txid = await tokenService.transfer(recipient, amount);
    
    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles allowance approvals
 */
export const approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { spender, amount } = req.body;
    const txid = await tokenService.approve(spender, amount);
    
    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles balance queries
 */
export const getBalance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address } = req.params;
    const balance = await tokenService.getBalanceOf(address);
    
    res.status(200).json({
      success: true,
      balance,
      address
    });
  } catch (error) {
    next(error);
  }
};
