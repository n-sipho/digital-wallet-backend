import { Router, Request, Response } from "express";
import { v1Router } from "./api/v1/index";
// import { checkDatabaseHealth } from '../config/database.js';

export const router = Router();

/**
 * API Version 1 Routes
 * Mounts all /api/v1 endpoints (e.g. /api/v1/urls/shorten)
 */
router.use("/api/v1", v1Router);

/**
 * GET /health (or /health/live)
 * Liveness probe - lightweight check to confirm the HTTP process is responsive.
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /health/ready
 * Readiness probe - checks if external dependencies (database, Redis, etc.) are up.
 */
router.get("/health/ready", async (_req: Request, res: Response) => {
  try {
    // Check downstream dependencies:
    // await checkDatabaseHealth();

    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      services: {
        database: "up",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unavailable",
      timestamp: new Date().toISOString(),
      services: {
        database: "down",
      },
      error: error instanceof Error ? error.message : "Dependency failure",
    });
  }
});

