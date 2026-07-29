# Overnight Blitz — Detailed Guide

100 AI agents generate 550+ Pulsyn connectors overnight.

**Start:** `npm run blitz:start` at 22:00
**Check:** `npm run blitz:status` at 08:00

---

## Quick Start

```bash
# Tonight at 22:00
cd ~/pulsyn
npm run blitz:start

# Tomorrow at 08:00
npm run blitz:status
git log --oneline -20 | grep chore
ls packages/core/src/connectors/*.ts | wc -l
```

---

## What Gets Generated

Each connector is a TypeScript file that:
- Extends `BaseConnector`
- Has `@registerSource('name')` decorator
- Implements: `connect()`, `disconnect()`, `testConnection()`, `getTables()`, `getTableSchema()`, `startCDC()`, `stopCDC()`
- Uses proper TypeScript types (no `any`)
- Follows Pulsyn conventions

### Connector Categories

| Category | Count | Examples |
|----------|-------|---------|
| Database | 30 | firebird, sqlite, mariadb, tidb, neon, planetscale |
| SaaS/CRM | 20 | salesforce, hubspot, zoho-crm, pipedrive, dynamics-365 |
| Payment | 12 | stripe, paypal, square, adyen, razorpay |
| Communication | 20 | slack, discord, twilio, sendgrid, mailgun |
| Project Management | 15 | jira, asana, trello, linear, clickup |
| Cloud Storage | 15 | gcs, azure-blob, digitalocean-spaces, minio |
| Data Warehouse | 10 | snowflake, bigquery, redshift, databricks |
| Analytics | 20 | google-analytics, mixpanel, amplitude, segment |
| Streaming | 10 | kafka, kinesis, pubsub, rabbitmq |
| Dev Tools | 20 | github, gitlab, sentry, datadog, grafana |
| ERP | 10 | sap-s4, netsuite, xero, quickbooks |
| Marketing | 15 | marketo, klaviyo, hootsuite, buffer |
| Support | 10 | zendesk, freshdesk, helpscout, front |
| Social | 10 | twitter, instagram, facebook, linkedin |
| Healthcare | 10 | epic-fhir, cerner, athenahealth |
| Fintech | 10 | plaid, yodlee, mx, finicity |
| Education | 10 | canvas-lms, blackboard, moodle |
| IoT | 10 | aws-iot, azure-iot, particle |
| Logistics | 10 | shipstation, shipengine, shippo |
| Travel | 10 | amadeus, sabre, duffel |
| Other | 35 | fitness, legal, insurance, telecom, media, government, agriculture, automotive |

---

## Phase Breakdown

### Phase 1: Database + Streaming (45 min)
- 20 agents
- 40 connectors
- Providers: DeepSeek 15, Kimi 3, MiMo 2
- Gates: file_exists, tsc_compiles, has_decorator, has_baseclass

### Phase 2: SaaS + CRM + Payment (90 min)
- 35 agents
- 235 connectors
- Providers: DeepSeek 25, Kimi 5, MiMo 5
- Gates: file_exists, tsc_compiles, has_decorator, has_baseclass, no_any_types

### Phase 3: Cloud + Warehouse (45 min)
- 15 agents
- 25 connectors
- Providers: DeepSeek 10, Kimi 3, MiMo 2
- Gates: file_exists, tsc_compiles, has_decorator, has_baseclass

### Phase 4: Specialty (60 min)
- 25 agents
- 170 connectors
- Providers: DeepSeek 10, Kimi 5, MiMo 5, NVIDIA 5
- Gates: file_exists, tsc_compiles, has_decorator, has_baseclass, no_any_types

### Phase 5: Index + Report (30 min)
- 5 agents
- Update `packages/core/src/connectors/index.ts`
- Generate final report
- Providers: DeepSeek 3, Kimi 2

---

## Verification System

Every connector passes through verification gates before being committed.

### Gate Definitions

| Gate | What It Checks | How |
|------|----------------|-----|
| `file_exists` | File was written to disk | `fs.existsSync(filePath)` |
| `tsc_compiles` | No TypeScript syntax errors | Basic syntax validation |
| `has_decorator` | Has `@registerSource()` or `@registerTarget()` | String search |
| `has_baseclass` | Has `extends BaseConnector` | String search |
| `no_any_types` | No `: any` or `<any>` type annotations | String search |
| `index_updated` | index.ts exports all connectors | File exists + has exports |
| `exports_valid` | index.ts has valid export statements | Content check |

### What Happens on Failure

1. Gate check fails
2. File is deleted from disk
3. Error is logged
4. Connector is NOT committed
5. Orchestrator continues to next connector

---

## Budget Tracking

```
Total budget: 500,000 tokens (~$70)

Phase 1:  20,000 tokens
Phase 2: 117,500 tokens
Phase 3:  12,500 tokens
Phase 4:  85,000 tokens
Phase 5:   5,000 tokens
─────────────────────
Estimated: 240,000 tokens
Reserve:   260,000 tokens

Emergency threshold: <100,000 remaining
Action: Skip optional phases, finish core work
```

