#!/usr/bin/env bash
# Pulsyn Replication Race — Cleanup Script
# Tears down competition containers, networks, and volumes.
# Usage: ./cleanup.sh [--force] [--keep-results]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$COMPOSE_DIR/docker-compose.competition.yml"

FORCE=false
KEEP_RESULTS=false

for arg in "$@"; do
  case "$arg" in
    --force) FORCE=true ;;
    --keep-results) KEEP_RESULTS=true ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

echo "============================================"
echo "Pulsyn Replication Race — Cleanup"
echo "============================================"

# Stop and remove containers
echo "[1/4] Stopping competition containers..."
if [ "$FORCE" = true ]; then
  docker compose -f "$COMPOSE_FILE" down --remove-orphans --timeout 10 2>/dev/null || true
else
  docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
fi

# Remove competitor networks
echo "[2/4] Removing isolated networks..."
for i in 1 2 3 4; do
  docker network rm "pulsyn_competitor-${i}-net" 2>/dev/null || true
done

# Remove volumes
echo "[3/4] Cleaning up volumes..."
if [ "$KEEP_RESULTS" = true ]; then
  echo "  Keeping competition-results volume (--keep-results)"
  for i in 1 2 3 4; do
    docker volume rm "pulsyn_comp${i}-source-data" 2>/dev/null || true
    docker volume rm "pulsyn_comp${i}-target-data" 2>/dev/null || true
  done
else
  docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true
fi

# Prune dangling images from competition builds
echo "[4/4] Pruning competition images..."
docker image prune -f --filter "label=competition=pulsyn-race" 2>/dev/null || true

echo ""
echo "Cleanup complete."
echo "============================================"
