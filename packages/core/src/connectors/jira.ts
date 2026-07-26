// Jira Connector — project management SaaS source
// npm install jira.js

import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Version3Client: any;
try { Version3Client = require('jira.js').Version3Client; } catch {}

@registerSource('jira')
export class JiraConnector extends BaseConnector {
  private client: any = null;

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'jira', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Version3Client) throw new Error('jira.js not installed');
    this.client = new Version3Client({ host: `https://${config.host}`, authentication: { basic: { email: config.user, apiToken: config.password } } });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> { try { await this.client.projects.getAllProjects(); return true; } catch { return false; } }

  async getTables(): Promise<string[]> { return ['issues', 'projects', 'users', 'boards']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return { name: table, columns: [{ name: 'id', type: 'string', nullable: false }, { name: 'key', type: 'string', nullable: true }, { name: 'summary', type: 'string', nullable: true }, { name: 'status', type: 'string', nullable: true }], primaryKey: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    let result;
    switch (table) {
      case 'issues': result = await this.client.issueSearch.searchForIssuesUsingJql({ jql: 'order BY created DESC', maxResults: 100 }); return (result.issues || []).map((i: any) => createEvent({ op: 'S', table, after: i, watermark: i.id }));
      case 'projects': result = await this.client.projects.getAllProjects(); return (result || []).map((p: any) => createEvent({ op: 'S', table, after: p, watermark: p.id }));
      default: throw new Error(`Unsupported Jira table: ${table}`);
    }
  }

  async startCDC(): Promise<void> { throw new Error('Jira CDC requires webhooks — use polling-based extraction'); }
  async stopCDC(): Promise<void> {}
}
