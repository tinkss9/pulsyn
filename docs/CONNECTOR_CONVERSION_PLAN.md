# Pulsyn Connector Conversion Plan — DMS Python → Pulsyn TypeScript

**Created:** 2026-07-26
**Purpose:** Convert 127 real Python connectors from DMS Replicate to TypeScript for Pulsyn
**Approach:** DeepSeek swarm batch conversion with MiMo review

---

## 1. Source Inventory

**Location:** `C:\Users\onein\dms-replicate\src\extractors\connectors\`

| Category | Count | Examples |
|---|---|---|
| **Real connectors (>100 lines)** | 127 | SAP (260), Oracle (201), SQL Server (187), PostgreSQL (168), MySQL (139), MongoDB, Kafka, Salesforce, Workday, Xero, NetSuite, Stripe |
| **Stubs (≤100 lines)** | 20 | Freshdesk, Asana, Monday, Pipedrive, Intercom, Airtable, Segment, SQLite, Notion |
| **Total** | 147 | |

**Target location:** `C:\Users\onein\pulsyn\packages\core\src\connectors\`

---

## 2. Interface Mapping

### DMS BaseConnector (Python)
```python
class BaseConnector(ABC):
    def connect() -> bool
    def disconnect()
    def test_connection() -> bool
    def list_tables() -> List[str]
    def get_columns(table) -> List[Dict]
    def estimate_row_count(table) -> int
    def get_primary_key(table) -> str
    def extract_batch(table, pk_column, last_pk, batch_size) -> List[Dict]
```

### Pulsyn BaseConnector (TypeScript)
```typescript
abstract class BaseConnector implements Connector {
    connect(config: DatabaseConfig): Promise<void>
    disconnect(): Promise<void>
    testConnection(): Promise<boolean>
    getTables(): Promise<string[]>
    getTableSchema(table: string): Promise<TableSchema>
    startCDC(callback: (event: CDCEvent) => void): Promise<void>
    stopCDC(): Promise<void>
}
```

### Conversion Matrix

| DMS Method | Pulsyn Method | Conversion Type | Notes |
|---|---|---|---|
| `connect()` | `connect(config)` | **Direct port** | Python `self.config` → TS constructor config |
| `disconnect()` | `disconnect()` | **Direct port** | Close connection/release resources |
| `test_connection()` | `testConnection()` | **Direct port** | Return boolean |
| `list_tables()` | `getTables()` | **Direct port** | SQL metadata query |
| `get_columns(table)` | `getTableSchema(table)` | **Adapt** | Return `TableSchema` type instead of `List[Dict]` |
| `estimate_row_count(table)` | — | **Keep as utility** | Extra method, not in Pulsyn interface |
| `get_primary_key(table)` | — | **Keep as utility** | Extra method, not in Pulsyn interface |
| `extract_batch(...)` | `startCDC(callback)` | **Rework** | Batch extract → CDC event stream |

---

## 3. Technical Conversion Rules

### 3.1 Python → TypeScript Syntax

| Python | TypeScript |
|---|---|
| `def method(self, arg: str) -> bool:` | `async method(arg: string): Promise<boolean>` |
| `self.config` | `this.config` |
| `self._connected` | `this.connected` |
| `f"SELECT ..."` | `` `SELECT ...` `` |
| `try/except Exception as e:` | `try/catch (error)` |
| `List[str]` | `string[]` |
| `Dict[str, Any]` | `Record<string, any>` or typed interface |
| `Optional[str]` | `string \| null` |
| `True/False/None` | `true/false/null` |
| `raise ValueError(...)` | `throw new Error(...)` |
| `logging.getLogger(__name__)` | `console.log` or Pulsyn logger |
| `with self.conn.cursor() as cur:` | `const client = await pool.connect(); try { ... } finally { client.release() }` |

### 3.2 SQLAlchemy → Native Drivers

| DMS (SQLAlchemy) | Pulsyn (Native) |
|---|---|
| `from sqlalchemy import create_engine` | `import { Pool } from 'pg'` (PostgreSQL) |
| `engine = create_engine(url)` | `pool = new Pool({ connectionString })` |
| `engine.connect()` | `pool.connect()` |
| `conn.execute(text("SELECT..."))` | `client.query("SELECT...")` |
| `result.fetchall()` | `result.rows` |
| `result.keys()` | `result.fields.map(f => f.name)` |

### 3.3 Driver Mapping

| Database | Python Driver | TypeScript Driver | npm Package |
|---|---|---|---|
| PostgreSQL | `psycopg2` / `asyncpg` | `pg` | `pg` |
| MySQL | `pymysql` / `mysql-connector` | `mysql2` | `mysql2` |
| SQL Server | `pyodbc` / `pymssql` | `mssql` | `mssql` |
| Oracle | `cx_Oracle` / `oracledb` | `oracledb` | `oracledb` |
| MongoDB | `pymongo` | `mongodb` | `mongodb` |
| Snowflake | `snowflake-connector-python` | `snowflake-sdk` | `snowflake-sdk` |
| BigQuery | `google-cloud-bigquery` | `@google-cloud/bigquery` | `@google-cloud/bigquery` |
| SQLite | `sqlite3` | `better-sqlite3` | `better-sqlite3` |
| Redis | `redis` | `ioredis` | `ioredis` |
| Cassandra | `cassandra-driver` | `cassandra-driver` | `cassandra-driver` |
| DynamoDB | `boto3` | `@aws-sdk/client-dynamodb` | `@aws-sdk/client-dynamodb` |
| Elasticsearch | `elasticsearch` | `@elastic/elasticsearch` | `@elastic/elasticsearch` |
| Kafka | `confluent-kafka` | `kafkajs` | `kafkajs` |

### 3.4 extract_batch → startCDC Conversion

**DMS pattern (batch):**
```python
def extract_batch(self, table, pk_column, last_pk, batch_size=50000):
    query = f"SELECT * FROM {table} WHERE {pk_column} > %s ORDER BY {pk_column} LIMIT %s"
    with self.conn.cursor() as cur:
        cur.execute(query, (last_pk, batch_size))
        return cur.fetchall()
