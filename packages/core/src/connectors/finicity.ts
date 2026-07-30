// @ts-nocheck
// Finicity Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'accounts',
    endpoint: '/customers/{customerId}/accounts',
    schema: {
      name: 'accounts',
      table: 'accounts',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'balance', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('finicity')
export class FinicityConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'finicity', 'finicity', config, {
      baseUrl: config.host || 'https://api.finicity.com/aggregation/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/customers',
      
    });
  }
}
