// Pulsyn Benchmark Engine
// Standardized performance and correctness testing for connector pairs

import { BenchmarkResult } from '../types';

export interface BenchmarkConfig {
  source: {
    engine: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  target: {
    engine: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  test: {
    durationSeconds: number;
    batchSize: number;
    concurrency: number;
    totalRows: number;
    tablePrefix: string;
  };
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  tests: BenchmarkTest[];
}

export interface BenchmarkTest {
  id: string;
  name: string;
  type: 'throughput' | 'latency' | 'correctness' | 'recovery' | 'memory';
  description: string;
  run: (config: BenchmarkConfig) => Promise<BenchmarkTestResult>;
}

export interface BenchmarkTestResult {
  testId: string;
  passed: boolean;
  metrics: {
    rowsPerSecond?: number;
    avgLatencyMs?: number;
    p50LatencyMs?: number;
    p95LatencyMs?: number;
    p99LatencyMs?: number;
    memoryMb?: number;
    cpuPercent?: number;
    errorRate?: number;
    totalRows?: number;
    durationMs?: number;
  };
  details?: string;
  errors?: string[];
}

export interface BenchmarkReport {
  id: string;
  connectorPair: {
    source: string;
    target: string;
  };
  timestamp: Date;
  config: BenchmarkConfig;
  results: BenchmarkTestResult[];
  summary: {
    overallScore: number; // 0-100
    throughputScore: number;
    latencyScore: number;
    correctnessScore: number;
    certification: CertificationLevel;
  };
  duration: number; // total ms
}

export type CertificationLevel = 'platinum' | 'gold' | 'silver' | 'bronze' | 'uncertified';

export const CERTIFICATION_THRESHOLDS: Record<CertificationLevel, {
  minThroughput: number; // rows/sec
  maxP99Latency: number; // ms
  maxErrorRate: number; // percentage
  minCorrectness: number; // percentage
}> = {
  platinum: {
    minThroughput: 100_000,
    maxP99Latency: 50,
    maxErrorRate: 0.001,
    minCorrectness: 100,
  },
  gold: {
    minThroughput: 50_000,
    maxP99Latency: 100,
    maxErrorRate: 0.01,
    minCorrectness: 99.99,
  },
  silver: {
    minThroughput: 10_000,
    maxP99Latency: 500,
    maxErrorRate: 0.1,
    minCorrectness: 99.9,
  },
  bronze: {
    minThroughput: 1_000,
    maxP99Latency: 2000,
    maxErrorRate: 1.0,
    minCorrectness: 99.0,
  },
  uncertified: {
    minThroughput: 0,
    maxP99Latency: Infinity,
    maxErrorRate: Infinity,
    minCorrectness: 0,
  },
};

// Default benchmark suite
export const DEFAULT_SUITE: BenchmarkSuite = {
  id: 'standard-v1',
  name: 'Standard Connector Benchmark v1',
  description: 'Comprehensive benchmark suite for connector pair certification',
  tests: [
    {
      id: 'throughput-bulk',
      name: 'Bulk Throughput',
      type: 'throughput',
      description: 'Measures rows/sec for bulk inserts (10K rows per batch)',
      run: async (config) => {
        const startTime = Date.now();
        const totalRows = config.test.totalRows || 100_000;
        const batchSize = config.test.batchSize || 10_000;
        const batches = Math.ceil(totalRows / batchSize);
        let rowsInserted = 0;
        const latencies: number[] = [];

        for (let i = 0; i < batches; i++) {
          const batchStart = Date.now();
          // Simulate batch insert
          await simulateBatchInsert(batchSize);
          const batchLatency = Date.now() - batchStart;
          latencies.push(batchLatency);
          rowsInserted += batchSize;
        }

        const durationMs = Date.now() - startTime;
        const rowsPerSecond = Math.round((rowsInserted / durationMs) * 1000);

        return {
          testId: 'throughput-bulk',
          passed: rowsPerSecond > 0,
          metrics: {
            rowsPerSecond,
            totalRows: rowsInserted,
            durationMs,
            avgLatencyMs: average(latencies),
            p50LatencyMs: percentile(latencies, 50),
            p95LatencyMs: percentile(latencies, 95),
            p99LatencyMs: percentile(latencies, 99),
          },
        };
      },
    },
    {
      id: 'throughput-streaming',
      name: 'Streaming Throughput',
      type: 'throughput',
      description: 'Measures rows/sec for row-by-row inserts (real-time CDC simulation)',
      run: async (config) => {
        const startTime = Date.now();
        const totalRows = Math.min(config.test.totalRows || 10_000, 10_000);
        const latencies: number[] = [];

        for (let i = 0; i < totalRows; i++) {
          const rowStart = Date.now();
          await simulateSingleInsert();
          latencies.push(Date.now() - rowStart);
        }

        const durationMs = Date.now() - startTime;
        const rowsPerSecond = Math.round((totalRows / durationMs) * 1000);

        return {
          testId: 'throughput-streaming',
          passed: rowsPerSecond > 0,
          metrics: {
            rowsPerSecond,
            totalRows,
            durationMs,
            avgLatencyMs: average(latencies),
            p50LatencyMs: percentile(latencies, 50),
            p95LatencyMs: percentile(latencies, 95),
            p99LatencyMs: percentile(latencies, 99),
          },
        };
      },
    },
    {
      id: 'latency-single',
      name: 'Single Row Latency',
      type: 'latency',
      description: 'Measures end-to-end latency for single row replication',
      run: async (config) => {
        const iterations = 100;
        const latencies: number[] = [];

        for (let i = 0; i < iterations; i++) {
          const start = Date.now();
          await simulateSingleInsert();
          await simulateReplication();
          latencies.push(Date.now() - start);
        }

        return {
          testId: 'latency-single',
          passed: percentile(latencies, 99) < 5000,
          metrics: {
            avgLatencyMs: average(latencies),
            p50LatencyMs: percentile(latencies, 50),
            p95LatencyMs: percentile(latencies, 95),
            p99LatencyMs: percentile(latencies, 99),
          },
        };
      },
    },
    {
      id: 'correctness-ordering',
      name: 'Event Ordering',
      type: 'correctness',
      description: 'Verifies that events arrive in the correct order',
      run: async () => {
        const totalEvents = 1000;
        let correctOrder = 0;

        for (let i = 0; i < totalEvents; i++) {
          // Simulate ordered event processing
          const expectedOrder = i;
          const actualOrder = await simulateOrderedEvent(i);
          if (actualOrder === expectedOrder) correctOrder++;
        }

        const correctness = (correctOrder / totalEvents) * 100;

        return {
          testId: 'correctness-ordering',
          passed: correctness >= 99.9,
          metrics: {
            totalRows: totalEvents,
            errorRate: 100 - correctness,
          },
          details: `${correctOrder}/${totalEvents} events in correct order (${correctness.toFixed(2)}%)`,
        };
      },
    },
    {
      id: 'correctness-data-integrity',
      name: 'Data Integrity',
      type: 'correctness',
      description: 'Verifies that replicated data matches source exactly',
      run: async () => {
        const totalRows = 1000;
        let correctRows = 0;

        for (let i = 0; i < totalRows; i++) {
          const sourceData = generateTestData(i);
          const replicatedData = await simulateReplicateAndRead(sourceData);
          if (JSON.stringify(sourceData) === JSON.stringify(replicatedData)) correctRows++;
        }

        const integrity = (correctRows / totalRows) * 100;

        return {
          testId: 'correctness-data-integrity',
          passed: integrity >= 99.99,
          metrics: {
            totalRows,
            errorRate: 100 - integrity,
          },
          details: `${correctRows}/${totalRows} rows match exactly (${integrity.toFixed(2)}%)`,
        };
      },
    },
    {
      id: 'recovery-checkpoint',
      name: 'Checkpoint Recovery',
      type: 'recovery',
      description: 'Verifies that replication resumes correctly after interruption',
      run: async () => {
        const totalRows = 5000;
        const checkpointAt = 2500;
        let recovered = false;

        // Simulate replication with interruption
        for (let i = 0; i < totalRows; i++) {
          if (i === checkpointAt) {
            // Simulate interruption and recovery
            await simulateCheckpoint();
            await simulateInterruption();
            recovered = await simulateRecovery();
          }
        }

        return {
          testId: 'recovery-checkpoint',
          passed: recovered,
          metrics: {
            totalRows,
          },
          details: recovered
            ? 'Replication resumed from checkpoint successfully'
            : 'Failed to recover from checkpoint',
        };
      },
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      type: 'memory',
      description: 'Measures memory consumption during sustained replication',
      run: async (config) => {
        const duration = Math.min(config.test.durationSeconds || 10, 30) * 1000;
        const samples: number[] = [];
        const startTime = Date.now();

        while (Date.now() - startTime < duration) {
          await simulateBatchInsert(1000);
          samples.push(process.memoryUsage().heapUsed / 1024 / 1024);
        }

        return {
          testId: 'memory-usage',
          passed: Math.max(...samples) < 1024, // Less than 1GB
          metrics: {
            memoryMb: Math.round(average(samples)),
            durationMs: duration,
          },
          details: `Avg: ${average(samples).toFixed(1)}MB, Peak: ${Math.max(...samples).toFixed(1)}MB`,
        };
      },
    },
  ],
};

// Simulation helpers (replace with real implementations in production)
async function simulateBatchInsert(size: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, size / 10000));
}

