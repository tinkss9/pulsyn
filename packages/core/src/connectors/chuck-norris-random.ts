// Chuck Norris Random — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [
{ name: 'random', endpoint: '/jokes/random', schema: { name: 'random', table: 'random', columns: [{ name: 'id', type: 'string', nullable: false, primaryKey: true }, { name: 'value', type: 'string', nullable: false, primaryKey: false }, { name: 'categories', type: 'json', nullable: false, primaryKey: false }], primaryKey: ['id'] }, idField: 'id' },
{ name: 'categories', endpoint: '/jokes/categories', schema: { name: 'categories', table: 'categories', columns: [{ name: 'category', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['category'] }, idField: 'category' }
];

@registerSource('chuck-norris-random')
export class ChuckNorrisRandomConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'chuck-norris-random', 'chuck-norris-random', config, {
      baseUrl: config.host || 'https://api.chucknorris.io',
      authType: 'none',
      resources: RESOURCES,
      paginationType: 'offset',
      healthEndpoint: '/jokes/random',
    });
  }
}
