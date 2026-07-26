# KIRO BUILD INSTRUCTIONS — PULSYN CDC PLATFORM

> **Purpose:** Build production-ready connectors, testing infrastructure, cloud lab, and hero video for Pulsyn.
> **Swarm Capable:** Split work across parallel agents for faster execution.
> **Output:** TypeScript files + Docker configs + test suites that plug directly into Pulsyn monorepo.

---

## PROJECT CONTEXT

**Pulsyn** is a CDC (Change Data Capture) platform competing with Fivetran, Airbyte, Confluent, and Debezium.

**What exists:**
- PostgreSQL connector with real trigger-based CDC (DONE)
- MySQL connector with connection/schema (CDC is a STUB)
- REST API, CLI (35+ commands), MCP server (31 tools), Web dashboard
- Deployed on Vercel + Supabase

**What's needed:**
1. Complete MySQL CDC
2. Add MongoDB, Snowflake, BigQuery connectors
3. Testing infrastructure (Playwright E2E, unit tests, connector tests)
4. Cloud lab for connector certification
5. Hero video for launch

---

## TASK 1: CONNECTOR IMPLEMENTATIONS

### 1A. MySQL CDC Binlog Reader

**File:** `packages/core/src/connectors/mysql-cdc.ts`

The existing `mysql.ts` has working connection/schema methods. Build a NEW file that implements full binlog CDC.

```typescript
// Requirements:
// - Use mysql2/promise for connection
// - Implement binlog event polling (SHOW BINLOG EVENTS approach)
// - Track binlog file + position for checkpointing
// - Parse row-based events into CDCEvent objects
// - Handle reconnection on failure
// - Configurable poll interval (default 1000ms)

interface CDCEvent {
  id: string;
  timestamp: Date;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: Record<string, unknown>;
  oldData?: Record<string, unknown>;
  lsn: string; // binlog file:position
}
```

**Approach:**
1. Get current position: `SHOW MASTER STATUS`
2. Poll for events: `SHOW BINLOG EVENTS IN '<file>' FROM <pos> LIMIT 1000`
3. Parse each event row (EventType, Database, Table, EventType, Data)
4. For ROW-based: decode the row data
5. Call callback with each change
6. Update position for next poll

**Alternative (better):** Use `@rodrigogs/mysql-events` package for native binlog streaming.

---

### 1B. MongoDB Change Stream Connector

**File:** `packages/core/src/connectors/mongodb.ts`

```typescript
// Requirements:
// - Use mongodb npm package (install: npm install mongodb)
// - connect() — MongoClient with connection string
// - getTables() — list collections via db.listCollections()
// - getTableSchema() — sample one document to infer schema
// - startCDC() — collection.watch() with fullDocument: 'updateLookup'
// - Track resumeToken for checkpointing
// - Handle replica set requirement (MongoDB change streams need RS)
```

---

### 1C. Snowflake Target Connector (write-only)

**File:** `packages/core/src/connectors/snowflake.ts`

```typescript
// Requirements:
// - Use snowflake-sdk (install: npm install snowflake-sdk)
// - connect() — Snowflake connection with account/user/password/database/schema
// - testConnection() — SELECT 1
// - getTables() — INFORMATION_SCHEMA.TABLES
// - getTableSchema() — INFORMATION_SCHEMA.COLUMNS
// - startCDC() — throw Error('Snowflake is a target-only connector')
// - writeBatch(events: CDCEvent[]) — MERGE statements for upserts
```

---

### 1D. BigQuery Target Connector (write-only)

**File:** `packages/core/src/connectors/bigquery.ts`

```typescript
// Requirements:
// - Use @google-cloud/bigquery (install: npm install @google-cloud/bigquery)
// - connect() — service account auth
// - writeBatch() — streaming insert API
// - Handle schema creation/migration
```

---

### 1E. Kafka Source/Target Connector

**File:** `packages/core/src/connectors/kafka.ts`

```typescript
// Requirements:
// - Use kafkajs (already in dependencies)
// - Source: consume from topics, map to CDCEvent
// - Target: produce to topics
// - getTables() — list topics
```

---

## TASK 2: TESTING INFRASTRUCTURE

### 2A. Unit Tests for Connectors

**File:** `packages/core/src/__tests__/connectors/postgresql.test.ts`

