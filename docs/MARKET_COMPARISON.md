# Pulsyn vs Competitors — Comparison Table

## Feature Comparison

| Feature | **Pulsyn** | **Fivetran** | **dbt** | **Qlik Replicate** |
|---------|-----------|-------------|---------|-------------------|
| **Type** | CDC Platform | ETL/ELT | Data Transformation | CDC/ETL |
| **Latency** | **<1 second** | 15-60 min | N/A (batch) | Real-time |
| **Pricing** | **$0-2,000/mo flat** | $500-5,000+/mo usage | $0-10,000+/mo | $$$$ enterprise |
| **Open Source** | Core (Apache 2.0) | No | Core (Apache 2.0) | No |
| **Self-Hosted** | ✅ Yes | ❌ Cloud only | ✅ Yes | ✅ Yes |
| **Kafka Required** | ❌ No | ❌ No | ❌ No | ❌ No |
| **Connectors** | 31 (real) | 700+ (SaaS focus) | 0 (transforms only) | 100+ |
| **CDC Method** | Trigger-based | Batch polling | N/A | Log-based |
| **AI Integration** | ✅ MCP (31 tools) | ❌ None | ❌ None | ❌ None |
| **CLI** | ✅ 35+ commands | ❌ No | ✅ Yes | ❌ No |
| **API** | ✅ REST + OpenAPI | ✅ REST | ✅ REST | ✅ REST |
| **Web Dashboard** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Data Masking** | ✅ In-flight | ✅ Post-sync | ❌ No | ✅ Yes |
| **Schema Drift** | ✅ Detection | ✅ Auto | ✅ Yes | ✅ Yes |
| **Checkpoint Recovery** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Connector Cert** | ✅ Engine | ❌ No | ❌ No | ❌ No |
| **Target Audience** | Developers, SMBs | Enterprise analysts | Data engineers | Enterprise IT |

## Where Pulsyn Wins

| vs Competitor | Pulsyn Advantage |
|---------------|-----------------|
| **vs Fivetran** | 75% cheaper, real-time (not batch), CLI/API/MCP |
| **vs dbt** | CDC + replication (dbt only transforms) |
| **vs Qlik** | Modern stack, AI-native, no legacy complexity |

## Market Position

```
                    REAL-TIME ←────────────→ BATCH
                         │                    │
    COMPLEX (Kafka)      │  Confluent ($9B)   │
                         │  Debezium (free)   │
                         │                    │
                         │    ★ PULSYN ★      │  Fivetran ($5.6B)
    SIMPLE (No Kafka)    │    Estuary ($30M)  │  Airbyte ($181M)
                         │                    │  dbt ($4.2B)
                         │                    │
```

## DNS Setup for pulsynai.com

**Records needed:**
```
Type: CNAME | Name: @ | Value: cname.vercel-dns.com | TTL: 3600
Type: CNAME | Name: www | Value: cname.vercel-dns.com | TTL: 3600
```

**Then in Vercel:** Add `pulsynai.com` + `www.pulsynai.com` to web project domains.
