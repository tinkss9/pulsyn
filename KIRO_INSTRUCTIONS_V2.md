# KIRO BUILD INSTRUCTIONS — PULSYN CDC PLATFORM
## Comprehensive Build: Connectors, BI Liberation, Testing, Market Research

**Date:** 2026-07-26
**From:** Pulsyn team
**Source files:** `source_new_2.zip` (8,298 entries)
**Target:** `C:\Users\onein\pulsyn\`

---

## PART 1: MORE CONNECTORS (expand to 55+)

### SaaS Connectors (high customer demand)

| # | DMS Source | Pulsyn Target | npm Package |
|---|-----------|---------------|-------------|
| 1 | `src/extractors/connectors/github_connector.py` | `connectors/github.ts` | `@octokit/rest` |
| 2 | `src/extractors/connectors/gitlab_connector.py` | `connectors/gitlab.ts` | `@gitbeaker/rest` |
| 3 | `src/extractors/connectors/twilio_connector.py` | `connectors/twilio.ts` | `twilio` |
| 4 | `src/extractors/connectors/sendgrid_connector.py` | `connectors/sendgrid.ts` | `@sendgrid/mail` |
| 5 | `src/extractors/connectors/mailchimp_connector.py` | `connectors/mailchimp.ts` | `mailchimp-api-v3` |
| 6 | `src/extractors/connectors/zendesk_connector.py` | `connectors/zendesk.ts` | `node-zendesk` |
| 7 | `src/extractors/connectors/segment_connector.py` | `connectors/segment.ts` | `analytics-node` |
| 8 | `src/extractors/connectors/intercom_connector.py` | `connectors/intercom.ts` | `intercom-client` |
| 9 | `src/extractors/connectors/pipedrive_connector.py` | `connectors/pipedrive.ts` | `pipedrive` |
| 10 | `src/extractors/connectors/monday_connector.py` | `connectors/monday.ts` | `monday-sdk` |

### Database Connectors

| # | DMS Source | Pulsyn Target | npm Package |
|---|-----------|---------------|-------------|
| 11 | `src/extractors/connectors/neo4j_connector.py` | `connectors/neo4j.ts` | `neo4j-driver` |
| 12 | `src/extractors/connectors/influxdb_connector.py` | `connectors/influxdb.ts` | `@influxdata/influxdb-client` |
| 13 | `src/extractors/connectors/timescaledb_connector.py` | `connectors/timescaledb.ts` | `pg` |
| 14 | `src/extractors/connectors/cockroachdb_connector.py` | `connectors/cockroachdb.ts` | `pg` |
| 15 | `src/extractors/connectors/planetscale_connector.py` | `connectors/planetscale.ts` | `mysql2` |
| 16 | `src/extractors/connectors/duckdb_connector.py` | `connectors/duckdb.ts` | `duckdb` |
| 17 | `src/extractors/connectors/azure_sql_connector.py` | `connectors/azure-sql.ts` | `mssql` |
| 18 | `src/extractors/connectors/cosmosdb_connector.py` | `connectors/cosmosdb.ts` | `@azure/cosmos` |
| 19 | `src/extractors/connectors/spanner_connector.py` | `connectors/spanner.ts` | `@google-cloud/spanner` |
| 20 | `src/extractors/connectors/singlestore_connector.py` | `connectors/singlestore.ts` | `mysql2` |

### Analytics Connectors

| # | DMS Source | Pulsyn Target | npm Package |
|---|-----------|---------------|-------------|
| 21 | `src/extractors/connectors/amplitude_connector.py` | `connectors/amplitude.ts` | REST API |
| 22 | `src/extractors/connectors/google_analytics_connector.py` | `connectors/google-analytics.ts` | `@google-analytics/data` |
| 23 | `src/extractors/connectors/mixpanel_connector.py` | `connectors/mixpanel.ts` | REST API |
| 24 | `src/extractors/connectors/posthog_connector.py` | `connectors/posthog.ts` | REST API |

### Cloud Storage

| # | DMS Source | Pulsyn Target | npm Package |
|---|-----------|---------------|-------------|
| 25 | `src/extractors/connectors/s3_files_connector.py` | `connectors/s3.ts` | `@aws-sdk/client-s3` |
| 26 | `src/extractors/connectors/azure_blob_connector.py` | `connectors/azure-blob.ts` | `@azure/storage-blob` |
| 27 | `src/extractors/connectors/gcs_connector.py` | `connectors/gcs.ts` | `@google-cloud/storage` |

### Conversion Rules

```typescript
// Each connector must:
// 1. Import its own npm driver
// 2. Extend BaseConnector from './base'
// 3. Register with @registerSource('name')
// 4. Implement: connect, disconnect, testConnection, getTables, getTableSchema
// 5. Implement: extractFull, extractIncremental (DMS pattern)
// 6. Handle errors with try/catch and proper cleanup
// 7. Use connection pooling from the driver

