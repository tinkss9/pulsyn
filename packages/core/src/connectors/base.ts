// Base Connector Interface
// All connectors must implement this interface

import {
  DatabaseConfig,
  Connector,
  TableSchema,
  CDCEvent,
} from '../types';

export abstract class BaseConnector implements Connector {
  id: string;
  name: string;
  engine: string;
  config: DatabaseConfig;
  protected connected: boolean = false;

  constructor(id: string, name: string, engine: string, config: DatabaseConfig) {
    this.id = id;
    this.name = name;
    this.engine = engine;
    this.config = config;
  }

  abstract connect(config: DatabaseConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<boolean>;
  abstract getTables(): Promise<string[]>;
  abstract getTableSchema(table: string): Promise<TableSchema>;
  abstract startCDC(callback: (event: CDCEvent) => void): Promise<void>;
  abstract stopCDC(): Promise<void>;

  isConnected(): boolean {
    return this.connected;
  }
}
