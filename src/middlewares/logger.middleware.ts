/**
 * @file logger.middleware.ts
 * @description HTTP request/response logging middleware.
 *
 * Best Practices:
 * 1. Log essential request details: HTTP method, URL path, status code, response time, and user-agent.
 * 2. Attach a unique request ID (correlation ID via `X-Request-Id` header) to trace requests through log streams.
 * 3. Never log sensitive information such as passwords, auth tokens, or payment card numbers (sanitize/redact fields).
 * 4. Leverage production-ready logging libraries like `pino-http` or `morgan`.
 */

export {};
