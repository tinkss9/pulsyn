import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn — Real-time CDC Without Kafka | Start Free',
  description: 'Replicate databases in real-time. No Kafka, no batch delays. Sub-second latency, AI agent integration. Start free.',
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
            <a href="#ai-setup" className="text-sm text-gray-400 hover:text-white transition-colors">AI Setup</a>
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_50%)]" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-cyan-950/40 border border-cyan-800/40 rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-300 text-sm">Open source CDC engine — build real-time pipelines in minutes</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]">
            <span className="text-white">Stop waiting 15 minutes</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">for your data to arrive.</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Pulsyn replicates your databases in real-time. Sub-second latency.
            No Kafka cluster to manage. No $50K enterprise contracts.
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
            PostgreSQL and MySQL supported today. More connectors coming.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-cyan-500/20">
              Start Replicating Free →
            </Link>
            <a href="#ai-setup" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-all">
              See AI Setup Demo
            </a>
          </div>

          <p className="text-gray-600 text-sm">No credit card · Free tier forever · Upgrade when ready</p>

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
              { icon: '📡', title: 'Growing Connector Library', desc: 'PostgreSQL and MySQL today. Community-driven expansion.' },
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

      {/* Connectors - Honest */}
      <section id="connectors" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Connector ecosystem</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Production-ready today. Expanding with community contributions and connector certification lab.
            </p>
          </div>

          {/* Production Ready */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Production Ready
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'PostgreSQL', status: 'Full CDC support', tested: true },
                { name: 'MySQL', status: 'Binlog CDC', tested: true },
              ].map((c) => (
                <div key={c.name} className="bg-green-950/20 border border-green-800/40 rounded-xl p-4">
                  <div className="text-white font-semibold">{c.name}</div>
                  <div className="text-green-400/70 text-sm mt-1">{c.status}</div>
                  <div className="text-green-500 text-xs mt-2">✓ Tested & certified</div>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon - Expandable */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Coming Soon — Connector Roadmap
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3" id="connector-roadmap">
              {[
                { name: 'Oracle', cat: 'db' }, { name: 'SQL Server', cat: 'db' }, { name: 'MongoDB', cat: 'db' },
                { name: 'MariaDB', cat: 'db' }, { name: 'CockroachDB', cat: 'db' }, { name: 'TiDB', cat: 'db' },
                { name: 'Snowflake', cat: 'wh' }, { name: 'BigQuery', cat: 'wh' }, { name: 'Redshift', cat: 'wh' },
                { name: 'Databricks', cat: 'wh' }, { name: 'ClickHouse', cat: 'wh' },
                { name: 'Kafka', cat: 'stream' }, { name: 'Pulsar', cat: 'stream' }, { name: 'Redis', cat: 'stream' },
                { name: 'AWS RDS', cat: 'cloud' }, { name: 'Azure SQL', cat: 'cloud' }, { name: 'Neon', cat: 'cloud' },
                { name: 'Salesforce', cat: 'saas' }, { name: 'Stripe', cat: 'saas' }, { name: 'Shopify', cat: 'saas' },
              ].map((c) => (
                <div key={c.name} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${
                  c.cat === 'db' ? 'bg-emerald-950/20 border-emerald-900/30' :
                  c.cat === 'wh' ? 'bg-blue-950/20 border-blue-900/30' :
                  c.cat === 'stream' ? 'bg-purple-950/20 border-purple-900/30' :
                  c.cat === 'cloud' ? 'bg-cyan-950/20 border-cyan-900/30' :
                  'bg-orange-950/20 border-orange-900/30'
                }`}>
                  <span className="text-sm text-gray-400">{c.name}</span>
                  <span className="text-xs text-gray-600 ml-auto">Q3 2026</span>
                </div>
              ))}
              <div className="flex items-center justify-center px-3 py-2.5 rounded-lg border border-dashed border-gray-700 text-gray-500 text-sm">
                +150 more planned
              </div>
            </div>
          </div>

          {/* Cloud Lab CTA */}
          <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-800/30 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-3">Connector Certification Lab</h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-4">
              We're building a cloud lab to test and certify every connector pair.
              Each connector goes through throughput, latency, and correctness benchmarks before being marked production-ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-300">Throughput testing</span>
              <span className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-300">Latency benchmarks</span>
              <span className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-300">Correctness validation</span>
              <span className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-gray-300">Public results</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Setup Demo */}
      <section id="ai-setup" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Set up pipelines with AI</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Pulsyn is the first CDC platform with an MCP server. Ask Claude, Cursor, or any AI agent to create your pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* AI Chat Demo */}
            <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <span className="text-white text-sm font-medium">Pulsyn AI Assistant</span>
              </div>
              <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-xl rounded-br-sm text-sm max-w-[80%]">
                    I need to replicate my PostgreSQL orders table to Snowflake in real-time
                  </div>
                </div>
                {/* Bot response */}
                <div className="flex justify-start">
                  <div className="bg-white/5 text-gray-200 px-4 py-2.5 rounded-xl rounded-bl-sm text-sm max-w-[80%]">
                    <div className="mb-2">I'll set that up for you. Here's what I'll create:</div>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-xs space-y-1">
                      <div className="text-cyan-400">pulsyn connector create \</div>
                      <div className="text-gray-400">  --name "pg-source" \</div>
                      <div className="text-gray-400">  --engine postgresql \</div>
                      <div className="text-gray-400">  --host your-db.example.com \</div>
                      <div className="text-gray-400">  --database orders_db</div>
                      <div className="mt-2 text-cyan-400">pulsyn pipeline create \</div>
                      <div className="text-gray-400">  --name "orders-to-snowflake" \</div>
                      <div className="text-gray-400">  --source pg-source \</div>
                      <div className="text-gray-400">  --target snowflake-prod \</div>
                      <div className="text-gray-400">  --tables "public.orders"</div>
                    </div>
                    <div className="mt-2 text-gray-400 text-xs">Shall I run these commands?</div>
                  </div>
                </div>
                {/* User confirm */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2.5 rounded-xl rounded-br-sm text-sm">
                    Yes, and add masking on the email column
                  </div>
                </div>
                {/* Bot confirms */}
                <div className="flex justify-start">
                  <div className="bg-white/5 text-gray-200 px-4 py-2.5 rounded-xl rounded-bl-sm text-sm max-w-[80%]">
                    <div className="text-green-400 mb-1">✓ Pipeline created and running</div>
                    <div className="text-green-400 mb-1">✓ Email masking enabled (SHA-256)</div>
                    <div className="text-gray-400 text-xs mt-2">
                      Latency: 0.3s | Rows/sec: 8,247 | Masking: email → hash
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MCP Tools List */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">31 MCP Tools Available</h3>
              <div className="space-y-3">
                {[
                  { category: 'Pipelines', tools: 'list, get, create, start, stop, pause, delete, metrics, checkpoints' },
                  { category: 'Connectors', tools: 'list, create, test, tables, schema, delete' },
                  { category: 'CDC', tools: 'start, stop, status, engines, events, replicate, reset, errors' },
                  { category: 'Billing', tools: 'plans, status, subscribe, usage, checkout' },
                  { category: 'Benchmarks', tools: 'run, reports, certification, suites' },
                ].map((g) => (
                  <div key={g.category} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                    <div className="text-white font-semibold text-sm mb-1">{g.category}</div>
                    <div className="text-gray-400 text-xs">{g.tools}</div>
                  </div>
                ))}
              </div>
              <div className="bg-cyan-950/20 border border-cyan-800/30 rounded-lg p-4">
                <div className="text-cyan-300 text-sm font-medium mb-1">Works with</div>
                <div className="text-gray-400 text-xs">Claude · Cursor · GitHub Copilot · Any MCP-compatible agent</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tier Hook */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Start free. Upgrade when you need more.</h2>
            <p className="text-gray-400 text-lg">The free tier is designed to get you hooked. When you hit the limit, you'll know it's worth paying for.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                name: 'Community',
                price: '$0',
                desc: 'Free forever',
                features: ['1 pipeline', '3 connectors', '10,000 rows/day', 'CLI access', 'Community support'],
                limit: 'When you hit 10K rows/day, replication pauses until tomorrow',
                cta: 'Start Free',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$300',
                desc: '/mo — Most Popular',
                features: ['Unlimited pipelines', 'All connectors', '5M rows/day', 'Web dashboard', 'MCP server (31 tools)', 'API access', 'Priority support'],
                limit: null,
                cta: 'Start 14-Day Trial',
                highlight: true,
              },
              {
                name: 'Business',
                price: '$2,000',
                desc: '/mo — For Production',
                features: ['Everything in Pro', 'SLA guarantee', 'SSO & RBAC', 'Audit logs', 'Dedicated support', 'Custom connectors'],
                limit: null,
                cta: 'Contact Sales',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-8 ${plan.highlight ? 'bg-gradient-to-b from-cyan-950/30 to-[#0d1117] border-2 border-cyan-500/50 relative' : 'bg-white/[0.03] border border-white/[0.06]'}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>}
                <h3 className="text-xl font-semibold mb-1 text-white">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                </div>
                <ul className="space-y-3 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      <span className="text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.limit && (
                  <div className="bg-yellow-950/20 border border-yellow-900/30 rounded-lg px-3 py-2 mb-4">
                    <div className="text-yellow-400 text-xs">⚠️ {plan.limit}</div>
                  </div>
                )}
                <Link href="/signup" className={`block text-center py-2.5 rounded-lg font-medium transition-all ${plan.highlight ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Upgrade triggers */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-white mb-4">How you'll know it's time to upgrade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { trigger: 'In-app banner', desc: 'When you hit 80% of your daily quota, a banner shows your usage and upgrade options' },
                { trigger: 'Email notification', desc: 'When free quota is exhausted, you get an email with usage stats and upgrade link' },
                { trigger: 'Pipeline pause', desc: 'At 100% quota, replication pauses. Next day it resumes. Upgrade to remove the limit.' },
              ].map((t) => (
                <div key={t.trigger} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
                  <div className="text-white font-semibold text-sm mb-1">{t.trigger}</div>
                  <div className="text-gray-400 text-xs">{t.desc}</div>
                </div>
              ))}
            </div>
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

function AIChatWidget() {
  return (
    <div id="pulsyn-chat-widget" className="fixed bottom-6 right-6 z-50">
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var isOpen = false;
          var messages = [];
          var container = document.getElementById('pulsyn-chat-widget');
          if (!container) return;

          var toggle = document.createElement('button');
          toggle.style.cssText = 'width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#2563eb);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(6,182,212,0.3);display:flex;align-items:center;justify-content:center;transition:all 0.2s;';
          toggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
          toggle.onclick = function() { toggleChat(); };

          var panel = document.createElement('div');
          panel.style.cssText = 'display:none;position:absolute;bottom:70px;right:0;width:380px;height:500px;background:#0d1117;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);flex-direction:column;';
          panel.innerHTML = '<div style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:space-between;"><div style="display:flex;align-items:center;gap:10px;"><div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#06b6d4,#2563eb);display:flex;align-items:center;justify-content:center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div><div><div style="font-weight:600;color:white;font-size:14px;">Pulsyn AI</div><div style="font-size:11px;color:#64748b;">Ask about CDC, pricing, setup</div></div></div><button onclick="this.closest(\\'#pulsyn-chat-widget\\').querySelector(\\'div\\').style.display=\\'none\\'" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:18px;">&times;</button></div><div id="pulsyn-chat-messages" style="flex:1;overflow-y:auto;padding:16px;"></div><div style="padding:12px 16px;border-top:1px solid rgba(255,255,255,0.05);"><form id="pulsyn-chat-form" style="display:flex;gap:8px;"><input id="pulsyn-chat-input" type="text" placeholder="Ask about CDC, connectors, pricing..." style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 14px;color:white;font-size:13px;outline:none;" /><button type="submit" style="background:linear-gradient(135deg,#06b6d4,#2563eb);border:none;border-radius:8px;padding:10px 14px;cursor:pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></button></form></div>';

          container.appendChild(toggle);
          container.appendChild(panel);

          document.getElementById('pulsyn-chat-form').onsubmit = function(e) {
            e.preventDefault();
            var input = document.getElementById('pulsyn-chat-input');
            var msg = input.value.trim();
            if (!msg) return;
            input.value = '';
            addMessage('user', msg);
            generateResponse(msg);
          };

          function toggleChat() {
            isOpen = !isOpen;
            panel.style.display = isOpen ? 'flex' : 'none';
            if (isOpen && messages.length === 0) {
              addMessage('bot', 'Hi! I can help you set up CDC pipelines, explain our pricing, or answer questions about connectors. What do you need?');
            }
          }

          function addMessage(type, text) {
            messages.push({type:type, text:text});
            var c = document.getElementById('pulsyn-chat-messages');
            var d = document.createElement('div');
            d.style.cssText = 'margin-bottom:12px;display:flex;justify-content:'+(type==='user'?'flex-end':'flex-start')+';';
            var b = document.createElement('div');
            b.style.cssText = 'max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word;white-space:pre-wrap;'+(type==='user'?'background:linear-gradient(135deg,#06b6d4,#2563eb);color:white;border-bottom-right-radius:4px;':'background:rgba(255,255,255,0.05);color:#e2e8f0;border-bottom-left-radius:4px;');
            b.textContent = text;
            d.appendChild(b); c.appendChild(d); c.scrollTop = c.scrollHeight;
          }

          function generateResponse(q) {
            q = q.toLowerCase();
            var r = '';
            if (q.match(/price|cost|plan|free/)) {
              r = 'Our pricing:\\n\\n• Community (Free): 1 pipeline, 3 connectors, 10K rows/day\\n• Pro ($300/mo): Unlimited pipelines, all connectors, 5M rows/day\\n• Business ($2,000/mo): SLA, SSO, dedicated support\\n\\nFree tier is forever. No credit card to start.';
            } else if (q.match(/connect|database|postgres|mysql|support/)) {
              r = 'Production-ready connectors:\\n• PostgreSQL (full CDC)\\n• MySQL (binlog CDC)\\n\\nComing soon: Oracle, SQL Server, MongoDB, Snowflake, BigQuery, Kafka, and more.\\n\\nEach connector is tested in our certification lab before release.';
            } else if (q.match(/start|begin|setup|install|how/)) {
              r = 'Quick start:\\n\\n1. Sign up free at pulsyn.io/signup\\n2. Install: npm install -g @pulsyn/cli\\n3. Create: pulsyn pipeline create --source postgres --target postgres\\n4. Start: pulsyn pipeline start\\n\\nOr ask me to walk you through it!';
            } else if (q.match(/mcp|ai|agent|claude|cursor/)) {
              r = 'We have 31 MCP tools for AI agents. You can:\\n\\n• Create pipelines with natural language\\n• Monitor replication status\\n• Test database connections\\n• View billing and usage\\n\\nWorks with Claude, Cursor, GitHub Copilot, and any MCP-compatible agent.';
            } else if (q.match(/free|limit|quota|upgrade/)) {
              r = 'Free tier limits:\\n• 1 pipeline\\n• 3 connectors\\n• 10,000 rows/day\\n\\nWhen you hit 80%, you\\'ll see an in-app banner. At 100%, replication pauses until tomorrow. Upgrade to Pro for 5M rows/day.';
            } else if (q.match(/security|safe|mask/)) {
              r = 'Security features:\\n• API key authentication\\n• Rate limiting\\n• IP blocking\\n• In-flight data masking (hash, redact, format-preserving)\\n• Audit logging\\n• Admin dashboard';
            } else {
              r = 'I can help with:\\n• Pricing and plans\\n• Supported connectors\\n• Getting started\\n• AI/MCP integration\\n• Security features\\n• Free tier limits\\n\\nWhat would you like to know?';
            }
            setTimeout(function(){ addMessage('bot', r); }, 500);
          }
        })();
      ` }} />
    </div>
  );
}
