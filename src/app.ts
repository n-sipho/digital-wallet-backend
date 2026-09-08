/**
 * @file app.ts
 * @description Express / Fastify application setup and middleware registration.
 *
 * Best Practices:
 * 1. Initialize the app instance (e.g. `const app = express()`).
 * 2. Attach security headers early using libraries like `helmet`.
 * 3. Configure CORS policies with restricted origins in production.
 * 4. Parse incoming payloads (`express.json()`, `express.urlencoded()`).
 * 5. Attach request logging and rate limiting middlewares.
 * 6. Mount primary route entry points (e.g. `/api/v1`).
 * 7. Mount the centralized 404 handler and error-handling middleware last.
 * 8. Export the app instance without calling `.listen()`.
 */

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
// import helmet from "helmet";
import { router } from "./routes/index";
import { errorMiddleware } from "./middlewares/error.middleware";
import { AppError } from "./utils/appError";
import { httpLogger } from "./middlewares/logger.middleware";

export const app: Application = express();
 app.use(httpLogger);
// Middlewares
// app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use("/", router);

// Catch 404 (Route Not Found) and pass to error handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

// export { app };
