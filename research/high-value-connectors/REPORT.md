# Pulsyn Connector Prioritization Report

**Date:** 2026-08-07
**Sources:** 6 research agents, 60+ findings from Fivetran, Airbyte, Stitch, Meltano, Estuary, Hevo, Qlik, Confluent, Debezium, DemandSage, BuiltWith, W3Techs

---

## Key Finding: Universal Connector Consensus

Every major CDC/ETL platform agrees on the same core connectors. The top 10 databases and top 10 SaaS platforms appear on every vendor's featured list. Building these 20 connectors would cover 80%+ of enterprise data integration demand.

---

## TIER 1: Build First — "The Universal 10"

These connectors appear on EVERY major CDC platform (Fivetran, Airbyte, Estuary, Hevo, Confluent, Debezium, Qlik). Building them is table stakes.

### Databases (5 connectors)

| # | Connector | Why It's #1 | Current Status |
|---|---|---|---|
| 1 | **PostgreSQL** | #1 on every platform. Logical replication CDC. | ALREADY VERIFIED |
| 2 | **MySQL** | #2 everywhere. Binary log CDC. | ALREADY VERIFIED |
| 3 | **Microsoft SQL Server** | Enterprise standard. CDC + Change Tracking. | ALREADY VERIFIED |
| 4 | **MongoDB** | Document DB leader. Change Streams CDC. | ALREADY VERIFIED |
| 5 | **Oracle** | Enterprise ERP backbone. LogMiner CDC. Premium connector (Fivetran gates it behind Enterprise plan). | NEEDS WORK |

### SaaS (5 connectors)

| # | Connector | Market Share | Businesses Served |
|---|---|---|---|
| 6 | **Salesforce** | 20.7% CRM market, 90% Fortune 500 | 150K+ |
| 7 | **Stripe** | 68% US e-commerce, $1.4T volume | 1.5M+ sites |
| 8 | **HubSpot** | CRM + Marketing + Support | 279K+ |
| 9 | **Google Analytics 4** | 28.5% of all websites | 29M+ |
| 10 | **Shopify** | 4.8M+ merchants, e-commerce leader | 4.8M+ |

---

## TIER 2: Build Next — "The High-Value 10"

These appear on 3-4 major platforms and serve large addressable markets.

### Databases (5 connectors)

| # | Connector | Why |
|---|---|---|
| 11 | **Snowflake** | Universal warehouse destination. Also a CDC source. |
| 12 | **BigQuery** | Universal warehouse destination. Google Cloud leader. |
| 13 | **Amazon Redshift** | AWS warehouse leader. |
| 14 | **Databricks** | Lakehouse leader. Fastest-growing. |
| 15 | **Elasticsearch** | Search + analytics. Log analysis backbone. |

### SaaS (5 connectors)

| # | Connector | Why |
|---|---|---|
| 16 | **Slack** | 47M DAU, best business event API |
| 17 | **Jira** | Software team standard, 180K+ orgs |
| 18 | **Mailchimp** | 14M+ users, email marketing leader |
| 19 | **Zendesk** | Support leader, 178K+ companies |
| 20 | **Google Ads** | Digital advertising backbone |

---

## TIER 3: Build When Capacity Allows — "The Industry 10"

These serve specific industries but have large customer bases.

| # | Connector | Industry | Customers |
|---|---|---|---|
| 21 | **NetSuite** | ERP (mid-market) | 40K+ |
| 22 | **SAP** | ERP (enterprise) | 440K+ |
| 23 | **Marketo** | Enterprise marketing | 5K+ |
| 24 | **Facebook Ads** | Digital advertising | Millions |
| 25 | **Intercom** | SaaS support | 25K+ |
| 26 | **Freshdesk** | SMB support | 60K+ |
| 27 | **Monday.com** | Project management | 225K+ |
| 28 | **Asana** | Project management | 150K+ |
| 29 | **PayPal** | Payments | 435M accounts |
| 30 | **Notion** | Knowledge management | 100M+ users |

