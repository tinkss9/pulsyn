'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Zap, AlertTriangle, Lightbulb, Wrench, DollarSign } from 'lucide-react';

interface AIInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  priority: string;
  actionItems: string[];
  estimatedImpact: string;
  generatedAt: string;
}

const PRIORITY_STYLES: Record<string, { badge: string; border: string }> = {
  critical: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', border: 'border-red-500/20' },
  high: { badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30', border: 'border-orange-500/20' },
  medium: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', border: 'border-yellow-500/20' },
  low: { badge: 'bg-green-500/20 text-green-400 border-green-500/30', border: 'border-green-500/20' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  optimization: Zap,
  risk: AlertTriangle,
  opportunity: Lightbulb,
  maintenance: Wrench,
  cost: DollarSign,
};

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export default function InsightsPanel({ refreshKey, onRefresh }: Props) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/ai/learn')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch insights');
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setInsights(d?.ai?.aiInsights ?? []);
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

  if (insights.length === 0) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
        <Lightbulb className="w-10 h-10 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No insights generated yet. The AI needs more data to analyze.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_STYLES[insight.priority] ?? PRIORITY_STYLES.low;
  const Icon = CATEGORY_ICONS[insight.category] ?? Lightbulb;

  return (
    <div className={`bg-gray-900/50 border ${priority.border} rounded-xl p-5 transition-colors`}>
      <button
        className="w-full flex items-start justify-between text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-white truncate">{insight.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priority.badge}`}>
                {insight.priority}
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{insight.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">Confidence</div>
            <div className="text-sm font-bold text-cyan-400">{(insight.confidence * 100).toFixed(0)}%</div>
          </div>
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
          {insight.evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Evidence</h4>
              <ul className="space-y-1">
                {insight.evidence.map((e, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">•</span>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {insight.actionItems.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Action Items</h4>
              <ul className="space-y-1">
                {insight.actionItems.map((a, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-500 mt-1">→</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>Impact: {insight.estimatedImpact}</span>
            <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
            <span className="sm:hidden">Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}
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
              <div className="h-4 bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
