'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import InsightsPanel from '@/components/ai/InsightsPanel';
import PredictionsPanel from '@/components/ai/PredictionsPanel';
import AnomaliesPanel from '@/components/ai/AnomaliesPanel';
import AIChat from '@/components/ai/AIChat';
import LearningStatus from '@/components/ai/LearningStatus';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, MessageSquare, Activity } from 'lucide-react';

const TABS = [
  { id: 'insights', label: 'Insights', icon: Lightbulb },
  { id: 'predictions', label: 'Predictions', icon: TrendingUp },
  { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'status', label: 'Learning Status', icon: Activity },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function AIDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>('insights');
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-cyan-400" />
              <h1 className="text-2xl sm:text-3xl font-bold">Pulsyn AI</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Self-Learning
              </span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              AI-powered insights, predictions, and anomaly detection for your CDC pipelines.
            </p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mb-6 overflow-x-auto pb-1 border-b border-gray-800">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors rounded-t-lg ${
                  activeTab === id
                    ? 'text-cyan-400 bg-gray-900/80 border border-gray-800 border-b-gray-950 -mb-[1px]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {id === 'anomalies' && <AnomalyCount refreshKey={refreshKey} />}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="min-h-[60vh]">
            {activeTab === 'insights' && <InsightsPanel refreshKey={refreshKey} onRefresh={handleRefresh} />}
            {activeTab === 'predictions' && <PredictionsPanel refreshKey={refreshKey} onRefresh={handleRefresh} />}
            {activeTab === 'anomalies' && <AnomaliesPanel refreshKey={refreshKey} onRefresh={handleRefresh} />}
            {activeTab === 'chat' && <AIChat />}
            {activeTab === 'status' && <LearningStatus refreshKey={refreshKey} onRefresh={handleRefresh} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function AnomalyCount({ refreshKey }: { refreshKey: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch('/api/ai/learn')
      .then((r) => r.json())
      .then((d) => setCount(d?.ai?.anomalies?.length ?? 0))
      .catch(() => {});
  }, [refreshKey]);

  if (count === 0) return null;
  return (
    <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
      {count}
    </span>
  );
}
