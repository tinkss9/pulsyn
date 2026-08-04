// Statistical helpers for Pulsyn AI Prediction Engine
// Pure TypeScript — no external dependencies

/** Arithmetic mean */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Median value */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Population standard deviation */
export function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Simple linear regression: y = slope * x + intercept */
export function linearRegression(
  x: number[],
  y: number[]
): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  if (n < 2 || n !== y.length) {
    return { slope: 0, intercept: mean(y), r2: 0 };
  }

  const xMean = mean(x);
  const yMean = mean(y);

  let ssXY = 0;
  let ssXX = 0;
  let ssYY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    ssXY += dx * dy;
    ssXX += dx * dx;
    ssYY += dy * dy;
  }

  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = yMean - slope * xMean;

  // R² = (SS_xy)² / (SS_xx * SS_yy)
  const r2 = ssXX === 0 || ssYY === 0 ? 0 : (ssXY * ssXY) / (ssXX * ssYY);

  return { slope, intercept, r2 };
}

/** Simple exponential smoothing (Holt's method, level only) */
export function exponentialSmoothing(
  values: number[],
  alpha: number
): number[] {
  if (values.length === 0) return [];
  const a = Math.max(0, Math.min(1, alpha));
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(a * values[i] + (1 - a) * result[i - 1]);
  }
  return result;
}

/** Simple moving average */
export function movingAverage(values: number[], window: number): number[] {
  const w = Math.max(1, Math.floor(window));
  if (values.length === 0 || w === 0) return [];
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - w + 1);
    const slice = values.slice(start, i + 1);
    result.push(slice.reduce((s, v) => s + v, 0) / slice.length);
  }
  return result;
}

/** Confidence interval half-width: z * stddev / sqrt(n) */
export function confidenceInterval(
  meanVal: number,
  stddevVal: number,
  n: number,
  z: number = 1.96
): { lower: number; upper: number; marginOfError: number } {
  if (n <= 0) return { lower: meanVal, upper: meanVal, marginOfError: 0 };
  const moe = z * stddevVal / Math.sqrt(n);
  return {
    lower: meanVal - moe,
    upper: meanVal + moe,
    marginOfError: moe,
  };
}

/** Z-score of a single value relative to a dataset */
export function zScore(value: number, values: number[]): number {
  const sd = stddev(values);
  if (sd === 0) return 0;
  return (value - mean(values)) / sd;
}

/** Percentile (nearest-rank method) */
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const clamped = Math.max(0, Math.min(100, p));
  const rank = Math.ceil((clamped / 100) * sorted.length) - 1;
  return sorted[Math.max(0, rank)];
}
