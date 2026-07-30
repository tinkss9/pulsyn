// @ts-nocheck
// Coyote Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'listings',
    endpoint: '/listings',
    schema: {
      name: 'listings',
      table: 'listings',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'title', type: 'string', nullable: true },
      { name: 'price', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('coyote')
export class CoyoteConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'coyote', 'coyote', config, {
      baseUrl: config.host || 'https://api.coyote.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/listings',
      
    });
  }
}
