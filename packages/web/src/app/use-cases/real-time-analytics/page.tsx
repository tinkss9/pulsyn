import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real-time Analytics with CDC — Pulsyn',
  description: 'Build real-time analytics dashboards with change data capture. Stream database changes to Snowflake, BigQuery, or ClickHouse with sub-second latency.',
};

export default function RealTimeAnalytics() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Real-time Analytics with CDC</h1>
          <p className="text-xl text-gray-400 mb-8">
            Your analytics dashboards are only as fresh as your data pipeline. 
            With Pulsyn, database changes flow to your warehouse in sub-second — not 15-minute batch intervals.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">The Problem</h2>
              <ul className="space-y-3 text-gray-300">
                <li>• Batch ETL tools sync every 15-60 minutes</li>
                <li>• Dashboards show stale data</li>
                <li>• Decisions made on hour-old information</li>
                <li>• Real-time requires complex Kafka setup</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-green-900/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-400">Pulsyn Solution</h2>
              <ul className="space-y-3 text-gray-300">
                <li>• Log-based CDC with sub-second latency</li>
                <li>• Changes appear in warehouse instantly</li>
                <li>• Dashboards always show current data</li>
                <li>• No Kafka dependency — simple setup</li>
              </ul>
            </div>
          </div>

          <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <ol className="space-y-4 text-gray-300">
              <li className="flex gap-4">
                <span className="text-pulsyn-400 font-bold">1.</span>
                <span>Connect Pulsyn to your PostgreSQL or MySQL source database</span>
              </li>
              <li className="flex gap-4">
                <span className="text-pulsyn-400 font-bold">2.</span>
                <span>Configure your data warehouse (Snowflake, BigQuery, ClickHouse) as the target</span>
              </li>
              <li className="flex gap-4">
                <span className="text-pulsyn-400 font-bold">3.</span>
                <span>Pulsyn streams changes via logical replication — no polling, no batch jobs</span>
              </li>
              <li className="flex gap-4">
                <span className="text-pulsyn-400 font-bold">4.</span>
                <span>Your dashboards refresh with sub-second-old data</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for real-time analytics?</h2>
          <Link href="/signup" className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">Start Free Trial</Link>
        </div>
      </section>
    </main>
  );
}
