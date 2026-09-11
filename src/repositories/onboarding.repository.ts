import { OnboardingSession } from "@/types/onboarding";
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
const sessionStore = new Map<string, OnboardingSession>();

/** Index by userId for "get my sessions" lookups */
const userSessionIndex = new Map<string, Set<string>>();

export class OnboardingRepository {
  async save(session: OnboardingSession): Promise<void> {
    sessionStore.set(session.id, { ...session });

    // Maintain user → sessions index
    if (!userSessionIndex.has(session.userId)) {
      userSessionIndex.set(session.userId, new Set());
    }
    userSessionIndex.get(session.userId)!.add(session.id);

    logger.info(
      { sessionId: session.id, status: session.status },
      "[Onboarding] Session saved",
    );
  }
  async findById(sessionId: string): Promise<OnboardingSession | null> {
    return sessionStore.get(sessionId) ?? null;
  }

  async findByUserId(userId: string): Promise<OnboardingSession[]> {
    const sessionIds = userSessionIndex.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map((id) => sessionStore.get(id))
      .filter(Boolean) as OnboardingSession[];
  }
  async findActiveByUserId(userId: string): Promise<OnboardingSession | null> {
    const sessions = await this.findByUserId(userId);
    // Return the most recent non-terminal session
    return (
      sessions
        .filter((s) => !["COMPLETED", "FAILED", "EXPIRED"].includes(s.status))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] ??
      null
    );
  }

  async update(
    sessionId: string,
    updates: Partial<OnboardingSession>,
  ): Promise<OnboardingSession> {
    const existing = sessionStore.get(sessionId);
    if (!existing) throw new Error(`Session ${sessionId} not found`);

    const updated: OnboardingSession = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    sessionStore.set(sessionId, updated);

    logger.info(
      { sessionId, status: updated.status },
      "[Onboarding] Session updated",
    );
    return updated;
  }

  async delete(sessionId: string): Promise<void> {
    const session = sessionStore.get(sessionId);
    if (session) {
      userSessionIndex.get(session.userId)?.delete(sessionId);
      sessionStore.delete(sessionId);
    }
  }
}

export const onboardingRepository = new OnboardingRepository();
