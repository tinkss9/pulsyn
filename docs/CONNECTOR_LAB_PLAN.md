# Pulsyn Connector Testing Lab — Master Plan

> **Goal:** Transform Pulsyn from a 6/10 MVP to a 10/10 production platform by building an automated testing lab that validates every connector against real databases, generates synthetic data, and proves our claims with measured benchmarks.

---

## 1. Requirements: What Makes a Connector "Production-Ready"

### 1.1 Core Requirements (ALL connectors must pass)

| # | Requirement | Test Type | Priority |
|---|-------------|-----------|----------|
| C1 | **Connect** — establish connection to source/target | Unit | P0 |
| C2 | **Disconnect** — clean shutdown, no leaked connections | Unit | P0 |
| C3 | **Test Connection** — health check returns true when connected | Unit | P0 |
| C4 | **List Tables** — enumerate all accessible tables/collections | Unit | P0 |
| C5 | **Get Table Schema** — return columns, types, primary keys | Unit | P0 |
| C6 | **Extract Full** — retrieve all rows from a table | Integration | P0 |
| C7 | **Extract Incremental** — retrieve only new/changed rows | Integration | P0 |
| C8 | **CDC Start/Stop** — start and stop change data capture | Integration | P0 |
| C9 | **CDC Capture** — detect INSERT, UPDATE, DELETE operations | Integration | P0 |
| C10 | **Error Handling** — graceful errors on invalid config, timeout, auth failure | Unit | P0 |

### 1.2 Performance Requirements

| # | Requirement | Metric | Target | Test Type |
|---|-------------|--------|--------|-----------|
| P1 | **Connection Latency** | Time to connect | < 5 seconds | Benchmark |
| P2 | **Full Extract Throughput** | Rows/second | > 10,000 rows/s | Benchmark |
| P3 | **CDC Latency** | Time from change to event | < 5 seconds | Benchmark |
| P4 | **Memory Usage** | Peak memory during extract | < 500MB for 1M rows | Benchmark |
| P5 | **Connection Pool** | Max concurrent connections | >= 10 | Benchmark |

### 1.3 Reliability Requirements

| # | Requirement | Test Type | Priority |
|---|-------------|-----------|----------|
| R1 | **Retry on Transient Failure** | Fault injection | P0 |
| R2 | **Reconnect After Disconnect** | Fault injection | P0 |
| R3 | **Handle Schema Changes** | E2E | P1 |
| R4 | **Handle Large Batches** | E2E (100K+ rows) | P1 |
| R5 | **Handle NULL Values** | E2E | P1 |
| R6 | **Handle Special Characters** | E2E | P1 |
| R7 | **Handle Timezone Differences** | E2E | P2 |
| R8 | **Handle Unicode Data** | E2E | P2 |

### 1.4 Data Integrity Requirements

| # | Requirement | Test Type | Priority |
|---|-------------|-----------|----------|
| D1 | **Row Count Match** | Assertion | P0 |
| D2 | **Data Type Preservation** | Assertion | P0 |
| D3 | **Primary Key Integrity** | Assertion | P0 |
| D4 | **NULL Preservation** | Assertion | P0 |
| D5 | **Decimal Precision** | Assertion | P1 |
| D6 | **Timestamp Precision** | Assertion | P1 |
| D7 | **Binary Data Fidelity** | Assertion | P2 |

---

## 2. Connector Priority Tiers

### Tier 1: Must-Have (Launch Blockers) — 10 connectors

| # | Connector | Source | Target | Status | Effort |
|---|-----------|--------|--------|--------|--------|
| 1 | PostgreSQL | ✅ Working | ✅ Working | Production | — |
| 2 | MySQL | ✅ Working | ✅ Working | Production | — |
| 3 | MongoDB | ✅ Working | ✅ Working | Production | — |
| 4 | Snowflake | ✅ Working | ✅ Working | Production | — |
| 5 | BigQuery | ✅ Working | ✅ Working | Production | — |
| 6 | Redis | ✅ Working | ⬜ Stub | Needs target | 2 days |
| 7 | S3/MinIO | ✅ Working | ⬜ Stub | Needs target | 2 days |
| 8 | MSSQL | ⬜ Stub | ⬜ Stub | Needs both | 3 days |
| 9 | Oracle | ⬜ Stub | ⬜ Stub | Needs both | 3 days |
| 10 | Kafka | ⬜ Stub | ⬜ Stub | Needs both | 3 days |

### Tier 2: Should-Have (Month 2) — 15 connectors

