// Databricks Connector — lakehouse source/target
// npm install @databricks/sql

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let DBSQLClient: any;
try { DBSQLClient = require('@databricks/sql').DBSQLClient; } catch {}

@registerSource('databricks')
export class DatabricksConnector extends BaseConnector {
  private client: any = null;
  private session: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'databricks', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!DBSQLClient) throw new Error('@databricks/sql not installed');
    this.client = new DBSQLClient();
    this.session = await this.client.connect({
      host: config.host, path: (config as any).path || '/sql/1.0/endpoints',
      token: config.password, catalog: config.database, schema: (config as any).schema || 'default',
    });
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.session) { await this.session.close(); this.session = null; } if (this.client) { await this.client.close(); this.client = null; } this.connected = false; }
  async testConnection(): Promise<boolean> { try { const op = await this.session.executeStatement('SELECT 1'); await op.fetchAll(); await op.close(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> {
    const op = await this.session.executeStatement(`SHOW TABLES IN ${this.config.database || 'default'}`);
    const rows = await op.fetchAll();
    await op.close();
    return rows.map((r: any) => Object.values(r)[0] as string);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const op = await this.session.executeStatement(`DESCRIBE TABLE ${table}`);
    const rows = await op.fetchAll();
    await op.close();
    return {
      name: table,
      columns: rows.map((r: any) => ({ name: r.col_name, type: r.data_type, nullable: true })),
      primaryKey: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const op = await this.session.executeStatement(`SELECT * FROM ${table} LIMIT ${this.batchSize}`);
    const rows = await op.fetchAll();
    await op.close();
    return rows.map((row: any) => createEvent({ op: 'S', table, after: row }));
  }

  async startCDC(): Promise<void> { throw new Error('Databricks CDC not supported — use incremental extraction'); }
  async stopCDC(): Promise<void> {}
}
