// @ts-nocheck
// Cassandra v2 Connector — Pulsyn CDC Platform
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('cassandra-v2')
export class CassandraV2Connector extends BaseConnector {
  private pool: any = null;
  private client: any = null;
  private db: any = null;
  private apiKey: string = '';
  private baseUrl: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'cassandra-v2', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    const cassandra = require('cassandra-driver'); this.client = new cassandra.Client({ contactPoints: [config.host], localDataCenter: config.database || 'datacenter1', credentials: { username: config.user, password: config.password } }); await this.client.execute('SELECT release_version FROM system.local');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.pool) await this.pool.end?.();
    if (this.client) await this.client.shutdown?.();
    if (this.db) this.db.close?.();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.execute('SELECT release_version FROM system.local'); return true;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const res = await this.client.execute("SELECT table_name FROM system_schema.tables WHERE keyspace_name = '" + this.config.database + "'"); return res.rows.map(r => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const res = await this.client.execute("SELECT column_name, type FROM system_schema.columns WHERE keyspace_name = '" + this.config.database + "' AND table_name = '" + table + "'"); return { name: table, columns: res.rows.map(c => ({ name: c.column_name, type: c.type, nullable: true })), primaryKey: [] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await this.client.execute('SELECT * FROM ' + table + ' LIMIT ' + this.batchSize); return res.rows.map(row => createEvent({ op: 'S', table, data: row, watermark: row.id || '' }));
  }

  async startCDC(): Promise<void> { throw new Error('CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
