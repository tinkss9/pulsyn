'use client';

import { useEffect, useState } from 'react';

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');

    fetch(`${API_URL}/api/pipelines`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setPipelines(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    await fetch(`${API_URL}/api/pipelines/${id}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    // Refresh
    window.location.reload();
  };

  const handleStop = async (id: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    await fetch(`${API_URL}/api/pipelines/${id}/stop`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this pipeline?')) return;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const token = localStorage.getItem('pulsyn_api_key');
    await fetch(`${API_URL}/api/pipelines/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPipelines(pipelines.filter(p => p.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Pipelines</h1>
          <p className="text-gray-400 mt-1">Manage your CDC replication pipelines</p>
        </div>
        <button className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Create Pipeline
        </button>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : pipelines.length === 0 ? (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔄</div>
          <h2 className="text-lg font-semibold mb-2">No pipelines yet</h2>
          <p className="text-gray-400 mb-6">Create your first pipeline to start replicating data.</p>
          <button className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Create Pipeline
          </button>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Name</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Status</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Rows/s</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Lag</th>
                <th className="text-left text-sm font-medium text-gray-400 px-6 py-3">Errors</th>
                <th className="text-right text-sm font-medium text-gray-400 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pipelines.map((pipeline) => (
                <tr key={pipeline.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-6 py-4">
                    <div className="font-medium">{pipeline.config?.name || pipeline.id}</div>
                    <div className="text-sm text-gray-500">{pipeline.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={pipeline.status} />
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {(pipeline.stats?.rowsPerSecond || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {pipeline.stats?.lagMs || 0}ms
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={pipeline.stats?.errors > 0 ? 'text-red-400' : 'text-gray-400'}>
                      {pipeline.stats?.errors || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {pipeline.status === 'running' ? (
                        <button
                          onClick={() => handleStop(pipeline.id)}
                          className="text-sm text-yellow-400 hover:text-yellow-300"
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStart(pipeline.id)}
                          className="text-sm text-green-400 hover:text-green-300"
                        >
                          Start
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(pipeline.id)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: 'bg-green-950/50 text-green-400 border-green-800',
    idle: 'bg-gray-900/50 text-gray-400 border-gray-700',
    paused: 'bg-yellow-950/50 text-yellow-400 border-yellow-800',
    error: 'bg-red-950/50 text-red-400 border-red-800',
    recovering: 'bg-blue-950/50 text-blue-400 border-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      colors[status] || colors.idle
    }`}>
      {status}
    </span>
  );
}
