'use client';

import { useState, useEffect } from 'react';

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

interface AIData {
  ai: {
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
    insights: {
      connectorPerformance: { engine: string; total: number; connected: number; errors: number; successRate: string }[];
      pipelineHealth: { status: string; count: number; avgAgeHours: string }[];
      cdcPatterns: {
        totalEvents: number;
        eventsPerHour: string;
        throughputTrend: string;
        topTables: { table_name: string; event_count: number }[];
        operations: Record<string, number>;
      };
      marketplacePopularity: { name: string; downloads: number; rating: number }[];
    };
    anomalies: { type: string; severity: string; description: string; confidence: number; suggestedAction: string }[];
    predictions: { type: string; prediction: string; confidence: number; timeframe: string; impact: string; recommendedAction: string }[];
    aiInsights: AIInsight[];
    recommendations: string[];
  };
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

const categoryIcons: Record<string, string> = {
  optimization: '⚡',
  risk: '⚠️',
  opportunity: '💡',
  maintenance: '🔧',
  cost: '💰',
};

export default function AIInsightsPage() {
  const [data, setData] = useState<AIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'insights' | 'anomalies' | 'predictions' | 'data'>('insights');

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    setLoading(true);
    try {
      const resp = await fetch('/api/ai/learn');
      if (!resp.ok) throw new Error('Failed to fetch AI insights');
      const json = await resp.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading AI Insights</h2>
            <p className="text-red-600">{error}</p>
            <button onClick={fetchInsights} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { ai } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Pulsyn AI</h1>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              v{ai.version}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ai.learning.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {ai.learning.status === 'active' ? '● Learning Active' : '○ Learning Paused'}
            </span>
          </div>
          <p className="text-gray-600">
            Self-learning AI engine analyzing your CDC pipelines, connectors, and data patterns.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Data Points" value={ai.dataPoints.connectors + ai.dataPoints.pipelines + ai.dataPoints.cdcEvents} icon="📊" />
          <StatCard label="Anomalies" value={ai.dataPoints.anomaliesDetected} icon="🔍" />
          <StatCard label="Predictions" value={ai.dataPoints.predictionsGenerated} icon="🔮" />
          <StatCard label="Insights" value={ai.dataPoints.insightsGenerated} icon="💡" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
          {(['insights', 'anomalies', 'predictions', 'data'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-purple-700 border border-gray-200 border-b-white -mb-[2px]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'anomalies' && ai.anomalies.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                  {ai.anomalies.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {ai.aiInsights.length === 0 ? (
              <EmptyState message="No insights generated yet. The AI needs more data to analyze." />
            ) : (
              ai.aiInsights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            )}
          </div>
        )}

        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            {ai.anomalies.length === 0 ? (
              <EmptyState message="No anomalies detected. Your system is healthy!" />
            ) : (
              ai.anomalies.map((anomaly, i) => (
                <AnomalyCard key={i} anomaly={anomaly} />
              ))
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-4">
            {ai.predictions.length === 0 ? (
              <EmptyState message="No predictions available yet. Need more historical data." />
            ) : (
              ai.predictions.map((pred, i) => (
                <PredictionCard key={i} prediction={pred} />
              ))
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DataCard title="Connector Performance" items={ai.insights.connectorPerformance.map(c => ({
              label: c.engine,
              value: `${c.connected}/${c.total} connected (${c.successRate})`,
              status: parseInt(c.successRate) > 90 ? 'good' : parseInt(c.successRate) > 70 ? 'warning' : 'error'
            }))} />
            <DataCard title="Pipeline Health" items={ai.insights.pipelineHealth.map(p => ({
              label: p.status,
              value: `${p.count} pipelines (avg ${p.avgAgeHours}h old)`,
              status: p.status === 'running' ? 'good' : p.status === 'failed' ? 'error' : 'neutral'
            }))} />
            <DataCard title="CDC Patterns" items={[
              { label: 'Total Events', value: ai.insights.cdcPatterns.totalEvents.toLocaleString(), status: 'neutral' },
              { label: 'Events/Hour', value: ai.insights.cdcPatterns.eventsPerHour, status: 'neutral' },
              { label: 'Trend', value: ai.insights.cdcPatterns.throughputTrend, status: ai.insights.cdcPatterns.throughputTrend === 'increasing' ? 'good' : 'warning' },
              ...ai.insights.cdcPatterns.topTables.map(t => ({
                label: t.table_name,
                value: `${t.event_count} events`,
                status: 'neutral' as const
              }))
            ]} />
            <DataCard title="Top Marketplace Connectors" items={ai.insights.marketplacePopularity.map(m => ({
              label: m.name,
              value: `${m.downloads} downloads, ${m.rating.toFixed(1)}★`,
              status: 'good'
            }))} />
          </div>
        )}

        {/* Learning Status Footer */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Learning Pipeline</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Model Version</span>
              <p className="font-medium">{ai.learning.modelVersion}</p>
            </div>
            <div>
              <span className="text-gray-500">Learning Rate</span>
              <p className="font-medium">{ai.learning.learningRate}</p>
            </div>
            <div>
              <span className="text-gray-500">History Size</span>
              <p className="font-medium">{ai.learning.historySize} cycles</p>
            </div>
            <div>
              <span className="text-gray-500">Next Training</span>
              <p className="font-medium">{new Date(ai.learning.nextTraining).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchInsights}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Refresh AI Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-lg border ${priorityColors[insight.priority] || 'border-gray-200'} p-5`}>
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{categoryIcons[insight.category] || '📋'}</span>
            <h3 className="font-semibold text-gray-900">{insight.title}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[insight.priority]}`}>
              {insight.priority}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{insight.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-sm text-gray-500">Confidence</div>
          <div className="text-lg font-bold text-purple-700">{(insight.confidence * 100).toFixed(0)}%</div>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Evidence</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {insight.evidence.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Action Items</h4>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {insight.actionItems.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Impact: {insight.estimatedImpact}</span>
            <span>Generated: {new Date(insight.generatedAt).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: { type: string; severity: string; description: string; confidence: number; suggestedAction: string } }) {
  const severityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">🔍</span>
        <h3 className="font-semibold text-gray-900">{anomaly.type.replace(/_/g, ' ')}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[anomaly.severity]}`}>
          {anomaly.severity}
        </span>
        <span className="text-sm text-gray-500 ml-auto">{(anomaly.confidence * 100).toFixed(0)}% confidence</span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{anomaly.description}</p>
      <p className="text-sm text-purple-700">→ {anomaly.suggestedAction}</p>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: { type: string; prediction: string; confidence: number; timeframe: string; impact: string; recommendedAction: string } }) {
  const impactColors: Record<string, string> = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">🔮</span>
        <h3 className="font-semibold text-gray-900 capitalize">{prediction.type} Prediction</h3>
        <span className="text-sm text-gray-500 ml-auto">{prediction.timeframe}</span>
      </div>
      <p className="text-gray-700 mb-2">{prediction.prediction}</p>
      <div className="flex gap-4 text-sm">
        <span className={impactColors[prediction.impact] || 'text-gray-500'}>Impact: {prediction.impact}</span>
        <span className="text-gray-500">Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
      </div>
      <p className="text-sm text-purple-700 mt-2">→ {prediction.recommendedAction}</p>
    </div>
  );
}

function DataCard({ title, items }: { title: string; items: { label: string; value: string; status: 'good' | 'warning' | 'error' | 'neutral' }[] }) {
  const statusColors: Record<string, string> = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No data available</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600">{item.label}</span>
              <span className={statusColors[item.status]}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <span className="text-4xl mb-4 block">🤖</span>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
