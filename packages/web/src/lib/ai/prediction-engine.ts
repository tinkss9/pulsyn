// Prediction Engine — Pulsyn AI Track C
// Forecasting capacity, performance, cost, growth, and reliability
// Pure TypeScript — no external dependencies

import {
  mean,
  stddev,
  linearRegression,
  exponentialSmoothing,
  movingAverage,
  confidenceInterval,
} from './statistics';

export interface PredictionResult {
  metric: string;
  value: number;
  confidence: number;
  timeframe: string;
  trend: 'rising' | 'falling' | 'stable';
  lowerBound: number;
  upperBound: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface PipelineUsage {
  id: string;
  tablesCount: number;
  eventsPerHour: number;
  hoursRunning: number;
  status: string;
}

export class PredictionEngine {
  /**
   * Forecast capacity (connector count / event volume) over N days.
   * Uses linear regression on daily totals + 95% CI.
   */
  forecastCapacity(
    history: TimeSeriesPoint[],
    days: number = 30
  ): PredictionResult {
    if (history.length < 2) {
      return this.emptyResult('capacity', `${days} days`);
    }

    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const x = sorted.map((_, i) => i);
    const y = sorted.map((p) => p.value);
    const { slope, intercept, r2 } = linearRegression(x, y);

    const lastIndex = x[x.length - 1];
    const futureX = lastIndex + days;
    const predicted = slope * futureX + intercept;

    // Residual-based CI
    const residuals = y.map((yi, i) => yi - (slope * x[i] + intercept));
    const residualStd = stddev(residuals);
    const ci = confidenceInterval(predicted, residualStd, y.length);

    const trend: PredictionResult['trend'] =
      slope > 0.5 ? 'rising' : slope < -0.5 ? 'falling' : 'stable';

    return {
      metric: 'capacity',
      value: Math.max(0, Math.round(predicted)),
      confidence: Math.min(0.95, Math.max(0.3, r2)),
      timeframe: `${days} days`,
      trend,
      lowerBound: Math.max(0, Math.round(ci.lower)),
      upperBound: Math.round(ci.upper),
    };
  }

  /**
   * Forecast performance (events/hour) over N hours.
   * Uses exponential smoothing for short-horizon stability.
   */
  forecastPerformance(
    history: TimeSeriesPoint[],
    hours: number = 24
  ): PredictionResult {
    if (history.length < 2) {
      return this.emptyResult('performance', `${hours} hours`);
    }

    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const values = sorted.map((p) => p.value);
    const alpha = 0.3;
    const smoothed = exponentialSmoothing(values, alpha);
    const lastSmoothed = smoothed[smoothed.length - 1];

    // Trend component from moving average slope
    const ma = movingAverage(values, Math.min(5, values.length));
    const recentMA = ma.slice(-5);
    const maX = recentMA.map((_, i) => i);
    const { slope } = linearRegression(maX, recentMA);

    const predicted = Math.max(0, lastSmoothed + slope * hours);

    // CI from recent volatility
    const recentValues = values.slice(-Math.min(10, values.length));
    const ci = confidenceInterval(predicted, stddev(recentValues), recentValues.length);

    const trend: PredictionResult['trend'] =
      slope > 1 ? 'rising' : slope < -1 ? 'falling' : 'stable';

    return {
      metric: 'performance',
      value: Math.round(predicted * 100) / 100,
      confidence: Math.min(0.9, Math.max(0.4, 1 - stddev(recentValues) / (mean(recentValues) || 1))),
      timeframe: `${hours} hours`,
      trend,
      lowerBound: Math.max(0, Math.round(ci.lower * 100) / 100),
      upperBound: Math.round(ci.upper * 100) / 100,
    };
  }

  /**
   * Forecast monthly infrastructure cost.
   * Estimates from pipeline table counts and event throughput.
   */
  forecastCost(
    pipelines: PipelineUsage[],
    usagePerTable: number = 0.05
  ): PredictionResult {
    if (pipelines.length === 0) {
      return this.emptyResult('cost', '30 days');
    }

    const activePipelines = pipelines.filter((p) => p.status === 'running');
    const totalTables = activePipelines.reduce((s, p) => s + p.tablesCount, 0);
    const totalEventsPerHour = activePipelines.reduce((s, p) => s + p.eventsPerHour, 0);

    // Base cost: per-table + per-throughput
    const baseCost = totalTables * usagePerTable;
    const throughputCost = totalEventsPerHour * 0.001 * 24 * 30; // $/event * hours * days
    const predictedCost = baseCost + throughputCost;

    // Variance based on pipeline count spread
    const tableCounts = activePipelines.map((p) => p.tablesCount * usagePerTable);
    const ci = confidenceInterval(predictedCost, stddev(tableCounts) * 30, activePipelines.length);

    const trend: PredictionResult['trend'] =
      activePipelines.length > pipelines.length * 0.7 ? 'rising' : 'stable';

    return {
      metric: 'cost',
      value: Math.round(predictedCost * 100) / 100,
      confidence: Math.min(0.85, Math.max(0.3, activePipelines.length / (pipelines.length || 1))),
      timeframe: '30 days',
      trend,
      lowerBound: Math.max(0, Math.round(ci.lower * 100) / 100),
      upperBound: Math.round(ci.upper * 100) / 100,
    };
  }

