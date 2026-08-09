# Pulsyn Replication Race — Competition Container
# Each competitor gets an isolated container with Pulsyn CLI, source DB, and target DB access.

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency resolution
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/cli/package.json ./packages/cli/
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/core/ ./packages/core/
COPY packages/cli/ ./packages/cli/
COPY tsconfig.base.json ./
COPY turbo.json ./

# Build core and CLI
RUN npm run build --workspace=@pulsyn/core --workspace=@pulsyn/cli 2>/dev/null || npx turbo run build --filter=@pulsyn/core --filter=@pulsyn/cli

# ---------------------------------------------------------------------------
# Production image
# ---------------------------------------------------------------------------
FROM node:20-alpine

RUN apk add --no-cache bash postgresql-client jq curl

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/cli/dist ./packages/cli/dist
COPY --from=builder /app/packages/cli/package.json ./packages/cli/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.base.json ./

# Copy CLI binary and make executable
RUN npm link --workspace=@pulsyn/cli 2>/dev/null || true

# Copy competition scripts
COPY docker/competition/scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh

# Competition environment variables (overridden by docker-compose)
ENV COMPETITION_RUN_ID=""
ENV COMPETITION_COMPETITOR_ID=""
ENV COMPETITION_SOURCE_HOST=""
ENV COMPETITION_SOURCE_PORT="5432"
ENV COMPETITION_SOURCE_DB=""
ENV COMPETITION_SOURCE_USER=""
ENV COMPETITION_SOURCE_PASSWORD=""
ENV COMPETITION_TARGET_HOST=""
ENV COMPETITION_TARGET_PORT="5432"
ENV COMPETITION_TARGET_DB=""
ENV COMPETITION_TARGET_USER=""
ENV COMPETITION_TARGET_PASSWORD=""
ENV COMPETITION_TARGET_ENGINE="postgresql"
ENV COMPETITION_DURATION_SECONDS="300"
ENV COMPETITION_BATCH_SIZE="1000"
ENV COMPETITION_TOTAL_ROWS="100000"
ENV COMPETITION_RESULTS_DIR="/results"

VOLUME ["/results"]

ENTRYPOINT ["/app/scripts/run-benchmark.sh"]
