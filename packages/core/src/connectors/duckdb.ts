// DuckDB Connector — embedded analytics database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let duckdb: any;
try { duckdb = require('duckdb'); } catch {}

@registerSource('duckdb')
export class DuckDBConnector extends BaseConnector {
  private db: any = null;
  private conn: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'duckdb', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!duckdb) throw new Error('duckdb not installed');
    this.db = new duckdb.Database(config.database || ':memory:');
    this.conn = this.db.connect();
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    if (this.conn) { this.conn.close(); this.conn = null; }
    if (this.db) { this.db.close(); this.db = null; }
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.conn.all('SELECT 1 as test');
      return result.length > 0;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const result = await this.conn.all("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'");
    return result.map((r: any) => r.table_name);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const cols = await this.conn.all(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`
    );
    return {
      name: table,
      columns: cols.map((c: any) => ({ name: c.column_name, type: c.data_type, nullable: c.is_nullable === 'YES' })),
      primaryKey: [],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const rows = await this.conn.all(`SELECT * FROM "${table}" LIMIT ${this.batchSize}`);
    return rows.map((row: any) => createEvent({ op: 'S', table, after: row }));
  }

  async startCDC(): Promise<void> { throw new Error('DuckDB CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
