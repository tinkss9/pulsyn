// @ts-nocheck
// Plaid Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/accounts/get',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'account_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'type', type: 'string', nullable: true },
      { name: 'balances', type: 'object', nullable: true },
      ],
      primaryKey: ['account_id'],
    },
    idField: 'account_id',
    
  },
];

@registerSource('plaid')
export class PlaidConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'plaid', 'plaid', config, {
      baseUrl: config.host || 'https://sandbox.plaid.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/accounts/get',
      
    });
  }
}
