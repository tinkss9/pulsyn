import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { competitionRuns, CompetitionRun } from '../state';

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
    const existingRun = Array.from(competitionRuns.values())
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

    const resultsFile = join(resultsDir, `${runId}.json`);

    // Create run record
    const run: CompetitionRun = {
      runId,
      competitorId,
      status: 'starting',
      startedAt: new Date().toISOString(),
      resultsFile,
    };
    competitionRuns.set(runId, run);

    // Start Docker Compose in background
    const env = {
      ...process.env,
      COMPETITION_RUN_ID: runId,
      COMPETITION_COMPETITOR_ID: competitorId,
      COMPETITION_DISPLAY_NAME: displayName || competitorId,
      COMPETITION_TOTAL_ROWS: String(totalRows || 10000),
      COMPETITION_BATCH_SIZE: String(batchSize || 1000),
      COMPETITION_DURATION_SECONDS: String(durationSeconds || 60),
      COMPETITION_RESULTS_FILE: resultsFile,
    };

    const child = spawn('docker', [
      'compose',
      '-f', COMPOSE_FILE,
      '-p', composeProject,
      'up',
      '--abort-on-container-exit',
    ], {
      env,
      detached: true,
      stdio: 'ignore',
    });

    child.unref();

    // Update status to running
    run.status = 'running';

    // Monitor completion in background
    child.on('exit', (code) => {
      if (code === 0) {
        run.status = 'completed';
        run.completedAt = new Date().toISOString();
      } else {
        run.status = 'failed';
        run.error = `Docker exited with code ${code}`;
        run.completedAt = new Date().toISOString();
      }
    });

    child.on('error', (err) => {
      run.status = 'failed';
      run.error = err.message;
      run.completedAt = new Date().toISOString();
    });

    return NextResponse.json({
      success: true,
      data: {
        runId,
        status: run.status,
        pollUrl: `/api/competition/status/${runId}`,
        startedAt: run.startedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start competition run' },
      { status: 500 }
    );
  }
}
