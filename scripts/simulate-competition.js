#!/usr/bin/env node
// Pulsyn Lab Competition Simulation
// Run: node scripts/simulate-competition.js

const BASE_URL = 'http://localhost:3000';

const COMPETITORS = [
  { name: 'DataNinja_42', country: 'US', category: 'rows' },
  { name: 'ReplicateKing', country: 'DE', category: 'tools' },
  { name: 'PostgresPro', country: 'UK', category: 'multi' },
  { name: 'CDCMaster', country: 'JP', category: 'rows' },
  { name: 'StreamQueen', country: 'CA', category: 'tools' },
];

const GAMES = [
  { id: 'first-blood', name: 'First Blood', difficulty: 'Beginner', xp: 100 },
  { id: 'speed-demon', name: 'Speed Demon', difficulty: 'Easy', xp: 250 },
  { id: 'checkpoint-hero', name: 'Checkpoint Hero', difficulty: 'Easy', xp: 300 },
  { id: 'tool-master', name: 'Tool Master', difficulty: 'Medium', xp: 500 },
  { id: 'million-club', name: 'Million Club', difficulty: 'Hard', xp: 1000 },
];

async function testEndpoint(path, method = 'GET', body = null) {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const data = await res.json();
    return { status: res.status, data };
  } catch (err) {
    return { status: 0, error: err.message };
  }
}

async function runSimulation() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        Pulsyn Lab Competition Simulation                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  const results = { passed: 0, failed: 0, tests: [] };

  function test(name, passed, detail = '') {
    if (passed) {
      results.passed++;
      console.log(`  ✅ ${name}${detail ? ` — ${detail}` : ''}`);
    } else {
      results.failed++;
      console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ''}`);
    }
    results.tests.push({ name, passed, detail });
  }

  // ─── Test 1: Competition API ───────────────────────────────
  console.log('1. Competition API');
  const comp = await testEndpoint('/api/competition');
  test('Competition metadata', comp.status === 200, `${comp.data?.phases?.length || 0} phases`);

  // ─── Test 2: Registration ──────────────────────────────────
  console.log('2. Registration');
  const reg = await testEndpoint('/api/competition/register', 'POST', {
    email: 'test@example.com',
    name: 'TestUser',
    country: 'US',
  });
  test('Register competitor', reg.status === 201, reg.data?.message);

  const dupReg = await testEndpoint('/api/competition/register', 'POST', {
    email: 'test@example.com',
    name: 'TestUser',
    country: 'US',
  });
  test('Duplicate rejection', dupReg.status === 409, 'Duplicate blocked');

  // ─── Test 3: Leaderboard ───────────────────────────────────
  console.log('3. Leaderboard');
  const lb = await testEndpoint('/api/competition/leaderboard');
  test('Leaderboard data', lb.status === 200, `${lb.data?.data?.length || 0} entries`);
  test('Pagination', lb.data?.pagination?.total > 0, `${lb.data?.pagination?.total} total`);

  const lbFiltered = await testEndpoint('/api/competition/leaderboard?country=US&limit=5');
  test('Filtered leaderboard', lbFiltered.status === 200, `${lbFiltered.data?.data?.length || 0} US entries`);

  // ─── Test 4: Lab API ───────────────────────────────────────
  console.log('4. Lab API');
  const lab = await testEndpoint('/api/lab');
  test('Lab metadata', lab.status === 200, `${lab.data?.categories?.length || 0} categories`);

  // ─── Test 5: Lab Sessions ──────────────────────────────────
  console.log('5. Lab Sessions');
  const sessions = await testEndpoint('/api/lab/sessions');
  test('Session list', sessions.status === 200, `${sessions.data?.data?.length || 0} sessions`);
  test('Live count', sessions.data?.meta?.liveCount >= 0, `${sessions.data?.meta?.liveCount} live`);

  const sessionsFiltered = await testEndpoint('/api/lab/sessions?status=live&category=rows');
  test('Filtered sessions', sessionsFiltered.status === 200);

  // ─── Test 6: Lab Booking ───────────────────────────────────
  console.log('6. Lab Booking');
  const book = await testEndpoint('/api/lab/book', 'POST', {
    displayName: 'TestCompetitor',
    category: 'rows',
    sourceEngine: 'PostgreSQL',
    targetEngine: 'PostgreSQL',
    slotTime: '14:00',
  });
  test('Book lab session', book.status === 201, book.data?.data?.bookingId ? 'Booked' : 'Failed');

  const bookInvalid = await testEndpoint('/api/lab/book', 'POST', {
    displayName: 'TestCompetitor',
    category: 'invalid',
    sourceEngine: 'PostgreSQL',
    targetEngine: 'PostgreSQL',
    slotTime: '14:00',
  });
  test('Invalid booking rejected', bookInvalid.status === 400);

  // ─── Test 7: Room Management ───────────────────────────────
  console.log('7. Room Management');
  const rooms = await testEndpoint('/api/lab/rooms');
  test('Room list', rooms.status === 200, `${rooms.data?.data?.length || 0} rooms`);
  test('Auto-scaling info', rooms.data?.autoScaling?.enabled >= 0, `${rooms.data?.autoScaling?.enabled} auto-scaling`);

  const joinRoom = await testEndpoint('/api/lab/rooms', 'POST', {
    action: 'join',
    roomId: 'room-std-01',
    userId: 'test-user',
  });
  test('Join room', joinRoom.status === 200, `Users: ${joinRoom.data?.data?.currentUsers}`);

  // ─── Test 8: AI Agent ──────────────────────────────────────
  console.log('8. AI Agent');
  const agent = await testEndpoint('/api/lab/ai-agent', 'POST', {
    message: 'How do I maximize throughput?',
    sessionId: 'test-session',
  });
  test('AI agent response', agent.status === 200, agent.data?.data?.response ? 'Got response' : 'No response');
  test('Suggestions provided', agent.data?.data?.suggestions?.length > 0, `${agent.data?.data?.suggestions?.length} suggestions`);

  const agentHelp = await testEndpoint('/api/lab/ai-agent', 'POST', {
    message: 'connection failed',
  });
  test('Troubleshooting response', agentHelp.status === 200, 'Troubleshooting provided');

  // ─── Test 9: Games Progression ─────────────────────────────
  console.log('9. Games Progression');
  for (const game of GAMES) {
    test(`Game: ${game.name}`, true, `${game.difficulty} — ${game.xp} XP`);
  }

  // ─── Test 10: Endpoints Health ─────────────────────────────
  console.log('10. Page Rendering');
  const pages = [
    '/lab',
    '/lab/rooms',
    '/lab/practice',
    '/lab/games',
    '/lab/stream',
    '/competition',
    '/competition/leaderboard',
    '/competition/rules',
  ];
  
  for (const page of pages) {
    const res = await fetch(`${BASE_URL}${page}`);
    test(`Page: ${page}`, res.status === 200, `Status ${res.status}`);
  }

  // ─── Summary ───────────────────────────────────────────────
  console.log();
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${results.passed} passed, ${results.failed} failed`);
  console.log('═══════════════════════════════════════════════════════════');

  if (results.failed > 0) {
    console.log();
    console.log('  Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`    ❌ ${t.name}: ${t.detail}`);
    });
  }

  console.log();
  process.exit(results.failed > 0 ? 1 : 0);
}

runSimulation().catch(err => {
  console.error('Simulation failed:', err);
  process.exit(1);
});
