'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Trophy, Zap, Clock, Users, Database, ArrowRight, 
  CheckCircle, Star, TrendingUp, Shield, Award, Flame,
  ChevronRight, Globe, Target, BarChart3, Play, Eye,
  Calendar, Monitor, Code, GitBranch, Activity, Heart,
  MessageSquare, ThumbsUp, Video, Radio, BookOpen
} from 'lucide-react';

const COMPETITION_CATEGORIES = [
  {
    id: 'rows',
    name: 'Most Rows Replicated',
    icon: Database,
    color: 'cyan',
    description: 'Replicate the highest volume of data in your session. Raw throughput wins.',
    metric: 'rows/sec',
    weight: '40%',
    criteria: [
      'Total rows replicated during session',
      'Sustained rows/sec (not burst)',
      'Data integrity must be 100%',
      'No pre-loaded data allowed',
    ],
  },
  {
    id: 'tools',
    name: 'Most Tools Tested',
    icon: Code,
    color: 'purple',
    description: 'Use the most Pulsyn features in one session. CLI, MCP, API, masking, transforms.',
    metric: 'tools used',
    weight: '30%',
    criteria: [
      'Count unique Pulsyn features used',
      'CLI commands, MCP tools, API calls',
      'Masking rules, transforms, filters',
      'Must produce working output for each',
    ],
  },
  {
    id: 'multi',
    name: 'Multi-Replication Master',
    icon: GitBranch,
    color: 'amber',
    description: 'Replicate across the most engine combinations. PG→MySQL, MySQL→Mongo, etc.',
    metric: 'engine pairs',
    weight: '20%',
    criteria: [
      'Unique source→target engine pairs',
      'Each pair must complete successfully',
      'Checkpoint recovery demonstrated',
      'Cross-engine data integrity verified',
    ],
  },
  {
    id: 'community',
    name: 'Community Choice',
    icon: Heart,
    color: 'red',
    description: 'Most liked and commented session. The community votes for the best demo.',
    metric: 'likes + comments',
    weight: '10%',
    criteria: [
      'Session must be publicly visible',
      'Likes and comments counted',
      'Quality of presentation matters',
      'Community voting period: 48 hours',
    ],
  },
];

const LAB_FEATURES = [
  {
    icon: Monitor,
    title: 'Live Session Viewer',
    description: 'Every lab session is recorded and visible in real-time. Watch competitors work live.',
  },
  {
    icon: Calendar,
    title: 'Book 1-Hour Slots',
    description: 'Reserve your lab time. Peak hours have more viewers. Off-peak = less competition.',
  },
  {
    icon: Activity,
    title: 'Real-Time Metrics',
    description: 'Live dashboard shows rows/sec, integrity, tools used, engine pairs — updated every second.',
  },
  {
    icon: Video,
    title: 'Session Replays',
    description: 'Every session is recorded. Top 10 finalists\' replays are archived permanently.',
  },
  {
    icon: Radio,
    title: 'Live Finals',
    description: 'Top 10 compete head-to-head in a live-streamed event. Chat, commentary, real-time scoring.',
  },
  {
    icon: MessageSquare,
    title: 'Community Voting',
    description: 'Watch sessions, leave comments, vote for Community Choice. Engagement drives visibility.',
  },
];

const UPCOMING_SLOTS = [
  { time: '09:00 UTC', available: 12, booked: 8 },
  { time: '10:00 UTC', available: 15, booked: 5 },
  { time: '11:00 UTC', available: 15, booked: 12 },
  { time: '12:00 UTC', available: 15, booked: 15 },
  { time: '13:00 UTC', available: 15, booked: 3 },
  { time: '14:00 UTC', available: 15, booked: 7 },
  { time: '15:00 UTC', available: 15, booked: 10 },
  { time: '16:00 UTC', available: 15, booked: 14 },
];

const LIVE_SESSIONS = [
  { id: 'sess-001', user: 'DataNinja_42', category: 'rows', viewers: 234, rowsPerSec: 142567, status: 'live', startedAgo: '23m' },
  { id: 'sess-002', user: 'ReplicateKing', category: 'tools', viewers: 156, toolsUsed: 12, status: 'live', startedAgo: '45m' },
  { id: 'sess-003', user: 'PostgresPro', category: 'multi', viewers: 89, enginePairs: 5, status: 'live', startedAgo: '12m' },
  { id: 'sess-004', user: 'CDCMaster', category: 'rows', viewers: 67, rowsPerSec: 129845, status: 'live', startedAgo: '56m' },
];

