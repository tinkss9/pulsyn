// Competition Stage Runner
// Executes competition stages with real failure injection

import { EventEmitter } from 'events';
import { execSync, exec } from 'child_process';

export interface StageConfig {
  name: string;
  durationSeconds: number;
  description: string;
  challenges: Challenge[];
}

export interface Challenge {
  type: 'replicate' | 'survive' | 'transform' | 'endure' | 'boss';
  description: string;
  target?: number; // Target rows or metric
  failures?: FailureEvent[];
  transforms?: TransformRule[];
}

export interface FailureEvent {
  atSecond: number; // When to trigger
  type: 'network_drop' | 'db_crash' | 'slow_network' | 'disk_full' | 'data_corrupt' | 'connection_exhaust';
  durationSeconds: number;
  target: 'source' | 'target' | 'both';
  params?: Record<string, any>;
}

export interface TransformRule {
  table: string;
  column: string;
  type: 'mask' | 'convert' | 'filter' | 'add_column' | 'uppercase';
  params?: Record<string, any>;
}

export interface StageResult {
  stageName: string;
  score: number;
  metrics: {
    rowsReplicated: number;
    rowsPerSecond: number;
    dataIntegrity: number;
    recoveryTimeMs: number;
    transformsApplied: number;
    failuresHandled: number;
    failuresTotal: number;
  };
  passed: boolean;
  details: string[];
}

export class StageRunner extends EventEmitter {
  private containerPrefix: string;
  private failureTimers: NodeJS.Timeout[] = [];

  constructor(containerPrefix: string) {
    super();
    this.containerPrefix = containerPrefix;
  }

  /**
   * Execute a single stage
   */
  async executeStage(config: StageConfig, context: {
    sourcePort: number;
    targetPort: number;
    sourceDb: string;
    targetDb: string;
  }): Promise<StageResult> {
    this.emit('stage:start', { name: config.name, duration: config.durationSeconds });
    
    const startTime = Date.now();
    const result: StageResult = {
      stageName: config.name,
      score: 0,
      metrics: {
        rowsReplicated: 0,
        rowsPerSecond: 0,
        dataIntegrity: 100,
        recoveryTimeMs: 0,
        transformsApplied: 0,
        failuresHandled: 0,
        failuresTotal: 0,
      },
      passed: false,
      details: [],
    };

    // Schedule failure events
    for (const challenge of config.challenges) {
      if (challenge.failures) {
        for (const failure of challenge.failures) {
          result.metrics.failuresTotal++;
          this.scheduleFailure(failure, context, result);
        }
      }
    }

    // Wait for stage duration
    await this.sleep(config.durationSeconds * 1000);

    // Cancel any pending failure timers
    for (const timer of this.failureTimers) {
      clearTimeout(timer);
    }
    this.failureTimers = [];

    // Calculate score
    result.score = this.calculateStageScore(config, result);
    result.passed = result.score >= 60;

    this.emit('stage:complete', result);
    return result;
  }

  /**
   * Schedule a failure event
   */
  private scheduleFailure(
    failure: FailureEvent,
    context: { sourcePort: number; targetPort: number },
    result: StageResult
  ): void {
    const timer = setTimeout(async () => {
      this.emit('failure:triggered', { type: failure.type, target: failure.target });
      
      const recoveryStart = Date.now();
      
      try {
        await this.injectFailure(failure, context);
        result.metrics.failuresHandled++;
      } catch (err) {
        this.emit('failure:error', { error: (err as Error).message });
      }

      // Wait for failure duration
      await this.sleep(failure.durationSeconds * 1000);

      // Recover from failure
      try {
        await this.recoverFromFailure(failure, context);
        const recoveryTime = Date.now() - recoveryStart;
        result.metrics.recoveryTimeMs += recoveryTime;
        this.emit('failure:recovered', { type: failure.type, recoveryTimeMs: recoveryTime });
      } catch (err) {
        this.emit('failure:recovery:error', { error: (err as Error).message });
      }
    }, failure.atSecond * 1000);

    this.failureTimers.push(timer);
  }

