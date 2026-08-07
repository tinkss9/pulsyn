import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connector Certification | Pulsyn',
  description: 'Pulsyn connector certification methodology and status. Learn how we ensure connector quality and reliability.',
};

// Certification data (from cert-matrix.json)
const certificationStats = {
  totalConnectors: 1533,
  certifiedConnectors: 1490,
  liveTestedConnectors: 304,
  databaseConnectors: 57,
  saasConnectors: 1476,
  lastUpdated: '2026-08-07',
};

const certificationLevels = [
  {
    level: 1,
    name: 'Code Structure',
    description: 'Connector implements required interface methods and follows our connector specification.',
    criteria: 'All required methods present, proper error handling, type safety.',
    icon: '🔍',
  },
  {
    level: 2,
    name: 'Mock Testing',
    description: 'Connector correctly handles API responses, pagination, and error scenarios.',
    criteria: 'Passes all mock server tests, handles edge cases gracefully.',
    icon: '🧪',
  },
  {
    level: 3,
    name: 'Live API Testing',
    description: 'Connector successfully connects to real APIs and extracts data.',
    criteria: 'Connects, authenticates, and extracts data from live endpoints.',
    icon: '✅',
  },
  {
    level: 4,
    name: 'Production Database',
    description: 'Full CRUD operations, CDC support, and schema discovery verified.',
    criteria: 'Complete database lifecycle testing with real instances.',
    icon: '🗄️',
  },
];

const tierCriteria = [
  {
    tier: 'Tier 1',
    name: 'Critical',
    passRate: '≥95%',
    latency: '≤500ms',
    throughput: '≥100 rows/sec',
    errorRate: '≤0.1%',
    examples: 'PostgreSQL, MySQL, MongoDB, Salesforce, Stripe',
  },
  {
    tier: 'Tier 2',
    name: 'Important',
    passRate: '≥90%',
    latency: '≤1000ms',
    throughput: '≥50 rows/sec',
    errorRate: '≤1.0%',
    examples: 'Snowflake, BigQuery, Slack, Jira, HubSpot',
  },
  {
    tier: 'Tier 3',
    name: 'Standard',
    passRate: '≥80%',
    latency: '≤2000ms',
    throughput: '≥10 rows/sec',
    errorRate: '≤5.0%',
    examples: 'Community APIs, specialized connectors',
  },
];

export default function CertificationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Connector Certification
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            We rigorously test every connector to ensure reliability, performance, and security.
            Our certification process verifies that connectors work correctly in production environments.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-3xl font-bold text-cyan-400">{certificationStats.certifiedConnectors.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Certified Connectors</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-3xl font-bold text-green-400">{certificationStats.liveTestedConnectors.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Live Tested</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-3xl font-bold text-purple-400">{certificationStats.databaseConnectors}</div>
              <div className="text-sm text-gray-400">Database Connectors</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-3xl font-bold text-orange-400">{certificationStats.totalConnectors.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Connectors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Levels */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Certification Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {certificationLevels.map((level) => (
              <div key={level.level} className="p-6 rounded-xl border border-white/10 bg-white/5">
                <div className="text-4xl mb-4">{level.icon}</div>
                <h3 className="text-xl font-semibold mb-2">Level {level.level}: {level.name}</h3>
                <p className="text-gray-400 mb-4">{level.description}</p>
                <div className="text-sm text-cyan-400">{level.criteria}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier Criteria */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Quality Tiers</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4">Tier</th>
                  <th className="text-left py-4 px-4">Pass Rate</th>
                  <th className="text-left py-4 px-4">Latency p99</th>
                  <th className="text-left py-4 px-4">Throughput</th>
                  <th className="text-left py-4 px-4">Error Rate</th>
                  <th className="text-left py-4 px-4">Examples</th>
                </tr>
              </thead>
              <tbody>
                {tierCriteria.map((tier) => (
                  <tr key={tier.tier} className="border-b border-white/5">
                    <td className="py-4 px-4">
                      <span className="font-semibold text-cyan-400">{tier.tier}</span>
                      <span className="text-gray-400 ml-2">({tier.name})</span>
                    </td>
                    <td className="py-4 px-4 text-green-400">{tier.passRate}</td>
                    <td className="py-4 px-4">{tier.latency}</td>
                    <td className="py-4 px-4">{tier.throughput}</td>
                    <td className="py-4 px-4">{tier.errorRate}</td>
                    <td className="py-4 px-4 text-gray-400">{tier.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Methodology</h2>
          <div className="space-y-8">
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold mb-4">🔍 Static Analysis</h3>
              <p className="text-gray-400">
                Every connector undergoes static analysis to verify it implements the required interface methods,
                follows our connector specification, and includes proper error handling and type safety.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold mb-4">🧪 Mock Testing</h3>
              <p className="text-gray-400">
                Connectors are tested against mock API endpoints that simulate real-world responses,
                including pagination, error scenarios, and edge cases. This verifies the connector&apos;s
                logic without requiring live API credentials.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold mb-4">✅ Live API Testing</h3>
              <p className="text-gray-400">
                For connectors with free tiers or public APIs, we perform live testing against real endpoints.
                This verifies that the connector works correctly in production-like conditions.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <h3 className="text-xl font-semibold mb-4">🗄️ Database Testing</h3>
              <p className="text-gray-400">
                Database connectors are tested against real database instances running in Docker containers.
                This includes full CRUD operations, CDC support, schema discovery, and performance benchmarking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Continuous Improvement */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Continuous Improvement</h2>
          <p className="text-gray-400 mb-8">
            Our certification process is continuously improved based on real-world usage data,
            customer feedback, and industry best practices. We regularly re-certify connectors
            to ensure they remain reliable as APIs evolve.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold">Automated Re-certification</div>
              <div className="text-sm text-gray-400">Connectors are re-tested on code changes</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Performance Monitoring</div>
              <div className="text-sm text-gray-400">Production connectors are continuously monitored</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-semibold">Failure Alerting</div>
              <div className="text-sm text-gray-400">Issues trigger automatic notifications</div>
            </div>
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-8 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center text-gray-500 text-sm">
          Last updated: {certificationStats.lastUpdated} · Certification data is refreshed continuously
        </div>
      </section>
    </main>
  );
}