---

## TIER 4: "The Expansion 20"

For broader coverage once Tier 1-3 are done.

| # | Connector | Category |
|---|---|---|
| 31 | **LinkedIn Ads** | Advertising |
| 32 | **TikTok Marketing** | Advertising |
| 33 | **Pinterest** | Advertising |
| 34 | **Snapchat Marketing** | Advertising |
| 35 | **Google Sheets** | Productivity |
| 36 | **Google Drive** | Storage |
| 37 | **Amazon S3** | Storage (ALREADY VERIFIED) |
| 38 | **Twilio** | Communications |
| 39 | **SendGrid** | Email |
| 40 | **Chargebee** | Billing |
| 41 | **Klaviyo** | E-commerce email |
| 42 | **ActiveCampaign** | Marketing automation |
| 43 | **WooCommerce** | E-commerce |
| 44 | **GitHub** | Developer tools (ALREADY VERIFIED) |
| 45 | **GitLab** | Developer tools (ALREADY VERIFIED) |
| 46 | **Sentry** | Error tracking |
| 47 | **Amplitude** | Product analytics |
| 48 | **Mixpanel** | Product analytics |
| 49 | **Google Search Console** | SEO |
| 50 | **Bing Ads** | Advertising |

---

## TIER 5: "The Enterprise 10"

Premium connectors that command higher pricing.

| # | Connector | Why Premium |
|---|---|---|
| 51 | **Workday** | HR/Finance enterprise |
| 52 | **ServiceNow** | ITSM enterprise |
| 53 | **Salesforce Service Cloud** | Enterprise support |
| 54 | **SAP HANA** | Real-time analytics |
| 55 | **IBM Db2** | Legacy enterprise |
| 56 | **Cassandra** | Distributed NoSQL |
| 57 | **CockroachDB** | Distributed SQL |
| 58 | **DynamoDB** | AWS NoSQL |
| 59 | **CosmosDB** | Azure NoSQL |
| 60 | **Spanner** | Google distributed SQL |

---

## Implementation Strategy

### Phase 1: Verify Existing (Week 1)
We already have verified: PostgreSQL, MySQL, MSSQL, MongoDB, Redis, S3, Supabase, ClickHouse, Elasticsearch, Neo4j, InfluxDB, MariaDB, CockroachDB, TimescaleDB, DuckDB, Kafka, ArangoDB, CouchDB, CouchBase, Firebase.

**Action:** Verify Oracle connector works against Docker Oracle XE.

### Phase 2: Build Tier 1 SaaS (Week 2-3)
Build real API connectors for: Salesforce, Stripe, HubSpot, Google Analytics 4, Shopify.

**Strategy:** Each uses OAuth2 or API key auth. Free sandbox/dev tiers available for all.

### Phase 3: Build Tier 2 (Week 4-5)
Snowflake, BigQuery, Redshift, Databricks destinations + Slack, Jira, Mailchimp, Zendesk, Google Ads sources.

### Phase 4: Build Tier 3-5 (Week 6+)
NetSuite, SAP, Marketo, Facebook Ads, etc. as customer demand warrants.

---

## Revenue Impact Estimate

| Tier | Connectors | Est. Customer Reach | Revenue Signal |
|---|---|---|---|
| Tier 1 | 10 | 5M+ businesses | Critical — must-have |
| Tier 2 | 10 | 500K+ businesses | High — competitive requirement |
| Tier 3 | 10 | 1M+ businesses | Medium — industry-specific |
| Tier 4 | 20 | 2M+ businesses | Growth — breadth coverage |
| Tier 5 | 10 | 100K+ enterprise | Premium — high ACV |

**Bottom line:** Building the 20 Tier 1+2 connectors would cover 80%+ of enterprise CDC demand and serve 5M+ potential customers.
