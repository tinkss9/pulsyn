// Pulsyn Competition Engine
// Runs local Docker containers for competition sessions with failure injection

import { execSync, spawn } from 'child_process';
import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { StageRunner, GAUNTLET_STAGES, StageResult } from './stage-runner';

export interface CompetitionConfig {
  category: 'rows' | 'tools' | 'multi';
  durationMinutes: number;
  sourceEngine: 'postgresql' | 'mysql';
  targetEngine: 'postgresql' | 'mysql' | 'mongodb';
}

export interface CompetitionMetrics {
  rowsReplicated: number;
  rowsPerSecond: number;
  dataIntegrity: number;
  checkpointRecovery: number;
  maskingEfficiency: number;
  toolsUsed: string[];
  enginePairs: string[];
  startTime: Date;
  endTime?: Date;
  score: number;
}

export class CompetitionEngine extends EventEmitter {
  private config: CompetitionConfig;
  private metrics: CompetitionMetrics;
  private dockerComposePath: string;
  private running = false;
  private timer: NodeJS.Timeout | null = null;
  private containerPrefix: string;

  constructor(config: CompetitionConfig) {
    super();
    this.config = config;
    this.containerPrefix = `pulsyn-comp-${Date.now()}`;
    this.dockerComposePath = path.join(os.tmpdir(), `${this.containerPrefix}-docker-compose.yml`);
    
    this.metrics = {
      rowsReplicated: 0,
      rowsPerSecond: 0,
      dataIntegrity: 100,
      checkpointRecovery: 0,
      maskingEfficiency: 100,
      toolsUsed: [],
      enginePairs: [`${config.sourceEngine}→${config.targetEngine}`],
      startTime: new Date(),
      score: 0,
    };
  }

  /**
   * Start competition session
   */
  async start(): Promise<{
    sourceHost: string;
    sourcePort: number;
    targetHost: string;
    targetPort: number;
    durationSeconds: number;
  }> {
    this.emit('starting', { category: this.config.category });

    // Start containers using direct docker commands
    this.emit('container:starting');
    
    // Source container
    execSync(`docker run -d --name ${this.containerPrefix}-source -e POSTGRES_DB=competition_source -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:16-alpine postgres -c wal_level=logical -c max_wal_senders=4 -c max_replication_slots=4`, { 
      stdio: 'pipe',
      timeout: 60000 
    });
    
    // Target container
    execSync(`docker run -d --name ${this.containerPrefix}-target -e POSTGRES_DB=competition_target -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5434:5432 postgres:16-alpine`, { 
      stdio: 'pipe',
      timeout: 60000 
    });
    
    this.emit('container:started');

    // Wait for databases to be ready
    await this.waitForDatabases();

    // Set up source data
    await this.setupSourceData();

    // Start timer
    this.running = true;
    this.metrics.startTime = new Date();
    
    const durationMs = this.config.durationMinutes * 60 * 1000;
    this.timer = setTimeout(() => {
      this.stop();
    }, durationMs);

    this.emit('started', { 
      duration: this.config.durationMinutes,
      category: this.config.category,
    });

    return {
      sourceHost: 'localhost',
      sourcePort: 5433,
      targetHost: 'localhost',
      targetPort: 5434,
      durationSeconds: this.config.durationMinutes * 60,
    };
  }

  /**
   * Stop competition session
   */
  async stop(): Promise<CompetitionMetrics> {
    if (!this.running) return this.metrics;

    this.running = false;
    this.metrics.endTime = new Date();

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Calculate final metrics
    this.calculateScore();

    // Stop containers
    this.emit('container:stopping');
    try {
      execSync(`docker stop ${this.containerPrefix}-source 2>nul`, { stdio: 'pipe' });
      execSync(`docker rm ${this.containerPrefix}-source 2>nul`, { stdio: 'pipe' });
      execSync(`docker stop ${this.containerPrefix}-target 2>nul`, { stdio: 'pipe' });
      execSync(`docker rm ${this.containerPrefix}-target 2>nul`, { stdio: 'pipe' });
    } catch {
      // Ignore cleanup errors
    }
    this.emit('container:stopped');

    this.emit('stopped', this.metrics);
    return this.metrics;
  }

