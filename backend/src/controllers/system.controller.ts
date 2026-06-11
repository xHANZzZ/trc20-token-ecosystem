import { Request, Response, NextFunction } from 'express';
import * as systemService from '../services/system.service.js';

/**
 * Health check endpoint verifying TRON node connections
 */
export const getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const healthData = await systemService.health();
    
    res.status(200).json({
      success: true,
      status: healthData.status,
      network: healthData.network,
      blockNumber: healthData.blockNumber
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Audit metric indicators on registrations and transfers volume
 */
export const getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const metricsData = await systemService.metrics();

    res.status(200).json({
      success: true,
      totalTransactions: metricsData.totalTransactions,
      activeWallets: metricsData.activeWallets
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Return remaining network resources (Energy & Bandwidth) for the custodian
 */
export const getLimits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limitsData = await systemService.limits();

    res.status(200).json({
      success: true,
      energyLeft: limitsData.energyLeft,
      bandwidthLeft: limitsData.bandwidthLeft
    });
  } catch (error) {
    next(error);
  }
};
