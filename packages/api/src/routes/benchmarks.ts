// Pulsyn Benchmark Routes
// API endpoints for running and managing connector benchmarks

import { Router, Request, Response } from 'express';

export const benchmarkRoutes = Router();

// In-memory report store (would be database in production)
const reports: Map<string, any> = new Map();

// Benchmark types (inline to avoid @pulsyn/core dependency)
interface BenchmarkConfig {
  source: { engine: string; host: string; port: number; database: string; user: string; password: string };
  target: { engine: string; host: string; port: number; database: string; user: string; password: string };
  test: { durationSeconds: number; batchSize: number; concurrency: number; totalRows: number; tablePrefix: string };
}

interface BenchmarkTestResult {
  testId: string;
  passed: boolean;
  metrics: Record<string, number>;
  details?: string;
}

interface BenchmarkReport {
  id: string;
  connectorPair: { source: string; target: string };
  timestamp: Date;
  config: BenchmarkConfig;
  results: BenchmarkTestResult[];
  summary: {
    overallScore: number;
    throughputScore: number;
    latencyScore: number;
    correctnessScore: number;
    certification: string;
  };
  duration: number;
}

// Default benchmark suite
const DEFAULT_SUITE = {
  id: 'standard-v1',
  name: 'Standard Connector Benchmark v1',
  tests: [
    { id: 'throughput-bulk', name: 'Bulk Throughput', type: 'throughput' },
    { id: 'latency-single', name: 'Single Row Latency', type: 'latency' },
    { id: 'correctness-ordering', name: 'Event Ordering', type: 'correctness' },
    { id: 'recovery-checkpoint', name: 'Checkpoint Recovery', type: 'recovery' },
  ],
};

// Certification thresholds
const CERTIFICATION_THRESHOLDS: Record<string, { minThroughput: number; maxP99Latency: number; maxErrorRate: number }> = {
  platinum: { minThroughput: 100_000, maxP99Latency: 10, maxErrorRate: 0.001 },
  gold: { minThroughput: 50_000, maxP99Latency: 50, maxErrorRate: 0.01 },
  silver: { minThroughput: 10_000, maxP99Latency: 200, maxErrorRate: 0.05 },
  bronze: { minThroughput: 1_000, maxP99Latency: 1000, maxErrorRate: 0.1 },
};

// Simulate a benchmark run
async function runBenchmark(config: BenchmarkConfig): Promise<BenchmarkReport> {
  const startTime = Date.now();
  const results: BenchmarkTestResult[] = [];

  // Simulate each test
  for (const test of DEFAULT_SUITE.tests) {
    const testStart = Date.now();
    const rowsPerSecond = Math.floor(Math.random() * 50000) + 5000;
    const avgLatency = Math.floor(Math.random() * 100) + 5;
    const p99Latency = avgLatency * 3;
    const errorRate = Math.random() * 0.05;

    results.push({
      testId: test.id,
      passed: errorRate < 0.1,
      metrics: {
        rowsPerSecond,
        avgLatencyMs: avgLatency,
        p99LatencyMs: p99Latency,
        errorRate,
        durationMs: Date.now() - testStart,
      },
    });
  }

  // Calculate score
  const throughput = results.find(r => r.testId === 'throughput-bulk');
  const latency = results.find(r => r.testId === 'latency-single');
  const throughputScore = Math.min(100, ((throughput?.metrics.rowsPerSecond || 0) / 100_000) * 100);
  const latencyScore = Math.max(0, 100 - ((latency?.metrics.p99LatencyMs || 0) / 10) * 10);
  const overallScore = (throughputScore + latencyScore) / 2;

  // Determine certification
  let certification = 'uncertified';
  const rps = throughput?.metrics.rowsPerSecond || 0;
  const p99 = latency?.metrics.p99LatencyMs || Infinity;
  const errRate = Math.max(...results.map(r => r.metrics.errorRate || 0));

  for (const [level, thresholds] of Object.entries(CERTIFICATION_THRESHOLDS)) {
    if (rps >= thresholds.minThroughput && p99 <= thresholds.maxP99Latency && errRate <= thresholds.maxErrorRate) {
      certification = level;
      break;
    }
  }

  return {
    id: `report-${Date.now()}`,
    connectorPair: { source: config.source.engine, target: config.target.engine },
    timestamp: new Date(),
    config,
    results,
    summary: {
      overallScore: Math.round(overallScore),
      throughputScore: Math.round(throughputScore),
      latencyScore: Math.round(latencyScore),
      correctnessScore: 100,
      certification,
    },
    duration: Date.now() - startTime,
  };
}

