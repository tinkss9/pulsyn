'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, XCircle, Clock, Server, Zap } from 'lucide-react';

interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResource?: string;
  detectedAt?: string;
  confidence: number;
  suggestedAction: string;
}

const SEVERITY_STYLES: Record<string, { badge: string; icon: React.ElementType; border: string }> = {
  critical: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, border: 'border-red-500/20' },
  high: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertCircle, border: 'border-orange-500/20' },
  medium: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: AlertTriangle, border: 'border-yellow-500/20' },
  low: { badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Info, border: 'border-blue-500/20' },
};

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export default function AnomaliesPanel({ refreshKey, onRefresh }: Props) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ai/learn')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch anomalies');
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setAnomalies(d?.ai?.anomalies ?? []);
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

  if (anomalies.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
        <AlertTriangle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 mb-1">No anomalies detected</p>
        <p className="text-sm text-gray-500">Your system is healthy!</p>
      </div>
    );
  }

  // Sort: critical first
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...anomalies].sort(
    (a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99)
  );

  const criticalCount = anomalies.filter((a) => a.severity === 'critical').length;
  const highCount = anomalies.filter((a) => a.severity === 'high').length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <h2 className="text-lg font-semibold">Anomaly Alerts</h2>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium">
              {highCount} high
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500 ml-auto">Total: {anomalies.length}</span>
      </div>

      {/* Anomaly cards */}
      {sorted.map((anomaly, i) => (
        <AnomalyCard key={i} anomaly={anomaly} />
      ))}
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const style = SEVERITY_STYLES[anomaly.severity] ?? SEVERITY_STYLES.low;
  const Icon = style.icon;
  const confidencePct = Math.round(anomaly.confidence * 100);

  return (
    <div className={`bg-gray-900/50 border ${style.border} rounded-xl p-5`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${
          anomaly.severity === 'critical' ? 'text-red-400' :
          anomaly.severity === 'high' ? 'text-orange-400' :
          anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-white">{anomaly.type.replace(/_/g, ' ')}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${style.badge}`}>
              {anomaly.severity}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-3">{anomaly.description}</p>

          <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
            {anomaly.affectedResource && (
              <span className="flex items-center gap-1">
                <Server className="w-3 h-3" />
                {anomaly.affectedResource}
              </span>
            )}
            {anomaly.detectedAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(anomaly.detectedAt).toLocaleString()}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {confidencePct}% confidence
            </span>
          </div>

          <p className="text-sm text-cyan-400/80 mt-3 flex items-center gap-1">
            <span>→</span> {anomaly.suggestedAction}
          </p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-gray-800 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-1/4" />
              <div className="h-3 bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
