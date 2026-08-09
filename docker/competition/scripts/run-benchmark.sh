#!/usr/bin/env bash
# Pulsyn Replication Race — Benchmark Runner
# Runs inside each competitor's isolated container.
# Writes results as JSON to $COMPETITION_RESULTS_DIR/results.json

set -euo pipefail

# ---------------------------------------------------------------------------
# Config from environment
# ---------------------------------------------------------------------------
RUN_ID="${COMPETITION_RUN_ID:-unknown}"
COMPETITOR_ID="${COMPETITION_COMPETITOR_ID:-unknown}"
SRC_HOST="${COMPETITION_SOURCE_HOST}"
SRC_PORT="${COMPETITION_SOURCE_PORT:-5432}"
SRC_DB="${COMPETITION_SOURCE_DB}"
SRC_USER="${COMPETITION_SOURCE_USER}"
SRC_PASS="${COMPETITION_SOURCE_PASSWORD}"
TGT_HOST="${COMPETITION_TARGET_HOST}"
TGT_PORT="${COMPETITION_TARGET_PORT:-5432}"
TGT_DB="${COMPETITION_TARGET_DB}"
TGT_USER="${COMPETITION_TARGET_USER}"
TGT_PASS="${COMPETITION_TARGET_PASSWORD}"
TGT_ENGINE="${COMPETITION_TARGET_ENGINE:-postgresql}"
DURATION="${COMPETITION_DURATION_SECONDS:-300}"
BATCH_SIZE="${COMPETITION_BATCH_SIZE:-1000}"
TOTAL_ROWS="${COMPETITION_TOTAL_ROWS:-100000}"
RESULTS_DIR="${COMPETITION_RESULTS_DIR:-/results}"

mkdir -p "$RESULTS_DIR"

RESULTS_FILE="$RESULTS_DIR/results.json"
LOG_FILE="$RESULTS_DIR/run.log"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
log() {
  local ts
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$ts] $*" | tee -a "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Wait for database to be ready
# ---------------------------------------------------------------------------
wait_for_db() {
  local host="$1" port="$2" user="$3" db="$4" label="$5"
  local retries=30
  log "Waiting for $label at $host:$port/$db ..."
  for i in $(seq 1 $retries); do
    if PGPASSWORD="$5" pg_isready -h "$host" -p "$port" -U "$user" -d "$db" > /dev/null 2>&1; then
      log "$label is ready."
      return 0
    fi
    sleep 1
  done
  log "ERROR: $label not ready after ${retries}s"
  return 1
}

