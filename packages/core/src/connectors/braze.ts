// @ts-nocheck
// Braze Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'users',
    endpoint: '/users/export/ids',
    schema: {
      name: 'users',
      table: 'users',
      columns: [
      { name: 'external_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'first_name', type: 'string', nullable: true },
      { name: 'last_name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['external_id'],
    },
    idField: 'external_id',
    
  },
];

@registerSource('braze')
export class BrazeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'braze', 'braze', config, {
      baseUrl: config.host || 'https://rest.iad-01.braze.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/export/ids',
      
    });
  }
}