// Example:
import { BaseConnector } from './base';
import { registerSource } from './registry';

@registerSource('github')
export class GitHubConnector extends BaseConnector {
  // ... implementation
}
```

---

## PART 2: BI LIBERATION (6 parsers)

### Parsers

| # | DMS Source | Pulsyn Target | npm Package |
|---|-----------|---------------|-------------|
| 1 | `src/bi/models.py` | `packages/core/src/bi/models.ts` | — (interfaces) |
| 2 | `src/bi/parsers/powerbi_parser.py` | `packages/core/src/bi/parsers/powerbi.ts` | `jszip` |
| 3 | `src/bi/parsers/tableau_parser.py` | `packages/core/src/bi/parsers/tableau.ts` | `fast-xml-parser` |
| 4 | `src/bi/parsers/excel_parser.py` | `packages/core/src/bi/parsers/excel.ts` | `exceljs` |
| 5 | `src/bi/parsers/pdf_parser.py` | `packages/core/src/bi/parsers/pdf.ts` | `pdf-parse` |
| 6 | `src/bi/parsers/qlik_parser.py` | `packages/core/src/bi/parsers/qlik.ts` | `jszip` |
| 7 | `src/bi/parsers/ssrs_parser.py` | `packages/core/src/bi/parsers/ssrs.ts` | `fast-xml-parser` |

### Renderer

| # | DMS Source | Pulsyn Target | Notes |
|---|-----------|---------------|-------|
| 8 | `src/bi/renderer/html_renderer.py` | `packages/core/src/bi/renderer/html.ts` | Standalone HTML with ECharts |
| 9 | `src/bi/renderer/chart_templates.py` | `packages/core/src/bi/renderer/charts.ts` | 11 chart type configs |
| 10 | `src/bi/renderer/interactive.py` | `packages/core/src/bi/renderer/interactive.ts` | Cross-filter, drill-down, WebSocket |

### Parser Output Format

```typescript
interface ParseResult {
  success: boolean;
  dashboard?: DashboardDefinition;
  errors: string[];
  warnings: string[];
}

