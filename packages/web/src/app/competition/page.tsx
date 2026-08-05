'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Trophy, Zap, Clock, Users, Database, ArrowRight, 
  CheckCircle, Star, TrendingUp, Shield, Award, Flame,
  ChevronRight, Globe, Target, BarChart3
} from 'lucide-react';

const PHASES = [
  {
    name: 'Qualifiers',
    status: 'active',
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
    status: 'upcoming',
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
    status: 'upcoming',
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
    status: 'upcoming',
    weeks: 'Week 8',
    participants: '10',
    entry: 'Free (qualified)',
    prize: '$10,000',
    description: 'Live-streamed final challenge. 1 winner takes $10K.',
    color: 'red',
    icon: Flame,
  },
];

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'DataNinja_42', rowsPerSec: 142567, score: 9847, country: 'US', badge: '🏆' },
  { rank: 2, name: 'ReplicateKing', rowsPerSec: 138923, score: 9712, country: 'DE', badge: '🥈' },
  { rank: 3, name: 'PostgresPro', rowsPerSec: 134567, score: 9654, country: 'UK', badge: '🥉' },
  { rank: 4, name: 'CDCMaster', rowsPerSec: 129845, score: 9523, country: 'JP', badge: '' },
  { rank: 5, name: 'StreamQueen', rowsPerSec: 125678, score: 9412, country: 'CA', badge: '' },
  { rank: 6, name: 'PipelineGuru', rowsPerSec: 121234, score: 9301, country: 'AU', badge: '' },
  { rank: 7, name: 'ByteShifter', rowsPerSec: 118901, score: 9187, country: 'FR', badge: '' },
  { rank: 8, name: 'DataFlowX', rowsPerSec: 115678, score: 9076, country: 'SG', badge: '' },
  { rank: 9, name: 'SyncMaster', rowsPerSec: 112345, score: 8965, country: 'BR', badge: '' },
  { rank: 10, name: 'ReplicateBot', rowsPerSec: 109876, score: 8854, country: 'IN', badge: '' },
];

const STATS = [
  { label: 'Registered', value: '2,847', icon: Users },
  { label: 'Countries', value: '64', icon: Globe },
  { label: 'Total Rows', value: '12.4B', icon: Database },
  { label: 'Peak Rows/s', value: '142K', icon: TrendingUp },
];

