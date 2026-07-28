# Pulsyn Connector Testing Lab

> Automated testing framework for validating all Pulsyn connectors against real databases.

## Quick Start

### 1. Start Test Databases

```bash
# Start all databases
docker compose -f docker-compose.lab.yml up -d

# Start only Tier 1 databases
docker compose -f docker-compose.lab.yml up -d postgres mysql mongodb redis minio
```

### 2. Generate Synthetic Data

```bash
cd packages/core
npx tsx src/__tests__/lab/synthetic/generator.ts
```

### 3. Run Tests

```bash
# Run all lab tests
npx vitest run src/__tests__/lab/

# Run specific connector tests
npx vitest run src/__tests__/lab/connectors/postgresql.test.ts
npx vitest run src/__tests__/lab/connectors/mysql.test.ts
npx vitest run src/__tests__/lab/connectors/mongodb.test.ts

# Run with verbose output
npx vitest run src/__tests__/lab/ --reporter=verbose
```

### 4. Generate Reports

```bash
# Generate HTML dashboard
npx tsx src/__tests__/lab/reports/generate-dashboard.ts
```

---

## Test Suites

### Unit Tests (No Docker Required)
- Connection/disconnection
- Schema discovery
- Config masking
- Error handling

### Integration Tests (Docker Required)
- Full extraction
- Incremental extraction
- CDC start/stop

### E2E Tests (Docker Required)
- Data integrity
- NULL handling
- Large batch handling
- Error scenarios

### Benchmark Tests (Docker Required)
- Connection latency
- Extract throughput
- Memory usage

---

## Connector Status

| Connector | Unit | Integration | E2E | Benchmark | Status |
|-----------|------|-------------|-----|-----------|--------|
| PostgreSQL | ✅ | ✅ | ⬜ | ⬜ | 70% |
| MySQL | ✅ | ✅ | ⬜ | ⬜ | 70% |
| MongoDB | ✅ | ✅ | ⬜ | ⬜ | 70% |
| Redis | ✅ | ✅ | ⬜ | ⬜ | 70% |
| S3/MinIO | ✅ | ✅ | ⬜ | ⬜ | 70% |
| MSSQL | ⬜ | ⬜ | ⬜ | ⬜ | 0% |
| Snowflake | ✅ | ✅ | ⬜ | ⬜ | 70% |
| BigQuery | ✅ | ✅ | ⬜ | ⬜ | 70% |

---

## Synthetic Data

The lab uses seeded random data generators for reproducible tests:

- **Users table**: 1,000 rows with emails, names, balances
- **Products table**: 500 rows with names, prices, categories
- **Orders table**: 5,000 rows with foreign keys to users/products
- **Events table**: 10,000 rows with timestamps and JSON properties

### Edge Cases Tested
- NULL values in every nullable column
- Empty strings vs NULL
- Unicode characters (中文, العربية, 🎉)
- Special characters (`'`, `"`, `\`, `\n`, `\t`)
- Large numbers (INT_MAX, DECIMAL precision)
- Future/past timestamps
- Binary data
- Nested JSON objects

---

## Adding a New Connector

1. Create test file: `src/__tests__/lab/connectors/<engine>.test.ts`
2. Configure connection: Update `config` with database credentials
3. Run tests: `npx vitest run src/__tests__/lab/connectors/<engine>.test.ts`
4. Fix failures: Update connector code until all tests pass
5. Generate report: Add to dashboard

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TEST_PG_HOST` | localhost | PostgreSQL host |
| `TEST_PG_PORT` | 5432 | PostgreSQL port |
| `TEST_PG_DB` | testdb | PostgreSQL database |
| `TEST_PG_USER` | test | PostgreSQL user |
| `TEST_PG_PASS` | test | PostgreSQL password |
| `TEST_MYSQL_HOST` | localhost | MySQL host |
| `TEST_MYSQL_PORT` | 3306 | MySQL port |
| `TEST_MYSQL_DB` | testdb | MySQL database |
| `TEST_MYSQL_USER` | root | MySQL user |
| `TEST_MYSQL_PASS` | test | MySQL password |
| `TEST_MONGO_HOST` | localhost | MongoDB host |
| `TEST_MONGO_PORT` | 27017 | MongoDB port |
| `TEST_MONGO_DB` | testdb | MongoDB database |
| `TEST_MONGO_USER` | test | MongoDB user |
| `TEST_MONGO_PASS` | test | MongoDB password |
| `TEST_REDIS_HOST` | localhost | Redis host |
| `TEST_REDIS_PORT` | 6379 | Redis port |
| `TEST_S3_HOST` | localhost | S3/MinIO host |
| `TEST_S3_PORT` | 4566 | S3/MinIO port |
| `TEST_MSSQL_HOST` | localhost | MSSQL host |
| `TEST_MSSQL_PORT` | 1433 | MSSQL port |
| `TEST_MSSQL_DB` | testdb | MSSQL database |
| `TEST_MSSQL_USER` | sa | MSSQL user |
| `TEST_MSSQL_PASS` | Test@12345 | MSSQL password |
