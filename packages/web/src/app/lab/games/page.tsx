'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Gamepad2, Zap, Clock, Trophy, Star, Users, Play,
  Target, Database, Code, GitBranch, Heart, Flame,
  Award, ChevronRight, Lock, Unlock, Gift, Crown,
  Swords, Shield, Sparkles, Medal, Gem
} from 'lucide-react';

const GAMES = [
  {
    id: 'first-blood',
    name: 'First Blood',
    icon: Zap,
    color: 'cyan',
    difficulty: 'Beginner',
    duration: '5 min',
    reward: '100 XP',
    description: 'Replicate your first 1,000 rows. Everyone starts here.',
    unlocked: true,
    completed: false,
    players: 1247,
    badge: '🩸',
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    icon: Flame,
    color: 'red',
    difficulty: 'Easy',
    duration: '10 min',
    reward: '250 XP',
    description: 'Hit 10,000 rows/sec. Feel the speed.',
    unlocked: true,
    completed: false,
    players: 892,
    badge: '🔥',
  },
  {
    id: 'checkpoint-hero',
    name: 'Checkpoint Hero',
    icon: Shield,
    color: 'purple',
    difficulty: 'Easy',
    duration: '15 min',
    reward: '300 XP',
    description: 'Recover from a checkpoint failure. Prove your resilience.',
    unlocked: true,
    completed: false,
    players: 634,
    badge: '🛡️',
  },
  {
    id: 'tool-master',
    name: 'Tool Master',
    icon: Code,
    color: 'amber',
    difficulty: 'Medium',
    duration: '20 min',
    reward: '500 XP',
    description: 'Use 10 different Pulsyn features in one session.',
    unlocked: true,
    completed: false,
    players: 423,
    badge: '🔧',
  },
  {
    id: 'multi-engine-king',
    name: 'Multi-Engine King',
    icon: GitBranch,
    color: 'green',
    difficulty: 'Medium',
    duration: '30 min',
    reward: '750 XP',
    description: 'Replicate across 3 different engine pairs.',
    unlocked: false,
    completed: false,
    players: 256,
    badge: '👑',
  },
  {
    id: 'masking-ninja',
    name: 'Masking Ninja',
    icon: Star,
    color: 'pink',
    difficulty: 'Medium',
    duration: '20 min',
    reward: '600 XP',
    description: 'Apply masking rules with less than 5% overhead.',
    unlocked: false,
    completed: false,
    players: 189,
    badge: '🥷',
  },
  {
    id: 'million-club',
    name: 'Million Club',
    icon: Database,
    color: 'cyan',
    difficulty: 'Hard',
    duration: '30 min',
    reward: '1000 XP',
    description: 'Replicate 1,000,000 rows in a single session.',
    unlocked: false,
    completed: false,
    players: 123,
    badge: '💎',
  },
  {
    id: 'perfect-run',
    name: 'Perfect Run',
    icon: Crown,
    color: 'amber',
    difficulty: 'Hard',
    duration: '60 min',
    reward: '1500 XP',
    description: 'Complete a full challenge with 100% data integrity.',
    unlocked: false,
    completed: false,
    players: 67,
    badge: '👑',
  },
  {
    id: 'speed-king',
    name: 'Speed King',
    icon: Flame,
    color: 'red',
    difficulty: 'Expert',
    duration: '15 min',
    reward: '2000 XP',
    description: 'Hit 100,000 rows/sec. Elite performance.',
    unlocked: false,
    completed: false,
    players: 34,
    badge: '🏆',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    icon: Gem,
    color: 'purple',
    difficulty: 'Expert',
    duration: '60 min',
    reward: '5000 XP',
    description: 'Complete all other games. The ultimate achievement.',
    unlocked: false,
    completed: false,
    players: 12,
    badge: '💠',
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': 'text-green-400 bg-green-500/10',
  'Easy': 'text-cyan-400 bg-cyan-500/10',
  'Medium': 'text-amber-400 bg-amber-500/10',
  'Hard': 'text-red-400 bg-red-500/10',
  'Expert': 'text-purple-400 bg-purple-500/10',
};

export default function GamesPage() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [playerXP] = useState(450);
  const [playerLevel] = useState(3);

  const filteredGames = GAMES.filter(g => 
    selectedDifficulty === '' || g.difficulty === selectedDifficulty
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Gamified Learning</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pulsyn Games
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Learn Pulsyn through gamified challenges. Earn XP, unlock badges, 
              climb the leaderboard. Start easy, master the hard.
            </p>
          </div>
          
          {/* Player Stats */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl font-bold">
                  {playerLevel}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Level</div>
                  <div className="text-2xl font-bold">{playerXP} XP</div>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress to Level {playerLevel + 1}</span>
                  <span className="text-purple-400">{playerXP}/1000 XP</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(playerXP / 1000) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">3</div>
                  <div className="text-xs text-gray-500">Badges</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">7</div>
                  <div className="text-xs text-gray-500">Games</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">42nd</div>
                  <div className="text-xs text-gray-500">Rank</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedDifficulty('')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                selectedDifficulty === '' 
                  ? 'bg-white/10 text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {['Beginner', 'Easy', 'Medium', 'Hard', 'Expert'].map(diff => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedDifficulty === diff 
                    ? `${DIFFICULTY_COLORS[diff]}` 
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
          
          {/* Games Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game) => (
              <div 
                key={game.id}
                className={`bg-white/[0.02] border rounded-xl overflow-hidden transition-all ${
                  game.unlocked 
                    ? 'border-white/5 hover:bg-white/[0.04] cursor-pointer' 
                    : 'border-white/5 opacity-60'
                }`}
              >
                <div className={`px-4 py-3 bg-${game.color}-500/5 border-b border-white/5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{game.badge}</span>
                      <span className="font-semibold">{game.name}</span>
                    </div>
                    {game.unlocked ? (
                      <Unlock className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-sm text-gray-400 mb-3">{game.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Difficulty</span>
                      <span className={DIFFICULTY_COLORS[game.difficulty]}>
                        {game.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Duration</span>
                      <span>{game.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Reward</span>
                      <span className="text-amber-400 font-semibold">{game.reward}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Players</span>
                      <span>{game.players.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      game.unlocked
                        ? `bg-${game.color}-500/20 text-${game.color}-400 hover:bg-${game.color}-500/30`
                        : 'bg-white/5 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!game.unlocked}
                  >
                    {game.completed ? 'Completed ✓' : game.unlocked ? 'Play Now' : 'Locked'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Leaderboard Preview */}
          <div className="mt-12 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                XP Leaderboard
              </h2>
              <Link href="/competition/leaderboard" className="text-sm text-cyan-400 hover:underline">
                View Full Board
              </Link>
            </div>
            
            <div className="space-y-3">
              {[
                { rank: 1, name: 'DataNinja_42', xp: 12450, level: 15, badge: '👑' },
                { rank: 2, name: 'ReplicateKing', xp: 11230, level: 14, badge: '🥈' },
                { rank: 3, name: 'PostgresPro', xp: 10890, level: 13, badge: '🥉' },
                { rank: 4, name: 'CDCMaster', xp: 9870, level: 12, badge: '' },
                { rank: 5, name: 'StreamQueen', xp: 8760, level: 11, badge: '' },
              ].map((entry) => (
                <div key={entry.rank} className="flex items-center gap-4 bg-white/[0.02] rounded-lg p-3">
                  <div className="w-8 text-center font-mono text-gray-500">
                    {entry.badge || `#${entry.rank}`}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{entry.name}</div>
                    <div className="text-xs text-gray-500">Level {entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-mono">{entry.xp.toLocaleString()} XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
