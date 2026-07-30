// @ts-nocheck
// Lemon Squeezy Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'total', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('lemon-squeezy')
export class LemonSqueezyConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lemon-squeezy', 'lemon-squeezy', config, {
      baseUrl: config.host || 'https://api.lemonsqueezy.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/users/me',
      
    });
  }
}
