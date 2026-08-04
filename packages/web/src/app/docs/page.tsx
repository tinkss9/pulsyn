import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cyan-400">Pulsyn</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white">Pricing</Link>
            <Link href="/marketplace" className="text-sm text-gray-400 hover:text-white">Marketplace</Link>
            <Link href="/docs" className="text-sm text-cyan-400">Docs</Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-8">Documentation</h1>

          <div className="space-y-8">
            {/* Quick Start */}
            <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Quick Start</h2>
              <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm">
                <p className="text-gray-400"># Install</p>
                <p className="text-green-400">docker pull pulsyn/pulsyn:latest</p>
                <p className="text-gray-400 mt-2"># Run</p>
                <p className="text-green-400">docker run -d -p 8080:8080 pulsyn/pulsyn</p>
                <p className="text-gray-400 mt-2"># Open</p>
                <p className="text-green-400">open http://localhost:8080</p>
              </div>
            </section>

            {/* CLI */}
            <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">CLI</h2>
              <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm space-y-2">
                <p><span className="text-yellow-400">pulsyn pipeline create</span> <span className="text-gray-400">--name my-pipeline --source-host ... --target-host ...</span></p>
                <p><span className="text-yellow-400">pulsyn pipeline start</span> <span className="text-gray-400">&lt;pipeline-id&gt;</span></p>
                <p><span className="text-yellow-400">pulsyn connector list</span> <span className="text-gray-400">--status connected</span></p>
                <p><span className="text-yellow-400">pulsyn benchmark run</span> <span className="text-gray-400">--source-engine postgresql --target-engine mysql</span></p>
                <p><span className="text-yellow-400">pulsyn health</span></p>
              </div>
            </section>

            {/* API */}
            <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">API</h2>
              <p className="text-gray-300 mb-4">All endpoints require an API key via <code className="bg-gray-800 px-2 py-1 rounded text-sm">x-api-key</code> or <code className="bg-gray-800 px-2 py-1 rounded text-sm">Authorization: Bearer</code> header.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">GET</span>
                  <code className="text-sm">/api/health</code>
                  <span className="text-gray-500 text-sm">— Server health check</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">POST</span>
                  <code className="text-sm">/api/connectors</code>
                  <span className="text-gray-500 text-sm">— Create a connector</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">POST</span>
                  <code className="text-sm">/api/pipelines</code>
                  <span className="text-gray-500 text-sm">— Create a pipeline</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">POST</span>
                  <code className="text-sm">/api/cdc/start</code>
                  <span className="text-gray-500 text-sm">— Start CDC replication</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">POST</span>
                  <code className="text-sm">/api/ai/chat</code>
                  <span className="text-gray-500 text-sm">— AI chat (SSE streaming)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">GET</span>
                  <code className="text-sm">/api/ai/learn</code>
                  <span className="text-gray-500 text-sm">— AI insights & anomalies</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">GET</span>
                  <code className="text-sm">/api/ai/predict</code>
                  <span className="text-gray-500 text-sm">— AI predictions</span>
                </div>
              </div>
            </section>

            {/* MCP */}
            <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">MCP Server</h2>
              <p className="text-gray-300 mb-4">26 tools for AI agent integration. Available on Pro plan ($499/mo) and above.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['pulsyn_connect', 'pulsyn_disconnect', 'pulsyn_test_connection', 'pulsyn_discover_tables', 'pulsyn_discover_schema', 'pulsyn_create_pipeline', 'pulsyn_start_pipeline', 'pulsyn_stop_pipeline', 'pulsyn_pipeline_metrics', 'pulsyn_run_benchmark', 'pulsyn_list_connectors', 'pulsyn_list_pipelines'].map((tool) => (
                  <div key={tool} className="bg-gray-950 rounded-lg px-3 py-2">
                    <code className="text-sm text-cyan-300">{tool}</code>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-4">+ 14 more tools for masking, checkpoints, marketplace, and AI integration.</p>
            </section>

            {/* Pricing */}
            <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Pricing</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-950 rounded-lg p-4">
                  <h3 className="font-semibold text-white">Community — Free</h3>
                  <p className="text-gray-400 text-sm mt-1">3 connectors, CLI, self-hosted</p>
                </div>
                <div className="bg-gray-950 rounded-lg p-4 border border-cyan-500/30">
                  <h3 className="font-semibold text-cyan-400">Pro — $499/mo</h3>
                  <p className="text-gray-400 text-sm mt-1">All connectors, API, MCP, masking</p>
                </div>
                <div className="bg-gray-950 rounded-lg p-4">
                  <h3 className="font-semibold text-white">Business — $3,500/mo</h3>
                  <p className="text-gray-400 text-sm mt-1">SLA, priority support, enterprise features</p>
                </div>
                <div className="bg-gray-950 rounded-lg p-4">
                  <h3 className="font-semibold text-white">Enterprise — Custom</h3>
                  <p className="text-gray-400 text-sm mt-1">Air-gapped, dedicated support, custom connectors</p>
                </div>
              </div>
            </section>

            {/* GitHub */}
            <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Source Code</h2>
              <p className="text-gray-300 mb-4">Pulsyn is open-source (Apache 2.0 for core engine).</p>
              <a href="https://github.com/tinkss9/pulsyn" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                View on GitHub
              </a>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
