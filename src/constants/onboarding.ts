/**
 * Onboarding session lifecycle states.
 * Enforces valid transitions via the state machine in OnboardingService.
 */
export const OnboardingStatus = {
  /** Session created, wallet not yet resolved */
  PENDING: "PENDING",
  /** Wallet address resolved successfully */
  WALLET_RESOLVED: "WALLET_RESOLVED",
  /** GNAP grant requested, waiting for user consent */
  CONSENT_PENDING: "CONSENT_PENDING",
  /** User approved consent, grant finalized */
  COMPLETED: "COMPLETED",
  /** User denied consent or flow expired */
  FAILED: "FAILED",
  /** Session expired (configurable TTL) */
  EXPIRED: "EXPIRED",
} as const;

export type OnboardingStatusType =
  (typeof OnboardingStatus)[keyof typeof OnboardingStatus];

/**
 * Valid state transitions — the state machine definition.
 * Used by OnboardingService.transitionTo() to prevent invalid jumps.
 *
 *   PENDING → WALLET_RESOLVED → CONSENT_PENDING → COMPLETED
 *                                       ↓
 *                                     FAILED
 *   (any state) → EXPIRED  (via TTL check)
 */
export const VALID_TRANSITIONS: Record<
  OnboardingStatusType,
  OnboardingStatusType[]
> = {
  PENDING: ["WALLET_RESOLVED", "FAILED", "EXPIRED"],
  WALLET_RESOLVED: ["CONSENT_PENDING", "FAILED", "EXPIRED"],
  CONSENT_PENDING: ["COMPLETED", "FAILED", "EXPIRED"],
  COMPLETED: [], // terminal
  FAILED: ["PENDING"], // allow retry from failed
  EXPIRED: [], // terminal
};

/** How long an onboarding session stays valid (15 minutes) */
const sessionMinutes = Number(process.env.SESSION_TTL_MS) || 15;
export const SESSION_TTL_MS = sessionMinutes * 60 * 1000;
