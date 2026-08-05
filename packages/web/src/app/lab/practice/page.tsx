'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Zap, Clock, Database, Play, ArrowRight, CheckCircle,
  Star, Trophy, Users, Activity, CreditCard, DollarSign,
  RefreshCw, Target, Code, GitBranch, Heart, Shield
} from 'lucide-react';

const PRACTICE_MODES = [
  {
    id: 'speed-run',
    name: 'Speed Run',
    icon: Zap,
    color: 'cyan',
    duration: '15 min',
    description: 'Replicate as many rows as possible. Pure speed challenge.',
    price: 1,
    features: ['Single table', 'PostgreSQL → PostgreSQL', 'Real-time metrics', 'Score tracking'],
    difficulty: 'Easy',
    bestFor: 'Beginners',
  },
  {
    id: 'tool-explorer',
    name: 'Tool Explorer',
    icon: Code,
    color: 'purple',
    duration: '30 min',
    description: 'Use as many Pulsyn features as you can. Learning challenge.',
    price: 1,
    features: ['All CLI commands', 'MCP tools', 'API endpoints', 'Tutorial hints'],
    difficulty: 'Easy',
    bestFor: 'Learners',
  },
  {
    id: 'multi-engine',
    name: 'Multi-Engine',
    icon: GitBranch,
    color: 'amber',
    duration: '30 min',
    description: 'Replicate across different database engines.',
    price: 1,
    features: ['PG → MySQL', 'MySQL → MongoDB', 'Checkpoint recovery', 'Data integrity check'],
    difficulty: 'Medium',
    bestFor: 'Intermediate',
  },
  {
    id: 'full-challenge',
    name: 'Full Challenge',
    icon: Trophy,
    color: 'red',
    duration: '60 min',
    description: 'Complete challenge with all features. Competition simulation.',
    price: 1,
    features: ['All engines', 'Masking', 'Transforms', 'Full scoring'],
    difficulty: 'Hard',
    bestFor: 'Advanced',
  },
];

const QUICK_STARTS = [
  { name: '5-Min Warmup', duration: '5 min', price: 0.50, description: 'Quick practice before competition' },
  { name: '10-Min Drill', duration: '10 min', price: 0.75, description: 'Focused practice on specific skills' },
  { name: '30-Min Session', duration: '30 min', price: 1.00, description: 'Standard practice session' },
  { name: '60-Min Deep Dive', duration: '60 min', price: 1.00, description: 'Full practice session' },
];

export default function PracticePage() {
  const [selectedMode, setSelectedMode] = useState('speed-run');
  const [selectedQuickStart, setSelectedQuickStart] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-6">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300 font-medium">$1 per practice run</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Practice Lab
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Train before you compete. $1 per run. No commitment. 
              Perfect your skills before the real competition.
            </p>
          </div>
          
          {/* Quick Starts */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              Quick Start
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QUICK_STARTS.map((qs) => (
                <button
                  key={qs.name}
                  onClick={() => setSelectedQuickStart(qs.name)}
                  className={`text-left bg-white/[0.02] border rounded-xl p-4 transition-all ${
                    selectedQuickStart === qs.name
                      ? 'border-cyan-500/30 bg-cyan-500/5'
                      : 'border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">{qs.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{qs.duration}</div>
                  <div className="text-lg font-bold text-green-400">${qs.price}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Practice Modes */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Practice Modes
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRACTICE_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`text-left bg-white/[0.02] border rounded-xl overflow-hidden transition-all ${
                    selectedMode === mode.id
                      ? `border-${mode.color}-500/30 shadow-lg shadow-${mode.color}-500/10`
                      : 'border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className={`px-4 py-3 bg-${mode.color}-500/5 border-b border-white/5`}>
                    <div className="flex items-center gap-2">
                      <mode.icon className={`w-5 h-5 text-${mode.color}-400`} />
                      <span className="font-semibold">{mode.name}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-400 mb-3">{mode.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Duration</span>
                        <span>{mode.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Difficulty</span>
                        <span className={
                          mode.difficulty === 'Easy' ? 'text-green-400' :
                          mode.difficulty === 'Medium' ? 'text-amber-400' :
                          'text-red-400'
                        }>{mode.difficulty}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Best For</span>
                        <span>{mode.bestFor}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {mode.features.map(f => (
                        <span key={f} className="text-xs bg-white/5 px-2 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="text-xl font-bold text-green-400">${mode.price}</div>
                      <span className="text-xs text-gray-500">per run</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* How It Works */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold mb-6">How Practice Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="font-semibold mb-1">Pay $1</div>
                <div className="text-sm text-gray-400">Quick payment via Stripe</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Play className="w-6 h-6 text-purple-400" />
                </div>
                <div className="font-semibold mb-1">Start Session</div>
                <div className="text-sm text-gray-400">Get your practice environment</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
                <div className="font-semibold mb-1">Practice</div>
                <div className="text-sm text-gray-400">Train your skills</div>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <div className="font-semibold mb-1">Get Score</div>
                <div className="text-sm text-gray-400">See your performance</div>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start Practice Run — $1
            </button>
            <p className="text-sm text-gray-500 mt-3">
              No subscription required. Pay per run. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
