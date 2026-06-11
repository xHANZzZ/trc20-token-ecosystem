import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

/**
 * Custom Operational Application Error Class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details: any[];

  constructor(message: string, statusCode = 500, details: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Express Global Error Boundary Middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log the complete error trace using Winston
  logger.error(err);

  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let details: any[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    errorMessage = 'Validation failed';
    details = err.errors.map((e) => ({
      field: e.path.slice(1).join('.'),
      message: e.message,
      location: e.path[0]
    }));
  } else if (err.message && (
    err.message.includes('revert') ||
    err.message.includes('reverted') ||
    err.message.includes('TVM') ||
    err.message.includes('transaction')
  )) {
    // Intercept and parse TVM-specific revert failures
    statusCode = 400;
    errorMessage = `TRON Network Contract execution failed: ${err.message}`;
  } else {
    // Fallback message for general Node process runtime errors
    errorMessage = err.message || errorMessage;
  }

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    details
  });
};