---

## Git Commits

Commits happen at:
1. End of each phase (5 commits minimum)
2. Every 15 minutes during execution (auto-commit)

Commit message format:
```
chore(blitz): Phase N: Description — M connectors verified
```

All commits are rollback-safe:
```bash
# View all blitz commits
git log --oneline | grep "chore(blitz)"

# Rollback to before blitz
git log --oneline | grep "chore(blitz)" | tail -1
# Then: git reset --hard <commit-before-blitz>
```

---

## Monitoring

### Live Logs
```bash
tail -f overnight-blitz.log
```

### Check Progress
```bash
# How many connectors so far?
ls packages/core/src/connectors/*.ts | wc -l

# Which phase is running?
tail -5 overnight-blitz.log

# Budget status?
grep BUDGET overnight-blitz.log | tail -1
```

### PID Management
```bash
# Check if running
cat .overnight-blitz.pid
ps -p $(cat .overnight-blitz.pid)

# Stop gracefully
kill $(cat .overnight-blitz.pid)

# Force stop
kill -9 $(cat .overnight-blitz.pid)
```

---

## Troubleshooting

### "Can't find npm"
Install Node.js from https://nodejs.org/ (version 20+).

### "Git not configured"
The script auto-configures git. If it fails:
```bash
git config user.email "you@example.com"
git config user.name "Your Name"
```

### "Orchestrator crashed at 03:00"
All committed work is safe. Restart:
```bash
npm run blitz:start
```
It continues from the last commit.

### "Budget ran out at 02:00"
Core phases (1-4) are designed to complete within budget. If budget runs out:
- Phases 1-4 are already committed
- Phase 5 (index update) is optional
- Run manually: `npx tsx scripts/overnight-blitz/orchestrator.ts`

### "TypeScript errors after blitz"
Run typecheck to find issues:
```bash
npm run typecheck
```
Fix any errors in the generated connector files.

### "Docker services won't start"
Non-critical. The blitz generates connector code, not integration tests. Docker is only needed for the certification lab.

### "Want to regenerate a specific connector"
Delete the file and rerun:
```bash
rm packages/core/src/connectors/<name>.ts
npm run blitz:start
```

---

## Customization

### Edit Connector Catalog
Modify `CONNECTOR_CATALOG` in `scripts/overnight-blitz/orchestrator.ts`.

### Edit Templates
Modify `TEMPLATE_GENERATORS` in `scripts/overnight-blitz/orchestrator.ts`.

### Adjust Budget
Edit `BudgetState.total` in the orchestrator.

### Change Provider Mix
Edit `provider_mix` in `buildPhases()`.

### Add Verification Gates
Add to `runGate()` method in the orchestrator.

---

## Architecture

```
orchestrator.ts
    |
    ├── CONNECTOR_CATALOG[]     → 550+ connector definitions
    ├── TEMPLATE_GENERATORS{}   → Code templates by category
    ├── buildPhases()           → Phase configuration
    ├── OvernightBlitzOrchestrator
    │   ├── run()               → Main loop
    │   ├── executeConnectorPhase() → Generate + verify batch
    │   ├── generateBatch()     → Write connector files
    │   ├── runGate()           → Verification
    │   ├── gitCommit()         → Auto-commit
    │   ├── executeIndexPhase() → Update index.ts
    │   └── finalReport()       → Save JSON report
    └── main()                  → Entry point
```

---

## Output Files

| File | Content |
|------|---------|
| `packages/core/src/connectors/<name>.ts` | Individual connector files |
| `packages/core/src/connectors/index.ts` | Auto-generated barrel export |
| `docs/lab/results/OVERNIGHT_BLITZ_FINAL.json` | Final report |
| `overnight-blitz.log` | Execution log |
| `.overnight-blitz.pid` | Orchestrator PID |

---

## FAQ

**Q: Can I run it during the day?**
A: Yes, but it's designed for overnight. Takes 3-8 hours.

**Q: Will it break my existing connectors?**
A: No. It only creates NEW files. Existing connectors are untouched.

**Q: What if I already have some connectors?**
A: The orchestrator checks if a file exists before generating. Existing files are skipped.

**Q: How accurate are the generated connectors?**
A: They follow exact Pulsyn conventions (BaseConnector, registerSource decorator, proper types). They're real, compilable TypeScript. But they're templates — you'll need to fill in the actual API integration logic.

**Q: Can I add my own connectors to the catalog?**
A: Yes. Add entries to `CONNECTOR_CATALOG` in orchestrator.ts.

**Q: What about tests?**
A: The blitz generates connector code, not tests. Tests are a separate concern.

---

## Related Docs

- Master plan: `OVERNIGHT_BLITZ_100_AGENTS.md`
- Go-live commands: `OVERNIGHT_BLITZ_GO_LIVE.md`
- System overview: `BLITZ_SYSTEM_READY.md`
- Certification system: `docs/lab/AUTONOMOUS_CERTIFICATION_GUIDE.md`
- Connector docs: `docs/CONNECTORS.md`