  /**
   * Forecast growth using a logistic S-curve model.
   * Fits L / (1 + e^(-k*(t - t0))) to historical data.
   */
  forecastGrowth(
    history: TimeSeriesPoint[],
    days: number = 90
  ): PredictionResult {
    if (history.length < 3) {
      return this.emptyResult('growth', `${days} days`);
    }

    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const y = sorted.map((p) => p.value);
    const n = y.length;

    // Estimate carrying capacity L as 2x the max observed value (heuristic)
    const maxY = Math.max(...y);
    const L = maxY * 2;

    // Estimate growth rate k and midpoint t0 via linearization of log(L/y - 1)
    const lnTransformed: number[] = [];
    const validX: number[] = [];
    for (let i = 0; i < n; i++) {
      const ratio = L / y[i] - 1;
      if (ratio > 0.001) {
        lnTransformed.push(Math.log(ratio));
        validX.push(i);
      }
    }

    let k = 0.05;
    let t0 = n / 2;
    if (validX.length >= 2) {
      const { slope, intercept } = linearRegression(validX, lnTransformed);
      k = -slope;
      t0 = intercept / (slope || 1);
    }

    // Project forward
    const futureT = n + days;
    const predicted = L / (1 + Math.exp(-k * (futureT - t0)));

    // CI from residuals on training data
    const fitted = validX.map((t) => L / (1 + Math.exp(-k * (t - t0))));
    const residuals = validX.map((t, i) => y[t] - fitted[i]);
    const ci = confidenceInterval(predicted, stddev(residuals), n);

    const recentGrowthRate = n >= 2 ? (y[n - 1] - y[n - 2]) / (y[n - 2] || 1) : 0;
    const trend: PredictionResult['trend'] =
      recentGrowthRate > 0.02 ? 'rising' : recentGrowthRate < -0.02 ? 'falling' : 'stable';

    return {
      metric: 'growth',
      value: Math.max(0, Math.round(predicted)),
      confidence: Math.min(0.85, Math.max(0.3, 1 - Math.abs(k - 0.05) / 0.5)),
      timeframe: `${days} days`,
      trend,
      lowerBound: Math.max(0, Math.round(ci.lower)),
      upperBound: Math.round(ci.upper),
    };
  }

  /**
   * Predict time-to-failure from error-rate history.
   * Uses exponential smoothing on error rates and extrapolates
   * when error rate crosses a critical threshold.
   */
  predictFailure(
    history: TimeSeriesPoint[],
    threshold: number = 0.5
  ): PredictionResult {
    if (history.length < 3) {
      return this.emptyResult('reliability', 'N/A');
    }

    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const values = sorted.map((p) => p.value);
    const smoothed = exponentialSmoothing(values, 0.4);
    const currentValue = smoothed[smoothed.length - 1];

    // Linear regression on smoothed values to find when threshold is crossed
    const x = smoothed.map((_, i) => i);
    const { slope, intercept } = linearRegression(x, smoothed);

    let hoursToFailure = Infinity;
    if (slope > 0) {
      const tCross = (threshold - intercept) / slope;
      hoursToFailure = Math.max(0, tCross - x[x.length - 1]);
    }

    // If already above threshold or no growth, report current state
    if (currentValue >= threshold || hoursToFailure === Infinity) {
      const ci = confidenceInterval(currentValue, stddev(values), values.length);
      return {
        metric: 'reliability',
        value: Math.round(currentValue * 1000) / 1000,
        confidence: 0.7,
        timeframe: currentValue >= threshold ? 'critical now' : 'stable',
        trend: currentValue >= threshold ? 'falling' : 'stable',
        lowerBound: Math.max(0, Math.round(ci.lower * 1000) / 1000),
        upperBound: Math.min(1, Math.round(ci.upper * 1000) / 1000),
      };
    }

    // Convert index units to hours (assume 1 unit = 1 hour for hourly data)
    const daysToFailure = Math.round(hoursToFailure / 24);
    const ci = confidenceInterval(
      hoursToFailure,
      stddev(values) * hoursToFailure,
      values.length
    );

    return {
      metric: 'reliability',
      value: Math.round(hoursToFailure),
      confidence: Math.min(0.85, Math.max(0.3, 1 - stddev(values))),
      timeframe: daysToFailure > 0 ? `${daysToFailure} days` : `${Math.round(hoursToFailure)} hours`,
      trend: 'falling',
      lowerBound: Math.max(0, Math.round(ci.lower)),
      upperBound: Math.round(ci.upper),
    };
  }

  private emptyResult(metric: string, timeframe: string): PredictionResult {
    return {
      metric,
      value: 0,
      confidence: 0,
      timeframe,
      trend: 'stable',
      lowerBound: 0,
      upperBound: 0,
    };
  }
}

let engineInstance: PredictionEngine | null = null;

export function getPredictionEngine(): PredictionEngine {
  if (!engineInstance) {
    engineInstance = new PredictionEngine();
  }
  return engineInstance;
}
