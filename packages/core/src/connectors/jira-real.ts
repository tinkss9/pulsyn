// Jira Connector — Real API Integration
// Auth: API token + email (Atlassian Cloud) or Personal Access Token (Server/DC)
// API: Jira REST API v3
// Test: Free Jira Cloud account (up to 10 users)

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('jira-real')
export class JiraRealConnector extends BaseConnector {
  private baseUrl = '';
  private email = '';
  private token = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.baseUrl = config.host || '';
    this.email = config.username || '';
    this.token = config.token || config.password || '';
    if (!this.baseUrl || !this.token) throw new Error('Jira URL and API token required');

    const resp = await this.jiraGet('/myself');
    if (!resp.ok) throw new Error(`Jira connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.token = ''; }
  async testConnection(): Promise<boolean> { try { return (await this.jiraGet('/myself')).ok; } catch { return false; } }

  async getTables(): Promise<string[]> {
    return ['issues', 'projects', 'boards', 'sprints', 'users', 'workflows', 'components', 'versions'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      issues: { table: 'issues', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'key', type: 'string', nullable: false },
        { name: 'summary', type: 'string', nullable: false },
        { name: 'status', type: 'string', nullable: true },
        { name: 'assignee', type: 'string', nullable: true },
        { name: 'reporter', type: 'string', nullable: true },
        { name: 'priority', type: 'string', nullable: true },
        { name: 'issuetype', type: 'string', nullable: true },
        { name: 'created', type: 'string', nullable: false },
        { name: 'updated', type: 'string', nullable: false },
      ]},
      projects: { table: 'projects', primaryKeys: ['id'], columns: [
        { name: 'id', type: 'string', nullable: false, primaryKey: true },
        { name: 'key', type: 'string', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'projectTypeKey', type: 'string', nullable: true },
      ]},
    };
    return schemas[table] || { table, columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (table === 'issues') {
      const resp = await this.jiraGet('/search?maxResults=100&fields=summary,status,assignee,reporter,priority,issuetype,created,updated');
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.issues || []).map((issue: any) => createEvent({
        op: 'S', table, after: { id: issue.id, key: issue.key, ...issue.fields }, watermark: issue.fields?.updated,
      }));
    }
    if (table === 'projects') {
      const resp = await this.jiraGet('/project');
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.map((p: any) => createEvent({ op: 'S', table, after: p, watermark: null }));
    }
    return [];
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    if (table === 'issues' && opts?.watermarkValue) {
      const jql = `updated >= '${opts.watermarkValue}' ORDER BY updated DESC`;
      const resp = await this.jiraGet(`/search?jql=${encodeURIComponent(jql)}&maxResults=100`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return (data.issues || []).map((issue: any) => createEvent({
        op: 'S', table, after: { id: issue.id, key: issue.key, ...issue.fields }, watermark: issue.fields?.updated,
      }));
    }
    return this.extractFull(table);
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> { this.cdcActive = true; }
  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async jiraGet(path: string): Promise<Response> {
    const auth = this.email ? `${this.email}:${this.token}` : this.token;
    const encoded = Buffer.from(auth).toString('base64');
    return fetch(`${this.baseUrl}/rest/api/3${path}`, {
      headers: { 'Authorization': `Basic ${encoded}`, 'Content-Type': 'application/json' },
    });
  }
}
