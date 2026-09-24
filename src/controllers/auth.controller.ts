import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";
import { sendSuccess } from "@/utils/apiResponse";
import { onboardingService } from "@/services/onboarding.service";
import {
    startOnboardingSchema,
    callbackQuerySchema,
} from "@/validators/onboarding.validator";
import { authLoginSchema, authRegisterSchema } from "@/validators/auth.validator";
import { authService } from "@/services/auth.service";

class AuthController {
    /**
     * POST /api/v1/auth/register
     * Registers a new user account
     */
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = authRegisterSchema.safeParse(req.body);
            if (!parsed.success) {
                const msg = parsed.error.issues.map((i) => i.message).join(", ");
                // parsed.treeifyError(err)
                throw new AppError(msg, 400, parsed.error.flatten().fieldErrors);
            }

            const registeredUser = await authService.register(parsed.data);

            sendSuccess(res, registeredUser);
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = authLoginSchema.safeParse(req.body);
            if (!parsed.success) {
                const msg = parsed.error.issues.map((i) => i.message).join(", ");
                throw new AppError(msg, 400, parsed.error.flatten().fieldErrors);
            }

            const loggedInUser = await authService.login(parsed.data);

            sendSuccess(res, loggedInUser);
        } catch (error) {
            next(error);
        }
    };

}

export const authController = new AuthController();
