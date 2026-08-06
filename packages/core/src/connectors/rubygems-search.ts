// RubyGems Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'gems', endpoint: '/search.json?query=rails&per_page=20', schema: { name: 'gems', table: 'gems', columns: [{ name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'info', type: 'string', nullable: false, primaryKey: false }, { name: 'downloads', type: 'number', nullable: false, primaryKey: false }, { name: 'version', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('rubygems-search')
export class RubygemsSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'rubygems-search', 'rubygems-search', config, {
      baseUrl: config.host || 'https://rubygems.org/api/v1',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/search.json',
    });
  }
}
