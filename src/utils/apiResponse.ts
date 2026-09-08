/**
 * @file apiResponse.ts
 * @description Standardized API response wrappers.
 *
 * Best Practices:
 * 1. Ensure all API responses adhere to a consistent JSON envelope, for example:
 *    Success: `{ success: true, data: T, meta?: { page, limit, total } }`
 *    Failure: `{ success: false, error: { message, code, details? } }`
 * 2. Provide helper functions: `sendSuccess(res, data, statusCode, meta)`, `sendError(res, message, statusCode, details)`.
 * 3. Consistent response structures simplify frontend integration and error handling.
 */

import { Response } from 'express';

// ──────────────────────────────────────────────
// Response envelope types
// ──────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
    stack?: string;
  };
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// ──────────────────────────────────────────────
// Helper functions
// ──────────────────────────────────────────────

/**
 * Send a standardized success response.
 *
 * @param res     - Express Response object
 * @param data    - Payload to include in `data`
 * @param statusCode - HTTP status (default 200)
 * @param meta    - Optional pagination metadata
 *
 * @example
 * sendSuccess(res, { id: '1', name: 'Wallet A' });
 * sendSuccess(res, wallets, 200, { page: 1, limit: 20, total: 100, totalPages: 5 });
 * sendSuccess(res, newWallet, 201);
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): void {
  const body: SuccessResponse<T> = { success: true, data };

  if (meta) {
    body.meta = meta;
  }

  res.status(statusCode).json(body);
}

/**
 * Send a standardized error response.
 *
 * @param res        - Express Response object
 * @param message    - Human-readable error message
 * @param statusCode - HTTP status (default 500)
 * @param details    - Optional validation errors or additional context
 *
 * @example
 * sendError(res, 'Wallet not found', 404);
 * sendError(res, 'Validation failed', 400, { field: ['must be a valid URL'] });
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown,
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  const body: ErrorResponse = {
    success: false,
    error: {
      message: isProduction && statusCode >= 500 ? 'Internal Server Error' : message,
      statusCode,
      ...(details ? { details } : {}),
    },
  };

  res.status(statusCode).json(body);
}

/**
 * Send a 204 No Content response (e.g. after a successful DELETE).
 *
 * @param res - Express Response object
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}
