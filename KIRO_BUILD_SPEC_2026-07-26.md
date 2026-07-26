# PULSYN BUILD SPEC — KIRO EDITION
## Date: 2026-07-26 | Target: C:\Users\onein\pulsyn

---

## YOUR MISSION

Build **energy/utility connectors**, **BI Liberation tools**, and **certification tests** for the Pulsyn CDC platform.

**Source:** `source_new_2.zip` (8,298 Python files from DMS Replicate)
**Target:** TypeScript files for Pulsyn monorepo

---

## PART 1: ENERGY & UTILITY CONNECTORS (Priority 1)

Convert these DMS Python connectors to TypeScript:

| # | DMS Source | Pulsyn Target | npm Package | Industry |
|---|-----------|---------------|-------------|----------|
| 1 | `src/extractors/connectors/sap_connector.py` | `connectors/sap.ts` | `node-rfc` | Utility ERP |
| 2 | `src/extractors/connectors/oracle_connector.py` | `connectors/oracle.ts` | `oracledb` | Utility billing |
| 3 | `src/extractors/connectors/postgres_connector.py` | `connectors/postgresql.ts` | `pg` | Grid data |
| 4 | `src/extractors/connectors/mysql_connector.py` | `connectors/mysql.ts` | `mysql2` | Meter data |
| 5 | `src/extractors/connectors/kafka_connector.py` | `connectors/kafka.ts` | `kafkajs` | Real-time streams |
| 6 | `src/extractors/connectors/rest_api_connector.py` | `connectors/rest-api.ts` | `node-fetch` | AEMO/ENTSO-E APIs |
| 7 | `src/extractors/connectors/csv_connector.py` | `connectors/csv.ts` | `csv-parse` | Meter readings |
| 8 | `src/extractors/connectors/s3_files_connector.py` | `connectors/s3.ts` | `@aws-sdk/client-s3` | Cloud storage |

**Add these energy-specific connectors:**

| # | Connector | API/Protocol | Use Case |
|---|-----------|-------------|----------|
| 9 | **AEMO NEMWEB** | REST + CSV | Australian energy market data |
| 10 | **ENTSO-E** | REST (TP API) | European transparency platform |
| 11 | **ERCOT** | REST | Texas energy market |
| 12 | **Gentrack G2** | Database + REST | Utility billing platform |
| 13 | **Gentrack Kraken** | REST | Modern utility billing |
| 14 | **SAP IS-U** | RFC + BAPI | Utility industry ERP |
| 15 | **Oracle Utilities** | REST + DB | Utility billing |
| 16 | **NZ Electricity Authority** | REST (em6 API) | NZ spot prices |

**For energy APIs without npm packages, use:**
```typescript
// Direct REST API with fetch
const response = await fetch('https://api.aemo.com.au/data/...', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
const data = await response.json();
```

---

## PART 2: BI LIBERATION (Priority 2)

Convert these DMS Python parsers to TypeScript:

| # | DMS Source | Pulsyn Target | npm Package | Parses |
|---|-----------|---------------|-------------|--------|
| 1 | `src/bi/models.py` | `packages/core/src/bi/models.ts` | — | Data models |
| 2 | `src/bi/parsers/powerbi_parser.py` | `bi/parsers/powerbi.ts` | `jszip` | .pbix files |
| 3 | `src/bi/parsers/tableau_parser.py` | `bi/parsers/tableau.ts` | `fast-xml-parser` | .twb/.twbx |
| 4 | `src/bi/parsers/excel_parser.py` | `bi/parsers/excel.ts` | `exceljs` | .xlsx |
| 5 | `src/bi/parsers/pdf_parser.py` | `bi/parsers/pdf.ts` | `pdf-parse` | PDF tables |
| 6 | `src/bi/parsers/qlik_parser.py` | `bi/parsers/qlik.ts` | `jszip` | .qvd/.qvs |
| 7 | `src/bi/parsers/ssrs_parser.py` | `bi/parsers/ssrs.ts` | `fast-xml-parser` | .rdl/.rdlc |

---

## PART 3: CERTIFICATION TESTS (Priority 3)

Port these DMS test files to TypeScript (vitest):

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
| 9 | `tests/conformance/fault_injection.py` | `__tests__/fault-injection.ts` | 11 fault scenarios |

---

## CONVERSION RULES

