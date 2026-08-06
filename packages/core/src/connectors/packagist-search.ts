// Packagist Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'packages', endpoint: '/search.json?q=laravel&per_page=20', schema: { name: 'packages', table: 'packages', columns: [{ name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'description', type: 'string', nullable: false, primaryKey: false }, { name: 'downloads', type: 'number', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('packagist-search')
export class PackagistSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'packagist-search', 'packagist-search', config, {
      baseUrl: config.host || 'https://packagist.org',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search.json',
    });
  }
}