const LEADERBOARD = [
  { rank: 1, name: 'DataNinja_42', category: 'rows', score: 9847, metric: '142,567 rows/s', likes: 456, comments: 89, badge: '🏆' },
  { rank: 2, name: 'ReplicateKing', category: 'tools', score: 9712, metric: '14 tools used', likes: 389, comments: 67, badge: '🥈' },
  { rank: 3, name: 'PostgresPro', category: 'multi', score: 9654, metric: '6 engine pairs', likes: 312, comments: 54, badge: '🥉' },
  { rank: 4, name: 'CDCMaster', category: 'rows', score: 9523, metric: '129,845 rows/s', likes: 278, comments: 45, badge: '' },
  { rank: 5, name: 'StreamQueen', category: 'tools', score: 9412, metric: '13 tools used', likes: 245, comments: 38, badge: '' },
  { rank: 6, name: 'PipelineGuru', category: 'multi', score: 9301, metric: '5 engine pairs', likes: 212, comments: 32, badge: '' },
  { rank: 7, name: 'ByteShifter', category: 'rows', score: 9187, metric: '118,901 rows/s', likes: 189, comments: 28, badge: '' },
  { rank: 8, name: 'DataFlowX', category: 'community', score: 9076, metric: '456 likes', likes: 456, comments: 89, badge: '' },
  { rank: 9, name: 'SyncMaster', category: 'rows', score: 8965, metric: '112,345 rows/s', likes: 167, comments: 24, badge: '' },
  { rank: 10, name: 'ReplicateBot', category: 'tools', score: 8854, metric: '12 tools used', likes: 145, comments: 21, badge: '' },
];

