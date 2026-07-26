'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, CreditCard, ShoppingCart, Users, Activity, Clock, Zap, AlertCircle, ChevronRight, Download, Plus } from 'lucide-react';

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
      case 'products':
        data.push({
          id: `PRD-${5000 + i}`,
          name: `Product ${i + 1}`,
          price: Math.round(Math.random() * 200 * 100) / 100,
          stock: Math.floor(Math.random() * 1000),
          category: ['Electronics', 'Clothing', 'Books', 'Home'][Math.floor(Math.random() * 4)],
        });
        break;
    }
  }
  return data;
}

// Demo connectors with icons
const DEMO_CONNECTORS = [
  { id: 'pg-demo', name: 'PostgreSQL', type: 'Database', icon: Database, color: '#336791', tables: ['users', 'orders', 'products', 'inventory', 'transactions'] },
  { id: 'mysql-demo', name: 'MySQL', type: 'Database', icon: Database, color: '#4479A1', tables: ['customers', 'invoices', 'payments', 'refunds'] },
  { id: 'stripe-demo', name: 'Stripe', type: 'Payment', icon: CreditCard, color: '#635BFF', tables: ['charges', 'customers', 'subscriptions', 'invoices'] },
  { id: 'shopify-demo', name: 'Shopify', type: 'E-commerce', icon: ShoppingCart, color: '#96BF48', tables: ['products', 'orders', 'customers', 'inventory', 'collections'] },
  { id: 'hubspot-demo', name: 'HubSpot', type: 'CRM', icon: Users, color: '#FF7A59', tables: ['contacts', 'companies', 'deals', 'tickets', 'engagements'] },
];

export default function DemoLabPage() {
  const [selectedConnector, setSelectedConnector] = useState(DEMO_CONNECTORS[0]);
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    rowsSynced: 0,
    latency: 45,
    throughput: 3200,
    errors: 0,
  });

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        rowsSynced: prev.rowsSynced + Math.floor(Math.random() * 50) + 10,
        latency: 30 + Math.random() * 100,
        throughput: 2000 + Math.random() * 3000,
        errors: Math.random() > 0.98 ? prev.errors + 1 : prev.errors,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load demo data when table selected
  useEffect(() => {
    if (!selectedTable) { setData([]); return; }
    setLoading(true);
    setTimeout(() => {
      setData(generateDemoData(selectedTable, 15));
      setLoading(false);
    }, 400);
  }, [selectedTable]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="text-lg font-bold text-white">Pulsyn</span>
            </Link>
            <span className="text-gray-600 mx-2">|</span>
            <span className="text-gray-400 text-sm">Demo Lab</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-green-950/50 border border-green-800/50 rounded-full text-green-400 text-xs font-medium">
              Free Tier
            </span>
            <Link href="/pricing" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-sm font-medium transition-all">
              Upgrade
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Rows Synced', value: metrics.rowsSynced.toLocaleString(), icon: Activity, color: 'text-cyan-400' },
            { label: 'Latency', value: `${Math.round(metrics.latency)}ms`, icon: Clock, color: 'text-green-400' },
            { label: 'Throughput', value: `${Math.round(metrics.throughput).toLocaleString()}/s`, icon: Zap, color: 'text-blue-400' },
            { label: 'Errors', value: metrics.errors.toString(), icon: AlertCircle, color: metrics.errors > 0 ? 'text-red-400' : 'text-gray-500' },
          ].map(m => (
            <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <span className="text-xs text-gray-500 uppercase tracking-wider">{m.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar — Connectors */}
          <div className="col-span-3">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Connectors</h3>
              <div className="space-y-2">
                {DEMO_CONNECTORS.map(conn => (
                  <button
                    key={conn.id}
                    onClick={() => { setSelectedConnector(conn); setSelectedTable(''); }}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      selectedConnector.id === conn.id
                        ? 'bg-cyan-600/20 border border-cyan-500/30'
                        : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: conn.color + '20' }}>
                      <conn.icon className="w-4 h-4" style={{ color: conn.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{conn.name}</div>
                      <div className="text-xs text-gray-500">{conn.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Table Selector */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-400">Tables in {selectedConnector.name}</h3>
                <span className="text-xs text-gray-600">{selectedConnector.tables.length} tables</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedConnector.tables.map(table => (
                  <button
                    key={table}
                    onClick={() => setSelectedTable(table)}
                    className={`px-4 py-2 rounded-lg text-sm transition-all ${
                      selectedTable === table
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.1] hover:text-white'
                    }`}
                  >
                    {table}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Table */}
            {selectedTable ? (
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selectedTable}</h3>
                    <span className="text-xs text-gray-500">{data.length} rows • Live data</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                      <Download className="w-3 h-3" /> Export
                    </button>
                    <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs text-white transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Create Pipeline
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          {data.length > 0 && Object.keys(data[0]).map(key => (
                            <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((row, i) => (
                          <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            {Object.values(row).map((value, j) => (
                              <td key={j} className="px-4 py-3 text-sm text-gray-300">
                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col items-center justify-center h-96">
                <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Select a table to explore</h3>
                <p className="text-sm text-gray-500 max-w-md text-center">
                  Choose a connector and table above to see live data. This demo uses simulated data — sign up for real connectors.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
