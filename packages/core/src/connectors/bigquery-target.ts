// @ts-nocheck
import { BigQuery, Table, Dataset } from '@google-cloud/bigquery';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { BaseConnector } from './base';
import { registerTarget } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerTarget('bigquery')
export class BigQueryTargetConnector extends BaseConnector {
  private client: BigQuery | null = null;
  private datasetId: string = '';
  private projectId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig, options?: any) {
    super(id, name, 'bigquery', config, options?.batchSize || 10000);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.projectId = (config as any).projectId || config.database || '';
    this.datasetId = (config as any).dataset || (config as any).schema || '';

    this.client = new BigQuery({
      projectId: this.projectId,
      keyFilename: (config as any).keyFile || undefined,
      credentials: (config as any).credentials || undefined,
    });

    // Verify connection
    const [datasets] = await this.client.getDatasets({ maxResults: 1 });
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.query({ query: 'SELECT 1', location: 'US' });
      return true;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    if (!this.client) throw new Error('Not connected');
    const dataset = this.client.dataset(this.datasetId);
    const [tables] = await dataset.getTables();
    return tables.map((t) => `${this.datasetId}.${t.id}`);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    if (!this.client) throw new Error('Not connected');
    const [, tableName] = table.includes('.') ? table.split('.') : [this.datasetId, table];
    const bqTable = this.client.dataset(this.datasetId).table(tableName);
    const [metadata] = await bqTable.getMetadata();
    const fields = metadata.schema?.fields || [];
    return {
      table,
      columns: fields.map((f: any) => ({ name: f.name, type: f.type, nullable: f.mode !== 'REQUIRED', defaultValue: null })),
      primaryKeys: [], // BigQuery doesn't enforce PKs
    };
  }

  async startCDC(_cb: (event: CDCEvent) => void): Promise<void> {
    throw new Error('BigQuery target does not support CDC read');
  }
  async stopCDC(): Promise<void> {}

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    const tableName = table.includes('.') ? table.split('.').pop()! : table;
    const dataset = this.client.dataset(this.datasetId);
    const bqTable = dataset.table(tableName);
    const [exists] = await bqTable.exists();
    if (exists) return;

    const fields = Object.entries(schema).map(([name, type]) => ({
      name,
      type: this.mapType(type),
      mode: 'NULLABLE' as const,
    }));
    await dataset.createTable(tableName, { schema: { fields } });
  }

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const tableName = table.includes('.') ? table.split('.').pop()! : table;
    let written = 0;

    for (let i = 0; i < rows.length; i += this.batchSize) {
      const batch = rows.slice(i, i + this.batchSize);
      const tmpFile = path.join(os.tmpdir(), `pulsyn_bq_${this.id}_${Date.now()}.jsonl`);

      try {
        // Write newline-delimited JSON
        const ndjson = batch.map((r) => JSON.stringify(this.serializeRow(r))).join('\n');
        fs.writeFileSync(tmpFile, ndjson);

        const bqTable = this.client!.dataset(this.datasetId).table(tableName);
        const [job] = await bqTable.load(tmpFile, {
          sourceFormat: 'NEWLINE_DELIMITED_JSON',
          writeDisposition: 'WRITE_APPEND',
          autodetect: false,
        });

        // Wait for job completion
        const [metadata] = await job.getMetadata();
        if (metadata.status?.errors && metadata.status.errors.length > 0) {
          throw new Error(`BigQuery load errors: ${JSON.stringify(metadata.status.errors[0])}`);
        }
        written += batch.length;
      } finally {
        if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
      }
    }
    return written;
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    if (!this.client) throw new Error('Not connected');
    const rows = events.filter((e) => e.after).map((e) => e.after!);
    if (rows.length === 0) return 0;

    const tableName = table.includes('.') ? table.split('.').pop()! : table;
    const fullTarget = `\`${this.projectId}.${this.datasetId}.${tableName}\``;
    const tempTableName = `_pulsyn_merge_${tableName}_${Date.now()}`;
    const fullTemp = `\`${this.projectId}.${this.datasetId}.${tempTableName}\``;

    try {
      // Load into temp table
      const tmpFile = path.join(os.tmpdir(), `pulsyn_bq_merge_${this.id}_${Date.now()}.jsonl`);
      const ndjson = rows.map((r) => JSON.stringify(this.serializeRow(r))).join('\n');
      fs.writeFileSync(tmpFile, ndjson);

      const dataset = this.client.dataset(this.datasetId);
      const tempBqTable = dataset.table(tempTableName);

      // Create temp table from source schema
      const sourceTable = dataset.table(tableName);
      const [sourceMeta] = await sourceTable.getMetadata();
      await dataset.createTable(tempTableName, { schema: sourceMeta.schema });

      const [job] = await tempBqTable.load(tmpFile, {
        sourceFormat: 'NEWLINE_DELIMITED_JSON',
        writeDisposition: 'WRITE_TRUNCATE',
      });
      const [jobMeta] = await job.getMetadata();
      if (jobMeta.status?.errors?.length) {
        throw new Error(`BigQuery merge load error: ${JSON.stringify(jobMeta.status.errors[0])}`);
      }
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

      // Execute MERGE DML
      const columns = Object.keys(rows[0]);
      const nonKeyCols = columns.filter((c) => !keyColumns.includes(c));
      const onClause = keyColumns.map((k) => `tgt.${k} = src.${k}`).join(' AND ');
      const updateSet = nonKeyCols.map((c) => `tgt.${c} = src.${c}`).join(', ');
      const insertCols = columns.join(', ');
      const insertVals = columns.map((c) => `src.${c}`).join(', ');

      const mergeSQL = `MERGE ${fullTarget} AS tgt USING ${fullTemp} AS src ON ${onClause}
        WHEN MATCHED THEN UPDATE SET ${updateSet}
        WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals})`;
      await this.client.query({ query: mergeSQL });

      return rows.length;
    } finally {
      // Cleanup temp table
      try {
        await this.client!.dataset(this.datasetId).table(tempTableName).delete();
      } catch { /* cleanup */ }
    }
  }

  private serializeRow(row: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      if (v instanceof Date) out[k] = v.toISOString();
      else out[k] = v;
    }
    return out;
  }

  private mapType(type: any): string {
    const t = typeof type === 'string' ? type.toLowerCase() : String(type).toLowerCase();
    if (t.includes('int')) return 'INT64';
    if (t.includes('float') || t.includes('double')) return 'FLOAT64';
    if (t.includes('decimal') || t.includes('numeric')) return 'NUMERIC';
    if (t.includes('bool')) return 'BOOL';
    if (t.includes('date') && !t.includes('time')) return 'DATE';
    if (t.includes('time') || t.includes('timestamp')) return 'TIMESTAMP';
    if (t.includes('json') || t.includes('struct')) return 'JSON';
    if (t.includes('bytes') || t.includes('binary')) return 'BYTES';
    return 'STRING';
  }
}

