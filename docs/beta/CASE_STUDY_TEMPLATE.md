# Pulsyn Beta Case Study Template

## Instructions
Fill in each section with real data from the beta engagement. Remove this instruction block before publishing.

---

# {{Company Name}}: {{One-Line Result Summary}}

**Example:** "How Acme Analytics cut Snowflake data latency from 45 minutes to under 1 second with Pulsyn"

## Company Snapshot

| Field | Details |
|---|---|
| **Company** | {{Company Name}} |
| **Industry** | {{Industry}} |
| **Team size** | {{Data team size}} |
| **Use case** | {{Primary use case for CDC}} |
| **Stack** | PostgreSQL {{version}} → Snowflake |
| **Before Pulsyn** | {{Previous solution: Fivetran / Debezium+Kafka / Airbyte / Batch ETL}} |
| **After Pulsyn** | Real-time CDC, sub-second latency |
| **Beta duration** | {{Weeks in beta}} |

---

## The Challenge

{{2-3 paragraphs describing the problem. Be specific about pain points, costs, and operational burden.}}

### Quantified pain points:
- **Data latency:** {{Before: e.g., "45 minutes average, up to 4 hours during peak"}}
- **Monthly cost:** {{Before: e.g., "$8,200/mo on Fivetran"}}
- **Engineering hours:** {{Before: e.g., "15 hours/week maintaining Debezium + Kafka"}}
- **Data freshness impact:** {{e.g., "Customer dashboards showed stale data, leading to support tickets"}}

### What they tried before:
{{Describe previous solutions and why they didn't work}}

---

## The Solution

### Why Pulsyn:
{{2-3 sentences on why they chose Pulsyn over alternatives}}

### Implementation timeline:

| Phase | Duration | What happened |
|---|---|---|
| Setup call | 30 minutes | Discussed architecture, identified tables, planned migration |
| Initial setup | {{Duration}} | Created replication slot, configured Snowflake credentials |
| Full load | {{Duration}} | Initial table snapshot ({{X}} GB, {{Y}} tables) |
| CDC validation | {{Duration}} | Verified sub-second latency, tested schema evolution |
| Production cutover | {{Duration}} | Switched all consumers to Pulsyn-fed tables |

### Architecture:

```
PostgreSQL ({{version}}, {{hosting}}) 
    → Pulsyn CDC Engine 
        → Snowpipe Streaming 
            → Snowflake ({{warehouse size}})
```

### Tables replicated:
- {{Table 1}}: {{Row count}}, {{Change frequency}}
- {{Table 2}}: {{Row count}}, {{Change frequency}}
- {{Table 3}}: {{Row count}}, {{Change frequency}}
- **Total:** {{N}} tables, {{M}} rows, {{O}} GB

---

## The Results

### Key metrics:

| Metric | Before | After | Improvement |
|---|---|---|---|
| **Data latency** | {{Before}} | {{After}} | {{% improvement}} |
| **Monthly cost** | {{Before}} | $499/mo | {{% savings}} |
| **Engineering hours** | {{Before}} | {{After}} | {{% reduction}} |
| **Pipeline incidents** | {{Before}}/month | {{After}}/month | {{% reduction}} |
| **Analyst satisfaction** | {{Before}}/10 | {{After}}/10 | {{Improvement}} |

### Business impact:

{{2-3 paragraphs on how real-time data impacted their business. Be specific.}}

**Example metrics to include:**
- Revenue impact of faster data (if applicable)
- Customer satisfaction improvement
- Time-to-insight reduction
- New use cases enabled by real-time data

---

## Technical Deep-Dive

### Schema evolution:
{{Describe how Pulsyn handled schema changes during the beta. Include specific examples.}}

**Example:** "During week 3, the team added 3 columns to their `orders` table and changed the `status` column from VARCHAR to ENUM. Pulsyn propagated both changes to Snowflake within 2 seconds without manual intervention."

### Edge cases encountered:
{{List any edge cases, how they were handled, and what was learned}}

**Example edge cases:**
- Large transactions (>100K rows)
- DDL changes during high-traffic periods
- JSONB columns with deeply nested structures
- Partitioned tables
- Replication slot growth during maintenance windows

### Performance benchmarks:

| Metric | Value |
|---|---|
| Avg end-to-end latency | {{X}}ms |
| P95 latency | {{X}}ms |
| P99 latency | {{X}}ms |
| Peak throughput | {{X}} rows/sec |
| Snowflake warehouse size | {{Size}} |
| Replication lag | {{X}}ms |

---

## What They Said

### Primary quote:
> "{{Full quote from primary contact about their experience}}"
>
> — **{{Name}}**, {{Title}} at {{Company}}

### Supporting quote (optional):
> "{{Quote from another team member, analyst, or stakeholder}}"
>
> — **{{Name}}**, {{Title}} at {{Company}}

---

## Lessons Learned

### What worked well:
- {{Lesson 1}}
- {{Lesson 2}}
- {{Lesson 3}}

### What we improved during the beta:
- {{Improvement 1 — what feedback led to it}}
- {{Improvement 2}}

### Recommendations for similar teams:
- {{Recommendation 1}}
- {{Recommendation 2}}

---

## What's Next

{{1 paragraph on the customer's plans going forward. New connectors, expanded usage, etc.}}

---

## Tags

`#cdc` `#postgresql` `#snowflake` `#real-time-data` `#data-engineering` `#pulsyn`

---

## Publishing Checklist

- [ ] Customer approved final draft
- [ ] All quotes verified and attributed
- [ ] Metrics validated with customer's data team
- [ ] Company logo obtained (if permitted)
- [ ] Customer headshot obtained (if permitted)
- [ ] Legal review completed (if required)
- [ ] Published to website `/case-studies/{{slug}}`
- [ ] Shared on social media
- [ ] Included in sales collateral

---

## Case Study Length Guide

| Section | Target word count |
|---|---|
| Company Snapshot | Table (no word count) |
| The Challenge | 200-300 words |
| The Solution | 300-400 words |
| The Results | 200-300 words |
| Technical Deep-Dive | 300-400 words |
| What They Said | 50-100 words |
| Lessons Learned | 100-150 words |
| What's Next | 50-100 words |
| **Total** | **1,200-1,750 words** |

---

## Distribution Plan

Once published:
- [ ] Share on LinkedIn (tag customer if permitted)
- [ ] Post summary on Twitter/X with link
- [ ] Include in email sequences for similar prospects
- [ ] Add to sales deck
- [ ] Submit to relevant newsletters (data engineering roundups)
- [ ] Cross-post summary to r/dataengineering (with permission)
