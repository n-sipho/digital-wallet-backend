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

export {};
