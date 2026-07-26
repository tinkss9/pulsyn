import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn — AI-Native CDC Platform | Real-time Data Replication',
  description: 'Real-time change data capture without Kafka. 170+ connectors, sub-second latency, MCP server for AI agents. Start free.',
  openGraph: {
    title: 'Pulsyn — AI-Native CDC Platform',
    description: 'Real-time change data capture without Kafka. 170+ connectors, sub-second latency, MCP server for AI agents.',
  },
};

const FEATURES = [
  { icon: '⚡', title: 'Real-time CDC', description: 'Log-based change data capture with sub-second latency. No polling, no batch jobs.' },
  { icon: '🔄', title: 'Checkpoint Recovery', description: 'Exactly-once semantics with visible, auditable checkpoints. Resume from any point.' },
  { icon: '🤖', title: 'AI Agent Integration', description: 'First CDC platform with MCP server (31 tools). Control pipelines from Claude, Cursor, or any AI agent.' },
  { icon: '🔒', title: 'In-flight Masking', description: 'Mask sensitive data during replication. Hash, redact, or format-preserving encryption.' },
  { icon: '📊', title: 'Connector Certification', description: 'Measured throughput and correctness benchmarks per source/target pair.' },
  { icon: '🛡️', title: 'Enterprise Security', description: 'API key auth, rate limiting, IP blocking, audit logging, brute-force protection.' },
  { icon: '📡', title: '170+ Connectors', description: 'PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, Snowflake, BigQuery, Kafka, and 160+ more.' },
  { icon: '☁️', title: 'Cloud Agnostic', description: 'Self-hosted, managed cloud, or hybrid. Deploy anywhere with Docker or Vercel.' },
];

