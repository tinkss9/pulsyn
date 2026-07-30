// @ts-nocheck
// Braintree Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transactions',
    endpoint: '/graphql',
    schema: {
      name: 'transactions',
      table: 'transactions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('braintree')
export class BraintreeConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'braintree', 'braintree', config, {
      baseUrl: config.host || 'https://payments.braintree-api.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/graphql',
      
    });
  }
}
