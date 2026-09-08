import { Router } from "express";
import walletController from "@/controllers/wallet.controller";
const router = Router();

// Route: GET /api/v1/urls/shorten?url=https://...
router.post("/wallet", walletController.getWallet);

export { router as walletRouter };