export default function LabPage() {
  const [selectedCategory, setSelectedCategory] = useState('rows');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-8">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-sm text-purple-300 font-medium">Live Sessions Happening Now</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Pulsyn Lab
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Book a 1-hour lab session. Compete live. Everything recorded. 
            The world watches. Top 10 go to the finals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#book"
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" /> Book Lab Session
            </Link>
            <Link 
              href="#live"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" /> Watch Live
            </Link>
          </div>
        </div>
      </section>

      {/* Live Sessions */}
      <section id="live" className="py-16 border-y border-white/5 bg-red-500/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-2xl font-bold">Live Now</h2>
            <span className="text-gray-500">{LIVE_SESSIONS.length} sessions</span>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LIVE_SESSIONS.map((session) => (
              <Link 
                key={session.id}
                href={`/lab/${session.id}`}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">LIVE</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    {session.viewers}
                  </div>
                </div>
                
                <div className="font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                  {session.user}
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  {session.category === 'rows' && `${session.rowsPerSec?.toLocaleString()} rows/s`}
                  {session.category === 'tools' && `${session.toolsUsed} tools used`}
                  {session.category === 'multi' && `${session.enginePairs} engine pairs`}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-white/5 px-2 py-1 rounded capitalize">{session.category}</span>
                  <span>{session.startedAgo} ago</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Competition Categories */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Competition Categories</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Four ways to win. Strict acceptance criteria. No ambiguity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPETITION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-left bg-white/[0.02] border rounded-2xl p-6 transition-all ${
                  selectedCategory === cat.id 
                    ? `border-${cat.color}-500/30 shadow-lg shadow-${cat.color}-500/10` 
                    : 'border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-${cat.color}-500/10 flex items-center justify-center`}>
                    <cat.icon className={`w-5 h-5 text-${cat.color}-400`} />
                  </div>
                  <div>
                    <div className="font-semibold">{cat.name}</div>
                    <div className="text-xs text-gray-500">{cat.weight} of score</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">{cat.description}</p>
                
                <div className="space-y-2">
                  {cat.criteria.map((criterion, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                      <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {criterion}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How the Lab Works</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Book, compete, get watched. Everything is recorded and visible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {LAB_FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <feature.icon className="w-8 h-8 text-purple-400 mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Lab Session */}
      <section id="book" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Book Your Lab Session</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              1-hour slots. Peak hours have more viewers. Choose wisely.
            </p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Slot Selection */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Available Slots — Tomorrow
                </h3>
                
                <div className="space-y-3">
                  {UPCOMING_SLOTS.map((slot) => {
                    const isFull = slot.available === slot.booked;
                    const isPopular = slot.booked > 10;
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => !isFull && setSelectedSlot(slot.time)}
                        disabled={isFull}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedSlot === slot.time
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : isFull
                            ? 'bg-white/[0.01] border border-white/5 opacity-50 cursor-not-allowed'
                            : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-mono">{slot.time}</span>
                          {isPopular && (
                            <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                              Popular
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isFull ? 'bg-red-500' : isPopular ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(slot.booked / slot.available) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {isFull ? 'Full' : `${slot.available - slot.booked} left`}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Booking Form */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Session Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Display Name</label>
                    <input 
                      type="text" 
                      placeholder="Your competitor name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Primary Category</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-purple-500">
                      <option value="rows">Most Rows Replicated</option>
                      <option value="tools">Most Tools Tested</option>
                      <option value="multi">Multi-Replication Master</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Source Engine</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-purple-500">
                      <option>PostgreSQL</option>
                      <option>MySQL</option>
                      <option>Oracle</option>
                      <option>SQL Server</option>
                      <option>MongoDB</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Target Engine</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-purple-500">
                      <option>PostgreSQL</option>
                      <option>MySQL</option>
                      <option>Oracle</option>
                      <option>SQL Server</option>
                      <option>MongoDB</option>
                      <option>Snowflake</option>
                      <option>BigQuery</option>
                    </select>
                  </div>
                  
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Selected Slot</span>
                      <span className="font-mono">{selectedSlot || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Duration</span>
                      <span>1 hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cost</span>
                      <span className="text-green-400 font-semibold">Free</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                    Book Session
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    Your session will be recorded and visible to all viewers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Leaderboard</h2>
              <p className="text-gray-400">Week 2 — Combined score across all categories</p>
            </div>
            <Link 
              href="/competition/leaderboard"
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              Full Leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_120px_140px_80px_80px] gap-4 px-6 py-3 border-b border-white/5 text-xs text-gray-500 uppercase">
              <div>Rank</div>
              <div>Competitor</div>
              <div>Category</div>
              <div className="text-right">Top Metric</div>
              <div className="text-center">Likes</div>
              <div className="text-center">Comments</div>
            </div>
            
            {LEADERBOARD.map((entry) => (
              <div 
                key={entry.rank}
                className={`grid grid-cols-[60px_1fr_120px_140px_80px_80px] gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                  entry.rank <= 3 ? 'bg-white/[0.02]' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {entry.badge && <span>{entry.badge}</span>}
                  <span className={`font-mono ${entry.rank <= 3 ? 'font-bold' : 'text-gray-400'}`}>
                    #{entry.rank}
                  </span>
                </div>
                <div className="font-medium">{entry.name}</div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                    entry.category === 'rows' ? 'bg-cyan-500/10 text-cyan-400' :
                    entry.category === 'tools' ? 'bg-purple-500/10 text-purple-400' :
                    entry.category === 'multi' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {entry.category}
                  </span>
                </div>
                <div className="text-right font-mono text-gray-300">
                  {entry.metric}
                </div>
                <div className="text-center flex items-center justify-center gap-1 text-gray-400">
                  <ThumbsUp className="w-3 h-3" /> {entry.likes}
                </div>
                <div className="text-center flex items-center justify-center gap-1 text-gray-400">
                  <MessageSquare className="w-3 h-3" /> {entry.comments}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top 10 Live Finals */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Top 10 Live Finals</h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8">
              The top 10 competitors from the leaderboard compete head-to-head in a 
              live-streamed final event. Chat, commentary, real-time scoring. 
              The world watches.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/[0.02] rounded-xl p-4">
                <div className="text-2xl font-bold text-amber-400">$10,000</div>
                <div className="text-sm text-gray-400">Grand Prize</div>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-4">
                <div className="text-2xl font-bold text-white">Live Streamed</div>
                <div className="text-sm text-gray-400">YouTube + Twitch + X</div>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-400">2 Hours</div>
                <div className="text-sm text-gray-400">Final Challenge</div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="#book"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Compete for a Spot
              </Link>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                Set Reminder
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Choice */}
      <section className="py-24 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Choice Awards</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The community votes. Most liked and commented sessions win. 
              Engagement matters as much as performance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ThumbsUp className="w-6 h-6 text-blue-400" />
                <h3 className="font-semibold">Most Liked Session</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                The session with the most community likes wins. Likes are public and 
                cannot be gamed (one like per user per session).
              </p>
              <div className="bg-white/[0.02] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Current Leader</span>
                  <span className="font-semibold">DataNinja_42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Likes</span>
                  <span className="text-blue-400 font-mono">456</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold">Most Discussed Session</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                The session that sparks the most conversation wins. Comments must be 
                substantive (minimum 20 characters) to count.
              </p>
              <div className="bg-white/[0.02] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Current Leader</span>
                  <span className="font-semibold">DataNinja_42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Comments</span>
                  <span className="text-green-400 font-mono">89</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-sm text-gray-500 mb-8">LAB POWERED BY</div>
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
