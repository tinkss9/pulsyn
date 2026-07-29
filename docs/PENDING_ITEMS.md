# Pulsyn — Pending Items

## Last Updated: 2026-07-29

---

## Critical (Blocking Launch)

### 1. Stripe Checkout Flow
- **Status**: Test keys exist, no checkout flow implemented
- **Effort**: 2 hours
- **Impact**: HIGH — blocks revenue
- **Details**: Stripe publishable/secret keys are configured, but the actual checkout flow (create customer, create subscription, handle webhooks) is not implemented
- **Files**: `packages/web/src/app/pricing/page.tsx`, `packages/api/src/routes/billing.ts`

### 2. 177 Failing Tests (Cloud Credentials)
- **Status**: All from connectors needing real credentials
- **Effort**: Varies (1-8 hours per connector)
- **Impact**: HIGH — blocks connector certification
- **Details**:
  - Supabase: 18 failures (needs Supabase connection)
  - Kinesis: 14 failures (needs AWS credentials)
  - Redshift: 14 failures (needs AWS credentials)
  - HubSpot: 14 failures (needs API key)
  - Shopify: 14 failures (needs API key)
  - Stripe: 14 failures (needs API key)
  - Jira: 16 failures (needs API key)
  - Salesforce: 16 failures (needs API key)
  - BigQuery: 15 failures (needs GCP credentials)
  - Slack: 16 failures (needs API key)
  - GitHub: 16 failures (needs API key)
  - Databricks: 10 failures (SDK API mismatch)

### 3. 722 Untested Connectors
- **Status**: Zero test coverage
- **Effort**: 20+ hours
- **Impact**: MEDIUM — long-tail connectors
- **Details**: 776 connector files exist, only 54 have test files (7%). The remaining 722 are mostly long-tail connectors (insurance, agriculture, government, healthcare, education, etc.)

---

## High Priority (Documentation)

### 4. API Documentation
- **Status**: Embedded in GETTING_STARTED.md
- **Effort**: 1 hour
- **Impact**: HIGH — developer experience
- **Details**: API reference should be standalone document with full endpoint documentation, request/response examples, error codes

### 5. Connector Documentation
- **Status**: No documentation
- **Effort**: 2 hours
- **Impact**: HIGH — user adoption
- **Details**: Document all 776 connectors, their capabilities, configuration options, and status

### 6. Deployment Documentation
- **Status**: No documentation
- **Effort**: 30 min
- **Impact**: HIGH — operations
- **Details**: Document Vercel deployment, Docker production setup, environment variables, monitoring

### 7. Testing Documentation
- **Status**: Created (docs/TESTING.md)
- **Effort**: Done
- **Impact**: HIGH — developer experience
- **Details**: Comprehensive testing guide with Docker setup, test runner architecture, how to add new tests

### 8. Architecture Documentation
- **Status**: Created (docs/ARCHITECTURE.md)
- **Effort**: Done
- **Impact**: HIGH — developer onboarding
- **Details**: System architecture, monorepo structure, CDC engine, event system, connector architecture

---

## Medium Priority (Marketing)

### 9. Ghost Blog
- **Status**: Not started
- **Effort**: 30 min
- **Impact**: HIGH — content marketing
- **Details**: Deploy Ghost on Vercel, publish 4 blog posts about CDC, data replication, comparison with competitors

### 10. Twitter/X Account
- **Status**: Not started
- **Effort**: 30 min
- **Impact**: HIGH — social presence
- **Details**: Create @pulsynai account, post 20 tweets about CDC, data integration, product updates

### 11. Reddit Posts
- **Status**: Not started
- **Effort**: 10 min
- **Impact**: HIGH — community engagement
- **Details**: Post in r/dataengineering, r/database, r/etl about Pulsyn

### 12. Hacker News
- **Status**: Not started
- **Effort**: 15 min
- **Impact**: HIGH — developer awareness
- **Details**: Write Show HN post about Pulsyn's 776 connectors

### 13. Product Hunt Launch
- **Status**: Not started
- **Effort**: 15 min
- **Impact**: HIGH — product visibility
- **Details**: Schedule launch, prepare assets, coordinate with community

---

## Low Priority (Growth)

### 14. Google Ads Campaign
- **Status**: Not started
- **Effort**: 1 hour
- **Impact**: MEDIUM — paid acquisition
- **Details**: $500/mo budget targeting CDC, data replication, ETL keywords

### 15. YouTube Demo Videos
- **Status**: Not started
- **Effort**: 2 hours
- **Impact**: MEDIUM — product demonstration
- **Details**: Record 3 demo videos: quick start, connector setup, CDC pipeline

### 16. Dev.to Articles
- **Status**: Not started
- **Effort**: 5 hours
- **Impact**: LOW — content marketing
- **Details**: Write 10 technical articles about CDC, data integration, Pulsyn architecture

### 17. Discord Community
- **Status**: Not started
- **Effort**: 30 min
- **Impact**: LOW — community building
- **Details**: Create Discord server for Pulsyn community

---

## Technical Debt

### 18. Registry Constructor Mismatch
- **Status**: Workaround in place (skip tests)
- **Effort**: 2 hours
- **Impact**: LOW — test accuracy
- **Details**: `ConnectorRegistry.getSource()` passes 4 args `(id, name, name, config)`. Connectors with 3-arg constructors get `name` as `config`. Currently skipping config mask tests for affected engines.

### 19. ES Client Version
- **Status**: Downgraded to v8
- **Effort**: 1 hour
- **Impact**: LOW — ES 9.x compatibility
- **Details**: `@elastic/elasticsearch@9` sends `application/vnd.elasticsearch+json` which ES 8.x doesn't understand. Currently using v8 client.

### 20. Kafka Consumer Hangs
- **Status**: Extraction tests skipped
- **Effort**: 2 hours
- **Impact**: LOW — Kafka testing
- **Details**: `consumer.run()` + `eachMessage` callback never resolves when no messages arrive. Currently skipping extraction tests for Kafka.

### 21. Checkpoint System
- **Status**: Placeholder only
- **Effort**: 4 hours
- **Impact**: MEDIUM — pipeline persistence
- **Details**: `current.json` has no real pipeline data — it's a placeholder. Need to implement checkpoint persistence.

---

## Completed (for reference)

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | 763 connectors | ✅ Done | 0949c38 |
| 2 | Enterprise demo page | ✅ Done | 86f2f85 |
| 3 | Mobile hamburger menu | ✅ Done | 00879db |
| 4 | Marketing plan + blog posts | ✅ Done | bcfcab7 |
| 5 | Business case study + investor pitch | ✅ Done | 80055a9 |
| 6 | Docker test environment | ✅ Done | a77d50f |
| 7 | pulsynai.com live | ✅ Done | 9a9f82d |
| 8 | Contact page | ✅ Done | 0949c38 |
| 9 | Globe animation | ✅ Done | 0c5e0d4 |
| 10 | Hero video | ✅ Done | 9c40056 |
| 11 | Brain/Memory/Nerve system | ✅ Done | 58c2d53 |
| 12 | 12 connectors at 100% | ✅ Done | 6fe4f1d |
| 13 | Test runner with skip logic | ✅ Done | 71e6175 |
| 14 | 32 stub connectors | ✅ Done | cddb0d1 |
| 15 | S3 test data in LocalStack | ✅ Done | 5f3eee8 |
| 16 | ES client downgrade | ✅ Done | 698f5be |
| 17 | Kafka consumer-hang skip | ✅ Done | 6fe4f1d |
| 18 | Documentation (TESTING.md, etc.) | ✅ Done | Current |