| # | Connector | Type | Effort |
|---|-----------|------|--------|
| 11 | Redshift | Database | 3 days |
| 12 | Databricks | Warehouse | 3 days |
| 13 | ClickHouse | Database | 2 days |
| 14 | Cassandra | Database | 2 days |
| 15 | DynamoDB | Database | 2 days |
| 16 | Elasticsearch | Search | 2 days |
| 17 | Salesforce | SaaS | 3 days |
| 18 | HubSpot | SaaS | 2 days |
| 19 | Stripe | SaaS | 2 days |
| 20 | Shopify | SaaS | 2 days |
| 21 | Slack | SaaS | 1 day |
| 22 | Jira | SaaS | 2 days |
| 23 | GitHub | SaaS | 1 day |
| 24 | Kafka (Confluent) | Streaming | 2 days |
| 25 | Kinesis | Streaming | 2 days |

### Tier 3: Nice-to-Have (Month 3-6) — 75 connectors

Remaining connectors from the 763 list, prioritized by:
- Customer demand
- Market size
- Competitive advantage

---

## 3. Lab Architecture

### 3.1 Infrastructure (Local + Cloud)

```
┌─────────────────────────────────────────────────────────────┐
│                    PULSYN CONNECTOR LAB                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Docker      │  │   Docker      │  │   Docker      │       │
│  │  PostgreSQL   │  │    MySQL      │  │   MongoDB     │       │
│  │  Port 5432    │  │  Port 3306    │  │  Port 27017   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Docker      │  │   Docker      │  │   Docker      │       │
│  │    Redis      │  │   MinIO/S3    │  │    MSSQL      │       │
│  │  Port 6379    │  │  Port 4566    │  │  Port 1433    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Docker      │  │   Docker      │  │   Docker      │       │
│  │   Kafka       │  │ Elasticsearch │  │  Cassandra    │       │
│  │  Port 9092    │  │  Port 9200    │  │  Port 9042    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Test Runner (Vitest)                      │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ Unit    │ │ Integ.  │ │ E2E     │ │ Bench   │   │   │
│  │  │ Tests   │ │ Tests   │ │ Tests   │ │ Tests   │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Synthetic Data Generator                  │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ Users   │ │ Orders  │ │ Products│ │ Events  │   │   │
│  │  │ Table   │ │ Table   │ │ Table   │ │ Table   │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Validation & Reporting                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │ Pass/   │ │ Perf    │ │ Coverage│ │ HTML    │   │   │
│  │  │ Fail    │ │ Report  │ │ Report  │ │ Report  │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Directory Structure

```
packages/core/src/__tests__/
├── lab/                           # NEW: Connector Testing Lab
│   ├── README.md                  # Lab documentation
│   ├── config.ts                  # Lab configuration
│   ├── docker-compose.lab.yml     # All test databases
│   ├── synthetic/                 # Synthetic data generators
│   │   ├── generator.ts           # Main generator
│   │   ├── schemas/               # Table schemas
│   │   │   ├── users.json
│   │   │   ├── orders.json
│   │   │   ├── products.json
│   │   │   └── events.json
│   │   └── fixtures/              # Test data fixtures
│   │       ├── small.json         # 100 rows
│   │       ├── medium.json        # 10,000 rows
│   │       └── large.json         # 1,000,000 rows
│   ├── runners/                   # Test runners
│   │   ├── unit.runner.ts         # Unit test runner
│   │   ├── integration.runner.ts  # Integration test runner
│   │   ├── e2e.runner.ts          # E2E test runner
│   │   └── benchmark.runner.ts    # Benchmark runner
│   ├── assertions/                # Custom assertions
│   │   ├── connectivity.ts        # Connection assertions
│   │   ├── data-integrity.ts      # Data integrity assertions
│   │   ├── performance.ts         # Performance assertions
│   │   └── schema.ts              # Schema assertions
│   ├── fault-injection/           # Fault injection tests
│   │   ├── network.ts             # Network failures
│   │   ├── auth.ts                # Auth failures
│   │   └── timeout.ts             # Timeout scenarios
│   ├── reports/                   # Generated reports
│   │   ├── dashboard.html         # Visual dashboard
│   │   ├── connectors.json        # Connector status
│   │   └── benchmarks.json        # Performance data
│   └── connectors/                # Per-connector test suites
│       ├── postgresql.test.ts
│       ├── mysql.test.ts
│       ├── mongodb.test.ts
│       ├── snowflake.test.ts
│       ├── bigquery.test.ts
│       ├── redis.test.ts
│       ├── s3.test.ts
│       ├── mssql.test.ts
│       ├── oracle.test.ts
│       └── kafka.test.ts
├── conformance/                   # Existing conformance tests
├── integration/                   # Existing integration tests
└── connectors/                    # Existing connector tests
```

---

## 4. Synthetic Data Strategy

### 4.1 Data Generator

```typescript
// Synthetic data generator for all connector tests
interface SyntheticDataConfig {
  tables: TableConfig[];
  relationships: RelationshipConfig[];
  seed: number; // For reproducibility
}

