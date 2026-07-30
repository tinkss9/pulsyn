// @ts-nocheck
// SQLite Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'tables',
    endpoint: '/databases/{dbId}/tables',
    schema: {
      name: 'tables',
      table: 'tables',
      columns: [
      { name: 'name', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      ],
      primaryKey: ['name'],
    },
    idField: 'name',
    
  },
];

@registerSource('sqlite')
export class SQLiteConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'sqlite', 'sqlite', config, {
      baseUrl: config.host || 'http://localhost:8080',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/databases',
      
    });
  }
}
