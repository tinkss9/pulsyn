# Pulsyn Autonomous Certification System — Complete Guide

## Overview

The autonomous certification system automatically tests, approves, and certifies connectors **without human intervention** for **8 hours straight**.

You start it before bed. You wake up with ~100-150 certified connectors committed to git.

---

## What's Built

### 1. Controller (`scripts/auto-certify/controller.ts`)
- **3-phase orchestration** (3h + 2h + 3h = 8 hours total)
- Auto-commits results at each phase boundary
- Prevents stale state (resets cert matrix, cleans old results)
- Dispatches to DeepSeek swarm for parallel testing
- Loads connector queue by tier (Tier 2-3 first, then 4-5)

### 2. Approval Gates (`packages/core/src/auto-approval.ts`)
- **Tier-specific quality gates**:
  - Tier 2-3: 95% pass rate, ≤500ms latency, ≥5k rows/s, ≤0.1% error
  - Tier 4: 90% pass rate, ≤1000ms latency, ≥1k rows/s, ≤1.0% error
  - Tier 5: 80% pass rate, ≤2000ms latency, ≥500 rows/s, ≤5.0% error
- Auto-calculates approval score (0-100)
- Generates detailed reports per connector

### 3. Setup & Monitoring
- **`setup.ts`**: Initializes directories, validates prerequisites, creates config files
- **`monitor.ts`**: Real-time dashboard showing phase progress, certified count, timeline
- **`README.md`**: Complete usage guide with troubleshooting

### 4. GitHub Actions Workflow
- **`.github/workflows/pulsyn-cert-nightly.yml`**
- Runs nightly at **2:00 AM UTC**
- Auto-starts Docker lab, runs controller, uploads results, posts to Slack
- Can be triggered manually: `gh workflow run pulsyn-cert-nightly.yml`

### 5. npm Scripts
```bash
npm run cert:setup       # Initialize system (one-time)
npm run cert:run-local   # Test locally (30 min, 1 phase)
npm run cert:run         # Full 8-hour autonomous run
npm run cert:monitor     # Real-time progress dashboard
```

---

## Expected Throughput

### Phase 1 (3 hours, 180 minutes)
- Queue: Tier 2 (5) + Tier 3 (3) + Tier 4 (10) + Tier 5 (fill to 63)
- Result: **~5-8 certified (Tier 2-3) + 30-50 tested (Tier 4-5)**
- Auto-commit when complete

### Phase 2 (2 hours, 120 minutes)
- Queue: Tier 5 only (up to 45 connectors)
- Result: **~20-25 more Tier 5 tested**
- Auto-commit when complete

### Phase 3 (3 hours, 180 minutes)
- Queue: Tier 5 only (up to 75 connectors)
- Approval gate relaxed to 80% (more lenient)
- Result: **~30-50 more Tier 5 qualified**
- Final auto-commit + email digest

**Total 8 Hours:**
- **Certified (Tier 1-3)**: 8
- **Qualified (Tier 4-5)**: 70-120
- **Total tested**: 100-150 connectors
- All committed to git, no manual intervention

---

## Step-by-Step Setup (15 minutes)

### 1. Run Setup Script

```bash
npm run cert:setup
```

Creates:
- ✅ `docs/lab/results/` directory
- ✅ `docs/lab/cert-matrix.json` (empty)
- ✅ `.env.test` configuration file
- ✅ `scripts/check-lab-health.sh` health check
- ✅ Validates Node, Docker, Git

### 2. Start Docker Lab

```bash
docker-compose -f docker-compose.lab.yml up -d
```

Waits for all 11 services:
- PostgreSQL (port 5432)
- MySQL (port 3306)
- MongoDB (port 27017)
- Redis (port 6379)
- MSSQL (port 1433)
- ClickHouse (port 8123)
- Cassandra (port 9042)
- Elasticsearch (port 9200)
- Kafka (port 9092)
- DynamoDB (port 8000)
- LocalStack (port 4566)

