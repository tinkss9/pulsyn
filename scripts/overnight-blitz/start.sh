#!/bin/bash
# Overnight Blitz Startup Script
# Cross-platform: works on Linux, macOS, Git Bash on Windows

set -e

echo "=== Pulsyn Overnight Blitz ==="
echo "100 AI Agents, 5 Phases, 550+ Connectors"
echo ""

# ─── Prerequisites ────────────────────────────────────────────────────────────

echo "[1/5] Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org/"
  exit 1
fi
echo "  Node.js: $(node --version)"

if ! command -v git &> /dev/null; then
  echo "ERROR: Git not found. Cannot commit results."
  exit 1
fi
echo "  Git: $(git --version)"

if command -v docker &> /dev/null; then
  echo "  Docker: $(docker --version | head -1)"
else
  echo "  Docker: not found (lab tests will be skipped)"
fi

echo ""

# ─── Git Config ───────────────────────────────────────────────────────────────

echo "[2/5] Checking git config..."

if [ -z "$(git config user.email)" ]; then
  echo "  Setting git user.email to blitz@pulsyn.io"
  git config user.email "blitz@pulsyn.io"
  git config user.name "Pulsyn Blitz"
fi
echo "  Git user: $(git config user.name) <$(git config user.email)>"
echo ""

# ─── Docker Lab ───────────────────────────────────────────────────────────────

echo "[3/5] Docker lab..."

if [ -f "docker-compose.lab.yml" ] && command -v docker &> /dev/null; then
  echo "  Starting lab services..."
  docker-compose -f docker-compose.lab.yml up -d 2>/dev/null || echo "  Warning: Docker lab start failed (non-critical)"
  sleep 3
  echo "  Lab services started"
else
  echo "  Skipped (no docker-compose.lab.yml or Docker not available)"
fi
echo ""

# ─── Create Output Dirs ──────────────────────────────────────────────────────

echo "[4/5] Preparing output directories..."

mkdir -p docs/lab/results
mkdir -p scripts/overnight-blitz/tasks
echo "  docs/lab/results/"
echo "  scripts/overnight-blitz/tasks/"
echo ""

# ─── Launch Orchestrator ─────────────────────────────────────────────────────

echo "[5/5] Launching orchestrator..."
echo ""

# Clear old log
> overnight-blitz.log

# Start orchestrator in background
npx tsx scripts/overnight-blitz/orchestrator.ts >> overnight-blitz.log 2>&1 &
ORCHESTRATOR_PID=$!

echo "  Orchestrator PID: $ORCHESTRATOR_PID"
echo "  Log file: overnight-blitz.log"
echo ""

# Save PID
echo $ORCHESTRATOR_PID > .overnight-blitz.pid

echo "=== Blitz Running ==="
echo ""
echo "  Monitor:  tail -f overnight-blitz.log"
echo "  Status:   cat docs/lab/results/OVERNIGHT_BLITZ_FINAL.json"
echo "  Stop:     kill $ORCHESTRATOR_PID"
echo ""
echo "Expected results in ~7.5 hours:"
echo "  - 550+ connector files generated"
echo "  - All verified (no hallucinations)"
echo "  - Committed to git"
echo "  - Report at docs/lab/results/OVERNIGHT_BLITZ_FINAL.json"
echo ""
echo "Go to sleep. Check results at 08:00."
echo ""
