// Self-Learning Engine — Tracks snapshots, detects trends, learns patterns
// Pure TypeScript, no external ML libs. Uses Supabase via query().

import { query } from '@/lib/db';

export interface LearningSnapshot {
  id?: string;
  orgId: string;
  resourceType: string;
  resourceId: string;
  metrics: Record<string, number>;
  recordedAt?: string;
}

export interface LearnedPattern {
  id?: string;
  orgId: string;
  patternType: string;
  patternData: Record<string, unknown>;
  confidence: number;
  lastSeen?: string;
  createdAt?: string;
}

export interface TrendResult {
  metric: string;
  direction: 'increasing' | 'stable' | 'decreasing';
  slope: number;
  avgValue: number;
  sampleCount: number;
}

export interface AnomalyBaseline {
  metricName: string;
  mean: number;
  stddev: number;
  sampleCount: number;
  updatedAt?: string;
}

export class LearningEngine {
  // ── Snapshot persistence ──────────────────────────────────────────────

  async recordSnapshot(data: {
    orgId: string;
    resourceType: string;
    resourceId: string;
    metrics: Record<string, number>;
  }): Promise<string> {
    const id = `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await query(
      `INSERT INTO ai_learning_snapshots (id, org_id, resource_type, resource_id, metrics, recorded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [id, data.orgId, data.resourceType, data.resourceId, data.metrics]
    );
    return id;
  }

  async getHistory(
    resourceType: string,
    resourceId: string,
    days: number = 30
  ): Promise<LearningSnapshot[]> {
    const result = await query(
      `SELECT id, org_id, resource_type, resource_id, metrics, recorded_at
       FROM ai_learning_snapshots
       WHERE resource_type = $1
         AND resource_id = $2
         AND recorded_at > NOW() - ($3 || ' days')::interval
       ORDER BY recorded_at ASC`,
      [resourceType, resourceId, String(days)]
    );
    return result.rows.map((r: any) => ({
      id: r.id,
      orgId: r.org_id,
      resourceType: r.resource_type,
      resourceId: r.resource_id,
      metrics: typeof r.metrics === 'string' ? JSON.parse(r.metrics) : r.metrics,
      recordedAt: r.recorded_at,
    }));
  }

  // ── Trend detection (linear regression slope) ─────────────────────────

  detectTrendsFromValues(
    metric: string,
    values: number[]
  ): TrendResult {
    if (values.length < 2) {
      return { metric, direction: 'stable', slope: 0, avgValue: values[0] ?? 0, sampleCount: values.length };
    }

    const n = values.length;
    const avgValue = values.reduce((s, v) => s + v, 0) / n;

    // Simple linear regression: slope = Σ(xi - x̄)(yi - ȳ) / Σ(xi - x̄)²
    const xMean = (n - 1) / 2;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      const dx = i - xMean;
      num += dx * (values[i] - avgValue);
      den += dx * dx;
    }
    const slope = den === 0 ? 0 : num / den;

    // Classify direction based on relative slope
    const range = Math.max(...values) - Math.min(...values);
    const threshold = range === 0 ? 0 : (range / n) * 0.1; // 10% of avg step
    const direction =
      Math.abs(slope) < threshold
        ? 'stable'
        : slope > 0
        ? 'increasing'
        : 'decreasing';

