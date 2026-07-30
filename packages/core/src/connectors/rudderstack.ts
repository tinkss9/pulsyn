// @ts-nocheck
// RudderStack Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'sources',
    endpoint: '/sources',
    schema: {
      name: 'sources',
      table: 'sources',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'enabled', type: 'boolean', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('rudderstack')
export class RudderStackConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rudderstack', 'rudderstack', config, {
      baseUrl: config.host || 'https://api.rudderstack.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/sources',
      
    });
  }
}
