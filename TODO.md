# PULSYN TODO
## Last Updated: 2026-07-29

---

## NEXT SESSION — START HERE

### 1. Stripe Checkout Flow (2 hours)
- [ ] Implement checkout in `packages/web/src/app/pricing/page.tsx`
- [ ] Create billing API routes in `packages/api/src/routes/billing.ts`
- [ ] Handle Stripe webhooks
- [ ] Test end-to-end
- [ ] Deploy to Vercel

### 2. Fix 177 Failing Tests (varies)
- [ ] AWS credentials → Kinesis (14), Redshift (14)
- [ ] GCP credentials → BigQuery (15)
- [ ] HubSpot API key → 14 failures
- [ ] Shopify API key → 14 failures
- [ ] Stripe API key → 14 failures
- [ ] Jira API key → 16 failures
- [ ] Salesforce API key → 16 failures
- [ ] Slack API key → 16 failures
- [ ] GitHub API key → 16 failures
- [ ] Supabase connection → 18 failures
- [ ] Databricks SDK fix → 10 failures

### 3. Documentation (3 hours)
- [x] TESTING.md
- [x] DEPLOYMENT.md
- [x] CONNECTORS.md
- [x] ARCHITECTURE.md
- [x] PENDING_ITEMS.md
- [ ] API documentation (standalone)
- [ ] Fix GETTING_STARTED.md (pulsyn.io → pulsynai.com)

### 4. Marketing (2 hours)
- [ ] Ghost blog (30 min)
- [ ] Twitter/X (30 min)
- [ ] Reddit (10 min)
- [ ] Hacker News (15 min)
- [ ] Product Hunt (15 min)
- [ ] LinkedIn (15 min)

### 5. Revenue (1 hour)
- [ ] Business email (15 min)
- [ ] Contact number (10 min)
- [ ] Google Ads (1 hour)

### 6. Technical Debt (5 hours)
- [ ] Registry constructor mismatch (2 hours)
- [ ] ES client v9 upgrade (1 hour)
- [ ] Kafka consumer fix (2 hours)
- [ ] Checkpoint system (4 hours)

### 7. Growth (5 hours)
- [ ] YouTube demo videos (2 hours)
- [ ] Dev.to articles (5 hours)
- [ ] Discord community (30 min)

---

## Current State
- 42 connectors tested, 841/1018 tests (83%)
- 12 connectors at 100%
- 32 stub connectors
- 177 failures (need credentials)
- Live at pulsynai.com

## Quick Commands
```bash
# Tests
cd packages/core && npx vitest run src/__tests__/lab/connectors/

# Docker
docker-compose -f docker-compose.lab.yml up -d

# Deploy
vercel --prod
```
