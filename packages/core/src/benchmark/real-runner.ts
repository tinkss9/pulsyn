// Pulsyn Real Benchmark Runner
// Connects to actual PostgreSQL databases and measures real performance metrics.
// Unlike engine.ts which uses simulated delays, this runner executes real SQL
// against real databases to produce production-representative benchmarks.

import { Pool, PoolClient } from 'pg';
import { randomBytes } from 'crypto';
import {
  BenchmarkConfig,
  BenchmarkReport,
  BenchmarkTestResult,
  CertificationLevel,
  CERTIFICATION_THRESHOLDS,
} from './engine';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface RealBenchmarkConfig extends BenchmarkConfig {
  /** Number of rows for the bulk throughput test. Default: 50_000 */
  bulkRowCount?: number;
  /** Batch size for bulk inserts. Default: 1_000 */
  bulkBatchSize?: number;
  /** Number of single-row inserts for the streaming test. Default: 2_000 */
  streamingRowCount?: number;
  /** Number of single-row round-trips for the latency test. Default: 500 */
  latencyIterations?: number;
  /** Number of rows for the checkpoint recovery test. Default: 5_000 */
  checkpointRowCount?: number;
  /** Row at which to simulate interruption. Default: half of checkpointRowCount */
  checkpointAt?: number;
  /** If true, drop test tables after the run. Default: true */
  cleanup?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function generateRow(index: number): Record<string, unknown> {
  return {
    row_id: index,
    name: `user_${index}`,
    email: `user${index}@bench.pulsyn`,
    payload: randomBytes(64).toString('hex'),
    amount: Math.round(Math.random() * 100_000) / 100,
    created_at: new Date(),
  };
}

function poolConfig(cfg: { host: string; port: number; database: string; user: string; password: string }): {
  host: string; port: number; database: string; user: string; password: string;
  max: number; idleTimeoutMillis: number; connectionTimeoutMillis: number;
} {
  return { ...cfg, max: 20, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 10_000 };
}

// ---------------------------------------------------------------------------
// Table lifecycle
// ---------------------------------------------------------------------------

async function createTestTable(client: PoolClient, table: string): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "${table}" (
      row_id     INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL,
      payload    TEXT NOT NULL,
      amount     NUMERIC(12,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function dropTestTable(client: PoolClient, table: string): Promise<void> {
  await client.query(`DROP TABLE IF EXISTS "${table}"`);
}

async function countRows(client: PoolClient | Pool, table: string): Promise<number> {
  const res = await client.query(`SELECT count(*)::int AS cnt FROM "${table}"`);
  return (res.rows[0] as { cnt: number }).cnt;
}

// ---------------------------------------------------------------------------
// Individual benchmark tests
// ---------------------------------------------------------------------------

async function runBulkThroughput(
  srcPool: Pool,
  table: string,
  totalRows: number,
  batchSize: number,
): Promise<BenchmarkTestResult> {
  const batches = Math.ceil(totalRows / batchSize);
  const batchLatencies: number[] = [];
  let rowsInserted = 0;

  for (let b = 0; b < batches; b++) {
    const offset = b * batchSize;
    const size = Math.min(batchSize, totalRows - offset);

    const values: unknown[] = [];
    const placeholders: string[] = [];
    for (let i = 0; i < size; i++) {
      const row = generateRow(offset + i);
      const base = i * 6;
      placeholders.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6})`);
      values.push(row.row_id, row.name, row.email, row.payload, row.amount, row.created_at);
    }

    const t0 = performance.now();
    await srcPool.query(
      `INSERT INTO "${table}" (row_id, name, email, payload, amount, created_at) VALUES ${placeholders.join(',')}`,
      values,
    );
    batchLatencies.push(performance.now() - t0);
    rowsInserted += size;
  }

  const totalMs = batchLatencies.reduce((a, b) => a + b, 0);
  const sorted = [...batchLatencies].sort((a, b) => a - b);

  return {
    testId: 'real-throughput-bulk',
    passed: rowsInserted === totalRows,
    metrics: {
      rowsPerSecond: Math.round((rowsInserted / totalMs) * 1000),
      totalRows: rowsInserted,
      durationMs: Math.round(totalMs),
      avgLatencyMs: Math.round(average(batchLatencies) * 100) / 100,
      p50LatencyMs: Math.round(percentile(sorted, 50) * 100) / 100,
      p95LatencyMs: Math.round(percentile(sorted, 95) * 100) / 100,
      p99LatencyMs: Math.round(percentile(sorted, 99) * 100) / 100,
    },
    details: `${rowsInserted} rows in ${batches} batches of ${batchSize} — ${Math.round((rowsInserted / totalMs) * 1000).toLocaleString()} rows/sec`,
  };
}

async function runStreamingThroughput(
  srcPool: Pool,
  table: string,
  totalRows: number,
): Promise<BenchmarkTestResult> {
  const latencies: number[] = [];

  for (let i = 0; i < totalRows; i++) {
    const row = generateRow(i);
    const t0 = performance.now();
    await srcPool.query(
      `INSERT INTO "${table}" (row_id, name, email, payload, amount, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [row.row_id, row.name, row.email, row.payload, row.amount, row.created_at],
    );
    latencies.push(performance.now() - t0);
  }

  const totalMs = latencies.reduce((a, b) => a + b, 0);
  const sorted = [...latencies].sort((a, b) => a - b);

  return {
    testId: 'real-throughput-streaming',
    passed: true,
    metrics: {
      rowsPerSecond: Math.round((totalRows / totalMs) * 1000),
      totalRows,
      durationMs: Math.round(totalMs),
      avgLatencyMs: Math.round(average(latencies) * 100) / 100,
      p50LatencyMs: Math.round(percentile(sorted, 50) * 100) / 100,
      p95LatencyMs: Math.round(percentile(sorted, 95) * 100) / 100,
      p99LatencyMs: Math.round(percentile(sorted, 99) * 100) / 100,
    },
    details: `${totalRows} single-row inserts — ${Math.round((totalRows / totalMs) * 1000).toLocaleString()} rows/sec`,
  };
}

async function runSingleRowLatency(
  srcPool: Pool,
  table: string,
  iterations: number,
): Promise<BenchmarkTestResult> {
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const row = generateRow(100_000_000 + i); // offset to avoid PK conflicts
    const t0 = performance.now();
    await srcPool.query(
      `INSERT INTO "${table}" (row_id, name, email, payload, amount, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [row.row_id, row.name, row.email, row.payload, row.amount, row.created_at],
    );
    latencies.push(performance.now() - t0);
  }

  const sorted = [...latencies].sort((a, b) => a - b);

  return {
    testId: 'real-latency-single',
    passed: percentile(sorted, 99) < 5000,
    metrics: {
      avgLatencyMs: Math.round(average(latencies) * 100) / 100,
      p50LatencyMs: Math.round(percentile(sorted, 50) * 100) / 100,
      p95LatencyMs: Math.round(percentile(sorted, 95) * 100) / 100,
      p99LatencyMs: Math.round(percentile(sorted, 99) * 100) / 100,
      totalRows: iterations,
      durationMs: Math.round(latencies.reduce((a, b) => a + b, 0)),
    },
    details: `p50=${percentile(sorted, 50).toFixed(2)}ms  p95=${percentile(sorted, 95).toFixed(2)}ms  p99=${percentile(sorted, 99).toFixed(2)}ms`,
  };
}

async function runCheckpointRecovery(
  srcPool: Pool,
  connCfg: { host: string; port: number; database: string; user: string; password: string },
  table: string,
  totalRows: number,
  checkpointAt: number,
): Promise<BenchmarkTestResult> {
  // Phase 1: Insert rows up to the checkpoint
  for (let i = 0; i < checkpointAt; i++) {
    const row = generateRow(200_000_000 + i);
    await srcPool.query(
      `INSERT INTO "${table}" (row_id, name, email, payload, amount, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [row.row_id, row.name, row.email, row.payload, row.amount, row.created_at],
    );
  }

  // Phase 2: Record the "checkpoint" — current max row_id
  const cpRes = await srcPool.query(`SELECT max(row_id)::int AS cp FROM "${table}"`);
  const checkpointRowId = (cpRes.rows[0] as { cp: number }).cp;

  // Phase 3: Simulate interruption — close the pool and open a fresh one
  await srcPool.end();
  const freshPool = new Pool(poolConfig(connCfg));

  // Phase 4: Resume from checkpoint — insert remaining rows
  const resumeStart = performance.now();
  for (let i = checkpointAt; i < totalRows; i++) {
    const row = generateRow(200_000_000 + i);
    await freshPool.query(
      `INSERT INTO "${table}" (row_id, name, email, payload, amount, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
      [row.row_id, row.name, row.email, row.payload, row.amount, row.created_at],
    );
  }
  const resumeMs = performance.now() - resumeStart;

  // Verify row count
  const finalCount = await countRows(freshPool, table);
  await freshPool.end();

  const recovered = finalCount === totalRows;

  return {
    testId: 'real-recovery-checkpoint',
    passed: recovered,
    metrics: {
      totalRows: finalCount,
      durationMs: Math.round(resumeMs),
    },
    details: recovered
      ? `Resumed from checkpoint (row ${checkpointRowId}). Total rows: ${finalCount}. Resume took ${Math.round(resumeMs)}ms.`
      : `Expected ${totalRows} rows but found ${finalCount} after recovery.`,
  };
}

async function runDataIntegrity(
  srcPool: Pool,
  table: string,
): Promise<BenchmarkTestResult> {
  // Read back a sample of rows and verify structure
  const res = await srcPool.query(`SELECT row_id, name, email, payload, amount, created_at FROM "${table}" LIMIT 1000`);
  let intact = 0;
  let corrupted = 0;

  for (const row of res.rows as Record<string, unknown>[]) {
    if (
      typeof row.row_id === 'number' &&
      typeof row.name === 'string' &&
      typeof row.email === 'string' &&
      typeof row.payload === 'string' &&
      row.payload.length > 0 &&
      row.created_at instanceof Date
    ) {
      intact++;
    } else {
      corrupted++;
    }
  }

  const total = intact + corrupted;
  const integrity = total > 0 ? (intact / total) * 100 : 0;

  return {
    testId: 'real-correctness-integrity',
    passed: integrity >= 99.9,
    metrics: {
      totalRows: total,
      errorRate: Math.round((100 - integrity) * 1000) / 1000,
    },
    details: `${intact}/${total} rows structurally valid (${integrity.toFixed(2)}%)`,
  };
}

// ---------------------------------------------------------------------------
// Scoring (re-export with the same thresholds)
// ---------------------------------------------------------------------------

function calculateRealScore(results: BenchmarkTestResult[]): {
  overallScore: number;
  throughputScore: number;
  latencyScore: number;
  correctnessScore: number;
  certification: CertificationLevel;
} {
  const throughput = results.find(r => r.testId === 'real-throughput-bulk');
  const latency = results.find(r => r.testId === 'real-latency-single');
  const integrity = results.find(r => r.testId === 'real-correctness-integrity');

  const throughputScore = throughput?.metrics.rowsPerSecond
    ? Math.min(100, (throughput.metrics.rowsPerSecond / 100_000) * 100)
    : 0;

  const latencyScore = latency?.metrics.p99LatencyMs
    ? Math.max(0, 100 - (latency.metrics.p99LatencyMs / 50))
    : 0;

  const correctnessScore = integrity
    ? Math.min(100, 100 - (integrity.metrics.errorRate || 0))
    : 0;

  const overallScore = Math.round(
    throughputScore * 0.4 + latencyScore * 0.3 + correctnessScore * 0.3,
  );

  let certification: CertificationLevel = 'uncertified';
  const rps = throughput?.metrics.rowsPerSecond || 0;
  const p99 = latency?.metrics.p99LatencyMs || Infinity;
  const errRate = integrity?.metrics.errorRate || Infinity;

  for (const [level, thresholds] of Object.entries(CERTIFICATION_THRESHOLDS)) {
    if (
      rps >= thresholds.minThroughput &&
      p99 <= thresholds.maxP99Latency &&
      errRate <= thresholds.maxErrorRate
    ) {
      certification = level as CertificationLevel;
      break;
    }
  }

  return {
    overallScore,
    throughputScore: Math.round(throughputScore),
    latencyScore: Math.round(latencyScore),
    correctnessScore: Math.round(correctnessScore),
    certification,
  };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export interface RealBenchmarkRunOptions {
  config: RealBenchmarkConfig;
  onProgress?: (event: { testId: string; testName: string; status: 'running' | 'completed' | 'failed'; progress: number }) => void;
}

/**
 * Run a real benchmark against a PostgreSQL database.
 *
 * Creates temporary test tables, inserts real rows, measures throughput and
 * latency, tests checkpoint recovery, then optionally cleans up.
 *
 * Uses only the `source` connection from the config. The `target` connection
 * is reserved for future source→target replication benchmarks.
 */
export async function runRealBenchmark(options: RealBenchmarkRunOptions): Promise<BenchmarkReport> {
  const cfg = options.config;
  const prefix = cfg.test.tablePrefix || 'pulsyn_bench';
  const bulkTable = `${prefix}_bulk`;
  const streamTable = `${prefix}_stream`;
  const latencyTable = `${prefix}_latency`;
  const checkpointTable = `${prefix}_checkpoint`;
  const integrityTable = `${prefix}_integrity`;

  const bulkRowCount = cfg.bulkRowCount ?? 50_000;
  const bulkBatchSize = cfg.bulkBatchSize ?? 1_000;
  const streamingRowCount = cfg.streamingRowCount ?? 2_000;
  const latencyIterations = cfg.latencyIterations ?? 500;
  const checkpointRowCount = cfg.checkpointRowCount ?? 5_000;
  const checkpointAt = cfg.checkpointAt ?? Math.floor(checkpointRowCount / 2);
  const doCleanup = cfg.cleanup !== false;

  const srcPool = new Pool(poolConfig(cfg.source));
  const results: BenchmarkTestResult[] = [];
  const wallStart = performance.now();
  const tables: string[] = [];

  try {
    // -- Setup --
    const setupClient = await srcPool.connect();
    try {
      for (const tbl of [bulkTable, streamTable, latencyTable, checkpointTable, integrityTable]) {
        await createTestTable(setupClient, tbl);
        tables.push(tbl);
      }
    } finally {
      setupClient.release();
    }

    // -- 1. Bulk Throughput --
    options.onProgress?.({ testId: 'real-throughput-bulk', testName: 'Bulk Throughput', status: 'running', progress: 0 });
    const bulkResult = await runBulkThroughput(srcPool, bulkTable, bulkRowCount, bulkBatchSize);
    results.push(bulkResult);
    options.onProgress?.({ testId: 'real-throughput-bulk', testName: 'Bulk Throughput', status: 'completed', progress: 100 });

    // -- 2. Streaming Throughput --
    options.onProgress?.({ testId: 'real-throughput-streaming', testName: 'Streaming Throughput', status: 'running', progress: 0 });
    const streamResult = await runStreamingThroughput(srcPool, streamTable, streamingRowCount);
    results.push(streamResult);
    options.onProgress?.({ testId: 'real-throughput-streaming', testName: 'Streaming Throughput', status: 'completed', progress: 100 });

    // -- 3. Single Row Latency --
    options.onProgress?.({ testId: 'real-latency-single', testName: 'Single Row Latency', status: 'running', progress: 0 });
    const latencyResult = await runSingleRowLatency(srcPool, latencyTable, latencyIterations);
    results.push(latencyResult);
    options.onProgress?.({ testId: 'real-latency-single', testName: 'Single Row Latency', status: 'completed', progress: 100 });

    // -- 4. Checkpoint Recovery --
    // Note: this test closes and re-creates the pool internally.
    options.onProgress?.({ testId: 'real-recovery-checkpoint', testName: 'Checkpoint Recovery', status: 'running', progress: 0 });
    const recoveryResult = await runCheckpointRecovery(srcPool, cfg.source, checkpointTable, checkpointRowCount, checkpointAt);
    results.push(recoveryResult);
    // After recovery test the original pool is closed; create a fresh one for cleanup.
    options.onProgress?.({ testId: 'real-recovery-checkpoint', testName: 'Checkpoint Recovery', status: 'completed', progress: 100 });

    // -- 5. Data Integrity (use a fresh pool since recovery closed the original) --
    options.onProgress?.({ testId: 'real-correctness-integrity', testName: 'Data Integrity', status: 'running', progress: 0 });
    const integrityPool = new Pool(poolConfig(cfg.source));
    const integrityResult = await runDataIntegrity(integrityPool, bulkTable);
    results.push(integrityResult);
    await integrityPool.end();
    options.onProgress?.({ testId: 'real-correctness-integrity', testName: 'Data Integrity', status: 'completed', progress: 100 });
  } finally {
    // -- Cleanup --
    if (doCleanup) {
      try {
        const cleanupPool = new Pool(poolConfig(cfg.source));
        const cleanupClient = await cleanupPool.connect();
        try {
          for (const tbl of tables) {
            await dropTestTable(cleanupClient, tbl);
          }
        } finally {
          cleanupClient.release();
          await cleanupPool.end();
        }
      } catch {
        // Best-effort cleanup — don't mask the real result
      }
    } else {
      // Only end if we didn't already end it in recovery
      try { await srcPool.end(); } catch { /* already ended */ }
    }
  }

  const duration = Math.round(performance.now() - wallStart);
  const score = calculateRealScore(results);

  return {
    id: `real-bench-${Date.now()}`,
    connectorPair: {
      source: cfg.source.engine,
      target: cfg.target.engine,
    },
    timestamp: new Date(),
    config: cfg,
    results,
    summary: {
      overallScore: score.overallScore,
      throughputScore: score.throughputScore,
      latencyScore: score.latencyScore,
      correctnessScore: score.correctnessScore,
      certification: score.certification,
    },
    duration,
  };
}

/**
 * Quick one-liner for CLI / scripts.
 *
 * @example
 * ```ts
 * import { quickBenchmark } from '@pulsyn/core/benchmark/real-runner';
 *
 * const report = await quickBenchmark({
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'pulsyn_bench',
 *   user: 'postgres',
 *   password: 'secret',
 * });
 *
 * console.log(`Score: ${report.summary.overallScore}/100 (${report.summary.certification})`);
 * ```
 */
export async function quickBenchmark(
  pgConfig: { host: string; port: number; database: string; user: string; password: string },
  overrides?: Partial<RealBenchmarkConfig>,
): Promise<BenchmarkReport> {
  return runRealBenchmark({
    config: {
      source: { engine: 'postgresql', ...pgConfig },
      target: { engine: 'postgresql', ...pgConfig },
      test: {
        durationSeconds: 60,
        batchSize: 1_000,
        concurrency: 1,
        totalRows: 50_000,
        tablePrefix: 'pulsyn_bench',
      },
      ...overrides,
    },
  });
}