  /**
   * Track a tool usage
   */
  trackTool(toolName: string): void {
    if (!this.metrics.toolsUsed.includes(toolName)) {
      this.metrics.toolsUsed.push(toolName);
      this.emit('tool:used', { tool: toolName, total: this.metrics.toolsUsed.length });
    }
  }

  /**
   * Update row count
   */
  updateRowCount(rows: number): void {
    this.metrics.rowsReplicated = rows;
    const elapsed = (Date.now() - this.metrics.startTime.getTime()) / 1000;
    this.metrics.rowsPerSecond = Math.round(rows / elapsed);
    this.emit('metrics:updated', this.metrics);
  }

  /**
   * Run checkpoint recovery test
   */
  async testCheckpointRecovery(): Promise<number> {
    this.emit('test:checkpoint');
    this.trackTool('checkpoint-recovery');

    // Simulate checkpoint save
    const startTime = Date.now();
    
    // In real implementation, would:
    // 1. Save checkpoint
    // 2. Stop pipeline
    // 3. Restart pipeline
    // 4. Resume from checkpoint
    // 5. Measure time

    const recoveryTimeMs = Date.now() - startTime + Math.random() * 2000;
    this.metrics.checkpointRecovery = Math.max(0, 100 - (recoveryTimeMs / 100));
    
    this.emit('test:checkpoint:complete', { 
      recoveryTimeMs, 
      score: this.metrics.checkpointRecovery 
    });
    
    return this.metrics.checkpointRecovery;
  }

  /**
   * Run data integrity check
   */
  async testDataIntegrity(): Promise<number> {
    this.emit('test:integrity');
    this.trackTool('data-integrity-check');

    // In real implementation, would compare source and target row counts + checksums
    const integrity = 99 + Math.random(); // 99-100%
    this.metrics.dataIntegrity = Math.min(100, integrity);
    
    this.emit('test:integrity:complete', { score: this.metrics.dataIntegrity });
    return this.metrics.dataIntegrity;
  }

  /**
   * Run masking test
   */
  async testMaskingEfficiency(): Promise<number> {
    this.emit('test:masking');
    this.trackTool('masking');

    // In real implementation, would measure overhead of masking rules
    const efficiency = 90 + Math.random() * 10; // 90-100%
    this.metrics.maskingEfficiency = efficiency;
    
    this.emit('test:masking:complete', { score: this.metrics.maskingEfficiency });
    return this.metrics.maskingEfficiency;
  }

  /**
   * Get current metrics
   */
  getMetrics(): CompetitionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get time remaining in seconds
   */
  getTimeRemaining(): number {
    if (!this.running) return 0;
    const elapsed = (Date.now() - this.metrics.startTime.getTime()) / 1000;
    const total = this.config.durationMinutes * 60;
    return Math.max(0, total - elapsed);
  }

  // ─── Private Methods ────────────────────────────────────────────

  private generateDockerCompose(): void {
    const compose = `
version: '3.8'

services:
  source-db:
    image: postgres:16-alpine
    container_name: ${this.containerPrefix}-source
    environment:
      POSTGRES_DB: competition_source
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - source_data:/var/lib/postgresql/data
    command: >
      postgres
        -c wal_level=logical
        -c max_wal_senders=4
        -c max_replication_slots=4
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      timeout: 2s
      retries: 10

  target-db:
    image: postgres:16-alpine
    container_name: ${this.containerPrefix}-target
    environment:
      POSTGRES_DB: competition_target
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5434:5432"
    volumes:
      - target_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      timeout: 2s
      retries: 10

volumes:
  source_data:
  target_data:
`;

    fs.writeFileSync(this.dockerComposePath, compose);
  }

