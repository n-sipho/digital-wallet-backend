import { z } from 'zod';

/**
 * Validator schema for shortening a URL via GET query parameter.
 * Example query: ?url=https://example.com/very/long/path
 */
export const shortenUrlQuerySchema = z.object({
  url: z.url('Invalid URL format. Must include protocol, e.g. https://example.com'),
});

export type ShortenUrlQuery = z.infer<typeof shortenUrlQuerySchema>;