```

**Pulsyn pattern (CDC):**
```typescript
async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // Option A: Trigger-based (PostgreSQL)
    await this.client.query(`
        CREATE OR REPLACE FUNCTION _pulsyn_notify() RETURNS trigger AS $$
        BEGIN
            PERFORM pg_notify('pulsyn_changes', json_build_object(
                'operation', TG_OP,
                'table', TG_TABLE_NAME,
                'row', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE row_to_json(NEW) END
            )::text);
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);
    // Listen for notifications
    this.client.query('LISTEN pulsyn_changes');
    this.client.on('notification', (msg) => {
        callback(JSON.parse(msg.payload));
    });
}
```

**For databases without triggers (most non-PostgreSQL):**
```typescript
async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    // Polling-based CDC
    this.pollInterval = setInterval(async () => {
        const changes = await this.queryChangesSince(this.lastCheckpoint);
        for (const change of changes) {
            callback(change);
            this.lastCheckpoint = change.timestamp;
        }
    }, this.config.pollIntervalMs || 1000);
}
```

---

## 4. Conversion Priority (Tier System)

### Tier 1 — High Priority (Convert First)
These are the most commonly needed connectors for SaaS customers:

| # | Connector | DMS Lines | Why Priority |
|---|---|---|---|
| 1 | PostgreSQL | 168 | Already done in Pulsyn |
| 2 | MySQL | 139 | #2 most requested |
| 3 | SQL Server | 187 | Enterprise standard |
| 4 | Oracle | 201 | Enterprise standard |
| 5 | MongoDB | 138 | NoSQL standard |
| 6 | Snowflake | 134 | Data warehouse |
| 7 | BigQuery | 133 | Data warehouse |
| 8 | Salesforce | 135 | CRM standard |
| 9 | DynamoDB | 135 | AWS standard |
| 10 | Redis | 135 | Cache/session store |

### Tier 2 — Medium Priority (Convert Second)

| # | Connector | DMS Lines | Why Priority |
|---|---|---|---|
| 11 | Kafka | 130 | Event streaming |
| 12 | Elasticsearch | 131 | Search/analytics |
| 13 | MariaDB | 174 | MySQL variant |
| 14 | Supabase | 145 | 1INAI ecosystem |
| 15 | Redshift | 140 | AWS data warehouse |
| 16 | Cassandra | 135 | Distributed DB |
| 17 | ClickHouse | 135 | Analytics DB |
| 18 | Databricks | 134 | Lakehouse |
| 19 | SAP | 260 | Enterprise ERP |
| 20 | Xero | 136 | Accounting |

### Tier 3 — Lower Priority (Convert Later)

| # | Connector | DMS Lines | Category |
|---|---|---|---|
| 21-40 | HubSpot, Stripe, QuickBooks, NetSuite, Workday, ServiceNow, Jira, Slack, Shopify, etc. | 100-150 | SaaS apps |
| 41-80 | CockroachDB, TiDB, StarRocks, SingleStore, Firebolt, etc. | 100-150 | Emerging DBs |
| 81-127 | Niche: Neo4j, ArangoDB, InfluxDB, TimescaleDB, etc. | 100-150 | Specialized |

### Tier 4 — Stubs (Build from Scratch)

| # | Connector | DMS Lines | Notes |
|---|---|---|---|
| 1-20 | Freshdesk, Asana, Monday, Pipedrive, Intercom, Airtable, Segment, SQLite, Notion, etc. | 79-100 | Need full implementation |

---

## 5. Swarm Conversion Workflow

### Per-Connector Task File Template

```
TASK: Convert DMS [ConnectorName] connector to Pulsyn TypeScript

SOURCE:
- File: C:\Users\onein\dms-replicate\src\extractors\connectors\[name]_connector.py
- Lines: [N]
- Base class: BaseConnector (Python)

TARGET:
- File: C:\Users\onein\pulsyn\packages\core\src\connectors\[name].ts
- Base class: BaseConnector (TypeScript)
- Must implement: connect, disconnect, testConnection, getTables, getTableSchema, startCDC, stopCDC

CONVERSION RULES:
1. Python typing → TypeScript interfaces
2. SQLAlchemy → native driver (see driver mapping table)
3. extract_batch() → startCDC() with polling-based CDC
4. Self-contained: each connector imports its own driver
5. Error handling: try/catch with proper cleanup
6. Connection pooling: use driver's native pool
7. Config: accept DatabaseConfig from base class

EXTRA METHODS (keep as utilities):
- estimateRowCount(table): Promise<number>
- getPrimaryKey(table): Promise<string>

TESTS:
- Create [name].test.ts with: connect, listTables, getSchema, startCDC

OUTPUT: TypeScript file + test file, ready for review
```

### Swarm Batch Strategy

| Batch | Connectors | Agent | Est. Time |
|---|---|---|---|
| Batch 1 | Tier 1 (10 connectors) | DeepSeek-V4-Pro | 2-3 hours |
| Batch 2 | Tier 1 remaining + Tier 2 start (10) | DeepSeek-V4-Pro | 2-3 hours |
| Batch 3 | Tier 2 (10 connectors) | DeepSeek-V4-Pro | 2-3 hours |
| Batch 4 | Tier 3 first half (20) | DeepSeek-V4-Flash | 2-3 hours |
| Batch 5 | Tier 3 second half (20) | DeepSeek-V4-Flash | 2-3 hours |
| Batch 6 | Tier 4 stubs (20) | DeepSeek-V4-Flash | 2-3 hours |
| **Total** | **127 connectors** | | **12-18 hours** |

### Cost Estimate

| Model | Rate | Connectors | Est. Cost |
|---|---|---|---|
| DeepSeek-V4-Pro | $0.65/1M | 30 (Tier 1+2) | ~$3-5 |
| DeepSeek-V4-Flash | $0.21/1M | 97 (Tier 3+4) | ~$5-8 |
| **Total** | | **127** | **~$8-13** |

---

## 6. Quality Gates

### Per-Connector Checklist

- [ ] TypeScript compiles without errors
- [ ] All interface methods implemented
- [ ] Connection pooling configured
- [ ] Error handling with proper cleanup
- [ ] CDC polling mechanism works
- [ ] Test file passes
- [ ] No hardcoded credentials
- [ ] Consistent with Pulsyn coding style

### Batch Review Process

1. DeepSeek converts batch of 10-20 connectors
2. MiMo reviews output for correctness
3. Run `npm run typecheck` in Pulsyn
4. Run connector-specific tests
5. Fix any issues found
6. Commit batch to feature branch
7. Merge to main after all batches complete

---

## 7. Expected Outcome

After conversion:

| Metric | Before | After |
|---|---|---|
| Pulsyn connectors | 1 (PostgreSQL) | **128** (127 converted + 1 existing) |
| Real connectors | 1 | **108** (Tier 1-3) |
| Stub connectors | 0 | **20** (Tier 4, need full build) |
| Source files | 100 | **~350** |
| Test files | 3 | **~130** |

This transforms Pulsyn from "1 connector scaffold" to "108 real connectors" — a **108x improvement** that makes it competitive with Fivetran (500+ connectors) and Airbyte (300+ connectors).

---

## 8. Open Questions

1. **CDC for non-PostgreSQL:** Most databases don't have trigger-based CDC. Should we use polling-based CDC (read timestamp/ID columns) or log-based CDC (binlog/WAL)?
2. **Connection pooling:** Each connector manages its own pool, or use a shared pool manager?
3. **Testing:** Should we spin up real databases in Docker for integration tests, or use mocks?
4. **Incremental delivery:** Ship Tier 1 first (10 connectors) and iterate, or batch all 127?
5. **Naming convention:** `[name]_connector.py` → `[name].ts` or `[name]-connector.ts`?

---

## 9. Next Steps

1. Review this document
2. Decide on open questions
3. Write first batch task files (Tier 1, 10 connectors)
4. Trigger DeepSeek swarm for Batch 1
5. MiMo reviews output
6. Iterate through remaining batches
7. Final integration test + merge
