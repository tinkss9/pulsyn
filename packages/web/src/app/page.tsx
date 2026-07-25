import Link from 'next/link';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time CDC',
    description: 'Log-based change data capture with sub-second latency. No polling, no batch jobs.',
  },
  {
    icon: '🔄',
    title: 'Checkpoint Recovery',
    description: 'Exactly-once semantics with visible, auditable checkpoints. Resume from any point.',
  },
  {
    icon: '🤖',
    title: 'AI Agent Integration',
    description: 'First CDC platform with MCP server. Control pipelines from Claude, Cursor, or any AI agent.',
  },
  {
    icon: '🔒',
    title: 'In-flight Masking',
    description: 'Mask sensitive data during replication. Hash, redact, or format-preserving encryption.',
  },
  {
    icon: '📊',
    title: 'Connector Certification',
    description: 'Measured throughput and correctness benchmarks per source/target pair.',
  },
  {
    icon: '☁️',
    title: 'Cloud Agnostic',
    description: 'PostgreSQL, MySQL, Oracle, SQL Server, MongoDB. Self-hosted or managed.',
  },
];

const PRICING = [
  {
    name: 'Community',
    price: '$0',
    interval: '',
    description: 'For individual developers',
    features: [
      '3 connectors',
      'Core CDC engine',
      'CLI access',
      'Self-hosted',
      'Community support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$300',
    interval: '/mo',
    description: 'For growing teams',
    features: [
      'Unlimited pipelines',
      'All connectors',
      'Web dashboard',
      'MCP server (26 tools)',
      'API access',
      'In-flight masking',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$2,000',
    interval: '/mo',
    description: 'For production workloads',
    features: [
      'Everything in Pro',
      'SLA guarantee',
      'SSO & RBAC',
      'Audit logs',
      'Dedicated support',
      'Custom connectors',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Connect',
    description: 'Add your source and target databases. Pulsyn auto-discovers tables and schemas.',
  },
  {
    step: '2',
    title: 'Configure',
    description: 'Select tables, set up masking rules, configure batch sizes and checkpoint intervals.',
  },
  {
    step: '3',
    title: 'Replicate',
    description: 'Start replication. Monitor throughput, lag, and errors in real-time.',
  },
  {
    step: '4',
    title: 'Scale',
    description: 'Add more pipelines, upgrade plans, or integrate with AI agents via MCP.',
  },
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
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">Docs</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-pulsyn-950/50 border border-pulsyn-800 rounded-full px-4 py-1.5 mb-8">
            <span className="text-pulsyn-400 text-sm font-medium">New</span>
            <span className="text-gray-400 text-sm">MCP integration for AI agents</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Real-time CDC<br />
            <span className="text-pulsyn-500">without the complexity</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Replicate databases with checkpoint recovery, connector certification, and AI agent integration.
            No Kafka dependency. No $50K contracts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Start Free Trial
            </Link>
            <a
              href="/docs"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Read the Docs
            </a>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required. 14-day free trial.</p>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="py-12 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-500 text-sm mb-8">Trusted by data teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            {['Acme Corp', 'DataCo', 'Streamline', 'Pipeline.io', 'SyncDB'].map((name) => (
              <span key={name} className="text-xl font-semibold text-gray-600">{name}</span>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-pulsyn-800 transition-colors"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Pulsyn vs Competitors */}
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
              <p className="text-gray-400 mb-4">
                Confluent requires running Kafka clusters. Debezium requires Kafka Connect. 
                Pulsyn runs standalone — no ZooKeeper, no Kafka brokers, no connector framework.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Zero infrastructure overhead
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Deploy in minutes, not days
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> 10x lower operational cost
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="text-sm font-medium text-yellow-400 mb-4">vs. Fivetran / Airbyte</div>
              <h3 className="text-xl font-semibold mb-4">True real-time, not batch</h3>
              <p className="text-gray-400 mb-4">
                Fivetran syncs every 15 minutes. Airbyte is batch-first. 
                Pulsyn streams changes in real-time with sub-second latency.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Sub-second latency
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> 75% cheaper at scale
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> API + CLI + MCP (not just UI)
                </li>
              </ul>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="text-sm font-medium text-blue-400 mb-4">vs. Everyone</div>
              <h3 className="text-xl font-semibold mb-4">AI-native from day one</h3>
              <p className="text-gray-400 mb-4">
                Pulsyn is the first CDC platform with an MCP server. 
                Control pipelines from Claude, Cursor, or any AI agent.
              </p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> 26 MCP tools for AI agents
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Natural language pipeline management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Built for the agentic future
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Four steps from zero to production replication.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-pulsyn-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
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
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-8 ${
                  plan.highlighted
                    ? 'bg-pulsyn-950/50 border-2 border-pulsyn-600 relative'
                    : 'bg-gray-900/50 border border-gray-800'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pulsyn-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
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
                <Link
                  href="/signup"
                  className={`block text-center py-2.5 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-pulsyn-600 hover:bg-pulsyn-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  }`}
                >
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
          <p className="text-gray-400 text-lg mb-8">
            Get started with a free trial. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-pulsyn-600 hover:bg-pulsyn-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-xl font-bold text-pulsyn-500">Pulsyn</span>
              <p className="text-gray-500 text-sm mt-2">
                The AI-Native CDC Platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
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
                <li>SQL Server</li>
                <li>MongoDB</li>
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
