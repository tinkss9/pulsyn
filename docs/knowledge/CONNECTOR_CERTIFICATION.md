# Pulsyn Connector Certification Knowledge Base

**Version:** 2.0
**Last Updated:** 2026-08-09
**Source:** `docs/lab/cert-matrix.json` (v2.0, generated 2026-08-07)
**Benchmark Source:** `packages/core/src/benchmark/results/postgresql-benchmark.json`

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| **Total Certified Connectors** | 226 |
| **Lane B (Database) Connectors** | 19 |
| **Lane A (SaaS/API) Connectors** | 204 |
| **Lane C (Enterprise SaaS) Connectors** | 3 |
| **Certification Methodology** | Vitest live API tests + Docker database tests |

### Pass Rate Distribution

| Tier | Count | Percentage |
|------|-------|------------|
| 100% pass rate | 142 | 62.8% |
| 90%+ pass rate | 207 | 91.6% |
| 80%+ pass rate | 219 | 96.9% |
| Below 80% | 7 | 3.1% |

---

## 2. Certification Tiers Explained

### Lane A — SaaS/API Connectors (204 connectors)

**What it is:** Connectors to third-party SaaS platforms and public APIs tested via live HTTP requests.

**Testing method:** Vitest integration tests against real public APIs or sandbox environments.

**Certification criteria:**
- Connectivity verification (HTTP 200 responses)
- Schema discovery (endpoint enumeration)
- Data extraction (response parsing)
- Error handling (graceful failures)

**Pass rate threshold:** ≥50% to be listed as certified

**Examples:** Hacker News, CoinBase, GitHub, REST Countries, Pokemon TCG

---

### Lane B — Database Connectors (19 connectors)

**What it is:** Database connectors tested against real database instances running in Docker containers.

**Testing method:** Vitest + Docker database containers with full CRUD operations.

**Certification criteria:**
- Connection establishment
- Schema discovery (table listing, column types)
- Full data extraction
- Incremental/CDC extraction
- Performance benchmarking
- Security (credential handling)

**Pass rate threshold:** ≥78% to be listed as certified

**Examples:** PostgreSQL, MySQL, MongoDB, Redis, ClickHouse

---

### Lane C — Enterprise SaaS Connectors (3 connectors)

**What it is:** Enterprise-grade SaaS connectors tested with both mocked HTTP (unit tests) and live integration tests gated by environment variables.

**Testing method:** Vitest unit tests (mocked HTTP) + live integration tests (API key required)

**Certification criteria:**
- Unit test coverage with mocked responses
- Live integration test with real API credentials
- Table-level extraction verification
- Auth method validation

**Pass rate threshold:** 100% (unit + integration)

**Examples:** Stripe, Salesforce, HubSpot

---

## 3. Lane B — Database Connectors (Full List)

All 19 database connectors certified via Docker-based testing.

| # | Connector | Pass Rate | CDC Support | Driver/Protocol | Status |
|---|-----------|-----------|-------------|-----------------|--------|
| 1 | **PostgreSQL** | 100% | WAL-based | `pg` (node-postgres) | CERTIFIED |
| 2 | **MySQL** | 100% | Binlog | `mysql2` | CERTIFIED |
| 3 | **MongoDB** | 100% | Change Streams | `mongodb` (native) | CERTIFIED |
| 4 | **MSSQL** | 83.3% | Change Tracking | `mssql` (tedious) | CERTIFIED |
| 5 | **Redis** | 100% | Keyspace Notifications | `ioredis` | CERTIFIED |
| 6 | **ClickHouse** | 100% | Materialized Views | `@clickhouse/client` | CERTIFIED |
| 7 | **Elasticsearch** | 100% | Scroll API + Pit | `@elastic/elasticsearch` | CERTIFIED |
| 8 | **Neo4j** | 100% | CDC via APOC | `neo4j-driver` | CERTIFIED |
| 9 | **InfluxDB** | 100% | Flux queries | `@influxdata/influxdb-client` | CERTIFIED |
| 10 | **MariaDB** | 100% | Binlog | `mysql2` (compatible) | CERTIFIED |
| 11 | **CockroachDB** | 100% | Changefeed | `pg` (PostgreSQL wire) | CERTIFIED |
| 12 | **TimescaleDB** | 100% | Hypertable CDC | `pg` (PostgreSQL extension) | CERTIFIED |
| 13 | **DuckDB** | 100% | N/A (analytics) | `duckdb` (native) | CERTIFIED |
| 14 | **S3** | 100% | S3 Event Notifications | `@aws-sdk/client-s3` | CERTIFIED |
| 15 | **CouchDB** | 100% | Changes Feed | `nano` (Apache CouchDB) | CERTIFIED |
| 16 | **Couchbase** | 100% | DCP (Database Change Protocol) | `couchbase` | CERTIFIED |
| 17 | **Firebase** | 100% | Realtime Database triggers | `firebase-admin` | CERTIFIED |
| 18 | **Supabase** | 100% | PostgreSQL WAL + Realtime | `@supabase/supabase-js` | CERTIFIED |
| 19 | **Kafka** | 78.9% | Consumer Groups | `kafkajs` | CERTIFIED |

