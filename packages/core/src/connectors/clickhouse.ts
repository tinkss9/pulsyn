// ClickHouse Connector — analytics database source
// npm install @clickhouse/client

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let createClient: any;
try { createClient = require('@clickhouse/client').createClient; } catch {}

@registerSource('clickhouse')
export class ClickHouseConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'clickhouse', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!createClient) throw new Error('@clickhouse/client not installed');
    this.client = createClient({
      host: `http://${config.host}:${config.port || 8123}`,
      username: config.user, password: config.password, database: config.database,
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.client) { await this.client.close(); this.client = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.query({ query: 'SELECT 1' }); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.client.query({ query: `SELECT name FROM system.tables WHERE database = '${this.config.database}' AND engine != 'MaterializedView' ORDER BY name` });
    return (await result.json()).data.map((r: any) => r.name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const result = await this.client.query({ query: `SELECT name, type, default_kind FROM system.columns WHERE database = '${this.config.database}' AND table = '${table}' ORDER BY position` });
    return {
      name: table,
      columns: (await result.json()).data.map((r: any) => ({ name: r.name, type: r.type, nullable: r.default_kind !== 'DEFAULT' })),
      primaryKey: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.query({ query: `SELECT * FROM ${table} LIMIT ${this.batchSize}` });
    return (await result.json()).data.map((row: any) => createEvent({ op: 'S', table, after: row }));
  }

  async startCDC(): Promise<void> { throw new Error('ClickHouse CDC not supported — use incremental extraction'); }
  async stopCDC(): Promise<void> {}

  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    const rows = events.filter(e => e.op === 'I' || e.op === 'S').map(e => e.after);
    if (rows.length === 0) return 0;
    await this.client.insert({ table, values: rows, format: 'JSONEachRow' });
    return rows.length;
  }
}


