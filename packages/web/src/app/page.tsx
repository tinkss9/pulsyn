export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-blue-500">Pulsyn</h1>
          <p className="text-gray-400 mt-2">The AI-Native CDC Platform</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Active Pipelines" value="0" status="idle" />
          <StatCard title="Rows/Second" value="0" status="idle" />
          <StatCard title="Total Rows" value="0" status="idle" />
          <StatCard title="Errors" value="0" status="idle" />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
              Create Pipeline
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              Add Connector
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
              View Documentation
            </button>
          </div>
        </div>

        {/* Pipeline List */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Pipelines</h2>
          <div className="text-gray-400">
            No pipelines yet. Create your first pipeline to get started.
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value, status }: { title: string; value: string; status: string }) {
  const statusColors: Record<string, string> = {
    running: 'text-green-500',
    paused: 'text-yellow-500',
    error: 'text-red-500',
    idle: 'text-gray-400',
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="text-sm text-gray-400">{title}</div>
      <div className={`text-2xl font-bold ${statusColors[status]}`}>{value}</div>
    </div>
  );
}
