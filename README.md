# Digital Wallet Backend

[![Backend CI](https://github.com/n-sipho/digital-wallet-backend/actions/workflows/backend.yml/badge.svg)](https://github.com/n-sipho/digital-wallet-backend/actions/workflows/backend.yml)

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
1. Install dependencies: `npm install` (or `pnpm install`)
2. Copy environment file: `cp .env.example .env`
3. Run in development mode: `npm run dev`
4. Run tests: `npm test`
