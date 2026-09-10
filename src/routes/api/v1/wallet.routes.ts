import { Router } from "express";
import walletController from "@/controllers/wallet.controller";
const router = Router();

// Route: GET /api/v1/urls/shorten?url=https://...
router.post("/verify", walletController.verifyWalletAddress);

export { router as walletRouter };