    return { metric, direction, slope, avgValue, sampleCount: n };
  }

  // ── Pattern learning ──────────────────────────────────────────────────

  async learnPatterns(
    history: LearningSnapshot[]
  ): Promise<LearnedPattern[]> {
    if (history.length < 3) return [];

    const patterns: LearnedPattern[] = [];
    const orgId = history[0].orgId;

    // Extract all metric keys across snapshots
    const metricKeys = new Set<string>();
    for (const snap of history) {
      for (const key of Object.keys(snap.metrics)) {
        metricKeys.add(key);
      }
    }

    for (const key of Array.from(metricKeys)) {
      const values = history
        .map((s) => s.metrics[key])
        .filter((v) => v !== undefined && v !== null && !isNaN(v));

      if (values.length < 3) continue;

      const trend = this.detectTrendsFromValues(key, values);
      const mean = trend.avgValue;
      const stddev = this.calcStddev(values, mean);

      // Detect cyclic pattern (if enough data points)
      const cyclicScore = values.length >= 14 ? this.detectCyclicScore(values) : 0;

      patterns.push({
        orgId,
        patternType: 'trend',
        patternData: {
          metric: key,
          direction: trend.direction,
          slope: trend.slope,
          mean,
          stddev,
          cyclicScore,
          sampleCount: values.length,
        },
        confidence: Math.min(0.99, 0.5 + values.length * 0.02),
      });
    }

    // Persist patterns
    for (const p of patterns) {
      await this.upsertPattern(p);
    }

    return patterns;
  }

  async getPatterns(orgId: string, patternType?: string): Promise<LearnedPattern[]> {
    const params: any[] = [orgId];
    let where = 'WHERE org_id = $1';
    if (patternType) {
      params.push(patternType);
      where += ` AND pattern_type = $${params.length}`;
    }

    const result = await query(
      `SELECT id, org_id, pattern_type, pattern_data, confidence, last_seen, created_at
       FROM ai_patterns
       ${where}
       ORDER BY confidence DESC`,
      params
    );

    return result.rows.map((r: any) => ({
      id: r.id,
      orgId: r.org_id,
      patternType: r.pattern_type,
      patternData: typeof r.pattern_data === 'string' ? JSON.parse(r.pattern_data) : r.pattern_data,
      confidence: parseFloat(r.confidence),
      lastSeen: r.last_seen,
      createdAt: r.created_at,
    }));
  }

  // ── Anomaly baseline management ───────────────────────────────────────

  async getAnomalyBaseline(metric: string): Promise<AnomalyBaseline | null> {
    const result = await query(
      `SELECT metric_name, mean, stddev, sample_count, updated_at
       FROM ai_anomaly_baselines
       WHERE metric_name = $1`,
      [metric]
    );
    if (result.rows.length === 0) return null;
    const r = result.rows[0];
    return {
      metricName: r.metric_name,
      mean: parseFloat(r.mean),
      stddev: parseFloat(r.stddev),
      sampleCount: parseInt(r.sample_count),
      updatedAt: r.updated_at,
    };
  }

  async updateAnomalyBaseline(
    metric: string,
    orgId: string,
    values: number[]
  ): Promise<AnomalyBaseline> {
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const stddev = this.calcStddev(values, mean);

    await query(
      `INSERT INTO ai_anomaly_baselines (id, org_id, metric_name, mean, stddev, sample_count, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (org_id, metric_name) DO UPDATE
       SET mean = EXCLUDED.mean, stddev = EXCLUDED.stddev, sample_count = EXCLUDED.sample_count, updated_at = NOW()`,
      [`bl-${orgId}-${metric}`, orgId, metric, mean, stddev, values.length]
    );

    return { metricName: metric, mean, stddev, sampleCount: values.length };
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private async upsertPattern(pattern: LearnedPattern): Promise<void> {
    const id = `pat-${pattern.orgId}-${pattern.patternType}-${Date.now()}`;
    await query(
      `INSERT INTO ai_patterns (id, org_id, pattern_type, pattern_data, confidence, last_seen, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [id, pattern.orgId, pattern.patternType, pattern.patternData, pattern.confidence]
    );
  }

  private calcStddev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    const variance =
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  private detectCyclicScore(values: number[]): number {
    // Simple autocorrelation at lag-7 (weekly) for daily data
    if (values.length < 14) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    let num = 0;
    let den = 0;
    for (let i = 7; i < values.length; i++) {
      num += (values[i] - mean) * (values[i - 7] - mean);
      den += (values[i] - mean) ** 2;
    }
    return den === 0 ? 0 : Math.abs(num / den);
  }
}

// Singleton
let _instance: LearningEngine | null = null;

export function getLearningEngine(): LearningEngine {
  if (!_instance) _instance = new LearningEngine();
  return _instance;
}
