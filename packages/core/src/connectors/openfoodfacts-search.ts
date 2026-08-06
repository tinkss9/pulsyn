// Open Food Facts Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'products', endpoint: '/search?json=true&page_size=20', schema: { name: 'products', table: 'products', columns: [{ name: 'code', type: 'string', nullable: false, primaryKey: true }, { name: 'product_name', type: 'string', nullable: false, primaryKey: false }, { name: 'brands', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['code'] }, idField: 'code' }
];

@registerSource('openfoodfacts-search')
export class OpenfoodfactsSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'openfoodfacts-search', 'openfoodfacts-search', config, {
      baseUrl: config.host || 'https://world.openfoodfacts.org/api/v2',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search',
    });
  }
}
