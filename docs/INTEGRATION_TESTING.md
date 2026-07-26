# Pulsyn Integration Test Lab — Quick Start

## Option 1: Docker Compose (Recommended — Free, Local)

### Prerequisites
- Docker Desktop installed
- 8GB RAM allocated to Docker

### Start Test Lab
```bash
cd C:\Users\onein\pulsyn

# Start all services
docker-compose -f docker-compose.test.yml up -d

# Wait for services to initialize
sleep 30

# Run integration tests
npx tsx scripts/integration-test.ts

# Stop services when done
docker-compose -f docker-compose.test.yml down
```

### Services Included
| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL 16 | 5432 | pulsyn / pulsyn_test_2026 |
| MySQL 8 | 3306 | pulsyn / pulsyn_test_2026 |
| MariaDB 11 | 3307 | root / pulsyn_test_2026 |
| MongoDB 7 | 27017 | pulsyn / pulsyn_test_2026 |
| Redis 7 | 6379 | (none) |
| Cassandra 4 | 9042 | (none) |
| ClickHouse 24 | 8123 | pulsyn / pulsyn_test_2026 |
| Neo4j 5 | 7687 | pulsyn / pulsyn_test_2026 |
| CockroachDB | 26257 | root / (none) |
| TimescaleDB | 5433 | pulsyn / pulsyn_test_2026 |
| Kafka 7.6 | 9092 | (none) |
| Elasticsearch 8 | 9200 | (none) |
| InfluxDB 2 | 8086 | pulsyn / pulsyn_test_token_2026 |

---

## Option 2: GitHub Actions (Free CI/CD — 2000 mins/month)

### Setup
1. Push code to GitHub
2. Go to repo → Actions → Enable workflows
3. Tests run automatically on push/PR

### Manual Trigger
```bash
gh workflow run integration-tests.yml
```

### View Results
```bash
gh run list --workflow=integration-tests.yml
gh run view <run-id>
```

---

## Option 3: Supabase (Already Have — PostgreSQL Only)

### Test PostgreSQL Connector
```bash
# Already certified 5/5 on Supabase
npx vitest run packages/core/src/__tests__/conformance/test-connection.test.ts
```

### Supabase Project
- Ref: cdcqmktplmliqhbcevdq
- Region: us-east-1
- URL: https://supabase.com/dashboard/project/cdcqmktplmliqhbcevdq

---

## Option 4: Free Cloud Tiers (For SaaS Connectors)

### Services with Free Tiers
| Service | Free Tier | Connectors |
|---------|-----------|------------|
| **Supabase** | ✅ Already have | postgresql, supabase |
| **MongoDB Atlas** | 512MB free | mongodb |
| **Redis Cloud** | 30MB free | redis |
| **InfluxDB Cloud** | Free tier | influxdb |
| **ClickHouse Cloud** | Free tier | clickhouse |
| **Neo4j Aura** | Free tier | neo4j |
| **PlanetScale** | Free tier | mysql |
| **Neon** | Free tier | postgresql |
| **Upstash** | Free tier | redis, kafka |
| **Confluent Cloud** | Free tier | kafka |
| **Elastic Cloud** | Free tier | elasticsearch |

### Setup Script
```bash
# Run this to set up free cloud accounts
npx tsx scripts/setup-cloud-lab.ts
```

---

## Certification Levels

| Level | What It Tests | How to Achieve |
|-------|--------------|----------------|
| **CONTRACT_VALIDATED** | Interface compliance | ✅ Done (90/90) |
| **INTEGRATION_VALIDATED** | Real connection + CRUD | Run docker-compose tests |
| **VENDOR_VALIDATED** | Production API works | Test with real API keys |
| **PRODUCTION_PROVEN** | Battle-tested | Deploy and monitor |

---

## Quick Commands

```bash
# Start test lab
docker-compose -f docker-compose.test.yml up -d

# Run all integration tests
npx tsx scripts/integration-test.ts

# Run specific connector test
npx tsx scripts/integration-test.ts --connector postgresql

# Run with verbose output
npx tsx scripts/integration-test.ts --verbose

# Generate certification report
npx tsx scripts/certification-report.ts
```
