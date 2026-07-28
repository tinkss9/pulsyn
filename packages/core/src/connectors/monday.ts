// @ts-nocheck
// monday Connector — SaaS source
import { BaseConnector } from './base';
import { registerSource } from './registry';
import { UnifiedChangeEvent, createEvent } from '../events';
import type { DatabaseConfig, TableSchema, CDCEvent } from '../types';

@registerSource('monday')
export class mondayConnector extends BaseConnector {
  private apiKey: string = '';
  private baseUrl: string = '';

  async connect(config: DatabaseConfig): Promise<void> {
    this.config = config;
    this.apiKey = config.password || '';
    this.baseUrl = config.host || 'https://api.monday.com';
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  async testConnection(): Promise<boolean> {
    return !!this.apiKey;
  }

  async getTables(): Promise<string[]> {
    return ['tasks', 'projects', 'users', 'boards'];
  }

  async getTableSchema(table: string): Promise<TableSchema> {
    return {
      name: table,
      table,
      columns: [
        { name: 'id', type: 'string', nullable: false, defaultValue: null },
        { name: 'name', type: 'string', nullable: true, defaultValue: null },
        { name: 'created_at', type: 'timestamp', nullable: true, defaultValue: null },
      ],
      primaryKey: ['id'],
      primaryKeys: ['id'],
    };
  }

  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    return [];
  }

  async extractIncremental(table: string, opts?: any): Promise<UnifiedChangeEvent[]> {
    return [];
  }
}