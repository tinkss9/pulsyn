import { NextRequest, NextResponse } from 'next/server';

// Competition API — Main endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Pulsyn Replication Race',
    season: 1,
    status: 'active',
    phases: [
      { name: 'Qualifiers', status: 'active', startDate: '2026-08-04', endDate: '2026-09-01' },
      { name: 'Semifinals', status: 'upcoming', startDate: '2026-09-01', endDate: '2026-09-15' },
      { name: 'Finals', status: 'upcoming', startDate: '2026-09-15', endDate: '2026-09-22' },
      { name: 'Grand Finale', status: 'upcoming', startDate: '2026-09-22', endDate: '2026-09-23' },
    ],
    prizePool: 40000,
    registeredCompetitors: 2847,
    countries: 64,
    totalRowsReplicated: 12400000000,
    links: {
      register: '/api/competition/register',
      leaderboard: '/api/competition/leaderboard',
      rules: '/competition/rules',
    },
  });
}
