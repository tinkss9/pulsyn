// @ts-nocheck
// Wix eCommerce Connector — Auto-generated from config
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
      { name: 'id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'object', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    
  },
];

@registerSource('wix-ecom')
export class WixeCommerceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'wix-ecom', 'wix-ecom', config, {
      baseUrl: config.host || 'https://www.wixapis.com/stores/v2',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/products',
      
    });
  }
}
