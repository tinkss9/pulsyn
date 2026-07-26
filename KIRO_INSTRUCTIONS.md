# Pulsyn Build Instructions for Kiro

> **Purpose:** Build connector implementations, hero video assets, and cloud lab infrastructure for the Pulsyn CDC platform.
> **Output:** TypeScript files that plug directly into the existing Pulsyn monorepo.
> **Location:** Save all outputs to `C:\Users\onein\pulsyn\packages\core\src\connectors\` (connectors) or `C:\Users\onein\pulsyn\docs\` (docs/assets).

---

## PART 1: Database Connectors

### Project Context

Pulsyn is a CDC (Change Data Capture) platform. We have:
- **PostgreSQL connector** — DONE, working with trigger-based CDC
- **MySQL connector** — PARTIAL (connection works, CDC is a stub)
- **Oracle, SQL Server, MongoDB** — NOT STARTED (type declarations only)

### Base Interface (all connectors MUST implement this)

```typescript
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey: string[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

export interface CDCEvent {
  id: string;
  timestamp: Date;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: Record<string, unknown>;
  oldData?: Record<string, unknown>;
  lsn: string; // Log sequence number or change position
}

export abstract class BaseConnector {
  id: string;
  name: string;
  engine: string;
  config: DatabaseConfig;
  protected connected: boolean = false;

  constructor(id: string, name: string, engine: string, config: DatabaseConfig) {
    this.id = id;
    this.name = name;
    this.engine = engine;
    this.config = config;
  }

  abstract connect(config: DatabaseConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<boolean>;
  abstract getTables(): Promise<string[]>;
  abstract getTableSchema(table: string): Promise<TableSchema>;
  abstract startCDC(callback: (event: CDCEvent) => void): Promise<void>;
  abstract stopCDC(): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }
}
```

### Connector 1: MySQL CDC (FIX the existing stub)

**File:** `mysql-cdc.ts`
**npm package:** `mysql2/promise` (already installed)

The existing `mysql.ts` has working `connect()`, `disconnect()`, `testConnection()`, `getTables()`, `getTableSchema()`. The `startCDC()` is a stub that only checks binlog format.

**What to build:**
- Wire `startCDC()` to actually read MySQL binlog events
- Use `mysql2` connection with `SET @master_binlog_checksum = '@@global.binlog_checksum'`
- Query `SHOW BINLOG EVENTS` or use the binlog stream protocol
- Parse row-based binlog events into `CDCEvent` objects
- Track the binlog filename + position for checkpointing
- Call the callback with each change event

**Approach (simplest that works):**
```typescript
// Use mysql2 to query binlog events periodically
// 1. Get current binlog position: SHOW MASTER STATUS
// 2. Poll: SHOW BINLOG EVENTS IN '<file>' FROM <position> LIMIT 1000
// 3. Parse each event row into CDCEvent
// 4. Update position for next poll
// 5. Call callback for each event
```

**Alternative (better but more complex):**
Use `@rodrigogs/mysql-events` or `zongji` packages for native binlog streaming.

---

### Connector 2: MongoDB Change Stream

**File:** `mongodb-connector.ts`
**npm package:** `mongodb` (install with `npm install mongodb`)

**What to build:**
- Connect using `MongoClient`
- `getTables()` → list collections via `db.listCollections()`
- `getTableSchema()` → sample one document to infer schema
- `startCDC()` → use `collection.watch()` change streams
- Map MongoDB change events to `CDCEvent`:
  - `insert` → `operation: 'INSERT'`, `data: fullDocument`
  - `update` → `operation: 'UPDATE'`, `data: fullDocument`, `oldData: previousDocument`
  - `delete` → `operation: 'DELETE'`, `data: documentKey`
- Track `resumeToken` for checkpointing

**Key code pattern:**
```typescript
const changeStream = collection.watch([], { fullDocument: 'updateLookup' });
changeStream.on('change', (change) => {
  callback({
    id: change._id._data,
    timestamp: new Date(),
    operation: change.operationType.toUpperCase(),
    table: change.ns.coll,
    data: change.fullDocument || change.documentKey,
    oldData: change.fullDocumentBeforeChange,
    lsn: change._id._data,
  });
});
```

---

### Connector 3: Snowflake Target (write-only)

**File:** `snowflake-target.ts`
**npm package:** `snowflake-sdk` (install with `npm install snowflake-sdk`)

**What to build:**
This is a TARGET connector only (receives data, doesn't source it).
- `connect()` → Use snowflake-sdk to connect
- `disconnect()` → Close connection
- `testConnection()` → Run `SELECT 1`
- `getTables()` → Query `INFORMATION_SCHEMA.TABLES`
- `getTableSchema()` → Query `INFORMATION_SCHEMA.COLUMNS`
- `startCDC()` → Not needed (target only), throw error or no-op
- `stopCDC()` → Not needed
- **Add:** `writeBatch(events: CDCEvent[])` method that:
  - Generates MERGE statements for upserts
  - Handles INSERT, UPDATE, DELETE operations
  - Uses Snowflake's `PUT` for bulk loading if needed

---

### Connector 4: BigQuery Target (write-only)

**File:** `bigquery-target.ts`
**npm package:** `@google-cloud/bigquery` (install with `npm install @google-cloud/bigquery`)

**What to build:**
- Target-only connector
- `connect()` → Use BigQuery client with service account credentials
- `writeBatch()` → Insert rows using streaming insert API
- Handle schema creation/migration

---

### Connector 5: Kafka Source/Target

**File:** `kafka-connector.ts`
**npm package:** `kafkajs` (already in dependencies)

**What to build:**
- Source: Consume messages from Kafka topics
- Target: Produce messages to Kafka topics
- `getTables()` → List topics
- `startCDC()` → Consume from topic, map messages to `CDCEvent`
- `writeBatch()` → Produce messages to topic

---

## PART 2: Output Format

Save each connector as a **standalone TypeScript file** with:

```
packages/core/src/connectors/<name>.ts
```

Each file must:
1. Import from `../types` for shared interfaces
2. Extend `BaseConnector` from `./base`
3. Be self-contained (no cross-connector dependencies)
4. Include JSDoc comments on public methods
5. Handle errors gracefully (don't crash on connection failure)

**Example file header:**
```typescript
// MongoDB Connector
// Change stream-based CDC for MongoDB

import { MongoClient, Db, Collection, ChangeStream } from 'mongodb';
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent, ColumnSchema } from '../types';

