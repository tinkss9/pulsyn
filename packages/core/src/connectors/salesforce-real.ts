// Salesforce Connector — Real API Integration
// Auth: OAuth2 Bearer token (from Salesforce Connected App)
// API: Salesforce REST API v60.0
// Test: Free Developer Edition at developer.salesforce.com

import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('salesforce-real')
export class SalesforceRealConnector extends BaseConnector {
  private baseUrl = '';
  private accessToken = '';
  private instanceUrl = '';
  private apiVersion = 'v60.0';
  private cdcActive = false;
  private cdcCallback: ((event: CDCEvent) => void) | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.instanceUrl = config.host || 'https://login.salesforce.com';
    this.accessToken = config.token || config.password || '';

    if (!this.accessToken) {
      throw new Error('Salesforce access token required. Get one from Salesforce Connected App OAuth2 flow.');
    }

    // If instanceUrl is login.salesforce.com, we need to discover the actual instance
    if (this.instanceUrl.includes('login.salesforce.com') || this.instanceUrl.includes('test.salesforce.com')) {
      // Token contains instance URL after auth
      this.baseUrl = this.instanceUrl;
    } else {
      this.baseUrl = this.instanceUrl;
    }

    // Verify connection by querying limits
    const resp = await this.apiGet('/limits');
    if (!resp.ok) {
      throw new Error(`Salesforce connection failed: HTTP ${resp.status} ${resp.statusText}`);
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.accessToken = '';
  }

  async testConnection(): Promise<boolean> {
    try {
      const resp = await this.apiGet('/limits');
      return resp.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    // Get all SObjects
    const resp = await this.apiGet('/sobjects');
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.sobjects || [])
      .filter((s: any) => s.queryable && s.retrieveable)
      .map((s: any) => s.name)
      .slice(0, 100);
  }

  async getTableSchema(objectName: string): Promise<TableSchema> {
    const resp = await this.apiGet(`/sobjects/${objectName}/describe`);
    if (!resp.ok) {
      return { table: objectName, columns: [], primaryKeys: ['Id'] };
    }
    const data = await resp.json();
    const columns = (data.fields || []).map((f: any) => ({
      name: f.name,
      type: this.mapSalesforceType(f.type),
      nullable: f.nillable,
      primaryKey: f.name === 'Id',
    }));
    return {
      table: objectName,
      columns,
      primaryKeys: ['Id'],
    };
  }

  async extractFull(objectName: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    const limit = opts?.limit || 200;
    const fields = await this.getFieldList(objectName);
    const query = `SELECT ${fields} FROM ${objectName} LIMIT ${limit}`;
    const resp = await this.apiGet(`/query?q=${encodeURIComponent(query)}`);
    if (!resp.ok) return [];

    const data = await resp.json();
    const records = data.records || [];
    return records.map((record: any) => {
      const { attributes, ...fields } = record;
      return createEvent({
        op: 'S',
        table: objectName,
        after: fields,
        watermark: fields.SystemModstamp || fields.LastModifiedDate || fields.CreatedDate,
      });
    });
  }

  async extractIncremental(objectName: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    const watermarkCol = opts?.watermarkColumn || 'SystemModstamp';
    const watermarkVal = opts?.watermarkValue;
    const fields = await this.getFieldList(objectName);

    let query = `SELECT ${fields} FROM ${objectName}`;
    if (watermarkVal) {
      query += ` WHERE ${watermarkCol} > ${watermarkVal}`;
    }
    query += ` ORDER BY ${watermarkCol} DESC LIMIT 200`;

    const resp = await this.apiGet(`/query?q=${encodeURIComponent(query)}`);
    if (!resp.ok) return [];

    const data = await resp.json();
    const records = data.records || [];
    return records.map((record: any) => {
      const { attributes, ...fields } = record;
      return createEvent({
        op: 'S',
        table: objectName,
        after: fields,
        watermark: fields[watermarkCol],
      });
    });
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
    this.cdcCallback = callback;

    // Salesforce CDC uses Platform Events / ChangeDataCapture
    // Subscribe to /data/ChangeDataCaptureEvents via streaming API
    // For polling-based CDC, we use incremental extraction
    const pollInterval = setInterval(async () => {
      if (!this.cdcActive) {
        clearInterval(pollInterval);
        return;
      }
      // Poll for recent changes
      try {
        const objects = await this.getTables();
        for (const obj of objects.slice(0, 10)) {
          const events = await this.extractIncremental(obj);
          for (const event of events) {
            callback({
              before: null,
              after: event.after,
              op: event.op as any,
              source: { connector: 'salesforce-real', table: obj },
              ts: new Date(),
            });
          }
        }
      } catch {}
    }, 30000); // Poll every 30s
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    this.cdcCallback = null;
  }

