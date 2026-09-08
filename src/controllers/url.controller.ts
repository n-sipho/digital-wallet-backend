import { Request, Response, NextFunction } from 'express';
import { urlService } from '../services/url.service';
import { shortenUrlQuerySchema } from '../validators/url.validator';
import { AppError } from '../utils/appError';
import { sendSuccess } from '../utils/apiResponse';

/**
 * GET /api/v1/urls/shorten?url=https://...
 * Controller handling URL shortening requests.
 */
export async function shortenUrlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Validate query parameters
    const parseResult = shortenUrlQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues.map((i) => i.message).join(', ');
      throw new AppError(errorMessage, 400, parseResult.error.flatten().fieldErrors);
    }

    const { url } = parseResult.data;

    // 2. Delegate to service layer
    const result = urlService.shorten(url);

    // 3. Format response (including absolute short URL)
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol;
    const shortUrl = `${protocol}://${host}/api/v1/urls/${result.shortCode}`;

    sendSuccess(res, {
      ...result,
      shortUrl,
    });
  } catch (error) {
    // Pass errors down to centralized error middleware
    next(error);
  }
}

/**
 * GET /api/v1/urls/:code
 * Controller that redirects to the original destination URL.
 */
export async function resolveUrlController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawCode = req.params.code;
    const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;

    if (!code) {
      throw new AppError('Short code is required', 400);
    }

    const originalUrl = urlService.getOriginalUrl(code);

    if (!originalUrl) {
      throw new AppError(`Shortened URL with code '${code}' was not found`, 404);
    }

    // Redirect to original destination
    res.redirect(302, originalUrl);
  } catch (error) {
    next(error);
  }
}
