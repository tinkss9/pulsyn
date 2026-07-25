import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Data Pipelines with CDC — Pulsyn',
  description: 'Keep your AI agents and ML models fed with fresh data. Pulsyn streams database changes to vector stores, feature stores, and model pipelines in real-time.',
};

export default function AIDataPipeline() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-pulsyn-500">Pulsyn</Link>
          <Link href="/signup" className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Start Free Trial</Link>
        </div>
      </header>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Data Pipelines with CDC</h1>
          <p className="text-xl text-gray-400 mb-8">
            AI agents and ML models are only as good as their data. 
            Pulsyn keeps your AI infrastructure fed with fresh, real-time data from your production databases.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">RAG Pipelines</h3>
              <p className="text-gray-400 text-sm">Keep vector embeddings in sync with source data. When your docs change, your RAG pipeline knows instantly.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">Feature Stores</h3>
              <p className="text-gray-400 text-sm">Stream database changes to your feature store for real-time ML inference. No more stale features.</p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">AI Agent Context</h3>
              <p className="text-gray-400 text-sm">Pulsyn's MCP server gives AI agents direct access to pipeline data. 26 tools for Claude, Cursor, and more.</p>
            </div>
          </div>

          <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Why Pulsyn for AI</h2>
            <ul className="space-y-4 text-gray-300">
              <li className="flex gap-3">
                <span className="text-pulsyn-400">✓</span>
                <span><strong>MCP Server:</strong> 26 tools for AI agents to manage pipelines, query data, and monitor health</span>
              </li>
              <li className="flex gap-3">
                <span className="text-pulsyn-400">✓</span>
                <span><strong>Real-time:</strong> Sub-second latency keeps AI context fresh</span>
              </li>
              <li className="flex gap-3">
                <span className="text-pulsyn-400">✓</span>
                <span><strong>API-First:</strong> REST API with OpenAPI spec for programmatic access</span>
              </li>
              <li className="flex gap-3">
                <span className="text-pulsyn-400">✓</span>
                <span><strong>In-flight Masking:</strong> Mask PII before it reaches your AI models</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Power your AI with real-time data</h2>
          <Link href="/signup" className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">Start Free Trial</Link>
        </div>
      </section>
    </main>
  );
}
