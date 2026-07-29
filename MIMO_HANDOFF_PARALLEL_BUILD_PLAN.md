# Pulsyn 776 Connectors → 490 Certified — Parallel Build Plan

**Handoff to:** MiMo (Lead Engineer)
**Timeline:** 4 weeks (parallel execution)
**Goal:** 490 production-ready connectors certified + live public dashboard
**Owner:** You (MiMo) orchestrate both systems in parallel
**Cost:** $40-240 (DeepSeek API + infrastructure)
**Expected Result:** World's largest tested connector ecosystem

---

## **Executive Summary**

Two parallel systems run simultaneously:

1. **Nightly Autonomous Test System** (already built, hands-off)
   - Tests 100-150 connectors/night
   - Auto-approves based on quality gates
   - Auto-commits everything
   - Runs 24/7 while you sleep

2. **AI Auto-Builder Swarm** (you orchestrate)
   - MiMo reads specs → creates templates
   - DeepSeek swarm generates 200 connectors/week
   - Each night: new batch tested & certified
   - No manual testing needed

**By Week 4:**
- 776 connectors in matrix
- 490 certified (production-ready)
- ~50% auto-generated + tested
- All committed to git
- Public dashboard live

---

## **System Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR ROLE (MiMo)                          │
│                                                               │
│ Week 1: Templates (5) → Week 2: Databases (200)            │
│ Week 3: SaaS APIs (300) → Week 4: Polish (222)             │
│                                                               │
│ Task: Read specs → Create template → Write swarm task      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
         ┌───────────────────────────┐
         │ DeepSeek Swarm            │
         │ (5 parallel workers)      │
         │ Generates connector code  │
         └───────────────┬───────────┘
                         ↓
         ┌───────────────────────────┐
         │ Git Auto-Commit           │
         │ (976 connector files)     │
         └───────────────┬───────────┘
                         ↓
    ┌────────────────────────────────────┐
    │ NIGHTLY AUTONOMOUS TEST SYSTEM     │
    │ (Runs automatically 2 AM UTC)      │
    │                                    │
    │ • Test 100-150 connectors         │
    │ • Auto-approve (tier gates)       │
    │ • Update cert-matrix.json         │
    │ • Auto-commit results             │
    │ • Slack notification              │
    └────────────────────┬───────────────┘
                         ↓
         ┌───────────────────────────┐
         │ Public Dashboard           │
         │ pulsynai.com/connectors   │
         │ (490+ certified)           │
         └───────────────────────────┘
