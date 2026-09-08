/**
 * @file app.ts
 * @description Express / Fastify application setup and middleware registration.
 *
 * Best Practices:
 * 1. Initialize the app instance (e.g. `const app = express()`).
 * 2. Attach security headers early using libraries like `helmet`.
 * 3. Configure CORS policies with restricted origins in production.
 * 4. Parse incoming payloads (`express.json()`, `express.urlencoded()`).
 * 5. Attach request logging and rate limiting middlewares.
 * 6. Mount primary route entry points (e.g. `/api/v1`).
 * 7. Mount the centralized 404 handler and error-handling middleware last.
 * 8. Export the app instance without calling `.listen()`.
 */

export {};
