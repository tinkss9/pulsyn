// Pulsyn Replication Race — Competition Scoring Engine
// Weights: Throughput 40%, Latency 30%, Correctness 30%

export interface CompetitionMetrics {
  /** Rows replicated per second (source → target) */
  replicateRowsPerSecond: number;
  /** Single-row round-trip latency in milliseconds */
  avgLatencyMs: number;
  /** Percentage of rows that match between source and target (0-100) */
  correctnessPercent: number;
  /** Total rows replicated */
  totalRows?: number;
  /** Replication duration in ms */
  replicateDurationMs?: number;
  /** Source row count */
  sourceRowCount?: number;
  /** Target row count */
  targetRowCount?: number;
  /** Matched row count */
  matchedRowCount?: number;
}

export interface CompetitionScore {
  /** Final composite score 0-100 */
  overallScore: number;
  /** Throughput sub-score 0-100 */
  throughputScore: number;
  /** Latency sub-score 0-100 */
  latencyScore: number;
  /** Correctness sub-score 0-100 */
  correctnessScore: number;
  /** Certification tier */
  tier: CompetitionTier;
  /** Weight breakdown for transparency */
  weights: { throughput: number; latency: number; correctness: number };
  /** Human-readable breakdown */
  breakdown: string;
}

export type CompetitionTier = 'platinum' | 'gold' | 'silver' | 'bronze' | 'participated';

export interface CompetitionTierThresholds {
  tier: CompetitionTier;
  minScore: number;
  label: string;
  color: string;
}

export const COMPETITION_TIERS: CompetitionTierThresholds[] = [
  { tier: 'platinum', minScore: 90, label: 'Platinum', color: '#E5E4E2' },
  { tier: 'gold', minScore: 75, label: 'Gold', color: '#FFD700' },
  { tier: 'silver', minScore: 60, label: 'Silver', color: '#C0C0C0' },
  { tier: 'bronze', minScore: 40, label: 'Bronze', color: '#CD7F32' },
  { tier: 'participated', minScore: 0, label: 'Participated', color: '#808080' },
];

// Scoring weights
const WEIGHTS = {
  throughput: 0.4,
  latency: 0.3,
  correctness: 0.3,
} as const;

// Normalization baselines (used to convert raw metrics to 0-100 scores)
const BASELINES = {
  /** Rows/sec that earns a perfect throughput score */
  maxThroughput: 500_000,
  /** Rows/sec that earns zero throughput score */
  minThroughput: 100,
  /** Latency (ms) that earns a perfect score */
  bestLatencyMs: 0.1,
  /** Latency (ms) that earns zero score */
  worstLatencyMs: 5000,
  /** Correctness % that earns a perfect score */
  perfectCorrectness: 100,
  /** Correctness % that earns zero score */
  worstCorrectness: 90,
} as const;

// ---------------------------------------------------------------------------
// Sub-score calculators
// ---------------------------------------------------------------------------

/**
 * Throughput score (0-100).
 * Logarithmic scale so that going from 1K→10K rows/s matters more than 100K→200K.
 */
export function scoreThroughput(rowsPerSecond: number): number {
  if (rowsPerSecond <= 0) return 0;
  if (rowsPerSecond >= BASELINES.maxThroughput) return 100;

  const minLog = Math.log10(BASELINES.minThroughput);
  const maxLog = Math.log10(BASELINES.maxThroughput);
  const currentLog = Math.log10(Math.max(rowsPerSecond, BASELINES.minThroughput));

  const raw = ((currentLog - minLog) / (maxLog - minLog)) * 100;
  return clamp(Math.round(raw * 100) / 100, 0, 100);
}

/**
 * Latency score (0-100).
 * Lower is better. Linear scale from bestLatencyMs (100) to worstLatencyMs (0).
 */
