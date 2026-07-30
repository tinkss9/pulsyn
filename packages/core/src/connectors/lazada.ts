// @ts-nocheck
// Lazada Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/products/get',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'item_id', type: 'string', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'string', nullable: true },
      ],
      primaryKey: ['item_id'],
    },
    idField: 'item_id',
    
  },
];

@registerSource('lazada')
export class LazadaConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'lazada', 'lazada', config, {
      baseUrl: config.host || 'https://api.lazada.com/rest',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/products/get',
      
    });
  }
}
