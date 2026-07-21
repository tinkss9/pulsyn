// Pulsyn Benchmark Runner
// Orchestrates benchmark execution and report generation

import {
  BenchmarkConfig,
  BenchmarkSuite,
  BenchmarkReport,
  BenchmarkTestResult,
  DEFAULT_SUITE,
  calculateScore,
} from './engine';

export interface BenchmarkRunOptions {
  suite?: BenchmarkSuite;
  config: BenchmarkConfig;
  onProgress?: (event: ProgressEvent) => void;
  onTestComplete?: (result: BenchmarkTestResult) => void;
}

export interface ProgressEvent {
  testId: string;
  testName: string;
  status: 'running' | 'completed' | 'failed';
  progress: number; // 0-100
  current?: number;
  total?: number;
}

export async function runBenchmark(options: BenchmarkRunOptions): Promise<BenchmarkReport> {
  const suite = options.suite || DEFAULT_SUITE;
  const startTime = Date.now();
  const results: BenchmarkTestResult[] = [];

  options.onProgress?.({
    testId: 'suite',
    testName: suite.name,
    status: 'running',
    progress: 0,
  });

  for (let i = 0; i < suite.tests.length; i++) {
    const test = suite.tests[i];
    const progress = Math.round(((i) / suite.tests.length) * 100);

    options.onProgress?.({
      testId: test.id,
      testName: test.name,
      status: 'running',
      progress,
      current: i,
      total: suite.tests.length,
    });

    try {
      const result = await test.run(options.config);
      results.push(result);
      options.onTestComplete?.(result);
    } catch (err) {
      const errorResult: BenchmarkTestResult = {
        testId: test.id,
        passed: false,
        metrics: {},
        errors: [err instanceof Error ? err.message : String(err)],
      };
      results.push(errorResult);
      options.onTestComplete?.(errorResult);
    }
  }

  const duration = Date.now() - startTime;
  const summary = calculateScore(results);

  options.onProgress?.({
    testId: 'suite',
    testName: suite.name,
    status: 'completed',
    progress: 100,
  });

  return {
    id: `bench-${Date.now()}`,
    connectorPair: {
      source: options.config.source.engine,
      target: options.config.target.engine,
    },
    timestamp: new Date(),
    config: options.config,
    results,
    summary,
    duration,
  };
}

// Generate a markdown report
export function generateReportMarkdown(report: BenchmarkReport): string {
  const lines: string[] = [];

  lines.push(`# Pulsyn Connector Benchmark Report`);
  lines.push('');
  lines.push(`**Report ID:** ${report.id}`);
  lines.push(`**Date:** ${report.timestamp.toISOString()}`);
  lines.push(`**Duration:** ${(report.duration / 1000).toFixed(1)}s`);
  lines.push('');
  lines.push(`## Connector Pair`);
  lines.push('');
  lines.push(`| Source | Target |`);
  lines.push(`|--------|--------|`);
  lines.push(`| ${report.connectorPair.source} | ${report.connectorPair.target} |`);
  lines.push('');
  lines.push(`## Summary`);
  lines.push('');
  lines.push(`| Metric | Score |`);
  lines.push(`|--------|-------|`);
  lines.push(`| **Overall** | ${report.summary.overallScore}/100 |`);
  lines.push(`| Throughput | ${report.summary.throughputScore}/100 |`);
  lines.push(`| Latency | ${report.summary.latencyScore}/100 |`);
  lines.push(`| Correctness | ${report.summary.correctnessScore}/100 |`);
  lines.push(`| **Certification** | **${report.summary.certification.toUpperCase()}** |`);
  lines.push('');
  lines.push(`## Test Results`);
  lines.push('');

  for (const result of report.results) {
    const status = result.passed ? '✅' : '❌';
    lines.push(`### ${status} ${result.testId}`);
    lines.push('');

    if (result.metrics.rowsPerSecond !== undefined) {
      lines.push(`- **Throughput:** ${result.metrics.rowsPerSecond.toLocaleString()} rows/sec`);
    }
    if (result.metrics.avgLatencyMs !== undefined) {
      lines.push(`- **Avg Latency:** ${result.metrics.avgLatencyMs.toFixed(1)}ms`);
    }
    if (result.metrics.p50LatencyMs !== undefined) {
      lines.push(`- **P50 Latency:** ${result.metrics.p50LatencyMs.toFixed(1)}ms`);
    }
    if (result.metrics.p95LatencyMs !== undefined) {
      lines.push(`- **P95 Latency:** ${result.metrics.p95LatencyMs.toFixed(1)}ms`);
    }
    if (result.metrics.p99LatencyMs !== undefined) {
      lines.push(`- **P99 Latency:** ${result.metrics.p99LatencyMs.toFixed(1)}ms`);
    }
    if (result.metrics.memoryMb !== undefined) {
      lines.push(`- **Memory:** ${result.metrics.memoryMb.toFixed(1)}MB`);
    }
    if (result.metrics.errorRate !== undefined) {
      lines.push(`- **Error Rate:** ${result.metrics.errorRate.toFixed(3)}%`);
    }
    if (result.metrics.totalRows !== undefined) {
      lines.push(`- **Total Rows:** ${result.metrics.totalRows.toLocaleString()}`);
    }
    if (result.details) {
      lines.push(`- **Details:** ${result.details}`);
    }
    if (result.errors && result.errors.length > 0) {
      lines.push(`- **Errors:**`);
      for (const err of result.errors) {
        lines.push(`  - ${err}`);
      }
    }
    lines.push('');
  }

  lines.push(`## Certification Levels`);
  lines.push('');
  lines.push(`| Level | Throughput | P99 Latency | Error Rate | Correctness |`);
  lines.push(`|-------|-----------|-------------|------------|-------------|`);
  lines.push(`| Platinum | ≥100K rows/s | ≤50ms | ≤0.001% | 100% |`);
  lines.push(`| Gold | ≥50K rows/s | ≤100ms | ≤0.01% | ≥99.99% |`);
  lines.push(`| Silver | ≥10K rows/s | ≤500ms | ≤0.1% | ≥99.9% |`);
  lines.push(`| Bronze | ≥1K rows/s | ≤2000ms | ≤1.0% | ≥99.0% |`);
  lines.push('');

  return lines.join('\n');
}

// Generate a JSON summary for API responses
export function generateReportSummary(report: BenchmarkReport): any {
  return {
    id: report.id,
    connectorPair: report.connectorPair,
    timestamp: report.timestamp.toISOString(),
    duration: report.duration,
    summary: report.summary,
    tests: report.results.map(r => ({
      id: r.testId,
      passed: r.passed,
      throughput: r.metrics.rowsPerSecond,
      p99Latency: r.metrics.p99LatencyMs,
      errorRate: r.metrics.errorRate,
    })),
  };
}
