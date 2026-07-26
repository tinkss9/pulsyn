// Neo4j Connector — graph database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let neo4j: any;
try { neo4j = require('neo4j-driver'); } catch {}

@registerSource('neo4j')
export class Neo4jConnector extends BaseConnector {
  private driver: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'neo4j', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!neo4j) throw new Error('neo4j-driver not installed');
    this.driver = neo4j.driver(
      `bolt://${config.host}:${config.port || 7687}`,
      neo4j.auth.basic(config.user, config.password)
    );
    this.connected = true;
  }

  async disconnect(): Promise<void> { if (this.driver) { await this.driver.close(); this.driver = null; } this.connected = false; }
  async testConnection(): Promise<boolean> {
    try { const session = this.driver.session(); await session.run('RETURN 1'); await session.close(); return true; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const session = this.driver.session();
    try {
      const result = await session.run('CALL db.labels()');
      return result.records.map((r: any) => r.get('label'));
    } finally { await session.close(); }
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const session = this.driver.session();
    try {
      const result = await session.run(`MATCH (n:${table}) RETURN keys(n) as keys LIMIT 1`);
      const keys = result.records[0]?.get('keys') || [];
      return {
        name: table,
        columns: keys.map((k: string) => ({ name: k, type: 'string', nullable: true })),
        primaryKey: ['elementId(n)'],
      };
    } finally { await session.close(); }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(`MATCH (n:${table}) RETURN n LIMIT 100`);
      return result.records.map((r: any) => {
        const node = r.get('n');
        return createEvent({ op: 'S', table, after: node.properties, watermark: node.elementId });
      });
    } finally { await session.close(); }
  }

  async startCDC(): Promise<void> { throw new Error('Neo4j CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
