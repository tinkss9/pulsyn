// InfluxDB Connector — time-series database source
import { BaseConnector } from './base';
import { DatabaseConfig, TableSchema, CDCEvent } from '../types';
import { UnifiedChangeEvent, createEvent } from '../events';
import { registerSource } from './registry';

let InfluxDB: any, WriteApi: any;
try { InfluxDB = require('@influxdata/influxdb-client').InfluxDB; } catch {}

@registerSource('influxdb')
export class InfluxDBConnector extends BaseConnector {
  private client: any = null;
  private org: string = '';

  constructor(id: string, name: string, config: DatabaseConfig) {
    super(id, name, 'influxdb', config);
    this.org = (config as any).org || '';
  }

  async connect(config: DatabaseConfig): Promise<void> {
    if (!InfluxDB) throw new Error('@influxdata/influxdb-client not installed');
    this.client = new InfluxDB({ url: `http://${config.host}:${config.port || 8086}`, token: config.password });
    this.connected = true;
  }

  async disconnect(): Promise<void> { this.client = null; this.connected = false; }
  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`http://${this.config.host}:${this.config.port || 8086}/ping`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    const queryApi = this.client.getQueryApi(this.org);
    const result = await queryApi.collectRows('import "influxdata/influxdb/schema" schema.measurements()');
    return result.map((r: any) => r._value);
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      columns: [
        { name: 'time', type: 'datetime', nullable: false },
        { name: 'value', type: 'number', nullable: true },
        { name: 'tags', type: 'object', nullable: true },
      ],
      primaryKey: ['time'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    const queryApi = this.client.getQueryApi(this.org);
    const fluxQuery = `from(bucket: "${this.config.database}") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "${table}") |> limit(n: 100)`;
    const rows: any[] = [];
    await queryApi.queryRows(fluxQuery, {
      next: (row: any) => rows.push(row),
      error: () => {},
      complete: () => {},
    });
    return rows.map((row: any) => createEvent({ op: 'S', table, after: row, watermark: row._time }));
  }

  async startCDC(): Promise<void> { throw new Error('InfluxDB CDC not supported — use polling'); }
  async stopCDC(): Promise<void> {}
}
