import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service.js';

/**
 * Audit lists of token transfers extracted from node event logs
 */
export const getTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '10', 10);

    const auditData = await adminService.getTransfers(page, limit);

    res.status(200).json({
      success: true,
      data: auditData.data,
      total: auditData.total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Halts all token transfers
 */
export const pause = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const txid = await adminService.pause(reason);

    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resumes token transfers
 */
export const unpause = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const txid = await adminService.unpause();

    res.status(200).json({
      success: true,
      txid
    });
  } catch (error) {
    next(error);
  }
};