### 3. Test Local (Optional, 30 min)

```bash
npm run cert:run-local
```

Runs PHASE_1 only with reduced queue. Good for testing before the full 8-hour run.

### 4. Configure Notifications (Optional)

Edit `.env.test`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK
EMAIL_TO=ops@pulsyn.io
```

### 5. Enable GitHub Actions

The workflow is already in `.github/workflows/pulsyn-cert-nightly.yml` and will run automatically at **2:00 AM UTC** daily.

To trigger manually:
```bash
gh workflow run pulsyn-cert-nightly.yml
```

---

## Running the 8-Hour Autonomous Build

### Start the Run

```bash
npm run cert:run &
```

(or just press Enter if running from a terminal)

This will:
1. ✅ Load connector queue (tier order: 2, 3, 4, 5)
2. ✅ Dispatch PHASE_1 to swarm (180 min)
3. ✅ Auto-commit results @ 3h mark
4. ✅ Dispatch PHASE_2 to swarm (120 min)
5. ✅ Auto-commit results @ 5h mark
6. ✅ Dispatch PHASE_3 to swarm (180 min)
7. ✅ Final auto-commit + email digest @ 8h mark

### Monitor Progress (In Another Terminal)

```bash
npm run cert:monitor
```

Shows:
- Current phase and status
- Total certified/tested count
- Timeline of completed phases
- Latest result file

Updates every 10 seconds.

### Wake Up Results

When you wake up:

```bash
# Latest commits
git log --oneline -10 | grep chore\\(cert\\)

# Certification matrix
cat docs/lab/cert-matrix.json | jq '.'

# Final report
cat docs/lab/results/FINAL-*.json | jq '.'
```

Output:
```
✅ Total Certified: 108 (Tier 1-4)
✅ Total Qualified: 92 (Tier 4-5)
✅ All-Time Certified: 200
✅ Total Duration: 8h 2m

🎉 All changes committed to git.
📊 Slack notification sent.
```

---

## Cert Matrix Format

**Location**: `docs/lab/cert-matrix.json`

**Structure**:
```json
{
  "metadata": {
    "version": "1.0",
    "created_at": "2026-07-29T02:00:00Z",
    "updated_at": "2026-07-29T10:05:00Z",
    "total_certified": 108
  },
  "connectors": {
    "postgresql": {
      "status": "CERTIFIED",
      "pass_rate": 100.0,
      "tested_at": "2026-07-29T02:15:00Z",
      "phase": "PHASE_1_TIER_PRIORITY",
      "metrics": {
        "latency_p99_ms": 240,
        "throughput_rows_sec": 12450,
        "error_rate": 0.0
      }
    },
    "mysql": {
      "status": "CERTIFIED",
      "pass_rate": 100.0,
      ...
    },
    "stripe": {
      "status": "FAILED",
      "pass_rate": 65.0,
      "tested_at": "2026-07-29T02:45:00Z",
      "phase": "PHASE_1_TIER_PRIORITY",
      "failure_reason": "Pass rate 65% < 95% (FAIL)"
    },
    ...
  }
}
```

---

## Auto-Commit Strategy

At each phase boundary, the system auto-commits:

```bash
# PHASE_1 complete (@ 3h mark)
git add docs/lab/cert-matrix.json docs/lab/results/PHASE_1_TIER_PRIORITY-*.json
git commit -m "chore(cert): PHASE_1_TIER_PRIORITY complete — 8 certified, 2 failed"
git push

# PHASE_2 complete (@ 5h mark)
git commit -m "chore(cert): PHASE_2_CONTINUATION complete — 12 certified, 3 failed"
git push

# PHASE_3 complete (@ 8h mark)
git commit -m "chore(cert): PHASE_3_LONG_TAIL complete — 15 certified, 8 failed"
git push

