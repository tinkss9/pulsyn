// @ts-nocheck
// E2 Shop Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'jobs',
    endpoint: '/jobs',
    schema: {
      name: 'jobs',
      table: 'jobs',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('e2-shop')
export class E2ShopConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'e2-shop', 'e2-shop', config, {
      baseUrl: config.host || 'https://api.e2shop.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/jobs',
      
    });
  }
}
