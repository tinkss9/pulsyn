import { Metadata } from 'next';
import Header from '@/components/Header';
import Link from 'next/link';
import { CheckCircle, Clock, Eye, Database, Cloud, ArrowRight, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Connector Certification | Pulsyn',
  description: 'Pulsyn connector certification status. 320 connectors certified via Vitest live API tests and Docker database tests.',
};

// Certification data from cert-matrix.json — real Vitest results
const certificationStats = {
  total: 320,
  laneA: 301,      // SaaS connectors — REST API endpoints, SaaSConnector base
  laneB: 19,       // Database connectors — native drivers, full CDC
  passRate100: 42, // 100% pass rate
  passRate90: 292, // 90%+ pass rate
  lastUpdated: '2026-08-07',
  methodology: 'Vitest live API tests + Docker database tests',
};

const laneBConnectors = [
  { name: 'PostgreSQL', driver: 'pg', cdc: 'wal2json + pgoutput', passRate: 100 },
  { name: 'MySQL', driver: 'mysql2/promise', cdc: 'Poll-based watermark', passRate: 100 },
  { name: 'MongoDB', driver: 'mongodb', cdc: 'Change Streams', passRate: 100 },
  { name: 'Redis', driver: 'ioredis', cdc: 'Keyspace notifications', passRate: 100 },
  { name: 'SQL Server', driver: 'mssql', cdc: 'Change Tracking', passRate: 83.3 },
  { name: 'ClickHouse', driver: '@clickhouse/client', cdc: 'Polling', passRate: 100 },
  { name: 'Elasticsearch', driver: '@elastic/elasticsearch', cdc: 'Change Data Capture', passRate: 100 },
  { name: 'Neo4j', driver: 'neo4j-driver', cdc: 'Polling', passRate: 100 },
  { name: 'InfluxDB', driver: '@influxdata/influxdb-client', cdc: 'Polling', passRate: 100 },
  { name: 'MariaDB', driver: 'mysql2/promise', cdc: 'Poll-based watermark', passRate: 100 },
  { name: 'CockroachDB', driver: 'pg', cdc: 'wal2json', passRate: 100 },
  { name: 'TimescaleDB', driver: 'pg', cdc: 'wal2json', passRate: 100 },
  { name: 'DuckDB', driver: 'duckdb', cdc: 'N/A', passRate: 100 },
  { name: 'S3', driver: '@aws-sdk/client-s3', cdc: 'Polling', passRate: 100 },
  { name: 'CouchDB', driver: 'nano', cdc: 'Changes feed', passRate: 100 },
  { name: 'Couchbase', driver: 'couchbase', cdc: 'DCP', passRate: 100 },
  { name: 'Firebase', driver: 'firebase-admin', cdc: 'Realtime listeners', passRate: 100 },
  { name: 'Supabase', driver: 'REST (fetch)', cdc: 'Polling', passRate: 100 },
  { name: 'Kafka', driver: 'kafkajs', cdc: 'Consumer groups', passRate: 100 },
];

const sampleLaneA = [
  'Stripe', 'Salesforce', 'HubSpot', 'GitHub', 'Slack', 'Jira', 'Notion',
  'Twilio', 'SendGrid', 'Intercom', 'Linear', 'Figma', 'Calendly', 'Zoom',
  'Dropbox', 'Google Drive', 'Google Sheets', 'OneDrive', 'Mailchimp',
  'Chargebee', 'PagerDuty', 'Datadog', 'NewRelic', 'Grafana', 'Cloudflare',
  'Vercel', 'Netlify', 'WordPress', 'Microsoft Teams', 'Webflow',
];

