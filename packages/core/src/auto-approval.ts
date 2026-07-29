/**
 * Auto-Approval Gate System
 *
 * Determines if a connector test result passes certification based on:
 * - Pass rate (% tests passed)
 * - Latency (p99 ms)
 * - Throughput (rows/sec)
 * - Error rate (%)
 *
 * Gates are tier-specific (Tier 2-3 highest quality, Tier 5 relaxed).
 */

export interface Metrics {
  test_pass_rate: number; // 0-100%
  latency_ms: {
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: {
    rows_per_second: number;
    bulk_insert_rows_per_second?: number;
    incremental_rows_per_second?: number;
  };
  quality: {
    test_pass_rate: number;
    total_tests: number;
    passed: number;
    failed: number;
    skipped: number;
    error_rate: number; // 0-100%
  };
  replication_lag_ms?: {
    cold_start: number;
    steady_state: number;
    peak: number;
  };
}

export interface ApprovalGate {
  pass_rate_min: number;
  latency_p99_max_ms: number;
  throughput_min_rows_sec: number;
  error_rate_max: number;
}

export interface ApprovalResult {
  approved: boolean;
  reason: string;
  failures: string[];
  score: number; // 0-100
}

const APPROVAL_GATES: Record<string, ApprovalGate> = {
  TIER_2_3: {
    pass_rate_min: 95,
    latency_p99_max_ms: 500,
    throughput_min_rows_sec: 5000,
    error_rate_max: 0.1,
  },
  TIER_4: {
    pass_rate_min: 90,
    latency_p99_max_ms: 1000,
    throughput_min_rows_sec: 1000,
    error_rate_max: 1.0,
  },
  TIER_5: {
    pass_rate_min: 80,
    latency_p99_max_ms: 2000,
    throughput_min_rows_sec: 500,
    error_rate_max: 5.0,
  },
};

/**
 * Auto-approve a connector based on metrics and tier.
 *
 * @param connector Connector name (e.g., 'postgresql')
 * @param metrics Test metrics
 * @param tier Tier (e.g., 'tier2', 'tier5')
 * @returns Approval decision with score and failures
 */
export function autoApproveConnector(
  connector: string,
  metrics: Metrics,
  tier: string
): ApprovalResult {
  const gateKey = `TIER_${tier.replace(/^\D+/, '').toUpperCase()}`;
  const gate = APPROVAL_GATES[gateKey];

  if (!gate) {
    return {
      approved: false,
      reason: `Unknown tier: ${tier}`,
      failures: [`Unknown tier: ${tier}`],
      score: 0,
    };
  }

  const failures: string[] = [];
  const scores: number[] = [];

  // ─── Check 1: Pass Rate ───────────────────────────────────────

  const passRatePercent = metrics.test_pass_rate;
  const passRateScore = Math.min(100, (passRatePercent / gate.pass_rate_min) * 100);
  scores.push(passRateScore);

  if (passRatePercent < gate.pass_rate_min) {
    failures.push(
      `Pass rate ${passRatePercent.toFixed(1)}% < ${gate.pass_rate_min}% (FAIL)`
    );
  } else if (passRatePercent < gate.pass_rate_min + 5) {
    failures.push(
      `Pass rate ${passRatePercent.toFixed(1)}% (warning: close to threshold)`
    );
  }

  // ─── Check 2: Latency (p99) ──────────────────────────────────

  const latencyP99 = metrics.latency_ms.p99;
  const latencyScore = Math.min(100, (gate.latency_p99_max_ms / latencyP99) * 100);
  scores.push(latencyScore);

  if (latencyP99 > gate.latency_p99_max_ms) {
    failures.push(
      `Latency p99 ${latencyP99}ms > ${gate.latency_p99_max_ms}ms (FAIL)`
    );
  } else if (latencyP99 > gate.latency_p99_max_ms * 0.8) {
    failures.push(
      `Latency p99 ${latencyP99}ms (warning: ${Math.round((latencyP99 / gate.latency_p99_max_ms) * 100)}% of limit)`
    );
  }

  // ─── Check 3: Throughput ─────────────────────────────────────

  const throughput = metrics.throughput.rows_per_second;
  const throughputScore = Math.min(100, (throughput / gate.throughput_min_rows_sec) * 100);
  scores.push(throughputScore);

  if (throughput < gate.throughput_min_rows_sec) {
    failures.push(
      `Throughput ${throughput} rows/sec < ${gate.throughput_min_rows_sec} (FAIL)`
    );
  } else if (throughput < gate.throughput_min_rows_sec * 1.2) {
    failures.push(
      `Throughput ${throughput} rows/sec (warning: only ${Math.round((throughput / gate.throughput_min_rows_sec) * 100)}% above minimum)`
    );
  }

  // ─── Check 4: Error Rate ─────────────────────────────────────

  const errorRate = metrics.quality.error_rate;
  const errorRateScore = Math.min(100, ((gate.error_rate_max - errorRate) / gate.error_rate_max) * 100);
  scores.push(Math.max(0, errorRateScore));

  if (errorRate > gate.error_rate_max) {
    failures.push(
      `Error rate ${errorRate.toFixed(2)}% > ${gate.error_rate_max}% (FAIL)`
    );
  } else if (errorRate > gate.error_rate_max * 0.5) {
    failures.push(
      `Error rate ${errorRate.toFixed(2)}% (warning: ${Math.round((errorRate / gate.error_rate_max) * 100)}% of limit)`
    );
  }

  // ─── Overall Score & Decision ────────────────────────────────

  const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0;

  const isFail = failures.some((f) => f.includes('FAIL'));
  const approved = !isFail;

  return {
    approved,
    reason: approved
      ? `All gates passed (score: ${Math.round(overallScore)}/100)`
      : `One or more gates failed (score: ${Math.round(overallScore)}/100)`,
    failures,
    score: Math.round(overallScore),
  };
}

/**
 * Batch approval for multiple connectors.
 *
 * @param connectorResults Map of connector name -> metrics
 * @param tier Tier for all connectors
 * @returns Array of approval results with summary
 */
export function batchApprove(
  connectorResults: Record<string, Metrics>,
  tier: string
): {
  results: Record<string, ApprovalResult>;
  summary: { approved: number; rejected: number; avg_score: number };
} {
  const results: Record<string, ApprovalResult> = {};
  const scores: number[] = [];

  Object.entries(connectorResults).forEach(([connector, metrics]) => {
    const result = autoApproveConnector(connector, metrics, tier);
    results[connector] = result;
    scores.push(result.score);
  });

  return {
    results,
    summary: {
      approved: Object.values(results).filter((r) => r.approved).length,
      rejected: Object.values(results).filter((r) => !r.approved).length,
      avg_score: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0,
    },
  };
}

/**
 * Generate a detailed approval report.
 */
export function generateApprovalReport(
  connector: string,
  metrics: Metrics,
  tier: string
): string {
  const result = autoApproveConnector(connector, metrics, tier);

  const report = `
╔════════════════════════════════════════════════════════════════╗
║ CONNECTOR APPROVAL REPORT                                       ║
╚════════════════════════════════════════════════════════════════╝

Connector: ${connector}
Tier: ${tier}
Status: ${result.approved ? '✅ CERTIFIED' : '❌ REJECTED'}
Score: ${result.score}/100

Metrics:
  • Pass Rate: ${metrics.test_pass_rate.toFixed(1)}%
  • Latency (p99): ${metrics.latency_ms.p99}ms
  • Throughput: ${metrics.throughput.rows_per_second} rows/sec
  • Error Rate: ${metrics.quality.error_rate.toFixed(2)}%

Gates:
${result.failures.map((f) => `  ${f.includes('FAIL') ? '❌' : '⚠️'} ${f}`).join('\n')}

Decision: ${result.reason}
════════════════════════════════════════════════════════════════
`;

  return report;
}

export default {
  autoApproveConnector,
  batchApprove,
  generateApprovalReport,
};
