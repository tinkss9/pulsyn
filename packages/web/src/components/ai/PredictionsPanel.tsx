'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Cpu, DollarSign, Shield, BarChart3 } from 'lucide-react';

interface Prediction {
  type: 'capacity' | 'performance' | 'cost' | 'reliability' | 'growth';
  prediction: string;
  confidence: number;
  timeframe: string;
  impact: string;
  recommendedAction: string;
}

type TimeRange = '7d' | '30d' | '90d';

const METRIC_ICONS: Record<string, React.ElementType> = {
  capacity: BarChart3,
  performance: Cpu,
  cost: DollarSign,
  reliability: Shield,
  growth: TrendingUp,
};

const METRIC_COLORS: Record<string, string> = {
  capacity: 'text-blue-400',
  performance: 'text-cyan-400',
  cost: 'text-amber-400',
  reliability: 'text-green-400',
  growth: 'text-purple-400',
};

const IMPACT_COLORS: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
};

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export default function PredictionsPanel({ refreshKey, onRefresh }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ai/learn')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch predictions');
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setPredictions(d?.ai?.predictions ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={onRefresh} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
          Retry
        </button>
      </div>
    );
  }

  // Filter by time range
  const rangeMs: Record<TimeRange, number> = { '7d': 7 * 86400000, '30d': 30 * 86400000, '90d': 90 * 86400000 };
  const filtered = predictions.filter((p) => {
    const tf = p.timeframe.toLowerCase();
    if (timeRange === '7d') return tf.includes('day') || tf.includes('week') || tf.includes('7');
    if (timeRange === '30d') return !tf.includes('90') && !tf.includes('quarter');
    return true;
  });

  if (filtered.length === 0 && predictions.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
        <TrendingUp className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No predictions available yet. Need more historical data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Predictions</h2>
        <div className="flex bg-gray-900/50 border border-gray-800 rounded-lg p-0.5">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeRange === range ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metric summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {['capacity', 'performance', 'cost', 'reliability', 'growth'].map((type) => {
          const count = filtered.filter((p) => p.type === type).length;
          const Icon = METRIC_ICONS[type] ?? BarChart3;
          return (
            <div key={type} className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-1 ${METRIC_COLORS[type]}`} />
              <div className="text-xs text-gray-500 capitalize">{type}</div>
              <div className="text-lg font-bold text-white">{count}</div>
            </div>
          );
        })}
      </div>

      {/* Prediction cards */}
      <div className="space-y-4">
        {(filtered.length > 0 ? filtered : predictions).map((pred, i) => (
          <PredictionCard key={i} prediction={pred} index={i} />
        ))}
      </div>
    </div>
  );
}

function PredictionCard({ prediction, index }: { prediction: Prediction; index: number }) {
  const Icon = METRIC_ICONS[prediction.type] ?? BarChart3;
  const color = METRIC_COLORS[prediction.type] ?? 'text-gray-400';
  const confidencePct = Math.round(prediction.confidence * 100);

  // Generate deterministic sparkline data from prediction
  const sparklineData = generateSparkline(prediction, index);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg bg-gray-800/50 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white capitalize">{prediction.type} Prediction</h3>
            <span className="text-xs text-gray-500">{prediction.timeframe}</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">{prediction.prediction}</p>

          <div className="flex items-center gap-6 flex-wrap">
            {/* Confidence bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Confidence</span>
              <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${confidencePct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-cyan-400">{confidencePct}%</span>
            </div>

            {/* Impact */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Impact:</span>
              <span className={`text-xs font-medium capitalize ${IMPACT_COLORS[prediction.impact] ?? 'text-gray-400'}`}>
                {prediction.impact}
              </span>
            </div>

            {/* Sparkline */}
            <div className="hidden sm:block ml-auto">
              <Sparkline data={sparklineData} color={color} />
            </div>
          </div>

          <p className="text-sm text-cyan-400/80 mt-3 flex items-center gap-1">
            <span>→</span> {prediction.recommendedAction}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Generate deterministic sparkline values from a prediction */
function generateSparkline(pred: Prediction, seed: number): number[] {
  const points: number[] = [];
  let v = 40 + (seed * 17) % 30;
  for (let i = 0; i < 12; i++) {
    v = Math.max(10, Math.min(90, v + ((seed * (i + 1) * 13) % 20) - 10));
    points.push(v);
  }
  // Trend towards confidence
  const target = pred.confidence * 100;
  points[points.length - 1] = target;
  points[points.length - 2] = target + ((seed % 10) - 5);
  return points;
}

/** Pure SVG sparkline — no external chart lib */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80;
  const h = 28;
  const padding = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((v - min) / range) * (h - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  // Confidence interval band (±10%)
  const bandTop = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (w - 2 * padding);
    const y = h - padding - ((Math.min(v + 10, max) - min) / range) * (h - 2 * padding);
    return `${x},${y}`;
  });
  const bandBottom = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (w - 2 * padding);
      const y = h - padding - ((Math.max(v - 10, min) - min) / range) * (h - 2 * padding);
      return `${x},${y}`;
    })
    .reverse();
  const bandPath = [...bandTop, ...bandBottom].map((p, i) => `${i === 0 ? 'M' : 'L'}${p}`).join(' ') + ' Z';

  const strokeColor = color.includes('cyan')
    ? '#22d3ee'
    : color.includes('blue')
      ? '#60a5fa'
      : color.includes('amber')
        ? '#fbbf24'
        : color.includes('green')
          ? '#4ade80'
          : '#a78bfa';

  return (
    <svg width={w} height={h} className="opacity-60">
      <path d={bandPath} fill={strokeColor} opacity={0.1} />
      <polyline fill="none" stroke={strokeColor} strokeWidth="1.5" points={points} />
    </svg>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-1/4" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-3 h-20" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 h-32" />
      ))}
    </div>
  );
}
