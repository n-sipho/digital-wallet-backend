# ==============================================================================
# Multi-Stage Dockerfile for Node.js Application
#
# Best Practice:
# - Stage 1 (Builder): Install full dependencies and compile TypeScript to JS.
# - Stage 2 (Runner): Copy only compiled artifacts and production dependencies.
# - Run as a non-root user (e.g. `node`) for enhanced container security.
# ==============================================================================

# STAGE 1: Build stage
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json tsconfig.json ./
# RUN npm ci
# COPY src/ ./src
# RUN npm run build

# STAGE 2: Production runner
# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# COPY package*.json ./
# RUN npm ci --only=production
# COPY --from=builder /app/dist ./dist
# USER node
# EXPOSE 5000
# CMD ["node", "dist/server.js"]