```

---

## **Week-by-Week Execution Plan**

### **WEEK 1: Template Generation (5 templates, 50 connectors)**

#### **Your Tasks (MiMo)**

**Day 1 (Monday)**

1. **Read base connector pattern**
   ```bash
   cat packages/core/src/connectors/base.ts
   cat packages/core/src/connectors/postgresql.ts
   ```

2. **Identify 5 core patterns**
   - Pattern A: Relational DB (postgres.ts template)
   - Pattern B: REST API (rest-api.ts template)
   - Pattern C: Cloud Storage (s3.ts template)
   - Pattern D: NoSQL (mongodb.ts template)
   - Pattern E: Analytics DB (bigquery.ts template)

3. **For each pattern, identify target connectors**
   ```
   Pattern A (DB): Oracle, MySQL, MSSQL, Cassandra, CockroachDB
   Pattern B (REST): Stripe, Salesforce, HubSpot, Slack, Jira
   Pattern C (Cloud): GCS, Azure Blob, R2, Backblaze
   Pattern D (NoSQL): Couchbase, Firebase, DynamoDB, Elasticsearch
   Pattern E (Analytics): Snowflake, Redshift, Databricks, Clickhouse
   ```

**Days 2-3 (Tue-Wed)**

4. **Create template specification document**
   ```
   File: docs/connector-templates/WEEK1_SPEC.md
   
   Template A: RelationalDB
   ├─ Base: packages/core/src/connectors/postgresql.ts
   ├─ Driver swap: pg → mysql2 (for MySQL), mssql (for MSSQL)
   ├─ Auth swap: username/password → connection string
   └─ Target connectors: [oracle, mysql, mssql, cassandra, cockroachdb]
   
   [Same for B, C, D, E]
   ```

5. **Write DeepSeek swarm task file**
   ```
   File: scripts/auto-build/tasks/week1-template-generation.txt
   
   TASK: Generate 5 base connector templates
   
   TEMPLATE_A_RELATIONALDB:
   - Read: packages/core/src/connectors/postgresql.ts
   - Identify: connection setup, query execution, schema discovery
   - Create: packages/core/src/connectors/postgresql-template.ts
   - Parameterize: {DRIVER_NAME}, {AUTH_TYPE}, {QUERY_METHOD}
   - Output: 1 generic template file
   
   [Repeat for B, C, D, E]
   
   QUALITY_GATES:
   - No hardcoded credentials
   - Implements BaseConnector interface
   - Has 9 required methods (connect, disconnect, testConnection, getTables, getTableSchema, extractFull, extractIncremental, startCDC, stopCDC)
   - No `any` types
   
   OUTPUT: 5 files in packages/core/src/connectors/templates/
   ```

**Days 4-5 (Thu-Fri)**

6. **Trigger DeepSeek to generate templates**
   ```bash
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week1-template-generation.txt \
     --provider deepseek \
     --mode swarm \
     --auto \
     --timeout 600
   ```

7. **Trigger DeepSeek to clone templates to 50 connectors**
   ```
   File: scripts/auto-build/tasks/week1-clone-50-connectors.txt
   
   TASK: Clone 5 templates to 50 connectors
   
   CLONE_RELATIONALDB_TEMPLATE:
   - Template: packages/core/src/connectors/templates/postgresql-template.ts
   - Targets: [oracle, mysql, mssql, cassandra, cockroachdb, mariadb, tidb, singlestore, timescaledb, citus]
   - For each:
     - Create: packages/core/src/connectors/{target}.ts
     - Replace: {DRIVER_NAME} → oracle-db (for oracle), mysql2 (for mysql), etc.
     - Test: TypeScript compiles, no lint errors
   
   [Repeat for B, C, D, E templates × 10 connectors each]
   
   OUTPUT: 50 new connector files
   QUALITY: Each compiles, has registry decorator, extends BaseConnector
   ```

8. **Commit Week 1 templates**
   ```bash
   git add packages/core/src/connectors/templates/
   git add packages/core/src/connectors/{oracle,mysql,mssql,cassandra,...}.ts
   git commit -m "feat(connectors): week1 templates + 50 generated connectors

   - 5 base templates (relational, REST, cloud storage, NoSQL, analytics)
   - 50 connectors generated from templates
   - All pass TypeScript compile + lint
   - Ready for nightly testing
   
   Co-Authored-By: MiMo <mimo@pulsyn.io>"
   git push
   ```

#### **What Happens Automatically (Nightly Test System)**

**Friday Night (2 AM UTC)**
```
Nightly system runs:
  1. Load queue: first 50 connectors (from Week 1)
  2. Run tests: 50 connectors × 17 tests each
  3. Approve: use Tier 5 gate (80% pass rate)
  4. Result: 35-40 connectors certified
  5. Auto-commit: chore(cert): PHASE_1 complete — 35 certified, 15 failed
  6. Slack: "Week 1 results: 35/50 certified"
```

**Saturday Morning**
```
You check results:
  - cat docs/lab/cert-matrix.json | jq '.connectors | keys | length'
    Output: 50

  - cat docs/lab/results/PHASE_1_*.json | jq '.connectors_passed'
    Output: 35

  - git log --oneline -1
    Output: chore(cert): PHASE_1 complete — 35 certified, 15 failed