# ---------------------------------------------------------------------------
# Create test tables in source
# ---------------------------------------------------------------------------
setup_source() {
  log "Setting up source database..."
  PGPASSWORD="$SRC_PASS" psql -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" <<-SQL
    CREATE TABLE IF NOT EXISTS competition_source (
      id          SERIAL PRIMARY KEY,
      row_num     INTEGER NOT NULL,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      payload     TEXT NOT NULL,
      amount      NUMERIC(12,2) NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    TRUNCATE competition_source;
SQL
  log "Source table ready."
}

# ---------------------------------------------------------------------------
# Create target table
# ---------------------------------------------------------------------------
setup_target() {
  log "Setting up target database..."
  PGPASSWORD="$TGT_PASS" psql -h "$TGT_HOST" -p "$TGT_PORT" -U "$TGT_USER" -d "$TGT_DB" <<-SQL
    CREATE TABLE IF NOT EXISTS competition_target (
      id          SERIAL PRIMARY KEY,
      row_num     INTEGER NOT NULL,
      name        TEXT NOT NULL,
      email       TEXT NOT NULL,
      payload     TEXT NOT NULL,
      amount      NUMERIC(12,2) NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    TRUNCATE competition_target;
SQL
  log "Target table ready."
}

# ---------------------------------------------------------------------------
# Seed source data (bulk insert)
# ---------------------------------------------------------------------------
seed_source() {
  log "Seeding $TOTAL_ROWS rows into source (batch size $BATCH_SIZE)..."
  local batches=$(( (TOTAL_ROWS + BATCH_SIZE - 1) / BATCH_SIZE ))
  local start_time
  start_time=$(date +%s%N)

  for b in $(seq 0 $((batches - 1))); do
    local offset=$((b * BATCH_SIZE))
    local size=$BATCH_SIZE
    if [ $((offset + size)) -gt "$TOTAL_ROWS" ]; then
      size=$((TOTAL_ROWS - offset))
    fi

    # Generate batch values
    local values=""
    for i in $(seq 0 $((size - 1))); do
      local row_num=$((offset + i))
      if [ -n "$values" ]; then values="$values,"; fi
      values="$values($row_num, 'user_$row_num', 'user${row_num}@comp.pulsyn', '$(head -c 32 /dev/urandom | base64 | tr -d '\n/+=' | head -c 64)', $(( RANDOM % 1000000 )) / 100.0, now())"
    done

    PGPASSWORD="$SRC_PASS" psql -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
      -c "INSERT INTO competition_source (row_num, name, email, payload, amount, created_at) VALUES $values;" \
      -q 2>>"$LOG_FILE"
  done

  local end_time
  end_time=$(date +%s%N)
  local seed_ms=$(( (end_time - start_time) / 1000000 ))
  local seed_rps=$(( TOTAL_ROWS * 1000 / (seed_ms > 0 ? seed_ms : 1) ))
  log "Seeded $TOTAL_ROWS rows in ${seed_ms}ms ($seed_rps rows/sec)"
  echo "$seed_rps" > "$RESULTS_DIR/seed_rps.txt"
  echo "$seed_ms" > "$RESULTS_DIR/seed_ms.txt"
}

# ---------------------------------------------------------------------------
# Replicate source → target (simple SELECT/INSERT for competition baseline)
# ---------------------------------------------------------------------------
replicate_data() {
  log "Replicating data from source to target..."
  local start_time
  start_time=$(date +%s%N)

  # Dump source data and pipe into target
  PGPASSWORD="$SRC_PASS" psql -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
    -c "\\COPY (SELECT row_num, name, email, payload, amount, created_at FROM competition_source ORDER BY id) TO STDOUT WITH (FORMAT csv)" \
    2>>"$LOG_FILE" | \
  PGPASSWORD="$TGT_PASS" psql -h "$TGT_HOST" -p "$TGT_PORT" -U "$TGT_USER" -d "$TGT_DB" \
    -c "\\COPY competition_target (row_num, name, email, payload, amount, created_at) FROM STDIN WITH (FORMAT csv)" \
    2>>"$LOG_FILE"

  local end_time
  end_time=$(date +%s%N)
  local replicate_ms=$(( (end_time - start_time) / 1000000 ))
  local replicate_rps=$(( TOTAL_ROWS * 1000 / (replicate_ms > 0 ? replicate_ms : 1) ))
  log "Replicated in ${replicate_ms}ms ($replicate_rps rows/sec)"
  echo "$replicate_rps" > "$RESULTS_DIR/replicate_rps.txt"
  echo "$replicate_ms" > "$RESULTS_DIR/replicate_ms.txt"
}

# ---------------------------------------------------------------------------
# Verify correctness
# ---------------------------------------------------------------------------
verify_correctness() {
  log "Verifying data correctness..."

  local src_count tgt_count
  src_count=$(PGPASSWORD="$SRC_PASS" psql -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
    -t -c "SELECT count(*) FROM competition_source" | tr -d ' ')
  tgt_count=$(PGPASSWORD="$TGT_PASS" psql -h "$TGT_HOST" -p "$TGT_PORT" -U "$TGT_USER" -d "$TGT_DB" \
    -t -c "SELECT count(*) FROM competition_target" | tr -d ' ')

  local match_count
  match_count=$(PGPASSWORD="$TGT_PASS" psql -h "$TGT_HOST" -p "$TGT_PORT" -U "$TGT_USER" -d "$TGT_DB" \
    -t -c "
      SELECT count(*)
      FROM competition_source s
      JOIN competition_target t ON s.row_num = t.row_num
      WHERE s.name = t.name AND s.email = t.email AND s.payload = t.payload
    " | tr -d ' ')

  local correctness_pct=0
  if [ "$src_count" -gt 0 ]; then
    correctness_pct=$(echo "scale=4; $match_count * 100 / $src_count" | bc)
  fi

  log "Source rows: $src_count, Target rows: $tgt_count, Matched: $match_count ($correctness_pct%)"
  echo "$src_count" > "$RESULTS_DIR/src_count.txt"
  echo "$tgt_count" > "$RESULTS_DIR/tgt_count.txt"
  echo "$match_count" > "$RESULTS_DIR/match_count.txt"
  echo "$correctness_pct" > "$RESULTS_DIR/correctness_pct.txt"
}

# ---------------------------------------------------------------------------
# Measure latency (single-row round-trip)
# ---------------------------------------------------------------------------
measure_latency() {
  log "Measuring single-row latency (100 iterations)..."
  local total_us=0
  local iterations=100

  for i in $(seq 1 $iterations); do
    local t0
    t0=$(date +%s%N)
    PGPASSWORD="$SRC_PASS" psql -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
      -c "INSERT INTO competition_source (row_num, name, email, payload, amount) VALUES ($((TOTAL_ROWS + i)), 'latency_test_$i', 'lat${i}@bench.pulsyn', 'x', 0.01);" \
      -q 2>>"$LOG_FILE"
    local t1
    t1=$(date +%s%N)
    total_us=$((total_us + t1 - t0))
  done

  local avg_us=$((total_us / iterations))
  local avg_ms=$((avg_us / 1000000))
  log "Average single-row latency: ${avg_ms}ms (${avg_us}ns)"
  echo "$avg_ms" > "$RESULTS_DIR/latency_avg_ms.txt"
  echo "$avg_us" > "$RESULTS_DIR/latency_avg_us.txt"
}

# ---------------------------------------------------------------------------
# Write final results JSON
# ---------------------------------------------------------------------------
write_results() {
  local seed_rps replicate_rps replicate_ms correctness_pct latency_ms
  seed_rps=$(cat "$RESULTS_DIR/seed_rps.txt" 2>/dev/null || echo "0")
  replicate_rps=$(cat "$RESULTS_DIR/replicate_rps.txt" 2>/dev/null || echo "0")
  replicate_ms=$(cat "$RESULTS_DIR/replicate_ms.txt" 2>/dev/null || echo "0")
  correctness_pct=$(cat "$RESULTS_DIR/correctness_pct.txt" 2>/dev/null || echo "0")
  latency_ms=$(cat "$RESULTS_DIR/latency_avg_ms.txt" 2>/dev/null || echo "0")
  local src_count tgt_count match_count
  src_count=$(cat "$RESULTS_DIR/src_count.txt" 2>/dev/null || echo "0")
  tgt_count=$(cat "$RESULTS_DIR/tgt_count.txt" 2>/dev/null || echo "0")
  match_count=$(cat "$RESULTS_DIR/match_count.txt" 2>/dev/null || echo "0")

  cat > "$RESULTS_FILE" <<-JSON
{
  "runId": "$RUN_ID",
  "competitorId": "$COMPETITOR_ID",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "config": {
    "sourceEngine": "postgresql",
    "targetEngine": "$TGT_ENGINE",
    "totalRows": $TOTAL_ROWS,
    "batchSize": $BATCH_SIZE,
    "durationSeconds": $DURATION
  },
  "metrics": {
    "seedRowsPerSecond": $seed_rps,
    "replicateRowsPerSecond": $replicate_rps,
    "replicateDurationMs": $replicate_ms,
    "correctnessPercent": $correctness_pct,
    "avgLatencyMs": $latency_ms,
    "sourceRowCount": $src_count,
    "targetRowCount": $tgt_count,
    "matchedRowCount": $match_count
  },
  "status": "completed"
}
JSON

  log "Results written to $RESULTS_FILE"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  log "============================================"
  log "Pulsyn Replication Race — Competition Run"
  log "============================================"
  log "Run ID:       $RUN_ID"
  log "Competitor:   $COMPETITOR_ID"
  log "Source:       $SRC_HOST:$SRC_PORT/$SRC_DB"
  log "Target:       $TGT_HOST:$TGT_PORT/$TGT_DB ($TGT_ENGINE)"
  log "Total Rows:   $TOTAL_ROWS"
  log "Batch Size:   $BATCH_SIZE"
  log "Duration:     ${DURATION}s"
  log "============================================"

  wait_for_db "$SRC_HOST" "$SRC_PORT" "$SRC_USER" "$SRC_PASS" "Source DB"
  wait_for_db "$TGT_HOST" "$TGT_PORT" "$TGT_USER" "$TGT_PASS" "Target DB"

  setup_source
  setup_target
  seed_source
  measure_latency
  replicate_data
  verify_correctness
  write_results

  log "============================================"
  log "Competition run complete!"
  log "============================================"
}

main "$@"
