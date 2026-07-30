// @ts-nocheck
// Deel Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'contracts',
    endpoint: '/contracts',
    schema: {
      name: 'contracts',
      table: 'contracts',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'type', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('deel')
export class DeelConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'deel', 'deel', config, {
      baseUrl: config.host || 'https://api.letsdeel.com/rest/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/me',
      
    });
  }
}
