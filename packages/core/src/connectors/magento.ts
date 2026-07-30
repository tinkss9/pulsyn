// @ts-nocheck
// Magento Connector — Auto-generated from config
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
      { name: 'price', type: 'number', nullable: true },
      { name: 'sku', type: 'string', nullable: true },
      { name: 'created_at', type: 'datetime', nullable: true },
      { name: 'updated_at', type: 'datetime', nullable: true },
      ],
      primaryKey: ['id'],
    },
    idField: 'id',
    modifiedField: 'updated_at',
  },
];

@registerSource('magento')
export class MagentoConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'magento', 'magento', config, {
      baseUrl: config.host || 'https://your-magento-store.com/rest/V1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/store/storeViews',
      
    });
  }
}
