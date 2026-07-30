// @ts-nocheck
// MarketMan Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'inventory',
    endpoint: '/inventory',
    schema: {
      name: 'inventory',
      table: 'inventory',
      columns: [
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: true },
      { name: 'quantity', type: 'number', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('marketman')
export class MarketManConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'marketman', 'marketman', config, {
      baseUrl: config.host || 'https://api.marketman.com/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/inventory',
      
    });
  }
}
