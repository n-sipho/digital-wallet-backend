import Redis from "ioredis";
import { env } from "./env";
import { logger } from "@/utils/logger";

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true, // Connect explicitly during startup
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn({ times, delay }, "[Redis] Reconnecting...");
    return delay;
  },
});

redisClient.on("connect", () => {
  logger.info("[Redis] someone connected!");
});

redisClient.on("error", (err) => {
  logger.error({ err }, "[Redis] Connection error");
});

export async function connectRedis(): Promise<void> {
  if (redisClient.status === "wait") {
    await redisClient.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient.status !== "end") {
    await redisClient.quit();
    logger.info("[Redis] Disconnected cleanly");
  }
}
