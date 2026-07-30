// @ts-nocheck
// Adyen Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'payments',
    endpoint: '/v68/payments',
    schema: {
      name: 'payments',
      table: 'payments',
      columns: [
      { name: 'pspReference', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'object', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'createdAt', type: 'datetime', nullable: true },
      ],
      primaryKey: ['pspReference'],
    },
    idField: 'pspReference',
    
  },
];

@registerSource('adyen')
export class AdyenConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'adyen', 'adyen', config, {
      baseUrl: config.host || 'https://pal-test.adyen.com/pal/servlet/Payment',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/v68/payments',
      
    });
  }
}
