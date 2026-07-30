// @ts-nocheck
// Redash Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'data_sources',
    endpoint: '/data_sources',
    schema: {
      name: 'data_sources',
      table: 'data_sources',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'type', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('redash')
export class RedashConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'redash', 'redash', config, {
      baseUrl: config.host || 'https://your-redash.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/data_sources',
      
    });
  }
}
