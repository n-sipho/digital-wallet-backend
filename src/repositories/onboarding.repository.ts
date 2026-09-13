import { redisClient } from "@/config/redis";
import { OnboardingSession } from "@/types/onboarding";
import { AppError } from "@/utils/appError";
import { logger } from "@/utils/logger";

/**
 * Persistence layer for onboarding sessions.
 *
 * Currently uses an in-memory Map (same pattern as your existing
 * GrantRepository). Swap with a real DB query when you dockerize
 * with PostgreSQL.
 *
 * When you move to a real DB, this becomes:
 *   - A Knex/Drizzle/Prisma query file
 *   - The interface stays the same (no service changes needed)
 */
const SESSION_PREFIX = process.env.SESSION_PREFIX;
const USER_ACTIVE_PREFIX = process.env.USER_ACTIVE_PREFIX;
const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_MS) * 60; // example 15 minutes

const sessionStore = new Map<string, OnboardingSession>();

export class OnboardingRepository {
  private sessionKey(id: string): string {
    return `${SESSION_PREFIX}${id}`;
  }

  private userActiveKey(userId: string): string {
    return `${USER_ACTIVE_PREFIX}${userId}:active`;
  }
  /**
   * Saves a new session and sets the TTL.
   */
  async save(session: OnboardingSession): Promise<void> {
    const key = this.sessionKey(session.id);
    const userKey = this.userActiveKey(session.userId);

    const serialized = JSON.stringify(session);

    await redisClient
      .multi()
      .set(userKey, session.id, "EX", SESSION_TTL_SECONDS)
      .set(key, serialized, "EX", SESSION_TTL_SECONDS)
      .exec();

    logger.info(
      { sessionId: session.id, status: session.status },
      "[Redis] Onboarding session saved",
    );
  }
  async findById(sessionId: string): Promise<OnboardingSession | null> {
    const key = this.sessionKey(sessionId);
    const serialized = await redisClient.get(key);
    if (serialized != null) {
      const deserialized = this.deserialize(serialized);
      return deserialized;
    }

    return null;
  }

  // async findByUserId(userId: string): Promise<OnboardingSession[]> {
  //   const userKey = this.userActiveKey(userId);
  //   const sessionIds = await redisClient.get(userKey);
  //   console.log("session ids:", sessionIds);
  //   if (!sessionIds) return [];

  //   return Array.from("")
  //     .map((id) => redisClient.get(``))
  //     .filter(Boolean) as OnboardingSession[];
  // }

  async findActiveByUserId(userId: string): Promise<OnboardingSession | null> {
    const userKey = this.userActiveKey(userId);
    const sessionId = await redisClient.get(userKey);

    if (sessionId != null) {
      const key = this.sessionKey(sessionId);
      const session = await redisClient.get(key);
      if (session != null) {
        const deserialized = this.deserialize(session);
        return deserialized;
      }
    }

    return null;
  }

  async update(
    sessionId: string,
    updates: Partial<OnboardingSession>,
  ): Promise<OnboardingSession> {
    const key = this.sessionKey(sessionId);
    const existing = await redisClient.get(key);

    if (!existing) throw new AppError(`Session ${sessionId} not found`);

    const deserialized = this.deserialize(existing);

    const updated: OnboardingSession = {
      ...deserialized,
      ...updates,
      updatedAt: new Date(),
    };

    const serialized = JSON.stringify(updated);

    await redisClient.set(key, serialized, "KEEPTTL").then(
      (onfulfilled) => {
        logger.info(
          { sessionId, status: updated.status },
          "[Onboarding] Session updated",
        );
      },
      (onrejected) => {
        logger.warn(
          { sessionId, status: updated.status },
          "[Onboarding] Session update rejected",
        );
        throw new AppError(`Session update rejected`);
      },
    );

    return updated;
  }

  async delete(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) return;

    await redisClient
      .multi()
      .del(this.sessionKey(sessionId))
      .del(this.userActiveKey(session.userId))
      .exec();
  }

  /**
   * Helper to parse dates correctly from JSON string.
   */
  private deserialize(raw: string): OnboardingSession {
    let data = JSON.parse(raw);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  }
}

export const onboardingRepository = new OnboardingRepository();
