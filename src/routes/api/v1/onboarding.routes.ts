import { Router } from "express";
import { onboardingController } from "@/controllers/onboarding.controller";

const router = Router();

// Step 1: Start onboarding — resolve wallet address
router.post("/start", onboardingController.startOnboarding);

// Step 2: Request user consent — returns redirect URL
router.post("/:sessionId/consent", onboardingController.requestConsent);

// Step 3: GNAP callback — called by auth server after user approves
router.get("/callback", onboardingController.handleCallback);

// Status: Poll session state from the frontend
router.get("/:sessionId/status", onboardingController.getStatus);

router.get("/onboarding/success", onboardingController.getStatus);


export { router as onboardingRouter };
