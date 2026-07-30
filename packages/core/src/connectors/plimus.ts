// @ts-nocheck
// Plimus Connector — Auto-generated from config
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
      { name: 'orderId', type: 'number', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['orderId'],
    },
    idField: 'orderId',
    
  },
];

@registerSource('plimus')
export class PlimusConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'plimus', 'plimus', config, {
      baseUrl: config.host || 'https://www.plimus.com/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/orders',
      
    });
  }
}
