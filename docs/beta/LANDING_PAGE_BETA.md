# Beta Landing Page Content — Pulsyn

## Page URL
`/beta` or `/early-access`

---

## Hero Section

### Headline
Real-time CDC from PostgreSQL to Snowflake

### Subheadline
Sub-second latency. $499/mo flat. No Kafka required.

### CTA Button
**Join the Beta** → (scrolls to signup form)

### Secondary CTA
[See how it works](#architecture) | [Compare pricing](#pricing)

### Trust Bar
320+ certified connectors | Sub-second latency | SOC2 in progress

---

## Problem Section

### Section Headline
Getting data into Snowflake shouldn't be this hard

### Three Problem Cards

**Card 1: The Fivetran Tax**
Your CDC bill grows with your data, not your value. $5K+/mo for a single Postgres → Snowflake pipeline. Per-row pricing that punishes growth.

**Card 2: The Kafka Burden**
Debezium + Kafka is powerful — if you have 2 platform engineers to maintain it. Schema registries, offset management, connector upgrades, monitoring. The ops cost dwarfs the tool cost.

**Card 3: The Batch Gap**
Your analysts query data that's 30 minutes to 24 hours old. Dashboards show yesterday's numbers. ML models train on stale features. Real-time decisions on batch data.

---

## Solution Section

### Section Headline
One pipeline. Real-time. Flat pricing.

### Architecture Diagram (text description for design)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PostgreSQL  │────▶│   Pulsyn    │────▶│  Snowpipe   │────▶│  Snowflake  │
│    (WAL)     │     │  CDC Engine │     │  Streaming  │     │   Tables    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                    ┌─────────────┐
                    │  MCP Server │────▶ AI Agents
                    └─────────────┘
```

### Key Benefits (icon + text)

**Sub-second latency**
WAL replication + Snowpipe Streaming = 200-800ms end-to-end. Your analysts query data that's seconds old, not hours.

**$499/mo flat**
Unlimited rows. Unlimited tables. Unlimited connectors. No per-row pricing. No surprise bills.

**Zero Kafka**
Our CDC engine handles everything. No Kafka, no Zookeeper, no schema registry. One managed service.

**320+ connectors**
Start with Postgres → Snowflake. Add MySQL, MongoDB, Salesforce, HubSpot, Stripe, and 300+ more whenever you need.

**AI-native**
MCP server built-in. Query pipeline health, check lag, trigger syncs from Claude, GPT, or any AI agent.

**Schema evolution**
New columns, type changes, DDL modifications — auto-propagated to Snowflake. No manual intervention.

---

## How It Works Section

### Section Headline
Get started in 15 minutes

### Steps

**Step 1: Connect PostgreSQL**
Grant us a replication slot and publication. We read your WAL — no triggers, no polling, no performance impact.

**Step 2: Connect Snowflake**
Provide warehouse credentials. We create target tables and configure Snowpipe Streaming.

**Step 3: Select tables**
Choose which tables to replicate. Initial full load runs automatically, then switches to real-time CDC.

**Step 4: Monitor**
Watch latency metrics in the dashboard. Set up alerts. Query status via MCP or API.

---

## Pricing Section

### Section Headline
Simple, predictable pricing

### Pricing Card

**Beta Plan**
**$499/mo** flat

- Unlimited rows
- Unlimited tables
- Unlimited connectors
- Sub-second latency
- Schema evolution
- MCP server
- Slack support
- 99.9% SLA

**Beta perk:** 6 months free for first 10 teams

[Join the Beta](#signup)

### Pricing Comparison Table

| | Pulsyn | Fivetran | Debezium + Kafka | Airbyte Cloud |
|---|---|---|---|---|
| **Monthly cost** | $499 flat | $5,000+ (per row) | $2,000+ (infra + 2 engineers) | $500-2,000 |
| **Latency** | Sub-second | 5-15 min | Sub-second | 5-15 min |
| **Kafka required** | No | No | Yes | No (uses Debezium) |
| **Ops overhead** | None | None | High | Low-Medium |
| **Schema evolution** | Automatic | Automatic | Manual | Semi-automatic |
| **MCP integration** | Yes | No | No | No |

---

## Social Proof Section

### Section Headline
Trusted by data teams

### Testimonial Slots (placeholder)

> "Pulsyn cut our data latency from 30 minutes to under a second, and our Fivetran bill from $8K to $499."
> — **{{name}}**, Data Engineering Lead at {{company}}

> "We spent 3 months building a Debezium + Kafka pipeline. Pulsyn did the same thing in 15 minutes."
> — **{{name}}**, Staff Engineer at {{company}}

> "The MCP integration is a game-changer. Our AI agents can now monitor data pipelines without custom tooling."
> — **{{name}}**, ML Engineer at {{company}}

### Metrics Bar (update with real numbers)
10 beta teams | 200-800ms avg latency | 320+ connectors | $499/mo flat

---

## FAQ Section

### Section Headline
Common questions

**How does Pulsyn compare to Fivetran?**
Fivetran is a general-purpose ELT platform with 300+ connectors. Pulsyn focuses specifically on CDC (Change Data Capture) and does it faster and cheaper. For Postgres → Snowflake, Pulsyn delivers sub-second latency at $499/mo flat vs Fivetran's 5-15 min latency at $5K+/mo with per-row pricing.

**Do I need Kafka?**
No. Pulsyn's CDC engine handles everything internally. No Kafka, no Zookeeper, no schema registry. You connect Postgres and Snowflake, and we handle the rest.

**What PostgreSQL versions are supported?**
PostgreSQL 12 and above. We support RDS, Aurora, Supabase, and self-hosted deployments. You need `wal_level = logical` enabled.

**How does schema evolution work?**
DDL changes (ALTER TABLE, ADD COLUMN, etc.) are captured from the PostgreSQL WAL and applied to Snowflake automatically. Column additions are immediate. Type changes use a safe migration strategy.

**What about data security?**
Data is encrypted in transit (TLS 1.3) and at rest (AES-256). We stream data without persistence — no data at rest in our infrastructure. SOC2 Type II certification is in progress.

**Can I try before committing?**
Yes. Beta teams get 6 months free with no commitment. We want honest feedback, not locked contracts.

**What if I need more than Postgres → Snowflake?**
We have 320+ certified connectors. MySQL, MongoDB, Salesforce, HubSpot, Stripe, and more are available. Beta focuses on Postgres → Snowflake, but you can add other connectors during or after the beta.

**Is there a self-hosted option?**
Not yet. Self-hosted deployment is on our roadmap for enterprise customers who need data residency guarantees.

---

## Signup Form Section

### Section Headline
Join the beta — 10 spots available

### Form Fields
1. **Name** (text, required)
2. **Work email** (email, required)
3. **Company** (text, required)
4. **Team size** (dropdown: 1-5, 6-20, 21-50, 50+)
5. **Current Postgres setup** (dropdown: RDS, Aurora, Supabase, Self-hosted, Other)
6. **Current Snowflake setup** (dropdown: Snowflake Cloud, Snowflake on AWS, Snowflake on GCP, Snowflake on Azure)
7. **Current data pipeline** (dropdown: Fivetran, Airbyte, Custom Debezium+Kafka, Batch ETL, Other)
8. **Monthly rows replicated** (dropdown: <1M, 1M-10M, 10M-100M, 100M+)
9. **Biggest pain point** (textarea, optional)

### Submit Button
**Request Beta Access**

### Below Form
No credit card required. We'll reach out within 24 hours to schedule your setup call.

---

## Page Metadata

### Title
Pulsyn — Real-time CDC from PostgreSQL to Snowflake | $499/mo flat

### Meta Description
Replicate PostgreSQL data to Snowflake in sub-second latency. No Kafka, no per-row pricing. $499/mo flat. 320+ certified connectors. Join the beta.

### OG Image Description
Split screen: PostgreSQL logo on left, Snowflake logo on right, Pulsyn logo in center with "Sub-second CDC" and "$499/mo" callouts

### Schema.org
```json
{
  "@type": "SoftwareApplication",
  "name": "Pulsyn",
  "applicationCategory": "DataIntegration",
  "description": "Real-time CDC from PostgreSQL to Snowflake",
  "offers": {
    "@type": "Offer",
    "price": "499",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "billingDuration": "P1M"
    }
  }
}
```