interface DashboardDefinition {
  title: string;
  pages: PageSpec[];
  dataSources: DataSourceSpec[];
  measures: MeasureSpec[];
}
```

---

## PART 3: TESTING SUITE (37 conformance tests)

### Conformance Tests

| # | DMS Source | Pulsyn Target | Tests |
|---|-----------|---------------|-------|
| 1 | `tests/conformance/conftest.py` | `__tests__/conformance/conftest.ts` | Shared fixtures |
| 2 | `tests/conformance/test_connection.py` | `__tests__/conformance/test-connection.ts` | 6 connection tests |
| 3 | `tests/conformance/test_discovery.py` | `__tests__/conformance/test-discovery.ts` | 6 metadata tests |
| 4 | `tests/conformance/test_extraction.py` | `__tests__/conformance/test-extraction.ts` | 7 extraction tests |
| 5 | `tests/conformance/test_loading.py` | `__tests__/conformance/test-loading.ts` | 6 write tests |
| 6 | `tests/conformance/test_schema_evolution.py` | `__tests__/conformance/test-schema-evolution.ts` | 4 DDL tests |
| 7 | `tests/conformance/test_reliability.py` | `__tests__/conformance/test-reliability.ts` | 5 failure tests |
| 8 | `tests/conformance/test_security.py` | `__tests__/conformance/test-security.ts` | 3 secrets tests |

### Fault Injection

| # | DMS Source | Pulsyn Target | Scenarios |
|---|-----------|---------------|-----------|
| 9 | `tests/conformance/fault_injection.py` | `__tests__/fault-injection.ts` | 11 scenarios |

### Test Environments

| # | DMS Source | Pulsyn Target | Purpose |
|---|-----------|---------------|---------|
| 10 | `tests/conformance/environments/base.ts` | `__tests__/conformance/env/base.ts` | Abstract test env |
| 11 | `tests/conformance/environments/inmemory.ts` | `__tests__/conformance/env/inmemory.ts` | SQLite/PGMem |
| 12 | `tests/conformance/environments/docker.ts` | `__tests__/conformance/env/docker.ts` | Docker Compose |

---

## PART 4: TESTING LAB INFRASTRUCTURE

### Docker

| File | Purpose |
|------|---------|
| `docker/docker-compose.test.yml` | Add: MongoDB replica set, Redis keyspace, Elasticsearch, Cassandra, ClickHouse |
| `docker/docker-compose.certification.yml` | Dedicated certification environment |

### CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/connector-tests.yml` | Run connector tests on PR |
| `.github/workflows/certification.yml` | Run certification suite nightly |
| `scripts/run-certification.sh` | CLI runner for local certification |

### Cloud Lab

| File | Purpose |
|------|---------|
| `scripts/setup-cloud-lab.sh` | Setup free-tier databases |
| `scripts/setup-cloud-lab.ps1` | Windows version |

Free tiers to use:
- **Neon** (PostgreSQL) — free tier, 0.5GB
- **PlanetScale** (MySQL) — free tier, 5GB
- **MongoDB Atlas** — free tier, 512MB
- **Snowflake** — free trial, $400 credits
- **BigQuery** — free tier, 10GB + 1TB queries

---

## PART 5: MARKET RESEARCH DOCUMENTS

| File | Content |
|------|---------|
| `docs/research/CDC_MARKET_2026.md` | Market size ($3.2B→$12.8B), growth (CAGR 26%), trends |
| `docs/research/COMPETITOR_DEEP_DIVE.md` | Fivetran, Airbyte, Estuary, Confluent, Debezium analysis |
| `docs/research/CUSTOMER_INTERVIEWS.md` | Template for customer discovery interviews |
| `docs/research/PRICING_STRATEGY.md` | Pricing analysis vs competitors |
| `docs/research/GTM_PLAYBOOK.md` | Go-to-market strategy, channels, timeline |

---

## EXPECTED OUTCOME

| Component | Before | After |
|-----------|--------|-------|
| **Connectors** | 31 | **58** |
| **BI Parsers** | 0 | **6** |
| **Certification Tests** | 10 | **47** |
| **Fault Injection** | 0 | **11** |
| **Test Environments** | 1 | **3** |
| **Market Research** | 0 | **5 docs** |
| **Total Tests** | 18 | **150+** |

---

## CONVERSION RULES (apply to all)

1. Python typing → TypeScript interfaces
2. Pydantic → TypeScript with zod validation
3. SQLAlchemy → native npm driver (pg, mysql2, mongodb, etc.)
4. zipfile → JSZip
5. xml.etree → fast-xml-parser
6. pdfplumber → pdf-parse
7. openpyxl → exceljs
8. Self-contained: each file standalone
9. Error handling: try/catch with graceful fallback
10. Register connectors with `@registerSource('name')` decorator
