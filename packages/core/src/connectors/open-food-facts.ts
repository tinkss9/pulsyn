// Open Food Facts v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'products', endpoint: '/search.pl?json=true&page_size=20', schema: { name: 'products', table: 'products', columns: [{ name: 'code', type: 'string', nullable: false, primaryKey: true }, { name: 'product_name', type: 'string', nullable: false, primaryKey: false }, { name: 'brands', type: 'string', nullable: false, primaryKey: false }, { name: 'categories', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['code'] }, idField: 'code' }
];

@registerSource('open-food-facts')
export class OpenFoodFactsConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'open-food-facts', 'open-food-facts', config, {
      baseUrl: config.host || 'https://world.openfoodfacts.org/cgi',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search.pl',
    });
  }
}
