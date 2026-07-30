// @ts-nocheck
// Apache Superset Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'databases',
    endpoint: '/database',
    schema: {
      name: 'databases',
      table: 'databases',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'database_name', type: 'string', nullable: false },
      { name: 'backend', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('superset')
export class ApacheSupersetConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'superset', 'superset', config, {
      baseUrl: config.host || 'https://your-superset.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/database',
      
    });
  }
}
