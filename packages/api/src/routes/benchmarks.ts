// Pulsyn Benchmark Routes
// API endpoints for running and managing connector benchmarks

import { Router, Request, Response } from 'express';
import {
  DEFAULT_SUITE,
  runBenchmark,
  generateReportSummary,
  generateReportMarkdown,
  CERTIFICATION_THRESHOLDS,
} from '@pulsyn/core';

export const benchmarkRoutes = Router();

// In-memory report store (would be database in production)
const reports: Map<string, any> = new Map();

// List available benchmark suites
benchmarkRoutes.get('/suites', (req: Request, res: Response) => {
  res.json({
    data: [
      {
        id: DEFAULT_SUITE.id,
        name: DEFAULT_SUITE.name,
        description: DEFAULT_SUITE.description,
        tests: DEFAULT_SUITE.tests.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          description: t.description,
        })),
      },
    ],
  });
});

// Run a benchmark
benchmarkRoutes.post('/run', async (req: Request, res: Response) => {
  const { source, target, test } = req.body;

  if (!source || !target) {
    return res.status(400).json({ error: 'Missing source or target configuration' });
  }

  try {
    const report = await runBenchmark({
      config: {
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
      },
    });

    // Store report
    reports.set(report.id, report);

    res.json({
      data: generateReportSummary(report),
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Benchmark failed',
    });
  }
});

// Get a benchmark report
benchmarkRoutes.get('/reports/:id', (req: Request, res: Response) => {
  const report = reports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  const format = req.query.format as string;

  if (format === 'markdown') {
    res.setHeader('Content-Type', 'text/markdown');
    return res.send(generateReportMarkdown(report));
  }

  res.json({ data: generateReportSummary(report) });
});

// List benchmark reports
benchmarkRoutes.get('/reports', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const allReports = Array.from(reports.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(r => generateReportSummary(r));

  res.json({ data: allReports, total: allReports.length });
});

// Get certification requirements
benchmarkRoutes.get('/certification', (req: Request, res: Response) => {
  res.json({
    data: Object.entries(CERTIFICATION_THRESHOLDS).map(([level, thresholds]) => ({
      level,
      requirements: {
        minThroughput: thresholds.minThroughput,
        maxP99Latency: thresholds.maxP99Latency,
        maxErrorRate: thresholds.maxErrorRate,
        minCorrectness: thresholds.minCorrectness,
      },
    })),
  });
});

// Compare two benchmark reports
benchmarkRoutes.get('/compare', (req: Request, res: Response) => {
  const { report1, report2 } = req.query;

  const r1 = reports.get(report1 as string);
  const r2 = reports.get(report2 as string);

  if (!r1 || !r2) {
    return res.status(404).json({ error: 'One or both reports not found' });
  }

  const s1 = generateReportSummary(r1);
  const s2 = generateReportSummary(r2);

  res.json({
    data: {
      report1: s1,
      report2: s2,
      comparison: {
        throughputDiff: (s2.tests.find((t: any) => t.id === 'throughput-bulk')?.throughput || 0) -
                        (s1.tests.find((t: any) => t.id === 'throughput-bulk')?.throughput || 0),
        latencyDiff: (s2.tests.find((t: any) => t.id === 'latency-single')?.p99Latency || 0) -
                     (s1.tests.find((t: any) => t.id === 'latency-single')?.p99Latency || 0),
        certificationChange: `${s1.summary.certification} → ${s2.summary.certification}`,
      },
    },
  });
});