export class MongoDBConnector extends BaseConnector {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private changeStream: ChangeStream | null = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'mongodb', config);
  }

  // ... implementations
}
```

---

## PART 3: Cloud Connector Lab (Testing Infrastructure)

### What to Build

Create a Docker Compose setup that spins up test databases for connector validation.

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

  # Init MongoDB replica set
  mongodb-init:
    image: mongo:7
    depends_on:
      - mongodb-source
    command: >
      mongosh --host mongodb-source:27017 --eval '
        rs.initiate({_id: "rs0", members: [{_id: 0, host: "mongodb-source:27017"}]});
      '
    restart: "no"
```

**Also create:** `scripts/test-connectors.sh`
```bash
#!/bin/bash
# Run connector certification tests
# Usage: ./scripts/test-connectors.sh [connector-name]

echo "Starting test databases..."
docker-compose -f docker/docker-compose.test.yml up -d

echo "Waiting for databases to be ready..."
sleep 10

echo "Running connector tests..."
npm run test -- --filter='@pulsyn/core' -- --grep "connector"

echo "Stopping test databases..."
docker-compose -f docker/docker-compose.test.yml down
```

---

## PART 4: Hero Video Script

### Video Concept (60-90 seconds)

**Title:** "Real-time CDC in 60 seconds"

**Scene 1 (0-10s): The Problem**
- Show a dashboard with "Last synced: 15 minutes ago"
- Red warning icons, stale data

