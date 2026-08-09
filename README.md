# Pulsyn

**The AI-Native CDC Platform**

Real-time change data capture without the complexity. No Kafka dependency. No vendor lock-in. Just data flowing.

## Features

- **Real-time CDC** — Sub-second latency via log-based replication
- **52 Connectors** — 12 databases, 40 SaaS (4 certified, 8 verified, 40 preview)
- **Checkpoint Recovery** — Resume from last known good state
- **Web UI** — Visual pipeline management and monitoring
- **CLI** — 35+ commands for automation
- **MCP Server** — 26 tools for AI agent integration
- **Data Masking** — In-flight masking during replication
- **Connector Certification** — Benchmarked source/target pairs

## Certified Connectors

| Connector | Type | Driver | CDC Method |
|-----------|------|--------|------------|
| PostgreSQL | Source + Target | pg | wal2json + pgoutput |
| MySQL | Source | mysql2/promise | Poll-based watermark |
| MongoDB | Source | mongodb | Change Streams |
| Redis | Source | ioredis | Keyspace notifications |

## Verified Connectors

| Connector | Type | Driver | CDC Method |
|-----------|------|--------|------------|
| SQL Server | Source | mssql | Change Tracking |
| DynamoDB | Source | @aws-sdk/client-dynamodb | DynamoDB Streams |
| Kafka | Source | kafkajs | Consumer groups |
| CosmosDB | Source | @azure/cosmos | Change Feed |
| S3 | Source | @aws-sdk/client-s3 | Polling |
| Supabase | Source | REST (fetch) | Polling |
| Snowflake | Target | snowflake-sdk | N/A (write-only) |
| BigQuery | Target | @google-cloud/bigquery | N/A (write-only) |

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
