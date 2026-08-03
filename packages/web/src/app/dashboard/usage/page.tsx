'use client';

import { useEffect, useState } from 'react';

export default function UsagePage() {
  const [usage, setUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pulsyn_api_key');
    fetch('/api/billing/status?orgId=default', {
      headers: { 'x-api-key': token || '' },
    })
      .then(r => r.json())
      .then(data => {
        setUsage(data.usage ? [
          { metric: 'rows_replicated', ...data.usage, total: data.usage.rowsReplicated },
          { metric: 'api_calls', ...data.usage, total: data.usage.apiCalls },
        ] : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Usage & Billing</h1>

      {loading ? (
        <div className="text-gray-400">Loading usage data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">Rows Replicated (Today)</h3>
            <p className="text-3xl font-bold text-green-400">
              {usage.find(u => u.metric === 'rows_replicated')?.today?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Per-row pricing applies above free tier</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-2">API Calls (Today)</h3>
            <p className="text-3xl font-bold text-blue-400">
              {usage.find(u => u.metric === 'api_calls')?.today?.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Rate limited per plan tier</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Usage-Based Pricing</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="text-left py-2">Metric</th>
              <th className="text-right py-2">Free Tier</th>
              <th className="text-right py-2">Overage</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800">
              <td className="py-2">Rows Replicated</td>
              <td className="text-right">50,000/day</td>
              <td className="text-right">$0.30 per 100K</td>
            </tr>
            <tr className="border-b border-gray-800">
              <td className="py-2">API Calls</td>
              <td className="text-right">500/day</td>
              <td className="text-right">$0.02 per 100</td>
            </tr>
            <tr>
              <td className="py-2">Pipeline Hours</td>
              <td className="text-right">720 hrs/mo</td>
              <td className="text-right">Included</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