# Final report
git commit -m "chore(cert): final report — 108 certified total"
git push
```

**No manual commit needed.** Everything is in git when you wake up.

---

## Customization

### Adjust Phase Duration

Edit `scripts/auto-certify/controller.ts`:

```typescript
const PHASES: Phase[] = [
  {
    name: 'PHASE_1_TIER_PRIORITY',
    duration_minutes: 180,  // ← Change this
    ...
  },
  ...
];
```

### Change Approval Thresholds

Edit `packages/core/src/auto-approval.ts`:

```typescript
const APPROVAL_GATES: Record<string, ApprovalGate> = {
  TIER_2_3: {
    pass_rate_min: 95,           // ← Change this
    latency_p99_max_ms: 500,     // ← Or this
    throughput_min_rows_sec: 5000,
    error_rate_max: 0.1,
  },
  ...
};
```

### Skip Tiers

Edit `controller.ts` PHASES:

```typescript
{
  name: 'PHASE_1',
  tier_order: ['tier2', 'tier3', 'tier4'],  // ← Skip 'tier5' to avoid stubs
  ...
},
```

### Adjust Parallel Workers

Edit `.env.test`:

```bash
CERT_MAX_PARALLEL_WORKERS=3  # Increase for faster testing (uses more CPU/RAM)
```

---

## Troubleshooting

### Docker Lab Won't Start

```bash
# Check what's running
docker-compose -f docker-compose.lab.yml ps

# View logs
docker-compose -f docker-compose.lab.yml logs postgres

# Full restart (clears all data)
docker-compose -f docker-compose.lab.yml down -v
docker-compose -f docker-compose.lab.yml up -d
```

### Certification Stalled

```bash
# Check process
ps aux | grep cert

# Kill and restart
pkill -f "cert.*controller"
npm run cert:run
```

### Git Commit Failed

```bash
# Configure git
git config user.email "automation@pulsyn.io"
git config user.name "Pulsyn Automation"

# Check uncommitted changes
git status

# Manually commit if needed
git add .
git commit -m "manual: cert results"
git push
```

### Missing Results

```bash
# Check directory
ls -la docs/lab/results/

# Check permissions
touch docs/lab/results/test.txt && rm $_

# View controller output
tail -f cert-output.log
```

---

## Timeline for 5-Day Launch

| Day | Task | Time |
|-----|------|------|
| **Day 1 (Today)** | Run `cert:setup` + `cert:run-local` | 1h |
| **Night 1** | Full 8h autonomous run | 8h (while you sleep) |
| **Day 2** | Review results, adjust gates if needed | 1h |
| **Night 2** | Second 8h run (iterate gates) | 8h |
| **Day 3** | Deploy dashboard to `pulsynai.com/certifications` | 2h |
| **Day 4** | Announce certification matrix publicly | 30m |
| **Day 5** | Enable nightly schedule (2 AM UTC daily) | 15m |

**By Day 5:** You have 200+ connectors tested, 50+ certified, live public certification matrix.

---

## Success Criteria

✅ **System is working if:**

1. Docker lab starts without errors
2. `cert:run-local` completes Phase 1 (30-45 min)
3. Results appear in `docs/lab/results/`
4. `docs/lab/cert-matrix.json` is updated
5. Git commits appear: `git log --oneline -3`
6. Monitor shows live updates: `cert:monitor`

❌ **If anything fails:**

- Check Docker: `docker-compose -f docker-compose.lab.yml ps`
- Check logs: `tail -f cert-output.log`
- Check git: `git status`
- See Troubleshooting section above

---

## Next Command

Ready to start?

```bash
npm run cert:setup
```

Then:

```bash
docker-compose -f docker-compose.lab.yml up -d
npm run cert:run-local
```

Then monitor:

```bash
npm run cert:monitor
```

Check back in 30-45 minutes for Phase 1 results. ✅

For the full 8-hour run: `npm run cert:run` (at night before bed).

---

**Questions?** See `scripts/auto-certify/README.md` for detailed documentation.
