// @ts-nocheck
// Kibana Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'saved_objects',
    endpoint: '/saved_objects',
    schema: {
      name: 'saved_objects',
      table: 'saved_objects',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      { name: 'attributes', type: 'object', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('kibana')
export class KibanaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'kibana', 'kibana', config, {
      baseUrl: config.host || 'https://your-kibana.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/status',
      
    });
  }
}