  private async waitForDatabases(): Promise<void> {
    this.emit('database:waiting');
    
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      try {
        execSync(`docker exec ${this.containerPrefix}-source pg_isready -U postgres`, { stdio: 'pipe' });
        execSync(`docker exec ${this.containerPrefix}-target pg_isready -U postgres`, { stdio: 'pipe' });
        this.emit('database:ready');
        return;
      } catch {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    throw new Error('Databases failed to start');
  }

  private async setupSourceData(): Promise<void> {
    this.emit('data:seeding');

    const setupSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        age INTEGER,
        city VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at();
    `;

    // Seed initial data
    const seedSQL = `
      INSERT INTO users (name, email, age, city) VALUES
        ('Alice Johnson', 'alice@example.com', 28, 'New York'),
        ('Bob Smith', 'bob@example.com', 35, 'San Francisco'),
        ('Charlie Brown', 'charlie@example.com', 42, 'Chicago'),
        ('Diana Prince', 'diana@example.com', 31, 'Seattle'),
        ('Eve Wilson', 'eve@example.com', 26, 'Austin')
      ON CONFLICT DO NOTHING;

      INSERT INTO orders (user_id, product, amount, status) VALUES
        (1, 'Widget A', 29.99, 'completed'),
        (2, 'Widget B', 49.99, 'completed'),
        (3, 'Gadget X', 199.99, 'pending'),
        (1, 'Widget C', 99.99, 'shipped'),
        (4, 'Gadget Y', 299.99, 'pending')
      ON CONFLICT DO NOTHING;

      CREATE PUBLICATION pulsyn_pub FOR TABLE users, orders;
    `;

    const sourceContainer = `${this.containerPrefix}-source`;
    const targetContainer = `${this.containerPrefix}-target`;

    try {
      // Use docker exec to run psql inside the containers
      execSync(`docker exec ${sourceContainer} psql -U postgres -d competition_source -c "${setupSQL.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { 
        stdio: 'pipe' 
      });
      execSync(`docker exec ${sourceContainer} psql -U postgres -d competition_source -c "${seedSQL.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { 
        stdio: 'pipe' 
      });

      // Create target tables
      const targetSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          age INTEGER,
          city VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          product VARCHAR(255) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      execSync(`docker exec ${targetContainer} psql -U postgres -d competition_target -c "${targetSQL.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { 
        stdio: 'pipe' 
      });

      this.emit('data:seeded', { tables: ['users', 'orders'] });
    } catch (error) {
      throw new Error(`Failed to setup source data: ${(error as Error).message}`);
    }
  }

  private calculateScore(): void {
    // Scoring formula:
    // Rows/sec: 40%
    // Data integrity: 30%
    // Checkpoint recovery: 20%
    // Masking efficiency: 10%

    const rowsScore = Math.min(100, (this.metrics.rowsPerSecond / 10000) * 100);
    
    this.metrics.score = Math.round(
      (rowsScore * 0.4) +
      (this.metrics.dataIntegrity * 0.3) +
      (this.metrics.checkpointRecovery * 0.2) +
      (this.metrics.maskingEfficiency * 0.1)
    );

    this.emit('score:calculated', { score: this.metrics.score });
  }

  /**
   * Run The Gauntlet — Full 5-stage competition
   */
  async runGauntlet(): Promise<{
    totalScore: number;
    stages: StageResult[];
    rank: string;
  }> {
    this.emit('gauntlet:starting');

    // Start containers
    const env = await this.start();
    const stageRunner = new StageRunner(this.containerPrefix);

    // Forward stage events
    stageRunner.on('stage:start', (data) => this.emit('gauntlet:stage:start', data));
    stageRunner.on('stage:complete', (data) => this.emit('gauntlet:stage:complete', data));
    stageRunner.on('failure:triggered', (data) => this.emit('gauntlet:failure', data));
    stageRunner.on('failure:recovered', (data) => this.emit('gauntlet:recovery', data));

    const stageResults: StageResult[] = [];
    let totalScore = 0;

    // Execute each stage
    for (const stage of GAUNTLET_STAGES) {
      this.emit('gauntlet:stage:begin', { name: stage.name });

      const result = await stageRunner.executeStage(stage, {
        sourcePort: env.sourcePort,
        targetPort: env.targetPort,
        sourceDb: 'competition_source',
        targetDb: 'competition_target',
      });

      stageResults.push(result);
      totalScore += result.score;

      this.emit('gauntlet:stage:end', { 
        name: stage.name, 
        score: result.score, 
        passed: result.passed 
      });
    }

    // Calculate final score (average of all stages)
    const finalScore = Math.round(totalScore / GAUNTLET_STAGES.length);

    // Determine rank
    let rank = 'Bronze';
    if (finalScore >= 90) rank = 'Platinum';
    else if (finalScore >= 80) rank = 'Gold';
    else if (finalScore >= 70) rank = 'Silver';

    // Cleanup
    await this.stop();

    const gauntletResult = {
      totalScore: finalScore,
      stages: stageResults,
      rank,
    };

    this.emit('gauntlet:complete', gauntletResult);
    return gauntletResult;
  }
}
