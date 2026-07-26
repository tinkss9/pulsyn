import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn vs Fivetran — Real-time CDC vs Batch ETL',
  description: 'Compare Pulsyn vs Fivetran for data replication. Pulsyn offers real-time CDC with sub-second latency at 75% lower cost. No batch sync delays.',
  openGraph: {
    title: 'Pulsyn vs Fivetran — Real-time CDC vs Batch ETL',
    description: 'Compare Pulsyn vs Fivetran for data replication. Pulsyn offers real-time CDC with sub-second latency at 75% lower cost.',
  },
};

const COMPARISON = [
  { feature: 'Sync Type', pulsyn: 'Real-time (sub-second)', fivetran: 'Batch (15-min minimum)', winner: 'pulsyn' },
  { feature: 'Latency', pulsyn: '< 1 second', fivetran: '15+ minutes', winner: 'pulsyn' },
  { feature: 'Pricing Model', pulsyn: 'Flat monthly tier', fivetran: 'MAR-based (unpredictable)', winner: 'pulsyn' },
  { feature: 'Starting Price', pulsyn: '$0 (Community)', fivetran: '$0 (limited)', winner: 'tie' },
  { feature: 'Pro Plan', pulsyn: '$499/mo flat', fivetran: '$500-2,000+/mo (usage-based)', winner: 'pulsyn' },
  { feature: 'CLI Access', pulsyn: 'Yes (35+ commands)', fivetran: 'No', winner: 'pulsyn' },
  { feature: 'MCP Server', pulsyn: 'Yes (26 tools)', fivetran: 'No', winner: 'pulsyn' },
  { feature: 'API-First', pulsyn: 'Yes (REST + OpenAPI)', fivetran: 'Limited', winner: 'pulsyn' },
  { feature: 'Self-Hosted', pulsyn: 'Yes', fivetran: 'No (cloud only)', winner: 'pulsyn' },
  { feature: 'Connectors', pulsyn: 'PostgreSQL, MySQL, Oracle, SQL Server, MongoDB', fivetran: '700+ (mostly SaaS)', winner: 'fivetran' },
  { feature: 'Kafka Dependency', pulsyn: 'None', fivetran: 'None', winner: 'tie' },
  { feature: 'Checkpoint Recovery', pulsyn: 'Yes', fivetran: 'Yes', winner: 'tie' },
];

export default function FivetranComparison() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-pulsyn-500">Pulsyn</Link>
          <Link href="/signup" className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Start Free Trial
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full px-4 py-1.5 mb-6">
            <span className="text-pulsyn-400 text-sm font-medium">Comparison</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Pulsyn vs Fivetran
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Fivetran is a batch ETL tool. Pulsyn is a real-time CDC platform. 
            If you need sub-second latency, Pulsyn is the clear choice.
          </p>
        </div>
      </section>

      {/* Quick Verdict */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-pulsyn-950/30 border border-pulsyn-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Quick Verdict</h2>
            <p className="text-gray-300 text-lg mb-4">
              <strong>Choose Fivetran</strong> if you need 700+ SaaS connectors and batch sync is acceptable.
            </p>
            <p className="text-gray-300 text-lg mb-4">
              <strong>Choose Pulsyn</strong> if you need real-time database replication with sub-second latency, 
              want API/CLI/MCP access, or need self-hosted deployment.
            </p>
            <p className="text-gray-300 text-lg">
              <strong>Cost savings:</strong> Pulsyn Pro ($499/mo) vs Fivetran equivalent ($500-2,000+/mo) 
              = <strong>up to 75% savings</strong> with better latency.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Feature-by-Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-left py-4 px-4 text-pulsyn-400 font-medium">Pulsyn</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Fivetran</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-800/50">
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className={`py-4 px-4 ${row.winner === 'pulsyn' ? 'text-green-400' : 'text-gray-300'}`}>
                      {row.pulsyn}
                    </td>
                    <td className={`py-4 px-4 ${row.winner === 'fivetran' ? 'text-green-400' : 'text-gray-300'}`}>
                      {row.fivetran}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for real-time CDC?</h2>
          <p className="text-gray-400 text-lg mb-8">
            Get real-time CDC with sub-second latency at a fraction of the cost.
          </p>
          <Link href="/signup" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-xs">
            Disclaimer: This comparison is based on publicly available information as of July 2026. 
            Competitor features and pricing may change. All trademarks are the property of their respective owners. 
            This page is for informational purposes only and does not constitute an endorsement or guarantee of any product.
          </p>
        </div>
      </section>
    </main>
  );
}
