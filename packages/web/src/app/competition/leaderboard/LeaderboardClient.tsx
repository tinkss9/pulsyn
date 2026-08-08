'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ScrollReveal from '@/components/ScrollReveal';
import { Trophy, Search, ChevronDown, ChevronUp, Clock, RefreshCw, ArrowLeft } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  rowsPerSec: number;
  score: number;
  country: string;
  phase: string;
  week: number;
  metrics: { dataIntegrity: number; checkpointRecovery: number; maskingEfficiency: number };
  latencyP99?: number;
  errorRate?: number;
  sourceEngine?: string;
  targetEngine?: string;
  totalRows?: number;
  verified?: boolean;
  lastRun: string;
}

interface Stats {
  totalCompetitors: number;
  peakRowsPerSec: number;
  totalCountries: number;
  totalRowsReplicated: number;
}

const COUNTRIES: Record<string, string> = {
  'US': '🇺🇸', 'DE': '🇩🇪', 'UK': '🇬🇧', 'JP': '🇯🇵', 'CA': '🇨🇦',
  'AU': '🇦🇺', 'FR': '🇫🇷', 'SG': '🇸🇬', 'BR': '🇧🇷', 'IN': '🇮🇳',
  'KR': '🇰🇷', 'NL': '🇳🇱', 'SE': '🇸🇪', 'CH': '🇨🇭', 'IL': '🇮🇱',
  'NZ': '🇳🇿', 'CN': '🇨🇳', 'ES': '🇪🇸', 'IT': '🇮🇹', 'MX': '🇲🇽',
};

function formatBigNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function LeaderboardClient({
  initialEntries,
  initialStats,
  error,
}: {
  initialEntries: LeaderboardEntry[];
  initialStats: Stats;
  error: string | null;
}) {
  const [data] = useState<LeaderboardEntry[]>(initialEntries);
  const [stats] = useState<Stats>(initialStats);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterCountry, setFilterCountry] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [lastRefresh] = useState(new Date());

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const filteredData = data
    .filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    .filter(e => !filterCountry || e.country === filterCountry)
    .sort((a, b) => {
      let aVal: any = a[sortField as keyof LeaderboardEntry];
      let bVal: any = b[sortField as keyof LeaderboardEntry];
      if (sortField === 'dataIntegrity') { aVal = a.metrics.dataIntegrity; bVal = b.metrics.dataIntegrity; }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal || '').localeCompare(String(bVal || ''))
        : String(bVal || '').localeCompare(String(aVal || ''));
    });

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
              <Link
                href="/competition/leaderboard"
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm flex items-center gap-2 transition-colors"
                data-testid="refresh-btn"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </Link>
            </div>
          </div>

          {/* Stats */}
          <ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4" data-testid="stat-total-competitors">
                <div className="text-sm text-gray-500 mb-1">Total Competitors</div>
                <div className="text-2xl font-bold">{stats.totalCompetitors > 0 ? formatBigNumber(stats.totalCompetitors) : '—'}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4" data-testid="stat-peak-rps">
                <div className="text-sm text-gray-500 mb-1">Peak Rows/sec</div>
                <div className="text-2xl font-bold text-cyan-400">{stats.peakRowsPerSec > 0 ? formatBigNumber(stats.peakRowsPerSec) : '—'}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4" data-testid="stat-countries">
                <div className="text-sm text-gray-500 mb-1">Countries</div>
                <div className="text-2xl font-bold">{stats.totalCountries > 0 ? stats.totalCountries : '—'}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4" data-testid="stat-total-rows">
                <div className="text-sm text-gray-500 mb-1">Total Rows Replicated</div>
                <div className="text-2xl font-bold text-amber-400">{stats.totalRowsReplicated > 0 ? formatBigNumber(stats.totalRowsReplicated) : '—'}</div>
              </div>
            </div>
          </ScrollReveal>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search competitors..."
                data-testid="leaderboard-search"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              data-testid="filter-country"
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Countries</option>
              {Object.entries(COUNTRIES).map(([code, flag]) => (
                <option key={code} value={code}>{flag} {code}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm" data-testid="error-banner">
              {error}
            </div>
          )}

          {/* Empty */}
          {data.length === 0 && !error && (
            <div className="text-center py-20 text-gray-500" data-testid="empty-state">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">No competitors yet</p>
            </div>
          )}

          {/* Table */}
          {data.length > 0 && (
            <ScrollReveal>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full" data-testid="leaderboard-table">
                    <thead>
                      <tr className="border-b border-white/5">
                        {[
                          { key: 'rank', label: 'Rank' },
                          { key: 'name', label: 'Competitor' },
                          { key: 'rowsPerSec', label: 'Rows/sec', right: true },
                          { key: 'score', label: 'Score', right: true },
                          { key: 'country', label: 'Country', center: true },
                          { key: 'phase', label: 'Phase', center: true },
                        ].map(col => (
                          <th key={col.key} className={`${col.right ? 'text-right' : col.center ? 'text-center' : 'text-left'} px-6 py-3 text-xs text-gray-500 uppercase font-medium`}>
                            <button onClick={() => handleSort(col.key)} className={`flex items-center gap-1 hover:text-white ${col.right ? 'ml-auto' : col.center ? 'mx-auto' : ''}`}>
                              {col.label}
                              {sortField === col.key && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                            </button>
                          </th>
                        ))}
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((entry) => (
                        <tr
                          key={entry.id || entry.rank}
                          data-testid={`row-${entry.rank}`}
                          className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors ${entry.rank <= 3 ? 'bg-white/[0.02]' : ''}`}
                          onClick={() => setExpandedRow(expandedRow === entry.rank ? null : entry.rank)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {entry.rank === 1 && <span>🏆</span>}
                              {entry.rank === 2 && <span>🥈</span>}
                              {entry.rank === 3 && <span>🥉</span>}
                              <span className={`font-mono ${entry.rank <= 3 ? 'font-bold' : 'text-gray-400'}`}>#{entry.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {entry.name}
                            {entry.verified && <span className="ml-2 text-xs text-green-400">✓</span>}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-cyan-400">{entry.rowsPerSec.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-mono text-amber-400">{entry.score.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">{COUNTRIES[entry.country] || '🌐'} {entry.country || '—'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400">{entry.phase}</span>
                          </td>
                          <td className="px-6 py-4">
                            {expandedRow === entry.rank ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Count */}
          <div className="text-sm text-gray-500 mt-6">
            Showing {filteredData.length} of {stats.totalCompetitors} competitors
          </div>
        </div>
      </div>
    </div>
  );
}
