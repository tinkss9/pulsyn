// Open Meteo Weather API — No auth required
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('openmeteo')
export class OpenMeteoConnector extends BaseConnector {
  private baseUrl = 'https://api.open-meteo.com';
  private cdcActive = false;

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    const res = await fetch(`${this.baseUrl}/v1/forecast?latitude=-33.8688&longitude=151.2093&current_weather=true`);
    if (!res.ok) throw new Error(`openmeteo connection failed: HTTP ${res.status}`);
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v1/forecast?latitude=-33.8688&longitude=151.2093&current_weather=true`);
      return res.ok;
    } catch { return false; }
  }

  async getTables(): Promise<string[]> {
    if (!this.connected) throw new Error('Not connected');
    return ['weather'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      table,
      columns: [
        { name: 'latitude', type: 'number', nullable: false },
        { name: 'longitude', type: 'number', nullable: false },
        { name: 'timezone', type: 'string', nullable: true },
        { name: 'temperature', type: 'number', nullable: true },
        { name: 'windspeed', type: 'number', nullable: true },
        { name: 'winddirection', type: 'number', nullable: true },
        { name: 'time', type: 'string', nullable: true },
      ],
      primaryKeys: ['latitude', 'longitude'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    if (!this.connected) throw new Error('Not connected');
    const cities = [
      { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
      { lat: 51.5074, lon: -0.1278, name: 'London' },
      { lat: 40.7128, lon: -74.0060, name: 'New York' },
    ];
    const events: UnifiedChangeEvent[] = [];
    for (const city of cities) {
      const res = await fetch(`${this.baseUrl}/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
      if (!res.ok) continue;
      const data = await res.json();
      const cw = data.current_weather;
      if (!cw) continue;
      events.push(createEvent({
        op: 'S', table: 'weather',
        after: { latitude: city.lat, longitude: city.lon, timezone: data.timezone, ...cw },
        watermark: `${city.lat},${city.lon}`,
      }));
    }
    return events;
  }

  async extractIncremental(table: string): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async startCDC(callback: (event: CDCEvent) => void): Promise<void> {
    this.cdcActive = true;
  }

  async stopCDC(): Promise<void> {
    this.cdcActive = false;
  }
}
