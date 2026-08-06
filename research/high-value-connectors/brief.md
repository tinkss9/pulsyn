# Research Brief: High-Value Connectors for Pulsyn CDC Platform

**Date:** 2026-08-07
**Depth:** standard
**Audience:** Pulsyn product team — deciding which connectors to build first

## Research Question

What are the most popular and highest-demand connectors across major CDC/ETL platforms (Fivetran, Airbyte, Stitch Data, Meltano, Hevo Data, Estuary, etc.)? Which connectors should Pulsyn prioritize for maximum market coverage?

## Scope

**In scope:**
- Top 20-30 most-used connectors by category (databases, SaaS apps, cloud platforms)
- Published stats on connector usage/popularity from vendor sites, blogs, docs
- Connector tiers (essential, popular, community) and what vendors prioritize for new customers
- Pricing tier alignment (which connectors are free vs paid)

**Out of scope:**
- Deep technical implementation details of each connector
- Competitive feature-by-feature comparison of platforms
- Internal/private connector usage data

## Angles

1. **Fivetran connectors** — official connector catalog, tiers, popular/essential designations
2. **Airbyte connectors** — connector catalog, marketplace vs certified, usage signals
3. **Stitch Data + Meltano** — Singer ecosystem, Stitch connector list, Meltano Hub stats
4. **Other platforms** — Hevo Data, Estuary, Qlik (Attunity), Debezium ecosystem
5. **Cross-platform consensus** — which connectors appear on EVERY platform's "top" list

## Assumptions

- Public-facing data (website ordering, docs, blog posts) is the primary signal
- "Listed first" or "featured" = vendor's assessment of demand
- Connector count and marketplace size are proxies for ecosystem maturity
- We treat multiple platforms listing the same connector as strong validation
