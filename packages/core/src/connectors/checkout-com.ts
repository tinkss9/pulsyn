// @ts-nocheck
// Checkout.com Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'payments',
    endpoint: '/payments',
    schema: {
      name: 'payments',
      table: 'payments',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_on', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('checkout-com')
export class CheckoutcomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'checkout-com', 'checkout-com', config, {
      baseUrl: config.host || 'https://api.sandbox.checkout.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/payments',
      
    });
  }
}
