// Anomaly Detector — Z-score based statistical anomaly detection
// Pure TypeScript, no external ML libs.

export interface BaselineState {
  mean: number;
  stddev: number;
  sampleCount: number;
  values: number[]; // rolling window for trend anomaly detection
}

export interface AnomalyResult {
  isAnomaly: boolean;
  metric: string;
  value: number;
  zScore: number;
  mean: number;
  stddev: number;
  severity: 'normal' | 'warning' | 'critical';
}

export interface TrendAnomaly {
  metric: string;
  recentDirection: 'increasing' | 'stable' | 'decreasing';
  historicalDirection: 'increasing' | 'stable' | 'decreasing';
  divergence: boolean;
  recentSlope: number;
  historicalSlope: number;
}

export interface AnomalyCluster {
  metric: string;
  count: number;
  timeWindow: string;
  avgZScore: number;
  values: number[];
  severity: 'warning' | 'critical';
}

const Z_THRESHOLD = 2.5;

export class AnomalyDetector {
  private baselines: Map<string, BaselineState> = new Map();

  // ── Baseline management ───────────────────────────────────────────────

  updateBaseline(metric: string, values: number[]): void {
    if (values.length < 2) return;

    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
    const stddev = Math.sqrt(variance);

    this.baselines.set(metric, {
      mean,
      stddev,
      sampleCount: values.length,
      values: [...values],
    });
  }

  getBaseline(metric: string): BaselineState | null {
    return this.baselines.get(metric) ?? null;
  }

  // ── Anomaly detection (z-score) ───────────────────────────────────────

  detectAnomaly(metric: string, value: number): AnomalyResult {
    const baseline = this.baselines.get(metric);

    if (!baseline || baseline.stddev === 0) {
      return {
        isAnomaly: false,
        metric,
        value,
        zScore: 0,
        mean: baseline?.mean ?? value,
        stddev: 0,
        severity: 'normal',
      };
    }

    const zScore = (value - baseline.mean) / baseline.stddev;
    const absZ = Math.abs(zScore);

    let severity: AnomalyResult['severity'] = 'normal';
    if (absZ > Z_THRESHOLD) {
      severity = absZ > 3.5 ? 'critical' : 'warning';
    }

    return {
      isAnomaly: absZ > Z_THRESHOLD,
      metric,
      value,
      zScore,
      mean: baseline.mean,
      stddev: baseline.stddev,
      severity,
    };
  }

  // ── Trend anomaly detection ───────────────────────────────────────────

  detectTrendAnomaly(): TrendAnomaly[] {
    const anomalies: TrendAnomaly[] = [];

    for (const [metric, baseline] of Array.from(this.baselines)) {
      const values = baseline.values;
      if (values.length < 14) continue;

      // Compare recent half vs historical half
      const mid = Math.floor(values.length / 2);
      const historical = values.slice(0, mid);
      const recent = values.slice(mid);

      const historicalSlope = this.calcSlope(historical);
      const recentSlope = this.calcSlope(recent);

      const historicalDir = this.classifySlope(historicalSlope, historical);
      const recentDir = this.classifySlope(recentSlope, recent);

      // Divergence: recent direction contradicts historical
      const divergence =
        (historicalDir === 'increasing' && recentDir === 'decreasing') ||
        (historicalDir === 'decreasing' && recentDir === 'increasing');

      if (divergence) {
        anomalies.push({
          metric,
          recentDirection: recentDir,
          historicalDirection: historicalDir,
          divergence: true,
          recentSlope,
          historicalSlope,
        });
      }
    }

    return anomalies;
  }

  // ── Cluster detection ─────────────────────────────────────────────────

  clusterAnomalies(): AnomalyCluster[] {
    const clusters: AnomalyCluster[] = [];

    for (const [metric, baseline] of Array.from(this.baselines)) {
      const anomalies: number[] = [];
      const zScores: number[] = [];

      for (const value of baseline.values) {
        if (baseline.stddev === 0) continue;
        const z = (value - baseline.mean) / baseline.stddev;
        if (Math.abs(z) > Z_THRESHOLD) {
          anomalies.push(value);
          zScores.push(Math.abs(z));
        }
      }

      if (anomalies.length >= 3) {
        const avgZ = zScores.reduce((s, z) => s + z, 0) / zScores.length;
        clusters.push({
          metric,
          count: anomalies.length,
          timeWindow: `${baseline.values.length} samples`,
          avgZScore: avgZ,
          values: anomalies,
          severity: avgZ > 3.5 ? 'critical' : 'warning',
        });
      }
    }

    return clusters;
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private calcSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((s, v) => s + v, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (values[i] - yMean);
      den += (i - xMean) ** 2;
    }
    return den === 0 ? 0 : num / den;
  }

  private classifySlope(
    slope: number,
    values: number[]
  ): 'increasing' | 'stable' | 'decreasing' {
    const range = Math.max(...values) - Math.min(...values);
    const threshold = range === 0 ? 0 : (range / values.length) * 0.1;
    if (Math.abs(slope) < threshold) return 'stable';
    return slope > 0 ? 'increasing' : 'decreasing';
  }
}