interface TableConfig {
  name: string;
  rowCount: number;
  columns: ColumnConfig[];
  primaryKey: string;
  watermarkColumn?: string;
}

interface ColumnConfig {
  name: string;
  type: 'string' | 'integer' | 'decimal' | 'boolean' | 'timestamp' | 'uuid' | 'json' | 'binary';
  nullable: boolean;
  distribution: 'uniform' | 'normal' | 'sequential' | 'random';
  min?: number;
  max?: number;
  values?: any[];
}
```

### 4.2 Standard Test Schema

**Users Table:**
```json
{
  "name": "users",
  "rowCount": 10000,
  "columns": [
    { "name": "id", "type": "integer", "primaryKey": true },
    { "name": "email", "type": "string", "unique": true },
    { "name": "name", "type": "string" },
    { "name": "age", "type": "integer", "min": 18, "max": 100 },
    { "name": "balance", "type": "decimal", "min": 0, "max": 100000 },
    { "name": "is_active", "type": "boolean" },
    { "name": "metadata", "type": "json" },
    { "name": "created_at", "type": "timestamp" },
    { "name": "updated_at", "type": "timestamp" }
  ]
}
```

**Orders Table:**
```json
{
  "name": "orders",
  "rowCount": 50000,
  "columns": [
    { "name": "id", "type": "integer", "primaryKey": true },
    { "name": "user_id", "type": "integer", "foreignKey": "users.id" },
    { "name": "product_id", "type": "integer", "foreignKey": "products.id" },
    { "name": "quantity", "type": "integer", "min": 1, "max": 100 },
    { "name": "total", "type": "decimal", "min": 0, "max": 10000 },
    { "name": "status", "type": "string", "values": ["pending", "completed", "cancelled"] },
    { "name": "created_at", "type": "timestamp" }
  ]
}
```

**Products Table:**
```json
{
  "name": "products",
  "rowCount": 1000,
  "columns": [
    { "name": "id", "type": "integer", "primaryKey": true },
    { "name": "name", "type": "string" },
    { "name": "price", "type": "decimal", "min": 0.01, "max": 9999.99 },
    { "name": "category", "type": "string", "values": ["electronics", "clothing", "books", "food"] },
    { "name": "inventory", "type": "integer", "min": 0, "max": 10000 },
    { "name": "created_at", "type": "timestamp" }
  ]
}
```

### 4.3 Edge Case Data

- **NULL values** in every nullable column
- **Empty strings** vs NULL
- **Unicode characters** (中文, العربية, 🎉)
- **Special characters** (`'`, `"`, `\`, `\n`, `\t`)
- **Large numbers** (INT_MAX, DECIMAL precision)
- **Future/past timestamps** (epoch 0, year 2099)
- **Binary data** (BLOB fields)
- **JSON with nested objects**
- **Zero-length arrays** (for JSON columns)

---

## 5. Test Suites

### 5.1 Unit Tests (Headless, No Docker)

```typescript
// Each connector must pass these unit tests
describe('Connector Unit Tests', () => {
  describe('Connectivity', () => {
    it('should connect with valid config');
    it('should reject invalid host');
    it('should reject invalid credentials');
    it('should reject invalid database');
    it('should timeout on unreachable host');
    it('should disconnect cleanly');
    it('should handle double disconnect');
  });

  describe('Schema Discovery', () => {
    it('should list all tables');
    it('should get table schema with columns');
    it('should identify primary keys');
    it('should handle empty tables');
    it('should handle tables with no primary key');
  });

  describe('Config', () => {
    it('should mask password in getConfig()');
    it('should return all non-sensitive fields');
  });
});
```

### 5.2 Integration Tests (Headed, Docker Required)

```typescript
// Each connector must pass these integration tests
describe('Connector Integration Tests', () => {
  describe('Full Extraction', () => {
    it('should extract all rows from small table (100 rows)');
    it('should extract all rows from medium table (10,000 rows)');
    it('should handle pagination for large tables');
    it('should preserve data types');
    it('should preserve NULL values');
  });

  describe('Incremental Extraction', () => {
    it('should extract only new rows after insert');
    it('should extract only updated rows after update');
    it('should handle watermark column');
    it('should return empty on no changes');
  });

  describe('CDC', () => {
    it('should detect INSERT operations');
    it('should detect UPDATE operations');
    it('should detect DELETE operations');
    it('should capture before/after state');
    it('should handle rapid changes');
    it('should stop CDC cleanly');
  });
});
```

### 5.3 E2E Tests (Full Pipeline)