```

#### **Week 1 Deliverables**

✅ 5 base templates created
✅ 50 connectors generated
✅ All committed to git
✅ 35-40 certified by nightly system
✅ Cumulative: 35-40 certified

**Status:** Ready for Week 2

---

### **WEEK 2: Database Family Generation (200 connectors)**

#### **Your Tasks (MiMo)**

**Day 1 (Monday)**

1. **Analyze Week 1 results**
   ```bash
   # Which templates had highest pass rate?
   cat docs/lab/cert-matrix.json | jq '.connectors | to_entries | sort_by(.value.pass_rate) | reverse'
   
   # Example: postgresql template → 100%, oracle template → 85%, mysql → 95%
   ```

2. **Identify 200 database connectors to generate**
   - PostgreSQL variants: 10 (Aurora, RDS, Citus, Timescale)
   - MySQL variants: 15 (MariaDB, Percona, TiDB, SingleStore)
   - Oracle variants: 10 (Oracle DB, Oracle Autonomous, etc.)
   - NoSQL: 50 (MongoDB, Cassandra, DynamoDB, CouchDB, etc.)
   - Analytics DBs: 30 (BigQuery, Snowflake, Redshift, Databricks, etc.)
   - Others: 85 (specialized DBs, cloud SQL, etc.)

3. **Write Week 2 swarm task**
   ```
   File: scripts/auto-build/tasks/week2-database-generation.txt
   
   TASK: Generate 200 database connectors from templates
   
   SOURCES:
   - Template A: postgresql-template.ts (best performing from Week 1)
   - Template D: mongodb-template.ts
   - Template E: bigquery-template.ts
   
   GENERATION_RULES:
   - Use highest-performing template for each category
   - For each target DB:
     - Read: official connection docs (PostgreSQL docs, MySQL docs, etc.)
     - Clone: best-fit template
     - Customize: driver, auth method, query syntax
     - Test: TypeScript compile, no lint errors
   
   TARGETS (200):
   [List all 200 database names + which template to use]
   
   QUALITY: 90% must compile, 80% must pass integration tests
   ```

4. **Trigger DeepSeek Week 2**
   ```bash
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week2-database-generation.txt \
     --provider deepseek \
     --mode swarm \
     --auto \
     --timeout 900
   ```

**Days 2-5**

5. **Monitor generation + commit**
   ```bash
   # Watch DeepSeek progress
   npm run cert:monitor
   
   # After generation completes, commit
   git add packages/core/src/connectors/{mariadb,cockroachdb,...}.ts
   git commit -m "feat(connectors): week2 database generation (200 connectors)
   
   Generated:
   - 15 PostgreSQL variants
   - 15 MySQL variants
   - 10 Oracle variants
   - 50 NoSQL connectors
   - 30 Analytics DB connectors
   - 85 specialty database connectors
   
   All pass TypeScript compile. Ready for nightly testing.
   
   Co-Authored-By: MiMo <mimo@pulsyn.io>"
   git push
   ```

#### **What Happens Automatically (Nightly Test System)**

**Monday-Friday Nights**
```
Each night:
  - Test 40 new connectors (5 per night from Week 2 queue)
  - Auto-approve: 30-35 certified per night
  - Auto-commit: chore(cert): PHASE_N complete — 32 certified, 8 failed
  
Friday night (all Week 2 tested):
  - Test 200 connectors total
  - Result: 150-160 certified
  - Auto-commit final
  - Slack: "Week 2 results: 150/200 certified"
