/**
 * @file server.ts
 * @description Server entry point and process lifecycle management.
 *
 * Best Practices:
 * 1. Keep server bootstrap separate from application configuration (`app.ts`) to enable integration testing without starting network listeners.
 * 2. Connect to databases, caches, and background message queues before listening on the port.
 * 3. Handle process signals (SIGTERM, SIGINT) for graceful shutdown (finish in-flight HTTP requests, close open sockets and database connections).
 * 4. Catch `uncaughtException` and `unhandledRejection` to log critical failures before exiting cleanly.
 */

export {};
