FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN npm ci

# Copy source code
COPY packages/core/ ./packages/core/
COPY packages/api/ ./packages/api/
COPY packages/web/ ./packages/web/
COPY tsconfig.base.json ./
COPY turbo.json ./

# Build packages
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built packages
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/web/.next ./packages/web/.next
COPY --from=builder /app/packages/web/public ./packages/web/public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose ports
EXPOSE 8080
EXPOSE 3000

# Start API server
CMD ["node", "packages/api/dist/index.js"]
