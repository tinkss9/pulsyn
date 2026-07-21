# Pulsyn

**The AI-Native CDC Platform**

Real-time change data capture without the complexity. No Kafka dependency. No vendor lock-in. Just data flowing.

## Features

- **Log-based CDC** — PostgreSQL, MySQL, Oracle, SQL Server
- **Checkpoint Recovery** — Resume from last known good state
- **Web UI** — Visual pipeline management and monitoring
- **CLI** — Command-line interface for automation
- **MCP Server** — AI agent integration
- **Data Masking** — In-flight masking during replication
- **Connector Certification** — Benchmarked source/target pairs

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
| **Community** | Free | Core CDC, 3 connectors, CLI, self-hosted |
| **Pro** | $300/mo | Full UI, MCP, all connectors, API, masking |
| **Business** | $2,000/mo | SLA, priority support, enterprise features |
| **Enterprise** | Custom | Air-gapped, dedicated support, custom connectors |

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
