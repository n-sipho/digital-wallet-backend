/**
 * @file index.ts (routes)
 * @description Top-level router aggregation and health check endpoints.
 *
 * Best Practices:
 * 1. Define liveness/readiness health check routes (e.g. `/health`, `/ready`) that return 200 OK without auth.
 * 2. Mount versioned API sub-routers (e.g. `router.use('/api/v1', v1Router)`).
 * 3. Keep route files focused on HTTP verb mappings, middleware assignment, and controller bindings.
 */

export {};
