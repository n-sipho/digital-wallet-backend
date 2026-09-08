/**
 * @file index.ts (controllers)
 * @description Controller barrel export and HTTP request orchestrator.
 *
 * Best Practices:
 * 1. Keep controllers thin: extract inputs (`req.body`, `req.params`, `req.query`), call the service layer, and format the HTTP response.
 * 2. Never place core business rules, direct SQL queries, or database logic in controllers.
 * 3. Use an async error-handling wrapper or standard Promise handling so errors flow seamlessly into the centralized error middleware.
 * 4. Return appropriate HTTP status codes (200, 201, 204, etc.) via standardized response helpers.
 */

export {};
