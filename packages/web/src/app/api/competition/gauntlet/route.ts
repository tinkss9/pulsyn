import { NextRequest, NextResponse } from 'next/server';
import { execSync, spawn } from 'child_process';

// In-memory store for active gauntlet sessions
const activeSessions: Map<string, {
  id: string;
  userId: string;
  status: 'starting' | 'running' | 'completed' | 'failed';
  startTime: Date;
  currentStage: string;
  stages: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed';
    score: number;
    failures: number;
  }>;
  totalScore: number;
  rank: string;
  logs: string[];
}> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName } = body;

    if (!userId || !displayName) {
      return NextResponse.json(
        { error: 'userId and displayName are required' },
        { status: 400 }
      );
    }

    // Check if user already has an active session
    const existingSession = Array.from(activeSessions.values())
      .find(s => s.userId === userId && s.status === 'running');

    if (existingSession) {
      return NextResponse.json(
        { error: 'You already have an active gauntlet session' },
        { status: 409 }
      );
    }

    // Create new session
    const sessionId = `gauntlet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const session = {
      id: sessionId,
      userId,
      status: 'starting' as const,
      startTime: new Date(),
      currentStage: 'SETUP',
      stages: [
        { name: 'SPEED', status: 'pending' as const, score: 0, failures: 0 },
        { name: 'CHAOS', status: 'pending' as const, score: 0, failures: 0 },
        { name: 'CRAFT', status: 'pending' as const, score: 0, failures: 0 },
        { name: 'ENDURANCE', status: 'pending' as const, score: 0, failures: 0 },
        { name: 'BOSS', status: 'pending' as const, score: 0, failures: 0 },
      ],
      totalScore: 0,
      rank: 'Bronze',
      logs: ['Gauntlet session created'],
    };

    activeSessions.set(sessionId, session);

    // Start gauntlet in background (simulated for now)
    startGauntletSimulation(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        status: session.status,
        stages: session.stages,
      },
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (sessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: session });
  }

  // Return all active sessions
  const sessions = Array.from(activeSessions.values())
    .filter(s => s.status === 'running' || s.status === 'starting')
    .map(s => ({
      id: s.id,
      userId: s.userId,
      displayName: s.userId, // Would be fetched from user DB
      status: s.status,
      currentStage: s.currentStage,
      totalScore: s.totalScore,
      startTime: s.startTime,
    }));

  return NextResponse.json({
    data: sessions,
    total: sessions.length,
  });
}

// Simulate gauntlet execution (replace with real Docker-based execution)
async function startGauntletSimulation(sessionId: string) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  const stages = ['SPEED', 'CHAOS', 'CRAFT', 'ENDURANCE', 'BOSS'];
  const stageScores = [75, 85, 70, 90, 80]; // Simulated scores

  // Update status to running
  session.status = 'running';
  session.logs.push('Gauntlet started');

  for (let i = 0; i < stages.length; i++) {
    session.currentStage = stages[i];
    session.stages[i].status = 'running';
    session.logs.push(`Stage ${stages[i]} started`);

    // Simulate stage duration (10 seconds each for demo)
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Simulate failures in CHAOS and BOSS stages
    if (stages[i] === 'CHAOS' || stages[i] === 'BOSS') {
      session.stages[i].failures = 2;
      session.logs.push(`  ⚠️ Network drop injected`);
      session.logs.push(`  ✓ Network recovered`);
      session.logs.push(`  ⚠️ DB crash injected`);
      session.logs.push(`  ✓ DB recovered`);
    }

    // Complete stage
    session.stages[i].status = 'completed';
    session.stages[i].score = stageScores[i] + Math.floor(Math.random() * 15);
    session.totalScore += session.stages[i].score;
    session.logs.push(`Stage ${stages[i]} completed: ${session.stages[i].score}/100`);
  }

  // Calculate final score
  session.totalScore = Math.round(session.totalScore / stages.length);
  
  // Determine rank
  if (session.totalScore >= 90) session.rank = 'Platinum';
  else if (session.totalScore >= 80) session.rank = 'Gold';
  else if (session.totalScore >= 70) session.rank = 'Silver';
  else session.rank = 'Bronze';

  session.status = 'completed';
  session.currentStage = 'COMPLETE';
  session.logs.push(`Gauntlet complete! Score: ${session.totalScore}, Rank: ${session.rank}`);
}