  // ── SOQL Query Support ──

  async query(soql: string): Promise<any[]> {
    const resp = await this.apiGet(`/query?q=${encodeURIComponent(soql)}`);
    if (!resp.ok) return [];
    const data = await resp.json();
    let records = data.records || [];

    // Handle pagination
    while (data.nextRecordsUrl) {
      const nextResp = await this.httpGet(data.nextRecordsUrl);
      if (!nextResp.ok) break;
      const nextData = await nextResp.json();
      records = records.concat(nextData.records || []);
      data.nextRecordsUrl = nextData.nextRecordsUrl;
    }

    return records.map((r: any) => {
      const { attributes, ...fields } = r;
      return fields;
    });
  }

  // ── CRUD Operations ──

  async createRecord(objectName: string, fields: Record<string, any>): Promise<string | null> {
    const resp = await this.apiPost(`/sobjects/${objectName}`, fields);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.id;
  }

  async updateRecord(objectName: string, id: string, fields: Record<string, any>): Promise<boolean> {
    const resp = await this.apiPatch(`/sobjects/${objectName}/${id}`, fields);
    return resp.ok;
  }

  async deleteRecord(objectName: string, id: string): Promise<boolean> {
    const resp = await this.apiDelete(`/sobjects/${objectName}/${id}`);
    return resp.ok;
  }

  // ── Helpers ──

  private async apiGet(path: string): Promise<Response> {
    return fetch(`${this.baseUrl}/services/data/${this.apiVersion}${path}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async httpGet(url: string): Promise<Response> {
    return fetch(url.startsWith('http') ? url : `${this.baseUrl}${url}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async apiPost(path: string, body: any): Promise<Response> {
    return fetch(`${this.baseUrl}/services/data/${this.apiVersion}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  private async apiPatch(path: string, body: any): Promise<Response> {
    return fetch(`${this.baseUrl}/services/data/${this.apiVersion}${path}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  private async apiDelete(path: string): Promise<Response> {
    return fetch(`${this.baseUrl}/services/data/${this.apiVersion}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  }

  private async getFieldList(objectName: string): Promise<string> {
    try {
      const resp = await this.apiGet(`/sobjects/${objectName}/describe`);
      if (!resp.ok) return 'Id, Name';
      const data = await resp.json();
      return (data.fields || [])
        .filter((f: any) => f.sortable || f.name === 'Id')
        .slice(0, 50)
        .map((f: any) => f.name)
        .join(', ');
    } catch {
      return 'Id, Name';
    }
  }

  private mapSalesforceType(sfType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string', 'email': 'string', 'phone': 'string', 'url': 'string',
      'textarea': 'string', 'encryptedstring': 'string', 'id': 'string',
      'reference': 'string', 'picklist': 'string', 'multipicklist': 'string',
      'combobox': 'string', 'base64': 'string',
      'int': 'number', 'double': 'number', 'percent': 'number', 'currency': 'number',
      'boolean': 'boolean', 'checkbox': 'boolean',
      'date': 'string', 'datetime': 'string', 'time': 'string',
      'json': 'json', 'address': 'json', 'location': 'json',
    };
    return typeMap[sfType] || 'string';
  }
}
