'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Trophy, Search, Filter, ChevronDown, ChevronUp, 
  Globe, TrendingUp, Clock, RefreshCw, Database,
  ArrowLeft, Download, BarChart3
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  rowsPerSec: number;
  score: number;
  country: string;
  phase: string;
  week: number;
  dataIntegrity: number;
  checkpointRecovery: number;
  maskingEfficiency: number;
  lastRun: string;
}

const MOCK_DATA: LeaderboardEntry[] = Array.from({ length: 100 }, (_, i) => ({
  rank: i + 1,
  name: `Competitor_${(1000 + i).toString().slice(1)}`,
  rowsPerSec: Math.round(142567 - (i * 1200) + (Math.random() * 500)),
  score: Math.round(9847 - (i * 85) + (Math.random() * 30)),
  country: ['US', 'DE', 'UK', 'JP', 'CA', 'AU', 'FR', 'SG', 'BR', 'IN', 'KR', 'NL', 'SE', 'CH', 'IL'][i % 15],
  phase: i < 400 ? 'Qualifiers' : 'Semifinals',
  week: Math.floor(i / 100) + 1,
  dataIntegrity: Math.round(99.9 - (i * 0.001)),
  checkpointRecovery: Math.round(98 - (i * 0.05)),
  maskingEfficiency: Math.round(95 - (i * 0.1)),
  lastRun: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
}));

const COUNTRIES: Record<string, string> = {
  'US': '🇺🇸', 'DE': '🇩🇪', 'UK': '🇬🇧', 'JP': '🇯🇵', 'CA': '🇨🇦',
  'AU': '🇦🇺', 'FR': '🇫🇷', 'SG': '🇸🇬', 'BR': '🇧🇷', 'IN': '🇮🇳',
  'KR': '🇰🇷', 'NL': '🇳🇱', 'SE': '🇸🇪', 'CH': '🇨🇭', 'IL': '🇮🇱',
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>(MOCK_DATA);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof LeaderboardEntry>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterPhase, setFilterPhase] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleSort = (field: keyof LeaderboardEntry) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const filteredData = data
    .filter(entry => 
      entry.name.toLowerCase().includes(search.toLowerCase()) &&
      (filterCountry === '' || entry.country === filterCountry) &&
      (filterPhase === '' || entry.phase === filterPhase)
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc' 
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  const uniqueCountries = Array.from(new Set(data.map(d => d.country))).sort();
  const uniquePhases = Array.from(new Set(data.map(d => d.phase)));

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Link href="/competition" className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Back to Competition
              </Link>
              <h1 className="text-3xl font-bold">Leaderboard</h1>
              <p className="text-gray-400">Week 2 Qualifiers — Season 1</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Updated {lastRefresh.toLocaleTimeString()}
              </div>
              <button 
                onClick={() => setLastRefresh(new Date())}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Total Competitors</div>
              <div className="text-2xl font-bold">2,847</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Peak Rows/sec</div>
              <div className="text-2xl font-bold text-cyan-400">142,567</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Countries</div>
              <div className="text-2xl font-bold">64</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Total Rows Replicated</div>
              <div className="text-2xl font-bold text-amber-400">12.4B</div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search competitors..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(c => (
                <option key={c} value={c}>{COUNTRIES[c]} {c}</option>
              ))}
            </select>
            
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Phases</option>
              {uniquePhases.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          {/* Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase font-medium">
                      <button onClick={() => handleSort('rank')} className="flex items-center gap-1 hover:text-white">
                        Rank {sortField === 'rank' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase font-medium">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white">
                        Competitor {sortField === 'name' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 uppercase font-medium">
                      <button onClick={() => handleSort('rowsPerSec')} className="flex items-center gap-1 hover:text-white ml-auto">
                        Rows/sec {sortField === 'rowsPerSec' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-right px-6 py-3 text-xs text-gray-500 uppercase font-medium">
                      <button onClick={() => handleSort('score')} className="flex items-center gap-1 hover:text-white ml-auto">
                        Score {sortField === 'score' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-center px-6 py-3 text-xs text-gray-500 uppercase font-medium">
                      <button onClick={() => handleSort('country')} className="flex items-center gap-1 hover:text-white mx-auto">
                        Country {sortField === 'country' && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                      </button>
                    </th>
                    <th className="text-center px-6 py-3 text-xs text-gray-500 uppercase font-medium">Phase</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 50).map((entry) => (
                    <>
                      <tr 
                        key={entry.rank}
                        className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${
                          entry.rank <= 3 ? 'bg-white/[0.02]' : ''
                        }`}
                        onClick={() => setExpandedRow(expandedRow === entry.rank ? null : entry.rank)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {entry.rank === 1 && <span>🏆</span>}
                            {entry.rank === 2 && <span>🥈</span>}
                            {entry.rank === 3 && <span>🥉</span>}
                            <span className={`font-mono ${entry.rank <= 3 ? 'font-bold' : 'text-gray-400'}`}>
                              #{entry.rank}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{entry.name}</td>
                        <td className="px-6 py-4 text-right font-mono text-cyan-400">
                          {entry.rowsPerSec.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-amber-400">
                          {entry.score.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {COUNTRIES[entry.country]} {entry.country}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            entry.phase === 'Qualifiers' 
                              ? 'bg-cyan-500/10 text-cyan-400' 
                              : 'bg-purple-500/10 text-purple-400'
                          }`}>
                            {entry.phase}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {expandedRow === entry.rank ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </td>
                      </tr>
                      
                      {expandedRow === entry.rank && (
                        <tr key={`${entry.rank}-expanded`} className="bg-white/[0.01]">
                          <td colSpan={7} className="px-6 py-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Data Integrity</div>
                                <div className="text-lg font-mono text-green-400">{entry.dataIntegrity}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Checkpoint Recovery</div>
                                <div className="text-lg font-mono text-purple-400">{entry.checkpointRecovery}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Masking Efficiency</div>
                                <div className="text-lg font-mono text-amber-400">{entry.maskingEfficiency}%</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">Last Run</div>
                                <div className="text-sm text-gray-300">{new Date(entry.lastRun).toLocaleString()}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing 1-50 of {filteredData.length} competitors
            </div>
            <div className="flex gap-2">
              <button className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Previous
              </button>
              <button className="bg-cyan-500/20 border border-cyan-500/30 rounded-lg px-3 py-2 text-sm text-cyan-400">
                1
              </button>
              <button className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                2
              </button>
              <button className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