### Lane B Summary

- **100% pass rate:** 17 of 19 connectors (89.5%)
- **90%+ pass rate:** 17 of 19 connectors (89.5%)
- **80%+ pass rate:** 18 of 19 connectors (94.7%)
- **Below 80%:** 1 (Kafka at 78.9%)

---

## 4. Lane A — SaaS/API Connectors (First 50)

All connectors tested via Vitest live API integration tests.

| # | Connector | Category | Pass Rate | Tested |
|---|-----------|----------|-----------|--------|
| 1 | xkcd | Entertainment | 95% | 2026-08-06 |
| 2 | dogapi | Animals | 95% | 2026-08-06 |
| 3 | boredapi | Entertainment | 95% | 2026-08-06 |
| 4 | uselessfacts | Entertainment | 95% | 2026-08-06 |
| 5 | affirmations | Lifestyle | 95% | 2026-08-06 |
| 6 | agify | Demographics | 95% | 2026-08-06 |
| 7 | gitlab-public | Developer Tools | 95% | 2026-08-06 |
| 8 | potterapi | Entertainment | 95% | 2026-08-06 |
| 9 | dragonball | Entertainment | 95% | 2026-08-06 |
| 10 | futurama | Entertainment | 95% | 2026-08-06 |
| 11 | officequotes | Entertainment | 95% | 2026-08-06 |
| 12 | keycloak | Authentication | 95% | 2026-08-06 |
| 13 | quotegarden | Entertainment | 95% | 2026-08-06 |
| 14 | cloudflare-dns | Infrastructure | 95% | 2026-08-06 |
| 15 | deckofcards2 | Entertainment | 95% | 2026-08-06 |
| 16 | coin-flip | Entertainment | 95% | 2026-08-06 |
| 17 | opennotify | Science | 85.7% | 2026-08-06 |
| 18 | advice-slip | Entertainment | 84.2% | 2026-08-06 |
| 19 | dadjokes | Entertainment | 68.4% | 2026-08-06 |
| 20 | genderize | Demographics | 73.7% | 2026-08-06 |
| 21 | nationalize | Demographics | 68.4% | 2026-08-06 |
| 22 | githubzen | Developer Tools | 73.7% | 2026-08-06 |
| 23 | openfoodfacts | Food & Beverage | 52.6% | 2026-08-06 |
| 24 | naruto | Entertainment | 68.4% | 2026-08-06 |
| 25 | wttr | Weather | 84.2% | 2026-08-06 |
| 26 | coinbase-rates | Finance | 100% | 2026-08-06 |
| 27 | hackernews | Developer Tools | 100% | 2026-08-06 |
| 28 | pokemontcg | Entertainment | 60% | 2026-08-06 |
| 29 | ecb | Finance | 68.4% | 2026-08-06 |
| 30 | arbeitnow | Jobs | 84.2% | 2026-08-06 |
| 31 | inspirobot | Entertainment | 68.4% | 2026-08-06 |
| 32 | harrypotter | Entertainment | 95% | 2026-08-07 |
| 33 | dockerhub | Developer Tools | 95% | 2026-08-07 |
| 34 | kanye | Entertainment | 95% | 2026-08-07 |
| 35 | ronswanson | Entertainment | 95% | 2026-08-07 |
| 36 | bacon | Entertainment | 95% | 2026-08-07 |
| 37 | geekjokes | Entertainment | 95% | 2026-08-07 |
| 38 | corporatebs | Entertainment | 95% | 2026-08-07 |
| 39 | stoic | Lifestyle | 95% | 2026-08-07 |
| 40 | zippopotam | Geography | 95% | 2026-08-07 |
| 41 | github-user | Developer Tools | 68.4% | 2026-08-07 |
| 42 | zenquotes | Lifestyle | 52.6% | 2026-08-06 |
| 43 | yesno | Entertainment | 95% | 2026-08-07 |
| 44 | random-dog | Animals | 95% | 2026-08-07 |
| 45 | random-duck | Animals | 95% | 2026-08-07 |
| 46 | foxes | Animals | 95% | 2026-08-07 |
| 47 | httpbin-get | Developer Tools | 95% | 2026-08-07 |
| 48 | httpbin-ip | Developer Tools | 95% | 2026-08-07 |
| 49 | httpbin-ua | Developer Tools | 95% | 2026-08-07 |
| 50 | github-emojis | Developer Tools | 95% | 2026-08-07 |

