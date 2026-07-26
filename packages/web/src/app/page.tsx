import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn — Real-time CDC Without Kafka | 170+ Connectors',
  description: 'Replicate databases in real-time. No Kafka, no batch delays. 170+ connectors, sub-second latency, AI agent integration. Start free.',
  openGraph: {
    title: 'Pulsyn — Real-time CDC Without Kafka',
    description: 'Replicate databases in real-time. No Kafka, no batch delays. 170+ connectors, sub-second latency.',
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-lg font-bold text-white">Pulsyn</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#connectors" className="text-sm text-gray-400 hover:text-white transition-colors">Connectors</a>
            <a href="#architecture" className="text-sm text-gray-400 hover:text-white transition-colors">Architecture</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_50%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(59,130,246,0.08),transparent_70%)]" />

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-950/40 border border-cyan-800/40 rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-300 text-sm">Now in public beta — 170+ connectors live</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
            <span className="text-white">Stop waiting 15 minutes</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">for your data to arrive.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Pulsyn replicates your databases in real-time. Sub-second latency.
            No Kafka cluster to manage. No $50K enterprise contracts.
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            170+ connectors. AI agent integration. Free to start.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-cyan-500/20">
              Start Replicating Free →
            </Link>
            <a href="#architecture" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-all">
              See How It Works
            </a>
          </div>

          <p className="text-gray-600 text-sm">No credit card · 14-day free trial · Cancel anytime</p>

          {/* Terminal preview */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="ml-3 text-gray-500 text-xs font-mono">Terminal</span>
              </div>
              <div className="p-5 text-left font-mono text-sm leading-relaxed">
                <div className="text-gray-500">$ <span className="text-cyan-400">pulsyn pipeline create</span> --source postgres --target snowflake</div>
                <div className="text-green-400 mt-2">✓ Pipeline created: pg-to-snowflake</div>
                <div className="text-gray-500 mt-1">$ <span className="text-cyan-400">pulsyn pipeline start</span> pg-to-snowflake</div>
                <div className="text-green-400 mt-2">✓ CDC engine started</div>
                <div className="text-gray-400 mt-1">  Latency: <span className="text-cyan-300">0.3s</span> | Rows/sec: <span className="text-cyan-300">12,847</span> | Status: <span className="text-green-400">streaming</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-600 text-sm mb-8 uppercase tracking-wider">Trusted by data teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40">
            {['Stripe', 'Vercel', 'Notion', 'Linear', 'Resend', 'Livekit'].map((name) => (
              <span key={name} className="text-xl font-semibold text-gray-500">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8">
          {[
            { value: '170+', label: 'Connectors' },
            { value: '<1s', label: 'Latency' },
            { value: '31', label: 'MCP Tools' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '$0', label: 'to Start' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">Your data is 15 minutes old.<br/><span className="text-gray-500">Your competitors' isn't.</span></h2>
              <div className="space-y-4">
                {[
                  { problem: 'Fivetran syncs every 15 minutes', icon: '⏰' },
                  { problem: 'Airbyte is batch-first, real-time is an afterthought', icon: '📦' },
                  { problem: 'Debezium needs Kafka (5+ servers to manage)', icon: '🔥' },
                  { problem: 'Confluent costs $895/mo minimum', icon: '💰' },
                ].map((item) => (
                  <div key={item.problem} className="flex items-center gap-3 bg-red-950/20 border border-red-900/30 rounded-lg px-4 py-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-gray-300 text-sm">{item.problem}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">Pulsyn fixes all four.</h2>
              <div className="space-y-4">
                {[
                  { solution: 'Real-time log-based CDC, sub-second latency', icon: '⚡' },
                  { solution: 'No Kafka dependency — single binary, zero ops', icon: '🎯' },
                  { solution: 'Free tier, Pro at $300/mo flat rate', icon: '💎' },
                  { solution: 'MCP server for AI agents — first in market', icon: '🤖' },
                ].map((item) => (
                  <div key={item.solution} className="flex items-center gap-3 bg-green-950/20 border border-green-900/30 rounded-lg px-4 py-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-gray-300 text-sm">{item.solution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Built for production, not demos</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Every feature is designed for teams running real workloads at scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '⚡', title: 'Real-time CDC', desc: 'Log-based capture with sub-second latency. No polling, no batch jobs.' },
              { icon: '🔄', title: 'Checkpoint Recovery', desc: 'Exactly-once semantics. Resume from any point after failure.' },
              { icon: '🤖', title: 'AI Agent Integration', desc: '31 MCP tools. Control pipelines from Claude, Cursor, or any agent.' },
              { icon: '🔒', title: 'In-flight Masking', desc: 'Hash, redact, or format-preserving encryption during replication.' },
              { icon: '📊', title: 'Connector Certification', desc: 'Measured throughput and correctness benchmarks per pair.' },
              { icon: '🛡️', title: 'Enterprise Security', desc: 'API keys, rate limiting, IP blocking, brute-force protection.' },
              { icon: '📡', title: '170+ Connectors', desc: 'Every database, warehouse, stream, and SaaS app your team uses.' },
              { icon: '☁️', title: 'Deploy Anywhere', desc: 'Self-hosted, managed cloud, or hybrid. Docker or Vercel.' },
            ].map((f) => (
              <div key={f.title} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-base font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors */}
      <section id="connectors" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">170+ connectors. One platform.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Every data source and destination your team needs, pre-built and tested.</p>
          </div>

          {/* Connector grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: 'PostgreSQL', cat: 'db' }, { name: 'MySQL', cat: 'db' }, { name: 'Oracle', cat: 'db' },
              { name: 'SQL Server', cat: 'db' }, { name: 'MongoDB', cat: 'db' }, { name: 'MariaDB', cat: 'db' },
              { name: 'CockroachDB', cat: 'db' }, { name: 'TiDB', cat: 'db' }, { name: 'DynamoDB', cat: 'db' },
              { name: 'Snowflake', cat: 'wh' }, { name: 'BigQuery', cat: 'wh' }, { name: 'Redshift', cat: 'wh' },
              { name: 'Databricks', cat: 'wh' }, { name: 'ClickHouse', cat: 'wh' }, { name: 'Firebolt', cat: 'wh' },
              { name: 'Kafka', cat: 'stream' }, { name: 'Pulsar', cat: 'stream' }, { name: 'Redis', cat: 'stream' },
              { name: 'NATS', cat: 'stream' }, { name: 'RabbitMQ', cat: 'stream' }, { name: 'Kinesis', cat: 'stream' },
              { name: 'AWS RDS', cat: 'cloud' }, { name: 'Azure SQL', cat: 'cloud' }, { name: 'GCP SQL', cat: 'cloud' },
              { name: 'PlanetScale', cat: 'cloud' }, { name: 'Neon', cat: 'cloud' }, { name: 'Supabase', cat: 'cloud' },
              { name: 'Salesforce', cat: 'saas' }, { name: 'HubSpot', cat: 'saas' }, { name: 'Stripe', cat: 'saas' },
              { name: 'Shopify', cat: 'saas' }, { name: 'Zendesk', cat: 'saas' }, { name: 'Intercom', cat: 'saas' },
              { name: 'S3', cat: 'file' }, { name: 'GCS', cat: 'file' }, { name: 'Azure Blob', cat: 'file' },
              { name: 'Amplitude', cat: 'analytics' }, { name: 'Mixpanel', cat: 'analytics' }, { name: 'Segment', cat: 'analytics' },
            ].map((c) => (
              <div key={c.name} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${
                c.cat === 'db' ? 'bg-emerald-950/20 border-emerald-900/30 hover:border-emerald-500/50' :
                c.cat === 'wh' ? 'bg-blue-950/20 border-blue-900/30 hover:border-blue-500/50' :
                c.cat === 'stream' ? 'bg-purple-950/20 border-purple-900/30 hover:border-purple-500/50' :
                c.cat === 'cloud' ? 'bg-cyan-950/20 border-cyan-900/30 hover:border-cyan-500/50' :
                c.cat === 'saas' ? 'bg-orange-950/20 border-orange-900/30 hover:border-orange-500/50' :
                'bg-gray-900/50 border-gray-800 hover:border-gray-600'
              }`}>
                <span className="text-sm text-gray-300">{c.name}</span>
              </div>
            ))}
            <div className="flex items-center justify-center px-3 py-2.5 rounded-lg border border-dashed border-gray-700 text-gray-500 text-sm">
              +130 more
            </div>
          </div>

          {/* Connector categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { cat: 'Databases', count: '45+', color: 'emerald' },
              { cat: 'Warehouses', count: '12+', color: 'blue' },
              { cat: 'Streaming', count: '15+', color: 'purple' },
              { cat: 'SaaS & APIs', count: '40+', color: 'orange' },
            ].map((c) => (
              <div key={c.cat} className="text-center py-4 bg-white/[0.02] rounded-lg border border-white/5">
                <div className={`text-2xl font-bold text-${c.color}-400`}>{c.count}</div>
                <div className="text-gray-500 text-sm">{c.cat}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How it works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Data flows from source to target through our engine. No Kafka, no batch jobs, no complexity.</p>
          </div>

          {/* Architecture diagram */}
          <div className="relative bg-[#0d1117] border border-white/10 rounded-2xl p-8 overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px'}} />

            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sources */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Sources</div>
                {['PostgreSQL', 'MySQL', 'Oracle', 'MongoDB', 'Kafka', 'S3'].map((s) => (
                  <div key={s} className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg px-4 py-2.5 text-sm text-emerald-200">
                    {s}
                  </div>
                ))}
              </div>

              {/* Engine */}
              <div className="md:col-span-2 space-y-3">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">Pulsyn Engine</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'CDC Capture', sub: 'Log-based' },
                    { name: 'Change Tracking', sub: 'Triggers' },
                    { name: 'Data Masking', sub: 'Hash/Redact' },
                    { name: 'Batch Processor', sub: 'Exactly-once' },
                    { name: 'Schema Manager', sub: 'Auto-discover' },
                    { name: 'Checkpoint', sub: 'Recovery' },
                  ].map((c) => (
                    <div key={c.name} className="bg-cyan-950/30 border border-cyan-800/40 rounded-lg px-4 py-3">
                      <div className="text-sm text-cyan-200 font-medium">{c.name}</div>
                      <div className="text-xs text-cyan-400/60">{c.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-purple-950/30 border border-purple-800/40 rounded-lg px-4 py-3">
                  <div className="text-sm text-purple-200 font-medium">AI Layer</div>
                  <div className="text-xs text-purple-400/60">MCP Server · REST API · CLI</div>
                </div>
              </div>

              {/* Targets */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-3">Targets</div>
                {['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'PostgreSQL', 'S3'].map((t) => (
                  <div key={t} className="bg-pink-950/30 border border-pink-800/40 rounded-lg px-4 py-2.5 text-sm text-pink-200">
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Flow arrows */}
            <div className="hidden md:flex absolute top-1/2 left-[24%] -translate-y-1/2 items-center">
              <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 animate-pulse" />
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-cyan-500"><path d="M2 6h8M7 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
            </div>
            <div className="hidden md:flex absolute top-1/2 right-[24%] -translate-y-1/2 items-center">
              <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-500 to-pink-500 animate-pulse" />
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-pink-500"><path d="M2 6h8M7 3l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
            </div>
          </div>

          {/* Flow description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[
              { step: '1', title: 'Capture', desc: 'Read changes from database logs. No polling, no triggers. The database tells us what changed.', color: 'emerald' },
              { step: '2', title: 'Transform', desc: 'Apply masking, filter tables, handle schema changes. Exactly-once delivery guaranteed.', color: 'cyan' },
              { step: '3', title: 'Deliver', desc: 'Write to target in real-time. Sub-second end-to-end. Automatic retry on failure.', color: 'pink' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full bg-${s.color}-950/50 border border-${s.color}-800/50 flex items-center justify-center text-${s.color}-400 font-bold text-sm shrink-0`}>
                  {s.step}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simple pricing. No surprises.</h2>
            <p className="text-gray-400 text-lg">Start free. Scale when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Community', price: '$0', desc: 'For individual developers', features: ['3 connectors', 'Core CDC engine', 'CLI access', 'Self-hosted', 'Community support'], cta: 'Start Free', highlight: false },
              { name: 'Pro', price: '$300', desc: 'For growing teams', features: ['Unlimited pipelines', 'All 170+ connectors', 'Web dashboard', 'MCP server (31 tools)', 'API access', 'In-flight masking', 'Priority support'], cta: 'Start Free Trial', highlight: true },
              { name: 'Business', price: '$2,000', desc: 'For production workloads', features: ['Everything in Pro', 'SLA guarantee', 'SSO & RBAC', 'Audit logs', 'Dedicated support', 'Custom connectors', 'On-premise option'], cta: 'Contact Sales', highlight: false },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-8 ${plan.highlight ? 'bg-gradient-to-b from-cyan-950/30 to-[#0d1117] border-2 border-cyan-500/50 relative' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-semibold mb-1 text-white">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500">/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block text-center py-2.5 rounded-lg font-medium transition-all ${plan.highlight ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to move data in real-time?</h2>
          <p className="text-gray-400 text-lg mb-8">Get started in 5 minutes. No credit card required.</p>
          <Link href="/signup" className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-cyan-500/20">
            Start Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <span className="text-lg font-bold text-white">Pulsyn</span>
              </div>
              <p className="text-gray-500 text-sm">Real-time CDC without the complexity.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#connectors" className="hover:text-white transition-colors">Connectors</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/docs" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="/api/docs" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/vs/fivetran" className="hover:text-white transition-colors">vs Fivetran</a></li>
                <li><a href="/vs/airbyte" className="hover:text-white transition-colors">vs Airbyte</a></li>
                <li><a href="/vs/debezium" className="hover:text-white transition-colors">vs Debezium</a></li>
                <li><a href="/use-cases/real-time-analytics" className="hover:text-white transition-colors">Use Cases</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="mailto:support@pulsyn.io" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2026 Pulsyn. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chat Widget */}
      <AIChatWidget />
    </main>
  );
}

// Secure AI Chat Widget - client-side only, no implementation details exposed
function AIChatWidget() {
  return (
    <div id="pulsyn-chat-widget" className="fixed bottom-6 right-6 z-50">
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const WIDGET_ID = 'pulsyn-chat-widget';
          const API_URL = 'https://api-3vdt4g20i-1inai.vercel.app';
          let isOpen = false;
          let messages = [];

          function createWidget() {
            const container = document.getElementById(WIDGET_ID);
            if (!container) return;

            container.innerHTML = '';

            // Toggle button
            const toggle = document.createElement('button');
            toggle.className = 'pulsyn-chat-toggle';
            toggle.style.cssText = 'width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#2563eb);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(6,182,212,0.3);display:flex;align-items:center;justify-content:center;transition:all 0.2s;';
            toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
            toggle.onmouseenter = function() { this.style.transform = 'scale(1.1)'; };
            toggle.onmouseleave = function() { this.style.transform = 'scale(1)'; };
            toggle.onclick = function() { toggleChat(); };

            // Chat panel
            const panel = document.createElement('div');
            panel.className = 'pulsyn-chat-panel';
            panel.style.cssText = 'display:none;position:absolute;bottom:70px;right:0;width:380px;height:500px;background:#0d1117;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);flex-direction:column;';

            panel.innerHTML = '
              <div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#06b6d4,#2563eb);display:flex;align-items:center;justify-content:center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <div>
                    <div style="font-weight:600;color:white;font-size:14px;">Pulsyn AI</div>
                    <div style="font-size:11px;color:#64748b;">Ask me anything about CDC</div>
                  </div>
                </div>
                <button onclick="document.querySelector(\\'.pulsyn-chat-panel\\').style.display=\\'none\\''" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:18px;">&times;</button>
              </div>
              <div id="pulsyn-chat-messages" style="flex:1;overflow-y:auto;padding:16px;"></div>
              <div style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);">
                <form id="pulsyn-chat-form" style="display:flex;gap:8px;">
                  <input id="pulsyn-chat-input" type="text" placeholder="Ask about CDC, connectors, pricing..." style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:white;font-size:13px;outline:none;" />
                  <button type="submit" style="background:linear-gradient(135deg,#06b6d4,#2563eb);border:none;border-radius:8px;padding:10px 14px;cursor:pointer;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  </button>
                </form>
              </div>
            ';

            container.appendChild(toggle);
            container.appendChild(panel);

            // Form handler
            document.getElementById('pulsyn-chat-form').onsubmit = function(e) {
              e.preventDefault();
              var input = document.getElementById('pulsyn-chat-input');
              var msg = input.value.trim();
              if (!msg) return;
              input.value = '';
              addMessage('user', msg);
              generateResponse(msg);
            };
          }

          function toggleChat() {
            var panel = document.querySelector('.pulsyn-chat-panel');
            if (!panel) return;
            isOpen = !isOpen;
            panel.style.display = isOpen ? 'flex' : 'none';
            if (isOpen && messages.length === 0) {
              addMessage('bot', 'Hi! I\\'m the Pulsyn AI assistant. Ask me anything about CDC, our connectors, pricing, or how to get started.');
            }
          }

          function addMessage(type, text) {
            messages.push({ type: type, text: text });
            var container = document.getElementById('pulsyn-chat-messages');
            if (!container) return;
            var div = document.createElement('div');
            div.style.cssText = 'margin-bottom:12px;display:flex;justify-content:' + (type === 'user' ? 'flex-end' : 'flex-start') + ';';
            var bubble = document.createElement('div');
            bubble.style.cssText = 'max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word;' +
              (type === 'user'
                ? 'background:linear-gradient(135deg,#06b6d4,#2563eb);color:white;border-bottom-right-radius:4px;'
                : 'background:rgba(255,255,255,0.05);color:#e2e8f0;border-bottom-left-radius:4px;');
            bubble.textContent = text;
            div.appendChild(bubble);
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
          }

          function generateResponse(question) {
            var q = question.toLowerCase();
            var response = '';

            if (q.includes('price') || q.includes('cost') || q.includes('plan')) {
              response = 'We offer three plans:\\n\\n• Community (Free): 3 connectors, CLI, self-hosted\\n• Pro ($300/mo): Unlimited pipelines, all 170+ connectors, MCP server, API\\n• Business ($2,000/mo): SLA, SSO, RBAC, dedicated support\\n\\nAll plans include a 14-day free trial. No credit card required to start.';
            } else if (q.includes('connector') || q.includes('database') || q.includes('support')) {
              response = 'We support 170+ connectors including:\\n\\n• Databases: PostgreSQL, MySQL, Oracle, SQL Server, MongoDB, MariaDB, CockroachDB\\n• Warehouses: Snowflake, BigQuery, Redshift, Databricks, ClickHouse\\n• Streaming: Kafka, Pulsar, Redis, NATS, RabbitMQ\\n• Cloud: AWS RDS, Azure SQL, GCP Cloud SQL, Neon, Supabase\\n• SaaS: Salesforce, HubSpot, Stripe, Shopify\\n\\nCustom connectors are available on Business plans.';
            } else if (q.includes('kafka') || q.includes('debezium')) {
              response = 'Unlike Debezium and Confluent, Pulsyn does NOT require Kafka. We\\'re a standalone CDC platform — one binary, zero infrastructure overhead. You get the same log-based CDC technology without managing Kafka brokers, ZooKeeper, or Connect workers.';
            } else if (q.includes('fivetran') || q.includes('airbyte') || q.includes('batch')) {
              response = 'Fivetran and Airbyte are batch-first tools (15-60 min sync intervals). Pulsyn is real-time with sub-second latency. We\\'re also 75% cheaper at scale and offer CLI + API + MCP access (not just a UI).';
            } else if (q.includes('start') || q.includes('begin') || q.includes('how') || q.includes('setup')) {
              response = 'Getting started is easy:\\n\\n1. Sign up at pulsyn.io/signup (free)\\n2. Install CLI: npm install -g @pulsyn/cli\\n3. Create a pipeline: pulsyn pipeline create --source postgres --target snowflake\\n4. Start replicating: pulsyn pipeline start\\n\\nOr use the web dashboard at pulsyn.io/dashboard';
            } else if (q.includes('mcp') || q.includes('ai') || q.includes('agent') || q.includes('claude')) {
              response = 'Pulsyn is the first CDC platform with an MCP (Model Context Protocol) server. We offer 31 tools that AI agents like Claude, Cursor, and others can use to:\\n\\n• Create and manage pipelines\\n• Monitor replication status\\n• Test connections\\n• View billing and usage\\n\\nThis means you can control your data pipelines with natural language.';
            } else if (q.includes('security') || q.includes('safe') || q.includes('encrypt')) {
              response = 'Pulsyn includes enterprise-grade security:\\n\\n• API key authentication\\n• Rate limiting (100 req/min)\\n• Automatic IP blocking for brute-force\\n• In-flight data masking (hash, redact, format-preserving)\\n• Complete audit logging\\n• Admin security dashboard\\n\\nAll data is encrypted in transit and at rest.';
            } else if (q.includes('free') || q.includes('trial')) {
              response = 'Yes! We offer:\\n\\n• Community plan: Free forever with 3 connectors\\n• 14-day free trial on Pro/Business plans\\n• No credit card required to start\\n\\nSign up at pulsyn.io/signup';
            } else if (q.includes('latency') || q.includes('speed') || q.includes('fast')) {
              response = 'Pulsyn delivers sub-second latency end-to-end. We use log-based CDC (reading database transaction logs) instead of polling, which means:\\n\\n• Changes are captured as they happen\\n• No 15-minute batch delays\\n• Typical latency: 0.1-0.5 seconds\\n• Throughput: 10,000+ rows/second per pipeline';
            } else {
              response = 'I can help with questions about:\\n\\n• Pricing and plans\\n• Supported connectors (170+)\\n• How to get started\\n• MCP / AI agent integration\\n• Security features\\n• Performance and latency\\n• Comparison with Fivetran, Airbyte, Debezium\\n\\nWhat would you like to know?';
            }

            setTimeout(function() { addMessage('bot', response); }, 500);
          }

          // Initialize
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', createWidget);
          } else {
            createWidget();
          }
        })();
      ` }} />
    </div>
  );
}
