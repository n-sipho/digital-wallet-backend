/**
 * @file validate.middleware.ts
 * @description Request schema validation middleware (e.g. using Zod, Joi, or Yup).
 *
 * Best Practices:
 * 1. Validate incoming data before it hits controllers (`req.body`, `req.query`, `req.params`).
 * 2. Sanitize and strip unknown/unexpected properties to prevent mass assignment vulnerabilities.
 * 3. Return HTTP 400 Bad Request with a clear list of validation issues (field name, reason) if validation fails.
 * 4. Ensure validated payloads are strictly typed into downstream controller handlers.
 */

export {};
