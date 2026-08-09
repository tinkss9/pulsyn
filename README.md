# Pulsyn

**The AI-Native CDC Platform**

Real-time change data capture without the complexity. No Kafka dependency. No vendor lock-in. Just data flowing.

## Features

- **Real-time CDC** — Sub-second latency via log-based replication
- **320 Certified Connectors** — 19 database engines + 301 SaaS integrations
- **Checkpoint Recovery** — Resume from last known good state
- **Web UI** — Visual pipeline management and monitoring
- **CLI** — 35+ commands for automation
- **MCP Server** — 26 tools for AI agent integration
- **Data Masking** — In-flight masking during replication
- **Connector Certification** — Benchmarked via Vitest + Docker tests

## Certification

- **Lane B (19):** Database connectors with native drivers — PostgreSQL, MySQL, MongoDB, Redis, SQL Server, ClickHouse, Elasticsearch, Neo4j, InfluxDB, MariaDB, CockroachDB, TimescaleDB, DuckDB, S3, CouchDB, Couchbase, Firebase, Supabase, Kafka
- **Lane A (301):** SaaS connectors with REST API endpoints — Stripe, Salesforce, HubSpot, GitHub, Slack, Jira, Notion, and 294 more
- **Pass Rates:** 42 at 100%, 292 at 90%+, 297 at 80%+
- **Methodology:** Vitest live API tests + Docker database tests
- **Details:** See `docs/lab/cert-matrix.json`

## Quick Start

```bash
# Install
docker pull pulsyn/pulsyn:latest

# Run
docker run -d -p 8080:8080 pulsyn/pulsyn

# Open
open http://localhost:8080
```

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Community** | Free | 3 pipelines, 50K rows/day, 3 connectors |
| **Pro** | $499/mo | Unlimited pipelines, 5M rows/day, all connectors, MCP |
| **Business** | $3,500/mo | 100M rows/day, SSO, custom connectors, 99.9% SLA |
| **Enterprise** | Custom | Unlimited, on-prem, dedicated engineer |

## Development

```bash
# Clone
git clone https://github.com/tinkss9/pulsyn.git
cd pulsyn

# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm run test
```

## License

Apache 2.0 (core engine) | Proprietary (UI, SaaS, MCP)