const CONNECTOR_CATEGORIES = [
  { category: 'Databases', count: 45, examples: ['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'MariaDB', 'CockroachDB', 'TiDB', 'SQLite', 'DynamoDB'] },
  { category: 'Data Warehouses', count: 12, examples: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'ClickHouse', 'Firebolt'] },
  { category: 'Streaming', count: 15, examples: ['Kafka', 'Pulsar', 'Redis Streams', 'NATS', 'RabbitMQ', 'AWS Kinesis'] },
  { category: 'Cloud Databases', count: 20, examples: ['AWS RDS', 'Azure SQL', 'GCP Cloud SQL', 'PlanetScale', 'Neon', 'Supabase'] },
  { category: 'SaaS & APIs', count: 40, examples: ['Salesforce', 'HubSpot', 'Stripe', 'Shopify', 'Zendesk', 'Intercom'] },
  { category: 'Files & Storage', count: 25, examples: ['S3', 'GCS', 'Azure Blob', 'FTP', 'SFTP', 'CSV', 'Parquet', 'Avro'] },
  { category: 'Analytics', count: 15, examples: ['Amplitude', 'Mixpanel', 'Segment', 'Heap', 'PostHog'] },
];

const PRICING = [
  { name: 'Community', price: '$0', interval: '', description: 'For individual developers', features: ['3 connectors', 'Core CDC engine', 'CLI access', 'Self-hosted', 'Community support'], cta: 'Start Free', highlighted: false },
  { name: 'Pro', price: '$300', interval: '/mo', description: 'For growing teams', features: ['Unlimited pipelines', 'All 170+ connectors', 'Web dashboard', 'MCP server (31 tools)', 'API access', 'In-flight masking', 'Priority support'], cta: 'Start Free Trial', highlighted: true },
  { name: 'Business', price: '$2,000', interval: '/mo', description: 'For production workloads', features: ['Everything in Pro', 'SLA guarantee', 'SSO & RBAC', 'Audit logs', 'Dedicated support', 'Custom connectors', 'On-premise option'], cta: 'Contact Sales', highlighted: false },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Connect', description: 'Add your source and target databases. Pulsyn auto-discovers tables and schemas.' },
  { step: '2', title: 'Configure', description: 'Select tables, set up masking rules, configure batch sizes and checkpoint intervals.' },
  { step: '3', title: 'Replicate', description: 'Start replication. Monitor throughput, lag, and errors in real-time.' },
  { step: '4', title: 'Scale', description: 'Add more pipelines, upgrade plans, or integrate with AI agents via MCP.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-pulsyn-500">Pulsyn</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#connectors" className="text-sm text-gray-400 hover:text-white transition-colors">Connectors</a>
            <a href="#architecture" className="text-sm text-gray-400 hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full px-4 py-1.5 mb-8">
            <span className="text-pulsyn-400 text-sm font-medium">New</span>
            <span className="text-gray-400 text-sm">MCP server with 31 tools for AI agents</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Real-time CDC<br />
            <span className="text-pulsyn-500">without the complexity</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            170+ connectors. Sub-second latency. AI agent integration.
            No Kafka dependency. No $50K contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Start Free Trial
            </Link>
            <a href="#architecture" className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              See Architecture
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          <div><div className="text-3xl font-bold text-pulsyn-400">170+</div><div className="text-gray-400 text-sm">Connectors</div></div>
          <div><div className="text-3xl font-bold text-pulsyn-400">&lt;1s</div><div className="text-gray-400 text-sm">Latency</div></div>
          <div><div className="text-3xl font-bold text-pulsyn-400">31</div><div className="text-gray-400 text-sm">MCP Tools</div></div>
          <div><div className="text-3xl font-bold text-pulsyn-400">99.9%</div><div className="text-gray-400 text-sm">Uptime SLA</div></div>
          <div><div className="text-3xl font-bold text-pulsyn-400">$0</div><div className="text-gray-400 text-sm">to Start</div></div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need for CDC</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for teams who need production-grade replication without the enterprise price tag.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-pulsyn-800 transition-colors">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="py-24 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">170+ Connectors</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Every database, warehouse, stream, and SaaS app your team uses.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONNECTOR_CATEGORIES.map((cat) => (
              <div key={cat.category} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{cat.category}</h3>
                  <span className="text-pulsyn-400 text-sm font-mono">{cat.count}+</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.examples.map((ex) => (
                    <span key={ex} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">{ex}</span>
                  ))}
                  <span className="text-xs text-gray-500 px-2 py-1">+{cat.count - cat.examples.length} more</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Architecture</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              How Pulsyn moves data from source to target with sub-second latency.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 overflow-x-auto">
            <svg viewBox="0 0 1200 500" className="w-full min-w-[800px]" xmlns="http://www.w3.org/2000/svg">
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148,163,184,0.05)" strokeWidth="0.5"/>
                </pattern>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#06b6d4" opacity="0.8"/>
                </marker>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6"/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6"/>
                </linearGradient>
              </defs>
              <rect width="1200" height="500" fill="url(#grid)"/>

              {/* Source Layer */}
              <rect x="20" y="60" width="220" height="380" rx="12" fill="rgba(16,185,129,0.08)" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5"/>
              <text x="130" y="45" textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="600">SOURCES</text>

              {/* Source items */}
              {['PostgreSQL', 'MySQL', 'Oracle', 'SQL Server', 'MongoDB', 'Kafka', 'S3 / Files'].map((src, i) => (
                <g key={src}>
                  <rect x="35" y={80 + i * 48} width="190" height="36" rx="8" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.25)" strokeWidth="1"/>
                  <text x="130" y={103 + i * 48} textAnchor="middle" fill="#d1fae5" fontSize="13">{src}</text>
                </g>
              ))}

              {/* CDC Engine */}
              <rect x="320" y="80" width="240" height="340" rx="12" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5"/>
              <text x="440" y="65" textAnchor="middle" fill="#06b6d4" fontSize="12" fontWeight="600">PULSYN ENGINE</text>

              {/* Engine components */}
              {[
                { y: 100, label: 'CDC Capture', sub: 'Log-based · Real-time' },
                { y: 160, label: 'Change Tracking', sub: 'Triggers · Checkpoints' },
                { y: 220, label: 'Data Masking', sub: 'Hash · Redact · Format' },
                { y: 280, label: 'Batch Processor', sub: 'Retry · Exactly-once' },
                { y: 340, label: 'Schema Manager', sub: 'Auto-discover · Drift' },
              ].map((comp) => (
                <g key={comp.label}>
                  <rect x="335" y={comp.y} width="210" height="44" rx="8" fill="rgba(6,182,212,0.12)" stroke="rgba(6,182,212,0.2)" strokeWidth="1"/>
                  <text x="440" y={comp.y + 18} textAnchor="middle" fill="#e0f2fe" fontSize="13" fontWeight="500">{comp.label}</text>
                  <text x="440" y={comp.y + 34} textAnchor="middle" fill="#7dd3fc" fontSize="10">{comp.sub}</text>
                </g>
              ))}

              {/* AI Layer */}
              <rect x="640" y="80" width="180" height="160" rx="12" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5"/>
              <text x="730" y="65" textAnchor="middle" fill="#8b5cf6" fontSize="12" fontWeight="600">AI LAYER</text>

              {[
                { y: 100, label: 'MCP Server', sub: '31 tools' },
                { y: 155, label: 'REST API', sub: 'OpenAPI 3.0' },
                { y: 210, label: 'CLI', sub: '35+ commands' },
              ].map((comp) => (
                <g key={comp.label}>
                  <rect x="655" y={comp.y} width="150" height="36" rx="8" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
                  <text x="730" y={comp.y + 15} textAnchor="middle" fill="#ede9fe" fontSize="13" fontWeight="500">{comp.label}</text>
                  <text x="730" y={comp.y + 28} textAnchor="middle" fill="#c4b5fd" fontSize="10">{comp.sub}</text>
                </g>
              ))}

              {/* Target Layer */}
              <rect x="900" y="60" width="280" height="380" rx="12" fill="rgba(236,72,153,0.08)" stroke="rgba(236,72,153,0.3)" strokeWidth="1.5"/>
              <text x="1040" y="45" textAnchor="middle" fill="#ec4899" fontSize="12" fontWeight="600">TARGETS</text>

              {['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'PostgreSQL', 'Kafka', 'S3 / Lakehouse'].map((tgt, i) => (
                <g key={tgt}>
                  <rect x="915" y={80 + i * 48} width="250" height="36" rx="8" fill="rgba(236,72,153,0.12)" stroke="rgba(236,72,153,0.2)" strokeWidth="1"/>
                  <text x="1040" y={103 + i * 48} textAnchor="middle" fill="#fce7f3" fontSize="13">{tgt}</text>
                </g>
              ))}

              {/* Flow arrows */}
              <path d="M 240 200 C 280 200, 300 200, 320 200" fill="none" stroke="url(#flowGrad)" strokeWidth="2.5" markerEnd="url(#arrowhead)" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" repeatCount="indefinite"/>
              </path>
              <path d="M 240 300 C 280 300, 300 300, 320 300" fill="none" stroke="url(#flowGrad)" strokeWidth="2.5" markerEnd="url(#arrowhead)" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" begin="0.3s" repeatCount="indefinite"/>
              </path>

              <path d="M 560 200 C 600 200, 620 160, 640 160" fill="none" stroke="url(#flowGrad)" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" begin="0.5s" repeatCount="indefinite"/>
              </path>

              <path d="M 560 250 C 700 250, 850 200, 900 200" fill="none" stroke="url(#flowGrad)" strokeWidth="2.5" markerEnd="url(#arrowhead)" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" begin="0.7s" repeatCount="indefinite"/>
              </path>
              <path d="M 560 300 C 700 300, 850 300, 900 300" fill="none" stroke="url(#flowGrad)" strokeWidth="2.5" markerEnd="url(#arrowhead)" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" begin="1s" repeatCount="indefinite"/>
              </path>
              <path d="M 560 350 C 700 350, 850 400, 900 400" fill="none" stroke="url(#flowGrad)" strokeWidth="2.5" markerEnd="url(#arrowhead)" strokeDasharray="8 4">
                <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1s" begin="1.3s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>

          {/* Architecture Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-400">Source Layer</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Log-based CDC (no polling)</li>
                <li>• Auto-schema discovery</li>
                <li>• Checkpoint recovery</li>
                <li>• Schema drift detection</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-cyan-400">Engine Layer</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Real-time change capture</li>
                <li>• In-flight data masking</li>
                <li>• Exactly-once delivery</li>
                <li>• Auto-retry with backoff</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 text-pink-400">Target Layer</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 170+ destination connectors</li>
                <li>• Batch & streaming modes</li>
                <li>• Schema evolution</li>
                <li>• Partitioning & optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Pulsyn */}
      <section className="py-24 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why teams choose Pulsyn</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The CDC market has three problems: complexity, cost, and vendor lock-in. We solve all three.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="text-sm font-medium text-red-400 mb-4">vs. Confluent / Debezium</div>
              <h3 className="text-xl font-semibold mb-4">No Kafka dependency</h3>
              <p className="text-gray-400 mb-4">Confluent requires running Kafka clusters. Debezium requires Kafka Connect. Pulsyn runs standalone.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Zero infrastructure overhead</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Deploy in minutes, not days</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 10x lower operational cost</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="text-sm font-medium text-yellow-400 mb-4">vs. Fivetran / Airbyte</div>
              <h3 className="text-xl font-semibold mb-4">True real-time, not batch</h3>
              <p className="text-gray-400 mb-4">Fivetran syncs every 15 minutes. Airbyte is batch-first. Pulsyn streams changes in real-time.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Sub-second latency</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 75% cheaper at scale</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> API + CLI + MCP (not just UI)</li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="text-sm font-medium text-blue-400 mb-4">vs. Everyone</div>
              <h3 className="text-xl font-semibold mb-4">AI-native from day one</h3>
              <p className="text-gray-400 mb-4">Pulsyn is the first CDC platform with an MCP server. Control pipelines from any AI agent.</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> 31 MCP tools for AI agents</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Natural language pipeline management</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Built for the agentic future</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Full Feature Table */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Feature Set</h2>
            <p className="text-gray-400 text-lg">Everything included in Pulsyn.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Feature</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['CDC Engine', 'Log-based real-time capture', '✓'],
                  ['CDC Engine', 'Checkpoint recovery', '✓'],
                  ['CDC Engine', 'Exactly-once delivery', '✓'],
                  ['CDC Engine', 'Schema drift detection', '✓'],
                  ['CDC Engine', 'Auto-retry with backoff', '✓'],
                  ['Connectors', '170+ source connectors', '✓'],
                  ['Connectors', '170+ target connectors', '✓'],
                  ['Connectors', 'Custom connector SDK', '✓'],
                  ['Connectors', 'Connector certification benchmarks', '✓'],
                  ['Security', 'API key authentication', '✓'],
                  ['Security', 'Rate limiting (100 req/min)', '✓'],
                  ['Security', 'IP blocking (auto + manual)', '✓'],
                  ['Security', 'Brute-force protection', '✓'],
                  ['Security', 'Audit logging', '✓'],
                  ['AI Integration', 'MCP server (31 tools)', '✓'],
                  ['AI Integration', 'REST API (OpenAPI 3.0)', '✓'],
                  ['AI Integration', 'CLI (35+ commands)', '✓'],
                  ['Data Protection', 'In-flight masking (hash)', '✓'],
                  ['Data Protection', 'In-flight masking (redact)', '✓'],
                  ['Data Protection', 'Format-preserving encryption', '✓'],
                  ['Monitoring', 'Real-time pipeline metrics', '✓'],
                  ['Monitoring', 'Admin security dashboard', '✓'],
                  ['Monitoring', 'Error tracking & retry logs', '✓'],
                  ['Deployment', 'Self-hosted (Docker)', '✓'],
                  ['Deployment', 'Managed cloud (Vercel)', '✓'],
                  ['Deployment', 'Hybrid deployment', '✓'],
                ].map(([category, feature, status]) => (
                  <tr key={feature} className="border-b border-gray-800/50">
                    <td className="py-3 px-6 text-sm text-gray-400">{category}</td>
                    <td className="py-3 px-6 text-sm">{feature}</td>
                    <td className="py-3 px-6 text-sm text-green-400">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Four steps from zero to production replication.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-pulsyn-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{step.step}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`rounded-xl p-8 ${plan.highlighted ? 'bg-pulsyn-950/50 border-2 border-pulsyn-600 relative' : 'bg-gray-900/50 border border-gray-800'}`}>
                {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pulsyn-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">{plan.interval}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <span className="text-pulsyn-500">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${plan.highlighted ? 'bg-pulsyn-600 hover:bg-pulsyn-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start replicating?</h2>
          <p className="text-gray-400 text-lg mb-8">Get started with a free trial. No credit card required.</p>
          <Link href="/signup" className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">Start Free Trial</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold text-pulsyn-500">Pulsyn</span>
              <p className="text-gray-500 text-sm mt-2">The AI-Native CDC Platform</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#connectors" className="hover:text-white transition-colors">Connectors</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/api/docs" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Connectors</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>PostgreSQL</li>
                <li>MySQL</li>
                <li>Oracle</li>
                <li>Snowflake</li>
                <li>BigQuery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="mailto:support@pulsyn.io" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2026 Pulsyn. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