```typescript
// Test PostgreSQL connector with mocked pg.Pool
// Tests:
// - connect() creates pool and tests connection
// - disconnect() ends pool
// - testConnection() returns true on success, false on failure
// - getTables() queries information_schema
// - getTableSchema() returns columns and primary key
// - startCDC() creates _pulsyn_changes table and triggers
// - stopCDC() clears polling timer
```

**File:** `packages/core/src/__tests__/connectors/mysql.test.ts`

```typescript
// Test MySQL connector with mocked mysql2
// Same pattern as PostgreSQL tests
```

**File:** `packages/core/src/__tests__/connectors/mongodb.test.ts`

```typescript
// Test MongoDB connector with mocked mongodb client
// Tests:
// - connect() creates MongoClient
// - getTables() lists collections
// - startCDC() sets up change stream
```

---

### 2B. E2E Tests with Playwright

**File:** `tests/e2e/connectors.spec.ts`

```typescript
// Playwright E2E tests for connector management
// Tests:
// - Create PostgreSQL connector via dashboard
// - Test connection (should succeed)
// - View tables list
// - View table schema
// - Delete connector
// - Create MySQL connector
// - Test connection (should succeed or fail gracefully)
```

**File:** `tests/e2e/pipelines.spec.ts`

```typescript
// Playwright E2E tests for pipeline management
// Tests:
// - Create pipeline (PostgreSQL → PostgreSQL)
// - Start pipeline
// - Verify CDC events appear
// - Stop pipeline
// - Check metrics
```

**File:** `tests/e2e/cdc-flow.spec.ts`

```typescript
// Full CDC flow E2E test
// Tests:
// 1. Insert rows into source table
// 2. Wait for CDC to capture changes
// 3. Verify changes replicated to target
// 4. Update row in source
// 5. Verify update replicated
// 6. Delete row in source
// 7. Verify delete replicated
```

---

### 2C. Connector Certification Tests

**File:** `tests/connectors/certification.ts`

```typescript
// Automated connector certification suite
// For each connector pair (source → target):
// 1. Throughput test: insert 10K rows, measure rows/sec
// 2. Latency test: measure time from insert to replication
// 3. Correctness test: verify all changes replicated exactly
// 4. Recovery test: kill and restart, verify no data loss
// 5. Schema test: add column, verify schema change handled

interface CertificationResult {
  connector: string;
  throughput: number; // rows/sec
  latencyP50: number; // ms
  latencyP99: number; // ms
  correctness: number; // 0-100%
  recovery: boolean;
  certification: 'platinum' | 'gold' | 'silver' | 'bronze' | 'fail';
}
```

---

## TASK 3: CLOUD LAB INFRASTRUCTURE

### 3A. Docker Compose for Local Testing

**File:** `docker/docker-compose.test.yml`

```yaml
# Test databases for connector certification
version: '3.8'
services:
  postgres-source:
    image: postgres:16
    environment:
      POSTGRES_DB: pulsyn_test
      POSTGRES_USER: pulsyn
      POSTGRES_PASSWORD: test123
    ports:
      - "5433:5432"
    command: >
      postgres
      -c wal_level=logical
      -c max_replication_slots=10
      -c max_wal_senders=10

  postgres-target:
    image: postgres:16
    environment:
      POSTGRES_DB: pulsyn_target
      POSTGRES_USER: pulsyn
      POSTGRES_PASSWORD: test123
    ports:
      - "5434:5432"

  mysql-source:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: test123
      MYSQL_DATABASE: pulsyn_test
    ports:
      - "3307:3306"
    command: >
      --server-id=1
      --log-bin=mysql-bin
      --binlog-format=ROW
      --binlog-row-image=FULL

  mongodb-source:
    image: mongo:7
    ports:
      - "27018:27017"
    command: --replSet rs0 --bind_ip_all

  # Free tier cloud databases (for CI/CD)
  # Neon (PostgreSQL) — free tier: 0.5GB, 1 project
  # PlanetScale (MySQL) — free tier: 5GB, 1 billion reads
  # MongoDB Atlas — free tier: 512MB, shared cluster
  # Snowflake — free trial: $400 credits for 30 days
  # BigQuery — free tier: 10GB storage, 1TB queries/month
```

---

### 3B. Cloud Database Setup Script

**File:** `scripts/setup-cloud-lab.sh`

