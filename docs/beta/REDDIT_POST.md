# Reddit Posts — Beta Launch

## r/dataengineering

### Post Title
We built real-time CDC from PostgreSQL to Snowflake without Kafka. Looking for 10 beta teams.

### Post Body

Hey r/dataengineering,

We've been building a CDC platform called **Pulsyn** and we're at the point where we need real-world validation from teams running PostgreSQL + Snowflake.

**The problem we're solving:**

Getting data from Postgres into Snowflake in real-time currently requires one of:
1. Fivetran ($5K+/mo with row-based pricing that gets unpredictable)
2. Custom Debezium + Kafka + Snowpipe (2+ engineers to build and maintain)
3. Airbyte Cloud (improving but still has latency and reliability gaps for CDC)
4. Batch ETL (analysts work with stale data)

**What Pulsyn does:**

- Reads PostgreSQL WAL directly for sub-second change capture
- Writes to Snowflake via Snowpipe Streaming (not COPY INTO)
- Manages schema evolution automatically (new columns, type changes)
- No Kafka, no Zookeeper, no schema registry to operate
- 320 certified connectors (Postgres is our most mature, but we have MySQL, MongoDB, 50+ SaaS sources)
- $499/mo flat — unlimited rows, unlimited tables

**What's different from existing tools:**

We're not trying to be a general ELT platform. We focus specifically on CDC (change data capture) and we do it well. The architecture is:

```
PostgreSQL WAL → Pulsyn CDC Engine → Snowpipe Streaming → Snowflake
```

No intermediate message queues. No batch micro-batches. Just WAL → destination.

**MCP integration for AI agents:**

We also ship an MCP server, so if you're building data pipeline monitoring into AI agents (Claude, GPT, etc.), you can query pipeline health, trigger syncs, and check lag directly from your agent.

**What we're looking for:**

10 teams running PostgreSQL (any version 12+) as a source and Snowflake as a destination. In exchange for your feedback:

- 6 months free during beta
- Direct Slack channel with our engineers
- Priority on your specific feature requests
- Optional co-authored case study

**What we're NOT looking for:**

- Teams who need to migrate off Postgres (we're CDC, not migration)
- Non-Postgres sources right now (MySQL/MongoDB CDC is coming in Q4)
- Teams with <1GB databases (batch is probably fine for you)

**Honest caveats:**

- We're a small team. Support is async Slack, not 24/7 enterprise SLA.
- Our Postgres connector is battle-tested; other connectors are certified but haven't been through production-scale beta yet.
- We're pre-SOC2 (working on it). If you need SOC2 today, we're not ready.

If this sounds useful, drop a comment or DM me. Happy to do a 15-min technical walkthrough.

---

### Comment Prep (common questions)

**Q: How does this compare to Debezium?**
A: Debezium is the gold standard for CDC capture. We use similar WAL-reading techniques but package it as a managed service — no Kafka Connect, no schema registry, no offset management. Think of it as "Debezium-as-a-service" with Snowflake-native output.

**Q: What about data types? Does it handle JSONB, arrays, etc.?**
A: Yes. JSONB maps to VARIANT in Snowflake. Arrays map to ARRAY. We handle all standard Postgres types including geometric types, network addresses, and custom enums.

**Q: How do you handle schema changes?**
A: DDL changes (ADD COLUMN, ALTER TYPE) are captured from the WAL and applied to Snowflake automatically. Column renames and drops are handled with a configurable strategy (rename old + create new, or just add new).

**Q: $499/mo flat — what's the catch?**
A: No catch during beta. Post-GA, we'll likely introduce tiered pricing but beta users keep their rate for 12 months. We don't charge per row because CDC infrastructure cost doesn't scale linearly with row count — it scales with connector count and throughput.

**Q: Can I self-host?**
A: Not yet. Self-hosted is on our roadmap for enterprise customers who need data residency guarantees.

---

## r/snowflake

### Post Title
Real-time CDC from PostgreSQL to Snowflake — sub-second latency, no Kafka, beta access

### Post Body

Hey r/snowflake,

If you're loading data from PostgreSQL into Snowflake and frustrated with batch latency or Fivetran costs, we're building something you might want to try.

**Pulsyn** = real-time CDC from PostgreSQL directly to Snowflake via Snowpipe Streaming.

**Key details:**
- **Latency:** Sub-second from Postgres commit to Snowflake queryable
- **Method:** WAL replication → Snowpipe Streaming (not COPY INTO / Snowpipe)
- **Schema evolution:** Automatic — DDL changes propagate without manual intervention
- **Pricing:** $499/mo flat (no per-row, no per-connector tiers)
- **Ops:** Fully managed, no Kafka/Zookeeper to operate

**Why Snowpipe Streaming matters:**

Most CDC tools use Snowpipe (COPY INTO) which introduces 30-60s+ latency at the Snowflake layer even if capture is fast. We use Snowpipe Streaming API which writes micro-batches directly to the table, keeping end-to-end latency under 1 second.

**Beta offer:**

10 teams get 6 months free + direct engineering support. We're specifically looking for PostgreSQL → Snowflake pipelines to validate before expanding to other sources.

If you're interested, comment or DM me. Happy to share architecture docs and do a quick demo.

---

## r/postgresql

### Post Title
We read your WAL for real-time replication to Snowflake — looking for beta testers

### Post Body

Hey r/postgresql,

We built a CDC platform that reads PostgreSQL WAL (Write-Ahead Log) to replicate changes to Snowflake in real-time. We're looking for 10 beta teams to validate the production pipeline.

**Technical details:**

- Uses logical replication (pgoutput plugin) to read WAL
- Sub-second latency from Postgres commit to Snowflake queryable
- Handles all standard types: JSONB → VARIANT, arrays → ARRAY, enums, etc.
- Schema evolution: DDL changes (ADD COLUMN, ALTER TYPE) auto-propagate
- No triggers, no polling, no impact on source DB performance
- Supports Postgres 12+ (including RDS, Aurora, Supabase, self-hosted)

**What we need from your Postgres:**
- `wal_level = logical` (or willingness to change it)
- A replication slot we can create
- A publication for the tables you want to replicate

**Setup time:** ~15 minutes. We walk you through creating the replication slot and publication, then handle everything else.

**Beta perks:**
- 6 months free
- Direct Slack with our engineering team
- Priority bug fixes for your specific Postgres config

**Honest note:** We're a small team. Our Postgres connector is mature but we're specifically looking for edge cases — complex schemas, high-throughput tables, unusual data types, partitioned tables, etc.

Interested? Drop a comment or DM.

---

## Posting Strategy

### Timing
- **r/dataengineering:** Tuesday or Wednesday, 9-11 AM EST (peak engagement)
- **r/snowflake:** Wednesday or Thursday, 10 AM - 1 PM EST
- **r/postgresql:** Tuesday or Wednesday, 10 AM - 12 PM EST

### Engagement Rules
- Reply to EVERY comment within 2 hours
- Be technical and honest — no marketing speak
- If someone asks about a limitation, admit it and share the roadmap
- Share architecture diagrams if asked
- Don't post the same content to all 3 subs on the same day (stagger by 2-3 days)

### Follow-up Posts (Week 2-3)
- "Update: Here's what we learned from our first 5 beta users"
- Technical deep-dive: "How we built sub-second CDC without Kafka"
- Benchmark post: "Postgres WAL replication latency benchmarks (p50, p95, p99)"
