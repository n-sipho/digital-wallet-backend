import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { sendSuccess } from "../utils/apiResponse";
import { walletService } from "@/services/wallet.service";
import { logger } from "@/utils/logger";

/**
 * GET /api/v1/acounts/wallets/
 * Controller to resolves an Open Payments wallet address.
 */
async function getWalletAddressController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { walletAddressUrl } = req.body;

    if (!walletAddressUrl) {
      throw new AppError("Wallet Address is required", 400);
    }
    logger.info(`Wallet Address URL: ${walletAddressUrl}`);
    // TODO: Implement wallet retrieval logic (e.g., via walletService)
    // const wallet = await walletService.getById(id);
    const wallet = await walletService.getWalletAddress(walletAddressUrl);

    sendSuccess(res, { wallet });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/wallets/:id/balance
 * Controller to retrieve balance information for a specific wallet.
 */
async function getWalletBalanceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Wallet ID is required", 400);
    }

    // TODO: Implement balance retrieval logic
    // const balance = await walletService.getBalance(id);

    sendSuccess(res, {
      walletId: id,
      // TODO: Map balance response
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/wallets
 * Controller to create or register a new wallet.
 */
async function createWalletController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // TODO: Validate request body (e.g. createWalletSchema.safeParse(req.body))
    // const { walletAddress, accountId } = req.body;

    // TODO: Delegate to service layer
    // const newWallet = await walletService.create(req.body);

    sendSuccess(
      res,
      {
        // TODO: Return created wallet entity
      },
      201,
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/wallets/:id/transactions
 * Controller to list transaction history or payments for a wallet.
 */
async function getWalletTransactionsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    // const { limit, cursor } = req.query;

    if (!id) {
      throw new AppError("Wallet ID is required", 400);
    }

    // TODO: Delegate to service layer
    // const transactions = await walletService.getTransactions(id, { limit, cursor });

    sendSuccess(res, {
      walletId: id,
      transactions: [],
      // TODO: Map transactions and pagination details
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/wallets/:id/transfer
 * Controller to initiate a fund transfer or outgoing payment from a wallet.
 */
async function transferFundsController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError("Wallet ID is required", 400);
    }

    // TODO: Validate transfer payload (e.g. transferSchema.safeParse(req.body))
    // const { destination, amount, assetCode } = req.body;

    // TODO: Delegate to service layer
    // const paymentResult = await walletService.transfer(id, req.body);

    sendSuccess(res, {
      // TODO: Return transaction / payment receipt
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getWallet: getWalletAddressController,
  getBalance: getWalletBalanceController,
  createWallet: createWalletController,
  getTransactions: getWalletTransactionsController,
  transferFunds: transferFundsController,
};