```bash
#!/bin/bash
# Setup cloud databases for connector testing
# Uses free tiers where possible

echo "=== Setting up Pulsyn Connector Lab ==="

# 1. Neon (PostgreSQL) — Free tier
echo "[1/5] Setting up Neon PostgreSQL..."
# Sign up at neon.tech, create project, get connection string
# NEON_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/pulsyn"

# 2. PlanetScale (MySQL) — Free tier
echo "[2/5] Setting up PlanetScale MySQL..."
# Sign up at planetscale.com, create database, get connection string
# PLANETSCALE_URL="mysql://user:pass@xxx.connect.psdb.cloud/pulsyn?ssl=true"

# 3. MongoDB Atlas — Free tier
echo "[3/5] Setting up MongoDB Atlas..."
# Sign up at mongodb.com/atlas, create M0 cluster, get connection string
# MONGO_URL="mongodb+srv://user:pass@xxx.mongodb.net/pulsyn"

# 4. Snowflake — Free trial
echo "[4/5] Setting up Snowflake trial..."
# Sign up at snowflake.com, get $400 credits
# SNOWFLAKE_URL="snowflake://account/user/pass/database/schema"

# 5. BigQuery — Free tier
echo "[5/5] Setting up BigQuery..."
# Sign up at cloud.google.com, enable BigQuery API, create dataset
# Uses service account JSON key

echo "=== Cloud lab ready ==="
echo "Save connection strings to .env.test"
```

---

### 3C. CI/CD Pipeline for Connector Tests

**File:** `.github/workflows/connector-tests.yml`

```yaml
name: Connector Certification Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-postgresql:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: pulsyn_test
          POSTGRES_USER: pulsyn
          POSTGRES_PASSWORD: test123
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --filter='@pulsyn/core' -- --grep "postgresql"
        env:
          DATABASE_URL: postgresql://pulsyn:test123@localhost:5432/pulsyn_test

  test-mysql:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test123
          MYSQL_DATABASE: pulsyn_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd "mysqladmin ping -h localhost"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test -- --filter='@pulsyn/core' -- --grep "mysql"

  test-e2e:
    runs-on: ubuntu-latest
    needs: [test-postgresql, test-mysql]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## TASK 4: HERO VIDEO

### 4A. Video Script (60 seconds)

**File:** `docs/launch/hero-video-script.md`

```
SCENE 1 (0-8s): THE PROBLEM
[Screen: Dashboard showing "Last synced: 15 minutes ago"]
[Narrator] "Your analytics dashboard shows data from 15 minutes ago."
[Screen: Red warning icons, stale metrics]

SCENE 2 (8-20s): THE SOLUTION
[Terminal animation]
$ pulsyn pipeline create --source postgres --target snowflake
✓ Pipeline created: pg-to-snowflake

$ pulsyn pipeline start pg-to-snowflake
✓ CDC engine started
  Latency: 0.3s | Rows/sec: 12,847 | Status: streaming

[Narrator] "Pulsyn replicates your database in real-time. Sub-second latency."

SCENE 3 (20-35s): AI SETUP
[Split screen: Claude chat + terminal]
User: "Set up PostgreSQL to Snowflake pipeline with email masking"
Claude: [Shows MCP commands being generated]
Terminal: [Commands execute automatically]
[Narrator] "Or let AI set it up for you. First CDC platform with MCP integration."

SCENE 4 (35-48s): THE DASHBOARD
[Screen: Pulsyn web dashboard]
- Active pipeline with real-time metrics
- Connector status (PostgreSQL ✓, MySQL ✓)
- Security events log
- Usage dashboard
[Narrator] "Monitor everything from one dashboard."

SCENE 5 (48-55s): THE COMPARISON
[Split screen]
Left: "Fivetran: 15 min delay, $895/mo"
Right: "Pulsyn: 0.3s delay, $300/mo"
[Narrator] "Real-time CDC at a fraction of the cost."

SCENE 6 (55-60s): CTA
[Screen: pulsyn.io]
[Narrator] "Start free at pulsyn.io"
[Logo animation]
```

---

### 4B. Recording Checklist

```
□ Set up local Pulsyn with test databases (docker-compose.test.yml)
□ Create test data (10K rows in source table)
□ Record terminal session with asciinema or OBS
□ Record dashboard with screen capture
□ Record AI chat demo (Claude/Cursor + MCP)
□ Edit with ffmpeg or DaVinci Resolve
□ Add text overlays and transitions
□ Export as MP4 (1080p, 30fps)
□ Upload to YouTube (unlisted) for embedding
```

---

## TASK 5: QUOTA SYSTEM & EMAIL

### 5A. Quota Tracking

**File:** `packages/api/src/services/quota-tracker.ts`

```typescript
// Track free tier usage and enforce limits
// - Query usage_records table for today's row count
// - At 80%: return warning in API response
// - At 100%: pause pipeline, trigger email

