// @ts-nocheck
// Spanner Connector — Google globally-distributed database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Spanner: any;
try { Spanner = require('@google-cloud/spanner').Spanner; } catch {}

@registerSource('spanner')
export class SpannerConnector extends BaseConnector {
  private spanner: any = null;
  private instance: any = null;
  private database: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'spanner', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Spanner) throw new Error('@google-cloud/spanner not installed');
    this.spanner = new Spanner({ projectId: config.database });
    this.instance = this.spanner.instance((config as any).instance || 'default');
    this.database = this.instance.database((config as any).database || config.database);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.database) await this.database.close();
    if (this.spanner) this.spanner.close();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const [rows] = await this.database.run({ sql: 'SELECT 1' });
      return rows.length > 0;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const [tables] = await this.database.getTables();
    return tables.map((t: any) => t.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const [t] = await this.database.table(table).get();
    const [schema] = await t.getSchema();
    return {
      name: table,
      columns: schema.columns.map((c: any) => ({ name: c.name, type: c.type, nullable: !c.notNull })),
      primaryKey: schema.primaryKey.map((k: any) => k.name),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const [rows] = await this.database.run(`SELECT * FROM ${table} LIMIT ${this.batchSize}`);
    return rows.map((row: any) => createEvent({ op: 'S', table, after: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('Spanner CDC requires Change Streams — use polling'); }
  async stopCDC(): Promise<void> {}
}



