'use client';

import { useState } from 'react';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; created: string; lastUsed: string }>>([]);
  const [showNew, setShowNew] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: `pk_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      created: new Date().toISOString(),
      lastUsed: 'Never',
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNew(false);
  };

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this API key? Any integrations using it will stop working.')) return;
    setApiKeys(apiKeys.filter(k => k.id !== id));
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
            />
            <button
              onClick={handleCreate}
              className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {apiKeys.length === 0 ? (
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
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Key</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Created</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Last Used</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-6 py-4 font-medium">{apiKey.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-800 px-2 py-1 rounded">
                        {apiKey.key.slice(0, 12)}...{apiKey.key.slice(-4)}
                      </code>
                      <button
                        onClick={() => handleCopy(apiKey.id, apiKey.key)}
                        className="text-sm text-pulsyn-400 hover:text-pulsyn-300"
                      >
                        {copiedId === apiKey.id ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(apiKey.created).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {apiKey.lastUsed}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
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
