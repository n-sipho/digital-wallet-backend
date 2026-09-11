import { v4 as uuidv4 } from "uuid";
import { AppError } from "@/utils/appError";
import { logger } from "@/utils/logger";
import { getOpenPaymentsClient } from "@/utils/open-payment";
import { onboardingRepository } from "@/repositories/onboarding.repository";
import { grantRepository } from "@/repositories/grant.repository";
import {
  OnboardingStatus,
  OnboardingStatusType,
  VALID_TRANSITIONS,
  SESSION_TTL_MS,
} from "@/constants/onboarding";
import {
  OnboardingSession,
  OnboardingStartInput,
  OnboardingStatusResponse,
} from "@/types/onboarding";
import { Grant, PendingGrant } from "@interledger/open-payments";

class OnboardingService {
  // ─────────────────────────────────────────────
  // Step 1: Start onboarding — resolve wallet
  // ─────────────────────────────────────────────
  async start(input: OnboardingStartInput): Promise<OnboardingStatusResponse> {
    const { walletAddressUrl, userId } = input;

    // Guard: prevent duplicate active sessions for the same user
    const existing = await onboardingRepository.findActiveByUserId(userId);
    if (existing) {
      logger.warn({ userId, sessionId: existing.id }, "Active session exists");
      // Return existing session instead of creating a new one
      return this.toResponse(existing);
    }

    // Create the session in PENDING state
    const session: OnboardingSession = {
      id: `onb_${uuidv4()}`,
      userId,
      walletAddressUrl,
      status: OnboardingStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await onboardingRepository.save(session);

    // Resolve the wallet address via Open Payments
    try {
      const client = await getOpenPaymentsClient();
      const wallet = await client.walletAddress.get({ url: walletAddressUrl });

      // Transition: PENDING → WALLET_RESOLVED
      const updated = await this.transitionTo(
        session.id,
        OnboardingStatus.WALLET_RESOLVED,
        { wallet },
      );
      return this.toResponse(updated);
    } catch (error) {
      // Transition: PENDING → FAILED
      await this.transitionTo(session.id, OnboardingStatus.FAILED, {
        failureReason:
          error instanceof Error
            ? error.message
            : "Failed to resolve wallet address",
      });

      throw new AppError(
        `Could not resolve wallet address: ${walletAddressUrl}`,
        422,
      );
    }
  }

  // ─────────────────────────────────────────────
  // Step 2: Request consent — GNAP grant
  // ─────────────────────────────────────────────
  async requestConsent(sessionId: string): Promise<OnboardingStatusResponse> {
    const session = await this.getValidSession(sessionId);

    // Guard: must be in WALLET_RESOLVED state
    if (session.status !== OnboardingStatus.WALLET_RESOLVED) {
      throw new AppError(
        `Cannot request consent: session is in '${session.status}' state. Expected 'WALLET_RESOLVED'.`,
        409,
      );
    }

    const client = await getOpenPaymentsClient();

    // Build the redirect URL with session ID for the callback
    const callbackUrl = `${process.env.HOST}/api/v1/onboarding/callback?session_id=${sessionId}`;
    try {
      const grant = (await client.grant.request(
        { url: session.wallet!.authServer },
        {
          access_token: {
            access: [
              {
                type: "incoming-payment",
                actions: ["create", "read", "list"],
              },
              {
                type: "quote",
                actions: ["create", "read"],
              },
              {
                type: "outgoing-payment",
                actions: ["create", "read", "list"],
                identifier: session.walletAddressUrl,
              },
            ],
          },
          interact: {
            start: ["redirect"],
            finish: {
              method: "redirect",
              uri: callbackUrl,
              nonce: uuidv4(), // unique nonce per grant request
            },
          },
        },
      )) as PendingGrant;

      // Store grant continuation data for the callback
      const updated = await this.transitionTo(
        sessionId,
        OnboardingStatus.CONSENT_PENDING,
        {
          grantContinueToken: grant.continue.access_token.value,
          grantContinueUri: grant.continue.uri,
          redirectUrl: grant.interact.redirect,
        },
      );

      // Also save to grant repository for backward compat
      await grantRepository.savePending(sessionId, grant);

      return this.toResponse(updated);
    } catch (error) {
      await this.transitionTo(sessionId, OnboardingStatus.FAILED, {
        failureReason:
          error instanceof Error ? error.message : "Grant request failed",
      });
      throw new AppError("Failed to request wallet consent", 502);
    }
  }

  // ─────────────────────────────────────────────
  // Step 3: Handle callback — finalize grant
  // ─────────────────────────────────────────────
  async handleCallback(
    sessionId: string,
    interactRef: string,
  ): Promise<OnboardingStatusResponse> {
    const session = await this.getValidSession(sessionId);

    // Guard: must be in CONSENT_PENDING state
    if (session.status !== OnboardingStatus.CONSENT_PENDING) {
      throw new AppError(
        `Cannot finalize: session is in '${session.status}' state. Expected 'CONSENT_PENDING'.`,
        409,
      );
    }

    if (!session.grantContinueToken || !session.grantContinueUri) {
      throw new AppError("Session is missing grant continuation data", 500);
    }

    const client = await getOpenPaymentsClient();

    try {
      const finalizedGrant: Grant = await client.grant.continue(
        {
          accessToken: session.grantContinueToken,
          url: session.grantContinueUri,
        },
        { interact_ref: interactRef },
      );
      // Transition: CONSENT_PENDING → COMPLETED
      const updated = await this.transitionTo(
        sessionId,
        OnboardingStatus.COMPLETED,
        {
          accessToken: finalizedGrant.continue.access_token.value,
          completedAt: new Date(),
          // Clean up sensitive continuation data
          grantContinueToken: undefined,
          grantContinueUri: undefined,
          redirectUrl: undefined,
        },
      );

      // Clean up pending grant
      await grantRepository.deletePending(sessionId);

      // Persist the final access token linked to the user
      await grantRepository.saveFinalToken(
        session.userId,
        finalizedGrant.continue.access_token.value,
      );

      logger.info(
        { sessionId, userId: session.userId },
        "[Onboarding] Wallet linked successfully",
      );

      return this.toResponse(updated);
    } catch (error) {
      await this.transitionTo(sessionId, OnboardingStatus.FAILED, {
        failureReason:
          error instanceof Error ? error.message : "Grant finalization failed",
      });
      throw new AppError("Failed to finalize wallet consent", 502);
    }
  }

  // ─────────────────────────────────────────────
  // Status check
  // ─────────────────────────────────────────────
  async getStatus(sessionId: string): Promise<OnboardingStatusResponse> {
    const session = await this.getValidSession(sessionId);
    return this.toResponse(session);
  }

  // ─────────────────────────────────────────────
  // State Machine: enforce valid transitions
  // ─────────────────────────────────────────────
  private async transitionTo(
    sessionId: string,
    newStatus: OnboardingStatusType,
    data?: Partial<OnboardingSession>,
  ): Promise<OnboardingSession> {
    const session = await onboardingRepository.findById(sessionId);
    if (!session) throw new AppError("Session not found", 404);

    const allowed = VALID_TRANSITIONS[session.status];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid transition: ${session.status} → ${newStatus}`,
        409,
      );
    }

    logger.info(
      { sessionId, from: session.status, to: newStatus },
      "[Onboarding] State transition",
    );

    return onboardingRepository.update(sessionId, {
      ...data,
      status: newStatus,
    });
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  private async getValidSession(sessionId: string): Promise<OnboardingSession> {
    const session = await onboardingRepository.findById(sessionId);

    if (!session) {
      throw new AppError(`Onboarding session '${sessionId}' not found`, 404);
    }

    // Check TTL expiry
    const age = Date.now() - session.createdAt.getTime();
    if (
      age > SESSION_TTL_MS &&
      !["COMPLETED", "FAILED", "EXPIRED"].includes(session.status)
    ) {
      await this.transitionTo(sessionId, OnboardingStatus.EXPIRED);
      throw new AppError("Onboarding session has expired", 410);
    }

    return session;
  }

  private toResponse(session: OnboardingSession): OnboardingStatusResponse {
    return {
      sessionId: session.id,
      status: session.status,
      wallet: session.wallet,
      redirectUrl: session.redirectUrl,
      linkedAt: session.completedAt,
    };
  }
}

export const onboardingService = new OnboardingService();
