# Pulsyn Autonomous Certification System

The autonomous certification system runs **unattended for 8 hours**, testing and certifying connectors while you sleep. No human intervention required.

## Quick Start

### 1. Setup (One-Time)

```bash
npm run cert:setup
```

This initializes:
- Directories (`docs/lab/results/`, etc.)
- Configuration files
- Health check scripts
- Prerequisites validation

### 2. Start Docker Lab

```bash
docker-compose -f docker-compose.lab.yml up -d
```

Waits for all 11 services to be healthy (Postgres, MySQL, MongoDB, Redis, etc.)

### 3. Run Certification

#### Option A: Local Testing (1 iteration, ~30 minutes)

```bash
npm run cert:run-local
```

Runs PHASE_1 only with reduced max connectors for quick testing.

#### Option B: Full 8-Hour Run (Nightly)

```bash
npm run cert:run
```

Runs all 3 phases (180m + 120m + 180m = 8 hours total):
- **PHASE_1** (3h): Tier 2-3 (high quality) + Tier 4-5 (long-tail)
- **PHASE_2** (2h): More Tier 5 connectors
- **PHASE_3** (3h): Remaining Tier 5 + relaxed approval gates

Each phase auto-commits results to git at the boundary.

#### Option C: Schedule Nightly

The GitHub Actions workflow runs automatically at **2:00 AM UTC** daily.

To trigger manually:
```bash
gh workflow run pulsyn-cert-nightly.yml
```

### 4. Monitor Progress

In another terminal, watch the progress in real-time:

```bash
npm run cert:monitor
```

Shows:
- Current phase and status
- Connectors certified/failed
- Latest result file
- Timeline of completed phases

### 5. View Results

After the run completes:

```bash
# Certification matrix (structured)
cat docs/lab/cert-matrix.json | jq '.connectors | keys | length'

# Final report
cat docs/lab/results/FINAL-*.json | jq '.'

# All commits
git log --oneline -20 | grep chore\\(cert\\)
```

---

## How It Works

### Architecture

```
controller.ts (orchestrator)
    ↓
  (Phase 1-3 loop)
    ├→ Load queue (connectors by tier)
    ├→ Dispatch to DeepSeek swarm (parallel test execution)
    ├→ Collect metrics (latency, throughput, error rate)
    ├→ Auto-approve (based on tier-specific gates)
    └→ Auto-commit (git add + commit + push)
```

### Approval Gates (Tier-Specific)

| Tier | Pass Rate | Latency p99 | Throughput | Error Rate |
|------|-----------|-------------|------------|-----------|
| Tier 2-3 | ≥95% | ≤500ms | ≥5k rows/s | ≤0.1% |
| Tier 4 | ≥90% | ≤1000ms | ≥1k rows/s | ≤1.0% |
| Tier 5 | ≥80% | ≤2000ms | ≥500 rows/s | ≤5.0% |

Higher tiers (2-3) are more stringent. Lower tiers (5) are relaxed for stubs.

### Expected Throughput

**5-Hour Run (Phase 1+2):**
- ~40-60 connectors tested
- ~8 Tier 2-3 certified
- ~30-50 Tier 4-5 qualified

**8-Hour Run (All Phases):**
- ~100-150 connectors tested
- ~8 Tier 2-3 certified
- ~90-140 Tier 4-5 qualified

Actual throughput depends on:
- Docker service health
- Test parallelization (default: 3 workers)
- Connector complexity (Tier 2 slower, Tier 5 faster)
- Network latency

---

## Configuration

### Environment Variables (`.env.test`)

```bash
# Lab Services
TEST_POSTGRES_HOST=localhost
TEST_MYSQL_HOST=localhost
TEST_MONGODB_HOST=localhost

# Approval Thresholds (per tier)
CERT_APPROVAL_THRESHOLD_TIER2=95
CERT_APPROVAL_THRESHOLD_TIER4=90
CERT_APPROVAL_THRESHOLD_TIER5=80

# Phase Durations
CERT_PHASE1_DURATION_MINUTES=180
CERT_PHASE2_DURATION_MINUTES=120
CERT_PHASE3_DURATION_MINUTES=180

# Parallel Workers
CERT_MAX_PARALLEL_WORKERS=3

# Notifications (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
EMAIL_TO=ops@pulsyn.io
```

