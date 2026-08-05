'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Play, Radio, Users, Eye, MessageSquare, ThumbsUp,
  Share2, Settings, Monitor, Wifi, WifiOff, Video,
  Youtube, Twitch, Globe, Clock, Activity, Zap
} from 'lucide-react';

const LIVE_STREAMS = [
  {
    id: 'stream-001',
    title: 'DataNinja_42 — Speed Run Challenge',
    streamer: 'DataNinja_42',
    platform: 'youtube',
    viewers: 1234,
    likes: 456,
    comments: 89,
    startedAt: '23 min ago',
    status: 'live',
    thumbnail: '/api/placeholder/320/180',
    category: 'rows',
  },
  {
    id: 'stream-002',
    title: 'ReplicateKing — Tool Master Attempt',
    streamer: 'ReplicateKing',
    platform: 'youtube',
    viewers: 856,
    likes: 312,
    comments: 67,
    startedAt: '45 min ago',
    status: 'live',
    thumbnail: '/api/placeholder/320/180',
    category: 'tools',
  },
  {
    id: 'stream-003',
    title: 'PostgresPro — Multi-Engine Demo',
    streamer: 'PostgresPro',
    platform: 'twitch',
    viewers: 567,
    likes: 234,
    comments: 45,
    startedAt: '12 min ago',
    status: 'live',
    thumbnail: '/api/placeholder/320/180',
    category: 'multi',
  },
];

const UPCOMING_STREAMS = [
  {
    id: 'upcoming-001',
    title: 'Grand Finals — Top 10 Showdown',
    streamer: 'Pulsyn Official',
    platform: 'youtube',
    scheduledFor: 'Tomorrow, 18:00 UTC',
    expectedViewers: '5,000+',
    status: 'scheduled',
  },
  {
    id: 'upcoming-002',
    title: 'Community Choice Awards Ceremony',
    streamer: 'Pulsyn Official',
    platform: 'youtube',
    scheduledFor: 'Friday, 20:00 UTC',
    expectedViewers: '2,000+',
    status: 'scheduled',
  },
];

const PLATFORM_ICONS: Record<string, any> = {
  youtube: Youtube,
  twitch: Twitch,
};

const PLATFORM_COLORS: Record<string, string> = {
  youtube: 'text-red-400',
  twitch: 'text-purple-400',
};

export default function StreamPage() {
  const [selectedStream, setSelectedStream] = useState(LIVE_STREAMS[0]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Radio className="w-8 h-8 text-red-400 animate-pulse" />
                Live Streams
              </h1>
              <p className="text-gray-400">Watch competitors live on YouTube and Twitch</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                {LIVE_STREAMS.reduce((sum, s) => sum + s.viewers, 0).toLocaleString()} watching
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-[1fr_350px] gap-6">
            {/* Main Stream */}
            <div className="space-y-6">
              {/* Video Player */}
              <div className="bg-black rounded-2xl overflow-hidden aspect-video relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <div className="text-gray-400">Stream Preview</div>
                    <div className="text-sm text-gray-500 mt-2">
                      {selectedStream.title}
                    </div>
                  </div>
                </div>
                
                {/* Live Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                </div>
                
                {/* Viewer Count */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{selectedStream.viewers.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Stream Info */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedStream.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{selectedStream.streamer}</span>
                      <span>•</span>
                      <span>{selectedStream.startedAt}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedStream.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const PlatformIcon = PLATFORM_ICONS[selectedStream.platform];
                      return PlatformIcon ? (
                        <PlatformIcon className={`w-5 h-5 ${PLATFORM_COLORS[selectedStream.platform]}`} />
                      ) : null;
                    })()}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {selectedStream.likes}
                  </button>
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
                    <MessageSquare className="w-4 h-4" /> {selectedStream.comments}
                  </button>
                  <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Live Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/[0.02] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Rows/sec</div>
                    <div className="text-xl font-bold font-mono text-cyan-400">142,567</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Total Rows</div>
                    <div className="text-xl font-bold font-mono">198M</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Integrity</div>
                    <div className="text-xl font-bold font-mono text-green-400">99.99%</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">Tools Used</div>
                    <div className="text-xl font-bold font-mono text-purple-400">8</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Live Streams List */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400" />
                    Live Now ({LIVE_STREAMS.length})
                  </h3>
                </div>
                
                <div className="divide-y divide-white/5">
                  {LIVE_STREAMS.map((stream) => (
                    <button
                      key={stream.id}
                      onClick={() => setSelectedStream(stream)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedStream.id === stream.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{stream.title}</div>
                          <div className="text-xs text-gray-500">{stream.streamer} • {stream.viewers} watching</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Upcoming Streams */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Upcoming
                  </h3>
                </div>
                
                <div className="divide-y divide-white/5">
                  {UPCOMING_STREAMS.map((stream) => (
                    <div key={stream.id} className="p-4">
                      <div className="text-sm font-medium mb-1">{stream.title}</div>
                      <div className="text-xs text-gray-500">{stream.scheduledFor}</div>
                      <div className="text-xs text-gray-500 mt-1">Expected: {stream.expectedViewers} viewers</div>
                      <button className="mt-2 text-xs text-cyan-400 hover:underline flex items-center gap-1">
                        Set Reminder
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Stream Settings */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  Your Stream
                </h3>
                <div className="space-y-2">
                  <Link 
                    href="/lab/rooms"
                    className="block w-full text-center bg-purple-500/20 text-purple-400 py-2 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
                  >
                    Book Streaming Studio
                  </Link>
                  <div className="text-xs text-gray-500 text-center">
                    $15/hour • YouTube + Twitch ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
