# Digital Wallet Backend

[![Backend CI](https://github.com/n-sipho/digital-wallet-backend/actions/workflows/backend.yml/badge.svg)](https://github.com/n-sipho/digital-wallet-backend/actions/workflows/backend.yml) [![Coverage Status](https://coveralls.io/repos/github/n-sipho/digital-wallet-backend/badge.svg?branch=main)](https://coveralls.io/github/n-sipho/digital-wallet-backend?branch=main)
<!--
==============================================================================
README.md Documentation
Best Practice:
- Provide clear onboarding instructions, architecture decisions, and scripts.
- Document environment variables and setup steps for team members.
==============================================================================
-->

## Architecture Overview
This backend follows a layered modular architecture:
- **Routes**: Handle routing, URL mapping, and apply relevant middleware.
- **Controllers**: Handle HTTP request validation, status codes, and delegate to services.
- **Services**: Contain pure business logic and orchestrate domain rules.
- **Repositories / Models**: Manage database access, queries, and data persistence.
- **Middlewares**: Process cross-cutting concerns (auth, logging, rate limiting, error handling).

## Getting Started
1. Install dependencies: `pnpm install`
2. Copy environment file: `cp .env.example .env`
3. Run in development mode: `pnpm dev`
4. Run tests: `pnpm test`

## Docker development

Start the API and its database and Redis dependencies with Watch enabled:

```bash
pnpm localenv:dev
```

Keep this command running while editing. The API is available at
`http://localhost:9001`, with a health endpoint at `/health`.

Compose syncs changes under `src/`, to `tsconfig.json`, and to `.env`, then
restarts the API to load them. Initial sync updates files when Watch starts.
Changes to `package.json`, `pnpm-lock.yaml`, or `Dockerfile.dev` rebuild the API
image. The startup command also builds the image to include changes made while
Watch was stopped.

The API briefly disconnects during a restart; wait for the new server startup
message before retrying a request. `tsx watch` remains active inside the container
to support recovery after source errors, while Compose explicitly triggers the
restart after syncing. Plain `up -d` does not enable Watch.

After editing Compose configuration (including port mappings), stop this command
and run it again so Compose applies the new configuration. Changing a database
schema still requires the appropriate migration.
