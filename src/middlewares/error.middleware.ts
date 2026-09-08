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

export {};
