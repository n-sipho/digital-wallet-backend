/**
 * @file index.ts (validators)
 * @description Request validation schemas (e.g. Zod, Joi, or Yup).
 *
 * Best Practices:
 * 1. Define distinct validation schemas for incoming requests (body, query params, path params).
 * 2. Infer TypeScript types directly from your schemas (e.g. `z.infer<typeof CreateRewardSchema>`).
 * 3. Keep validation rules close to your route definitions or barrel-exported here by domain.
 */

export {};
