#!/usr/bin/env npx tsx
/**
 * Pulsyn Certification Monitor
 *
 * Real-time monitoring of certification runs.
 * Watches cert-matrix.json and results/ directory for changes.
 *
 * Usage: npm run cert:monitor
 */

import * as fs from 'fs';
import * as path from 'path';

const resultsDir = path.join(process.cwd(), 'docs', 'lab', 'results');
const certMatrixFile = path.join(process.cwd(), 'docs', 'lab', 'cert-matrix.json');
const stateFile = path.join(resultsDir, '.state.json');

interface MonitorState {
  last_check: string;
  last_result_file: string;
  last_matrix_update: string;
  total_certified: number;
  total_failed: number;
  phase_status: string;
}

let state: MonitorState = {
  last_check: new Date().toISOString(),
  last_result_file: '',
  last_matrix_update: '',
  total_certified: 0,
  total_failed: 0,
  phase_status: 'IDLE',
};

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function loadState(): void {
  try {
    if (fs.existsSync(stateFile)) {
      state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    }
  } catch {
    // Ignore state load errors
  }
}

function saveState(): void {
  try {
    fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch {
    // Ignore state save errors
  }
}

function displayCertMatrix(): void {
  try {
    if (!fs.existsSync(certMatrixFile)) {
      log('📊 Cert matrix not yet created');
      return;
    }

    const matrix = JSON.parse(fs.readFileSync(certMatrixFile, 'utf8'));
    const connectors = matrix.connectors || {};

    const certified = Object.values(connectors).filter((c: any) => c.status === 'CERTIFIED').length;
    const tested = Object.keys(connectors).length;

    log(`📊 Cert Matrix Update:`);
    log(`   Total Tested: ${tested}`);
    log(`   Certified: ${certified}`);
    log(`   Last Updated: ${matrix.metadata?.updated_at || 'unknown'}`);

    state.total_certified = certified;
    state.total_failed = tested - certified;
  } catch {
    log('❌ Failed to read cert matrix');
  }
}

function checkLatestResult(): void {
  try {
    if (!fs.existsSync(resultsDir)) {
      return;
    }

    const files = fs
      .readdirSync(resultsDir)
      .filter((f) => f.endsWith('.json') && !f.startsWith('.'))
      .sort()
      .reverse();

    if (files.length === 0) {
      log('📁 No result files yet');
      return;
    }

    const latestFile = files[0];

    if (latestFile !== state.last_result_file) {
      state.last_result_file = latestFile;

      const filePath = path.join(resultsDir, latestFile);
      const result = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      log(`📝 New Result File: ${latestFile}`);
      log(`   Phase: ${result.phase}`);
      log(`   Certified: ${result.connectors_passed}`);
      log(`   Failed: ${result.connectors_failed}`);
      log(`   Duration: ${Math.floor(result.total_duration_seconds / 60)}m`);

      if (result.phase.includes('PHASE_1')) {
        state.phase_status = 'PHASE_1_RUNNING';
      } else if (result.phase.includes('PHASE_2')) {
        state.phase_status = 'PHASE_2_RUNNING';
      } else if (result.phase.includes('PHASE_3')) {
        state.phase_status = 'PHASE_3_RUNNING';
      } else if (result.phase.includes('FINAL')) {
        state.phase_status = 'COMPLETE';
      }
    }
  } catch (err) {
    log(`⚠️  Error reading results: ${(err as Error).message}`);
  }
}

function displayStatus(): void {
  console.clear();

  log('╔════════════════════════════════════════════════════════════════╗');
  log('║ PULSYN CERTIFICATION MONITOR                                    ║');
  log('╚════════════════════════════════════════════════════════════════╝\n');

  log(`Status: ${state.phase_status}`);
  log(`Last Check: ${new Date().toISOString()}`);

  log('\n📊 Statistics:');
  log(`   Certified: ${state.total_certified}`);
  log(`   Failed: ${state.total_failed}`);
  log(`   Total: ${state.total_certified + state.total_failed}`);

  log('\n🚀 Quick Links:');
  log(`   Matrix: docs/lab/cert-matrix.json`);
  log(`   Results: docs/lab/results/`);
  log(`   Latest: docs/lab/results/${state.last_result_file}`);

  log('\n⏱️  Timeline:');

  const files = fs
    .readdirSync(resultsDir)
    .filter((f) => f.endsWith('.json') && f.includes('PHASE'))
    .sort();

  if (files.length === 0) {
    log('   (no phases completed yet)');
  } else {
    files.forEach((file) => {
      const filePath = path.join(resultsDir, file);
      const stat = fs.statSync(filePath);
      const time = stat.mtime.toISOString();
      log(`   ${time} ${file}`);
    });
  }

  log('\n💡 Tips:');
  log('   - Press Ctrl+C to stop monitoring');
  log('   - Check Docker logs: docker-compose -f docker-compose.lab.yml logs -f');
  log('   - View git commits: git log --oneline -10');
  log('\n════════════════════════════════════════════════════════════════\n');
}

async function monitor(): Promise<void> {
  loadState();
  displayStatus();
  checkLatestResult();
  displayCertMatrix();
  saveState();

  // Check again in 10 seconds
  setTimeout(monitor, 10000);
}

// Start monitoring
log('🎬 Starting certification monitor...');
log('Press Ctrl+C to stop\n');

monitor().catch((err) => {
  console.error(`❌ Monitor error: ${err.message}`);
  process.exit(1);
});
