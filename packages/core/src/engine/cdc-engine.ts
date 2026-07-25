// CDC Engine
// Orchestrates change data capture from source to target

import { EventEmitter } from 'events';
import { Connector, CDCEvent } from '../types';
import { CheckpointManager } from '../checkpoint/checkpoint-manager';

export interface CDCEngineConfig {
  batchSize: number;
  flushIntervalMs: number;
  maxRetries: number;
  checkpointIntervalMs: number;
  enableExactlyOnce: boolean;
}

export class CDCEngine extends EventEmitter {
  private source: Connector | null = null;
  private target: Connector | null = null;
  private checkpointManager: CheckpointManager;
  private config: CDCEngineConfig;
  private running: boolean = false;
  private batchBuffer: CDCEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private checkpointTimer: NodeJS.Timeout | null = null;
  private stats = {
    eventsProcessed: 0,
    batchesCommitted: 0,
    errors: 0,
    lastEventTime: null as Date | null,
  };

  constructor(config: Partial<CDCEngineConfig> = {}) {
    super();
    this.config = {
      batchSize: config.batchSize || 1000,
      flushIntervalMs: config.flushIntervalMs || 1000,
      maxRetries: config.maxRetries || 3,
      checkpointIntervalMs: config.checkpointIntervalMs || 5000,
      enableExactlyOnce: config.enableExactlyOnce ?? true,
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

    // Start flush timer
    this.flushTimer = setInterval(() => {
      if (this.running && this.batchBuffer.length > 0) {
        this.flushBatch().catch(err => {
          this.emit('error', { error: err });
        });
      }
    }, this.config.flushIntervalMs);

    // Start checkpoint loop
    this.checkpointTimer = setInterval(() => {
      if (this.running) {
        this.saveCheckpoint().catch(err => {
          this.emit('checkpoint:error', { error: err });
        });
      }
    }, this.config.checkpointIntervalMs);
  }

  async stop(): Promise<void> {
    if (!this.running) return;

    this.running = false;

    // Clear timers
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
      this.checkpointTimer = null;
    }

    // Flush remaining batch
    await this.flushBatch();

    // Stop CDC
    if (this.source) {
      await this.source.stopCDC();
    }

    // Save final checkpoint
    await this.saveCheckpoint();

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

  private handleEvent(event: CDCEvent): void {
    if (!this.running) return;

    this.batchBuffer.push(event);
    this.stats.eventsProcessed++;
    this.stats.lastEventTime = new Date();

    this.emit('event', event);

    if (this.batchBuffer.length >= this.config.batchSize) {
      this.flushBatch().catch(err => {
        this.emit('error', { error: err });
      });
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const batch = [...this.batchBuffer];
    this.batchBuffer = [];

    let retries = 0;
    while (retries < this.config.maxRetries) {
      try {
        await this.writeBatch(batch);
        this.stats.batchesCommitted++;
        this.emit('batch:committed', { count: batch.length });
        return;
      } catch (error) {
        retries++;
        this.stats.errors++;
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

  private async writeBatch(batch: CDCEvent[]): Promise<void> {
    if (!this.target) throw new Error('Target connector not set');

    // Group events by table for efficient writes
    const eventsByTable = new Map<string, CDCEvent[]>();
    for (const event of batch) {
      const tableEvents = eventsByTable.get(event.table) || [];
      tableEvents.push(event);
      eventsByTable.set(event.table, tableEvents);
    }

    // Apply events to target
    for (const [table, events] of eventsByTable) {
      for (const event of events) {
        await this.applyEvent(table, event);
      }
    }
  }

  private async applyEvent(table: string, event: CDCEvent): Promise<void> {
    // This is where we'd apply the change to the target database
    // For now, emit the event for listeners to handle
    this.emit('batch:write', { table, event });

    // In a real implementation, this would:
    // 1. For INSERT: INSERT INTO target_table VALUES (...)
    // 2. For UPDATE: UPDATE target_table SET ... WHERE pk = ...
    // 3. For DELETE: DELETE FROM target_table WHERE pk = ...
  }

  private async saveCheckpoint(): Promise<void> {
    try {
      const lastEvent = this.stats.lastEventTime;
      await this.checkpointManager.saveCheckpoint({
        id: `checkpoint-${Date.now()}`,
        pipelineId: 'current',
        lsn: this.stats.eventsProcessed.toString(),
        timestamp: lastEvent || new Date(),
        tables: {},
      });
      this.emit('checkpoint:saved');
    } catch (error) {
      this.emit('checkpoint:error', { error });
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getStats() {
    return {
      running: this.running,
      batchSize: this.batchBuffer.length,
      eventsProcessed: this.stats.eventsProcessed,
      batchesCommitted: this.stats.batchesCommitted,
      errors: this.stats.errors,
      lastEventTime: this.stats.lastEventTime,
      config: this.config,
    };
  }
}
