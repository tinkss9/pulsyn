// @ts-nocheck
// VTEX Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/catalog_system/pub/products/search',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'productId', type: 'string', nullable: false, primaryKey: true },
      { name: 'productName', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: true },
      ],
      primaryKey: ['productId'],
    },
    idField: 'productId',
    
  },
];

@registerSource('vtex')
export class VTEXConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'vtex', 'vtex', config, {
      baseUrl: config.host || 'https://your-store.vtexcommercestable.com.br/api',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/catalog_system/pub/products/search',
      
    });
  }
}
