// @ts-nocheck
// Klarna Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'orders',
    endpoint: '/ordermanagement/v1/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'order_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['order_id'],
    },
    idField: 'order_id',
    
  },
];

@registerSource('klarna')
export class KlarnaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'klarna', 'klarna', config, {
      baseUrl: config.host || 'https://api-na.playground.klarna.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/payments/v1/authorizations',
      
    });
  }
}
