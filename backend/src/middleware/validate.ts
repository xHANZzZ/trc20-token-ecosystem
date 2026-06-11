import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Zod validation pipeline adaptor for Express.
 * Asserts schemas against request inputs (body, query, params).
 * Uncaught schema parsing errors automatically trigger ZodError throws which
 * route directly to the centralized global error handler.
 */
export const validate = (schema: AnyZodObject) => (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  schema.parse({
    body: req.body,
    query: req.query,
    params: req.params
  });
  next();
};
