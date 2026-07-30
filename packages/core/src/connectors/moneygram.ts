// @ts-nocheck
// MoneyGram Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'transfers',
    endpoint: '/transfers',
    schema: {
      name: 'transfers',
      table: 'transfers',
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

@registerSource('moneygram')
export class MoneyGramConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'moneygram', 'moneygram', config, {
      baseUrl: config.host || 'https://api.moneygram.com',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/transfers',
      
    });
  }
}
