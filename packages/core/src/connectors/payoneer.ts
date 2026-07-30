// @ts-nocheck
// Payoneer Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'payees',
    endpoint: '/payees',
    schema: {
      name: 'payees',
      table: 'payees',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'email', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('payoneer')
export class PayoneerConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'payoneer', 'payoneer', config, {
      baseUrl: config.host || 'https://api.payoneer.com/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/payees',
      
    });
  }
}
