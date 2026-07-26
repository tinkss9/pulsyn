// GitHub Connector — source connector for repos, issues, PRs
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let Octokit: any;
try { Octokit = require('@octokit/rest').Octokit; } catch {}

@registerSource('github')
export class GitHubConnector extends BaseConnector {
  private client: any = null;
  private owner: string = '';
  private repo: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'github', config);
    this.owner = (config as any).owner || '';
    this.repo = (config as any).repo || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!Octokit) throw new Error('@octokit/rest not installed');
    this.client = new Octokit({ auth: config.password });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try { await this.client.rest.users.getAuthenticated(); return true; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['repos', 'issues', 'pulls', 'commits', 'actions', 'releases'];
  }

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
    let items: any[] = [];
    switch (table) {
      case 'issues':
        const issues = await this.client.rest.issues.listForRepo({ owner: this.owner, repo: this.repo, per_page: 100 });
        items = issues.data;
        break;
      case 'pulls':
        const pulls = await this.client.rest.pulls.list({ owner: this.owner, repo: this.repo, per_page: 100 });
        items = pulls.data;
        break;
      case 'repos':
        const repos = await this.client.rest.repos.listForAuthenticatedUser({ per_page: 100 });
        items = repos.data;
        break;
      default:
        throw new Error(`Unsupported table: ${table}`);
    }
    return items.map((item: any) => createEvent({ op: 'S', table, after: item, watermark: String(item.id) }));
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const since = watermark ? new Date(watermark).toISOString() : new Date(Date.now() - 86400000).toISOString();
    let items: any[] = [];
    switch (table) {
      case 'issues':
        const issues = await this.client.rest.issues.listForRepo({ owner: this.owner, repo: this.repo, since, per_page: 100 });
        items = issues.data;
        break;
      case 'pulls':
        const pulls = await this.client.rest.pulls.list({ owner: this.owner, repo: this.repo, per_page: 100 });
        items = pulls.data.filter((p: any) => new Date(p.updated_at) > new Date(since));
        break;
      default:
        return [];
    }
    return items.map((item: any) => createEvent({ op: 'I', table, after: item, watermark: item.updated_at || String(item.id) }));
  }

  async startCDC(): Promise<void> { throw new Error('GitHub CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
