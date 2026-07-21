'use client';

import { useEffect, useState } from 'react';

export default function UsagePage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    fetch(`${API_URL}/api/billing/usage/default`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setUsage(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Usage</h1>
        <p className="text-gray-400 mt-1">Monitor your resource consumption</p>
      </div>

      {usage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UsageCard
            title="Rows Replicated"
            used={usage.metrics?.rowsReplicated?.used || 0}
            limit={usage.metrics?.rowsReplicated?.limit || 0}
            unit="rows/day"
          />
          <UsageCard
            title="API Calls"
            used={usage.metrics?.apiCalls?.used || 0}
            limit={usage.metrics?.apiCalls?.limit || 0}
            unit="calls/day"
          />
          <UsageCard
            title="Pipeline Hours"
            used={usage.metrics?.pipelineHours?.used || 0}
            limit={usage.metrics?.pipelineHours?.limit || 0}
            unit="hours/month"
          />
          <UsageCard
            title="Storage"
            used={usage.metrics?.storageBytes?.used || 0}
            limit={usage.metrics?.storageBytes?.limit || 0}
            unit="bytes"
            format="bytes"
          />
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">📈</div>
          <h2 className="text-lg font-semibold mb-2">No usage data yet</h2>
          <p className="text-gray-400">Usage data will appear once you start replicating.</p>
        </div>
      )}
    </div>
  );
}

function UsageCard({ title, used, limit, unit, format }: { title: string; used: number; limit: number; unit: string; format?: 'bytes' }) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percentage > 80;

  const formatValue = (val: number) => {
    if (format === 'bytes') {
      if (val >= 1073741824) return `${(val / 1073741824).toFixed(1)} GB`;
      if (val >= 1048576) return `${(val / 1048576).toFixed(1)} MB`;
      if (val >= 1024) return `${(val / 1024).toFixed(1)} KB`;
      return `${val} B`;
    }
    return val.toLocaleString();
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      <div className="text-2xl font-bold mb-1">{formatValue(used)}</div>
      <div className="text-sm text-gray-500 mb-4">of {formatValue(limit)}</div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${isNearLimit ? 'bg-red-500' : 'bg-pulsyn-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-sm text-gray-500 mt-1">{percentage.toFixed(1)}%</div>
    </div>
  );
}
