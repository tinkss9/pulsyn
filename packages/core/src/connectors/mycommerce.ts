// @ts-nocheck
// MyCommerce Connector — Auto-generated from config
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
      { name: 'OrderId', type: 'number', nullable: false, primaryKey: true },
      { name: 'Amount', type: 'number', nullable: true },
      { name: 'Status', type: 'string', nullable: true },
      ],
      primaryKey: ['OrderId'],
    },
    idField: 'OrderId',
    
  },
];

@registerSource('mycommerce')
export class MyCommerceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'mycommerce', 'mycommerce', config, {
      baseUrl: config.host || 'https://api.mycommerce.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/orders',
      
    });
  }
}
