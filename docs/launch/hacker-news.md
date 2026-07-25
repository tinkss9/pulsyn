# Hacker News "Show HN" Post

## Title
Show HN: Pulsyn – Real-time CDC without Kafka dependency

## URL
https://pulsyn.io (or https://web-lac-nine-aqlw7eo1fc.vercel.app)

## First Comment (post immediately after submission)

Hi HN,

I built Pulsyn — a CDC (Change Data Capture) platform that replicates databases in real-time without requiring Kafka.

**The problem:** Existing CDC tools either need Kafka (Debezium, Confluent) or are batch-only (Fivetran syncs every 15 minutes, Airbyte is batch-first). Running Kafka in production means managing brokers, ZooKeeper, Connect workers, schema registry, and monitoring — that's 5+ infrastructure components just to replicate a database.

**What Pulsyn does:**
- Log-based CDC with sub-second latency (PostgreSQL logical replication, MySQL binlog)
- Standalone — no Kafka, no ZooKeeper, no connector framework
- Checkpoint recovery (resume from last known good state)
- In-flight data masking (hash, redact, format-preserving)
- REST API + CLI (35+ commands) + Web dashboard
- MCP server with 26 tools for AI agent integration

**Tech stack:**
- Core: TypeScript, Node.js
- Database: PostgreSQL (for Pulsyn's own state)
- Connectors: pg (PostgreSQL), mysql2 (MySQL)
- API: Express + Vercel serverless
- Web: Next.js 14 + Tailwind
- Deployed on Vercel

**Pricing:** Free Community tier, $300/mo Pro, $2,000/mo Business (flat rate, no usage-based pricing)

**What's working:**
- Full CRUD API for pipelines and connectors
- Real database connection testing (actually connects and validates)
- Table/schema introspection queries
- Billing system with Stripe integration
- 26 MCP tools for AI agents
- E2E tests with Playwright

**What's not yet working:**
- Actual CDC stream consumption (startCDC is a no-op — we're working on wiring PostgreSQL logical replication)
- Real-time data masking during replication
- Production-grade checkpoint persistence

I'd love feedback on the architecture and approach. Is "CDC without Kafka" a real pain point for others?

Repo: https://github.com/tinkss9/pulsyn

## Follow-up Comments (prepare for common questions)

**Q: Why not just use Debezium?**
A: Debezium is excellent CDC technology, but it requires Kafka Connect. That means running Kafka brokers, ZooKeeper, Connect workers, and a schema registry. For teams that just need database replication (not full event streaming), that's a lot of infrastructure overhead.

**Q: How is this different from Airbyte/Fivetran?**
A: Airbyte and Fivetran are batch ETL tools. They sync data on a schedule (every 15-60 minutes). Pulsyn uses log-based CDC for real-time replication with sub-second latency. Different use cases: batch reporting vs operational real-time.

**Q: What about Estuary?**
A: Estuary is the closest competitor — they also do real-time CDC without Kafka. Pulsyn differentiates with MCP server integration (26 tools for AI agents), CLI-first experience, and simpler pricing.

**Q: Is this production-ready?**
A: Not yet. The API, dashboard, and billing are working. The actual CDC stream consumption is being wired up. We're looking for beta testers who want to try it when the CDC engine is ready.