```

#### **Week 2 Deliverables**

✅ 200 database connectors generated
✅ All committed to git
✅ 150-160 certified by nightly system
✅ Cumulative: 185-200 certified (35 from Week 1 + 150 from Week 2)

**Status:** Ready for Week 3

---

### **WEEK 3: SaaS REST API Generation (300 connectors)**

#### **Your Tasks (MiMo)**

**Day 1 (Monday)**

1. **Collect OpenAPI specs for 300 SaaS APIs**
   - Get from: swagger.io/tools/swagger-hub, APIs.guru, official docs
   - Store: `docs/connector-specs/saas-openapi/*.json`

2. **Categorize 300 SaaS APIs**
   - Payment: Stripe, Square, PayPal, Braintree (20)
   - CRM: Salesforce, HubSpot, Pipedrive, Zoho (25)
   - Analytics: Mixpanel, Amplitude, Segment, Heap (20)
   - Project Mgmt: Jira, Asana, Monday, Linear (30)
   - Communication: Slack, Discord, Teams, Twilio (20)
   - Marketing: Mailchimp, Brevo, Klaviyo, Intercom (25)
   - E-commerce: Shopify, WooCommerce, Magento (20)
   - Others: Notion, Airtable, GitHub, etc. (140)

3. **Write Week 3 swarm task**
   ```
   File: scripts/auto-build/tasks/week3-saas-api-generation.txt
   
   TASK: Generate 300 SaaS REST API connectors from OpenAPI specs
   
   TEMPLATE: rest-api-template.ts (from Week 1)
   
   GENERATION_PROCESS:
   For each SaaS API:
     1. Read: OpenAPI spec (3-line summary)
     2. Identify: base URL, auth method (API key, OAuth), rate limits
     3. Clone: rest-api-template.ts
     4. Customize:
        - baseUrl
        - authMethod (API key header, OAuth bearer, etc.)
        - mainResourceTypes (what this API returns: "users", "payments", etc.)
        - paginationMethod (offset, cursor, link-header)
     5. Generate: packages/core/src/connectors/{stripe, salesforce, hubspot, ...}.ts
     6. Compile: TypeScript check
   
   TARGETS (300):
   [List all 300 SaaS APIs + OpenAPI spec location]
   
   BATCHING: Generate 75 connectors/batch × 4 batches
   (Run 4 DeepSeek workers in parallel, each handles 75)
   
   QUALITY: 95% must compile, 70% must pass basic auth test
   ```

4. **Trigger DeepSeek Week 3**
   ```bash
   # Split into 4 parallel batches (Batch A-D, 75 each)
   
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week3-saas-api-batch-a.txt \
     --provider deepseek --mode swarm --auto --timeout 900 &
   
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week3-saas-api-batch-b.txt \
     --provider deepseek --mode swarm --auto --timeout 900 &
   
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week3-saas-api-batch-c.txt \
     --provider deepseek --mode swarm --auto --timeout 900 &
   
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week3-saas-api-batch-d.txt \
     --provider deepseek --mode swarm --auto --timeout 900 &
   
   wait  # Wait for all 4 to finish
   ```

**Days 2-5**

5. **Commit Week 3**
   ```bash
   git add packages/core/src/connectors/{stripe,salesforce,hubspot,...}.ts
   git commit -m "feat(connectors): week3 SaaS API generation (300 connectors)
   
   Generated from OpenAPI specs:
   - 20 Payment APIs (Stripe, Square, PayPal, etc.)
   - 25 CRM APIs (Salesforce, HubSpot, Pipedrive, etc.)
   - 20 Analytics APIs (Mixpanel, Amplitude, Segment, etc.)
   - 30 Project Mgmt APIs (Jira, Asana, Monday, etc.)
   - 20 Communication APIs (Slack, Discord, Teams, etc.)
   - 25 Marketing APIs (Mailchimp, Brevo, Klaviyo, etc.)
   - 20 E-commerce APIs (Shopify, WooCommerce, Magento, etc.)
   - 140 Other SaaS APIs
   
   All generated from official OpenAPI specs.
   All pass TypeScript compile.
   
   Co-Authored-By: MiMo <mimo@pulsyn.io>"
   git push
   ```

#### **What Happens Automatically (Nightly Test System)**

**Monday-Friday Nights**
```
Each night:
  - Test 60 new connectors (from Week 3 queue)
  - Auto-approve: 40-50 certified per night (Tier 4 gate: 90%)
  - Auto-commit
  
Friday night (all Week 3 tested):
  - Test 300 connectors total
  - Result: 200-250 certified (SaaS APIs are simpler, higher pass rate)
  - Auto-commit final
  - Slack: "Week 3 results: 220/300 certified"
```

#### **Week 3 Deliverables**

✅ 300 SaaS REST API connectors generated
✅ All committed to git
✅ 200-250 certified by nightly system
✅ Cumulative: 400-450 certified (35 + 150 + 220)

**Status:** Ready for Week 4

---

### **WEEK 4: Polish + Optimization (222 remaining)**

#### **Your Tasks (MiMo)**

**Day 1 (Monday)**

1. **Analyze Weeks 1-3 failures**
   ```bash
   # Which connectors failed? Why?
   cat docs/lab/cert-matrix.json | jq '.connectors | map(select(.status == "FAILED")) | length'
   
   # Example: 15 failed from Week 1, 50 from Week 2, 80 from Week 3
   # Total failures: 145 (must fix or generate Week 4 replacements)
   ```

2. **Identify 222 remaining connectors**
   - Niche databases: 30
   - Specialized cloud services: 50
   - Emerging SaaS: 70
   - Replacements for failed Week 1-3: 50
   - Buffer: 22

3. **Write Week 4 optimization task**
   ```
   File: scripts/auto-build/tasks/week4-polish-and-optimize.txt
   
   TASK: Generate 222 remaining connectors + fix failures
   
   PHASE_A: Generate 222 new connectors
   - 30 niche databases
   - 50 specialized cloud services
   - 70 emerging SaaS APIs
   - 22 buffer/edge cases
   
   PHASE_B: Fix Week 1-3 failures (145 total)
   - Re-read spec for each failed connector
   - Identify failure reason (auth, rate limiting, schema change)
   - Re-generate with workaround
   - Re-test
   
   TARGET: All 776 connectors in matrix
   ```

4. **Trigger Week 4 generation + fixes**
   ```bash
   node scripts/swarm-trigger/trigger.js \
     --task scripts/auto-build/tasks/week4-polish-and-optimize.txt \
     --provider deepseek \
     --mode swarm \
     --auto \
     --timeout 900
   ```

**Days 2-4**

5. **Monitor final generation**
   ```bash
   npm run cert:monitor
   
   # Watch: are failures decreasing? Is fix rate > 70%?
   cat docs/lab/cert-matrix.json | jq '.connectors | map(select(.status == "FAILED")) | length'
   ```

**Day 5**

6. **Commit Week 4 + final push**
   ```bash
   git add packages/core/src/connectors/*.ts
   git commit -m "feat(connectors): week4 polish + all 776 connectors complete
   
   Added:
   - 222 additional connectors (niche, specialized, emerging)
   - Fixes for 145 failed Week 1-3 connectors
   
   Total matrix: 776 connectors
   
   Status: Ready for public launch
   - 490-550 certified (production-ready)
   - 200-250 qualified (passing gates)
   - 26-36 need manual review
   
   Co-Authored-By: MiMo <mimo@pulsyn.io>"
   git push
   ```

#### **What Happens Automatically (Nightly Test System)**

**Monday-Thursday Nights**
```
Each night:
  - Test 55 new Week 4 connectors
  - Test 36 failed Week 1-3 retries
  - Auto-approve: 60-70 certified per night
  
Friday final run:
  - Complete 776 full matrix test
  - Result: 490-550 total certified
  - Auto-commit: chore(cert): final report — 520 certified total
  - Slack: "🎉 ALL 776 CONNECTORS TESTED. 520 CERTIFIED."
```

#### **Week 4 Deliverables**

✅ 222 final connectors generated
✅ 145 failed connectors fixed
✅ All 776 in matrix
✅ 490-550 certified by nightly system
✅ Cumulative: 490-550 certified

**Status:** LAUNCH READY

---

## **Parallel Work: Public Dashboard**

**While Weeks 1-4 run in parallel:**

### **Week 2 (Mid-build)**

Create API endpoint:
```bash
# File: packages/api/src/routes/certifications.ts

GET /api/certifications
  → Returns docs/lab/cert-matrix.json
  → Sorted by: status, pass_rate DESC
  → Fields: connector, status, pass_rate, latency_p99, throughput, error_rate
```

### **Week 3**

Deploy web dashboard:
```bash
# File: packages/web/src/app/certifications/page.tsx

Display:
  - Cert matrix table (searchable, sortable)
  - Status badge (certified, qualified, failed)
  - Metrics: latency, throughput, error rate
  - Comparison: vs Fivetran, vs Airbyte
  - Live update (refresh every 10 min)

Deploy to: pulsynai.com/connectors
```

### **Week 4**

Finalize marketing:
```
Blog post: "Pulsyn: 776 Connectors, 490 Certified — Real Quality Metrics"

Include:
  - Comparison chart: Pulsyn vs Fivetran vs Airbyte
  - Methodology: how we certified connectors
  - Live dashboard link
  - Competitive advantage: real testing vs stubs

Publish to: pulsynai.com/blog
Share on: Twitter, LinkedIn, HN, Reddit
```

---

## **Your Weekly Checklist**

### **Every Monday**

- [ ] Analyze previous week's results: `cat docs/lab/cert-matrix.json | jq '.connectors | length'`
- [ ] Identify connectors for this week (200-300 per week)
- [ ] Write swarm task file: `scripts/auto-build/tasks/weekN-*.txt`
- [ ] Trigger DeepSeek: `node scripts/swarm-trigger/trigger.js --task weekN-*.txt ...`

### **Every Day**

- [ ] Monitor nightly results: `npm run cert:monitor`
- [ ] Check failed connectors: `cat docs/lab/cert-matrix.json | jq '.connectors | map(select(.status == "FAILED"))'`
- [ ] Review auto-commits: `git log --oneline -5 | grep chore`

### **Every Friday**

- [ ] Summarize week's certified count
- [ ] Commit any fixes: `git commit -m "feat(connectors): weekN summary — X certified"`
- [ ] Update dashboard if live

### **Week 4 (Final)**

- [ ] Polish all 776 connectors
- [ ] Fix any remaining failures
- [ ] Finalize public messaging
- [ ] Deploy dashboard
- [ ] Announce to market

---

## **Timeline Summary**

| Week | Your Work | AI Work | Test System | Cumulative | Status |
|------|-----------|---------|-------------|-----------|--------|
| **1** | 5 templates → 50 gen | Clone templates | Test 50, cert 35 | 35 | ✅ |
| **2** | Identify 200 DB → spec | Generate 200 | Test 200, cert 150 | 185 | ✅ |
| **3** | Collect 300 OpenAPI specs | Generate 300 | Test 300, cert 220 | 405 | ✅ |
| **4** | Polish + fix failures | Gen 222 + rework | Test 222 + retries | **490-550** | 🎉 |

**Total effort:**
- **Your time:** ~20 hours (2 hours/week reading specs + writing task files)
- **AI time:** ~200 hours (all handled by DeepSeek + test system)
- **Clock time:** 4 weeks (continuous, 24/7)

---

## **Success Metrics**

### **By End of Week 1**

- [ ] 5 base templates created
- [ ] 50 connectors generated
- [ ] 35-40 certified
- [ ] All committed to git

### **By End of Week 2**

- [ ] 200 database connectors generated
- [ ] 150-160 certified
- [ ] 185-200 cumulative certified

### **By End of Week 3**

- [ ] 300 SaaS API connectors generated
- [ ] 220-250 certified this week
- [ ] 400-450 cumulative certified

### **By End of Week 4**

- [ ] 776 connectors in matrix
- [ ] 490-550 certified (59-71% pass rate)
- [ ] Public dashboard live
- [ ] Announcement blog post published
- [ ] Slack/HN/Twitter outreach complete

---

## **Critical Success Factors**

✅ **Use highest-performing templates from Week 1 for later weeks**
- If PostgreSQL template has 100% pass rate, use it for Oracle, MySQL
- If REST API template has 95% pass rate, use it for all SaaS

✅ **Commit every week (not just at end)**
- Spreads risk across 4 commits, not 1 big commit
- Allows nightly test system to start testing immediately
- If Week 1 fails, you know by Friday, can adjust Week 2

✅ **Monitor nightly results closely**
- If Monday night: only 10/50 certified, something is wrong
- Immediately trigger Week 1 fixes before Week 2 starts
- Don't wait until Friday to discover week-long failure

✅ **Parallelize everything**
- Week 2 generation happens while Week 1 is being tested
- Week 3 written while Week 2 is being tested
- By Friday of Week 1, Week 2 swarm task is ready to go

---

## **Commands You'll Run (Copy-Paste Ready)**

### **Week 1 Monday**

```bash
npm run cert:setup
docker-compose -f docker-compose.lab.yml up -d
npm run cert:run-local &  # Start baseline, runs in background

# Write templates + task files (manual, 2 hours)
vim scripts/auto-build/tasks/week1-template-generation.txt
vim scripts/auto-build/tasks/week1-clone-50-connectors.txt
```

### **Week 1 Friday**

```bash
# Trigger template generation
node scripts/swarm-trigger/trigger.js \
  --task scripts/auto-build/tasks/week1-template-generation.txt \
  --provider deepseek --mode swarm --auto --timeout 600

# Wait for completion, then trigger clone to 50
node scripts/swarm-trigger/trigger.js \
  --task scripts/auto-build/tasks/week1-clone-50-connectors.txt \
  --provider deepseek --mode swarm --auto --timeout 600

# Commit
git add packages/core/src/connectors/
git commit -m "feat(connectors): week1 templates + 50 connectors"
git push

# Check nightly results (Saturday morning)
npm run cert:monitor
cat docs/lab/cert-matrix.json | jq '.connectors | length'
```

### **Week 2 Monday**

```bash
# Analyze Week 1 results
cat docs/lab/cert-matrix.json | jq '.connectors | to_entries | map(select(.value.status == "FAILED")) | length'

# Write Week 2 task
vim scripts/auto-build/tasks/week2-database-generation.txt

# Trigger
node scripts/swarm-trigger/trigger.js \
  --task scripts/auto-build/tasks/week2-database-generation.txt \
  --provider deepseek --mode swarm --auto --timeout 900
```

### **Week 2 Friday**

```bash
git add packages/core/src/connectors/{oracle,mysql,mssql,...}.ts
git commit -m "feat(connectors): week2 database generation (200)"
git push
```

**[Repeat for Weeks 3-4]**

---

## **Handoff Checklist**

Before you start, confirm:

- [ ] Nightly test system is running: `npm run cert:monitor` shows live updates
- [ ] Docker lab is healthy: `docker-compose -f docker-compose.lab.yml ps` shows 11 services UP
- [ ] Initial baseline test passed: `npm run cert:run-local` completed successfully
- [ ] Git is configured: `git config user.email "mimo@pulsyn.io"`
- [ ] GitHub access working: `gh auth status` shows authenticated
- [ ] DeepSeek API key in environment: `echo $DEEPSEEK_API_KEY` shows key
- [ ] Slack webhook configured (optional): `echo $SLACK_WEBHOOK_URL` shows URL

---

## **Questions for You Before Starting**

1. **Can you commit to 2 hours/week task writing?** (5 min template reading + 1:55 task file writing)
   - Yes → Proceed
   - No → I'll auto-write task files, you just review & trigger

2. **Do you want dashboard live by Week 3 or Week 4?**
   - Week 3 (mid-build, shows progress) → Start deploying Week 2 Monday
   - Week 4 (final, polished) → Deploy after all 776 generated

3. **Announcement timing?**
   - Week 4 Friday (immediately after 776 certified)
   - Or wait 1 week (let nightly tests run more nights, get to 600+ certified)

---

## **Final Status**

**Ready to start?** You have everything:

✅ Nightly autonomous test system (built)
✅ AI auto-builder framework (ready)
✅ Week-by-week plan (above)
✅ Commands (ready to copy-paste)

**Next action:** Run

```bash
npm run cert:setup
```

Then confirm the 3 Handoff Checklist items above, and we're GO.

---

**Owner:** MiMo
**Reporting:** Weekly summaries to team Slack
**Success:** 490-550 certified connectors by Week 4 Friday
**Launch:** Blog post + public dashboard announcement Week 4