```typescript
// 1. Python typing → TypeScript interfaces
// 2. SQLAlchemy → native npm driver (pg, mysql2, mongodb, etc.)
// 3. extract_batch() → extractFull() + extractIncremental()
// 4. Self-contained: each connector imports its own driver
// 5. Register with @registerSource('name') decorator
// 6. Error handling: try/catch with graceful cleanup
// 7. Connection pooling: use driver's native pool

// Example:
import { BaseConnector } from './base';
import { registerSource } from './registry';

@registerSource('aemo')
export class AEMOConnector extends BaseConnector {
  async connect(config: DatabaseConfig): Promise<void> { /* ... */ }
  async disconnect(): Promise<void> { /* ... */ }
  async testConnection(): Promise<boolean> { /* ... */ }
  async getTables(): Promise<string[]> { /* ... */ }
  async getTableSchema(table: string): Promise<TableSchema> { /* ... */ }
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> { /* ... */ }
  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { /* ... */ }
  async stopCDC(): Promise<void> { /* ... */ }
}
```

---

## OUTPUT FORMAT

Each file must be:
- Standalone TypeScript (no cross-file imports except base classes)
- Self-contained with its own npm driver import
- Error-handled with try/catch
- Registered with decorator

**Save to:** `C:\Users\onein\pulsyn\packages\core\src\connectors\` (connectors)
**Save to:** `C:\Users\onein\pulsyn\packages\core\src\bi\parsers\` (BI parsers)
**Save to:** `C:\Users\onein\pulsyn\packages\core\src\__tests__\conformance\` (tests)

---

## EXPECTED DELIVERABLES

| Category | Count | Files |
|----------|-------|-------|
| Energy/Utility connectors | 16 | `connectors/*.ts` |
| BI parsers | 7 | `bi/parsers/*.ts` + `bi/models.ts` |
| Certification tests | 9 | `__tests__/conformance/*.test.ts` |
| **TOTAL** | **32 files** | Ready to integrate |

---

## PART 6: MORE SAAS CONNECTORS (30 more to reach 100+)

Build these connectors to match Fivetran/Airbyte coverage:

### Video/Communication
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 1 | Zoom | `@zoom/meetings-sdk` | Meeting data, recordings |
| 2 | Google Meet | REST API | Meeting data |
| 3 | Microsoft Teams | `@microsoft/microsoft-graph-client` | Team messaging, meetings |
| 4 | Loom | REST API | Video recordings |

### Design/Creative
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 5 | Figma | REST API | Design files, comments |
| 6 | Canva | REST API | Design templates |

### Productivity
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 7 | Google Sheets | `googleapis` | Spreadsheet data |
| 8 | Google Drive | `googleapis` | File metadata |
| 9 | Dropbox | `dropbox` | File metadata |
| 10 | OneDrive | `@microsoft/microsoft-graph-client` | File metadata |
| 11 | Coda | REST API | Documents, tables |
| 12 | Coda | REST API | Documents, tables |

### Infrastructure/DevOps
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 13 | Cloudflare | `@cloudflare/workers-types` | Analytics, DNS |
| 14 | Vercel | REST API | Deployments, analytics |
| 15 | Netlify | `@netlify/api` | Deployments |
| 16 | Datadog | `@datadog/datadog-api-client` | Monitoring, metrics |
| 17 | New Relic | REST API | APM, observability |
| 18 | Grafana | REST API | Dashboards |

### Payments/Billing
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 19 | Chargebee | `chargebee` | Subscription billing |
| 20 | Recurly | `recurly` | Subscription billing |
| 21 | Square | `square` | Payments |

### Support/Success
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 22 | PagerDuty | REST API | Incident management |
| 23 | Opsgenie | REST API | Alerting |

### Marketing/Analytics
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 24 | Google Ads | `google-ads-api` | Ad campaigns |
| 25 | Meta Ads | `facebook-nodejs-business-sdk` | Facebook/Instagram ads |
| 26 | LinkedIn Ads | REST API | B2B advertising |

### Other SaaS
| # | Connector | npm Package | Use Case |
|---|-----------|-------------|----------|
| 27 | Retool | REST API | Internal tools |
| 28 | Metabase | REST API | BI dashboards |
| 29 | Circle | REST API | Community platform |
| 30 | Webflow | REST API | Website builder |

---

## AFTER YOU'RE DONE

1. Save all files to the paths above
2. Copy the entire `packages/` folder back to `C:\Users\onein\pulsyn\`
3. Tell Vishal "Kiro done" — he'll integrate and deploy
