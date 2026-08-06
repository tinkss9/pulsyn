// Pub.dev Search — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'packages', endpoint: '/packages?page=1', schema: { name: 'packages', table: 'packages', columns: [{ name: 'name', type: 'string', nullable: false, primaryKey: true }, { name: 'latest', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['name'] }, idField: 'name' }
];

@registerSource('pub-search')
export class PubSearchConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'pub-search', 'pub-search', config, {
      baseUrl: config.host || 'https://pub.dev/api',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/packages',
    });
  }
}