```typescript
// End-to-end pipeline tests
describe('E2E Pipeline Tests', () => {
  describe('Source → Target Replication', () => {
    it('should replicate PostgreSQL → PostgreSQL');
    it('should replicate PostgreSQL → MySQL');
    it('should replicate MySQL → PostgreSQL');
    it('should replicate MongoDB → PostgreSQL');
    it('should replicate PostgreSQL → Snowflake');
    it('should replicate PostgreSQL → BigQuery');
  });

  describe('Data Integrity', () => {
    it('should preserve row count');
    it('should preserve data types');
    it('should preserve primary keys');
    it('should preserve NULL values');
    it('should preserve decimal precision');
  });

  describe('Schema Evolution', () => {
    it('should handle added columns');
    it('should handle dropped columns');
    it('should handle renamed columns');
    it('should handle type changes');
  });
});
```

### 5.4 Benchmark Tests

```typescript
// Performance benchmarks
describe('Connector Benchmarks', () => {
  it('should measure connection latency');
  it('should measure full extract throughput (rows/sec)');
  it('should measure CDC latency (ms)');
  it('should measure memory usage');
  it('should measure concurrent connection handling');
});
```

---

## 6. Validation & Reporting

### 6.1 Validation Matrix

| Connector | Unit | Integration | E2E | Benchmark | Status |
|-----------|------|-------------|-----|-----------|--------|
| PostgreSQL | ✅ | ✅ | ⬜ | ⬜ | 70% |
| MySQL | ✅ | ✅ | ⬜ | ⬜ | 70% |
| MongoDB | ✅ | ✅ | ⬜ | ⬜ | 70% |
| Snowflake | ✅ | ✅ | ⬜ | ⬜ | 70% |
| BigQuery | ✅ | ✅ | ⬜ | ⬜ | 70% |
| Redis | ✅ | ⬜ | ⬜ | ⬜ | 30% |
| S3 | ✅ | ⬜ | ⬜ | ⬜ | 30% |
| MSSQL | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| Oracle | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| Kafka | ⬜ | ⬜ | ⬜ | ⬜ | 0% |

### 6.2 HTML Dashboard

Generate a visual dashboard showing:
- Connector status (pass/fail/skip)
- Performance metrics (latency, throughput)
- Coverage report (which tests pass)
- Comparison with competitors (Fivetran, Airbyte)

---

## 7. Implementation Plan

### Week 1: Foundation
- [ ] Create lab directory structure
- [ ] Build synthetic data generator
- [ ] Create Docker Compose for all test databases
- [ ] Build custom assertion library
- [ ] Create test runner framework

### Week 2: Tier 1 Connectors
- [ ] Add unit tests for PostgreSQL, MySQL, MongoDB, Snowflake, BigQuery
- [ ] Add integration tests for all Tier 1 connectors
- [ ] Add E2E tests for Tier 1 connectors
- [ ] Add benchmark tests for Tier 1 connectors

### Week 3: Tier 2 Connectors
- [ ] Implement Redis target connector
- [ ] Implement S3 target connector
- [ ] Implement MSSQL source + target
- [ ] Implement Oracle source + target
- [ ] Implement Kafka source + target

### Week 4: Reporting & Polish
- [ ] Build HTML dashboard
- [ ] Generate performance comparison report
- [ ] Create connector certification process
- [ ] Document lab usage

---

## 8. Success Criteria

### Launch Criteria (Month 1)
- [ ] 10 connectors pass all unit tests
- [ ] 10 connectors pass all integration tests
- [ ] 5 connectors pass all E2E tests
- [ ] Benchmark data for all 10 connectors
- [ ] HTML dashboard live

### Growth Criteria (Month 3)
- [ ] 25 connectors pass all tests
- [ ] Performance comparison with Fivetran/Airbyte
- [ ] Customer case study with benchmark data
- [ ] SOC 2 compliance documentation

### Leadership Criteria (Month 6)
- [ ] 50+ connectors certified
- [ ] Published benchmark methodology
- [ ] Third-party audit of benchmarks
- [ ] Industry recognition (Hacker News, Product Hunt)

---

## 9. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker containers fail in CI | High | Use cloud-hosted databases as fallback |
| Benchmark numbers disappoint | High | Focus on real-time advantage, not raw speed |
| Connector complexity underestimated | Medium | Prioritize Tier 1, defer Tier 3 |
| Competitor copies our approach | Low | First-mover advantage + MCP integration |

---

## 10. Next Steps

1. **Approve this plan**
2. **Build synthetic data generator** (Day 1)
3. **Create Docker Compose for lab** (Day 1)
4. **Build test runner framework** (Day 2)
5. **Add unit tests for Tier 1 connectors** (Day 2-3)
6. **Add integration tests for Tier 1 connectors** (Day 3-4)
7. **Build HTML dashboard** (Day 5)
8. **Publish benchmark results** (Day 7)

---

*Plan created: 2026-07-28*
*Author: MiMo (xiaomi/mimo-v2.5-pro)*
*Status: APPROVED BY USER*
