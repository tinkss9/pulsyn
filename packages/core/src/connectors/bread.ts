// @ts-nocheck
// Bread Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transactions',
    endpoint: '/transactions',
    schema: {
      name: 'transactions',
      table: 'transactions',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'amount', type: 'number', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('bread')
export class BreadConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bread', 'bread', config, {
      baseUrl: config.host || 'https://api.breadpayments.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/transactions',
      
    });
  }
}
