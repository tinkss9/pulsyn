// HTTP Redirect — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'redirect', endpoint: '/redirect/1', schema: { name: 'redirect', table: 'redirect', columns: [        { name: 'url', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['url'] }, idField: 'url' }];

@registerSource('redirect')
export class RedirectConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'redirect', 'redirect', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/redirect/1' });
  }
}
