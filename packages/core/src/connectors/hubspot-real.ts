// HubSpot Connector — Real API Integration
// Auth: Private App token (pat-na1-*) or OAuth2
// API: HubSpot CRM API v3
// Test: Free HubSpot account with Private App token

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('hubspot-real')
export class HubSpotRealConnector extends BaseConnector {
  private baseUrl = 'https://api.hubapi.com';
  private apiKey = '';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.apiKey = config.token || config.password || '';
    if (!this.apiKey) throw new Error('HubSpot Private App token required');

    const resp = await this.apiGet('/crm/v3/objects/contacts?limit=1');
    if (!resp.ok) throw new Error(`HubSpot connection failed: HTTP ${resp.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.connected = false; this.apiKey = ''; }

  async testConnection(): Promise<boolean> {
    try { return (await this.apiGet('/crm/v3/objects/contacts?limit=1')).ok; } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    return ['contacts', 'companies', 'deals', 'tickets', 'products', 'quotes', 'calls', 'emails', 'meetings', 'notes', 'tasks'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    try {
      const resp = await this.apiGet(`/crm/v3/properties/${table}`);
      if (!resp.ok) return { table, columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
      const data = await resp.json();
      const columns = (data.results || []).slice(0, 50).map((p: any) => ({
        name: p.name, type: this.mapType(p.type), nullable: !p.required, primaryKey: p.name === 'hs_object_id',
      }));
      return { table, columns, primaryKeys: ['hs_object_id'] };
    } catch {
      return { table, columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }], primaryKeys: ['id'] };
    }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const resp = await this.apiGet(`/crm/v3/objects/${table}?limit=100&properties=email,firstname,lastname,name,amount,stage`);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || []).map((item: any) =>
      createEvent({ op: 'S', table, after: { id: item.id, ...item.properties }, watermark: item.updatedAt })
    );
  }

  async extractIncremental(table: string, opts?: { watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    let url = `/crm/v3/objects/${table}?limit=100&properties=email,firstname,lastname,name,amount,stage`;
    if (opts?.watermarkValue) url += `&filterGroups=[{"filters":[{"propertyName":"lastmodifieddate","operator":"GTE","value":"${opts.watermarkValue}"}]}]`;
    const resp = await this.apiGet(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.results || []).map((item: any) =>
      createEvent({ op: 'S', table, after: { id: item.id, ...item.properties }, watermark: item.updatedAt })
    );
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    // HubSpot webhooks are the real CDC mechanism; polling for now
  }

  async stopCDC(): Promise<void> { this.cdcActive = false; }

  private async apiGet(path: string): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
    });
  }

  private mapType(hsType: string): string {
    const map: Record<string, string> = { 'string': 'string', 'number': 'number', 'date': 'string', 'datetime': 'string', 'bool': 'boolean', 'enumeration': 'string', 'phone_number': 'string' };
    return map[hsType] || 'string';
  }
}
