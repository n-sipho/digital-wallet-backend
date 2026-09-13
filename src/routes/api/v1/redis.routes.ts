import { redisClient } from "@/config/redis";
import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", async (_req: Request, res: Response) => {
  try {
    const redisPong = await redisClient.ping();
    const isRedisReady = redisPong === "PONG";

    res.status(isRedisReady ? 200 : 503).json({
      status: isRedisReady ? "ready" : "unavailable",
      services: {
        redis: isRedisReady ? "up" : "down",
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "unavailable",
      services: { redis: "down" },
    });
  }
});

export { router as redisRouter };
