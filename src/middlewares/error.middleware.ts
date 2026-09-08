/**
 * @file error.middleware.ts
 * @description Centralized application error handling middleware.
 *
 * Best Practices:
 * 1. Must have the 4-argument signature `(err, req, res, next)` in Express to be recognized as an error handler.
 * 2. Distinguish between operational errors (known application exceptions with status codes) and programmer/unexpected bugs (500 Internal Server Error).
 * 3. Log unexpected 500 errors with full stack traces; hide sensitive internal details/stack traces from clients in production.
 * 4. Return structured, consistent JSON error responses (e.g. `{ success: false, error: { message, code, details } }`).
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
// import { logger } from '../utils/logger.js';

function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  const isProduction = process.env.NODE_ENV === "production";

  // Identify operational errors vs unexpected bugs
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message =
    isAppError || !isProduction ? err.message : "Internal Server Error";
  const details = isAppError ? err.details : undefined;

  // Structured logging
  if (statusCode >= 500) {
    // Replace with your logger (e.g. logger.error)
    console.error(`[ERROR 500] ${req.method} ${req.originalUrl}:`, err);
  } else {
    console.warn(
      `[WARN ${statusCode}] ${req.method} ${req.originalUrl}: ${err.message}`,
    );
  }

  // Send uniform JSON error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(details ? { details } : {}),
      ...(!isProduction ? { stack: err.stack } : {}),
    },
  });
}
export { errorMiddleware };
