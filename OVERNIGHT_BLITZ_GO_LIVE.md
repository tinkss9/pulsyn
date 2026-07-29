# GO LIVE: Tonight's Blitz — Copy-Paste Commands

**When:** 22:00 tonight → 08:00 tomorrow
**Setup:** 2 minutes
**Command:** 1 line

---

## Step 1: Verify Ready (2 min before 22:00)

```bash
cd ~/pulsyn
node --version    # >= 20
git --version     # required
git status        # clean or all committed
```

---

## Step 2: Start the Blitz (at 22:00)

```bash
npm run blitz:start
```

Output:
```
=== Pulsyn Overnight Blitz ===
100 AI Agents, 5 Phases, 550+ Connectors

[1/5] Checking prerequisites...
  Node.js: v22.x.x
  Git: git version 2.x.x
[2/5] Checking git config...
  Git user: Pulsyn Blitz <blitz@pulsyn.io>
[3/5] Docker lab...
  Skipped (no docker-compose.lab.yml or Docker not available)
[4/5] Preparing output directories...
[5/5] Launching orchestrator...

  Orchestrator PID: 12345
  Log file: overnight-blitz.log

=== Blitz Running ===

  Monitor:  tail -f overnight-blitz.log
  Stop:     kill 12345

Go to sleep. Check results at 08:00.
```

---

## Step 3: Sleep

The orchestrator runs autonomously:
- Phase 1: Database + Streaming (45 min)
- Phase 2: SaaS + CRM + Payment (90 min)
- Phase 3: Cloud + Warehouse (45 min)
- Phase 4: Specialty (60 min)
- Phase 5: Index + Report (30 min)

Total: ~4.5 hours. You'll have results well before 08:00.

---

## Step 4: Wake Up at 08:00

```bash
cd ~/pulsyn

# Final report
npm run blitz:status

# Count connectors
ls packages/core/src/connectors/*.ts | wc -l

# Check commits
git log --oneline -20 | grep chore
```

Expected:
```
550+ connector files
15-23 git commits
docs/lab/results/OVERNIGHT_BLITZ_FINAL.json
```

---

## Optional: Monitor Live

In another terminal:
```bash
tail -f overnight-blitz.log
```

Shows real-time: agent progress, verification gates, budget, commits.

---

## Optional: Stop/Restart

```bash
# Stop
kill $(cat .overnight-blitz.pid)

# Restart (continues from last commit)
npm run blitz:start
```

---

## Morning Checklist

- [ ] `npm run blitz:status` shows COMPLETE
- [ ] `ls packages/core/src/connectors/*.ts | wc -l` shows 550+
- [ ] `git log --oneline -20 | grep chore` shows 15+ commits
- [ ] `cat docs/lab/results/OVERNIGHT_BLITZ_FINAL.json | jq .status` shows COMPLETE
- [ ] All changes committed (no dirty state)

```bash
# All-in-one check
echo "Status:" && cat docs/lab/results/OVERNIGHT_BLITZ_FINAL.json | jq -r '.status'
echo "Files:" && ls packages/core/src/connectors/*.ts | wc -l
echo "Commits:" && git log --oneline -30 | grep -c chore
echo "Budget:" && cat docs/lab/results/OVERNIGHT_BLITZ_FINAL.json | jq -r '.budget_pct'
```

---

## If Something Goes Wrong

| Problem | Fix |
|---------|-----|
| `npm: command not found` | Install Node.js from nodejs.org |
| `Git not configured` | `git config user.email "you@example.com"` |
| Orchestrator crashed | `npm run blitz:start` (resumes from last commit) |
| Budget ran out | Core phases (1-4) already done. Phase 5 is optional. |
| Need to stop | `kill $(cat .overnight-blitz.pid)` — all committed work is safe |

---

## The Command

**Copy this at 22:00:**

```bash
cd ~/pulsyn && npm run blitz:start
```

**Check at 08:00:**

```bash
cd ~/pulsyn && npm run blitz:status && echo "---" && ls packages/core/src/connectors/*.ts | wc -l
```
