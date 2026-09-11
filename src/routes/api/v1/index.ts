import { Router } from "express";
import { urlRouter } from "./url.routes";
import { walletRouter } from "./wallet.routes";
import { onboardingRouter } from "./onboarding.routes";

const router = Router();

// Mount domain routes
// All routes in urlRouter will be prefixed with /urls (e.g. /api/v1/urls/shorten)
router.use("/urls", urlRouter);
router.use("/wallet", walletRouter);

// Onboarding routes
router.use("/onboarding", onboardingRouter);

export { router as v1Router };
