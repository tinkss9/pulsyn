// CDC Engine
// Orchestrates change data capture from source to target

import { EventEmitter } from 'events';
import { Connector } from '../types';
import { CheckpointManager } from '../checkpoint/checkpoint-manager';

export interface CDCEngineConfig {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  checkpointInterval: number;
  exactlyOnce: boolean;
}

export class CDCEngine extends EventEmitter {
  private source: Connector | null = null;
  private target: Connector | null = null;
  private checkpointManager: CheckpointManager;
  private config: CDCEngineConfig;
  private running: boolean = false;
  private batchBuffer: any[] = [];

  constructor(config: Partial<CDCEngineConfig> = {}) {
    super();
    this.config = {
      batchSize: config.batchSize || 1000,
      flushInterval: config.flushInterval || 1000,
      maxRetries: config.maxRetries || 3,
      checkpointInterval: config.checkpointInterval || 5000,
      exactlyOnce: config.exactlyOnce || true,
    };
    this.checkpointManager = new CheckpointManager();
  }

  setSource(connector: Connector): void {
    this.source = connector;
  }

  setTarget(connector: Connector): void {
    this.target = connector;
  }

  async start(): Promise<void> {
    if (!this.source || !this.target) {
      throw new Error('Source and target connectors must be set');
    }

    if (this.running) {
      throw new Error('Engine is already running');
    }

    // Connect to source and target
    await this.source.connect(this.source.config || ({} as any));
    await this.target.connect(this.target.config || ({} as any));

    this.running = true;
    this.emit('started');

    // Start CDC from source
    await this.source.startCDC((event) => {
      this.handleEvent(event);
    });

    // Start checkpoint loop
    this.startCheckpointLoop();
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    this.running = false;

    // Flush remaining batch
    await this.flushBatch();

    // Stop CDC
    if (this.source) {
      await this.source.stopCDC();
    }

    // Disconnect
    if (this.source) {
      await this.source.disconnect();
    }
    if (this.target) {
      await this.target.disconnect();
    }

    this.emit('stopped');
  }

  async pause(): Promise<void> {
    this.running = false;
    this.emit('paused');
  }

  async resume(): Promise<void> {
    this.running = true;
    this.emit('resumed');
  }

  private handleEvent(event: any): void {
    if (!this.running) return;

    this.batchBuffer.push(event);

    if (this.batchBuffer.length >= this.config.batchSize) {
      this.flushBatch();
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const batch = [...this.batchBuffer];
    this.batchBuffer = [];

    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        // Write batch to target
        await this.writeBatch(batch);
        this.emit('batch:committed', { count: batch.length });
        return;
      } catch (error) {
        retries++;
        this.emit('batch:error', { error, retries });
        if (retries >= this.config.maxRetries) {
          this.emit('batch:failed', { error, batch });
          throw error;
        }
        // Exponential backoff
        await this.sleep(Math.pow(2, retries) * 100);
      }
    }
  }

  private async writeBatch(batch: any[]): Promise<void> {
    // This would use the target connector's write method
    // For now, emit the batch for testing
    this.emit('batch:write', { batch });
  }

  private startCheckpointLoop(): void {
    setInterval(async () => {
      if (!this.running) return;

      try {
        await this.checkpointManager.saveCheckpoint({
          id: `checkpoint-${Date.now()}`,
          pipelineId: 'current',
          lsn: 'current',
          timestamp: new Date(),
          tables: {},
        });
        this.emit('checkpoint:saved');
      } catch (error) {
        this.emit('checkpoint:error', { error });
      }
    }, this.config.checkpointInterval);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      running: this.running,
      batchSize: this.batchBuffer.length,
      config: this.config,
    };
  }
}
