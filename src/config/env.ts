/**
 * @file env.ts
 * @description Environment variable parsing, validation, and type-safe exports.
 *
 * Best Practices:
 * 1. Validate `process.env` at startup using a schema validator (e.g. `zod` or `envalid`).
 * 2. Fail fast: crash immediately with a clear message if required environment variables are missing.
 * 3. Provide sensible defaults for local development where appropriate.
 * 4. Export a frozen, strongly-typed `config` object rather than accessing `process.env` arbitrarily across the codebase.
 */

export {};