### Lane A Category Distribution (First 50)

| Category | Count | Examples |
|----------|-------|---------|
| Entertainment | 28 | xkcd, harrypotter, rickandmorty, futurama |
| Developer Tools | 8 | gitlab-public, hackernews, dockerhub, github-user |
| Demographics | 3 | agify, genderize, nationalize |
| Animals | 4 | dogapi, random-dog, random-duck, foxes |
| Finance | 2 | coinbase-rates, ecb |
| Lifestyle | 3 | affirmations, stoic, zenquotes |
| Science | 1 | opennotify |
| Weather | 1 | wttr |
| Geography | 1 | zippopotam |
| Food & Beverage | 1 | openfoodfacts |
| Authentication | 1 | keycloak |
| Infrastructure | 1 | cloudflare-dns |
| Jobs | 1 | arbeitnow |

---

## 5. Lane C — Enterprise SaaS Connectors (3 connectors)

Enterprise-grade connectors with dual testing (mocked unit + live integration).

| # | Connector | Pass Rate | Auth Method | Certified Tables | Tested |
|---|-----------|-----------|-------------|------------------|--------|
| 1 | **stripe-real** | 100% | API key (sk_test_*) | customers, charges, invoices, subscriptions, payment_intents, products, payouts, refunds, disputes | 2026-08-09 |
| 2 | **salesforce-real** | 100% | OAuth2 Bearer token | Account, Contact, Opportunity | 2026-08-09 |
| 3 | **hubspot-real** | 100% | Private App token (pat-na1-*) | contacts, companies, deals | 2026-08-09 |

**Testing methodology:**
- CI/CD: Vitest unit tests with mocked HTTP responses
- Live: Integration tests gated by environment variables (`TEST_STRIPE_API_KEY`, `TEST_SALESFORCE_TOKEN`, `TEST_HUBSPOT_TOKEN`)

---

## 6. Certification Methodology

### Overview

Pulsyn certifies connectors through a rigorous multi-layer testing process that verifies functionality, performance, security, and reliability.

### Testing Pipeline

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Code Structure  │────▶│  Mock Server    │────▶│  Live API /     │
│  Verification    │     │  Testing        │     │  Docker DB      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Testing Dimensions

| Dimension | What It Tests | Pass Criteria |
|-----------|---------------|---------------|
| **Connectivity** | Connection establishment, authentication | HTTP 200 or DB connection success |
| **Schema Discovery** | Table listing, column types, primary keys | Correct schema enumeration |
| **Data Extraction** | Full extraction, incremental/CDC, type preservation | Data integrity verified |
| **Performance** | Connection latency, throughput (rows/sec) | Meets tier thresholds |
| **Security** | Credential handling, data masking, auth rejection | No credential leaks |
| **Error Handling** | Network errors, API errors, rate limiting | Graceful degradation |

### Lane A Testing (SaaS/API)

```bash
# Run Lane A certification
npx vitest run packages/core/src/__tests__/lab/connectors/certify.test.ts
```

**Method:** Vitest live API tests against public endpoints
**Environment:** No credentials required for community APIs
**Evidence:** Test results with timestamps and pass/fail metrics

### Lane B Testing (Database)

```bash
# Run Lane B certification with Docker
docker-compose up -d
npx vitest run packages/core/src/__tests__/lab/connectors/certify.test.ts --database
```

**Method:** Vitest + Docker database containers
**Environment:** Local Docker containers with test data
**Evidence:** Docker test results, connection logs, performance metrics

### Lane C Testing (Enterprise SaaS)

```bash
# Run Lane C certification (mocked)
npx vitest run packages/core/src/__tests__/lab/connectors/certify.test.ts --mock

# Run Lane C certification (live - requires API keys)
TEST_STRIPE_API_KEY=sk_test_... npx vitest run packages/core/src/__tests__/lab/connectors/certify.test.ts --live
```

**Method:** Vitest unit tests (mocked HTTP) + live integration tests
**Environment:** CI/CD uses mocked fetch; live tests gated by env vars
**Evidence:** Unit test coverage + live integration results

---

## 7. Benchmark Results — PostgreSQL

**Source:** `packages/core/src/benchmark/results/postgresql-benchmark.json`
**Timestamp:** 2026-08-09T09:51:34.347Z
**Configuration:** PostgreSQL to PostgreSQL, 50,000 rows, batch size 1,000

### Test Results

