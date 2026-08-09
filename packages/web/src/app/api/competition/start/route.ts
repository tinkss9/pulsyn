import { NextRequest, NextResponse } from 'next/server';
import { execSync, spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// In-memory run store (replace with database in production)
const runs: Map<string, {
  runId: string;
  competitorId: string;
  status: 'pending' | 'starting' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  composeProject: string;
  resultsFile?: string;
  error?: string;
}> = new Map();

const COMPOSE_FILE = join(process.cwd(), '..', '..', 'docker', 'competition', 'docker-compose.competition.yml');
const RESULTS_BASE = join(process.cwd(), '..', '..', 'docker', 'competition', 'results');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorId, displayName, totalRows, batchSize, durationSeconds } = body;

    if (!competitorId) {
      return NextResponse.json(
        { error: 'competitorId is required' },
        { status: 400 }
      );
    }

    // Check for existing active run
    const existingRun = Array.from(runs.values())
      .find(r => r.competitorId === competitorId && (r.status === 'running' || r.status === 'starting'));

    if (existingRun) {
      return NextResponse.json(
        { error: 'You already have an active competition run', runId: existingRun.runId },
        { status: 409 }
      );
    }

    // Generate run ID
    const runId = `race-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const composeProject = `pulsyn-race-${runId.slice(0, 20)}`;

    // Ensure results directory exists
    const resultsDir = join(RESULTS_BASE, competitorId);
    if (!existsSync(resultsDir)) {
      mkdirSync(resultsDir, { recursive: true });
    }

    // Store run metadata
    runs.set(runId, {
      runId,
      competitorId,
      status: 'starting',
      startedAt: new Date().toISOString(),
      composeProject,
      resultsFile: join(resultsDir, 'results.json'),
    });

    // Start competition containers in background
    const env = {
      ...process.env,
      RUN_ID: runId,
      DURATION: String(durationSeconds || 300),
      BATCH_SIZE: String(batchSize || 1000),
      TOTAL_ROWS: String(totalRows || 100000),
    };

    // Use docker compose to start only this competitor's services
    const competitorNum = 1; // Map competitorId to slot in future
    const services = [
      `competitor-${competitorNum}-source`,
      `competitor-${competitorNum}-target`,
      `competitor-${competitorNum}-runner`,
    ];

    const child = spawn('docker', [
      'compose',
      '-f', COMPOSE_FILE,
      '-p', composeProject,
      'up',
      '--abort-on-container-exit',
      '--exit-code-from', `competitor-${competitorNum}-runner`,
      ...services,
    ], {
      env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.unref();

    // Track completion
    const runData = runs.get(runId)!;
    child.on('close', (code) => {
      runData.status = code === 0 ? 'completed' : 'failed';
      runData.completedAt = new Date().toISOString();
      if (code !== 0) {
        runData.error = `Container exited with code ${code}`;
      }
    });

    child.on('error', (err) => {
      runData.status = 'failed';
      runData.completedAt = new Date().toISOString();
      runData.error = err.message;
    });

    // Update status to running after a brief delay
    setTimeout(() => {
      if (runData.status === 'starting') {
        runData.status = 'running';
      }
    }, 3000);

    return NextResponse.json({
      success: true,
      data: {
        runId,
        competitorId,
        displayName: displayName || competitorId,
        status: 'starting',
        startedAt: runData.startedAt,
        pollUrl: `/api/competition/status/${runId}`,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('[Competition Start] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start competition run' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const activeRuns = Array.from(runs.values())
    .filter(r => r.status === 'running' || r.status === 'starting')
    .map(r => ({
      runId: r.runId,
      competitorId: r.competitorId,
      status: r.status,
      startedAt: r.startedAt,
    }));

  return NextResponse.json({
    activeRuns,
    total: activeRuns.length,
  });
}

// Export runs map for status endpoint
export { runs };
