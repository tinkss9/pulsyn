/**
 * PostgreSQL Real Benchmark Runner
 * Runs runRealBenchmark against localhost:5432 and saves results to results/postgresql-benchmark.json
 */

import { quickBenchmark } from './real-runner';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PG_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  user: 'test',
  password: 'test',
};

async function main() {
  console.log('=== Pulsyn PostgreSQL Real Benchmark ===');
  console.log(`Target: ${PG_CONFIG.host}:${PG_CONFIG.port}/${PG_CONFIG.database}`);
  console.log('Starting benchmark...\n');

  const report = await quickBenchmark(PG_CONFIG, {
    bulkRowCount: 50_000,
    bulkBatchSize: 1_000,
    streamingRowCount: 2_000,
    latencyIterations: 500,
    checkpointRowCount: 5_000,
    cleanup: true,
  });

  // Print results
  console.log('\n=== Results ===');
  console.log(`Overall Score: ${report.summary.overallScore}/100`);
  console.log(`Certification: ${report.summary.certification}`);
  console.log(`Throughput Score: ${report.summary.throughputScore}/100`);
  console.log(`Latency Score: ${report.summary.latencyScore}/100`);
  console.log(`Correctness Score: ${report.summary.correctnessScore}/100`);
  console.log(`Duration: ${report.duration}ms\n`);

  for (const result of report.results) {
    console.log(`--- ${result.testId} ---`);
    console.log(`  Passed: ${result.passed}`);
    if (result.metrics.rowsPerSecond !== undefined) {
      console.log(`  Throughput: ${result.metrics.rowsPerSecond.toLocaleString()} rows/sec`);
    }
    if (result.metrics.p50LatencyMs !== undefined) {
      console.log(`  Latency p50: ${result.metrics.p50LatencyMs}ms`);
    }
    if (result.metrics.p95LatencyMs !== undefined) {
      console.log(`  Latency p95: ${result.metrics.p95LatencyMs}ms`);
    }
    if (result.metrics.p99LatencyMs !== undefined) {
      console.log(`  Latency p99: ${result.metrics.p99LatencyMs}ms`);
    }
    if (result.details) {
      console.log(`  Details: ${result.details}`);
    }
    console.log();
  }

  // Save results
  const resultsDir = join(__dirname, 'results');
  mkdirSync(resultsDir, { recursive: true });
  const outputPath = join(resultsDir, 'postgresql-benchmark.json');
  writeFileSync(outputPath, JSON.stringify(report, null, 2));
  console.log(`Results saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