async function simulateSingleInsert(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 2));
}

async function simulateReplication(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
}

async function simulateOrderedEvent(index: number): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, Math.random()));
  return index;
}

async function simulateReplicateAndRead(data: any): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 3));
  return { ...data };
}

async function simulateCheckpoint(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 10));
}

async function simulateInterruption(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function simulateRecovery(): Promise<boolean> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return true;
}

function generateTestData(index: number): any {
  return {
    id: index,
    name: `user_${index}`,
    email: `user${index}@example.com`,
    created_at: new Date().toISOString(),
    amount: Math.round(Math.random() * 10000) / 100,
  };
}

// Statistics helpers
function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

// Scoring
export function calculateScore(results: BenchmarkTestResult[]): {
  overallScore: number;
  throughputScore: number;
  latencyScore: number;
  correctnessScore: number;
  certification: CertificationLevel;
} {
  const throughput = results.find(r => r.testId === 'throughput-bulk');
  const latency = results.find(r => r.testId === 'latency-single');
  const ordering = results.find(r => r.testId === 'correctness-ordering');
  const integrity = results.find(r => r.testId === 'correctness-data-integrity');

  const throughputScore = throughput?.metrics.rowsPerSecond
    ? Math.min(100, (throughput.metrics.rowsPerSecond / 100_000) * 100)
    : 0;

  const latencyScore = latency?.metrics.p99LatencyMs
    ? Math.max(0, 100 - (latency.metrics.p99LatencyMs / 50))
    : 0;

  const correctnessScore = ordering && integrity
    ? Math.min(
        100,
        ((100 - (ordering.metrics.errorRate || 0)) + (100 - (integrity.metrics.errorRate || 0))) / 2
      )
    : 0;

  const overallScore = Math.round(
    throughputScore * 0.4 + latencyScore * 0.3 + correctnessScore * 0.3
  );

  // Determine certification level
  let certification: CertificationLevel = 'uncertified';
  const rps = throughput?.metrics.rowsPerSecond || 0;
  const p99 = latency?.metrics.p99LatencyMs || Infinity;
  const errRate = Math.max(
    ordering?.metrics.errorRate || Infinity,
    integrity?.metrics.errorRate || Infinity
  );

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

// Run a full benchmark suite
export async function runBenchmark(options: { config: BenchmarkConfig; suite?: BenchmarkSuite }): Promise<BenchmarkReport> {
  const suite = options.suite || DEFAULT_SUITE;
  const results: BenchmarkTestResult[] = [];
  const startTime = Date.now();

  for (const test of suite.tests) {
    try {
      const result = await test.run(options.config);
      results.push(result);
    } catch (error) {
      results.push({
        testId: test.id,
        passed: false,
        metrics: {},
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const score = calculateScore(results);

  return {
    id: `report-${Date.now()}`,
    connectorPair: {
      source: options.config.source.engine,
      target: options.config.target.engine,
    },
    timestamp: new Date(),
    config: options.config,
    results,
    summary: {
      overallScore: score.overallScore,
      throughputScore: score.throughputScore,
      latencyScore: score.latencyScore,
      correctnessScore: score.correctnessScore,
      certification: score.certification,
    },
    duration: Date.now() - startTime,
  };
}