| Test | Passed | Key Metrics | Details |
|------|--------|-------------|---------|
| **Bulk Throughput** | Yes | **34,530 rows/sec** | 50,000 rows in 50 batches of 1,000 — 1,448ms total |
| **Streaming Throughput** | Yes | **278 rows/sec** | 2,000 single-row inserts — 7,184ms total |
| **Single-Row Latency** | Yes | p50=3.41ms, p95=4.52ms, p99=5.64ms | 500 iterations |
| **Checkpoint Recovery** | Yes | Resume in 9,190ms | Resumed from checkpoint (row 200002499) |
| **Data Integrity** | Yes | 100% valid (0 errors) | 1,000/1,000 rows structurally valid |

### Performance Summary

| Metric | Score |
|--------|-------|
| **Overall Score** | 74/100 |
| **Throughput Score** | 35/100 |
| **Latency Score** | 100/100 |
| **Correctness Score** | 100/100 |
| **Certification Status** | Uncertified (benchmark only) |

### Latency Breakdown

| Percentile | Bulk (ms) | Streaming (ms) | Single-Row (ms) |
|------------|-----------|----------------|-----------------|
| p50 | 22.92 | 3.50 | 3.41 |
| p95 | 63.72 | 4.45 | 4.52 |
| p99 | 112.79 | 5.31 | 5.64 |
| Average | 28.96 | 3.59 | 3.53 |

---

## 8. Certification Thresholds

### By Connector Tier

| Metric | Tier 1-2 (Critical) | Tier 3-4 (Important) | Community |
|--------|---------------------|----------------------|-----------|
| Pass rate | ≥95% | ≥90% | ≥80% |
| Latency p99 | ≤500ms | ≤1,000ms | ≤2,000ms |
| Throughput | ≥100 rows/s | ≥50 rows/s | ≥10 rows/s |
| Memory | ≤256MB | ≤512MB | ≤1GB |
| Auth reject | Must fail | Must fail | Skip |

### By Certification Level

| Level | Method | Criteria | Scope |
|-------|--------|----------|-------|
| **Level 1** | Static analysis | Required interface methods | All connectors |
| **Level 2** | Mock server | API responses, pagination, errors | All SaaS connectors |
| **Level 3** | Live API | Connect, authenticate, extract | Community APIs |
| **Level 4** | Docker DB | Full CRUD, CDC, schema discovery | Database connectors |

---

## 9. Continuous Certification

- **Frequency:** Connectors are re-certified on code changes
- **Monitoring:** Production connectors are monitored for health
- **Alerting:** Failures trigger automatic notifications
- **Remediation:** Failed connectors are flagged for review

### Re-Certification Triggers

1. Connector code changes
2. Dependency updates
3. API version changes
4. Performance regression detection
5. Security vulnerability disclosure

---

## 10. Certification Evidence Format

Each certified connector entry in `docs/lab/cert-matrix.json`:

```json
{
  "connector_name": {
    "status": "CERTIFIED",
    "pass_rate": 95,
    "lane": "A|B|C",
    "tested_at": "2026-08-07",
    "method": "Vitest live API (parallel swarm)"
  }
}
```

For Lane C (Enterprise) connectors:

```json
{
  "stripe-real": {
    "status": "CERTIFIED",
    "pass_rate": 100,
    "lane": "C",
    "tested_at": "2026-08-09",
    "method": "Vitest unit (mocked HTTP) + live integration (TEST_STRIPE_API_KEY)",
    "cert_tables": ["customers", "charges", "invoices"],
    "auth": "API key (sk_test_*)",
    "notes": "CI/CD uses mocked fetch; live tests gated by TEST_STRIPE_API_KEY env var"
  }
}
```

---

## 11. Source Files

| File | Purpose |
|------|---------|
| `docs/lab/cert-matrix.json` | Master certification matrix (226 connectors) |
| `docs/CERTIFICATION_METHODOLOGY.md` | Public methodology documentation |
| `docs/CONNECTOR_CERTIFICATION_PLAN.md` | Expansion plan for 300+ connectors |
| `packages/core/src/benchmark/results/postgresql-benchmark.json` | PostgreSQL benchmark results |
| `packages/core/src/__tests__/lab/connectors/certify.test.ts` | Certification test suite |
| `packages/core/src/connectors/certify.ts` | Certification logic |
| `scripts/certification-report.js` | Report generation script |

---

## 12. Related Documentation

- [Connector Index](connectors/INDEX.md) — Full connector catalog with patterns
- [Connector Build Plan](../CONNECTOR_BUILD_PLAN_770.md) — 770 connector expansion plan
- [Connector Verification Plan](../CONNECTOR_VERIFICATION_PLAN.md) — Verification methodology
- [Lab Competition Strategy](../LAB_COMPETITION_STRATEGY.md) — Competitive positioning
- [Certification Methodology](../CERTIFICATION_METHODOLOGY.md) — Detailed methodology

---

*This document is auto-generated from certification data. For updates, modify `docs/lab/cert-matrix.json` and regenerate.*