// List benchmark suites
benchmarkRoutes.get('/suites', (req: Request, res: Response) => {
  res.json({
    data: [{
      id: DEFAULT_SUITE.id,
      name: DEFAULT_SUITE.name,
      tests: DEFAULT_SUITE.tests.length,
    }],
  });
});

// Run benchmark
benchmarkRoutes.post('/run', async (req: Request, res: Response) => {
  const { source, target, test } = req.body;

  if (!source || !target) {
    return res.status(400).json({ error: 'Missing source or target configuration' });
  }

  try {
    const report = await runBenchmark({
      source: {
        engine: source.engine || 'postgresql',
        host: source.host || 'localhost',
        port: source.port || 5432,
        database: source.database || 'test',
        user: source.user || 'postgres',
        password: source.password || '',
      },
      target: {
        engine: target.engine || 'postgresql',
        host: target.host || 'localhost',
        port: target.port || 5432,
        database: target.database || 'test',
        user: target.user || 'postgres',
        password: target.password || '',
      },
      test: {
        durationSeconds: test?.durationSeconds || 10,
        batchSize: test?.batchSize || 10000,
        concurrency: test?.concurrency || 1,
        totalRows: test?.totalRows || 100000,
        tablePrefix: test?.tablePrefix || 'bench_',
      },
    });

    reports.set(report.id, report);

    res.json({ data: report });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Benchmark failed',
    });
  }
});

// Get benchmark report
benchmarkRoutes.get('/reports/:id', (req: Request, res: Response) => {
  const report = reports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  if (req.query.format === 'markdown') {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(`# Benchmark Report: ${report.id}

**Suite:** ${DEFAULT_SUITE.name}
**Date:** ${report.timestamp}
**Duration:** ${report.duration}ms

## Summary
- Overall Score: ${report.summary.overallScore}/100
- Certification: ${report.summary.certification}
- Throughput: ${report.summary.throughputScore}/100
- Latency: ${report.summary.latencyScore}/100

## Results
${report.results.map((r: any) => `
### ${r.testId}
- Passed: ${r.passed ? 'Yes' : 'No'}
- Rows/sec: ${r.metrics.rowsPerSecond?.toLocaleString() || 'N/A'}
- P99 Latency: ${r.metrics.p99LatencyMs || 'N/A'}ms
- Error Rate: ${((r.metrics.errorRate || 0) * 100).toFixed(3)}%
`).join('\n')}
`);
  }

  res.json({ data: report });
});

// List all reports
benchmarkRoutes.get('/reports', (req: Request, res: Response) => {
  const list = Array.from(reports.values());
  res.json({ data: list, total: list.length });
});

// Get certification thresholds
benchmarkRoutes.get('/certification', (req: Request, res: Response) => {
  res.json({ data: CERTIFICATION_THRESHOLDS });
});

// Compare two reports
benchmarkRoutes.get('/compare', (req: Request, res: Response) => {
  const { report1, report2 } = req.query;

  if (!report1 || !report2) {
    return res.status(400).json({ error: 'Missing report1 or report2 query parameters' });
  }

  const r1 = reports.get(report1 as string);
  const r2 = reports.get(report2 as string);

  if (!r1 || !r2) {
    return res.status(404).json({ error: 'One or both reports not found' });
  }

  res.json({
    data: {
      report1: { id: r1.id, summary: r1.summary },
      report2: { id: r2.id, summary: r2.summary },
      delta: {
        overallScore: r2.summary.overallScore - r1.summary.overallScore,
        throughputScore: r2.summary.throughputScore - r1.summary.throughputScore,
        latencyScore: r2.summary.latencyScore - r1.summary.latencyScore,
      },
    },
  });
});
