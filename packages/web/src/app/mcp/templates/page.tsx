'use client';

import { useEffect, useState } from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  sourceEngine: string;
  tables: string[];
}

export default function McpTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/mcp/templates')
      .then(r => r.json())
      .then(data => setTemplates(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDeploy = async (templateId: string) => {
    const token = localStorage.getItem('pulsyn_api_key');
    if (!token) {
      alert('Please sign in first');
      return;
    }

    setDeploying(templateId);
    try {
      const res = await fetch('/api/mcp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': token },
        body: JSON.stringify({ templateId, organizationId: 'default' }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Deployed! Pipeline: ${data.data.pipelineId}\n${data.data.message}`);
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeploying(null);
    }
  };

  const engineIcons: Record<string, string> = {
    'cmc-markets': '📊',
    'oanda': '💱',
    'polygon-io': '📈',
    'dexscreener': '🪙',
    'binance': '₿',
    'alpha-vantage': '📉',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">MCP Templates</h1>
          <p className="text-gray-400">
            Pre-built forex & crypto data pipelines. Deploy via API, MCP, or this dashboard.
            AI agents can deploy these with a single <code className="bg-gray-800 px-1 rounded">mcp.createPipeline</code> call.
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
          <h3 className="font-semibold mb-2">How AI agents use these templates:</h3>
          <pre className="text-sm text-green-400 bg-gray-950 p-3 rounded overflow-x-auto">
{`// MCP tool call from any AI agent (Claude, Cursor, Copilot)
mcp.call("pulsyn_create_pipeline", {
  template: "cmc-to-postgres",
  sourceApiKey: "your-cmc-api-key",
  target: { host: "your-db.host", database: "forex_data" }
})
// Pipeline created, CDC ready to start`}
          </pre>
        </div>

        {loading ? (
          <div className="text-gray-400">Loading templates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(t => (
              <div key={t.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-blue-600 transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{engineIcons[t.sourceEngine] || '🔗'}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{t.name}</h3>
                    <span className="text-xs text-gray-400">{t.sourceEngine}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">{t.description}</p>
                <div className="mb-4">
                  <h4 className="text-xs text-gray-500 mb-1">Tables:</h4>
                  <div className="flex flex-wrap gap-1">
                    {t.tables.map(table => (
                      <span key={table} className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">{table}</span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeploy(t.id)}
                  disabled={deploying === t.id}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium transition"
                >
                  {deploying === t.id ? 'Deploying...' : 'Deploy Template'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
