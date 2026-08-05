# Pulsyn CDC Engine — Docker Image
# Lightweight image for running CDC replication

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/cli/package.json ./packages/cli/

# Install dependencies
RUN npm ci --workspace=@pulsyn/core --workspace=@pulsyn/cli

# Copy source code
COPY packages/core ./packages/core
COPY packages/cli ./packages/cli
COPY tsconfig.base.json ./

# Build
RUN npm run build --workspace=@pulsyn/core
RUN npm run build --workspace=@pulsyn/cli

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/cli/dist ./packages/cli/dist
COPY --from=builder /app/packages/cli/package.json ./packages/cli/

# Copy entrypoint
COPY scripts/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

# Run
ENTRYPOINT ["./entrypoint.sh"]
