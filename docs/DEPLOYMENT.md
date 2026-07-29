# Pulsyn Deployment Guide

## Overview

Pulsyn is deployed on Vercel with the following architecture:
- **Frontend**: Next.js 14 (packages/web)
- **Backend**: Express API (packages/api)
- **Database**: PostgreSQL + MySQL (Docker or cloud)
- **CDC Engine**: TypeScript (packages/core)

## Vercel Deployment

### Prerequisites

1. Vercel CLI installed: `npm i -g vercel`
2. Vercel account linked: `vercel login`
3. Environment variables configured

### Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/pulsyn

# API
PORT=8080
PULSYN_API_KEY=your-api-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Frontend
FRONTEND_URL=https://pulsynai.com
```

### Deploy

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls
```

### Vercel Configuration

The `vercel.json` configures the deployment:

```json
{
  "framework": "nextjs",
  "buildCommand": "npx turbo build --filter=@pulsyn/web...",
  "outputDirectory": "packages/web/.next",
  "installCommand": "npm ci"
}
```

## Docker Deployment

### Production Docker Compose

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop all services
docker-compose -f docker/docker-compose.yml down
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| API | 8080 | Express API server |
| Web | 3000 | Next.js frontend |
| PostgreSQL | 5432 | Primary database |
| MySQL | 3306 | Secondary database |

### Dockerfile

The production Dockerfile builds the entire monorepo:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## Local Development

### Quick Start

```bash
# Clone repository
git clone https://github.com/tinkss9/pulsyn.git
cd pulsyn

# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm run test
```

### Development URLs

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3000 |
| API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |
| MySQL | localhost:3306 |

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `PORT` | No | 8080 | API server port |
| `PULSYN_API_KEY` | No | — | API authentication key |
| `STRIPE_PUBLISHABLE_KEY` | No | — | Stripe publishable key |
| `STRIPE_SECRET_KEY` | No | — | Stripe secret key |
| `FRONTEND_URL` | No | http://localhost:3000 | Frontend URL for CORS |
| `NODE_ENV` | No | development | Environment (development/production) |

## Monitoring

### Health Check

```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime": 12345
}
```

### Logs

```bash
# API logs
docker-compose logs api

# Web logs
docker-compose logs web

# All logs
docker-compose logs -f
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :8080
   # Kill process
   kill -9 <PID>
   ```

2. **Database connection failed**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   # Restart database
   docker-compose restart postgres
   ```

3. **Build failed**
   ```bash
   # Clean build artifacts
   npm run clean
   # Rebuild
   npm run build
   ```

## Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe keys configured (live mode)
- [ ] SSL certificate installed
- [ ] Domain configured (pulsynai.com)
- [ ] Health check passing
- [ ] Logs monitored
- [ ] Backups configured
