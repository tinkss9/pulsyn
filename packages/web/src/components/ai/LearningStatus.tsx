'use client';

import { useState, useEffect } from 'react';
import { Brain, Database, Gauge, Layers, Activity, Clock, RefreshCw, TrendingUp } from 'lucide-react';

interface LearningInfo {
  version: string;
  lastTrained: string | null;
  modelStatus: string;
  dataPoints: {
    connectors: number;
    pipelines: number;
    cdcEvents: number;
    marketplaceConnectors: number;
    anomaliesDetected: number;
    predictionsGenerated: number;
    insightsGenerated: number;
  };
  learning: {
    status: string;
    dataCollected: boolean;
    modelVersion: string;
    learningRate: number;
    nextTraining: string;
    historySize: number;
  };
}

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export default function LearningStatus({ refreshKey, onRefresh }: Props) {
  const [data, setData] = useState<LearningInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ai/learn')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch learning status');
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d?.ai ?? null);
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

  if (!data) return null;

  const { learning, dataPoints, version, lastTrained, modelStatus } = data;
  const learningActive = learning.status === 'active';
  const confidencePct = Math.min(100, Math.round(learning.learningRate * 100));
  const totalDataPoints = dataPoints.connectors + dataPoints.pipelines + dataPoints.cdcEvents + dataPoints.marketplaceConnectors;

  return (
    <div className="space-y-6">
      {/* Model overview */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            Model Overview
          </h2>
          <button onClick={onRefresh} className="p-2 text-gray-400 hover:text-white transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Version */}
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              Model Version
            </div>
            <p className="text-2xl font-bold text-white">{version}</p>
            <p className="text-xs text-gray-500">{learning.modelVersion}</p>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-1">
              <Activity className="w-3.5 h-3.5" />
              Status
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${learningActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <p className="text-lg font-semibold text-white capitalize">{learning.status}</p>
            </div>
            <p className="text-xs text-gray-500">Engine: {modelStatus}</p>
          </div>

          {/* Last trained */}
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              Last Training
            </div>
            <p className="text-lg font-semibold text-white">
              {lastTrained ? new Date(lastTrained).toLocaleDateString() : 'Not yet'}
            </p>
            {lastTrained && (
              <p className="text-xs text-gray-500">{new Date(lastTrained).toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Database} label="Total Data Points" value={totalDataPoints.toLocaleString()} color="text-cyan-400" />
        <StatCard icon={Gauge} label="Learning Rate" value={`${confidencePct}%`} color="text-green-400" />
        <StatCard icon={Layers} label="Patterns Learned" value={learning.historySize.toLocaleString()} color="text-purple-400" />
        <StatCard icon={TrendingUp} label="Insights Generated" value={dataPoints.insightsGenerated.toLocaleString()} color="text-amber-400" />
      </div>

      {/* Data breakdown */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-400" />
          Training Data Breakdown
        </h3>
        <div className="space-y-3">
          <BreakdownRow label="Connectors" value={dataPoints.connectors} total={totalDataPoints} color="bg-cyan-500" />
          <BreakdownRow label="Pipelines" value={dataPoints.pipelines} total={totalDataPoints} color="bg-blue-500" />
          <BreakdownRow label="CDC Events" value={dataPoints.cdcEvents} total={totalDataPoints} color="bg-purple-500" />
          <BreakdownRow label="Marketplace" value={dataPoints.marketplaceConnectors} total={totalDataPoints} color="bg-amber-500" />
        </div>
      </div>

      {/* Learning pipeline */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          Learning Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Model Version</span>
            <p className="font-medium text-white">{learning.modelVersion}</p>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Learning Rate</span>
            <p className="font-medium text-white">{learning.learningRate}</p>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">History Size</span>
            <p className="font-medium text-white">{learning.historySize} cycles</p>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Next Training</span>
            <p className="font-medium text-white">{new Date(learning.nextTraining).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Activity counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <CounterCard label="Anomalies Detected" value={dataPoints.anomaliesDetected} icon="🔍" />
        <CounterCard label="Predictions Generated" value={dataPoints.predictionsGenerated} icon="🔮" />
        <CounterCard label="Insights Generated" value={dataPoints.insightsGenerated} icon="💡" />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 sm:w-36 text-sm text-gray-400 shrink-0">{label}</div>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <div className="w-16 text-right text-sm font-medium text-white shrink-0">{value.toLocaleString()}</div>
    </div>
  );
}

function CounterCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
      <span className="text-2xl block mb-1">{icon}</span>
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="h-6 bg-gray-800 rounded w-1/4 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-800 rounded w-1/3" />
              <div className="h-8 bg-gray-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 h-24" />
        ))}
      </div>
    </div>
  );
}
