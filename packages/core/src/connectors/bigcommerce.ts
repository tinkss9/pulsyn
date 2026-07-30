// @ts-nocheck
// BigCommerce Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/catalog/products',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'name', type: 'string', nullable: false },
      { name: 'price', type: 'number', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      { name: 'date_modified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'date_modified',
  },
];

@registerSource('bigcommerce')
export class BigCommerceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bigcommerce', 'bigcommerce', config, {
      baseUrl: config.host || 'https://api.bigcommerce.com/stores/{store_id}/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/store',
      
    });
  }
}
