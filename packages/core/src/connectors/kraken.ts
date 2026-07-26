// @ts-nocheck
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

interface KrakenConfig extends DatabaseConfig {
  apiUrl: string;
  apiKey: string;
  wsUrl?: string;
  pollIntervalMs?: number;
}

const TABLE_QUERIES: Record<string, { query: string; pk: string; columns: any[] }> = {
  accounts: {
    pk: 'accountNumber',
    query: `query($cursor: String) {
      accounts(after: $cursor, first: 100) {
        edges { node { accountNumber status balance { amount currency } createdAt updatedAt } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    columns: [
      { name: 'accountNumber', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'balance_amount', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'balance_currency', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'createdAt', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'updatedAt', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  agreements: {
    pk: 'id',
    query: `query($cursor: String) {
      agreements(after: $cursor, first: 100) {
        edges { node { id accountNumber tariffCode validFrom validTo status } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'accountNumber', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'tariffCode', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'validFrom', type: 'date', nullable: false, defaultValue: undefined },
      { name: 'validTo', type: 'date', nullable: true, defaultValue: undefined },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: undefined },
    ],
  },
  meter_points: {
    pk: 'mpan',
    query: `query($cursor: String) {
      meterPoints(after: $cursor, first: 100) {
        edges { node { mpan serialNumber meterType status installedAt } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    columns: [
      { name: 'mpan', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'serialNumber', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'meterType', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'installedAt', type: 'timestamp', nullable: true, defaultValue: undefined },
    ],
  },
  consumption: {
    pk: 'id',
    query: `query($cursor: String) {
      consumption(after: $cursor, first: 100) {
        edges { node { id mpan startAt endAt quantity unit } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'mpan', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'startAt', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'endAt', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'quantity', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'unit', type: 'varchar', nullable: true, defaultValue: undefined },
    ],
  },
  tariffs: {
    pk: 'code',
    query: `query($cursor: String) {
      tariffs(after: $cursor, first: 100) {
        edges { node { code displayName unitRate standingCharge validFrom validTo } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    columns: [
      { name: 'code', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'displayName', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'unitRate', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'standingCharge', type: 'decimal', nullable: true, defaultValue: undefined },
      { name: 'validFrom', type: 'date', nullable: false, defaultValue: undefined },
      { name: 'validTo', type: 'date', nullable: true, defaultValue: undefined },
    ],
  },
  payments: {
    pk: 'id',
    query: `query($cursor: String) {
      payments(after: $cursor, first: 100) {
        edges { node { id accountNumber amount currency method createdAt status } cursor }
        pageInfo { hasNextPage endCursor }
      }
    }`,
    columns: [
      { name: 'id', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'accountNumber', type: 'varchar', nullable: false, defaultValue: undefined },
      { name: 'amount', type: 'decimal', nullable: false, defaultValue: undefined },
      { name: 'currency', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'method', type: 'varchar', nullable: true, defaultValue: undefined },
      { name: 'createdAt', type: 'timestamp', nullable: false, defaultValue: undefined },
      { name: 'status', type: 'varchar', nullable: false, defaultValue: undefined },
    ],
  },
};

@registerSource('kraken')
export class KrakenConnector extends BaseConnector {
  private apiUrl = '';
  private apiKey = '';
  private wsUrl = '';
  private cdcActive = false;
  private wsConnection: any = null;
  private cdcTimer: ReturnType<typeof setInterval> | null = null;

  async connect(config: DatabaseConfig): Promise<void> {
    try {
      this.config = config;
      const kc = config as KrakenConfig;
      this.apiUrl = kc.apiUrl;
      this.apiKey = kc.apiKey;
      this.wsUrl = kc.wsUrl || kc.apiUrl.replace('https://', 'wss://').replace('/graphql', '/ws');

      if (!this.apiKey) throw new Error('apiKey is required for Kraken');

      // Test with introspection query
      const res = await this.graphqlRequest('{ __typename }');
      if (!res.ok) throw new Error(`Kraken API error: HTTP ${res.status}`);
      this.connected = true;
    } catch (error) {
      throw new Error(`Kraken connection failed: ${(error as Error).message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await this.graphqlRequest('{ __typename }');
      return res.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return Object.keys(TABLE_QUERIES);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    const def = TABLE_QUERIES[table];
    if (!def) return { table, columns: [], primaryKey: [] };
    return { table, columns: def.columns, primaryKey: [def.pk] };
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;

    // Attempt WebSocket subscription first
    try {
      await this.startSubscription(callback);
    } catch {
      // Fallback to polling if subscriptions not supported
      const pollMs = (this.config as KrakenConfig)?.pollIntervalMs || 30000;
      this.cdcTimer = setInterval(async () => {
        if (!this.cdcActive) return;
        try {
          const tables = await this.getTables();
          for (const table of tables) {
            const events = await this.extractIncremental(table, null);
            for (const event of events) {
              callback({ op: 'I', table, before: undefined, after: event.after, ts: new Date() });
            }
          }
        } catch { /* retry */ }
      }, pollMs);
    }
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.wsConnection) {
      try { this.wsConnection.close(); } catch { /* ignore */ }
      this.wsConnection = null;
    }
    if (this.cdcTimer) { clearInterval(this.cdcTimer); this.cdcTimer = null; }
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_QUERIES[table];
    if (!def) throw new Error(`Unknown Kraken table: ${table}`);
    const events: UnifiedChangeEvent[] = [];
    let cursor: string | null = null;

    while (true) {
      const res = await this.graphqlRequest(def.query, { cursor });
      if (!res.ok) throw new Error(`Kraken API error: HTTP ${res.status}`);
      const json = await res.json() as any;
      const data = json.data;
      const connection = data[Object.keys(data)[0]];
      const edges = connection?.edges || [];

      if (edges.length === 0) break;
      for (const edge of edges) {
        const node = this.flattenNode(edge.node);
        events.push(createEvent({ operation: "S", name: table, data: node, watermark: String(null || ""), sourceMetadata: node[def.pk]?.toString() }));
      }

      const pageInfo = connection?.pageInfo;
      if (!pageInfo?.hasNextPage) break;
      cursor = pageInfo.endCursor;
    }
    return events;
  }

  async extractIncremental(name: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    const def = TABLE_QUERIES[table];
    if (!def) throw new Error(`Unknown Kraken table: ${table}`);
    const events: UnifiedChangeEvent[] = [];

    // Use cursor from watermark or start fresh
    const res = await this.graphqlRequest(def.query, { cursor: watermark });
    if (!res.ok) throw new Error(`Kraken API error: HTTP ${res.status}`);
    const json = await res.json() as any;
    const data = json.data;
    const connection = data[Object.keys(data)[0]];
    const edges = connection?.edges || [];

    for (const edge of edges) {
      const node = this.flattenNode(edge.node);
      const ts = node.updatedAt || node.createdAt || new Date().toISOString();
      events.push(createEvent({ operation: "I", name: table, data: node, watermark: String(null || ""), sourceMetadata: ts }));
    }
    return events;
  }

  private async graphqlRequest(query: string, variables?: Record<string, any>): Promise<Response> {
    return fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.apiKey,
      },
      body: JSON.stringify({ query, variables: variables || {} }),
    });
  }

  private async startSubscription(callback: (event: CDCEvent) => void): Promise<void> {
    const WebSocket = (await import('ws')).default;
    this.wsConnection = new WebSocket(this.wsUrl, 'graphql-ws');

    this.wsConnection.on('open', () => {
      this.wsConnection.send(JSON.stringify({
        type: 'connection_init',
        payload: { authorization: this.apiKey },
      }));
      // Subscribe to changes for all tables
      const tables = Object.keys(TABLE_QUERIES);
      tables.forEach((table, idx) => {
        this.wsConnection.send(JSON.stringify({
          id: `sub_${idx}`,
          type: 'start',
          payload: {
            query: `subscription { ${table}Changed { node { id } operation } }`,
          },
        }));
      });
    });

    this.wsConnection.on('message', (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'data' && msg.payload?.data) {
          const key = Object.keys(msg.payload.data)[0];
          const change = msg.payload.data[key];
          const table = key.replace('Changed', '');
          callback({
            operation: change.operation === 'DELETE' ? 'D' : change.operation === 'INSERT' ? 'I' : 'U',
            table, before: undefined, after: change.node, ts: new Date(),
          });
        }
      } catch { /* ignore malformed messages */ }
    });

    this.wsConnection.on('error', () => { /* will reconnect via polling fallback */ });
  }

  private flattenNode(node: Record<string, any>): Record<string, any> {
    const flat: Record<string, any> = {};
    for (const [key, value] of Object.entries(node)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [subKey, subVal] of Object.entries(value)) {
          flat[`${key}_${subKey}`] = subVal;
        }
      } else {
        flat[key] = value;
      }
    }
    return flat;
  }
}






