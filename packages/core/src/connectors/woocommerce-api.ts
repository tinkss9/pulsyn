// WooCommerce API — SaaS API Connector
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'products', endpoint: '/products?per_page=20', schema: { name: 'products', table: 'products', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'name', type: 'string', nullable: false, primaryKey: false }, { name: 'price', type: 'string', nullable: false, primaryKey: false }, { name: 'status', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'orders', endpoint: '/orders?per_page=20', schema: { name: 'orders', table: 'orders', columns: [{ name: 'id', type: 'number', nullable: false, primaryKey: true }, { name: 'status', type: 'string', nullable: false, primaryKey: false }, { name: 'total', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' }
];

@registerSource('woocommerce-api')
export class WoocommerceApiConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'woocommerce-api', 'woocommerce-api', config, {
      baseUrl: config.host || 'https://{store}/wp-json/wc/v3',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'cursor',
      healthEndpoint: '/products',
    });
  }
}
