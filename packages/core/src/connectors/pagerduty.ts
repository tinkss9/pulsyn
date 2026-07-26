// PagerDuty Connector — incident management source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

@registerSource('pagerduty')
export class PagerDutyConnector extends BaseConnector {
  private token: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'pagerduty', config);
  }

  async connect(config: DatabaseConfig): Promise<void> {
    this.token = config.password;
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.pagerduty.com/users/me', {
        headers: { Authorization: `Token token=${this.token}`, Accept: 'application/json' },
      });
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> { return ['incidents', 'schedules', 'users', 'escalation_policies']; }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'id', type: 'string', nullable: false },
        { name: 'summary', type: 'string', nullable: true },
        { name: 'status', type: 'string', nullable: true },
        { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const res = await fetch(`https://api.pagerduty.com/${table}?limit=100`, {
      headers: { Authorization: `Token token=${this.token}`, Accept: 'application/json' },
    });
    const data = await res.json() as any;
    return (data[table] || data.users || []).map((item: any) =>
      createEvent({ op: 'S', table, after: item, watermark: item.id })
    );
  }

  async startCDC(): Promise<void> { throw new Error('PagerDuty CDC requires webhooks — use polling'); }
  async stopCDC(): Promise<void> {}
}
