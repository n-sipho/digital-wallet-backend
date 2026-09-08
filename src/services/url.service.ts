import crypto from 'node:crypto';

export interface ShortenedUrlResult {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
}

// In-memory data store for this sample (swap with database repository in production)
const urlStore = new Map<string, string>();

export class UrlService {
  /**
   * Generates a unique short code and persists the mapping.
   */
  public shorten(originalUrl: string): ShortenedUrlResult {
    // Generate a clean 6-character random alphanumeric string
    const shortCode = crypto.randomBytes(4).toString('base64url').slice(0, 6);

    // Save to store
    urlStore.set(shortCode, originalUrl);

    return {
      shortCode,
      originalUrl,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves the original URL for a given short code.
   */
  public getOriginalUrl(shortCode: string): string | undefined {
    return urlStore.get(shortCode);
  }
}

// Export a singleton instance
export const urlService = new UrlService();
