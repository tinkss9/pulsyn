// Chuck Norris v2 — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'categories', endpoint: '/jokes/categories', schema: { name: 'categories', table: 'categories', columns: [        { name: 'category', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['category'] }, idField: 'category' }];

@registerSource('chuck-norris')
export class ChuckNorrisConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'chuck-norris', 'chuck-norris', config, { baseUrl: config.host || 'https://api.chucknorris.io', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/jokes/categories' });
  }
}
