// @ts-nocheck
// Dwolla Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'customers',
    endpoint: '/customers',
    schema: {
      name: 'customers',
      table: 'customers',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('dwolla')
export class DwollaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'dwolla', 'dwolla', config, {
      baseUrl: config.host || 'https://api-sandbox.dwolla.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/customers',
      
    });
  }
}
