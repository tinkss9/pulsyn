'use client';

import { useEffect, useState } from 'react';

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', engine: 'postgresql', host: '', port: '5432', database: '', user: '', password: '' });

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    fetch(`${API_URL}/api/connectors`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setConnectors(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    const res = await fetch(`${API_URL}/api/connectors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: form.name,
        engine: form.engine,
        config: { host: form.host, port: parseInt(form.port), database: form.database, user: form.user, password: form.password },
      }),
    });
    const data = await res.json();
    setConnectors([...connectors, data.data]);
    setShowCreate(false);
    setForm({ name: '', engine: 'postgresql', host: '', port: '5432', database: '', user: '', password: '' });
  };

  const handleTest = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    const res = await fetch(`${API_URL}/api/connectors/${id}/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    alert(data.data?.status === 'connected' ? `Connected (${data.data.latency}ms)` : 'Connection failed');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this connector?')) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    await fetch(`${API_URL}/api/connectors/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setConnectors(connectors.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Connectors</h1>
          <p className="text-gray-400 mt-1">Manage your database connections</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Add Connector
        </button>
      </div>

      {showCreate && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">New Connector</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500" required />
            <select value={form.engine} onChange={e => setForm({...form, engine: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pulsyn-500">
              <option value="postgresql">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="oracle">Oracle</option>
              <option value="sqlserver">SQL Server</option>
              <option value="mongodb">MongoDB</option>
            </select>
            <input placeholder="Host" value={form.host} onChange={e => setForm({...form, host: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500" required />
            <input placeholder="Port" value={form.port} onChange={e => setForm({...form, port: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500" required />
            <input placeholder="Database" value={form.database} onChange={e => setForm({...form, database: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500" required />
            <input placeholder="User" value={form.user} onChange={e => setForm({...form, user: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500" required />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500" required />
            <div className="flex gap-2">
              <button type="submit" className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : connectors.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔌</div>
          <h2 className="text-lg font-semibold mb-2">No connectors yet</h2>
          <p className="text-gray-400 mb-6">Add a database connector to get started.</p>
          <button onClick={() => setShowCreate(true)} className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Add Connector</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map((connector) => (
            <div key={connector.id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{connector.name}</h3>
                  <p className="text-sm text-gray-500">{connector.engine}</p>
                </div>
                <span className={`w-2 h-2 rounded-full ${connector.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
              <div className="text-sm text-gray-400 mb-4">ID: {connector.id}</div>
              <div className="flex gap-2">
                <button onClick={() => handleTest(connector.id)} className="text-sm text-pulsyn-400 hover:text-pulsyn-300">Test</button>
                <button onClick={() => handleDelete(connector.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
