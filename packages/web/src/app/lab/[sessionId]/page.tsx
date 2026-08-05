'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  ArrowLeft, Eye, Clock, Database, Code, GitBranch, Heart,
  MessageSquare, ThumbsUp, Activity, Play, Pause, RefreshCw,
  Share2, Flag, ChevronDown, ChevronUp, Send, Users
} from 'lucide-react';

interface SessionData {
  id: string;
  user: string;
  category: string;
  status: 'live' | 'completed' | 'scheduled';
  startedAt: string;
  duration: number; // minutes
  viewers: number;
  metrics: {
    rowsPerSec: number;
    totalRows: number;
    dataIntegrity: number;
    checkpointRecovery: number;
    maskingEfficiency: number;
    toolsUsed: number;
    enginePairs: number;
  };
  likes: number;
  comments: Comment[];
  timeline: TimelineEvent[];
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface TimelineEvent {
  time: string;
  event: string;
  detail: string;
}

const MOCK_SESSION: SessionData = {
  id: 'sess-001',
  user: 'DataNinja_42',
  category: 'rows',
  status: 'live',
  startedAt: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
  duration: 60,
  viewers: 234,
  metrics: {
    rowsPerSec: 142567,
    totalRows: 198456789,
    dataIntegrity: 99.99,
    checkpointRecovery: 98.5,
    maskingEfficiency: 94.2,
    toolsUsed: 8,
    enginePairs: 2,
  },
  likes: 456,
  comments: [
    { id: '1', user: 'ReplicateKing', text: 'Insane throughput! How did you optimize the batch size?', timestamp: '2m ago', likes: 12 },
    { id: '2', user: 'PostgresPro', text: 'The checkpoint recovery is clean. What flush interval are you using?', timestamp: '5m ago', likes: 8 },
    { id: '3', user: 'CDCMaster', text: 'Watching from Tokyo. This is faster than our production setup!', timestamp: '8m ago', likes: 15 },
    { id: '4', user: 'StreamQueen', text: 'Can you show the masking config? Want to see the overhead.', timestamp: '12m ago', likes: 6 },
    { id: '5', user: 'PipelineGuru', text: 'The data integrity at this speed is impressive. 99.99%!', timestamp: '15m ago', likes: 9 },
  ],
  timeline: [
    { time: '00:00', event: 'Session started', detail: 'PostgreSQL → PostgreSQL' },
    { time: '02:15', event: 'Pipeline created', detail: '3 tables, 1M rows' },
    { time: '03:42', event: 'Replication started', detail: 'Batch size: 10,000' },
    { time: '08:30', event: 'Checkpoint saved', detail: 'LSN: 0/1234567' },
    { time: '12:45', event: 'Masking enabled', detail: 'Email hash, PII redact' },
    { time: '18:20', event: 'Checkpoint recovered', detail: 'Resume in 2.3s' },
    { time: '23:00', event: 'Live now', detail: '142,567 rows/s' },
  ],
};

export default function SessionViewerPage({ params }: { params: { sessionId: string } }) {
  const [session] = useState<SessionData>(MOCK_SESSION);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showTimeline, setShowTimeline] = useState(true);
  const [elapsed, setElapsed] = useState(23 * 60); // seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call
    setCommentText('');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-20">
        {/* Top Bar */}
        <div className="bg-white/[0.02] border-b border-white/5 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/lab" className="text-gray-500 hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Lab
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-400 font-medium">LIVE</span>
              </div>
              <div className="text-sm text-gray-500">
                {session.user} — {session.category === 'rows' ? 'Most Rows' : session.category === 'tools' ? 'Most Tools' : 'Multi-Replication'}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Eye className="w-4 h-4" /> {session.viewers} watching
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" /> {formatTime(elapsed)}
              </div>
              <button className="text-gray-500 hover:text-white">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="text-gray-500 hover:text-red-400">
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid lg:grid-cols-[1fr_350px] gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              {/* Metrics Dashboard */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Live Metrics
                  </h2>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-xs text-gray-500">Auto-refreshing</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Rows/sec</div>
                    <div className="text-2xl font-bold font-mono text-cyan-400">
                      {session.metrics.rowsPerSec.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Total Rows</div>
                    <div className="text-2xl font-bold font-mono text-white">
                      {(session.metrics.totalRows / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Data Integrity</div>
                    <div className="text-2xl font-bold font-mono text-green-400">
                      {session.metrics.dataIntegrity}%
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Recovery</div>
                    <div className="text-2xl font-bold font-mono text-purple-400">
                      {session.metrics.checkpointRecovery}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Masking Efficiency</div>
                    <div className="text-lg font-bold font-mono text-amber-400">
                      {session.metrics.maskingEfficiency}%
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Tools Used</div>
                    <div className="text-lg font-bold font-mono text-purple-400">
                      {session.metrics.toolsUsed}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Engine Pairs</div>
                    <div className="text-lg font-bold font-mono text-amber-400">
                      {session.metrics.enginePairs}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Live Terminal */}
              <div className="bg-black/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">pulsyn-session-{session.id}</span>
                  </div>
                  <button className="text-xs text-gray-500 hover:text-white">Copy</button>
                </div>
                
                <div className="p-4 font-mono text-sm h-64 overflow-y-auto">
                  {session.timeline.map((event, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-gray-500">[{event.time}]</span>{' '}
                      <span className="text-green-400">{event.event}</span>{' '}
                      <span className="text-gray-400">— {event.detail}</span>
                    </div>
                  ))}
                  <div className="mb-2">
                    <span className="text-gray-500">[{formatTime(elapsed)}]</span>{' '}
                    <span className="text-cyan-400 animate-pulse">Replicating...</span>{' '}
                    <span className="text-gray-400">— {session.metrics.rowsPerSec.toLocaleString()} rows/s</span>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <button 
                  onClick={() => setShowTimeline(!showTimeline)}
                  className="w-full flex items-center justify-between"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Session Timeline
                  </h3>
                  {showTimeline ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                </button>
                
                {showTimeline && (
                  <div className="mt-4 space-y-3">
                    {session.timeline.map((event, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-16 text-xs text-gray-500 font-mono pt-1">{event.time}</div>
                        <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium">{event.event}</div>
                          <div className="text-xs text-gray-500">{event.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Engagement */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      liked 
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    <span className="font-mono">{session.likes + (liked ? 1 : 0)}</span>
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-mono">{session.comments.length}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-400 ml-auto">
                    <Eye className="w-4 h-4" />
                    <span className="font-mono">{session.viewers}</span>
                  </div>
                </div>
              </div>
              
              {/* Chat */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Live Chat
                  </h3>
                </div>
                
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  {session.comments.map((comment) => (
                    <div key={comment.id} className="group">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {comment.user[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user}</span>
                            <span className="text-xs text-gray-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-gray-300 mt-0.5">{comment.text}</p>
                          <button className="text-xs text-gray-500 hover:text-white mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ThumbsUp className="w-3 h-3" /> {comment.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleComment} className="p-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button 
                      type="submit"
                      className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Session Info */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h3 className="font-semibold text-sm mb-3">Session Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Competitor</span>
                    <span>{session.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="capitalize">{session.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Source</span>
                    <span>PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target</span>
                    <span>PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span>{session.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="text-red-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Report */}
              <button className="w-full text-xs text-gray-500 hover:text-red-400 flex items-center justify-center gap-1 py-2">
                <Flag className="w-3 h-3" /> Report Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