export default function CompetitionPage() {
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);
  const [gauntletRunning, setGauntletRunning] = useState(false);
  const [gauntletSession, setGauntletSession] = useState<any>(null);
  const [gauntletLogs, setGauntletLogs] = useState<string[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to register
    setRegistered(true);
  };

  const startGauntlet = async () => {
    setGauntletRunning(true);
    setGauntletLogs(['Starting Gauntlet...']);
    
    try {
      const res = await fetch('/api/competition/gauntlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          displayName: 'Demo Player',
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setGauntletSession(data.data);
        setGauntletLogs(prev => [...prev, `Session created: ${data.data.sessionId}`]);
        
        // Poll for updates
        pollGauntletStatus(data.data.sessionId);
      } else {
        setGauntletLogs(prev => [...prev, `Error: ${data.error}`]);
        setGauntletRunning(false);
      }
    } catch (err) {
      setGauntletLogs(prev => [...prev, `Error: ${(err as Error).message}`]);
      setGauntletRunning(false);
    }
  };

  const pollGauntletStatus = async (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/competition/gauntlet?sessionId=${sessionId}`);
        const data = await res.json();
        
        if (data.data) {
          setGauntletSession(data.data);
          setGauntletLogs(data.data.logs || []);
          
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            clearInterval(interval);
            setGauntletRunning(false);
          }
        }
      } catch {
        // Ignore polling errors
      }
    }, 2000);
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
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-8">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">Season 1 — Now Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
            The Pulsyn<br />Replication Race
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            The world's first CDC competition. Race to replicate data at scale. 
            Win $40,000 in prizes. Prove you're the fastest data engineer alive.
          </p>
          
          {/* Prize pool highlight */}
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl px-8 py-4 mb-12">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div className="text-left">
              <div className="text-3xl font-bold text-amber-400">$40,000</div>
              <div className="text-sm text-amber-300/70">Total Prize Pool</div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#register"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              Register Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/competition/leaderboard"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              View Leaderboard <BarChart3 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competition Phases */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              4 phases. 8 weeks. One champion. Open to everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHASES.map((phase, i) => (
              <div 
                key={phase.name}
                className={`relative bg-white/[0.02] border rounded-2xl p-6 hover:bg-white/[0.04] transition-all ${
                  phase.status === 'active' 
                    ? 'border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                    : 'border-white/5'
                }`}
              >
                {phase.status === 'active' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    LIVE NOW
                  </div>
                )}
                
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

      {/* Leaderboard Preview */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Live Leaderboard</h2>
              <p className="text-gray-400">Week 2 Qualifiers — Updated every 60 seconds</p>
            </div>
            <Link 
              href="/competition/leaderboard"
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              View Full Board <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_140px_100px_60px] gap-4 px-6 py-3 border-b border-white/5 text-xs text-gray-500 uppercase">
              <div>Rank</div>
              <div>Competitor</div>
              <div className="text-right">Rows/sec</div>
              <div className="text-right">Score</div>
              <div className="text-right">Country</div>
            </div>
            
            {LEADERBOARD_PREVIEW.map((entry) => (
              <div 
                key={entry.rank}
                className={`grid grid-cols-[60px_1fr_140px_100px_60px] gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                  entry.rank <= 3 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {entry.badge && <span>{entry.badge}</span>}
                  <span className={`font-mono ${entry.rank <= 3 ? 'text-white font-bold' : 'text-gray-400'}`}>
                    #{entry.rank}
                  </span>
                </div>
                <div className="font-medium">{entry.name}</div>
                <div className="text-right font-mono text-cyan-400">
                  {entry.rowsPerSec.toLocaleString()}
                </div>
                <div className="text-right font-mono text-amber-400">
                  {entry.score.toLocaleString()}
                </div>
                <div className="text-right text-gray-500">{entry.country}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Scoring System</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Objective, measurable, transparent. No judges, no bias.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Score Formula
              </h3>
              <div className="bg-black/30 rounded-xl p-4 font-mono text-sm mb-6">
                <div className="text-gray-400">Score = </div>
                <div className="text-cyan-400">  (rows_per_sec × 0.40)</div>
                <div className="text-green-400">  + (data_integrity × 0.30)</div>
                <div className="text-purple-400">  + (checkpoint_recovery × 0.20)</div>
                <div className="text-amber-400">  + (masking_efficiency × 0.10)</div>
              </div>
              <p className="text-sm text-gray-400">
                All metrics are automatically measured by the Pulsyn benchmark engine. 
                No self-reporting, no cheating.
              </p>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Anti-Cheat
              </h3>
              <ul className="space-y-3">
                {[
                  'All runs on Pulsyn-provided Docker containers',
                  'Source data randomized per competitor',
                  'Checksums verified on target database',
                  'Pre-loaded data prohibited',
                  'Network traffic monitored',
                  'Replays available for top 100',
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prizes</h2>
            <p className="text-gray-400">$40,000 total prize pool across all phases</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Grand Prize */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-8 text-center">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <div className="text-sm text-amber-300 mb-2">Grand Champion</div>
              <div className="text-4xl font-bold text-amber-400 mb-2">$10,000</div>
              <div className="text-sm text-gray-400">+ Trophy + Featured Interview</div>
            </div>
            
            {/* Top 50 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-400 mb-2">Top 50 Finalists</div>
              <div className="text-4xl font-bold text-white mb-2">$500 each</div>
              <div className="text-sm text-gray-400">= $25,000 total</div>
            </div>
            
            {/* Semifinals */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <Star className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <div className="text-sm text-purple-300 mb-2">Semifinal Pool</div>
              <div className="text-4xl font-bold text-purple-400 mb-2">$5,000</div>
              <div className="text-sm text-gray-400">Distributed among qualifiers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Register Now</h2>
          <p className="text-gray-400 mb-8">
            Free to enter. No credit card required. Open worldwide.
          </p>
          
          {!registered ? (
            <form onSubmit={handleRegister} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                required
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap"
              >
                Register Free
              </button>
            </form>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">You're In!</h3>
              <p className="text-gray-400">
                Check your email for setup instructions. Competition starts immediately.
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-4">
            By registering you agree to the <Link href="/competition/rules" className="text-cyan-400 hover:underline">Competition Rules</Link> and <Link href="/legal/terms" className="text-cyan-400 hover:underline">Terms of Service</Link>.
          </p>
        </div>
      </section>

      {/* The Gauntlet */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
              <Flame className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-300 font-medium">5-Stage Obstacle Course</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Gauntlet</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              5 stages. Real failures. Prove your CDC skills.
            </p>
          </div>

          {/* Stages */}
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            {[
              { name: 'SPEED', icon: Zap, color: 'cyan', desc: '1M rows' },
              { name: 'CHAOS', icon: Shield, color: 'red', desc: 'Failures' },
              { name: 'CRAFT', icon: Star, color: 'purple', desc: 'Transforms' },
              { name: 'ENDURANCE', icon: TrendingUp, color: 'amber', desc: 'Sustain' },
              { name: 'BOSS', icon: Trophy, color: 'pink', desc: 'Multi-engine' },
            ].map((stage) => (
              <div key={stage.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                <stage.icon className={`w-8 h-8 text-${stage.color}-400 mx-auto mb-2`} />
                <div className="font-semibold text-sm">{stage.name}</div>
                <div className="text-xs text-gray-500">{stage.desc}</div>
              </div>
            ))}
          </div>

          {/* Start Gauntlet Button */}
          {!gauntletRunning && !gauntletSession && (
            <div className="text-center">
              <button
                onClick={startGauntlet}
                className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                <Flame className="w-5 h-5" />
                Start The Gauntlet
              </button>
              <p className="text-sm text-gray-500 mt-3">Takes ~5 minutes. Docker required.</p>
            </div>
          )}

          {/* Gauntlet Progress */}
          {(gauntletRunning || gauntletSession) && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Gauntlet Progress</h3>
                <span className={`text-sm px-3 py-1 rounded-full ${
                  gauntletSession?.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                  gauntletSession?.status === 'running' ? 'bg-cyan-500/10 text-cyan-400' :
                  'bg-gray-500/10 text-gray-400'
                }`}>
                  {gauntletSession?.status || 'Starting...'}
                </span>
              </div>

              {/* Stage Progress */}
              {gauntletSession?.stages && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {gauntletSession.stages.map((stage: any) => (
                    <div key={stage.name} className={`text-center p-3 rounded-lg ${
                      stage.status === 'completed' ? 'bg-green-500/10' :
                      stage.status === 'running' ? 'bg-cyan-500/10 animate-pulse' :
                      'bg-white/[0.02]'
                    }`}>
                      <div className="text-xs text-gray-500">{stage.name}</div>
                      <div className="text-lg font-bold">{stage.score || '-'}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Score */}
              {gauntletSession?.totalScore > 0 && (
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500">Total Score</div>
                  <div className="text-4xl font-bold text-amber-400">{gauntletSession.totalScore}</div>
                  <div className="text-lg font-semibold">{gauntletSession.rank}</div>
                </div>
              )}

              {/* Logs */}
              <div className="bg-black/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                <div className="font-mono text-xs space-y-1">
                  {gauntletLogs.map((log, i) => (
                    <div key={i} className="text-gray-400">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-sm text-gray-500 mb-8">SUPPORTED BY</div>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {['Supabase', 'Neon', 'Railway', 'Cloudflare', 'Snowflake'].map((sponsor) => (
              <div key={sponsor} className="text-xl font-semibold text-gray-400">{sponsor}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
