// HTTP Cookies — Community API (No Auth)
import { SaaSConnector, SaaSResource } from './saas-base';
import { registerSource } from './registry';
import type { DatabaseConfig } from '../types';

const RESOURCES: SaaSResource[] = [  { name: 'cookies', endpoint: '/cookies/set/test/value', schema: { name: 'cookies', table: 'cookies', columns: [        { name: 'test', type: 'string', nullable: false, primaryKey: true }], primaryKey: ['test'] }, idField: 'test' }];

@registerSource('cookies')
export class CookiesConnector extends SaaSConnector {
  constructor(id: string, config: DatabaseConfig) {
    super(id, 'cookies', 'cookies', config, { baseUrl: config.host || 'https://httpbin.org', authType: 'none', resources: RESOURCES, paginationType: 'offset', healthEndpoint: '/cookies/set/test/value' });
  }
}
