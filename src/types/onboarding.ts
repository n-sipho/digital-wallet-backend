import { OnboardingStatusType } from "@/constants/onboarding";
import { WalletAddress } from "@interledger/open-payments";

/** Input DTO — what the client sends to start onboarding */
export interface OnboardingStartInput {
  walletAddressUrl: string;
  userId: string; // from auth middleware after signup
}

/** The persisted onboarding session */
export interface OnboardingSession {
  id: string;
  userId: string;
  walletAddressUrl: string;
  status: OnboardingStatusType;

  /** Resolved wallet metadata (populated after WALLET_RESOLVED) */
  wallet?: WalletAddress;

  /** GNAP grant continuation data (populated during CONSENT_PENDING) */
  grantContinueToken?: string;
  grantContinueUri?: string;
  redirectUrl?: string;

  /** Finalized access token (populated after COMPLETED) */
  accessToken?: string;

  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  /** Error info if FAILED */
  failureReason?: string;
}


export interface OnboardingStatusResponse {
  sessionId: string;
  status: OnboardingStatusType;
  wallet?: WalletAddress;
  redirectUrl?: string;
  linkedAt?: Date;
}
