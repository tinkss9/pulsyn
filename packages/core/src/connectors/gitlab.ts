// @ts-nocheck
// GitLab Connector — source connector for repos, issues, MRs
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('gitlab')
export class GitLabConnector extends BaseConnector {
  private baseUrl: string = '';
  private token: string = '';
  private projectId: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'gitlab', config);
    this.baseUrl = `https://${config.host || 'gitlab.com'}/api/v4`;
    this.token = config.password;
    this.projectId = (config as any).projectId || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/user`, { headers: { Authorization: `Bearer ${this.token}` } });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['projects', 'issues', 'merge_requests', 'commits', 'pipelines']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'title', type: 'string', nullable: true },
        { name: 'state', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
        { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`${this.baseUrl}/projects/${this.projectId}/${table}?per_page=100`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const items = await res.json() as any[];
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: String(item.id) }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const params = watermark ? `?updated_after=${watermark}&per_page=100` : '?per_page=100';
    const res = await fetch(`${this.baseUrl}/projects/${this.projectId}/${table}${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const items = await res.json() as any[];
    return items.map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.updated_at || String(item.id) }));
  }

  async startCDC(): Promise<void> { throw new Error('GitLab CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}



