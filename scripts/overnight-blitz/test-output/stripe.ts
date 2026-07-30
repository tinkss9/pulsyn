import { registerSource } from '../registry';
import { BaseConnector, ConnectorConfig, TableSchema, ChangeEvent, CDCStatus } from '../base';

interface StripeConfig extends ConnectorConfig {
  apiKey: string;
  baseUrl?: string;
}

interface StripeCustomer {
  id: string;
  object: string;
  email: string | null;
  name: string | null;
  created: number;
  updated: number;
  [key: string]: unknown;
}

interface StripeInvoice {
  id: string;
  object: string;
  amount_due: number;
  amount_paid: number;
  status: string | null;
  customer: string;
  created: number;
  [key: string]: unknown;
}

interface StripePaymentIntent {
  id: string;
  object: string;
  amount: number;
  status: string;
  customer: string | null;
  created: number;
  [key: string]: unknown;
}

interface StripeListResponse<T> {
  object: string;
  data: T[];
  has_more: boolean;
  url: string;
}

type StripeResource = 'customers' | 'invoices' | 'payment_intents';

@registerSource('stripe')
export class StripeConnector extends BaseConnector {
  private apiKey: string = '';
  private baseUrl: string = 'https://api.stripe.com/v1';
  private connected: boolean = false;
  private cdcActive: boolean = false;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private lastTimestamps: Map<string, number> = new Map();

  constructor(config: StripeConfig) {
    super(config);
    this.apiKey = config.apiKey;
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
  }

  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Stripe API connection failed: ${response.status} ${response.statusText}`);
      }

      this.connected = true;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to connect to Stripe: ${error.message}`);
      }
      throw new Error('Failed to connect to Stripe: Unknown error');
    }
  }

  async disconnect(): Promise<void> {
    await this.stopCDC();
    this.apiKey = '';
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async getTables(): Promise<string[]> {
    return ['customers', 'invoices', 'payment_intents'];
  }

  async getTableSchema(tableName: string): Promise<TableSchema> {
    const schemas: Record<string, TableSchema> = {
      customers: {
        tableName: 'customers',
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'object', type: 'string', nullable: false },
          { name: 'email', type: 'string', nullable: true },
          { name: 'name', type: 'string', nullable: true },
          { name: 'created', type: 'number', nullable: false },
          { name: 'updated', type: 'number', nullable: false },
        ],
      },
      invoices: {
        tableName: 'invoices',
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'object', type: 'string', nullable: false },
          { name: 'amount_due', type: 'number', nullable: false },
          { name: 'amount_paid', type: 'number', nullable: false },
          { name: 'status', type: 'string', nullable: true },
          { name: 'customer', type: 'string', nullable: false },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
      payment_intents: {
        tableName: 'payment_intents',
        columns: [
          { name: 'id', type: 'string', nullable: false, primaryKey: true },
          { name: 'object', type: 'string', nullable: false },
          { name: 'amount', type: 'number', nullable: false },
          { name: 'status', type: 'string', nullable: false },
          { name: 'customer', type: 'string', nullable: true },
          { name: 'created', type: 'number', nullable: false },
        ],
      },
    };

    const schema = schemas[tableName];
    if (!schema) {
      throw new Error(`Table '${tableName}' not found in Stripe connector`);
    }

    return schema;
  }

  async startCDC(tables: string[]): Promise<void> {
    if (this.cdcActive) {
      throw new Error('CDC is already running');
    }

    if (!this.connected) {
      throw new Error('Connector is not connected');
    }

    this.cdcActive = true;

    for (const table of tables) {
      this.lastTimestamps.set(table, Math.floor(Date.now() / 1000));
    }

    this.pollingInterval = setInterval(async () => {
      for (const table of tables) {
        try {
          const lastTimestamp = this.lastTimestamps.get(table) || 0;
          const events = await this.pollChanges(table, lastTimestamp);

          for (const event of events) {
            this.emit('change', event);
          }

          if (events.length > 0) {
            const maxTimestamp = Math.max(...events.map(e => e.timestamp));
            this.lastTimestamps.set(table, maxTimestamp);
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            this.emit('error', error);
          }
        }
      }
    }, 10000);
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.lastTimestamps.clear();
  }

  async extractFull(tableName: string): Promise<ChangeEvent[]> {
    const events: ChangeEvent[] = [];
    let startingAfter: string | undefined;

    while (true) {
      const url = new URL(`${this.baseUrl}/${tableName}`);
      url.searchParams.set('limit', '100');
      if (startingAfter) {
        url.searchParams.set('starting_after', startingAfter);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${tableName}: ${response.status} ${response.statusText}`);
      }

      const result: StripeListResponse<Record<string, unknown>> = await response.json();

      for (const item of result.data) {
        events.push({
          table: tableName,
          operation: 'insert',
          data: item,
          timestamp: (item.created as number) || Math.floor(Date.now() / 1000),
          id: item.id as string,
        });
      }

      if (!result.has_more) {
        break;
      }

      const lastItem = result.data[result.data.length - 1];
      startingAfter = lastItem.id as string;
    }

    return events;
  }

  async extractIncremental(tableName: string, lastTimestamp: number): Promise<ChangeEvent[]> {
    const events: ChangeEvent[] = [];
    let startingAfter: string | undefined;

    while (true) {
      const url = new URL(`${this.baseUrl}/${tableName}`);
      url.searchParams.set('limit', '100');
      url.searchParams.set('created[gte]', lastTimestamp.toString());

      if (startingAfter) {
        url.searchParams.set('starting_after', startingAfter);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${tableName}: ${response.status} ${response.statusText}`);
      }

      const result: StripeListResponse<Record<string, unknown>> = await response.json();

      for (const item of result.data) {
        events.push({
          table: tableName,
          operation: 'insert',
          data: item,
          timestamp: (item.created as number) || Math.floor(Date.now() / 1000),
          id: item.id as string,
        });
      }

      if (!result.has_more) {
        break;
      }

      const lastItem = result.data[result.data.length - 1];
      startingAfter = lastItem.id as string;
    }

    return events;
  }

  private async pollChanges(tableName: string, sinceTimestamp: number): Promise<ChangeEvent[]> {
    try {
      return await this.extractIncremental(tableName, sinceTimestamp);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Polling failed for ${tableName}: ${error.message}`);
      }
      throw new Error(`Polling failed for ${tableName}: Unknown error`);
    }
  }
}