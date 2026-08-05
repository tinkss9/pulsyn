import { NextRequest, NextResponse } from 'next/server';

// Lab API — Main endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    name: 'Pulsyn Lab',
    description: 'Live, visible, bookable competition platform',
    features: [
      'Book 1-hour lab sessions',
      'Everything recorded and visible',
      'Real-time metrics dashboard',
      'Live chat and engagement',
      'Community choice voting',
    ],
    categories: [
      { id: 'rows', name: 'Most Rows Replicated', weight: '40%' },
      { id: 'tools', name: 'Most Tools Tested', weight: '30%' },
      { id: 'multi', name: 'Multi-Replication Master', weight: '20%' },
      { id: 'community', name: 'Community Choice', weight: '10%' },
    ],
    stats: {
      totalSessions: 1247,
      activeSessions: 4,
      totalCompetitors: 2847,
      totalViewers: 156,
    },
    links: {
      book: '/api/lab/book',
      sessions: '/api/lab/sessions',
      live: '/lab',
    },
  });
}
