// DuckDuckGo Lite — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'search', endpoint: '/lite/?q=hello&format=json', schema: { name: 'search', table: 'search', columns: [        { name: 'Abstract', type: 'string', nullable: false, primaryKey: true },
        { name: 'AbstractText', type: 'string', nullable: false, primaryKey: false }], primaryKey: ['Abstract'] }, idField: 'Abstract' }];

@registerSource('duck-duck')
export class DuckDuckConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'duck-duck', 'duck-duck', config, { baseUrl: config.host || 'https://lite.duckduckgo.com', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/lite/' });
  }
}
