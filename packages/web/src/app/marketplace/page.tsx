'use client';

import { useEffect, useRef, useState } from 'react';

export default function MarketplacePage() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Cancel any in-flight request before starting a new one
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (category) params.set('category', category);

    fetch(`/api/marketplace?${params}`, { signal: controller.signal })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setConnectors(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [debouncedSearch, category]);

  const handleInstall = async (id: string) => {
    const token = localStorage.getItem('pulsyn_api_key');
    if (!token) {
      alert('Please sign in first');
      return;
    }
    const res = await fetch(`/api/marketplace/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': token },
      body: JSON.stringify({ organizationId: 'default' }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Installed! ${data.data.message}`);
      // Refresh to update download count
      setConnectors(prev => prev.map(c => c.id === id ? { ...c, download_count: (c.download_count || 0) + 1 } : c));
    } else {
      alert(data.error || 'Installation failed');
    }
  };

  const categories = [
    'all', 'forex', 'crypto', 'finance', 'database', 'saas', 'payments',
    'analytics', 'healthcare', 'fintech', 'education', 'government', 'logistics', 'travel', 'general',
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connector Marketplace</h1>
          <p className="text-gray-400">52 connectors across 6 categories. 4 certified, 8 verified, 40 preview.</p>
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
            value={category || 'all'}
            onChange={e => setCategory(e.target.value === 'all' ? '' : e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Result count */}
        <p className="text-sm text-gray-500 mb-4">
          {loading ? 'Loading...' : `${connectors.length} connector${connectors.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-900 rounded-lg p-5 border border-gray-800 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-800 rounded w-full mb-2" />
                <div className="h-3 bg-gray-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : connectors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No connectors found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
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
                  <span>{Number(conn.download_count || 0).toLocaleString()} installs</span>
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
