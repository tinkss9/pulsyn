// @ts-nocheck
// Cassandra Connector — distributed database source
// npm install cassandra-driver

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let cassandra: any;
try { cassandra = require('cassandra-driver'); } catch {}

@registerSource('cassandra')
export class CassandraConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'cassandra', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!cassandra) throw new Error('cassandra-driver not installed');
    this.client = new cassandra.Client({
      contactPoints: (config.host || '').split(','),
      localDataCenter: (config as any).datacenter || 'datacenter1',
      credentials: { username: config.user, password: config.password },
    });
    if (config.database) await this.client.execute(`USE ${config.database}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.client) { await this.client.shutdown(); this.client = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.execute('SELECT now() FROM system.local'); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const result = await this.client.execute(`SELECT table_name FROM system_schema.tables WHERE keyspace_name = '${this.config.database || 'default'}'`);
    return result.rows.map((r: any) => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const result = await this.client.execute(`SELECT column_name, type, kind FROM system_schema.columns WHERE keyspace_name = '${this.config.database || 'default'}' AND table_name = '${table}'`);
    return {
      name: table,
      columns: result.rows.map((r: any) => ({ name: r.column_name, type: r.type, nullable: true })),
      primaryKey: result.rows.filter((r: any) => r.kind === 'partition_key' || r.kind === 'clustering').map((r: any) => r.column_name),
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const result = await this.client.execute(`SELECT * FROM ${table} LIMIT ${this.batchSize}`);
    return result.rows.map((row: any) => createEvent({ op: 'S', table, after: row }));
  }

  async startCDC(): Promise<void> { throw new Error('Cassandra CDC requires Change Data Capture feature — not yet implemented'); }
  async stopCDC(): Promise<void> {}
}



