import { Router, Request, Response } from "express";
import walletController from "@/controllers/wallet.controller";
const router = Router();

// Route: GET /api/v1/urls/shorten?url=https://...
router.post("/verify", walletController.verifyWalletAddress);
router.post("/request/grant", walletController.requestGrantController);
router.get("/finalize/grant", walletController.finalizeGrantController);

/**
 * GET /health (or /health/live)
 * Liveness probe - lightweight check to confirm the HTTP process is responsive.
 */
router.get("/redirect", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "Test route for grant request redirect!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export { router as walletRouter };
