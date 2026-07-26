'use client';

import { useState, useEffect } from 'react';

// Demo data generator
function generateDemoData(type: string, count: number) {
  const data = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'users':
        data.push({
          id: `USR-${1000 + i}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
        });
        break;
      case 'orders':
        data.push({
          id: `ORD-${10000 + i}`,
          customer: `Customer ${i + 1}`,
          amount: Math.round(Math.random() * 1000 * 100) / 100,
          status: ['completed', 'processing', 'shipped', 'cancelled'][Math.floor(Math.random() * 4)],
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
        break;
      case 'events':
        data.push({
          id: `EVT-${100000 + i}`,
          type: ['page_view', 'click', 'purchase', 'signup', 'login'][Math.floor(Math.random() * 5)],
          user_id: `USR-${1000 + Math.floor(Math.random() * 100)}`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          properties: { page: `/page-${Math.floor(Math.random() * 10)}` },
        });
        break;
    }
  }
  return data;
}

// Demo connectors
const DEMO_CONNECTORS = [
  { id: 'pg-demo', name: 'PostgreSQL Demo', type: 'database', status: 'connected', tables: 12 },
  { id: 'mysql-demo', name: 'MySQL Demo', type: 'database', status: 'connected', tables: 8 },
  { id: 'stripe-demo', name: 'Stripe Demo', type: 'payment', status: 'connected', tables: 5 },
  { id: 'shopify-demo', name: 'Shopify Demo', type: 'ecommerce', status: 'connected', tables: 15 },
  { id: 'hubspot-demo', name: 'HubSpot Demo', type: 'crm', status: 'connected', tables: 10 },
];

export default function DemoLabPage() {
  const [selectedConnector, setSelectedConnector] = useState(DEMO_CONNECTORS[0]);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    rowsSynced: 0,
    latency: 0,
    throughput: 0,
    errors: 0,
  });

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        rowsSynced: prev.rowsSynced + Math.floor(Math.random() * 100),
        latency: 50 + Math.random() * 200,
        throughput: 1000 + Math.random() * 5000,
        errors: Math.random() > 0.95 ? prev.errors + 1 : prev.errors,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Load demo tables
  useEffect(() => {
    const demoTables = {
      'pg-demo': ['users', 'orders', 'products', 'inventory', 'transactions'],
      'mysql-demo': ['customers', 'invoices', 'payments', 'refunds'],
      'stripe-demo': ['charges', 'customers', 'subscriptions', 'invoices'],
      'shopify-demo': ['products', 'orders', 'customers', 'inventory', 'collections'],
      'hubspot-demo': ['contacts', 'companies', 'deals', 'tickets', 'engagements'],
    };
    setTables(demoTables[selectedConnector.id as keyof typeof demoTables] || []);
    setSelectedTable('');
    setData([]);
  }, [selectedConnector]);

  // Load demo data
  useEffect(() => {
    if (!selectedTable) return;

    setLoading(true);
    setTimeout(() => {
      const demoData = generateDemoData(selectedTable, 20);
      setData(demoData);
      setLoading(false);
    }, 500);
  }, [selectedTable]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pulsyn Demo Lab</h1>
            <p className="text-gray-400">Try Pulsyn with simulated data — no signup required</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-600 rounded-full text-sm">
              Free Tier
            </span>
            <a
              href="/pricing"
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade
            </a>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar — Connectors */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-4">DEMO CONNECTORS</h2>
          <div className="space-y-2">
            {DEMO_CONNECTORS.map(conn => (
              <button
                key={conn.id}
                onClick={() => setSelectedConnector(conn)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedConnector.id === conn.id
                    ? 'bg-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{conn.name}</div>
                <div className="text-sm text-gray-400">{conn.type}</div>
              </button>
            ))}
          </div>

          {/* Metrics */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">LIVE METRICS</h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400">Rows Synced</div>
                <div className="text-lg font-bold">{metrics.rowsSynced.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Latency</div>
                <div className="text-lg font-bold">{Math.round(metrics.latency)}ms</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Throughput</div>
                <div className="text-lg font-bold">{Math.round(metrics.throughput).toLocaleString()}/s</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Errors</div>
                <div className="text-lg font-bold text-red-400">{metrics.errors}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Table Selector */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Select Table</h2>
            <div className="flex flex-wrap gap-2">
              {tables.map(table => (
                <button
                  key={table}
                  onClick={() => setSelectedTable(table)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTable === table
                      ? 'bg-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {table}
                </button>
              ))}
            </div>
          </div>

          {/* Data Table */}
          {selectedTable && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedTable} <span className="text-gray-400">({data.length} rows)</span>
                </h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                    Export CSV
                  </button>
                  <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                    Create Pipeline
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-800">
                        {data.length > 0 &&
                          Object.keys(data[0]).map(key => (
                            <th
                              key={key}
                              className="px-4 py-3 text-left text-sm font-medium text-gray-400"
                            >
                              {key}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-700 hover:bg-gray-800"
                        >
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="px-4 py-3 text-sm">
                              {typeof value === 'object'
                                ? JSON.stringify(value)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!selectedTable && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <svg
                className="w-16 h-16 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
              <p className="text-lg">Select a table to view data</p>
              <p className="text-sm mt-2">
                This is a demo with simulated data.{' '}
                <a href="/signup" className="text-blue-400 hover:underline">
                  Sign up
                </a>{' '}
                for real connectors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
