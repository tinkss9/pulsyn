// @ts-nocheck
// PayPal Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'payments',
    endpoint: '/payments/payment',
    schema: {
      name: 'payments',
      table: 'payments',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'state', type: 'string', nullable: true },
      { name: 'total', type: 'string', nullable: true },
      { name: 'create_time', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('paypal')
export class PayPalConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'paypal', 'paypal', config, {
      baseUrl: config.host || 'https://api-m.paypal.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/identity/oauth2/userinfo',
      
    });
  }
}
