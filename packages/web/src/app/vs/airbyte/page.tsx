import Link from 'next/link';
import Header from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn vs Airbyte — Real-time CDC vs Open-source ETL',
  description: 'Compare Pulsyn vs Airbyte for data replication. Pulsyn offers real-time CDC with MCP server for AI agents. Airbyte is batch-focused open-source ETL.',
};

const COMPARISON = [
  { feature: 'Sync Type', pulsyn: 'Real-time (sub-second)', airbyte: 'Batch (5-60 min)', winner: 'pulsyn' },
  { feature: 'Latency', pulsyn: '< 1 second', airbyte: '5-60 minutes', winner: 'pulsyn' },
  { feature: 'AI Agent Integration', pulsyn: 'MCP server (26 tools)', airbyte: 'None', winner: 'pulsyn' },
  { feature: 'Pricing', pulsyn: '$0-2,000/mo flat', airbyte: '$0-500/mo + usage', winner: 'pulsyn' },
  { feature: 'Self-Hosted', pulsyn: 'Yes', airbyte: 'Yes (open-source)', winner: 'tie' },
  { feature: 'CLI', pulsyn: '35+ commands', airbyte: 'Limited', winner: 'pulsyn' },
  { feature: 'Connectors', pulsyn: '5 databases (deep)', airbyte: '300+ (broad)', winner: 'airbyte' },
  { feature: 'CDC Engine', pulsyn: 'Native log-based', airbyte: 'Debezium-based', winner: 'pulsyn' },
  { feature: 'Checkpoint Recovery', pulsyn: 'Yes', airbyte: 'Yes', winner: 'tie' },
  { feature: 'Data Masking', pulsyn: 'In-flight', airbyte: 'Post-sync only', winner: 'pulsyn' },
];

export default function AirbyteComparison() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-pulsyn-400 text-sm font-medium">Comparison</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Pulsyn vs Airbyte</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Airbyte is open-source batch ETL. Pulsyn is real-time CDC with AI agent integration. 
            Different tools for different needs.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Quick Verdict</h2>
            <p className="text-gray-300 text-lg mb-4">
              <strong>Choose Airbyte</strong> if you need 300+ connectors for SaaS apps and batch sync is fine.
            </p>
            <p className="text-gray-300 text-lg mb-4">
              <strong>Choose Pulsyn</strong> if you need real-time database CDC, AI agent integration via MCP, 
              or sub-second latency for operational systems.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Feature-by-Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-left py-4 px-4 text-pulsyn-400 font-medium">Pulsyn</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Airbyte</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-800/50">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className={`py-4 px-4 ${row.winner === 'pulsyn' ? 'text-green-400' : 'text-gray-300'}`}>{row.pulsyn}</td>
                    <td className={`py-4 px-4 ${row.winner === 'airbyte' ? 'text-green-400' : 'text-gray-300'}`}>{row.airbyte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Need real-time CDC?</h2>
          <p className="text-gray-400 text-lg mb-8">Pulsyn delivers sub-second latency that Airbyte can't match.</p>
          <Link href="/signup" className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">Start Free Trial</Link>
        </div>
      </section>
    </main>
  );
}