  /**
   * Inject a failure into the environment
   */
  private async injectFailure(failure: FailureEvent, context: {
    sourcePort: number;
    targetPort: number;
  }): Promise<void> {
    const container = failure.target === 'source' 
      ? `${this.containerPrefix}-source`
      : `${this.containerPrefix}-target`;

    switch (failure.type) {
      case 'network_drop':
        // Disconnect container from network
        await this.docker(`network disconnect bridge ${container} --force`);
        break;

      case 'db_crash':
        // Kill the database process
        await this.docker(`kill ${container}`);
        break;

      case 'slow_network':
        // Add latency using tc-netem (if available)
        const latencyMs = failure.params?.latencyMs || 500;
        try {
          await this.docker(`exec ${container} sh -c "apk add iproute2 2>/dev/null; tc qdisc add dev eth0 root netem delay ${latencyMs}ms"`);
        } catch {
          // tc-netem might not be available, fall back to pausing
          await this.docker(`pause ${container}`);
          await this.sleep(1000);
          await this.docker(`unpause ${container}`);
        }
        break;

      case 'disk_full':
        // Fill disk with dummy data
        const sizeMb = failure.params?.sizeMb || 100;
        await this.docker(`exec ${container} sh -c "dd if=/dev/zero of=/tmp/fill bs=1M count=${sizeMb} 2>/dev/null || true"`);
        break;

      case 'data_corrupt':
        // Insert invalid data into source
        if (failure.target === 'source') {
          await this.psql(context.sourcePort, `
            INSERT INTO users (name, email, age, city) VALUES 
              (NULL, 'invalid', -1, ''),
              ('', NULL, 999, NULL);
          `);
        }
        break;

      case 'connection_exhaust':
        // Open many connections to exhaust pool
        for (let i = 0; i < 100; i++) {
          try {
            await this.psql(context.sourcePort, `SELECT pg_sleep(60);`, true);
          } catch {
            // Expected to fail
          }
        }
        break;
    }
  }

  /**
   * Recover from a failure
   */
  private async recoverFromFailure(failure: FailureEvent, context: {
    sourcePort: number;
    targetPort: number;
  }): Promise<void> {
    const container = failure.target === 'source'
      ? `${this.containerPrefix}-source`
      : `${this.containerPrefix}-target`;

    switch (failure.type) {
      case 'network_drop':
        // Reconnect container to network
        await this.docker(`network connect bridge ${container}`);
        break;

      case 'db_crash':
        // Restart the container
        await this.docker(`start ${container}`);
        // Wait for it to be ready
        await this.waitForReady(context.sourcePort);
        break;

      case 'slow_network':
        // Remove latency
        try {
          await this.docker(`exec ${container} sh -c "tc qdisc del dev eth0 root 2>/dev/null || true"`);
        } catch {
          // Ignore
        }
        break;

      case 'disk_full':
        // Clean up dummy data
        await this.docker(`exec ${container} sh -c "rm -f /tmp/fill"`);
        break;

      case 'data_corrupt':
        // Clean up invalid data
        await this.psql(context.sourcePort, `
          DELETE FROM users WHERE name IS NULL OR email IS NULL OR name = '' OR email = '';
        `);
        break;

      case 'connection_exhaust':
        // Kill idle connections
        await this.psql(context.sourcePort, `
          SELECT pg_terminate_backend(pid) 
          FROM pg_stat_activity 
          WHERE state = 'idle' AND query_start < now() - interval '1 minute';
        `);
        break;
    }
  }

  /**
   * Calculate score for a stage
   */
  private calculateStageScore(config: StageConfig, result: StageResult): number {
    let score = 0;

    // Base score from rows replicated (0-40)
    const rowsTarget = config.challenges.find(c => c.target)?.target || 1000000;
    const rowsRatio = Math.min(1, result.metrics.rowsReplicated / rowsTarget);
    score += rowsRatio * 40;

    // Data integrity (0-30)
    score += (result.metrics.dataIntegrity / 100) * 30;

    // Failure handling (0-20)
    if (result.metrics.failuresTotal > 0) {
      const failureRatio = result.metrics.failuresHandled / result.metrics.failuresTotal;
      score += failureRatio * 20;
    } else {
      score += 20; // No failures = full points
    }

    // Recovery speed (0-10)
    if (result.metrics.recoveryTimeMs > 0) {
      // Faster recovery = higher score (max 10 points if < 5 seconds total)
      const recoveryScore = Math.max(0, 10 - (result.metrics.recoveryTimeMs / 5000));
      score += recoveryScore;
    } else {
      score += 10;
    }

    return Math.round(score);
  }

  // ─── Utility Methods ─────────────────────────────────────────

  private async docker(command: string): Promise<string> {
    try {
      return execSync(`docker ${command}`, { 
        encoding: 'utf-8',
        timeout: 30000,
      });
    } catch (err) {
      throw new Error(`Docker command failed: docker ${command} - ${(err as Error).message}`);
    }
  }

