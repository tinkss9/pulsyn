// @ts-nocheck
// CubeCart Connector — Auto-generated from config
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
      { name: 'product_id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: true },
      ],
      primaryKey: ['product_id'],
    },
    idField: 'product_id',
    
  },
];

@registerSource('cubecart')
export class CubeCartConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cubecart', 'cubecart', config, {
      baseUrl: config.host || 'https://your-store.com/api/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/products',
      
    });
  }
}
