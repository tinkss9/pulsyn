'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Trophy, Zap, Clock, Users, Database, ArrowRight, 
  CheckCircle, Star, TrendingUp, Shield, Award, Flame,
  ChevronRight, Globe, Target, BarChart3, Bell, Rocket
} from 'lucide-react';

const PHASES = [
  {
    name: 'Qualifiers',
    status: 'planned',
    weeks: 'Weeks 1-4',
    participants: 'Unlimited',
    entry: 'Free',
    prize: 'None',
    description: 'Weekly leaderboards. Top 100 each week advance to Semifinals.',
    color: 'cyan',
    icon: Zap,
  },
  {
    name: 'Semifinals',
    status: 'planned',
    weeks: 'Weeks 5-6',
    participants: '10,000 max',
    entry: '$5',
    prize: '$5,000',
    description: 'Complex challenges: multi-table replication, checkpoint recovery, masking under load. Top 100 advance.',
    color: 'purple',
    icon: Target,
  },
  {
    name: 'Finals',
    status: 'planned',
    weeks: 'Week 7',
    participants: '100',
    entry: 'Free (qualified)',
    prize: '$25,000',
    description: 'Live head-to-head replication. Top 50 win $500 each.',
    color: 'amber',
    icon: Trophy,
  },
  {
    name: 'Grand Finale',
    status: 'planned',
    weeks: 'Week 8',
    participants: '10',
    entry: 'Free (qualified)',
    prize: '$10,000',
    description: 'Live-streamed final challenge. 1 winner takes $10K.',
    color: 'red',
    icon: Flame,
  },
];

const FAQ = [
  {
    q: 'When does the competition start?',
    a: 'We\'re finalizing the infrastructure and benchmark engine now. Early registrants will be the first to know when Season 1 launches.',
  },
  {
    q: 'Is it really free to enter?',
    a: 'Yes! The Qualifier phase is completely free. Semifinals have a small $5 entry fee to ensure serious competitors. Finals and Grand Finale are free for qualified participants.',
  },
  {
    q: 'What do I need to participate?',
    a: 'A Pulsyn account (free) and basic knowledge of databases and CDC. We provide Docker containers with all the infrastructure — you just write the replication logic.',
  },
  {
    q: 'How are metrics measured?',
    a: 'All metrics are automatically measured by the Pulsyn benchmark engine running on our infrastructure. No self-reporting. Full transparency.',
  },
  {
    q: 'Can I use any programming language?',
    a: 'The competition uses Pulsyn\'s connector SDK (TypeScript/Python). You write connectors that implement the standard interface. We\'re exploring broader language support for future seasons.',
  },
];

export default function CompetitionPage() {
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to register interest
    setRegistered(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
            <Rocket className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-300 font-medium">Coming Soon — Register for Early Access</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
            The Pulsyn<br />Replication Race
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
            The world's first CDC competition. Race to replicate data at scale. 
            Prove you're the fastest data engineer alive.
          </p>
          
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
            We're building the competition infrastructure now — real benchmark engine, 
            transparent metrics, Docker-based isolation. No simulated data. No fake leaderboards.
          </p>
          
          {/* Prize pool highlight */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl px-8 py-4 mb-12">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div className="text-left">
              <div className="text-3xl font-bold text-amber-400">$40,000</div>
              <div className="text-sm text-amber-300/70">Projected Prize Pool</div>
            </div>
          </div>
          
          {/* Registration Form */}
          <div id="register" className="max-w-md mx-auto">
            {registered ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-green-300 font-semibold">You're on the list!</p>
                <p className="text-sm text-green-400/70 mt-1">
                  We'll notify you as soon as Season 1 launches.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for early access"
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* What We're Building */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8">What We're Building</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <Database className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-semibold mb-2">Real Infrastructure</h3>
              <p className="text-sm text-gray-400">
                Docker-based containers with PostgreSQL, MySQL, MongoDB, Snowflake, and BigQuery. 
                Real databases, real replication, real metrics.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <BarChart3 className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-semibold mb-2">Transparent Metrics</h3>
              <p className="text-sm text-gray-400">
                All metrics automatically measured by the Pulsyn benchmark engine. 
                No self-reporting. Full audit trail. Open-source scoring.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <Shield className="w-6 h-6 text-cyan-400 mb-3" />
              <h3 className="font-semibold mb-2">Anti-Cheat</h3>
              <p className="text-sm text-gray-400">
                All runs happen on our infrastructure. Code is reviewed. 
                Results are verified. Fair play enforced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competition Phases */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Planned Structure</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              4 phases over 8 weeks. Open to everyone. Dates announced soon.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHASES.map((phase, i) => (
              <div 
                key={phase.name}
                className="relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-${phase.color}-500/10 flex items-center justify-center`}>
                    <phase.icon className={`w-5 h-5 text-${phase.color}-400`} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Phase {i + 1}</div>
                    <div className="font-semibold">{phase.name}</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">{phase.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-300">{phase.weeks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Entry</span>
                    <span className="text-gray-300">{phase.entry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Prize</span>
                    <span className="text-amber-400 font-semibold">{phase.prize}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Connectors */}
      <section className="py-16 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Supported Connectors</h2>
          <p className="text-center text-gray-400 mb-8">
            Competition will use our certified connectors. Here's what's ready:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-green-400">Certified</span>
              </div>
              <h3 className="font-semibold mb-2">Database Sources</h3>
              <p className="text-sm text-gray-400 mb-3">Full CDC support, integration tested</p>
              <div className="flex flex-wrap gap-2">
                {['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'].map(db => (
                  <span key={db} className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">{db}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-white/[0.02] border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-sm font-medium text-blue-400">Verified</span>
              </div>
              <h3 className="font-semibold mb-2">Database Targets</h3>
              <p className="text-sm text-gray-400 mb-3">Write support, real drivers</p>
              <div className="flex flex-wrap gap-2">
                {['Snowflake', 'BigQuery', 'ClickHouse'].map(db => (
                  <span key={db} className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{db}</span>
                ))}
              </div>
            </div>
            
            <div className="bg-white/[0.02] border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <span className="text-sm font-medium text-purple-400">Preview</span>
              </div>
              <h3 className="font-semibold mb-2">SaaS Sources</h3>
              <p className="text-sm text-gray-400 mb-3">REST API connectors, community tested</p>
              <div className="flex flex-wrap gap-2">
                {['Stripe', 'Salesforce', 'HubSpot', 'GitHub', '+36 more'].map(db => (
                  <span key={db} className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">{db}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-sm text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Be the First to Know</h2>
          <p className="text-gray-400 mb-8">
            Early registrants get priority access and exclusive competition updates.
          </p>
          <div id="register-bottom" className="max-w-md mx-auto">
            {registered ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-green-300 font-semibold">You're on the list!</p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>Pulsyn Replication Race — Coming Soon</p>
          <p className="mt-1">Real infrastructure. Transparent metrics. No simulated data.</p>
        </div>
      </footer>
    </div>
  );
}
