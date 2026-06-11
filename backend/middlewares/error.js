import { logger } from '../config/logger.js';

/**
 * Global Error Handler Middleware
 * Intercepts uncaught exceptions in controllers or downstream services.
 * Integrates with winston logging and prevents stack trace exposure in production environments.
 */
export const errorHandler = (err, req, res, next) => {
  // Log error using Winston logger
  logger.error(err);

  // Set default status codes
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  // Standard API error body
  const errorResponse = {
    status,
    message: err.message || 'Internal Server Error'
  };

  // Include stack details only in development context
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Custom operational API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}
