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
import dotenv from "dotenv";
import { z } from "zod";

// Load variables from .env file into process.env
dotenv.config();
// Define the schema with types and default values
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(5000),
  // DATABASE_URL: z
  //   .string()
  //   .url("DATABASE_URL must be a valid connection string"),
  // JWT_SECRET: z
  //   .string()
  //   .min(16, "JWT_SECRET must be at least 16 characters long"),
  
  JWT_EXPIRES_IN: z.string().default("1d"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Validate process.env against schema
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1); // Stop server immediately
  }

  return result.data;
};

// Export a frozen, immutable config object
const env = Object.freeze(parseEnv());

// Export TypeScript type
type Env = z.infer<typeof envSchema>;

export { env, Env };
