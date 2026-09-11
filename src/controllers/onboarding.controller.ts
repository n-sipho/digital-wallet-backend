import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";
import { sendSuccess } from "@/utils/apiResponse";
import { onboardingService } from "@/services/onboarding.service";
import {
  startOnboardingSchema,
  callbackQuerySchema,
} from "@/validators/onboarding.validator";

class OnboardingController {
  /**
   * POST /api/v1/onboarding/start
   * Begins the onboarding flow: creates session and resolves wallet.
   */
  startOnboarding = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // 1. Validate input
      const parsed = startOnboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join(", ");
        throw new AppError(msg, 400, parsed.error.flatten().fieldErrors);
      }

      // 2. Extract userId from auth (placeholder until auth middleware is wired)
      const userId = (req as any).userId ?? "anonymous";

      // 3. Delegate to service
      const result = await onboardingService.start({
        walletAddressUrl: parsed.data.walletAddressUrl,
        userId,
      });

      // 4. Respond
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  };
  /**
   * POST /api/v1/onboarding/:sessionId/consent
   * Requests GNAP grant and returns the redirect URL for user consent.
   */
  requestConsent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sessionId = req.params.sessionId as string;
      if (!sessionId) throw new AppError("sessionId is required", 400);

      const result = await onboardingService.requestConsent(sessionId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/onboarding/callback
   * OAuth/GNAP callback — finalizes the grant after user consent.
   * Redirects the user to the frontend success/failure page.
   */
  handleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = callbackQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const msg = parsed.error.issues.map((i) => i.message).join(", ");
        throw new AppError(msg, 400);
      }

      const { session_id, interact_ref } = parsed.data;

      const result = await onboardingService.handleCallback(
        session_id,
        interact_ref,
      );

      // Redirect to frontend with success status
      const host = process.env.HOST;
      res.redirect(
        302,
        `${host}/api/v1/onboarding/success?session_id=${result.sessionId}`,
      );
    } catch (error) {
      // On failure, redirect to frontend error page
      const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
      const message =
        error instanceof AppError ? error.message : "Unknown error";
      res.redirect(
        302,
        `${frontendUrl}/onboarding/error?reason=${encodeURIComponent(message)}`,
      );
    }
  };

  /**
   * GET /api/v1/onboarding/:sessionId/status
   * Polls the current onboarding session status.
   */
  getStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sessionId = req.params.sessionId as string;
      if (!sessionId) throw new AppError("sessionId is required", 400);

      const result = await onboardingService.getStatus(sessionId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

export const onboardingController = new OnboardingController();