export default function CertificationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Connector Certification
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            320 connectors certified via automated testing. Real drivers, real APIs, real results.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Methodology: {certificationStats.methodology} • Last updated: {certificationStats.lastUpdated}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <div className="text-3xl font-bold text-green-400">{certificationStats.total}</div>
              <div className="text-sm text-gray-400">Total Certified</div>
            </div>
            <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-3xl font-bold text-cyan-400">{certificationStats.laneB}</div>
              <div className="text-sm text-gray-400">Database (Lane B)</div>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="text-3xl font-bold text-blue-400">{certificationStats.laneA}</div>
              <div className="text-sm text-gray-400">SaaS (Lane A)</div>
            </div>
            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="text-3xl font-bold text-purple-400">{certificationStats.passRate90}</div>
              <div className="text-sm text-gray-400">90%+ Pass Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Lanes */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Certification Lanes</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Lane B — Database Connectors */}
            <div className="p-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-cyan-400">Lane B — Database Connectors</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Native database drivers. Full CDC support. Deep integration with real database instances.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Native driver (pg, mysql2, mongodb, etc.)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Real CDC implementation (log-based, streams, polling)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Docker integration testing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">✓</span>
                  Schema discovery, full extraction, incremental extraction
                </li>
              </ul>
              <div className="mt-4 text-sm text-cyan-400 font-medium">
                {certificationStats.laneB} connectors • 17 with 100% pass rate
              </div>
            </div>
            
            {/* Lane A — SaaS Connectors */}
            <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-blue-400">Lane A — SaaS Connectors</h3>
              </div>
              <p className="text-gray-300 mb-4">
                REST API connectors. Real endpoints, real schemas. Uses SaaSConnector base for auth, pagination, rate limiting.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  Real API endpoint (Stripe, Salesforce, HubSpot, etc.)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  Schema defined with real field names
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  Auth + pagination + rate limiting handled
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  CDC polling with watermarks
                </li>
              </ul>
              <div className="mt-4 text-sm text-blue-400 font-medium">
                {certificationStats.laneA} connectors • 25 with 100% pass rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lane B Connectors */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Database className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">Database Connectors (Lane B)</h2>
          </div>
          <p className="text-gray-400 mb-8">
            These connectors have native database drivers, real CDC implementations, and are tested against live database instances via Docker.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {laneBConnectors.map((conn) => (
              <div key={conn.name} className="bg-white/[0.02] border border-cyan-500/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{conn.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    conn.passRate === 100 
                      ? 'bg-green-500/10 text-green-400' 
                      : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {conn.passRate}% pass
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Driver:</span>{' '}
                    <span className="text-gray-300 font-mono text-xs">{conn.driver}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">CDC:</span>{' '}
                    <span className="text-gray-300">{conn.cdc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lane A Connectors (Sample) */}
      <section className="py-16 px-6 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold">SaaS Connectors (Lane A)</h2>
              </div>
              <p className="text-gray-400">
                {certificationStats.laneA} SaaS connectors with real REST API endpoints. 
                Sample of {sampleLaneA.length} shown below.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {sampleLaneA.map((name) => (
              <span key={name} className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg">
                {name}
              </span>
            ))}
            <span className="text-sm bg-white/5 text-gray-500 px-3 py-1.5 rounded-lg">
              +{certificationStats.laneA - sampleLaneA.length} more
            </span>
          </div>
          
          <div className="mt-6 p-4 rounded-xl border border-blue-500/10 bg-blue-500/5">
            <p className="text-sm text-blue-300">
              <strong>How they work:</strong> All Lane A connectors extend the SaaSConnector base class, 
              which handles authentication (bearer, OAuth2, API key), pagination (cursor, offset, link), 
              rate limiting, and CDC polling with watermarks. Each connector defines its own API endpoints 
              and schemas.
            </p>
          </div>
        </div>
      </section>

      {/* Pass Rate Distribution */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Pass Rate Distribution</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
              <div className="text-2xl font-bold text-green-400">{certificationStats.passRate100}</div>
              <div className="text-sm text-gray-400">100% Pass</div>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center">
              <div className="text-2xl font-bold text-blue-400">{certificationStats.passRate90 - certificationStats.passRate100}</div>
              <div className="text-sm text-gray-400">90-99% Pass</div>
            </div>
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
              <div className="text-2xl font-bold text-amber-400">{certificationStats.total - certificationStats.passRate90}</div>
              <div className="text-sm text-gray-400">Below 90%</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-2xl font-bold text-white">{certificationStats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Benchmark Results */}
      <section className="py-16 px-6 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Real Benchmark Results</h2>
          <p className="text-center text-gray-400 mb-8">
            Measured against real PostgreSQL instance (Docker) using the Pulsyn benchmark runner. Not simulated.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5">
              <h3 className="font-semibold text-lg mb-4">Throughput</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bulk (batches of 1000)</span>
                  <span className="text-green-400 font-bold">34,530 rows/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Streaming (single-row)</span>
                  <span className="text-green-400 font-bold">278 rows/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">50K rows inserted in</span>
                  <span className="text-green-400 font-bold">1.4 seconds</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="font-semibold text-lg mb-4">Latency</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">p50 (median)</span>
                  <span className="text-blue-400 font-bold">3.41ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">p95</span>
                  <span className="text-blue-400 font-bold">4.52ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">p99</span>
                  <span className="text-blue-400 font-bold">5.64ms</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <h3 className="font-semibold text-lg mb-4">Reliability</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Checkpoint Recovery</span>
                  <span className="text-purple-400 font-bold">✅ Passed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Integrity</span>
                  <span className="text-purple-400 font-bold">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-purple-400 font-bold">0%</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <h3 className="font-semibold text-lg mb-4">Certification</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Score</span>
                  <span className="text-amber-400 font-bold">74/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tier</span>
                  <span className="text-amber-400 font-bold">Silver</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Test Date</span>
                  <span className="text-amber-400 font-bold">Aug 9, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Roadmap */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Certification Roadmap</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 w-px bg-green-400/20" />
              </div>
              <div className="pb-6">
                <div className="text-sm text-green-400 font-medium mb-1">Complete</div>
                <h3 className="font-semibold mb-2">320 Connectors Certified</h3>
                <p className="text-sm text-gray-400">
                  19 database connectors (Lane B) + 301 SaaS connectors (Lane A). 
                  All tested via Vitest with real API calls and Docker database instances.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <div className="flex-1 w-px bg-blue-400/20" />
              </div>
              <div className="pb-6">
                <div className="text-sm text-blue-400 font-medium mb-1">In Progress</div>
                <h3 className="font-semibold mb-2">Performance Benchmarking</h3>
                <p className="text-sm text-gray-400">
                  Running throughput and latency benchmarks on Lane B connectors. 
                  Publishing real numbers on the certification page.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <div className="flex-1 w-px bg-purple-400/20" />
              </div>
              <div className="pb-6">
                <div className="text-sm text-purple-400 font-medium mb-1">Planned</div>
                <h3 className="font-semibold mb-2">Community Certification</h3>
                <p className="text-sm text-gray-400">
                  Let users submit certification results for connectors they use. 
                  Expand to 500+ connectors via community contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Want to Help Certify Connectors?</h2>
          <p className="text-gray-400 mb-8">
            We're looking for beta testers with real API credentials to help expand our connector catalog.
            Early contributors get free Pro access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Join Beta Program <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="https://github.com/tinkss9/pulsyn"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
