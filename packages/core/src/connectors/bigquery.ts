// @ts-nocheck
import { BigQuery, Dataset, Table } from '@google-cloud/bigquery';
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('bigquery')
export class BigQueryConnector extends BaseConnector {
  private client: BigQuery | null = null;
  private dataset: Dataset | null = null;
  private cdcActive = false;
  private cdcInterval: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      this.client = new BigQuery({
        projectId: (config as any).projectId || config.host,
        keyFilename: (config as any).keyFilename || undefined,
        credentials: (config as any).credentials || undefined,
        location: (config as any).location || 'US',
      });
      this.dataset = this.client.dataset(config.database);
      const [exists] = await this.dataset.exists();
      if (!exists) throw new Error(`Dataset ${config.database} does not exist`);
      this.connected = true;
    } catch (error) {
      throw new Error(`BigQuery connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.client = null;
    this.dataset = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client || !this.dataset) return false;
      const [exists] = await this.dataset.exists();
      return exists;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.dataset) throw new Error('Not connected');
    const [tables] = await this.dataset.getTables();
    return tables.map((t) => t.id!).sort();
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.dataset) throw new Error('Not connected');
    const tableRef = this.dataset.table(table);
    const [metadata] = await tableRef.getMetadata();
    const fields = metadata.schema?.fields || [];
    return {
      name: table,
      table,
      columns: fields.map((f: any) => ({
        name: f.name,
        type: f.type,
        nullable: f.mode !== 'REQUIRED',
        defaultValue: f.defaultValueExpression || null,
      })),
      primaryKey: [],
      primaryKeys: [],
    };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    this.cdcActive = true;
    this.pollWatermark(callback);
  }

  private async pollWatermark(cb: (event: CDCEvent) => void): Promise<void> {
    const wmCol = this.config.watermarkColumn || '_PARTITIONTIME';
    let lastWatermark: string | null = null;

    this.cdcInterval = setInterval(async () => {
      if (!this.cdcActive || !this.client) return;
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const query = lastWatermark
            ? `SELECT * FROM \`${this.config.database}.${table}\` WHERE ${wmCol} > TIMESTAMP('${lastWatermark}') ORDER BY ${wmCol} LIMIT ${this.batchSize}`
            : `SELECT * FROM \`${this.config.database}.${table}\` WHERE ${wmCol} >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE) ORDER BY ${wmCol} LIMIT ${this.batchSize}`;

          const [rows] = await this.client!.query({ query });
          for (const row of rows) {
            cb({
              op: 'I',
              table,
              before: null,
              after: row,
              ts: new Date(),
            });
            if (row[wmCol]) lastWatermark = row[wmCol].value || row[wmCol].toString();
          }
        }
      } catch {
        // Retry on next interval
      }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.cdcInterval) {
      clearInterval(this.cdcInterval);
      this.cdcInterval = null;
    }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const events: UnifiedChangeEvent[] = [];
    let offset = 0;

    while (true) {
      const query = `SELECT * FROM \`${this.config.database}.${table}\` ORDER BY _PARTITIONTIME LIMIT ${this.batchSize} OFFSET ${offset}`;
      const [rows] = await this.client.query({ query });
      if (rows.length === 0) break;
      for (const row of rows) {
        events.push(createEvent({
          op: 'S',
          table,
          after: row,
          before: null,
          sourceMetadata: { source: 'bigquery' },
        }));
      }
      offset += rows.length;
      if (rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const wmCol = opts?.watermarkColumn || this.config.watermarkColumn || '_PARTITIONTIME';
    const watermark = opts?.watermarkValue || null;
    const events: UnifiedChangeEvent[] = [];

    const query = watermark
      ? `SELECT * FROM \`${this.config.database}.${table}\` WHERE ${wmCol} > TIMESTAMP('${watermark}') ORDER BY ${wmCol} LIMIT ${this.batchSize}`
      : `SELECT * FROM \`${this.config.database}.${table}\` ORDER BY ${wmCol} LIMIT ${this.batchSize}`;

    const [rows] = await this.client.query({ query });
    for (const row of rows) {
      const wm = row[wmCol]?.value || row[wmCol]?.toString() || null;
      events.push(createEvent({
        op: 'I',
        table,
        after: row,
        before: null,
        sourceMetadata: { source: 'bigquery', pk: wm },
      }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const query = `SELECT COUNT(*) AS cnt FROM \`${this.config.database}.${table}\``;
    const [rows] = await this.client.query({ query });
    return Number(rows[0]?.cnt || 0);
  }

  async getPrimaryKey(): Promise<string> {
    return '_PARTITIONTIME';
  }
}