export function scoreLatency(avgLatencyMs: number): number {
  if (avgLatencyMs <= BASELINES.bestLatencyMs) return 100;
  if (avgLatencyMs >= BASELINES.worstLatencyMs) return 0;

  const raw =
    ((BASELINES.worstLatencyMs - avgLatencyMs) /
      (BASELINES.worstLatencyMs - BASELINES.bestLatencyMs)) *
    100;
  return clamp(Math.round(raw * 100) / 100, 0, 100);
}

/**
 * Correctness score (0-100).
 * Percentage of rows matching between source and target.
 * Scaled so that 100% = 100, 99% = 50, ≤90% = 0 (exponential penalty for data loss).
 */
export function scoreCorrectness(correctnessPercent: number): number {
  if (correctnessPercent >= BASELINES.perfectCorrectness) return 100;
  if (correctnessPercent <= BASELINES.worstCorrectness) return 0;

  // Exponential curve: small drops in correctness cause large score penalties
  const range = BASELINES.perfectCorrectness - BASELINES.worstCorrectness;
  const normalized = (correctnessPercent - BASELINES.worstCorrectness) / range;
  const curved = Math.pow(normalized, 2); // exponential penalty
  return clamp(Math.round(curved * 100 * 100) / 100, 0, 100);
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

/**
 * Calculate competition score from raw metrics.
 *
 * Weights: Throughput 40%, Latency 30%, Correctness 30%.
 */
export function calculateCompetitionScore(metrics: CompetitionMetrics): CompetitionScore {
  const throughputScore = scoreThroughput(metrics.replicateRowsPerSecond);
  const latencyScore = scoreLatency(metrics.avgLatencyMs);
  const correctnessScore = scoreCorrectness(metrics.correctnessPercent);

  const overallScore =
    Math.round(
      (throughputScore * WEIGHTS.throughput +
        latencyScore * WEIGHTS.latency +
        correctnessScore * WEIGHTS.correctness) *
        100,
    ) / 100;

  const tier = determineTier(overallScore);

  return {
    overallScore: clamp(overallScore, 0, 100),
    throughputScore,
    latencyScore,
    correctnessScore,
    tier,
    weights: { ...WEIGHTS },
    breakdown: [
      `Throughput: ${throughputScore}/100 × ${WEIGHTS.throughput * 100}% = ${Math.round(throughputScore * WEIGHTS.throughput * 100) / 100}`,
      `Latency:    ${latencyScore}/100 × ${WEIGHTS.latency * 100}% = ${Math.round(latencyScore * WEIGHTS.latency * 100) / 100}`,
      `Correctness: ${correctnessScore}/100 × ${WEIGHTS.correctness * 100}% = ${Math.round(correctnessScore * WEIGHTS.correctness * 100) / 100}`,
      `Overall:     ${overallScore}/100 → ${tier.toUpperCase()}`,
    ].join('\n'),
  };
}

// ---------------------------------------------------------------------------
// Leaderboard ranking
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  competitorId: string;
  score: CompetitionScore;
  metrics: CompetitionMetrics;
  timestamp: string;
  rank?: number;
}

/**
 * Rank a list of competitors by overall score (descending).
 * Ties broken by: throughput (desc), then correctness (desc), then latency (asc).
 */
export function rankLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.score.overallScore !== a.score.overallScore) {
      return b.score.overallScore - a.score.overallScore;
    }
    if (b.metrics.replicateRowsPerSecond !== a.metrics.replicateRowsPerSecond) {
      return b.metrics.replicateRowsPerSecond - a.metrics.replicateRowsPerSecond;
    }
    if (b.metrics.correctnessPercent !== a.metrics.correctnessPercent) {
      return b.metrics.correctnessPercent - a.metrics.correctnessPercent;
    }
    return a.metrics.avgLatencyMs - b.metrics.avgLatencyMs;
  });

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function determineTier(score: number): CompetitionTier {
  for (const threshold of COMPETITION_TIERS) {
    if (score >= threshold.minScore) {
      return threshold.tier;
    }
  }
  return 'participated';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
