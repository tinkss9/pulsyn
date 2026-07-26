// BigQuery Target Connector — write-only for data warehouse loading
// npm install @google-cloud/bigquery

import { BaseConnector, WriteBatchResult } from '../connectors/base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent } from '../events';
import { registerTarget } from '../connectors/registry';

let BigQuery: any;
try { BigQuery = require('@google-cloud/bigquery').BigQuery; } catch {}

@registerTarget('bigquery')
export class BigQueryTargetConnector extends BaseConnector {
  private bq: any = null;
  private dataset: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'bigquery', config);
    this.dataset = (config as any).dataset || 'pulsyn';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!BigQuery) throw new Error('@google-cloud/bigquery not installed');
    this.bq = new BigQuery({
      projectId: config.database,
      keyFilename: (config as any).keyFile,
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.bq = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.bq) return false;
      await this.bq.getDatasets();
      return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const dataset = this.bq.dataset(this.dataset);
    const [tables] = await dataset.getTables();
    return tables.map((t: any) => t.id);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const dataset = this.bq.dataset(this.dataset);
    const [t] = await dataset.table(table).get();
    const [meta] = await t.getMetadata();
    return {
      name: table,
      columns: (meta.schema?.fields || []).map((f: any) => ({
        name: f.name,
        type: f.type,
        nullable: f.mode !== 'REQUIRED',
      })),
      primaryKey: [],
    };
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<WriteBatchResult> {
    const rows = events
      .filter(e => e.op === 'I' || e.op === 'S')
      .map(e => ({ json: e.after }));

    if (rows.length === 0) return { inserted: 0, errors: 0, deleted: 0, merged: 0, failedRecords: [] };

    const dataset = this.bq.dataset(this.dataset);
    await dataset.table(table).insert(rows);
    return { inserted: rows.length, errors: 0, deleted: 0, merged: 0, failedRecords: [] };
  }

  async startCDC(): Promise<void> { throw new Error('BigQuery is a target-only connector'); }
  async stopCDC(): Promise<void> {}
}
