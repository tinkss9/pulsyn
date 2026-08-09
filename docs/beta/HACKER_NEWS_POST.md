# Hacker News — Show HN Submission

## Title

Show HN: Real-time CDC from PostgreSQL to Snowflake without Kafka ($499/mo flat)

## URL

https://pulsyn.dev (landing page)

## First Comment (post immediately after submission)

We built Pulsyn — a managed CDC (Change Data Capture) platform that replicates PostgreSQL changes to Snowflake in sub-second latency.

**Why we built this:**

The current CDC landscape is frustrating:
- **Fivetran** works but costs $5K+/mo with unpredictable per-row pricing
- **Debezium + Kafka** is powerful but requires 2+ engineers to operate
- **Airbyte** is getting better but CDC reliability and latency aren't there yet

We wanted something that:
1. Reads PostgreSQL WAL directly (logical replication, pgoutput)
2. Writes to Snowflake via Snowpipe Streaming API (not COPY INTO)
3. Has zero Kafka dependency
4. Costs a flat $499/mo regardless of row volume

**Technical architecture:**

```
PostgreSQL (WAL) → Pulsyn CDC Engine → Snowpipe Streaming → Snowflake
```

No intermediate message queues. The CDC engine reads the WAL stream, transforms to Snowflake-compatible format, and writes via the Snowpipe Streaming API. End-to-end latency: typically 200-800ms.

**What we handle:**
- Schema evolution (DDL changes propagate automatically)
- All Postgres types (JSONB → VARIANT, arrays, enums, etc.)
- Large transactions (streaming, not buffering)
- Initial full table load + ongoing CDC (snapshot + streaming)

**320 certified connectors:**

Postgres is our most mature source connector. We also have MySQL, MongoDB, and 50+ SaaS sources certified, but we're focusing the beta on Postgres → Snowflake to nail that use case first.

**MCP integration:**

We ship an MCP server so AI agents can query pipeline status, check lag, and trigger syncs. If you're building data ops tooling with LLMs, this is useful.

**Beta offer:**

We're looking for 10 teams running Postgres → Snowflake to validate our production pipeline. In exchange: 6 months free, direct Slack access with our engineers, and priority on your feature requests.

**Honest caveats:**
- We're a small team (not enterprise-grade support yet)
- Pre-SOC2 (working on it)
- Postgres CDC is battle-tested; other connectors are certified but need production-scale validation
- Self-hosted option is on the roadmap but not available yet

Happy to answer technical questions. We can also share our benchmark numbers for different table sizes and transaction volumes.

---

## Follow-up Comments (prepare in advance)

### Comment: Architecture deep-dive (post if someone asks about internals)

The CDC engine is written in Rust for throughput and low latency. Key design decisions:

1. **WAL reading:** We use PostgreSQL's logical replication protocol (pgoutput plugin). No triggers, no polling, no impact on source DB performance. We maintain a replication slot on the source.

2. **Schema handling:** We parse the WAL binary protocol to extract DDL events (ALTER TABLE, etc.) and propagate them to Snowflake. Column additions are immediate; type changes use a "new column" strategy to avoid data loss.

3. **Snowflake writes:** We use the Snowpipe Streaming API (not Snowpipe/COPY INTO). This gives us sub-second write latency vs 30-60s+ with traditional Snowpipe. The API writes micro-batches directly to table storage.

4. **Exactly-once semantics:** We track LSN (Log Sequence Number) positions in our checkpoint store. On restart, we resume from the last committed LSN. Combined with Snowflake's deduplication, this gives us exactly-once delivery.

5. **Backpressure:** If Snowflake is slow to accept writes, we buffer in memory (configurable, default 10K events) and apply backpressure to the WAL reader. We never drop events.

### Comment: Pricing question (post if someone asks about the $499 flat rate)

The $499/mo is flat — unlimited rows, unlimited tables, unlimited connectors on the Postgres → Snowflake pipeline.

Why flat pricing? CDC infrastructure cost doesn't scale linearly with row count. Whether you're replicating 1M or 1B rows/day, the infrastructure cost difference is marginal. Per-row pricing is a revenue optimization strategy, not a cost reflection.

Post-GA, we'll likely introduce tiers based on connector count (e.g., $499 for 1 source, $999 for 5 sources). Beta users keep their rate for 12 months.

### Comment: Comparison to Debezium (post if someone brings it up)

Debezium is the gold standard for CDC capture. We respect it deeply.

The difference is operational complexity:
- **Debezium:** Requires Kafka Connect, Kafka brokers, schema registry, offset management, and monitoring. Minimum viable setup is 5+ components.
- **Pulsyn:** Single managed service. You point us at your Postgres, give us Snowflake credentials, and we handle everything.

If you want full control and have a platform team to manage Kafka, Debezium is great. If you want CDC-as-a-service with sub-second latency and zero ops, that's us.

### Comment: Why not Airbyte CDC? (post if someone asks)

Airbyte's CDC implementation uses Debezium under the hood, which means you're still dealing with the same complexity if self-hosting. On Airbyte Cloud, CDC latency has been reported at 5-15 minutes in practice (not the theoretical minimum).

We built our CDC engine from scratch (in Rust) specifically for the Postgres → Snowflake path. This lets us optimize end-to-end rather than bolting CDC onto a batch ELT framework.

### Comment: Data security question (post if someone asks)

- Data is encrypted in transit (TLS 1.3) and at rest (AES-256)
- We store replication metadata (LSN positions, schema state) but not the actual data — it streams through without persistence
- SOC2 Type II is in progress (target Q1 2027)
- We support VPC peering for enterprise customers
- Data never leaves your chosen region (US-East, EU-West, or AP-Southeast)

---

## HN Engagement Strategy

### Timing
- **Best time to post:** Tuesday-Thursday, 10-11 AM EST
- **Avoid:** Friday afternoon, weekends, holidays

### Rules
- Reply to every substantive comment within 1 hour
- Be technical and precise — HN audience is sophisticated
- Don't be defensive about limitations
- Share actual numbers, not marketing claims
- If someone points out a flaw, acknowledge it and explain your reasoning

### Upvote Strategy
- Share the link in relevant Slack communities (dbt, Snowflake, Postgres)
- Ask early beta users to comment with their experience
- Don't brigade — organic engagement only
