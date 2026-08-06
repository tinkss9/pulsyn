// Open Food Facts — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
  {
    name: 'products',
    endpoint: '/search?json=true&page_size=50',
    schema: {
      name: 'products',
      table: 'products',
      columns: [
        { name: 'code', type: 'string', nullable: false, primaryKey: true },
        { name: 'product_name', type: 'string', nullable: false, primaryKey: false },
        { name: 'brands', type: 'string', nullable: false, primaryKey: false },
        { name: 'categories', type: 'string', nullable: false, primaryKey: false }
      ],
      primaryKey: ['code'],
    },
    idField: 'code',
  }
];

@registerSource('openfoodfacts')
export class OpenfoodfactsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openfoodfacts', 'openfoodfacts', config, {
      baseUrl: config.host || 'https://world.openfoodfacts.org/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search',
    });
  }
}