  private async psql(port: number, sql: string, background = false): Promise<string> {
    // Use docker exec to run psql inside the container
    const container = port === 5433 ? `${this.containerPrefix}-source` : `${this.containerPrefix}-target`;
    const db = port === 5433 ? 'competition_source' : 'competition_target';
    const escapedSql = sql.replace(/"/g, '\\"').replace(/\n/g, ' ');
    const cmd = `docker exec ${container} psql -U postgres -d ${db} -c "${escapedSql}"`;
    
    if (background) {
      exec(cmd, { encoding: 'utf-8' });
      return '';
    }
    
    try {
      return execSync(cmd, { encoding: 'utf-8', timeout: 10000 });
    } catch (err) {
      throw new Error(`PSQL failed: ${(err as Error).message}`);
    }
  }

  private async waitForReady(port: number, maxAttempts = 30): Promise<void> {
    const container = port === 5433 ? `${this.containerPrefix}-source` : `${this.containerPrefix}-target`;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        execSync(`docker exec ${container} pg_isready -U postgres`, { stdio: 'pipe' });
        return;
      } catch {
        await this.sleep(1000);
      }
    }
    throw new Error(`Database not ready after ${maxAttempts} attempts`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ─── Stage Definitions ──────────────────────────────────────────

export const GAUNTLET_STAGES: StageConfig[] = [
  {
    name: 'SPEED',
    durationSeconds: 600, // 10 minutes
    description: 'Replicate 1M rows as fast as possible',
    challenges: [
      {
        type: 'replicate',
        description: 'Replicate 1,000,000 rows from PostgreSQL to PostgreSQL',
        target: 1000000,
      },
    ],
  },
  {
    name: 'CHAOS',
    durationSeconds: 900, // 15 minutes
    description: 'Survive random failures while replicating',
    challenges: [
      {
        type: 'survive',
        description: 'Maintain replication through network drops and crashes',
        target: 500000,
        failures: [
          { atSecond: 60, type: 'network_drop', durationSeconds: 30, target: 'source' },
          { atSecond: 180, type: 'db_crash', durationSeconds: 20, target: 'target' },
          { atSecond: 300, type: 'slow_network', durationSeconds: 60, target: 'source', params: { latencyMs: 500 } },
          { atSecond: 480, type: 'data_corrupt', durationSeconds: 10, target: 'source' },
          { atSecond: 600, type: 'connection_exhaust', durationSeconds: 30, target: 'source' },
          { atSecond: 720, type: 'network_drop', durationSeconds: 45, target: 'target' },
        ],
      },
    ],
  },
  {
    name: 'CRAFT',
    durationSeconds: 900, // 15 minutes
    description: 'Replicate with data transformations',
    challenges: [
      {
        type: 'transform',
        description: 'Apply masking, conversions, and filters while replicating',
        target: 500000,
        transforms: [
          { table: 'users', column: 'email', type: 'mask', params: { method: 'hash' } },
          { table: 'orders', column: 'amount', type: 'convert', params: { from: 'USD', to: 'EUR', rate: 0.92 } },
          { table: 'users', column: 'city', type: 'uppercase' },
          { table: 'orders', column: 'status', type: 'filter', params: { exclude: ['cancelled'] } },
          { table: 'users', column: 'replicated_at', type: 'add_column', params: { default: 'NOW()' } },
        ],
      },
    ],
  },
  {
    name: 'ENDURANCE',
    durationSeconds: 900, // 15 minutes
    description: 'Sustain high throughput under load',
    challenges: [
      {
        type: 'endure',
        description: 'Replicate 10M rows maintaining >50K rows/sec',
        target: 10000000,
      },
    ],
  },
  {
    name: 'BOSS',
    durationSeconds: 900, // 15 minutes
    description: 'Multi-engine replication with all obstacles',
    challenges: [
      {
        type: 'boss',
        description: 'Replicate across 3 engine pairs simultaneously',
        target: 2000000,
        failures: [
          { atSecond: 60, type: 'network_drop', durationSeconds: 20, target: 'source' },
          { atSecond: 180, type: 'db_crash', durationSeconds: 15, target: 'target' },
          { atSecond: 360, type: 'slow_network', durationSeconds: 30, target: 'source', params: { latencyMs: 1000 } },
          { atSecond: 540, type: 'data_corrupt', durationSeconds: 10, target: 'source' },
          { atSecond: 720, type: 'connection_exhaust', durationSeconds: 20, target: 'target' },
        ],
        transforms: [
          { table: 'users', column: 'email', type: 'mask', params: { method: 'hash' } },
        ],
      },
    ],
  },
];
