// JSON Page — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'json', endpoint: '/json', schema: { name: 'json', table: 'json', columns: [        { name: 'slideshow', type: 'json', nullable: false, primaryKey: true }], primaryKey: ['slideshow'] }, idField: 'slideshow' }];

@registerSource('json')
export class JsonConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'json', 'json', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/json' });
  }
}