interface QuotaStatus {
  used: number;
  limit: number;
  percentage: number;
  warning: boolean;
  exceeded: boolean;
}

async function checkQuota(orgId: string): Promise<QuotaStatus> {
  // Query: SELECT SUM(quantity) FROM usage_records
  //   WHERE organization_id = $1 AND metric = 'rows_replicated'
  //   AND created_at > start_of_today
  // Compare against plan limit (10000 for free tier)
}
```

---

### 5B. Email Notification Service

**File:** `packages/api/src/services/email-notifier.ts`

```typescript
// Send quota notification emails
// Uses nodemailer or Resend API

async function sendQuotaExhaustedEmail(user: { email: string, name: string }) {
  // Subject: Your Pulsyn free quota is exhausted
  // Body: HTML template with usage stats and upgrade link
  // CTA: "Upgrade to Pro" button → /dashboard/billing
}

async function sendQuotaWarningEmail(user: { email: string, name: string }, percentage: number) {
  // Subject: You've used {percentage}% of your Pulsyn quota
  // Body: Usage breakdown and upgrade suggestion
}
```

---

## SWARM EXECUTION STRATEGY

If Kiro supports swarm agents, split the work:

### Agent 1: Connector Builder
- Tasks: 1A (MySQL CDC), 1B (MongoDB), 1C (Snowflake), 1D (BigQuery), 1E (Kafka)
- Parallel: Yes (each connector is independent)

### Agent 2: Test Builder
- Tasks: 2A (Unit tests), 2B (E2E tests), 2C (Certification tests)
- Depends on: Agent 1 (needs connector code to test)

### Agent 3: Infrastructure
- Tasks: 3A (Docker), 3B (Cloud setup), 3C (CI/CD)
- Parallel: Yes (independent of connectors)

### Agent 4: Content
- Tasks: 4A (Video script), 4B (Recording checklist), 5A (Quota), 5B (Email)
- Parallel: Yes (independent)

---

## FILE DELIVERY CHECKLIST

When done, save files to these exact paths:

```
C:\Users\onein\pulsyn\
├── packages/core/src/connectors/
│   ├── mysql-cdc.ts          (NEW — full binlog CDC)
│   ├── mongodb.ts            (NEW — change stream CDC)
│   ├── snowflake.ts          (NEW — target only)
│   ├── bigquery.ts           (NEW — target only)
│   └── kafka.ts              (NEW — source/target)
│
├── packages/core/src/__tests__/connectors/
│   ├── postgresql.test.ts    (NEW)
│   ├── mysql.test.ts         (NEW)
│   └── mongodb.test.ts       (NEW)
│
├── tests/
│   ├── e2e/
│   │   ├── connectors.spec.ts    (NEW)
│   │   ├── pipelines.spec.ts     (NEW)
│   │   └── cdc-flow.spec.ts      (NEW)
│   └── connectors/
│       └── certification.ts      (NEW)
│
├── docker/
│   └── docker-compose.test.yml   (NEW)
│
├── scripts/
│   └── setup-cloud-lab.sh        (NEW)
│
├── .github/workflows/
│   └── connector-tests.yml       (NEW)
│
├── packages/api/src/services/
│   ├── quota-tracker.ts          (NEW)
│   └── email-notifier.ts         (NEW)
│
└── docs/
    ├── launch/
    │   └── hero-video-script.md  (UPDATE)
    └── MARKET_RESEARCH.md        (ALREADY CREATED)
```

---

## TESTING COMMANDS

After building, verify with:

```bash
# Unit tests
npm run test -- --filter='@pulsyn/core'

# E2E tests
npm run test:e2e

# Connector certification
npm run test:certify -- --connector postgresql

# Typecheck
npm run typecheck

# Build
npm run build
```

---

## WHAT TO TELL KIRO

> "Build production-ready TypeScript connectors for the Pulsyn CDC platform. Each connector must extend BaseConnector, implement all abstract methods with real database connection code (not stubs), and include error handling. Save each as a standalone .ts file. Also create Docker test infrastructure, Playwright E2E tests, and a connector certification suite. The output must be plug-and-play — drop the files into the repo and they work."

**When Kiro is done, copy the files back and say "Kiro done" — I'll integrate everything.**
