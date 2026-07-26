'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Animated Globe Component
function AnimatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 600, H = 600;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2, cy = H / 2, R = 200;

    // Dots on the globe
    const dots: { lat: number; lon: number; phase: number }[] = [];
    for (let i = 0; i < 200; i++) {
      dots.push({
        lat: Math.acos(2 * Math.random() - 1),
        lon: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Data flow lines
    const flows = [
      { from: { lat: 0.5, lon: -1.2 }, to: { lat: 0.8, lon: 2.5 } }, // US → EU
      { from: { lat: 0.6, lon: 2.1 }, to: { lat: 1.0, lon: 0.8 } },   // EU → Asia
      { from: { lat: 1.2, lon: 0.3 }, to: { lat: 0.4, lon: -0.5 } },  // Asia → SA
      { from: { lat: 0.3, lon: -0.8 }, to: { lat: 0.9, lon: 1.8 } },  // SA → Africa
      { from: { lat: 1.1, lon: 1.5 }, to: { lat: 0.5, lon: -1.0 } },  // Africa → US
    ];

    let t = 0;
    const project = (lat: number, lon: number, rot: number) => {
      const x = Math.sin(lat) * Math.cos(lon + rot);
      const y = Math.cos(lat);
      const z = Math.sin(lat) * Math.sin(lon + rot);
      return { x: cx + R * x * 0.8, y: cy - R * y * 0.8, z };
    };

    const draw = () => {
      t += 0.003;
      ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
      ctx.fillRect(0, 0, W, H);

      // Globe outline
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // Grid lines
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.05)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * Math.sin(a), R * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Dots
      for (const dot of dots) {
        const p = project(dot.lat, dot.lon, t);
        if (p.z > 0) {
          const brightness = 0.2 + 0.8 * (p.z / R);
          const pulse = 0.5 + 0.5 * Math.sin(t * 2 + dot.phase);
          ctx.fillStyle = `rgba(6, 182, 212, ${brightness * pulse * 0.8})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5 + brightness, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Data flow lines
      for (const flow of flows) {
        const p1 = project(flow.from.lat, flow.from.lon, t);
        const p2 = project(flow.to.lat, flow.to.lon, t);
        if (p1.z > 0 && p2.z > 0) {
          const progress = (t * 2) % 1;
          const mx = p1.x + (p2.x - p1.x) * progress;
          const my = p1.y + (p2.y - p1.y) * progress;

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Traveling dot
          ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
          ctx.beginPath();
          ctx.arc(mx, my, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
          ctx.beginPath();
          ctx.arc(mx, my, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ maxWidth: 600, maxHeight: 600 }} />;
}

// Data Flow Animation Component
function DataFlowAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 900, H = 200;
    canvas.width = W;
    canvas.height = H;

    const sources = [
      { x: 80, y: 60, label: 'PostgreSQL', color: '#336791' },
      { x: 80, y: 100, label: 'MongoDB', color: '#47A248' },
      { x: 80, y: 140, label: 'Stripe', color: '#635BFF' },
    ];

    const targets = [
      { x: 780, y: 60, label: 'Snowflake', color: '#29B5E8' },
      { x: 780, y: 100, label: 'BigQuery', color: '#4285F4' },
      { x: 780, y: 140, label: 'Data Warehouse', color: '#FF6B35' },
    ];

    const engine = { x: 430, y: 100, label: 'Pulsyn CDC Engine', color: '#06B6D4' };

    let t = 0;
    const draw = () => {
      t += 0.015;
      ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
      ctx.fillRect(0, 0, W, H);

      // Draw connections
      for (const src of sources) {
        // Source → Engine
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(src.x + 60, src.y);
        ctx.lineTo(engine.x - 60, engine.y);
        ctx.stroke();

        // Traveling data packet
        const prog1 = (t + sources.indexOf(src) * 0.3) % 1;
        const x1 = src.x + 60 + (engine.x - 60 - src.x - 60) * prog1;
        const y1 = src.y + (engine.y - src.y) * prog1;
        ctx.fillStyle = src.color;
        ctx.beginPath();
        ctx.arc(x1, y1, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = src.color + '40';
        ctx.beginPath();
        ctx.arc(x1, y1, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const tgt of targets) {
        // Engine → Target
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(engine.x + 60, engine.y);
        ctx.lineTo(tgt.x - 60, tgt.y);
        ctx.stroke();

        // Traveling data packet
        const prog2 = (t + targets.indexOf(tgt) * 0.3) % 1;
        const x2 = engine.x + 60 + (tgt.x - 60 - engine.x - 60) * prog2;
        const y2 = engine.y + (tgt.y - engine.y) * prog2;
        ctx.fillStyle = tgt.color;
        ctx.beginPath();
        ctx.arc(x2, y2, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = tgt.color + '40';
        ctx.beginPath();
        ctx.arc(x2, y2, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Source boxes
      for (const src of sources) {
        ctx.fillStyle = src.color + '20';
        ctx.strokeStyle = src.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(src.x - 50, src.y - 15, 100, 30, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(src.label, src.x, src.y + 4);
      }

      // Engine box
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(engine.x - 70, engine.y - 25, 140, 50, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(engine.label, engine.x, engine.y + 4);

      // Target boxes
      for (const tgt of targets) {
        ctx.fillStyle = tgt.color + '20';
        ctx.strokeStyle = tgt.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tgt.x - 50, tgt.y - 15, 100, 30, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tgt.label, tgt.x, tgt.y + 4);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-auto rounded-xl" style={{ maxWidth: 900 }} />;
}

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
        response = 'Pulsyn has 763 connectors — more than Fivetran (700+), Airbyte (300+), or Estuary (200+). We cover databases, warehouses, SaaS, payments, CRM, analytics, healthcare, fintech, education, government, logistics, travel, and more. 756 are solid implementations with real drivers and API calls (99.1% quality rate).';
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        response = 'Pulsyn starts free (3 pipelines, 1K rows/day). Starter is $99/mo, Pro is $499/mo, Business is $1,999/mo, and Enterprise starts at $9,999/mo. We\'re 5x cheaper than Fivetran and 2x cheaper than Airbyte at the Business tier.';
      } else if (lower.includes('fast') || lower.includes('latency') || lower.includes('real-time')) {
        response = 'Pulsyn delivers <1 second CDC latency — true real-time. Fivetran syncs every 15 minutes, Airbyte is batch-first. Our log-based CDC engine captures changes as they happen, not on a schedule.';
      } else if (lower.includes('setup') || lower.includes('start') || lower.includes('begin')) {
        response = 'Getting started is easy: 1) Sign up free at pulsynai.com/signup, 2) Connect your source (PostgreSQL, MySQL, MongoDB, etc.), 3) Connect your target (Snowflake, BigQuery, etc.), 4) Create a pipeline. Most users are replicating data in under 5 minutes.';
      } else if (lower.includes('fivetran') || lower.includes('compare') || lower.includes('alternative')) {
        response = 'Pulsyn vs Fivetran: We have MORE connectors (763 vs 700+), FASTER latency (<1s vs 15 min), CHEAPER pricing ($99-499/mo vs $500-50K/mo), and UNIQUE features like AI schema mapping and MCP protocol integration. Plus we\'re self-hosted.';
      } else if (lower.includes('mcp') || lower.includes('ai agent') || lower.includes('claude')) {
        response = 'Pulsyn has 26 MCP tools for AI agent integration. You can control pipelines from Claude, Cursor, or any MCP-compatible agent. Tools include: connect, discover, map, sync, monitor, transform, validate, and certify. First CDC platform with MCP support.';
      } else if (lower.includes('self-host') || lower.includes('on-prem') || lower.includes('deploy')) {
        response = 'Yes! Pulsyn supports self-hosted deployment. Run it on your own infrastructure for compliance requirements. We support Docker, Kubernetes, and bare metal. Enterprise plans include on-premises support with dedicated engineers.';
      } else if (lower.includes('stripe') || lower.includes('payment') || lower.includes('billing')) {
        response = 'We support Stripe, PayPal, Braintree, Adyen, Square, and 6 more payment connectors. Real-time CDC for payment data means you can detect fraud, reconcile transactions, and monitor subscriptions as they happen.';
      } else if (lower.includes('healthcare') || lower.includes('hipaa') || lower.includes('medical')) {
        response = 'We have 8 healthcare connectors: Epic, Cerner, Athenahealth, eClinicalWorks, NextGen, MEDITECH, Practice Fusion, and drchrono. All support FHIR endpoints. Self-hosted deployment available for HIPAA compliance.';
      } else if (lower.includes('test') || lower.includes('demo') || lower.includes('try')) {
        response = 'Try our demo at pulsynai.com/demo — no signup required. We have 5 demo connectors (PostgreSQL, MySQL, Stripe, Shopify, HubSpot) with simulated data. See real-time metrics, data flow, and pipeline health.';
      } else {
        response = 'I can help with: connector selection, pricing, setup guides, comparisons with Fivetran/Airbyte, AI agent integration (MCP), self-hosted deployment, and specific industry use cases. What would you like to know?';
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
            <a href="#ai" className="text-sm text-gray-400 hover:text-white transition-colors">AI</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="/demo" className="text-sm text-gray-400 hover:text-white transition-colors">Demo</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero with Animated Globe */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.12),transparent_50%)]" />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-950/40 border border-cyan-800/40 rounded-full px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-300 text-sm">763 connectors — more than Fivetran</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-[1.1]">
                <span className="text-white">Real-time data.</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Zero latency.</span>
              </h1>

              <p className="text-xl text-gray-400 max-w-xl mb-4 leading-relaxed">
                763 connectors. &lt;1 second CDC. AI-powered schema mapping. 10x cheaper than Fivetran.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3.5 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-cyan-500/20">
                  Start Free →
                </Link>
                <a href="/demo" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl text-lg font-medium transition-all">
                  Try Demo
                </a>
              </div>

              <p className="text-gray-600 text-sm">No credit card · Free forever · 763 connectors</p>
            </div>

            {/* Right: Animated Globe */}
            <div className="flex justify-center">
              <AnimatedGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow Animation */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-8">See your data flow in real-time</h2>
          <DataFlowAnimation />
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '763', label: 'Connectors' },
            { value: '<1s', label: 'CDC Latency' },
            { value: '0.9%', label: 'Shell Rate' },
            { value: '5x', label: 'Cheaper' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
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
                  { solution: '763 connectors, 5x cheaper than Fivetran', icon: '💎' },
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
              { icon: '🤖', title: 'AI Agent Integration', desc: '26 MCP tools. Control pipelines from Claude, Cursor, or any agent.' },
              { icon: '🧠', title: 'AI Schema Mapping', desc: 'Auto-map fields across 763 connectors. Type inference. Conflict resolution.' },
              { icon: '🔒', title: 'In-flight Masking', desc: 'Hash, redact, or format-preserving encryption during replication.' },
              { icon: '📊', title: 'Connector Certification', desc: 'Measured throughput and correctness benchmarks per pair.' },
              { icon: '🛡️', title: 'Enterprise Security', desc: 'API keys, rate limiting, IP blocking, brute-force protection.' },
              { icon: '📡', title: '763 Connectors', desc: 'Databases, warehouses, SaaS, payments, CRM, analytics, healthcare, fintech, and more.' },
              { icon: '☁️', title: 'Deploy Anywhere', desc: 'Self-hosted, managed cloud, or hybrid. Docker or Vercel.' },
              { icon: '📈', title: 'Real-time Monitoring', desc: 'Pipeline health, latency, throughput, errors. Grafana integration.' },
              { icon: '🔄', title: 'Data Mesh', desc: 'Multi-tenant, governance, compliance. Enterprise-grade data mesh.' },
              { icon: '💰', title: '10x Cheaper', desc: '$99-499/mo vs Fivetran\'s $500-50K/mo. Same features, fraction of the cost.' },
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">763 connectors. All certified.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              756 solid implementations (99.1%). 7 shell connectors (0.9%). Industry-best quality rate.
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
              Browse All 763 Connectors →
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
                Our AI has full context of all 763 connectors, pricing, setup guides, and competitor comparisons. Ask it anything — from &quot;which connector for PostgreSQL?&quot; to &quot;how does Pulsyn compare to Fivetran?&quot;
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '$0', desc: 'Try Pulsyn risk-free', features: ['3 pipelines', '1K rows/day', '5 connectors', 'Community support'] },
              { name: 'Pro', price: '$499', desc: 'For growing teams', features: ['50 pipelines', '1M rows/day', '100 connectors', 'AI schema mapping', 'Priority support'], popular: true },
              { name: 'Enterprise', price: '$9,999+', desc: 'For large organizations', features: ['Unlimited pipelines', 'Unlimited rows', 'All 763 connectors', 'Dedicated engineer', 'SLA'], enterprise: true },
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
                <div className="text-5xl font-bold text-white mb-4">{tier.price}<span className="text-lg text-gray-400">/mo</span></div>
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