### Phase Configuration (`controller.ts`)

Modify `PHASES` constant to adjust:
- `duration_minutes`: Phase length
- `tier_order`: Which tiers to test (e.g., skip stubs)
- `max_connectors`: Queue size limit
- `approval_threshold_percent`: Pass rate required

---

## Troubleshooting

### Docker Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.lab.yml logs -f postgres

# Restart all
docker-compose -f docker-compose.lab.yml restart

# Full reset (careful: deletes data)
docker-compose -f docker-compose.lab.yml down -v
docker-compose -f docker-compose.lab.yml up -d
```

### Git Commit Fails

```bash
# Configure git user
git config user.email "automation@pulsyn.io"
git config user.name "Pulsyn Automation"

# Check uncommitted changes
git status
```

### Certification Stalls

Check if a test is hanging:

```bash
# Monitor swarm execution
npm run cert:monitor

# View controller logs
tail -f cert-output.log

# Kill and restart
kill $(pgrep -f "cert.*controller")
npm run cert:run
```

### Results File Not Created

```bash
# Check results directory
ls -la docs/lab/results/

# Verify write permissions
touch docs/lab/results/test.txt

# Check cert matrix
cat docs/lab/cert-matrix.json
```

---

## Integration

### GitHub Actions

The workflow runs nightly at **2:00 AM UTC**:

```yaml
# .github/workflows/pulsyn-cert-nightly.yml
on:
  schedule:
    - cron: '0 2 * * *'
```

Results are:
- ✅ Committed to git automatically
- 📨 Posted to Slack/Discord (via webhook)
- 📊 Uploaded as workflow artifacts

### Slack Notifications

Set `SLACK_WEBHOOK_URL` in `.env.test` or GitHub Secrets.

Messages include:
- ✅ Phase complete (certified/failed counts)
- ❌ Phase failed (error details)
- 🎉 Final report (all-time certified)

### Dashboard Integration

Results are available at:
- **Matrix API**: `GET /api/certifications`
- **Dashboard**: `pulsynai.com/certifications`
- **CSV Export**: `docs/lab/cert-matrix.csv`

---

## Files

| File | Purpose |
|------|---------|
| `scripts/auto-certify/controller.ts` | Main orchestration (Phase 1-3) |
| `packages/core/src/auto-approval.ts` | Approval gate logic |
| `scripts/auto-certify/setup.ts` | Prerequisites validation |
| `scripts/auto-certify/monitor.ts` | Real-time progress monitoring |
| `.github/workflows/pulsyn-cert-nightly.yml` | GitHub Actions workflow |
| `docs/lab/cert-matrix.json` | Live certification matrix |
| `docs/lab/results/` | Phase results (JSON) |

---

## FAQ

**Q: Can I interrupt the run?**
A: Yes, press Ctrl+C. Results are auto-committed at phase boundaries, so no work is lost.

**Q: How many connectors will be certified?**
A: 5-8 Tier 2-3 (high quality), 40-140 Tier 4-5 (tested). See "Expected Throughput" above.

**Q: Can I adjust approval thresholds?**
A: Yes, edit `APPROVAL_GATES` in `packages/core/src/auto-approval.ts` or `.env.test`.

**Q: What if a test times out?**
A: The swarm timeout is 300s per connector. Connectors that timeout are marked FAILED and retried next phase.

**Q: Can I run multiple phases in parallel?**
A: No, phases are sequential by design (better resource usage). Parallelization is within each phase (3 workers per phase).

**Q: How do I skip stubs?**
A: Modify `tier_order` in PHASES to exclude `tier5` (stubs are Tier 5).

---

## Next Steps

1. **Today**: Run `npm run cert:setup` + `npm run cert:run-local` to test locally
2. **Tonight**: Enable GitHub Actions OR run `npm run cert:run` manually at 2:00 AM
3. **Tomorrow**: Check `docs/lab/cert-matrix.json` for results
4. **This Week**: Deploy dashboard to `pulsynai.com/certifications`

---

**Support**: For issues, check logs in `docs/lab/results/` or see Troubleshooting above.
