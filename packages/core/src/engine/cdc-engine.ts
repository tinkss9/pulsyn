// CDC Engine
// Orchestrates change data capture from source to target with REAL replication

import { EventEmitter } from 'events';
import { Connector, CDCEvent } from '../types';
import { CheckpointManager } from '../checkpoint/checkpoint-manager';
import { Pool } from 'pg';

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
  private targetPool: Pool | null = null;
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
    rowsInserted: 0,
    rowsUpdated: 0,
    rowsDeleted: 0,
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

  // Set target database pool directly for replication
  setTargetPool(pool: Pool): void {
    this.targetPool = pool;
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

    // Set up target pool for direct writes
    if (this.target.config) {
      this.targetPool = new Pool({
        host: this.target.config.host,
        port: this.target.config.port,
        database: this.target.config.database,
        user: this.target.config.user,
        password: this.target.config.password,
        ssl: this.target.config.ssl ? { rejectUnauthorized: false } : false,
        max: 10,
      });
    }

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

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
      this.checkpointTimer = null;
    }

    await this.flushBatch();
    await this.saveCheckpoint();

    if (this.source) await this.source.stopCDC();
    if (this.targetPool) await this.targetPool.end();
    if (this.source) await this.source.disconnect();
    if (this.target) await this.target.disconnect();

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
        await this.sleep(Math.pow(2, retries) * 100);
      }
    }
  }

  private async writeBatch(batch: CDCEvent[]): Promise<void> {
    if (!this.targetPool) {
      // Fallback to event emission if no target pool
      for (const event of batch) {
        this.emit('batch:write', { table: event.table, event });
      }
      return;
    }

    // Group events by table for efficient writes
    const eventsByTable = new Map<string, CDCEvent[]>();
    for (const event of batch) {
      const tableEvents = eventsByTable.get(event.table) || [];
      tableEvents.push(event);
      eventsByTable.set(event.table, tableEvents);
    }

    // Apply events to target database
    const client = await this.targetPool.connect();
    try {
      await client.query('BEGIN');

      for (const [table, events] of eventsByTable) {
        for (const event of events) {
          await this.applyEvent(client, table, event);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async applyEvent(client: any, table: string, event: CDCEvent): Promise<void> {
    const data = event.data;
    const oldData = event.oldData;

    switch (event.operation) {
      case 'INSERT': {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map((_, i) => `$${i + 1}`);

        const sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
                     VALUES (${placeholders.join(', ')})
                     ON CONFLICT DO NOTHING`;

        await client.query(sql, values);
        this.stats.rowsInserted++;
        break;
      }

      case 'UPDATE': {
        if (!oldData) {
          // If no old data, try INSERT instead
          const columns = Object.keys(data);
          const values = Object.values(data);
          const placeholders = columns.map((_, i) => `$${i + 1}`);

          const sql = `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
                       VALUES (${placeholders.join(', ')})
                       ON CONFLICT DO NOTHING`;

          await client.query(sql, values);
          this.stats.rowsInserted++;
          break;
        }

        // Find primary key columns (assume 'id' exists, or use all old data keys)
        const pkColumns = Object.keys(oldData).filter(k =>
          k === 'id' || k.endsWith('_id') || k === 'pk'
        );
        const pkKeys = pkColumns.length > 0 ? pkColumns : Object.keys(oldData);

        // Build SET clause
        const setColumns = Object.keys(data).filter(k => !pkKeys.includes(k));
        const setClauses = setColumns.map((col, i) => `"${col}" = $${i + 1}`);
        const setValues = setColumns.map(col => data[col]);

        // Build WHERE clause
        const whereClauses = pkKeys.map((col, i) => `"${col}" = $${setColumns.length + i + 1}`);
        const whereValues = pkKeys.map(col => oldData[col]);

        const sql = `UPDATE "${table}"
                     SET ${setClauses.join(', ')}
                     WHERE ${whereClauses.join(' AND ')}`;

        await client.query(sql, [...setValues, ...whereValues]);
        this.stats.rowsUpdated++;
        break;
      }

      case 'DELETE': {
        const deleteData = oldData || data;

        // Find primary key columns
        const delPkColumns = Object.keys(deleteData).filter(k =>
          k === 'id' || k.endsWith('_id') || k === 'pk'
        );
        const delPkKeys = delPkColumns.length > 0 ? delPkColumns : Object.keys(deleteData);

        const delWhereClauses = delPkKeys.map((col, i) => `"${col}" = $${i + 1}`);
        const delWhereValues = delPkKeys.map(col => deleteData[col]);

        const sql = `DELETE FROM "${table}"
                     WHERE ${delWhereClauses.join(' AND ')}`;

        await client.query(sql, delWhereValues);
        this.stats.rowsDeleted++;
        break;
      }
    }

    this.emit('event:applied', { table, operation: event.operation });
  }

  private async saveCheckpoint(): Promise<void> {
    try {
      await this.checkpointManager.saveCheckpoint({
        id: `checkpoint-${Date.now()}`,
        pipelineId: 'current',
        lsn: this.stats.eventsProcessed.toString(),
        timestamp: this.stats.lastEventTime || new Date(),
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
      rowsInserted: this.stats.rowsInserted,
      rowsUpdated: this.stats.rowsUpdated,
      rowsDeleted: this.stats.rowsDeleted,
      config: this.config,
    };
  }
}
