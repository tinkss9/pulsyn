import { NextRequest, NextResponse } from 'next/server';

// Mock leaderboard data (replace with database in production)
const MOCK_LEADERBOARD = Array.from({ length: 100 }, (_, i) => ({
  rank: i + 1,
  id: `comp-${1000 + i}`,
  name: `Competitor_${(1000 + i).toString().slice(1)}`,
  rowsPerSec: Math.round(142567 - (i * 1200) + (Math.random() * 500)),
  score: Math.round(9847 - (i * 85) + (Math.random() * 30)),
  country: ['US', 'DE', 'UK', 'JP', 'CA', 'AU', 'FR', 'SG', 'BR', 'IN', 'KR', 'NL', 'SE', 'CH', 'IL'][i % 15],
  phase: i < 400 ? 'Qualifiers' : 'Semifinals',
  week: Math.floor(i / 100) + 1,
  metrics: {
    dataIntegrity: Math.round(99.9 - (i * 0.001)),
    checkpointRecovery: Math.round(98 - (i * 0.05)),
    maskingEfficiency: Math.round(95 - (i * 0.1)),
  },
  lastRun: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
}));

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const country = searchParams.get('country');
  const phase = searchParams.get('phase');
  const search = searchParams.get('search');
  
  let filtered = [...MOCK_LEADERBOARD];
  
  // Apply filters
  if (country) {
    filtered = filtered.filter(e => e.country === country);
  }
  if (phase) {
    filtered = filtered.filter(e => e.phase === phase);
  }
  if (search) {
    filtered = filtered.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);
  
  return NextResponse.json({
    data: paginated,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
    meta: {
      updatedAt: new Date().toISOString(),
      week: 2,
      phase: 'Qualifiers',
      totalCompetitors: 2847,
      peakRowsPerSec: 142567,
    },
  });
}
