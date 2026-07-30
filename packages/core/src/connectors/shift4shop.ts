// @ts-nocheck
// Shift4Shop Connector — Auto-generated from config
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/Products',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
      { name: 'CatalogID', type: 'number', nullable: false, primaryKey: true },
      { name: 'Name', type: 'string', nullable: false },
      { name: 'Price', type: 'number', nullable: true },
      ],
      primaryKey: ['CatalogID'],
    },
    idField: 'CatalogID',
    
  },
];

@registerSource('shift4shop')
export class Shift4ShopConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'shift4shop', 'shift4shop', config, {
      baseUrl: config.host || 'https://api.3dcart.com/v1',
      authType: 'bearer',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/Products',
      
    });
  }
}
