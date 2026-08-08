// Seed script: generates realistic competition data for the Pulsyn leaderboard
// Usage: node seed-competition.mjs

const API_BASE = process.env.API_URL || 'http://localhost:8080/api';

const COUNTRIES = ['US', 'DE', 'UK', 'JP', 'CA', 'AU', 'FR', 'SG', 'BR', 'IN', 'KR', 'NL', 'SE', 'CH', 'IL', 'NZ', 'CN', 'ES', 'IT', 'MX'];
const ENGINES = ['postgresql', 'mysql', 'mongodb', 'snowflake', 'bigquery', 'redis', 'dynamodb'];
const PHASES = ['qualifiers'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCompetitor(rank) {
  const baseRowsPerSec = Math.max(5000, 150000 - (rank * 1200) + randomBetween(-500, 500));
  const baseScore = Math.max(1000, 10000 - (rank * 80) + randomBetween(-30, 30));
  
  return {
    competitorName: `competitor_${String(rank + 1).padStart(3, '0')}`,
    email: `competitor${rank + 1}@example.com`,
    countryCode: COUNTRIES[rank % COUNTRIES.length],
    rowsPerSec: baseRowsPerSec,
    score: baseScore,
    phase: 'qualifiers',
    week: Math.floor(rank / 25) + 1,
    dataIntegrityPct: parseFloat((99.9 - (rank * 0.002)).toFixed(3)),
    checkpointRecoveryPct: parseFloat((99 - (rank * 0.05)).toFixed(2)),
    maskingEfficiencyPct: parseFloat((98 - (rank * 0.08)).toFixed(2)),
    latencyP99Ms: randomBetween(2, 50 + rank),
    errorRate: parseFloat((Math.random() * 0.01).toFixed(6)),
    sourceEngine: ENGINES[randomBetween(0, ENGINES.length - 1)],
    targetEngine: ENGINES[randomBetween(0, ENGINES.length - 1)],
    totalRows: randomBetween(1_000_000, 500_000_000),
    durationMs: randomBetween(5000, 120000),
  };
}

async function seed() {
  console.log('Seeding competition leaderboard...');
  
  const COMPETITOR_COUNT = 50;
  
  for (let i = 0; i < COMPETITOR_COUNT; i++) {
    const entry = generateCompetitor(i);
    
    try {
      const res = await fetch(`${API_BASE}/competition/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      
      if (!res.ok) {
        const err = await res.text();
        console.error(`Failed to submit competitor ${i + 1}: ${err}`);
        continue;
      }
      
      console.log(`  [${i + 1}/${COMPETITOR_COUNT}] ${entry.competitorName} — ${entry.rowsPerSec.toLocaleString()} rows/sec, score ${entry.score}`);
    } catch (err) {
      console.error(`Error submitting competitor ${i + 1}:`, err.message);
    }
  }
  
  // Verify stats updated
  try {
    const statsRes = await fetch(`${API_BASE}/competition/stats`);
    const stats = await statsRes.json();
    console.log('\nCompetition stats after seeding:');
    console.log(`  Total competitors: ${stats.totalCompetitors}`);
    console.log(`  Peak rows/sec: ${stats.peakRowsPerSec?.toLocaleString()}`);
    console.log(`  Countries: ${stats.totalCountries}`);
    console.log(`  Total rows: ${stats.totalRowsReplicated?.toLocaleString()}`);
  } catch (err) {
    console.error('Failed to fetch stats:', err.message);
  }
  
  console.log('\nSeeding complete!');
}

seed().catch(console.error);
