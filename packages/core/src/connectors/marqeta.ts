// @ts-nocheck
// Marqeta Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'cards',
    endpoint: '/cards',
    schema: {
      name: 'cards',
      table: 'cards',
      columns: [
      { name: 'token', type: 'string', nullable: false, primaryKey: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'created_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['token'],
    },
    idField: 'token',
    
  },
];

@registerSource('marqeta')
export class MarqetaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'marqeta', 'marqeta', config, {
      baseUrl: config.host || 'https://sandbox-api.marqeta.com/v3',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users',
      
    });
  }
}
