// BigCommerce API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'products', endpoint: '/catalog/products?limit=20', schema: { name: 'products', table: 'products', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'price', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('bigcommerce-api')
export class BigcommerceApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'bigcommerce-api', 'bigcommerce-api', config, {
      baseUrl: config.host || 'https://api.bigcommerce.com/stores/{store_hash}/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/catalog/products',
    });
  }
}
