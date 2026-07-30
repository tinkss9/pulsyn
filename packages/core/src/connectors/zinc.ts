// @ts-nocheck
// Zinc Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'request_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['request_id'],
    },
    idField: 'request_id',
    
  },
];

@registerSource('zinc')
export class ZincConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'zinc', 'zinc', config, {
      baseUrl: config.host || 'https://api.zinc.io/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/orders',
      
    });
  }
}
