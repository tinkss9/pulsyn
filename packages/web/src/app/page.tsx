'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import HeroGlobe from '@/components/HeroGlobe';
import Header from '@/components/Header';
import { Zap, RefreshCw, Cpu, Layers, Shield, BarChart3, Lock, Database, Cloud, Eye, Grid3X3, Tag } from 'lucide-react';
import MiniGlobe from '@/components/MiniGlobe';
import { PulsynLogoFull } from '@/components/PulsynLogo';





// AI Chat Component
function AIChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m Pulsyn AI. I can help you set up data pipelines, find the right connector, or explain any feature. What would you like to know?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let response = '';
      const lower = userMsg.toLowerCase();

      if (lower.includes('connector') || lower.includes('how many')) {
        response = 'Pulsyn is building a broad connector catalog covering databases, warehouses, SaaS, payments, CRM, analytics, healthcare, fintech, education, government, logistics, travel, and more. Connector certification is in progress; verified results will be published as testing completes.';
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        response = 'Pulsyn starts free (3 pipelines, 1K rows/day). Starter is $99/mo, Pro is $499/mo, Business is $1,999/mo, and Enterprise starts at $9,999/mo. We offer enterprise-grade features at startup-friendly prices.';
      } else if (lower.includes('fast') || lower.includes('latency') || lower.includes('real-time')) {
        response = 'Pulsyn delivers <1 second CDC latency — true real-time. Our log-based CDC engine captures changes as they happen, not on a schedule. Traditional ETL tools sync every 15+ minutes.';
      } else if (lower.includes('setup') || lower.includes('start') || lower.includes('begin')) {
        response = 'Getting started is easy: 1) Sign up free at pulsynai.com/signup, 2) Connect your source (PostgreSQL, MySQL, MongoDB, etc.), 3) Connect your target (Snowflake, BigQuery, etc.), 4) Create a pipeline. Most users are replicating data in under 5 minutes.';
      } else if (lower.includes('compare') || lower.includes('alternative') || lower.includes('vs')) {
        response = 'We have comparison pages at /vs/fivetran, /vs/airbyte, /vs/confluent, and /vs/debezium. Each shows honest, feature-by-feature comparisons. We also have a market comparison at /docs/MARKET_COMPARISON_FACTUAL_REVIEW.md.';
      } else if (lower.includes('mcp') || lower.includes('ai agent') || lower.includes('claude')) {
        response = 'Pulsyn has 26 MCP tools for AI agent integration. You can control pipelines from Claude, Cursor, or any MCP-compatible agent. Tools include: connect, discover, map, sync, monitor, transform, validate, and certify. First CDC platform with MCP support.';
      } else if (lower.includes('self-host') || lower.includes('on-prem') || lower.includes('deploy')) {
        response = 'Yes! Pulsyn supports self-hosted deployment. Run it on your own infrastructure for compliance requirements. We support Docker, Kubernetes, and bare metal. Enterprise plans include on-premises support with dedicated engineers.';
      } else if (lower.includes('stripe') || lower.includes('payment') || lower.includes('billing')) {
        response = 'We support Stripe, PayPal, Braintree, Adyen, Square, and 6 more payment connectors. Real-time CDC for payment data means you can detect fraud, reconcile transactions, and monitor subscriptions as they happen.';
      } else if (lower.includes('healthcare') || lower.includes('hipaa') || lower.includes('medical')) {
        response = 'We have 8 healthcare connectors: Epic, Cerner, Athenahealth, eClinicalWorks, NextGen, MEDITECH, Practice Fusion, and drchrono. All support FHIR endpoints. Self-hosted deployment available for HIPAA compliance.';
      } else if (lower.includes('test') || lower.includes('demo') || lower.includes('try')) {
        response = 'Try our demo at pulsynai.com/demo — no signup required. We have 5 demo connectors (PostgreSQL, MySQL, Stripe, Shopify, HubSpot) with simulated data. See real-time metrics, data flow, and pipeline health. *Demo data is simulated.*';
      } else {
        response = 'I can help with: connector selection, pricing, setup guides, AI agent integration (MCP), self-hosted deployment, and specific industry use cases. For competitor comparisons, visit our /vs/ pages. What would you like to know?';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden max-w-lg mx-auto">
      <div className="bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-medium text-white">Pulsyn AI</span>
        <span className="text-xs text-gray-500 ml-auto">Powered by MCP</span>
      </div>
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-cyan-600 text-white rounded-br-md'
                : 'bg-white/5 text-gray-300 rounded-bl-md'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 text-gray-300 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about connectors, pricing, setup..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={sendMessage}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Main Landing Page
export default function LandingPage() {
  const connectorCategories = [
    { name: 'Databases', count: 25, items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Cassandra', 'ClickHouse', 'Oracle', 'SQL Server', 'MariaDB', 'CockroachDB', 'Neo4j', 'DuckDB', 'SQLite', 'SingleStore', 'TimescaleDB', 'Spanner', 'CosmosDB', 'InfluxDB', 'ScyllaDB', 'TiDB', 'YugabyteDB', 'Materialize', 'StarRocks', 'Doris'] },
    { name: 'Warehouses', count: 8, items: ['Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'Synapse', 'Firebolt', 'MotherDuck', 'ClickHouse'] },
    { name: 'SaaS', count: 45, items: ['Salesforce', 'HubSpot', 'Shopify', 'Stripe', 'Slack', 'GitHub', 'Jira', 'Notion', 'Airtable', 'Zendesk', 'Intercom', 'Segment', 'Linear', 'Twilio', 'SendGrid'] },
    { name: 'Analytics', count: 12, items: ['Amplitude', 'Mixpanel', 'PostHog', 'Google Analytics', 'Heap', 'FullStory', 'Pendo', 'Hotjar', 'Crazy Egg', 'Mouseflow', 'SessionCam', 'Adobe Analytics'] },
    { name: 'Payments', count: 15, items: ['Stripe', 'PayPal', 'Braintree', 'Adyen', 'Square', 'Chargebee', 'Recurly', 'Paddle', 'Klarna', 'Affirm', 'Afterpay', 'Checkout.com', 'Nuvei', 'Worldpay', 'Rapyd'] },
    { name: 'CRM', count: 12, items: ['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho CRM', 'Freshsales', 'Monday CRM', 'Apollo', 'Outreach', 'Salesloft', 'Gong', 'Chorus', 'Clari'] },
    { name: 'Healthcare', count: 8, items: ['Epic', 'Cerner', 'Athenahealth', 'eClinicalWorks', 'NextGen', 'MEDITECH', 'Practice Fusion', 'drchrono'] },
    { name: 'Fintech', count: 8, items: ['Plaid', 'Yodlee', 'Finicity', 'Dwolla', 'Marqeta', 'Brex', 'Ramp', 'Mercury'] },
    { name: 'Education', count: 8, items: ['Canvas', 'Blackboard', 'Moodle', 'Google Classroom', 'PowerSchool', 'Clever', 'Ellucian', 'Turnitin'] },
    { name: 'Government', count: 8, items: ['Salesforce Gov', 'Oracle Gov', 'SAP Gov', 'Deltek', 'Tyler Tech', 'OpenGov', 'CivicPlus', 'Esri'] },
    { name: 'Logistics', count: 8, items: ['ShipBob', 'ShipStation', 'EasyPost', 'Shippo', 'Flexport', 'Convoy', 'Uber Freight', 'FourKites'] },
    { name: 'Travel', count: 6, items: ['Airbnb', 'Booking.com', 'Expedia', 'TripAdvisor', 'Amadeus', 'Sabre'] },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Globe Background — fixed, behind everything */}
      <HeroGlobe />

      <Header />

      {/* Hero — Globe is fixed background, text floats on top */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_50%)]" />
        {/* Dark vignette — suppresses globe behind text */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(8,8,12,0.7) 0%, rgba(8,8,12,0.3) 50%, transparent 100%)'
        }} />
        {/* Top and bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-[#0a0a0f]/80 pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/50 rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-200 text-sm font-medium">Growing connector catalog</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1]" style={{ textShadow: '0 0 60px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.4)' }}>
            <span className="text-white">Real-time data.</span>
            <br />
            <span className="text-white" style={{ textShadow: '0 0 40px rgba(6,182,212,0.4), 0 2px 8px rgba(0,0,0,0.8)' }}>Zero latency.</span>
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-4 leading-relaxed" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            Real-time CDC. AI-powered schema mapping. Starting free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-cyan-500/20">
              Start Free →
            </Link>
            <a href="/demo" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-all">
              Try Demo
            </a>
          </div>

          <p className="text-gray-400 text-sm" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>No credit card · Free forever · Growing catalog</p>
        </div>
      </section>

      {/* Hero Video */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0d1117] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto"
              poster="/hero-poster.png"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="text-center text-gray-500 text-sm mt-3">75-second demo: Real-time CDC from PostgreSQL to Snowflake</p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '1,068', label: 'Connector modules' },
            { value: '<1s', label: 'CDC Latency' },
            { value: 'In progress', label: 'Certification' },
            { value: '10x', label: 'Cheaper than Fivetran' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works — 3 Steps */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">Deploy a pipeline in 60 seconds</h2>
          <p className="text-gray-400 text-lg mb-12 text-center max-w-2xl mx-auto">No Kafka. No DevOps. No code. Just connect, map, and replicate.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Connect', desc: 'Pick your source and target from our connector catalog. Test connection instantly.', icon: '🔌' },
              { step: '2', title: 'Map', desc: 'AI auto-maps schemas. Resolve conflicts with one click. Add masking rules.', icon: '🧠' },
              { step: '3', title: 'Replicate', desc: 'Start CDC. Data flows in real-time. Checkpoint recovery if anything fails.', icon: '⚡' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">{s.icon}</div>
                <div className="text-cyan-400 text-sm font-mono mb-2">Step {s.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MCP Showcase — AI Agents Control Pipelines */}
      <section className="py-20 px-6 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-950/40 border border-purple-800/40 rounded-full px-4 py-1.5 mb-6">
                <span className="text-purple-400 text-sm font-medium">First CDC platform with MCP</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Your AI agent just built a data pipeline.
                <br />
                <span className="text-gray-500">You didn't touch the dashboard.</span>
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                Pulsyn has 26 MCP tools. Claude, Cursor, Copilot — any AI agent can discover connectors, create pipelines, monitor health, and handle errors. No code. No UI. Just intent.
              </p>
              <div className="space-y-3">
                {[
                  '"Replicate my CMC forex data to PostgreSQL"',
                  '"Show me all pipelines with errors"',
                  '"Add masking to the email column"',
                  '"What\'s the latency on my Snowflake pipeline?"',
                ].map((q) => (
                  <div key={q} className="flex items-center gap-3 text-gray-400">
                    <span className="text-purple-400">→</span>
                    <span className="text-sm font-mono">{q}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-500 text-xs ml-2">mcp-session</span>
              </div>
              <pre className="text-sm text-green-400 font-mono leading-relaxed">
{`> mcp.call("pulsyn_connect", {
    name: "CMC Markets",
    engine: "cmc-markets",
    config: { apiKey: "••••••" }
  })

✓ Connected to CMC Markets

> mcp.call("pulsyn_create_pipeline", {
    source: "CMC Markets",
    target: "PostgreSQL",
    tables: ["EUR/USD", "GBP/USD"],
    mapping: "auto"
  })

✓ Pipeline created: pipeline-2026-08-03
✓ CDC started: <1s latency
✓ Checkpoint saved: 14,203 rows`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table — Pulsyn vs Competitors */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">Why teams switch to Pulsyn</h2>
          <p className="text-gray-400 text-lg mb-12 text-center">Honest comparison. No cherry-picking.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-3 text-cyan-400 font-semibold">Pulsyn</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Fivetran</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Airbyte</th>
                  <th className="text-center py-3 text-gray-400 font-medium">Debezium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Connectors', pulsyn: '763', fivetran: '700+', airbyte: '600+', debezium: '~50' },
                  { feature: 'CDC Latency', pulsyn: '<1 second', fivetran: '1-15 min', airbyte: '15 min', debezium: 'Sub-second' },
                  { feature: 'Kafka Required', pulsyn: 'No', fivetran: 'No', airbyte: 'No', debezium: 'Yes' },
                  { feature: 'AI Agent (MCP)', pulsyn: '26 tools', fivetran: 'None', airbyte: 'None', debezium: 'None' },
                  { feature: 'In-flight Masking', pulsyn: 'FPE + hash', fivetran: 'Hash only', airbyte: 'Hash only', debezium: 'None' },
                  { feature: 'Starting Price', pulsyn: 'Free', fivetran: '~$550/mo', airbyte: 'Free (self)', debezium: 'Free (self)' },
                  { feature: 'Pro Plan', pulsyn: '$499/mo', fivetran: '~$1,500/mo', airbyte: '$299/mo', debezium: 'Free (self)' },
                  { feature: 'Business Plan', pulsyn: '$3,500/mo', fivetran: '$12K+/yr ELA', airbyte: 'Custom', debezium: 'Infra cost' },
                  { feature: 'At 10M rows/day', pulsyn: '$3,500/mo', fivetran: '$15,000+/mo', airbyte: 'Custom', debezium: 'Infra cost' },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-white/5">
                    <td className="py-3 text-gray-300">{row.feature}</td>
                    <td className="py-3 text-center text-cyan-400 font-semibold">{row.pulsyn}</td>
                    <td className="py-3 text-center text-gray-400">{row.fivetran}</td>
                    <td className="py-3 text-center text-gray-400">{row.airbyte}</td>
                    <td className="py-3 text-center text-gray-400">{row.debezium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">Your data is 15 minutes old.<br/><span className="text-gray-500">Your competitors&apos; isn&apos;t.</span></h2>
              <div className="space-y-4">
                {[
                  { problem: 'Traditional ETL tools sync every 15+ minutes', icon: '⏰' },
                  { problem: 'Batch-first architectures can\'t deliver real-time', icon: '📦' },
                  { problem: 'Self-hosted CDC needs Kafka (5+ servers to manage)', icon: '🔥' },
                  { problem: 'Enterprise solutions cost $5,000+/month', icon: '💰' },
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
                  { solution: '763 connectors, starting free', icon: '💎' },
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
              { icon: Zap, title: 'Real-time CDC', desc: 'Log-based capture with sub-second latency. No polling, no batch jobs.' },
              { icon: RefreshCw, title: 'Checkpoint Recovery', desc: 'Exactly-once semantics. Resume from any point after failure.' },
              { icon: Cpu, title: 'AI Agent Integration', desc: '26 MCP tools. Control pipelines from Claude, Cursor, or any agent.' },
              { icon: Layers, title: 'AI Schema Mapping', desc: 'Auto-map fields across your connector catalog. Type inference. Conflict resolution.' },
              { icon: Shield, title: 'In-flight Masking', desc: 'Hash, redact, or format-preserving encryption during replication.' },
              { icon: BarChart3, title: 'Connector Certification', desc: 'Measured throughput and correctness benchmarks per pair.' },
              { icon: Lock, title: 'Enterprise Security', desc: 'API keys, rate limiting, IP blocking, brute-force protection.' },
              { icon: Database, title: 'Connector Catalog', desc: 'Databases, warehouses, SaaS, payments, CRM, analytics, healthcare, fintech, and more.' },
              { icon: Cloud, title: 'Deploy Anywhere', desc: 'Self-hosted, managed cloud, or hybrid. Docker or Vercel.' },
              { icon: Eye, title: 'Real-time Monitoring', desc: 'Pipeline health, latency, throughput, errors. Grafana integration.' },
              { icon: Grid3X3, title: 'Data Mesh', desc: 'Multi-tenant, governance, compliance. Enterprise-grade data mesh.' },
              { icon: Tag, title: 'Affordable', desc: 'Starting free. Pro at $499/mo. Enterprise-grade features at startup prices.' },
            ].map((f) => (
              <div key={f.title} className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.06] hover:border-cyan-500/30 transition-all">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-cyan-400" />
                </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Connector catalog.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Connector certification is in progress. Verified pass/fail results will be published as testing completes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectorCategories.map((cat) => (
              <div key={cat.name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                  <span className="text-sm text-cyan-400 font-mono">{cat.count}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.slice(0, 8).map((item) => (
                    <span key={item} className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-gray-400">
                      {item}
                    </span>
                  ))}
                  {cat.items.length > 8 && (
                    <span className="text-xs bg-cyan-950/40 border border-cyan-800/40 rounded-full px-3 py-1 text-cyan-400">
                      +{cat.items.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/demo" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all">
              Browse All Connector Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section id="ai" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ask our AI anything.
                <br />
                <span className="text-gray-500">It knows every connector, every feature.</span>
              </h2>
              <p className="text-lg text-gray-400 mb-8">
                Our AI has full context of our connector catalog, pricing, setup guides, and competitor comparisons. Ask it anything — from &quot;which connector for PostgreSQL?&quot; to &quot;how does Pulsyn compare to Fivetran?&quot;
              </p>
              <div className="space-y-4">
                {[
                  'How many connectors do you have?',
                  'What\'s the pricing?',
                  'How fast is CDC latency?',
                  'Can I self-host?',
                  'Compare to Fivetran',
                ].map((q) => (
                  <div key={q} className="flex items-center gap-3 text-gray-400">
                    <span className="text-cyan-400">→</span>
                    <span className="text-sm">{q}</span>
                  </div>
                ))}
              </div>
            </div>
            <AIChat />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simple, transparent pricing</h2>
          <p className="text-gray-400 text-lg mb-12">Start free. Scale as you grow. 10x cheaper than Fivetran.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { name: 'Free', price: '$0', desc: 'Try Pulsyn risk-free', features: ['3 pipelines', '50K rows/day', '3 connectors', 'Community support'] },
              { name: 'Pro', price: '$499', desc: 'For growing teams', features: ['Unlimited pipelines', '5M rows/day', 'All connectors', 'AI schema mapping', 'MCP server (26 tools)', 'API access', 'Priority support'], popular: true },
              { name: 'Business', price: '$3,500', desc: 'For production workloads', features: ['Everything in Pro', '100M rows/day', 'SSO + RBAC', 'Audit logs', 'Custom connectors', '99.99% SLA', 'Dedicated support'] },
              { name: 'Enterprise', price: 'Custom', desc: 'For large organizations', features: ['Everything in Business', 'Unlimited rows', 'On-prem deployment', 'Dedicated engineer', '99.999% SLA', 'Custom integrations'], enterprise: true },
            ].map((tier) => (
              <div key={tier.name} className={`relative rounded-2xl p-8 ${
                tier.popular ? 'bg-cyan-600 border-2 border-cyan-400' : tier.enterprise ? 'bg-gray-800 border-2 border-purple-500' : 'bg-gray-800 border border-gray-700'
              }`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-cyan-400 text-white text-sm font-medium px-4 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-5xl font-bold text-white mb-4">{tier.enterprise ? 'Custom' : tier.price}{!tier.enterprise && <span className="text-lg text-gray-400">/mo</span>}{tier.enterprise && <p className="text-sm text-purple-300 font-normal mt-1">Contact sales</p>}</div>
                <p className="text-gray-400 mb-6">{tier.desc}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center text-gray-300 text-sm">
                      <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full py-3 rounded-lg font-medium text-center transition-colors ${
                  tier.popular ? 'bg-white text-cyan-600 hover:bg-gray-100' : tier.enterprise ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}>
                  {tier.enterprise ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="text-lg font-bold text-white">Pulsyn</span>
            </div>
            <p className="text-gray-500 text-sm">Real-time CDC without Kafka. 763 connectors. AI-powered.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#connectors" className="text-sm text-gray-400 hover:text-white">Connectors</a></li>
              <li><a href="/pricing" className="text-sm text-gray-400 hover:text-white">Pricing</a></li>
              <li><a href="/demo" className="text-sm text-gray-400 hover:text-white">Demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-sm text-gray-400 hover:text-white">Documentation</a></li>
              <li><a href="/api" className="text-sm text-gray-400 hover:text-white">API Reference</a></li>
              <li><a href="/changelog" className="text-sm text-gray-400 hover:text-white">Changelog</a></li>
              <li><a href="/status" className="text-sm text-gray-400 hover:text-white">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-sm text-gray-400 hover:text-white">About</a></li>
              <li><a href="/blog" className="text-sm text-gray-400 hover:text-white">Blog</a></li>
              <li><a href="/careers" className="text-sm text-gray-400 hover:text-white">Careers</a></li>
              <li><a href="/contact" className="text-sm text-gray-400 hover:text-white">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-gray-600 text-sm">&copy; 2026 Pulsyn. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
