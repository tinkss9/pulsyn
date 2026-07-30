// @ts-nocheck
// GlobalShop Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/products',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('global-shop')
export class GlobalShopConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'global-shop', 'global-shop', config, {
      baseUrl: config.host || 'https://api.globalshop.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/products',
      
    });
  }
}
