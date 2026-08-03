'use client';

import { useEffect, useState } from 'react';

export default function MarketplacePage() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (category) params.set('category', category);

    fetch(`/api/marketplace?${params}`)
      .then(r => r.json())
      .then(data => setConnectors(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category]);

  const handleInstall = async (id: string) => {
    const token = localStorage.getItem('pulsyn_api_key');
    if (!token) {
      alert('Please sign in first');
      return;
    }
    const res = await fetch(`/api/marketplace/${id}/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': token },
      body: JSON.stringify({ organizationId: 'default' }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Installed! ${data.data.message}`);
    } else {
      alert(data.error);
    }
  };

  const categories = ['all', 'forex', 'crypto', 'finance', 'database', 'saas', 'general'];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connector Marketplace</h1>
          <p className="text-gray-400">763+ pre-built connectors. Install in one click.</p>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search connectors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value === 'all' ? '' : e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading connectors...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map(conn => (
              <div key={conn.id} className="bg-gray-900 rounded-lg p-5 border border-gray-800 hover:border-gray-600 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{conn.name}</h3>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{conn.category}</span>
                  </div>
                  {conn.is_verified && (
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-0.5 rounded">Verified</span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{conn.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{conn.engine}</span>
                  <span>{conn.download_count?.toLocaleString()} installs</span>
                  <span>{conn.avg_rating > 0 ? `${Number(conn.avg_rating).toFixed(1)} ★` : 'No ratings'}</span>
                </div>
                <button
                  onClick={() => handleInstall(conn.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  Install
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