**Scene 2 (10-25s): The Solution**
- Terminal: `pulsyn pipeline create --source postgres --target snowflake`
- Terminal: `pulsyn pipeline start`
- Show real-time rows flowing: "12,847 rows/sec | Latency: 0.3s"

**Scene 3 (25-40s): AI Setup**
- Claude/Cursor chat: "Set up a PostgreSQL to Snowflake pipeline with email masking"
- AI responds with commands
- Pipeline starts automatically

**Scene 4 (40-55s): The Dashboard**
- Show Pulsyn dashboard with:
  - Active pipeline
  - Real-time metrics
  - Connector status
  - Security events

**Scene 5 (55-70s): The Comparison**
- Split screen: "Fivetran: 15 min delay" vs "Pulsyn: 0.3s"
- Price comparison: "$895/mo" vs "$300/mo"

**Scene 6 (70-80s): CTA**
- "Start free at pulsyn.io"
- Logo animation

### How to Record

1. Set up local Pulsyn with test databases (use docker-compose.test.yml)
2. Record terminal sessions with `asciinema` or screen recorder
3. Record dashboard with screen capture
4. Use `ffmpeg` to concatenate clips
5. Add text overlays with `ffmpeg` or After Effects

**Recording commands:**
```bash
# Terminal recording
asciinema rec demo.cast -c "pulsyn pipeline create --source postgres --target snowflake"

# Screen recording (macOS)
screencapture -v demo.mp4

# Concatenate with ffmpeg
ffmpeg -i scene1.mp4 -i scene2.mp4 -i scene3.mp4 \
  -filter_complex "[0:v][1:v][2:v]concat=n=3:v=1:a=0" \
  output.mp4
```

---

## PART 5: Email Quota Notification

**File:** `packages/api/src/services/quota-notifier.ts`

Build a service that:
1. Checks usage against free tier limits (10,000 rows/day)
2. At 80%: triggers in-app banner
3. At 100%: pauses pipeline, sends email
4. Email template: "Your free quota is exhausted. Upgrade to Pro for 5M rows/day."

**Email template:**
```
Subject: Your Pulsyn free quota is exhausted

Hi {{name}},

You've used all 10,000 rows for today. Your pipeline has been paused.

It will resume tomorrow at midnight UTC. Or upgrade to Pro for:
- 5,000,000 rows/day
- Unlimited pipelines
- All connectors
- MCP server (31 tools)

[Upgrade to Pro →] {{upgrade_url}}

— The Pulsyn Team
```

---

## Checklist Before Sending Back

- [ ] Each connector is a standalone `.ts` file
- [ ] Each connector extends `BaseConnector`
- [ ] Each connector has real database connection code (not stubs)
- [ ] Each connector has error handling
- [ ] Docker Compose has all test databases
- [ ] Hero video script is ready to record
- [ ] Email quota notifier is implemented
- [ ] All files saved to `C:\Users\onein\pulsyn\packages\core\src\connectors\` or `C:\Users\onein\pulsyn\docs\`

---

## Quick Reference: File Locations

```
C:\Users\onein\pulsyn\
├── packages/
│   └── core/
│       └── src/
│           └── connectors/
│               ├── base.ts          (existing — don't modify)
│               ├── postgresql.ts    (existing — don't modify)
│               ├── mysql.ts         (existing — FIX startCDC)
│               ├── mysql-cdc.ts     (NEW — full CDC implementation)
│               ├── mongodb.ts       (NEW)
│               ├── snowflake.ts     (NEW — target only)
│               ├── bigquery.ts      (NEW — target only)
│               └── kafka.ts         (NEW)
├── docker/
│   └── docker-compose.test.yml      (NEW)
├── scripts/
│   └── test-connectors.sh           (NEW)
└── docs/
    ├── launch/
    │   └── hero-video-script.md      (UPDATE)
    └── marketing/
        └── quota-email-template.md   (NEW)
```

---

**Save this file as:** `KIRO_INSTRUCTIONS.md` on your other laptop.
**When done:** Copy the output files back to the paths above and tell me "Kiro done" — I'll integrate everything.
