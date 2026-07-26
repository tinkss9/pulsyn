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
      table,
      columns: fields.map((f: any) => ({
        name: f.name,
        type: f.type,
        nullable: f.mode !== 'REQUIRED',
        defaultValue: f.defaultValueExpression || null,
      })),
      primaryKeys: [], // BigQuery has no traditional PKs
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

    while (this.cdcActive && this.client) {
      try {
        const tables = await this.getTables();
        for (const table of tables) {
          const query = lastWatermark
            ? `SELECT * FROM \`${this.config.database}.${table}\` WHERE ${wmCol} > TIMESTAMP('${lastWatermark}') ORDER BY ${wmCol} LIMIT ${this.batchSize}`
            : `SELECT * FROM \`${this.config.database}.${table}\` WHERE ${wmCol} >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 5 MINUTE) ORDER BY ${wmCol} LIMIT ${this.batchSize}`;

          const [rows] = await this.client!.query({ query });
          for (const row of rows) {
            cb({ op: 'I', table, before: null, after: row, ts: new Date() });
            if (row[wmCol]) lastWatermark = row[wmCol].value || row[wmCol].toString();
          }
        }
        await new Promise((r) => setTimeout(r, 10000));
      } catch {
        if (this.cdcActive) await new Promise((r) => setTimeout(r, 30000));
      }
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
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
        events.push(createEvent('S', table, row, null, null, { source: 'bigquery' }));
      }
      offset += rows.length;
      if (rows.length < this.batchSize) break;
    }
    return events;
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    if (!this.client) throw new Error('Not connected');
    const wmCol = this.config.watermarkColumn || '_PARTITIONTIME';
    const events: UnifiedChangeEvent[] = [];

    const query = watermark
      ? `SELECT * FROM \`${this.config.database}.${table}\` WHERE ${wmCol} > TIMESTAMP('${watermark}') ORDER BY ${wmCol} LIMIT ${this.batchSize}`
      : `SELECT * FROM \`${this.config.database}.${table}\` ORDER BY ${wmCol} LIMIT ${this.batchSize}`;

    const [rows] = await this.client.query({ query });
    for (const row of rows) {
      const wm = row[wmCol]?.value || row[wmCol]?.toString() || null;
      events.push(createEvent('I', table, row, null, wm, { source: 'bigquery' }));
    }
    return events;
  }

  async estimateRowCount(table: string): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const query = `SELECT COUNT(*) AS cnt FROM \`${this.config.database}.${table}\``;
    const [rows] = await this.client.query({ query });
    return Number(rows[0]?.cnt || 0);
  }

  async getPrimaryKey(table: string): Promise<string> {
    return '_PARTITIONTIME'; // BigQuery uses partition for ordering
  }
}

