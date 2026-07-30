// @ts-nocheck
// WooCommerce Connector — Auto-generated from config
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
      { name: 'price', type: 'string', nullable: true },
      { name: 'status', type: 'string', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      { name: 'date_modified', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'date_modified',
  },
  {
    name: 'orders',
    endpoint: '/orders',
    schema: {
      name: 'orders',
      table: 'orders',
      columns: [
      { name: 'id', type: 'number', nullable: false, primaryKey: true },
      { name: 'status', type: 'string', nullable: false },
      { name: 'total', type: 'string', nullable: true },
      { name: 'date_created', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'date_modified',
  },
];

@registerSource('woocommerce')
export class WooCommerceConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'woocommerce', 'woocommerce', config, {
      baseUrl: config.host || 'https://your-store.com/wp-json/wc/v3',
      authType: 'basic',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/system_status',
      
    });
  }
}
