import { NextRequest, NextResponse } from 'next/server';

// Mock sessions data
const MOCK_SESSIONS = [
  {
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
      toolsUsed: 8,
      enginePairs: 2,
    },
    likes: 456,
    comments: 89,
  },
  {
    id: 'sess-002',
    user: 'ReplicateKing',
    category: 'tools',
    status: 'live',
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    duration: 60,
    viewers: 156,
    metrics: {
      rowsPerSec: 89234,
      totalRows: 156789012,
      dataIntegrity: 99.95,
      toolsUsed: 14,
      enginePairs: 3,
    },
    likes: 389,
    comments: 67,
  },
  {
    id: 'sess-003',
    user: 'PostgresPro',
    category: 'multi',
    status: 'live',
    startedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    duration: 60,
    viewers: 89,
    metrics: {
      rowsPerSec: 67890,
      totalRows: 45678901,
      dataIntegrity: 99.98,
      toolsUsed: 6,
      enginePairs: 5,
    },
    likes: 312,
    comments: 54,
  },
  {
    id: 'sess-004',
    user: 'CDCMaster',
    category: 'rows',
    status: 'live',
    startedAt: new Date(Date.now() - 56 * 60 * 1000).toISOString(),
    duration: 60,
    viewers: 67,
    metrics: {
      rowsPerSec: 129845,
      totalRows: 234567890,
      dataIntegrity: 99.97,
      toolsUsed: 7,
      enginePairs: 2,
    },
    likes: 278,
    comments: 45,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const status = searchParams.get('status'); // live, completed, scheduled
  const category = searchParams.get('category'); // rows, tools, multi, community
  const limit = parseInt(searchParams.get('limit') || '20');
  
  let filtered = [...MOCK_SESSIONS];
  
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }
  if (category) {
    filtered = filtered.filter(s => s.category === category);
  }
  
  return NextResponse.json({
    data: filtered.slice(0, limit),
    total: filtered.length,
    meta: {
      liveCount: filtered.filter(s => s.status === 'live').length,
      totalViewers: filtered.reduce((sum, s) => sum + s.viewers, 0),
    },
  });
}
