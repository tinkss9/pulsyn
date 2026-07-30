'use client';

import { useEffect, useState, useCallback } from 'react';

interface ApiKey {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('pulsyn_user') || '{}');
      const id = userData.organizationId;
      if (!id) {
        setLoading(false);
        return;
      }
      setOrgId(id);

      const res = await fetch(`/api/auth/keys/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.data || []);
      }
    } catch {
      // Silently fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim() || !orgId) return;

    try {
      const res = await fetch('/api/auth/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId, name: newKeyName }),
      });

      if (res.ok) {
        const data = await res.json();
        setNewKey(data.data.apiKey);
        setNewKeyName('');
        setShowNew(false);
        loadKeys();
      }
    } catch {
      // Handle error
    }
  };

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Revoke this API key? Any integrations using it will stop working.')) return;

    try {
      const res = await fetch(`/api/auth/keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadKeys();
      }
    } catch {
      // Handle error
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-gray-400 mt-1">Manage your API keys for authentication</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Create API Key
        </button>
      </div>

      {/* New key display */}
      {newKey && (
        <div className="bg-amber-950/30 border border-amber-800 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-sm font-medium mb-2">New API key created — save it now</p>
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <code className="text-green-400 text-sm break-all font-mono">{newKey}</code>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(newKey)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Copy
            </button>
            <button
              onClick={() => setNewKey(null)}
              className="text-gray-400 hover:text-white px-3 py-1.5 text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-pulsyn-300">
          <strong>How to use:</strong> Pass your API key in the <code className="bg-gray-800 px-1.5 py-0.5 rounded">Authorization</code> header:{' '}
          <code className="bg-gray-800 px-1.5 py-0.5 rounded">Bearer YOUR_API_KEY</code>
        </p>
      </div>

      {/* Create form */}
      {showNew && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New API Key</h2>
          <div className="flex gap-4">
            <input
              placeholder="Key name (e.g., Production, CI/CD)"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-pulsyn-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNew(false); setNewKeyName(''); }}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : apiKeys.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔑</div>
          <h2 className="text-lg font-semibold mb-2">No API keys</h2>
          <p className="text-gray-400 mb-6">Create an API key to authenticate with the Pulsyn API.</p>
          <button
            onClick={() => setShowNew(true)}
            className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
          >
            Create API Key
          </button>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Name</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Status</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Created</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Last Used</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => (
                <tr key={key.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-6 py-4 font-medium">{key.name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${key.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                      {key.is_active ? 'Active' : 'Revoked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {key.is_active && (
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
